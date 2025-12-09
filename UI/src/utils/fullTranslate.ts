// care-main/UI/src/utils/fullTranslate.ts
type NodeMap = { node: Text; original: string };

// backend URL: either set VITE_TRANSLATE_API in .env (recommended) or default to /api/translate
const TRANSLATE_API_URL = (import.meta.env.VITE_TRANSLATE_API as string) || "/api/translate";

async function batchTranslateAPI(texts: string[], target = "hi") {
  const res = await fetch(TRANSLATE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target })
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error("Translate API error: " + res.status + " - " + txt);
  }

  const json = await res.json();
  // expected shape: { translations: string[] }
  if (json && Array.isArray(json.translations)) return json.translations as string[];
  // fallback if API returns array directly
  if (Array.isArray(json)) return json as string[];
  return texts.map(() => "");
}

function visibleTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      const txt = node.nodeValue.trim();
      if (!txt) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(tag)) return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(parent);
      if (style && (style.visibility === "hidden" || style.display === "none" || +style.opacity === 0)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes: NodeMap[] = [];
  let n;
  while ((n = walker.nextNode())) nodes.push({ node: n as Text, original: n.nodeValue || "" });
  return nodes;
}

export async function translatePage(targetLang = "hi", progressCb?: (done:number,total:number)=>void) {
  const nodes = visibleTextNodes();
  if (!nodes.length) return;
  const BATCH = 100; // backend can handle larger batches
  for (let i = 0; i < nodes.length; i += BATCH) {
    const slice = nodes.slice(i, i + BATCH);
    const texts = slice.map(s => s.original);
    try {
      const translated = await batchTranslateAPI(texts, targetLang);
      for (let k = 0; k < slice.length; k++) {
        if (translated[k]) slice[k].node.nodeValue = translated[k];
      }
    } catch (e) {
      console.error("translate batch failed", e);
    }
    if (progressCb) progressCb(Math.min(i + BATCH, nodes.length), nodes.length);
    // small delay to avoid spamming backend
    await new Promise(r => setTimeout(r, 150));
  }
}

// expose for quick testing from browser console:
// run: window.translatePage && window.translatePage('hi')
;(window as any).translatePage = translatePage;