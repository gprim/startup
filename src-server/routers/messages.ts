import * as express from "express";
import { StatusCodes } from "./ApiTypes";
import { UsersDao } from "../dao";

export const messages = express.Router();

// create a convo with another user
messages.post("/convo/:username", async (req, res) => {
  const token = req.cookies?.authorization;

  const user1 = (await UsersDao.getInstance().getUserFromToken(token)).username;
  const user2 = req.params.username;

  const convoId = await UsersDao.getInstance().createConvo([user1, user2]);

  res.send(convoId);
});

// search for other users
messages.get("/users/:search", async (req, res) => {
  res.send(await UsersDao.getInstance().getUsernames(req.params.search));
});

// get all convos associated with the user
messages.get("/convo/:username", async (req, res) => {
  const token = req.cookies?.authorization;

  const user = await UsersDao.getInstance().getUserFromToken(token);

  const convos = await UsersDao.getInstance().getConvos({
    username: user.username,
    daterange: [0, new Date().getUTCMilliseconds()],
  });

  res.send(convos);
});

// get messages from a convo
messages.get("/:convoId", async (req, res) => {
  const convoId = req.params.convoId;
  const token = req.cookies?.authorization;

  const user = await UsersDao.getInstance().getUserFromToken(token);

  const messages = await UsersDao.getInstance().getMessages(
    {
      convoId,
      dateRange: [0, new Date().getUTCMilliseconds()],
    },
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

  const user = await UsersDao.getInstance().getUserFromToken(token);

  await UsersDao.getInstance().addMessage(
    {
      convoId,
      message: {
        text: req.body.text,
        from: user.username,
        timestamp: new Date().getUTCMilliseconds(),
      },
    },
    user,
  );

  res.sendStatus(StatusCodes.OK);
});
