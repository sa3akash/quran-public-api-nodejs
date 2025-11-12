
# Quran Public API (Node.js)

A small, file-backed REST API that serves the Quran text, translations, transliteration and simple audio links. The project loads JSON files from `src/utils/quran` and exposes a few read-only endpoints under `/api/quran` for listing surahs, fetching a surah or verse, searching text, and listing supported languages.

This README documents how to run the project locally, the available endpoints, example responses and useful notes about the language files.

## Features

- Serve list of surahs with basic metadata
- Fetch a full surah or a single verse (with simple audio links)
- Search verses (translation/transliteration/text)
- List available languages
- Lightweight, no external DB — data comes from JSON files in the repo

## Quick start

Prerequisites:

- Node.js (>= 18 recommended)
- npm (comes with Node)

Clone and install:

```bash
git clone https://github.com/sa3akash/quran-public-api-nodejs.git
cd quran-public-api-nodejs
npm install
```

Run in development (uses `nodemon` + TS):

```bash
npm run dev
```

Build and run compiled code:

```bash
npm run build
npm start
```

By default the server listens on port 3000 (see `src/config.ts`). You can override with the `PORT` environment variable:

```bash
PORT=4000 npm run dev
```

## Health check

GET /api/health

Response example:

```json
{
	"status": "OK",
	"timestamp": "2025-11-12T00:00:00.000Z",
	"uptime": 123.45,
	"ip": "::1"
}
```

## API Endpoints

Base path for Quran endpoints: `/api/quran`

- GET `/api/quran`
	- Description: Returns a list of surahs with metadata and the selected language.
	- Query params:
		- `lang` (optional) — language code (defaults to fallback: `en` or `ar` depending on availability)
	- Example:

```bash
curl 'http://localhost:3000/api/quran?lang=en'
```

- GET `/api/quran/languages`
	- Description: Returns an array of supported languages (code, name, nativeName, direction).
	- Example:

```bash
curl 'http://localhost:3000/api/quran/languages'
```

- GET `/api/quran/surah/:id`
	- Description: Return the full surah (with verses) for the given surah `id` (1–114).
	- Path params: `id` — surah id (1..114)
	- Query params: `lang` (optional)
	- Example:

```bash
curl 'http://localhost:3000/api/quran/surah/1?lang=en'
```

- GET `/api/quran/surah/:id/verse/:verseid`
	- Description: Return a single verse (and simple audio links) for the given surah and verse id.
	- Path params: `id` (surah), `verseid` (verse number)
	- Query params: `lang` (optional)
	- Example:

```bash
curl 'http://localhost:3000/api/quran/surah/1/verse/1?lang=ar'
```

- GET `/api/quran/search`
	- Description: Search verses by text, translation, or transliteration depending on `lang`.
	- Query params:
		- `q` — search query (required, minimum length 3)
		- `lang` (optional)
	- Example:

```bash
curl "'http://localhost:3000/api/quran/search?q=mercy&lang=en'"
```

Note: search requires at least 3 characters, otherwise a 400 error is returned.

## Language codes

The API supports several language files included under `src/utils/quran/*.json`. The supported codes (as present in the code) include:

- ar (Arabic)
- bn (Bengali)
- en (English)
- es (Spanish)
- fr (French)
- id (Indonesian)
- ru (Russian)
- sv (Swedish)
- tr (Turkish)
- ur (Urdu)
- zh (Chinese)
- transliteration (transliteration)

If a requested language file does not exist, the server falls back to `en`, then `ar`, then `bn`, and finally `en` as a last resort.

## Data files

The project ships JSON files in `src/utils/quran/` such as `quran.json` (Arabic), `quran_en.json`, `quran_bn.json`, `quran_transliteration.json`, etc. Those files contain the surah and verse data consumed by the API.

If you want to add a new language, add `quran_<code>.json` to that folder and ensure the language code is handled (or add it to `LANGUAGE_MAP` in `src/utils/quran-utils.ts`).

## Response structure (examples)

- GET `/api/quran` (list summary)

```json
{
	"language": "en",
	"available_languages": [ { "code": "en", "name": "English", "nativeName":"English", "direction":"ltr" }, ... ],
	"surahs": [
		{ "id": 1, "name": "Al-Faatihah", "transliteration": "Al-Fatihah", "translation": "The Opening", "type":"Meccan", "total_verses":7 },
		...
	]
}
```

- GET `/api/quran/surah/1`

```json
{
	"language": "en",
	"id": 1,
	"name": "Al-Faatihah",
	"transliteration": "Al-Fatihah",
	"translation": "The Opening",
	"type": "Meccan",
	"total_verses": 7,
	"verses": [
		{ "id": 1, "text": "In the name of Allah...", "translation":"In the name of Allah..." },
		...
	],
	"audio": { /* simple per-reciter links */ }
}
```

Errors are returned using the project's global error handler (see `error-express`) and will include an HTTP status code and message (e.g., 400 for bad request, 404 for not found).

## Notes & caveats

- Search behavior differs slightly depending on language (Arabic files contain only `text`, translation files contain `translation`, and transliteration file contains `transliteration`).
- Audio links are generated as simple URLs pointing to external servers (third-party hosts) and are not hosted by this project.
- This project is read-only and file-backed; changes to JSON files on disk will be picked up by a simple mtime-based cache invalidation implemented in `src/utils/quran-utils.ts`.

## Contributing

Feel free to open issues or PRs. For adding languages:

1. Add `quran_<code>.json` to `src/utils/quran`
2. (Optional) Add the language code to `LANGUAGE_MAP` in `src/utils/quran-utils.ts` with its display name and direction.

## License

This repository does not include an explicit license file. Add a LICENSE file if you want to set licensing terms.

## Developer / Maintainer

- Name: Shakil Ahmed
- GitHub: https://github.com/sa3akash

## Contact

For questions or support, open an issue in the repository or contact the maintainer on GitHub: https://github.com/sa3akash


