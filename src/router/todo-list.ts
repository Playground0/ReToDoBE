import express from "express";
import {
  createNewList,
  softDeleteList,
  getAllList,
  updateList,
  archiveList,
  hideList,
  deleteList,
  undoList,
  archivedList,
  deletedList,
  hiddenList,
} from "../controllers/todo-list";
import { authenticateToken } from "../middlewares/validate-token";

export default (router: express.Router) => {
  router.get("/list", authenticateToken, getAllList);
  router.get("/list/archivedList", authenticateToken, archivedList);
  router.get("/list/deletedList", authenticateToken, deletedList);
  router.get("/list/hiddenList", authenticateToken, hiddenList);
  router.patch("/list", authenticateToken, updateList);
  router.post("/list", authenticateToken, createNewList);
  router.delete("/list", authenticateToken, deleteList);
  router.patch("/list/delete", authenticateToken, softDeleteList);
  router.patch("/list/archive", authenticateToken, archiveList);
  router.patch("/list/hide", authenticateToken, hideList);
  router.patch("/list-undo/:undoAction", authenticateToken, undoList);
};
