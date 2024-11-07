import dotenv from "dotenv";
import express from "express";
import http from "http";
import bodyparser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import "express";
import { JwtCookiePayload } from "./models/jwt.model";

declare global {
  namespace Express {
    interface Request {
      user?: JwtCookiePayload;
    }
  }
}


dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Wait for 1 minute to make new call
  max: 300,
  message: "Too many requests from this IP, please try again after 1 minute",
  headers: true,
});

const whiteList = ["https://re-todo-fe.vercel.app", "http://localhost:4200"];

const corsOptions = (req:any, callback:any) => {
  const origin = req.header("Origin");

  if (whiteList.includes(origin || '')) {
    callback(null, {
      origin: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: ["Content-type", "Authorization"],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
  } else {
    callback(null, {
        origin: false
    })
  }
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allowing preflights

app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true, // Apply to subdomains
    preload: true,
  })
);

app.use(apiLimiter);
app.use(compression());
app.use(cookieParser());
app.use(bodyparser.json());

const server = http.createServer(app);

server.listen(port, () => {
  console.log("Server running on port:" + port);
});

const MONGO_URL = process.env.NODE_ENV! === 'production' ? process.env.DB_STRING!.toString() : process.env.DB_STRING_LOCAL!.toString();
mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.get("/", (req: express.Request, res: express.Response) => {
  let msg = {
    message: "Sounds Good!",
  };
  return res.status(200).json(msg);
});
app.use("/api/v1", router());