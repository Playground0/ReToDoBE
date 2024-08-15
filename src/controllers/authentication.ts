import express from "express";
import {
  createUser,
  getUserByEmail,
  getUserById,
} from "../models/schemas/users";
import { authentication, random } from "../helpers";
import {
  interalServerError,
  badRequestError,
  notFoundError,
} from "../utils/error-message-handler";
import { APIResponse } from "../models/api-response.model";
import { APIStatusCode } from "../models/constants/status.constants";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

export const register = async (req: express.Request, res: express.Response) => {
  // TODO: Create model for user and assign it
  const {
    email,
    password,
    username,
    phone,
    fullname,
    age,
    city,
    displaypicture,
    userRole,
  } = req.body;
  const action = "Sign Up";

  if (!email || !password || !username || !userRole) {
    return badRequestError(action, "Sign Up failed, missing Info", res);
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(APIStatusCode.Conflict)
        .json(APIResponse.error(action, "User Exist", APIStatusCode.Conflict));
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
        sessionToken: [],
      },
      fullname,
      phone,
      city,
      age,
      displaypicture,
      userRole,
    });
    let responseBody = {
      username: user.username,
      email: user.email,
    };

    return res
      .status(APIStatusCode.Created)
      .json(APIResponse.success(responseBody, action, APIStatusCode.Created))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;
  const action = "Login";

  if (!email || !password) {
    return badRequestError(action, "Please pass credentials", res);
  }

  try {
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password +authentication.sessionToken"
    );

    if (!user) {
      return notFoundError(action, "User not found", res);
    }

    if (!user.authentication?.salt) {
      return res
        .status(APIStatusCode.Forbidden)
        .json(
          APIResponse.error(
            action,
            "Authentication Failed",
            APIStatusCode.Forbidden
          )
        );
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (expectedHash !== user.authentication.password) {
      return res
        .status(APIStatusCode.Unauthorized)
        .json(
          APIResponse.error(
            action,
            "Please check your password",
            APIStatusCode.Unauthorized
          )
        );
    }

    const salt = random();
    user.authentication.sessionToken.push(
      authentication(salt, user._id.toString())
    );
    await user.save();
    let responseBody = {
      id: user.id,
      email: user.email,
      username: user.username,
      sessionToken: user.authentication.sessionToken.at(-1),
      userRole: user.userRole,
    };

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(responseBody, action))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  const { email, sessionToken } = req.body;
  const action = "Log out";

  try {
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password +authentication.sessionToken"
    );
    if (!user) {
      return notFoundError(action, "User not found", res);
    }

    if (!user?.authentication?.sessionToken.includes(sessionToken)) {
      return res
        .status(APIStatusCode.Forbidden)
        .json(
          APIResponse.error(
            action,
            "Authentication Failed or user already logged out",
            APIStatusCode.Forbidden
          )
        );
    }

    user.authentication.sessionToken = user.authentication.sessionToken.filter(
      (token) => token !== sessionToken
    );
    user.save();
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success([], action, APIStatusCode.OK))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const forgotPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const { email, url } = req.body;
  const action = "Forgot Password";

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return notFoundError(action, "User not found", res);
    }

    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: user._id }, secret!, {
      expiresIn: "15m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions: MailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset",
      text: `You requested for a password reset. Please click this link to reset your password: ${url}/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(APIStatusCode.InternalServalError)
          .json(
            APIResponse.error(
              action,
              error.message,
              APIStatusCode.InternalServalError
            )
          );
      }
      res
        .status(APIStatusCode.OK)
        .json(
          APIResponse.success(
            [],
            action,
            APIStatusCode.OK,
            "Password reset link sent to your email"
          )
        );
    });
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const resetPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const {token, newPassword} = req.body;
  const action = "Reset Password";

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as any).id;
    const user = await getUserById(userId).select(
      "+authentication.salt +authentication.password +authentication.sessionToken"
    );

    if (!user) {
      return notFoundError(action, "Invalid token or User not found", res);
    }

    const salt = random();

    user.authentication = {
      salt,
      password: authentication(salt, newPassword),
      sessionToken: [],
    };

    await user.save();
    return res
      .status(APIStatusCode.OK)
      .json(
        APIResponse.success(
          [],
          action,
          APIStatusCode.OK,
          "Password Changed Successfully"
        )
      );
  } catch (error: Error | any | unknown) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(APIStatusCode.BadRequest)
        .json(
          APIResponse.error(
            action,
            "Password reset link has expired. Please request a new one.",
            APIStatusCode.BadRequest,
            error.name
          )
        );
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(APIStatusCode.BadRequest)
        .json(
          APIResponse.error(
            action,
            "Invalid password reset link.",
            APIStatusCode.BadRequest,
            error.name
          )
        );
    }
    return interalServerError(action, error, res);
  }
};
