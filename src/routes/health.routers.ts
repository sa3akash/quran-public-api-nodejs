import { Router } from "express";

class HealthRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        ip:
          req.ip ||
          req.headers["x-forwarded-for"] ||
          req.socket.remoteAddress ||
          "unknown",
      });
    });
    return this.router;
  }
}

export const healthRouter = new HealthRouter();