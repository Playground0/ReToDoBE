import express from 'express'
import { deleteAccount, logoutUserFromDevices, updateUserDetails, userDetails } from '../controllers/users'

export default (router: express.Router) => {
    router.get('/user/:userID',userDetails);
    router.patch('/user', updateUserDetails);
    router.delete('/user/:userID',deleteAccount);
    router.patch('/user/logoutFromDevices',logoutUserFromDevices);
}