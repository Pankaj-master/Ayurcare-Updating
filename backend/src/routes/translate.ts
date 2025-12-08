// care-main/backend/src/routes/translate.ts
import { Router, Request, Response } from "express";
import { v2 as TranslateV2 } from "@google-cloud/translate";

const router = Router();
const translate = new TranslateV2.Translate(); // correct v2 import

const cache = new Map<string, string>();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { texts, target } = req.body;
    if (!texts || !Array.isArray(texts) || !target) {
      return res.status(400).json({ error: "Invalid payload. Expect { texts: string[], target: 'hi' }" });
    }

    if (texts.length === 0) return res.json({ translations: [] });
    if (texts.length > 500) return res.status(400).json({ error: "Too many texts (max 500)" });

    const toTranslate: string[] = [];
    const result: string[] = new Array(texts.length);
    const indexMap: number[] = [];

    texts.forEach((t: string, idx: number) => {
      const key = `${target}|${t}`;
      if (cache.has(key)) {
        result[idx] = cache.get(key)!;
      } else {
        indexMap.push(idx);
        toTranslate.push(t);
      }
    });

    if (toTranslate.length > 0) {
      const [translations] = await translate.translate(toTranslate, target);
      const arr = Array.isArray(translations) ? translations : [translations];

      arr.forEach((translatedText, i) => {
        const origIndex = indexMap[i];
        result[origIndex] = translatedText;
        const cacheKey = `${target}|${toTranslate[i]}`;
        try { cache.set(cacheKey, translatedText); } catch (e) {}
      });
    }

    const finalResult = texts.map((_, i) => result[i] ?? texts[i]);
    return res.json({ translations: finalResult });
  } catch (error: any) {
    console.error("Translate route error:", error);
    return res.status(500).json({ error: error.message || "Translate failed" });
  }
});

export default router;