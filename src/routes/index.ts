// src/routes/index.ts

import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const routes = Router();

routes.post("/register", AuthController.register);
routes.post("/login", AuthController.login);

export { routes };
