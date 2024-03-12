import * as express from "express";
import * as path from "node:path";
import { api } from "./src-server";
import type { MiddleWare } from "./src-server";
import { Users } from "./src-server/authorization";
import { StatusCodes } from "./src-server/routers";

(async () => {
  const app = express();
  const port = process.env.PORT || 4000;

  app.use(express.static("public"));
  app.use(express.json());

  const middlewareWrapper = (middleware: MiddleWare): MiddleWare => {
    return (req, res, next) => {
      const whitelist = ["/", "/bundle.js", "/favicon.ico", "/api/auth"];
      if (whitelist.includes(req.originalUrl)) return next();
      return middleware(req, res, next);
    };
  };

  const authMiddleware: MiddleWare = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !Users.getInstance().verifyToken(token)) {
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

  console.log(`Listening on port ${port}`);
  app.listen(port);
})();
