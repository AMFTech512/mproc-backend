import express from "express";
import { DIContainer } from "./di";
import Joi from "joi";
import multer from "multer";
import cors from "cors";
import { handleUpload, handleUserCreate } from "./handlers";
import packageJson from "../package.json";

interface ServerConfig {
  port: number;
}

function getServerConfig(): ServerConfig {
  return Joi.attempt(
    {
      port: process.env.SERVER_PORT,
    },
    Joi.object({
      port: Joi.number().required(),
    })
  );
}

export function initExpressApp(container: DIContainer) {
  const app = express();
  const config = getServerConfig();

  const upload = multer({
    dest: "./uploads",
  });

  app.use(cors());

  app.get("/", (req, res) => {
    res.send(`v${packageJson.version} - OK`);
  });

  app.post("/upload", upload.single("file"), handleUpload(container));

  app.post("/user", express.json(), handleUserCreate(container));

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });

  return app;
}
