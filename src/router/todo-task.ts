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
  searchTasks,
  softDeleteTask,
  todayTasks,
  undoTask,
  upcommingTasks,
  updateTaskDetails,
} from "../controllers/todo-task";
import { authenticateToken } from "../middlewares/validate-token";

//TODO: Refactor for usability
export default (router: express.Router) => {
  router.post("/task", authenticateToken, createNewTask);
  router.get("/task-details/:taskId", authenticateToken, getTaskDetails);
  router.patch("/task", authenticateToken, updateTaskDetails);
  router.delete("/task", authenticateToken, permaDeleteTask);
  router.get("/task/inbox", authenticateToken, inboxTasks);
  router.get("/task/archives", authenticateToken, archivedTasks);
  router.get("/task/deleted", authenticateToken, deletedTasks);
  router.get("/task/completed", authenticateToken, completedTasks);
  router.get("/task/today", authenticateToken, todayTasks);
  router.get("/task/upcoming", authenticateToken, upcommingTasks);
  router.patch("/task/delete", authenticateToken, softDeleteTask);
  router.patch("/task/undo/:undoAction", authenticateToken, undoTask);
  router.patch("/task/archive", authenticateToken, markAsArchive);
  router.patch("/task/complete", authenticateToken, markAsComplete);
  router.get("/task/custom-list/:listId", authenticateToken, customListTasks);
  router.get("/task?", authenticateToken, searchTasks);
};
