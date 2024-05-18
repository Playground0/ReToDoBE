import express from "express";
import { createUser, getUserByEmail } from "../models/users";
import { authentication, random } from "../helpers";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    // TODO: Create model for user and assign it
    const {
      email,
      password,
      username,
      phone,
      fullname,
      age,
      city,
      displaypicture,
      userRole,
    } = req.body;

    if (!email || !password || !username || !userRole) {
      return res.status(400).json({
        Actions: "Sign Up",
        Actions_Status: "Sign Up Failed - Missing Information",
      });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(403).json({
        Actions: "Sign Up",
        Actions_Status: "Sign Up Failed - User Exist",
      });
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
        sessionToken: [],
      },
      fullname,
      phone,
      city,
      age,
      displaypicture,
      userRole,
    });

    return res
      .status(200)
      .json({
        Action: "Sign Up",
        Action_Status: "Success",
        Response: {
          username: user.username,
          email: user.email,
        },
      })
      .end();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      Action: "Sign Up",
      Action_Status: "Sign Up FAILED - Something went wrong!",
    });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        Action: "Login",
        Action_Status: "Login Failed - Please pass credentials",
      });
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password +authentication.sessionToken"
    );

    if (!user) {
      return res.status(404).json({
        Action: "Login",
        Action_Status: "Login Failed - User not found. Please register",
      });
    }

    if (!user.authentication?.salt) {
      return res.status(400).json({
        Action: "Login",
        Action_Status: "Login Failed - Authentication Failed",
      });
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (expectedHash !== user.authentication.password) {
      return res.status(403).json({
        Action: "Login",
        Action_Status: "Login Failed - Please check your password",
      });
    }

    const salt = random();
    user.authentication.sessionToken.push(
      authentication(salt, user._id.toString())
    );
    await user.save();

    return res.status(200).json({
      Action: "Login",
      Action_Status: "Success",
      response: {
        id: user.id,
        email: user.email,
        username: user.username,
        sessionToken: user.authentication.sessionToken.at(-1),
        userRole: user.userRole,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      Action: "Login",
      Actions_Status: " Login Failed - Something went wrong",
    });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    const { email, sessionToken } = req.body;
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password +authentication.sessionToken"
    );
    if (!user) {
      return res.status(404).json({
        Action: "Logout",
        Action_Status: "Logout Failed - User not found",
      });
    }

    if (!user?.authentication?.sessionToken.includes(sessionToken)) {
      return res.status(403).json({
        Action: "Logout",
        Action_Status:
          "Logout Failed - Authentication failed or user already logged out",
      });
    }

    user.authentication.sessionToken = user.authentication.sessionToken.filter(
      (token) => token !== sessionToken
    );
    user.save();

    return res.status(200).json({
      Action: "Logout",
      Action_Status: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      Action: "Logout",
      Action_Status: "Logout Failed - Something went wrong",
    });
  }
};
