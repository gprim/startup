import "dotenv/config";
import * as express from "express";
import * as path from "node:path";
import * as cookieParser from "cookie-parser";
import { api } from "./src-server";
import type { MiddleWare } from "./src-server";
import { StatusCodes } from "./src-server/routers";
import { UserDao } from "./src-server/dao";
import { BadRequestError, UnauthorizedError } from "./src-server/authorization";

(async () => {
  const app = express();
  const port = process.env.PORT || 4000;

  app.use(express.static("public"));
  app.use(express.json());
  app.use(cookieParser());

  const middlewareWrapper = (middleware: MiddleWare): MiddleWare => {
    return (req, res, next) => {
      const whitelist = ["/", "/bundle.js", "/favicon.ico", "/api/auth"];
      if (whitelist.includes(req.originalUrl)) return next();
      return middleware(req, res, next);
    };
  };

  const authMiddleware: MiddleWare = async (req, res, next) => {
    const token = req.cookies?.authorization;
    if (!token || !(await UserDao.getInstance().verifyToken(token))) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    return next();
  };

  const errorMiddleware = async (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ) => {
    if (err instanceof UnauthorizedError) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    } else if (err instanceof BadRequestError) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    console.error(err);

    res.sendStatus(StatusCodes.SERVER_ERROR);
  };

  app.use(middlewareWrapper(authMiddleware));

  app.use(errorMiddleware);

  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  app.use("/api", api);

  app.listen(port, () => console.log(`Listening on port ${port}`));
})();
