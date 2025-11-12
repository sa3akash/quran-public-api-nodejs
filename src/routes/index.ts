import type { Application } from "express";
import { healthRouter } from "./health.routers";
import { quranRouter } from "./quran.routers";


export const mainRouter = (app:Application) => {
    app.use("/api",healthRouter.initializeRoutes())
    app.use("/api",quranRouter.initializeRoutes())
}