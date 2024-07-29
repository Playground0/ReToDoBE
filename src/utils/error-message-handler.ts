import express from "express";
import { APIResponse } from "../models/api-response.model";
import { APIStatusCode } from "../models/constants/status.constants";

export function interalServerError(
  action: string,
  err: unknown,
  res: express.Response
): express.Response {
  let errorMessage = "";
  if (err instanceof Error) {
    errorMessage = err.message;
  }
  errorMessage = "Unknown Error";
  const code = APIStatusCode.InternalServalError
  return res
    .status(code)
    .json(
      APIResponse.error(
        action,
        "Something went wrong, check error message",
        code,
        [{ message: errorMessage }]
      )
    );
}

export function notFoundError(
  action: string,
  message: string,
  res: express.Response
): express.Response {
  const code = APIStatusCode.NotFound
  return res.status(code).json(APIResponse.error(action, message, code));
}

export function badRequestError(
  action: string,
  message: string,
  res: express.Response,
) {
  const code = APIStatusCode.BadRequest
  return res.status(code).json(APIResponse.error(action, message, code));
}
