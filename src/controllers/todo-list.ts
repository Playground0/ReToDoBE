import express from "express";
import {
  createlist,
  deleteListById,
  getListById,
  getListByName,
  getListsByUser,
} from "../models/schemas/todo-list";
import { APIResponse } from "../models/api-response.model";
import { getUserById } from "../models/schemas/users";
import {
  defaultErrorMessage,
  notFoundMessage,
  missingParamMessage,
} from "../utils/error-message-handler";
import { ListUndoActions } from "../models/constants/todo.constants";

export const createNewList = async (
  req: express.Request,
  res: express.Response
) => {
  const {
    listTitle,
    userId,
    sharedUsrID,
    creationDate,
    updationDate,
    tasks,
    isDeleted,
    isHidden,
    isArchived,
  } = req.body;
  const action = "Create new list";

  const existingList = await getListByName(listTitle, userId);
  if (existingList) {
    return res
      .status(400)
      .json(APIResponse.error(action, "List with same name exists", 400));
  }

  try {
    const list = await createlist({
      listTitle,
      userId,
      sharedUsrID,
      creationDate,
      updationDate,
      tasks,
      isDeleted,
      isHidden,
      isArchived,
    });
    let responseBody = {
      id: list._id,
      title: list.listTitle,
      userId: list.userId,
    };
    return res
      .status(200)
      .json(APIResponse.success(responseBody, action))
      .end();
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const getAllList = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const action = "Get All Lists";
  if (!userId) {
    return missingParamMessage(action, "Please pass the user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }

    const lists = await getListsByUser(userId);
    return res.status(200).json(APIResponse.success(lists, action)).end();
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const getList = async (req: express.Request, res: express.Response) => {
  const { listId, userId } = req.body;
  const action = "Get List";

  if (!listId || !userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundMessage(action, "List not found", res);
    }
    return res
      .status(200)
      .json(APIResponse.success(list, action, "List fetched", 200))
      .end();
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const updateList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId, listTitle, sharedUsrID, updationDate } = req.body;
  const action = "Update list";

  if (!listId) {
    return missingParamMessage(action, "List id not passed", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundMessage(action, "List not found", res);
    }

    list.listTitle = listTitle;
    list.sharedUsrID = sharedUsrID;
    list.updationDate = updationDate;
    list.save();

    return res.status(200).json(APIResponse.success(list, action)).end();
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const softDeleteList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId } = req.body;
  const action = "Delete List";
  if (!listId || !userId) {
    return missingParamMessage(action, "Missing Parameters", res);
  }
  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundMessage(action, "List not found", res);
    }
    if (list.isDeleted) {
      return res
        .status(400)
        .json(APIResponse.error(action, "List is already deleted", 400));
    }
    list.isDeleted = true;
    await list.save();
    let data = {
      listId: list.id,
      listTitle: list.listTitle,
      isDeleted: list.isDeleted,
    };
    return res
      .status(200)
      .json(APIResponse.success(data, action, "List deleted"))
      .end();
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const archiveList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId } = req.body;
  const action = "Archive list";

  if (!listId) {
    return missingParamMessage(action, "Pass List id", res);
  }
  if (!userId) {
    return missingParamMessage(action, "Pass user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundMessage(action, "list not found", res);
    }
    if (list.isArchived) {
      return res
        .status(400)
        .json(APIResponse.error(action, "List is already Archived", 400));
    }

    list.isArchived = true;
    list.save();

    let responseBody = {
      listId: list._id,
      listTitile: list.listTitle,
      isArchived: list.isArchived,
    };
    return res
      .status(200)
      .json(APIResponse.success(responseBody, action))
      .end();
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const hideList = async (req: express.Request, res: express.Response) => {
  const { listId, userId } = req.body;
  const action = "Hide list";

  if (!listId) {
    return missingParamMessage(action, "Pass List id", res);
  }
  if (!userId) {
    return missingParamMessage(action, "Pass user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundMessage(action, "list not found", res);
    }
    if (list.isHidden) {
      return res
        .status(400)
        .json(APIResponse.error(action, "List is already hidden", 400));
    }

    list.isHidden = true;
    list.save();

    let responseBody = {
      listId: list._id,
      listTitile: list.listTitle,
      isHidden: list.isHidden,
    };
    return res
      .status(200)
      .json(APIResponse.success(responseBody, action))
      .end();
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const deleteList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId } = req.body;
  const action = "Perma Delete List";

  if (!listId) {
    return missingParamMessage(action, "Missing list id", res);
  }
  if (!userId) {
    return missingParamMessage(action, "Missing user id ", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundMessage(action, "List not found", res);
    }

    await deleteListById(listId);
    return res.status(200).json(APIResponse.success([], action)).end();
  } catch (error) {
    return defaultErrorMessage(action, error, res);
  }
};

export const undoList = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, listId } = req.body;
  const undo: string = req.params.undoAction;
  const action = "Undo Delete list";
  const undoActions : string[] = [ListUndoActions.Archive,ListUndoActions.Delete, ListUndoActions.Hide]
  if (!userId || !listId) {
    return missingParamMessage(action, "Missing parameters", res);
  }
  if ( !undoActions.includes(undo)) {
    return missingParamMessage(action, "Wrong undo action, Please check parameters and pass delete, archive or hide options only", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundMessage(action, "list not found", res);
    }

    switch (undo) {
      case ListUndoActions.Delete: {
        list.isDeleted = !list.isDeleted;
        break;
      }
      case ListUndoActions.Hide: {
        list.isHidden = !list.isHidden;
        break;
      }
      case ListUndoActions.Archive: {
        list.isArchived = !list.isArchived;
        break;
      }
      default:
        break;
    }
    list.save();
    return res.status(200).json(APIResponse.success(list, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};
