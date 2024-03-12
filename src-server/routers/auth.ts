import * as express from "express";
import { User, Users } from "../authorization";
import { StatusCodes } from "./ApiTypes";

export const auth = express.Router();

const newToken = (user: User) => {
  const token = Users.getInstance().createToken(user.username);
  return token;
};

auth.get("/", (req, res) => {
  const token = req.headers.authorization;

  if (!Users.getInstance().verifyToken(token))
    res.send(StatusCodes.UNAUTHORIZED);
  else res.send(StatusCodes.OK);
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

  res.send(newToken(user));
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

  res.send(newToken(user));
});

// logout auth token
auth.delete("/", (req, res) => {
  const token = req.headers.authorization;

  if (!Users.getInstance().verifyToken(token)) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  Users.getInstance().deleteToken(token);

  res.sendStatus(StatusCodes.OK);
});
