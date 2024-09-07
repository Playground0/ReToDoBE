import express from "express";
import { APIResponse } from "../models/api-response.model";
import {
  interalServerError,
  notFoundError,
  badRequestError,
} from "../utils/error-message-handler";
import { getUserById } from "../models/schemas/users";
import {
  createTask,
  deleteTaskById,
  getArchivedTasks,
  getCompletedTasks,
  getCustomListTasks,
  getDeletedTasks,
  getInboxTasks,
  getTaskById,
  getTodayTasks,
  getUpcommingTasks,
  searchResults,
} from "../models/schemas/todo-task";
import { TaskUndoActions } from "../models/constants/todo.constants";
import { formatDate, startOfToday } from "../utils/date-converter";
import { APIStatusCode } from "../models/constants/status.constants";
import dayjs from "dayjs";
import { getListById } from "../models/schemas/todo-list";

//TODO: Add new enums for the constants
// like Create Task, Get Task Details, etc
// and error messages like missing parameters, user not found, etc.
export const createNewTask = async (
  req: express.Request,
  res: express.Response
) => {
  const {
    currentListId,
    previousListID,
    userId,
    taskTitle,
    taskStartDate,
    taskEndDate,
    taskDesc,
    occurance,
    priority,
    reminder,
    isRecurring,
  } = req.body;
  const action = "Create Task";
  let tasks = [];

  if (!userId) {
    return badRequestError(action, "Missing user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const newTask = {
      currentListId: currentListId,
      previousListID: previousListID,
      userId: userId,
      taskTitle: taskTitle,
      creationDate: startOfToday(),
      updationDate: startOfToday(),
      taskStartDate: taskStartDate,
      taskEndDate: taskEndDate,
      taskDesc: taskDesc,
      occurance: occurance,
      priority: priority,
      reminder: reminder,
      isRecurring: isRecurring,
      isDeleted: false,
      isArchived: false,
      isCompleted: false,
      isDeletedWithList: false,
      isArchivedWithList: false,
      isHiddenWithList: false,
    };
    if (!isRecurring) {
      tasks.push(newTask);
      const response = await createTask(tasks);
      return res
        .status(APIStatusCode.Created)
        .json(APIResponse.success(response[0], action, APIStatusCode.Created));
    }
    tasks = setupRecurringTasks(newTask);
    const response = await createTask(tasks);
    return res
      .status(APIStatusCode.Created)
      .json(APIResponse.success(response, action, APIStatusCode.Created));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const getTaskDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  const taskId = req.params.taskId;
  const action = "Get Task Details";

  if (!userId || !taskId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundError(action, "Task not found", res);
    }

    return res.status(APIStatusCode.OK).json(APIResponse.success(task, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const updateTaskDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const {
    taskId,
    currentListId,
    previousListID,
    userId,
    taskTitle,
    taskStartDate,
    taskEndDate,
    taskDesc,
    occurance,
    priority,
    reminder,
    isRecurring,
  } = req.body;
  const action = "Update Task";

  if (!taskId || !userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundError(action, "task not found", res);
    }
    task.currentListId = currentListId;
    task.previousListID = previousListID;
    task.taskTitle = taskTitle;
    task.taskStartDate = taskStartDate;
    task.taskEndDate = taskEndDate;
    task.updationDate = startOfToday();
    task.taskDesc = taskDesc;
    task.occurance = occurance;
    task.priority = priority;
    task.reminder = reminder;
    task.isRecurring = isRecurring;

    if (!isRecurring) {
      task.save();
      return res
        .status(APIStatusCode.OK)
        .json(APIResponse.success(task, action));
    }
    await deleteTaskById(task.id)
    const tasks = setupRecurringTasks(task);
    const response = await createTask(tasks);
    return res
      .status(APIStatusCode.Created)
      .json(APIResponse.success(response, action, APIStatusCode.Created));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const permaDeleteTask = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Perma Delete Task";

  if (!taskId) {
    return badRequestError(action, "Missing Task id", res);
  }
  if (!userId) {
    return badRequestError(action, "Missing user id ", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const list = await getTaskById(taskId, userId);
    if (!list) {
      return notFoundError(action, "Task not found", res);
    }

    await deleteTaskById(taskId);
    return res
      .status(APIStatusCode.NoContent)
      .json(APIResponse.success([], action, APIStatusCode.NoContent))
      .end();
  } catch (error) {
    return interalServerError(action, error, res);
  }
};

export const inboxTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  const action = "Get Inbox";
  if (!userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const tasks = await getInboxTasks(userId);
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const archivedTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  const action = "Get Archived tasks";
  if (!userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const tasks = await getArchivedTasks(userId);
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const deletedTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  const action = "Get Deleted tasks";
  if (!userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const tasks = await getDeletedTasks(userId);
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const completedTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  const action = "Get Completed tasks";
  if (!userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const tasks = await getCompletedTasks(userId);
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const todayTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  const action = "Get Completed tasks";
  if (!userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const tasks = await getTodayTasks(userId);
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const upcommingTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  const action = "Get Completed tasks";
  if (!userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const tasks = await getUpcommingTasks(userId);
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const softDeleteTask = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Delete Task";

  if (!taskId || !userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundError(action, "task not found", res);
    }
    task.isDeleted = true;
    task.save();

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(task.isDeleted, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const undoTask = async (req: express.Request, res: express.Response) => {
  const { taskId, userId } = req.body;
  const action = "Undo Task Action";
  const undo: string = req.params.undoAction;
  //TODO: Refactor the below logic
  const undoActions: string[] = [
    TaskUndoActions.Archive,
    TaskUndoActions.Delete,
    TaskUndoActions.Complete,
  ];
  if (!userId || !taskId) {
    return badRequestError(action, "Missing parameters", res);
  }
  if (!undoActions.includes(undo)) {
    return badRequestError(
      action,
      "Wrong undo action, Please check parameters and pass delete, archive or complete options only",
      res
    );
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "User not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundError(action, "task not found", res);
    }

    switch (undo) {
      case TaskUndoActions.Delete: {
        task.isDeleted = !task.isDeleted;
        break;
      }
      case TaskUndoActions.Archive: {
        task.isArchived = !task.isArchived;
        break;
      }
      case TaskUndoActions.Complete: {
        task.isCompleted = !task.isCompleted;
        break;
      }
      default:
        break;
    }
    task.save();
    const responseObj = {
      isDeleted: task.isDeleted,
      isCompleted: task.isCompleted,
      isArchived: task.isArchived,
    };
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(responseObj, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const markAsArchive = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Archive Task";

  if (!taskId || !userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundError(action, "task not found", res);
    }
    task.isArchived = true;
    task.save();

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(task.isArchived, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const markAsComplete = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Complete Task";

  if (!taskId || !userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundError(action, "task not found", res);
    }
    if (task.isCompleted) {
      return res
        .status(APIStatusCode.Conflict)
        .json(
          APIResponse.error(
            action,
            "Task is already marked completed",
            APIStatusCode.Conflict
          )
        );
    }
    task.isCompleted = true;
    task.save();

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(task.isCompleted, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
};

export const customListTasks = async(req: express.Request, res: express.Response) => {
  const userId = req.params.userId;
  const listId = req.params.listId;
  const action = "Get Custom list tasks";
  if (!userId) {
    return badRequestError(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundError(action, "user not found", res);
    }

    const list = await getListById(listId,userId);
    if(!list){
      return notFoundError(action, "List not found",res)
    }

    const tasks = await getCustomListTasks(userId, listId);
    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
}

export const searchTasks = async (req: express.Request, res: express.Response) => {
  const searchQuery =  typeof req.query.search === 'string' ? req.query.search  :  ''
  const userId = req.params.userId;
  const action = 'Search tasks'

  if(!userId){
    return badRequestError(action,"Please pass user Id", res);
  }
  try {
    const user = await getUserById(userId);

    if(!user){
      return notFoundError(action,'user not found',res);
    }
    
    const tasks = await searchResults(searchQuery,userId)

    return res
      .status(APIStatusCode.OK)
      .json(APIResponse.success(tasks, action));
  } catch (err) {
    return interalServerError(action, err, res);
  }
}

const setupRecurringTasks = (task: any) => {
  const tasks = [];
  let currentDate = dayjs(task.taskStartDate);
  const finalDate = dayjs(task.taskEndDate);
  while (
    currentDate.isBefore(finalDate) ||
    currentDate.isSame(finalDate, "day")
  ) {
    const newTask = {
      currentListId: task.currentListId,
      previousListID: task.previousListID,
      userId: task.userId,
      taskTitle: task.taskTitle,
      creationDate: startOfToday(),
      updationDate: startOfToday(),
      taskStartDate: formatDate(currentDate),
      taskEndDate: formatDate(currentDate),
      taskDesc: task.taskDesc,
      occurance: task.occurance,
      priority: task.priority,
      reminder: task.reminder,
      isRecurring: task.isRecurring,
      isDeleted: false,
      isArchived: false,
      isCompleted: false,
      isDeletedWithList: false,
      isArchivedWithList: false,
      isHiddenWithList: false,
    };
    tasks.push(newTask);
    currentDate = currentDate.add(1, "day");
  }
  return tasks;
}
