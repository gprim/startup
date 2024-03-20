import * as express from "express";
import { User, Users } from "../authorization";
import { StatusCodes } from "./ApiTypes";

export const auth = express.Router();

const newToken = (user: User, res: express.Response) => {
  const token = Users.getInstance().createToken(user.username);

  res.cookie("authorization", token, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
};

auth.get("/", (req, res) => {
  const token = req.cookies?.authorization;

  if (!Users.getInstance().verifyToken(token))
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  else res.sendStatus(StatusCodes.OK);
});

// create an account, return auth token
auth.post("/", (req, res) => {
  const user = req.body as User;

  if (!user.username || !user.password || !user.email) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  if (Users.getInstance().getUser(user.username)) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  Users.getInstance().addUser(user);

  newToken(user, res);

  res.sendStatus(StatusCodes.OK);
});

// login account, return auth token
auth.put("/", (req, res) => {
  const user = req.body as User;

  if (!user.username || !user.password) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const userStore = Users.getInstance();

  if (
    !userStore.getUser(user.username) ||
    userStore.getUser(user.username).password !== user.password
  ) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  newToken(user, res);

  res.sendStatus(StatusCodes.OK);
});

// logout auth token
auth.delete("/", (req, res) => {
  const token = req.cookies?.authorization;

  if (!Users.getInstance().verifyToken(token)) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  Users.getInstance().deleteToken(token);

  res.sendStatus(StatusCodes.OK);
});
