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
auth.post("/", async (req, res, next) => {
  const user = req.body as User;

  if (!user.username || !user.password || !user.email) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  if (await UserDao.getInstance().getUser(user.username)) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  try {
    await UserDao.getInstance().addUser(user);
  } catch (err) {
    next(err);
    return;
  }

  await newToken(user, res);

  res.sendStatus(StatusCodes.OK);
});

// login account, return auth token
auth.put("/", async (req, res) => {
  const user = req.body as User;

  if (!user || !user.username || !user.password) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  if (!(await UserDao.getInstance().verifyUser(user))) {
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
