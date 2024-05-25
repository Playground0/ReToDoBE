interface ErrorDetail {
  message: string;
  [key: string]: any;
}

export class APIResponse<T> {
  Status: string;
  Code: number;
  Data: T | null = null;
  Message: string;
  Action: string;
  ErrorMessage: ErrorDetail[] | null;

  constructor(
    status: string,
    code: number = 0,
    action: string = "",
    message: string = "",
    data: T | null = null,
    errrors: ErrorDetail[] | null = null
  ) {
    this.Status = status;
    this.Code = code;
    this.Action = action;
    this.Data = data;
    this.Message = message;
    this.ErrorMessage = errrors;
  }

  static success<T>(
    data: T,
    action: string,
    message: string = "Request processed successfully",
    code: number = 200
  ): APIResponse<T> {
    return new APIResponse<T>("success", code, action , message, data);
  }

  static error<T>(
    action: string,
    message: string,
    code: number = 500,
    errors: ErrorDetail[] | null = null,
  ) {
    return new APIResponse<T>("error", code, action, message, null, errors);
  }
}
