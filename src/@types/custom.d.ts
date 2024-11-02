import "express";
import { JwtCookiePayload } from "../models/jwt.model";

declare module "express" {
    export interface Request {
        user?: JwtCookiePayload;
    }
}