import jwt from "jsonwebtoken";
import express from "express";
import { APIStatusCode } from "../models/constants/status.constants";
import { APIResponse } from "../models/api-response.model";
import { JwtCookiePayload } from "../models/jwt.model";

export const authenticateToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.cookies[process.env.AUTH_COOKIE_NAME!];

  if (!token)
    return res.status(401).json({ message: "Unauthorized: Token missing or expired" });

  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    (err: unknown, decodedUser: unknown) => {
      if (err) {
        res.status(403).json({ message: "Forbidden: Invalid token" });
      } else {
        req.user = decodedUser as JwtCookiePayload;
        next();
      }
    }
  );
};

export const authenticateRefreshToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const refreshToken = req.cookies[process.env.AUTH_REFRESH_COOKIE_NAME!];

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET!,
    (err: unknown, decodedUser: unknown) => {
      if (err) {
        res.status(403).json({ message: "Forbidden: Invalid token" });
      } else {
        req.user = decodedUser as JwtCookiePayload;
        next();
      }
    }
  );
};

export const authenticateResetPassToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.body.token;
  if (!token)
    return res.status(401).json({ message: "Unauthorized: Token missing" });

  jwt.verify(
    token,
    process.env.JWT_RESET_PASS_SECRET!,
    (err: unknown, user: unknown) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res
            .status(APIStatusCode.Unauthorized)
            .json(
              APIResponse.error(
                "Reset Password",
                "Password reset link has expired. Please request a new one.",
                APIStatusCode.BadRequest,
                []
              )
            );
        }
        if (err instanceof jwt.JsonWebTokenError) {
          return res
            .status(APIStatusCode.Unauthorized)
            .json(
              APIResponse.error(
                "Reset Password",
                "Invalid password reset link.",
                APIStatusCode.BadRequest,
                []
              )
            );
        }
      } else {
        // req.user = user as JwtCookiePayload;
        next();
      }
    }
  );
};
