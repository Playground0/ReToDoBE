import express from "express";
import { createNewList, softDeleteList, getAllList, getList, updateList, archiveList, hideList, deleteList, undoList } from "../controllers/todo-list";

export default (router: express.Router) => {
  router.get("/list", getList);
  router.patch("/list", updateList)
  router.post("/list", createNewList);
  router.delete("/list", deleteList);
  router.get("/list-all/:userId", getAllList)
  router.patch("/list/delete", softDeleteList);
  router.patch("/list/archive", archiveList);
  router.patch("/list/hide", hideList);
  router.patch("/list/undo/:undoAction", undoList);
};
