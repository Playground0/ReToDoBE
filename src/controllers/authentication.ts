import express from "express";
import { createUser, getUserByEmail } from "../models/schemas/users";
import { authentication, random } from "../helpers";
import {
  defaultErrorMessage,
  missingParamMessage,
  notFoundMessage,
} from "../utils/error-message-handler";
import { APIResponse } from "../models/api-response.model";

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
    return missingParamMessage(action, "Sign Up failed, missing Info", res);
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(403).json(APIResponse.error(action, "User Exist", 403));
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
      .status(200)
      .json(APIResponse.success(responseBody, action))
      .end();
  } catch (error) {
    return defaultErrorMessage(action, error, res);
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;
  const action = "Login";

  if (!email || !password) {
    return missingParamMessage(action, "Please pass credentials", res);
  }

  try {
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password +authentication.sessionToken"
    );

    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }

    if (!user.authentication?.salt) {
      return res
        .status(400)
        .json(APIResponse.error(action, "Authentication Failed", 400));
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (expectedHash !== user.authentication.password) {
      return res
        .status(403)
        .json(APIResponse.error(action, "Please check your password", 403));
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

    return res.status(200).json(APIResponse.success(responseBody, action)).end();
  } catch (error) {
    return defaultErrorMessage(action, error, res);
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
      return notFoundMessage(action, "User not found", res);
    }

    if (!user?.authentication?.sessionToken.includes(sessionToken)) {
      return res
        .status(403)
        .json(
          APIResponse.error(
            action,
            "Authentication Failed or user already logged out",
            403
          )
        );
    }

    user.authentication.sessionToken = user.authentication.sessionToken.filter(
      (token) => token !== sessionToken
    );
    user.save();
    return res.status(200).json(APIResponse.success([], action)).end();
  } catch (error) {
    return defaultErrorMessage(action, error, res);
  }
};
