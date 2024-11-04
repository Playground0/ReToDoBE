import express from "express";
import {
  createUser,
  getUserByEmail,
  getUserById,
} from "../models/schemas/users";
import { authentication, random } from "../helpers";
import {
  generateAccessToken,
  generateRefreshAccessToken,
} from "../helpers/jwt-token";
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
import {
  ILoginResponse,
  INewUser,
  IRegisterRequest,
  IRegisterResponse,
} from "../models/authentication.model";
import dotenv from "dotenv";

dotenv.config();

const authCookieName = process.env.AUTH_COOKIE_NAME;
const authRefreshCookieName = process.env.AUTH_REFRESH_COOKIE_NAME;

export const register = async (req: express.Request, res: express.Response) => {
  // TODO: Create model for user and assign it
  const userRequest: IRegisterRequest = req.body;
  const action = "Sign Up";

  if (
    !userRequest.email ||
    !userRequest.password ||
    !userRequest.username ||
    !userRequest.userRole
  ) {
    return badRequestError(action, "Sign Up failed, missing Info", res);
  }

  try {
    const existingUser = await getUserByEmail(userRequest.email);
    if (existingUser) {
      return res
        .status(APIStatusCode.Conflict)
        .json(APIResponse.error(action, "User Exist", APIStatusCode.Conflict));
    }

    const salt = random();
    const newUser: INewUser = {
      email: userRequest.email,
      username: userRequest.username,
      authentication: {
        salt: salt,
        password: authentication(salt, userRequest.password),
        sessionToken: [],
      },
      fullname: userRequest.fullname,
      phone: userRequest.phone,
      city: userRequest.city,
      age: userRequest.age,
      displaypicture: userRequest.displaypicture,
      userRole: userRequest.userRole,
    };
    const user = await createUser(newUser);
    let responseBody: IRegisterResponse = {
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

    const token = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshAccessToken(user._id.toString());

    if (!token || !refreshToken) {
      return interalServerError(action, "", res);
    }

    let responseBody: ILoginResponse = {
      email: user.email,
      username: user.username,
      sessionToken: user.authentication.sessionToken.at(-1),
      userRole: user.userRole,
    };

    res.cookie(authCookieName!, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
      maxAge: 30 * 60 * 1000, // 30 minute for access token
    });

    res.cookie(authRefreshCookieName!, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days for refresh token
    });

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

    res.clearCookie(authCookieName!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
    });
    res.clearCookie(authRefreshCookieName!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
    });

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

    const secret = process.env.JWT_RESET_PASS_SECRET!;
    const token = jwt.sign({ id: user._id }, secret, {
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
      text: `You requested for a password reset. Please click this link to reset your password: ${url}/reset-password/${token}/${email}`,
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
  const { email, token, newPassword } = req.body;
  const action = "Reset Password";

  try {
    const user = await getUserByEmail(email).select(
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
    return interalServerError(action, error, res);
  }
};

export const refreshAllTokens = async (
  req: express.Request,
  res: express.Response
) => {
  const action = "Refresh Token";
  const userId = req.user?.userId;
  try {

    if (!userId) {
      return notFoundError(action, "User id not present", res);
    }
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "Not a valid user", res);
    }

    const newToken = generateAccessToken(userId);
    const refreshToken = generateRefreshAccessToken(userId);

    res.cookie(authCookieName!, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
      maxAge: 30 * 60 * 1000, // 30 minute for access token
    });
    res.cookie(authRefreshCookieName!, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days for refresh token
    });

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success("", action))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const hardLogoutUser = async (
  req: express.Request,
  res: express.Response
) => {
  const action = "Hard logout user!";
  try {
    res.clearCookie(authCookieName!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
    });
    res.clearCookie(authRefreshCookieName!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
    });

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success([], action, APIStatusCode.OK))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};
