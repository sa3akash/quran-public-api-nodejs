import { Router } from "express";
import { QuranController } from "../controllers/quran.controller";

class QuranRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get("/", QuranController.getQuran);
    return this.router;
  }
}

export const quranRouter = new QuranRouter();