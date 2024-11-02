import express from "express";
import {
  forgotPassword,
  hardLogoutUser,
  login,
  logout,
  refreshAllTokens,
  register,
  resetPassword,
} from "../controllers/authentication";
import {
  authenticateRefreshToken,
  authenticateResetPassToken,
  authenticateToken,
} from "../middlewares/validate-token";

export default (router: express.Router) => {
  router.post("/auth/register", register);
  router.patch("/auth/login", login);
  router.patch("/auth/logout", authenticateToken, logout);
  router.post("/auth/forgot-password", forgotPassword);
  router.post(
    "/auth/reset-password",
    authenticateResetPassToken,
    resetPassword
  );
  router.get("/auth/refresh-token", authenticateRefreshToken, refreshAllTokens);
  router.patch("/auth/hard-logout-user", hardLogoutUser);
};
