import { Router } from "express";
import { mailController } from "../controllers/mail-controller.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({ data: { status: "ok" } });
});

apiRouter.get("/crypto/public-key", (request, response) => {
  mailController.getPublicKey(request, response);
});

apiRouter.post("/smtp/test", (request, response, next) => {
  void mailController.testSmtp(request, response, next);
});

apiRouter.post("/send", (request, response, next) => {
  void mailController.send(request, response, next);
});
