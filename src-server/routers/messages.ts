import * as express from "express";
import { User, Users } from "../authorization";
import { StatusCodes } from "./ApiTypes";

export const messages = express.Router();

type Message = { text: string; from: string };

const userMessages: Record<string, Record<string, Message[]>> = {};

const getMessages = (user1: User, user2: User) => {
  let username1: string, username2: string;

  if (user1.username < user2.username) {
    username1 = user1.username;
    username2 = user2.username;
  } else {
    username1 = user2.username;
    username2 = user1.username;
  }

  if (!userMessages[username1]) userMessages[username1] = {};
  if (!userMessages[username1][username2])
    userMessages[username1][username2] = [];

  return userMessages[username1][username2];
};

messages.get("/convo/:username", (req, res) => {
  const token = req.cookies.authorization;

  const user1 = Users.getInstance().getUserFromToken(token);
  const user2 = Users.getInstance().getUser(req.params.username);

  res.send(getMessages(user1, user2));
});

messages.post("/convo/:username", (req, res) => {
  const token = req.cookies.authorization;

  if (!req.body || !req.body.text) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const user1 = Users.getInstance().getUserFromToken(token);
  const user2 = Users.getInstance().getUser(req.params.username);

  getMessages(user1, user2).push({ text: req.body.text, from: user1.username });
  res.sendStatus(StatusCodes.OK);
});

messages.get("/users/:search", (req, res) => {
  res.send(Users.getInstance().getUsernames(req.params.search));
});
