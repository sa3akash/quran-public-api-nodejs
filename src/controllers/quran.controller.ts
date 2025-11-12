import type { Request, Response } from "express";
import {
  getFallbackLanguage,
  getQuranFileName,
  loadQuranFromDisk,
} from "../utils/quran-utils";
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

  static async search(req: Request, res: Response) {
    const lang = getFallbackLanguage(req.query.lang as string);
    const query = req.query.q as string;

    if (!query || query.trim().length < 3) {
      throw new ServerError(
        "Search query must be at least 3 characters long.",
        400
      );
    }

    const { data } = await loadQuranFromDisk(lang);
    if (!data) {
      throw new ServerError("Failed to load Quran data", 500);
    }
    const searchResults = [];

    // Search through all surahs and verses
    for (const surah of data) {
      let matchingVerses = [];

      // Handle different file formats
      if (lang === "ar") {
        // Arabic file only has text
        matchingVerses = surah.verses.filter((verse: any) =>
          verse.text.includes(query)
        );
      } else if (lang === "transliteration") {
        // Transliteration file has transliteration field
        matchingVerses = surah.verses.filter(
          (verse: any) =>
            (verse.transliteration &&
              verse.transliteration
                .toLowerCase()
                .includes(query.toLowerCase())) ||
            verse.text.includes(query)
        );
      } else {
        // Translation files have translation field
        matchingVerses = surah.verses.filter(
          (verse: any) =>
            (verse.translation &&
              verse.translation.toLowerCase().includes(query.toLowerCase())) ||
            verse.text.includes(query)
        );
      }

      if (matchingVerses.length > 0) {
        searchResults.push({
          surah: {
            id: surah.id,
            name: surah.name,
            transliteration: surah.transliteration,
            translation: surah.translation,
          },
          verses: matchingVerses,
        });
      }
    }

    res.json({
      language: lang,
      query,
      results: searchResults,
      total: searchResults.reduce(
        (acc: number, curr: any) => acc + curr.verses.length,
        0
      ),
    });
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
