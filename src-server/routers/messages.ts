import * as express from "express";
import { StatusCodes } from "./ApiTypes";
import { UserDao } from "../dao";

export const messages = express.Router();

// create a convo with another user
messages.post("/convo/:username", async (req, res) => {
  const token = req.cookies?.authorization;

  const user1 = (await UserDao.getInstance().getUserFromToken(token)).username;
  const user2 = req.params.username;

  const convoId = await UserDao.getInstance().createConvo([user1, user2]);

  res.send(convoId);
});

// search for other users
messages.get("/users/:search", async (req, res) => {
  res.send(await UserDao.getInstance().getUsernames(req.params.search));
});

// get all convos associated with the user
messages.get("/convo", async (req, res) => {
  const token = req.cookies?.authorization;

  const username = (await UserDao.getInstance().getUserFromToken(token))
    ?.username;

  const now = Date.now();

  const convos = await UserDao.getInstance().getUserConvos(username, [0, now]);

  res.send(convos);
});

// get messages from a convo
messages.get("/:convoId", async (req, res) => {
  const convoId = req.params.convoId;
  const token = req.cookies?.authorization;

  const user = await UserDao.getInstance().getUserFromToken(token);

  const now = Date.now();

  const messages = await UserDao.getInstance().getMessages(
    convoId,
    [0, now],
    user,
  );

  res.send(messages);
});

// send a message
messages.post("/:convoId", async (req, res) => {
  const token = req.cookies?.authorization;

  const convoId = req.params.convoId;

  if (!req.body || !req.body.text) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const user = await UserDao.getInstance().getUserFromToken(token);

  const now = Date.now();

  await UserDao.getInstance().addMessage(
    convoId,
    {
      text: req.body.text,
      from: user.username,
      timestamp: now,
    },
    user,
  );

  res.sendStatus(StatusCodes.OK);
});
