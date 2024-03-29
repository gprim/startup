import * as express from "express";
import { User } from "../authorization";
import { StatusCodes } from "./ApiTypes";
import { UserDao } from "../dao";

export const auth = express.Router();

const newToken = async (user: User, res: express.Response) => {
  const token = await UserDao.getInstance().createToken(user.username);

  res.cookie("authorization", token, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
};

auth.get("/", async (req, res) => {
  const token = req.cookies?.authorization;

  if (!(await UserDao.getInstance().verifyToken(token)))
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

  if (await UserDao.getInstance().getUser(user.username)) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  await UserDao.getInstance().addUser(user);

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

  const userStore = UserDao.getInstance();

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

  if (!(await UserDao.getInstance().verifyToken(token))) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  await UserDao.getInstance().deleteToken(token);

  res.sendStatus(StatusCodes.OK);
});
