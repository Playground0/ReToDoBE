import express from "express";
import { APIResponse } from "../models/api-response.model";
import {
  defaultErrorMessage,
  notFoundMessage,
  missingParamMessage,
} from "../utils/error-message-handler";
import { getUserById } from "../models/schemas/users";
import {
  createTask,
  deleteTaskById,
  getArchivedTasks,
  getCompletedTasks,
  getDeletedTasks,
  getInboxTasks,
  getTaskById,
  getTaskByUser,
  updateTaskByID,
} from "../models/schemas/todo-task";
import { TaskUndoActions } from "../models/constants/todo.constants";

export const createNewTask = async (
  req: express.Request,
  res: express.Response
) => {
  const {
    currentListId,
    previousListID,
    userId,
    taskTitle,
    creationDate,
    updationDate,
    taskStartDate,
    taskEndDate,
    taskDesc,
    occurance,
    priority,
    reminder,
    isRecurring,
    isDeleted,
    isArchived,
    isCompleted,
  } = req.body;
  const action = "Create Task";

  if (!userId) {
    return missingParamMessage(action, "Missing user id", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }

    const task = await createTask({
      currentListId,
      previousListID,
      userId,
      taskTitle,
      creationDate,
      updationDate,
      taskStartDate,
      taskEndDate,
      taskDesc,
      occurance,
      priority,
      reminder,
      isRecurring,
      isDeleted,
      isArchived,
      isCompleted,
    });
    let responseBody = {
      taskId: task._id,
      title: task.taskTitle,
      userId: task.userId,
    };
    return res.status(200).json(APIResponse.success(responseBody, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const getTaskDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, taskId } = req.body;
  const action = "Get Task Details";

  if (!userId || !taskId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }

    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundMessage(action, "Task not found", res);
    }

    return res.status(200).json(APIResponse.success(task, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
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
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundMessage(action, "task not found", res);
    }
    task.currentListId = currentListId;
    task.previousListID = previousListID;
    task.taskTitle = taskTitle;
    task.taskStartDate = taskStartDate;
    task.taskEndDate = taskEndDate;
    task.taskDesc = taskDesc;
    task.occurance = occurance;
    task.priority = priority;
    task.reminder = reminder;
    task.isRecurring = isRecurring;
    //TODO: Update the updation time of the task here
    task.save();

    return res.status(200).json(APIResponse.success(task, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const permaDeleteTask = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Perma Delete Task";

  if (!taskId) {
    return missingParamMessage(action, "Missing Task id", res);
  }
  if (!userId) {
    return missingParamMessage(action, "Missing user id ", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const list = await getTaskById(taskId, userId);
    if (!list) {
      return notFoundMessage(action, "Task not found", res);
    }

    await deleteTaskById(taskId);
    return res.status(200).json(APIResponse.success([], action)).end();
  } catch (error) {
    return defaultErrorMessage(action, error, res);
  }
};

export const inboxTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.body;
  const action = "Get Inbox";
  if (!userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }

    const tasks = await getInboxTasks(userId);
    return res.status(200).json(APIResponse.success(tasks, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const archivedTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.body;
  const action = "Get Archived tasks";
  if (!userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }

    const tasks = await getArchivedTasks(userId);
    return res.status(200).json(APIResponse.success(tasks, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const deletedTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.body;
  const action = "Get Deleted tasks";
  if (!userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }

    const tasks = await getDeletedTasks(userId);
    return res.status(200).json(APIResponse.success(tasks, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const completedTasks = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.body;
  const action = "Get Completed tasks";
  if (!userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }

    const tasks = await getCompletedTasks(userId);
    return res.status(200).json(APIResponse.success(tasks, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const softDeleteTask = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Delete Task";

  if (!taskId || !userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundMessage(action, "task not found", res);
    }
    task.isDeleted = true;
    task.save();

    return res.status(200).json(APIResponse.success(task.isDeleted, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const undoTask = async (req: express.Request, res: express.Response) => {
  const { taskId, userId } = req.body;
  const action = "Update Task";
  const undo: string = req.params.undoAction;
  const undoActions: string[] = [
    TaskUndoActions.Archive,
    TaskUndoActions.Delete,
    TaskUndoActions.Complete,
  ];
  if (!userId || !taskId) {
    return missingParamMessage(action, "Missing parameters", res);
  }
  if (!undoActions.includes(undo)) {
    return missingParamMessage(
      action,
      "Wrong undo action, Please check parameters and pass delete, archive or complete options only",
      res
    );
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "User not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundMessage(action, "task not found", res);
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
    return res.status(200).json(APIResponse.success(task, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const markAsArchive = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Archive Task";

  if (!taskId || !userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundMessage(action, "task not found", res);
    }
    task.isArchived = true;
    task.save();

    return res.status(200).json(APIResponse.success(task.isDeleted, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};

export const markAsComplete = async (
  req: express.Request,
  res: express.Response
) => {
  const { taskId, userId } = req.body;
  const action = "Complete Task";

  if (!taskId || !userId) {
    return missingParamMessage(action, "Missing parameters", res);
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return notFoundMessage(action, "user not found", res);
    }
    const task = await getTaskById(taskId, userId);
    if (!task) {
      return notFoundMessage(action, "task not found", res);
    }
    if(task.isCompleted){
      return res.status(201).json(APIResponse.success(task.isCompleted,action,"Task already completed"))
    }
    task.isCompleted = true;
    task.save();

    return res.status(200).json(APIResponse.success(task.isCompleted, action));
  } catch (err) {
    return defaultErrorMessage(action, err, res);
  }
};
