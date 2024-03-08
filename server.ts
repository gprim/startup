import * as express from "express";
import * as path from "node:path";
import { api } from "./src-server";
import type { MiddleWare } from "./src-server";

(async () => {
  const app = express();
  const port = process.env.PORT || 4000;

  app.use(express.static("public"));
  app.use(express.json());

  const middlewareWrapper = (middleware: MiddleWare): MiddleWare => {
    return (req, res, next) => {
      const whitelist = ["/", "/bundle.js", "/favicon.ico"];
      if (whitelist.includes(req.originalUrl)) return next();
      return middleware(req, res, next);
    };
  };

  const authMiddleware: MiddleWare = (req, res, next) => {
    // if (false) {
    // 	res.sendStatus(400);
    // 	return;
    // }

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
