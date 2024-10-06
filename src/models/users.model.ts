export interface IUserUpdateRequest {
  userId: string;
  email: string;
  username: string;
  fullname?: string;
  age?: string;
  profilePicture?: string;
}

export interface IUserUpdateResponse {
  id: string;
  username: string;
  email: string;
  fullname: string | undefined;
  age: string | undefined;
  userRole: string | undefined;
  profilePicture: string | undefined;
}