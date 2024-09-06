import express from 'express'
import { deleteAccount, logoutUserFromDevices, stash, updateUserDetails, userDetails } from '../controllers/users'

export default (router: express.Router) => {
    router.get('/user/:userId',userDetails);
    router.get('/user/stash/:userId',stash)
    router.patch('/user', updateUserDetails);
    router.delete('/user/:userId',deleteAccount);
    router.patch('/user/logoutFromDevices',logoutUserFromDevices);
}