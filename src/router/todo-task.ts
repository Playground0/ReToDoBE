import express from "express";
import { archivedTasks, completedTasks, createNewTask, deletedTasks,getTaskDetails, inboxTasks, markAsArchive, markAsComplete, permaDeleteTask, softDeleteTask, undoTask, updateTaskDetails } from "../controllers/todo-task";

export default (router: express.Router) => {
    router.post('/task', createNewTask);
    router.get('/task',getTaskDetails);
    router.patch('/task', updateTaskDetails);
    router.delete('/task', permaDeleteTask);
    router.get('/task/inbox',inboxTasks);
    router.get('/task/archives',archivedTasks);
    router.get('/task/deleted',deletedTasks);
    router.get('/task/completed',completedTasks);
    router.patch('/task/delete', softDeleteTask);
    router.patch('/task/undo/:undoAction', undoTask);
    router.patch('/task/archive', markAsArchive);
    router.patch('/task/complete', markAsComplete);
}