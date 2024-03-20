import "dotenv/config";
import * as express from "express";
import * as path from "node:path";
import * as cookieParser from "cookie-parser";
import { api } from "./src-server";
import type { MiddleWare } from "./src-server";
import { StatusCodes } from "./src-server/routers";
import { UsersDao } from "./src-server/dao";
import { UsersMemoryDao } from "./src-server/dao/memory-dao/UsersMemoryDao";
import { TokensMemoryDao } from "./src-server/dao/memory-dao/TokensMemoryDao";

(async () => {
  const app = express();
  const port = process.env.PORT || 4000;

  new UsersDao(new UsersMemoryDao(), new TokensMemoryDao());

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
    if (!token || !(await UsersDao.getInstance().verifyToken(token))) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    return next();
  };

  app.use(middlewareWrapper(authMiddleware));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  app.use("/api", api);

  app.listen(port, () => console.log(`Listening on port ${port}`));
})();
