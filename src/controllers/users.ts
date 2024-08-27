import express from "express";
import { deleteUserById, getUserById } from "../models/schemas/users";
import {
  interalServerError,
  badRequestError,
  notFoundError,
} from "../utils/error-message-handler";
import { APIResponse } from "../models/api-response.model";
import { APIStatusCode } from "../models/constants/status.constants";

export const userDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const userID = req.params.userID;
  const action = "User Details";

  if (!userID) {
    return badRequestError(action, "Please pass user Id", res);
  }

  try {
    const user = await getUserById(userID);
    if (!user) {
      return notFoundError(action, "User does not exists", res);
    }

    let responseBody = {
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      age: user.age,
      profilePicture: user.profilePicture,
    };

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(responseBody, action, APIStatusCode.OK))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const updateUserDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const { userID, email, username, fullname, age, profilePicture } = req.body;
  const action = "Update user details";

  if (!userID) {
    return badRequestError(action, "Please pass userId", res);
  }

  try {
    const user = await getUserById(userID);

    if (!user) {
      return notFoundError(action, "User not found", res);
    }

    user.email = email;
    user.username = username;
    user.fullname = fullname;
    user.age = age;
    user.profilePicture = profilePicture;

    user.save();

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(user, action))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const deleteAccount = async (
  req: express.Request,
  res: express.Response
) => {
  const userID = req.params.userID;
  const action = "Delete account";

  try {
    const user = await getUserById(userID);
    if (!user) {
      return notFoundError(
        action,
        "User not found or user is already deleted",
        res
      );
    }

    await deleteUserById(userID);

    return res
      .status(APIStatusCode.NoContent)
      .json(APIResponse.success([], action, APIStatusCode.NoContent))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const logoutUserFromDevices = async (
  req: express.Request,
  res: express.Response
) => {
  const { userID, sessionToken } = req.body;
  const action = "Logout user from all devices";

  try {
    const user = await getUserById(userID).select(
      "+authentication.sessionToken"
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
            "Authentication Failed",
            APIStatusCode.Forbidden
          )
        );
    }

    const userSessionToken = user.authentication.sessionToken;
    if (userSessionToken.length === 1 && userSessionToken[0] === sessionToken) {
      return res
        .status(APIStatusCode.Conflict)
        .json(
          APIResponse.error(
            action,
            "You are only logged in to the current device",
            APIStatusCode.Conflict
          )
        );
    }

    user.authentication.sessionToken = user.authentication.sessionToken.filter(
      (token) => token === sessionToken
    );

    user.save();

    return res
      .status(APIStatusCode.OK)
      .json(
        APIResponse.success(
          [],
          action,
          APIStatusCode.OK,
          "You are logged out all devices except for this one"
        )
      )
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};
