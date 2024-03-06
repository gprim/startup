import * as express from "express";
import * as path from "node:path";

const getArgs = (args: string[]): { key: string; value: string }[] => {
  const toReturn = [];
  for (const arg in args) {
    if (arg.includes("--")) {
      if (arg.includes("=")) {
        const [key, value] = arg.split("=");
        toReturn.push({ key, value });
      }
    } else if (arg.includes("-")) {
    } else {
    }
  }

  return toReturn;
};

type MiddleWare = (
  req: express.Request,
  res: express.Response,
  next?: express.NextFunction
) => void;

(async () => {
  const args = getArgs(process.argv.slice(2));
  let index = -1;
  if (args.some((arg, i) => arg.key == "--isDev" && 1 + (index = i))) {
    process.env.NODE_ENV = args[index].key;
  }

  const users = {};
  const tokens = {};

  const isProd = process.env.NODE_ENV === "prod";

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
    if (!tokens[req.headers.authorization]) {
      res.sendStatus(400);
      return;
    }

    return next();
  };

  app.use(middlewareWrapper(authMiddleware));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  console.log(`Listening on port ${port}`);
  app.listen(port);
})();
