import type { Request, Response } from "express";
import { getFallbackLanguage, getQuranFileName } from "../utils/quran-utils";
import fs from "fs/promises";
import path from "path";
import { ServerError } from "error-express";

// Simple per-language cache with mtime-based invalidation
type CacheEntry = {
  data: any;
  mtimeMs: number;
};

const QuranCache = new Map<string, CacheEntry>();

function makeCacheKey(lang: string): string {
  return `quran_${lang}`;
}

async function loadQuranFromDisk(
  lang: string
): Promise<{ data: any; mtimeMs: number }> {
  const fileName = getQuranFileName(lang);
  const filePath = path.join(__dirname, "..", "utils", "quran", fileName);
  const stat = await fs.stat(filePath);
  const raw = await fs.readFile(filePath);
  const data = JSON.parse(raw.toString());

  return { data, mtimeMs: stat.mtimeMs };
}

export class QuranController {
  static async getQuran(req: Request, res: Response) {
    const lang = getFallbackLanguage(req.query.lang as string);
    const fileName = getQuranFileName(lang);

    const cacheKey = makeCacheKey(fileName);

    const stat = await (async () => {
      const { fileName } = { fileName: getQuranFileName(lang) };
      const filePath = path.join(__dirname, "..", "utils", "quran", fileName);
      const s = await fs.stat(filePath);
      return s;
    })();

    const cached = QuranCache.get(cacheKey);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return res.json(cached.data);
    }

    // Cache miss or changed file: reload
    const { data, mtimeMs } = await loadQuranFromDisk(lang);
    QuranCache.set(cacheKey, { data, mtimeMs });
    res.json(data);
  }
  //   static async getQuran(req: Request, res: Response) {
  //     const lang = getFallbackLanguage(req.query.lang as string);
  //     const fileName = getQuranFileName(lang);

  //     const filePath = path.join(__dirname, "..", "utils", "quran", fileName);
  //     await fs.access(filePath, fs.constants.R_OK);

  //     res.setHeader("Content-Type", "application/json");
  //     const readStream = require("fs").createReadStream(filePath);
  //     readStream.on("error", (err: any) => {
  //       throw new ServerError("Failed to read Quran data file", 500);
  //     });
  //     readStream.pipe(res);
  //   }
}
