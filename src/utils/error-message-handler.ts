import express from "express";
import { APIResponse } from "../models/api-response.model";

export function defaultErrorMessage(
  action: string,
  err: unknown,
  res: express.Response
): express.Response {
  let errorMessage = "";
  if (err instanceof Error) {
    errorMessage = err.message;
  }
  errorMessage = "Unknown Error";
  return res
    .status(400)
    .json(
      APIResponse.error(
        action,
        "Something went wrong, check error message",
        400,
        [{ message: errorMessage }]
      )
    );
}

export function notFoundMessage(
  action: string,
  message: string,
  res: express.Response
): express.Response {
  return res.status(404).json(APIResponse.error(action, message, 404));
}

export function missingParamMessage(
  action: string,
  message: string,
  res: express.Response
) {
  return res.status(400).json(APIResponse.error(action, message, 400));
}
