import * as express from "express";
import * as crypto from "node:crypto";
import { User } from "../authorization";
import { StatusCodes } from "./ApiTypes";

export const auth = express.Router();

const users: Record<string, User> = {};
const tokens: Record<string, string> = {};

const newToken = (user: User) => {
  const token = crypto.randomUUID();
  tokens[token] = user.username;
  return token;
};

// create an account, return auth token
auth.post("/", (req, res) => {
  const user = req.body as User;

  if (!user.username || !user.password || !user.email || users[user.username]) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  users[user.username] = user;

  res.send(newToken(user));
});

// login account, return auth token
auth.put("/", (req, res) => {
  const user = req.body as User;

  if (!user.username || !user.password) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  if (
    !users[user.username] ||
    users[user.username].password !== user.password
  ) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  res.send(newToken(user));
});

// logout auth token
auth.delete("/", (req, res) => {
  const token = req.headers.authorization;

  if (tokens[token]) delete tokens[token];

  res.sendStatus(StatusCodes.OK);
});
