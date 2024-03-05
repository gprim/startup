import * as express from "express";

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
  if (args.some((arg, i) => arg.key == "--isDev" && (index = i))) {
    process.env.NODE_ENV = args[index].key;
  }

  const isProd = process.env.NODE_ENV === "prod";

  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.static("public"));
  app.use(express.json());

  const middlewareWrapper = (middleware: MiddleWare) => {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const whitelist = ["/", "/bundle.js", "/health", "/api/v1/auth/signIn"];
      if (whitelist.includes(req.originalUrl)) return next();
      return middleware(req, res, next);
    };
  };

  const authMiddleware: MiddleWare = (req, res) => {
    req;
  };
})();
