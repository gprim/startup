import * as express from "express";
import { AsyncMiddleWare } from "./ApiTypes";
import { UserDao } from "../dao";
import { UnauthorizedError } from "../authorization";

export const messages = express.Router();

const errorHandler = (middleWare: AsyncMiddleWare): AsyncMiddleWare => {
  return async (req, res, next) => {
    try {
      await middleWare(req, res, next);
    } catch (err) {
      if (next) next(err);
    }
  };
};

// create a convo with another user
messages.post(
  "/convo/:username",
  errorHandler(async (req, res) => {
    const token = req.cookies?.authorization;

    const user1 = (await UserDao.getInstance().getUserFromToken(token))
      ?.username;
    const user2 = req.params.username;

    if (!user1) throw new UnauthorizedError();

    const convoId = await UserDao.getInstance().createConvo([user1, user2]);

    res.send(convoId);
  }),
);

// search for other users
messages.get(
  "/users/:search",
  errorHandler(async (req, res) => {
    res.send(await UserDao.getInstance().getUsernames(req.params.search));
  }),
);

// get all convos associated with the user
messages.get(
  "/convo",
  errorHandler(async (req, res) => {
    const token = req.cookies?.authorization;

    const username = (await UserDao.getInstance().getUserFromToken(token))
      ?.username;

    if (!username) throw new UnauthorizedError();

    const now = Date.now();

    const convos = await UserDao.getInstance().getUserConvos(username, [
      0,
      now,
    ]);

    res.send(convos);
  }),
);

// get messages from a convo
messages.get(
  "/:convoId",
  errorHandler(async (req, res) => {
    const convoId = req.params.convoId;
    const token = req.cookies?.authorization;

    const user = await UserDao.getInstance().getUserFromToken(token);

    if (!user) throw new UnauthorizedError();

    const now = Date.now();

    const messages = await UserDao.getInstance().getMessages(
      convoId,
      [0, now],
      user,
    );

    res.send(messages || []);
  }),
);
