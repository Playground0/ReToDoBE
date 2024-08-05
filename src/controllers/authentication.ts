import express from "express";
import { createUser, getUserByEmail } from "../models/schemas/users";
import { authentication, random } from "../helpers";
import {
  interalServerError,
  badRequestError,
  notFoundError,
} from "../utils/error-message-handler";
import { APIResponse } from "../models/api-response.model";
import { APIStatusCode } from "../models/constants/status.constants";

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
      return res.status(APIStatusCode.Conflict).json(APIResponse.error(action, "User Exist", APIStatusCode.Conflict));
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
        .json(APIResponse.error(action, "Authentication Failed", APIStatusCode.Forbidden));
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (expectedHash !== user.authentication.password) {
      return res
        .status(APIStatusCode.Unauthorized)
        .json(APIResponse.error(action, "Please check your password", APIStatusCode.Unauthorized));
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

    return res.status(APIStatusCode.OK).json(APIResponse.success(responseBody, action)).end();
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
    return res.status(APIStatusCode.NoContent).json(APIResponse.success([], action,APIStatusCode.NoContent)).end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};
