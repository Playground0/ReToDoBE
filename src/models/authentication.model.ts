export interface IRegisterRequest {
  email: string;
  password: string;
  username: string;
  phone: string;
  fullname: string;
  age: string;
  city: string;
  displaypicture: string;
  userRole: string;
}

export interface IRegisterResponse{
    username: string;
    email: string
}

export interface ILoginResponse{
    id: string;
    email: string;
    username: string;
    sessionToken: string | undefined;
    userRole: string | null | undefined; 
}

export interface INewUser {
  authentication: IAuthentication;
  email: string;
  username: string;
  fullname: string;
  phone: string;
  city: string;
  age: string;
  displaypicture: string;
  userRole: string;
}

export interface IAuthentication {
  salt: string;
  password: string;
  sessionToken: string[];
}
