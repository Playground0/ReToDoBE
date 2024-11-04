import express from "express";
import {
  deleteAccount,
  logoutUserFromDevices,
  stash,
  updateUserDetails,
  userDetails,
} from "../controllers/users";
import { authenticateToken } from "../middlewares/validate-token";

export default (router: express.Router) => {
  router.get("/user", authenticateToken, userDetails);
  router.get("/user/stash", authenticateToken, stash);
  router.patch("/user", authenticateToken, updateUserDetails);
  router.delete("/user", authenticateToken, deleteAccount);
  router.patch(
    "/user/logoutFromDevices",
    authenticateToken,
    logoutUserFromDevices
  );
};
