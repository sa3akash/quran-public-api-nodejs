import type { Request, Response } from "express";
import {
  getAvailableLanguages,
  getFallbackLanguage,
  getQuranData,
  getQuranFileName,
  loadQuranFromDisk,
} from "../utils/quran-utils";
import fs from "fs/promises";
import path from "path";
import { ServerError } from "error-express";

export class QuranController {
  static async getQuran(req: Request, res: Response) {
    const lang = getFallbackLanguage(req.query.lang as string);

    const data = await getQuranData(lang);

    const surahList = data.map((surah: any) => ({
      id: surah.id,
      name: surah.name,
      transliteration: surah.transliteration,
      translation: surah.translation,
      type: surah.type,
      total_verses: surah.total_verses,
    }));

    const languages = getAvailableLanguages();

    res.json({
      language: lang,
      available_languages: languages,
      surahs: surahList,
    });
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

    const data = await getQuranData(lang);

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

  static async getLanguages(req: Request, res: Response) {
    const languages = getAvailableLanguages();
    res.json(languages);
  }

  static async getSurahById(req: Request, res: Response) {
    const lang = getFallbackLanguage(req.query.lang as string);
    const surahId = parseInt(req.params.id!, 10);

    if (isNaN(surahId) || surahId < 1 || surahId > 114) {
      throw new ServerError(
        "Invalid surah ID. Must be between 1 and 114.",
        400
      );
    }
    const data = await getQuranData(lang);

    const surah = data.find((s: any) => s.id === surahId);
    if (!surah) {
      throw new ServerError("Surah not found", 404);
    }

    const audioData = {
      "1": {
        reciter: "Mishary Rashid Al-Afasy",
        url: `https://server8.mp3quran.net/afs/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        originalUrl: `https://server8.mp3quran.net/afs/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        type: "complete_surah",
      },
      "2": {
        reciter: "Abu Bakr Al-Shatri",
        url: `https://server11.mp3quran.net/shatri/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        originalUrl: `https://server11.mp3quran.net/shatri/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        type: "complete_surah",
      },
      "3": {
        reciter: "Nasser Al-Qatami",
        url: `https://server6.mp3quran.net/qtm/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        originalUrl: `https://server6.mp3quran.net/qtm/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        type: "complete_surah",
      },
      "4": {
        reciter: "Yasser Al-Dosari",
        url: `https://server11.mp3quran.net/yasser/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        originalUrl: `https://server11.mp3quran.net/yasser/${surahId
          .toString()
          .padStart(3, "0")}.mp3`,
        type: "complete_surah",
      },
    };

    res.json({
      language: lang,
      audio: audioData,
      ...surah,
    });
  }

  static async getVerseById(req: Request, res: Response) {
    const lang = getFallbackLanguage(req.query.lang as string);
    const verseId = parseInt(req.params.verseid!, 10);
    const surahId = parseInt(req.params.id!, 10);
    if (isNaN(surahId) || surahId < 1 || surahId > 114) {
      throw new ServerError(
        "Invalid surah ID. Must be between 1 and 114.",
        400
      );
    }

    if (isNaN(verseId) || verseId < 1) {
      throw new ServerError(
        "Invalid verse ID. Must be a positive number.",
        400
      );
    }

    const data = await getQuranData(lang);

    const surah = data.find((s: any) => s.id === surahId);
    if (!surah) {
      throw new ServerError("Surah not found", 404);
    }

    // Find the requested verse
    const verse = surah.verses.find((v: any) => v.id === verseId);

    if (!verse) {
      throw new ServerError("Verse not found", 404);
    }
    // Add audio data for the specific verse
    const audioData = {
      "1": {
        reciter: "Mishary Rashid Al-Afasy",
        url: `https://everyayah.com/data/Alafasy_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        originalUrl: `https://everyayah.com/data/Alafasy_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        type: "single_verse",
      },
      "2": {
        reciter: "Abu Bakr Al-Shatri",
        url: `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        originalUrl: `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        type: "single_verse",
      },
      "3": {
        reciter: "Nasser Al-Qatami",
        url: `https://everyayah.com/data/Nasser_Alqatami_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        originalUrl: `https://everyayah.com/data/Nasser_Alqatami_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        type: "single_verse",
      },
      "4": {
        reciter: "Yasser Al-Dosari",
        url: `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        originalUrl: `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${surahId
          .toString()
          .padStart(3, "0")}${verseId.toString().padStart(3, "0")}.mp3`,
        type: "single_verse",
      },
    };

    res.json({
      language: lang,
      surah: {
        id: surah.id,
        name: surah.name,
        transliteration: surah.transliteration,
        translation: surah.translation,
      },
      verse,
      audio: audioData,
    });
  }
}
