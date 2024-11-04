import express from "express";
import { deleteUserById, getUserById } from "../models/schemas/users";
import {
  interalServerError,
  badRequestError,
  notFoundError,
} from "../utils/error-message-handler";
import { APIResponse } from "../models/api-response.model";
import { APIStatusCode } from "../models/constants/status.constants";
import {
  getArchivedTasks,
  getCompletedTasks,
  getDeletedTasks,
} from "../models/schemas/todo-task";
import {
  archivedLists,
  deletedLists,
  hiddenLists,
} from "../models/schemas/todo-list";
import { IUserUpdateRequest, IUserUpdateResponse } from "../models/users.model";

const authCookieName = process.env.AUTH_COOKIE_NAME;
const authRefreshCookieName = process.env.AUTH_REFRESH_COOKIE_NAME;

export const userDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.user?.userId;
  const action = "User Details";

  if (!userId) {
    return badRequestError(action, "No userId in the token, Something went terribly wrong!", res);
  }

  try {
    const user = await getUserById(userId);
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
  const action = "Update user details";
  const userId = req.user?.userId;
  try {
    const userRequest = req.body as IUserUpdateRequest;
    if (!userId) {
      return badRequestError(action, "Please pass userId", res);
    }
    const user = await getUserById(userId);

    if (!user) {
      return notFoundError(action, "User not found", res);
    }

    user.email = userRequest.email;
    user.username = userRequest.username;
    user.fullname = userRequest.fullname;
    user.age = userRequest.age;
    user.profilePicture = userRequest.profilePicture ?userRequest.profilePicture : '';

    user.save();

    const response : IUserUpdateResponse = {
      username: user.username,
      email: user.email,
      fullname: user.fullname?.toString(),
      age: user.age?.toString(),
      userRole: user.userRole?.toString(),
      profilePicture: user.profilePicture?.toString()
    }

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(response, action))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const deleteAccount = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.user?.userId;
  const action = "Delete account";

  if (!userId) {
    return badRequestError(action, "Do not have a valid user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(
        action,
        "User not found or user is already deleted",
        res
      );
    }

    await deleteUserById(userId);

    res.clearCookie(authCookieName!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie(authRefreshCookieName!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    
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
  const userId = req.user?.userId;
  const { sessionToken } = req.body;
  const action = "Logout user from all devices";

  if (!userId) {
    return badRequestError(action, "Do not have a valid user id", res);
  }

  try {
    const user = await getUserById(userId).select(
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

export const stash = async (req: express.Request, res: express.Response) => {
  const userId = req.user?.userId;
  const action = "Stashed Items";

  if (!userId) {
    return badRequestError(action, "Do not have a valid user id", res);
  }
  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }

    const archivedTasks = await getArchivedTasks(userId);
    const deletedTasks = await getDeletedTasks(userId);
    const completedTasks = await getCompletedTasks(userId);

    const stashedTasks = [...archivedTasks, ...deletedTasks, ...completedTasks];

    const archivedList = await archivedLists(userId);
    const deletedList = await deletedLists(userId);
    const hiddenList = await hiddenLists(userId);

    const stashedLists = [...archivedList, ...deletedList, ...hiddenList];

    const reponse = {
      tasks: mapStashedTasks(stashedTasks),
      lists: mapStashedLists(stashedLists),
    };

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(reponse, action, APIStatusCode.OK));
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

const mapStashedTasks = (stashedArray: any[]): any[] => {
  if (!stashedArray.length) {
    return [];
  }
  return stashedArray.map((task: any) => {
    return {
      id: task.id,
      currentListId: task.currentListId,
      title: task.taskTitle,
      creationDate: task.creationDate,
      updationDate: task.updationDate,
      taskDesc: task.taskDesc,
      isCompleted: task.isCompleted,
      isDeleted: task.isDeleted,
      isArchived: task.isArchived,
      isDeletedWithList: task.isDeletedWithList,
      isArchivedWithList: task.isArchivedWithList,
      isHiddenWithList: task.isHiddenWithList,
      isTask: true,
    };
  });
};

const mapStashedLists = (stashedArray: any[]): any[] => {
  if (!stashedArray.length) {
    return [];
  }
  return stashedArray.map((list: any) => {
    return {
      id: list.id,
      title: list.listTitle,
      creationDate: list.creationDate,
      updationDate: list.updationDate,
      isDeleted: list.isDeleted,
      isArchived: list.isArchived,
      isHidden: list.isHidden,
      isTask: false,
    };
  });
};
