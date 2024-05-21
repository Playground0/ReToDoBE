import express from 'express';
import authentication from './authentication';
import todolist from './todo-list';
import todoTask from './todo-task';

const router = express.Router();

export default () : express.Router => {
    todolist(router);
    authentication(router);
    todoTask(router);
    return router;
}