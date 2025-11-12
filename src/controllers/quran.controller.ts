import type { Request, Response } from "express";

export class QuranController {
  static getQuran(req: Request, res: Response) {
    const lang = req.query.lang || "en";

    
  }
}
