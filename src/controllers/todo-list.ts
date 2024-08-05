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
  interalServerError,
  notFoundError,
  badRequestError,
} from "../utils/error-message-handler";
import { ListUndoActions } from "../models/constants/todo.constants";
import { APIStatusCode } from "../models/constants/status.constants";

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
      .status(APIStatusCode.Conflict)
      .json(APIResponse.error(action, "List with same name exists", APIStatusCode.Conflict));
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
      .status(APIStatusCode.Created)
      .json(APIResponse.success(responseBody, action, APIStatusCode.Created))
      .end();
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const getAllList = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const action = "Get All Lists";
  if (!userId) {
    return badRequestError(action, "Please pass the user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }

    const lists = await getListsByUser(userId);
    return res.status(APIStatusCode.OK).json(APIResponse.success(lists, action)).end();
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const getList = async (req: express.Request, res: express.Response) => {
  const { listId, userId } = req.body;
  const action = "Get List";

  if (!listId || !userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundError(action, "List not found", res);
    }
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(list, action, APIStatusCode.OK))
      .end();
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const updateList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId, listTitle, sharedUsrID, updationDate } = req.body;
  const action = "Update list";

  if (!listId) {
    return badRequestError(action, "List id not passed", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundError(action, "List not found", res);
    }

    list.listTitle = listTitle;
    list.sharedUsrID = sharedUsrID;
    list.updationDate = updationDate;
    list.save();

    return res.status(APIStatusCode.OK).json(APIResponse.success(list, action)).end();
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const softDeleteList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId } = req.body;
  const action = "Delete List";
  if (!listId || !userId) {
    return badRequestError(action, "Missing Parameters", res);
  }
  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundError(action, "List not found", res);
    }
    if (list.isDeleted) {
      return res
        .status(APIStatusCode.Conflict)
        .json(APIResponse.error(action, "List is already deleted", APIStatusCode.Conflict));
    }
    list.isDeleted = true;
    await list.save();
    let data = {
      listId: list.id,
      listTitle: list.listTitle,
      isDeleted: list.isDeleted,
    };
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(data, action, APIStatusCode.OK, "List deleted"))
      .end();
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const archiveList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId } = req.body;
  const action = "Archive list";

  if (!listId) {
    return badRequestError(action, "Pass List id", res);
  }
  if (!userId) {
    return badRequestError(action, "Pass user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundError(action, "list not found", res);
    }
    if (list.isArchived) {
      return res
        .status(APIStatusCode.Conflict)
        .json(APIResponse.error(action, "List is already Archived", APIStatusCode.Conflict));
    }

    list.isArchived = true;
    list.save();

    let responseBody = {
      listId: list._id,
      listTitile: list.listTitle,
      isArchived: list.isArchived,
    };
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(responseBody, action))
      .end();
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const hideList = async (req: express.Request, res: express.Response) => {
  const { listId, userId } = req.body;
  const action = "Hide list";

  if (!listId) {
    return badRequestError(action, "Pass List id", res);
  }
  if (!userId) {
    return badRequestError(action, "Pass user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundError(action, "list not found", res);
    }
    if (list.isHidden) {
      return res
        .status(APIStatusCode.Conflict)
        .json(APIResponse.error(action, "List is already hidden", APIStatusCode.Conflict));
    }

    list.isHidden = true;
    list.save();

    let responseBody = {
      listId: list._id,
      listTitile: list.listTitle,
      isHidden: list.isHidden,
    };
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(responseBody, action))
      .end();
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const deleteList = async (
  req: express.Request,
  res: express.Response
) => {
  const { listId, userId } = req.body;
  const action = "Perma Delete List";

  if (!listId) {
    return badRequestError(action, "Missing list id", res);
  }
  if (!userId) {
    return badRequestError(action, "Missing user id ", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundError(action, "List not found", res);
    }

    await deleteListById(listId);
    return res.status(APIStatusCode.NoContent).json(APIResponse.success([], action,APIStatusCode.NoContent)).end();
  } catch (error) {
    return interalServerError(action, error, res);
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
    return badRequestError(action, "Missing parameters", res);
  }
  if ( !undoActions.includes(undo)) {
    return badRequestError(action, "Wrong undo action, Please check parameters and pass delete, archive or hide options only", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getListById(listId, userId);
    if (!list) {
      return notFoundError(action, "list not found", res);
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
    const responseObj = {
      isDeleted: list.isDeleted,
      isHidden: list.isHidden,
      isArchived: list.isArchived
    }
    return res.status(APIStatusCode.OK).json(APIResponse.success(responseObj, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};
