import express from "express";
import { createNewList, softDeleteList, getAllList, updateList, archiveList, hideList, deleteList, undoList, archivedList, deletedList, hiddenList } from "../controllers/todo-list";

export default (router: express.Router) => {
  router.get("/list/:userId", getAllList)
  router.get("/list/:userId/archivedList",archivedList)
  router.get("/list/:userId/deletedList",deletedList)
  router.get("/list/:userId/hiddenList",hiddenList)
  router.patch("/list", updateList)
  router.post("/list", createNewList);
  router.delete("/list", deleteList);
  router.patch("/list/delete", softDeleteList);
  router.patch("/list/archive", archiveList);
  router.patch("/list/hide", hideList);
  router.patch("/list-undo/:undoAction", undoList);
};
