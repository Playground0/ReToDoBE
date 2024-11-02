export interface IUserUpdateRequest {
  email: string;
  username: string;
  fullname?: string;
  age?: string;
  profilePicture?: string;
}

export interface IUserUpdateResponse {
  username: string;
  email: string;
  fullname: string | undefined;
  age: string | undefined;
  userRole: string | undefined;
  profilePicture: string | undefined;
}