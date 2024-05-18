import express from 'express';
import { login, logout, register } from '../controllers/authentication';


export default (router: express.Router) => {
    router.post('/auth/register',register);
    router.patch('/auth/login',login);
    router.patch('/auth/logout',logout);
};