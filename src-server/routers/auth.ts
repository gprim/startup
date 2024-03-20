import * as express from "express";
import { User } from "../authorization";
import { StatusCodes } from "./ApiTypes";
import { UsersDao } from "../dao";

export const auth = express.Router();

const newToken = async (user: User, res: express.Response) => {
  const token = await UsersDao.getInstance().createToken(user.username);

  res.cookie("authorization", token, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
};

auth.get("/", async (req, res) => {
  const token = req.cookies?.authorization;

  if (!(await UsersDao.getInstance().verifyToken(token)))
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  else res.sendStatus(StatusCodes.OK);
});

// create an account, return auth token
auth.post("/", async (req, res) => {
  const user = req.body as User;

  if (!user.username || !user.password || !user.email) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  if (await UsersDao.getInstance().getUser(user.username)) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  await UsersDao.getInstance().addUser(user);

  await newToken(user, res);

  res.sendStatus(StatusCodes.OK);
});

// login account, return auth token
auth.put("/", async (req, res) => {
  const user = req.body as User;

  if (!user.username || !user.password) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const userStore = UsersDao.getInstance();

  const userFromStore = await userStore.getUser(user.username);

  if (!userFromStore || userFromStore.password !== user.password) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  await newToken(user, res);

  res.sendStatus(StatusCodes.OK);
});

// logout auth token
auth.delete("/", async (req, res) => {
  const token = req.cookies?.authorization;

  if (!(await UsersDao.getInstance().verifyToken(token))) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  await UsersDao.getInstance().deleteToken(token);

  res.sendStatus(StatusCodes.OK);
});
