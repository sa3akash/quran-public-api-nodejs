import { Router } from "express";
import { LanguagesController } from "../controllers/language.controller";

class LanguageRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get("/languages", LanguagesController.getLanguages);
    return this.router;
  }
}

export const languageRouter = new LanguageRouter();