import express from "express";
import {
  archivedTasks,
  completedTasks,
  createNewTask,
  customListTasks,
  deletedTasks,
  getTaskDetails,
  inboxTasks,
  markAsArchive,
  markAsComplete,
  permaDeleteTask,
  softDeleteTask,
  todayTasks,
  undoTask,
  upcommingTasks,
  updateTaskDetails,
} from "../controllers/todo-task";

//TODO: Refactor for usability
export default (router: express.Router) => {
  router.post("/task", createNewTask);
  router.get("/task-details/:userId/:taskId", getTaskDetails);
  router.patch("/task", updateTaskDetails);
  router.delete("/task", permaDeleteTask);
  router.get("/task/:userId/inbox", inboxTasks);
  router.get("/task/:userId/archives", archivedTasks);
  router.get("/task/:userId/deleted", deletedTasks);
  router.get("/task/:userId/completed", completedTasks);
  router.get("/task/:userId/today", todayTasks);
  router.get("/task/:userId/upcoming", upcommingTasks);
  router.patch("/task/delete", softDeleteTask);
  router.patch("/task/undo/:undoAction", undoTask);
  router.patch("/task/archive", markAsArchive);
  router.patch("/task/complete", markAsComplete);
  router.get("/task/custom-list/:userId/:listId", customListTasks);
};
