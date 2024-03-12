import express from "express";

export type MiddleWare = (
  req: express.Request,
  res: express.Response,
  next?: express.NextFunction,
) => void;

export const enum StatusCodes {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  SERVER_ERROR = 500,
}
