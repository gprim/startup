import * as express from "express";
import { auth } from "./auth";
import { messages } from "./messages";

export const api = express.Router();

api.use("/auth", auth);
api.use("/messages", messages);
