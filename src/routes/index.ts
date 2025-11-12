import type { Application } from "express";
import { healthRouter } from "./health.routers";
import { quranRouter } from "./quran.routers";
import { languageRouter } from "./language.routers";


export const mainRouter = (app:Application) => {
    app.use("/api/quran",languageRouter.initializeRoutes())
    app.use("/api/quran",quranRouter.initializeRoutes())
    app.use("/api",healthRouter.initializeRoutes())
}