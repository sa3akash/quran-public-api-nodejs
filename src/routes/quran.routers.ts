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
    this.router.get("/search", QuranController.search);
    this.router.get("/languages", QuranController.getLanguages);
    this.router.get("/surah/:id/verse/:verseid", QuranController.getVerseById);
    this.router.get("/surah/:id", QuranController.getSurahById);

    return this.router;
  }
}

export const quranRouter = new QuranRouter();
