import { RequestHandler } from "express";
import { DIContainer } from "./di";

// POST /upload
export const handleUpload: (container: DIContainer) => RequestHandler =
  (container: DIContainer) => (req, res) => {
    const dbClient = container.postgresClient;

    if (req.file)
      dbClient.query("INSERT INTO uploads (filename) VALUES ($1)", [
        req.file.filename,
      ]);

    res.sendStatus(200);
  };
