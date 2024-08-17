import express from 'express';
import { forgotPassword, login, logout, register, resetPassword } from '../controllers/authentication';


export default (router: express.Router) => {
    router.post('/auth/register',register);
    router.patch('/auth/login',login);
    router.patch('/auth/logout',logout);
    router.post('/auth/forgot-password', forgotPassword)
    router.post('/auth/reset-password', resetPassword)
};