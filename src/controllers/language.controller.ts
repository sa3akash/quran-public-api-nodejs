import type { Request, Response } from "express";
import { getAvailableLanguages } from "../utils/quran-utils";

export class LanguagesController {
  static async getLanguages(req: Request, res: Response) {
    const languages = getAvailableLanguages();
    res.json(languages);
  }
}
