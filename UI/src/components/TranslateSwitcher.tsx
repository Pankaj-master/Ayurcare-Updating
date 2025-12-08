import React, { useEffect, useState } from "react";
import { translatePage } from "../utils/fullTranslate"; // <-- must exist

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "gu", label: "GU" },
  { code: "mr", label: "MR" },
  { code: "bn", label: "BN" },
  { code: "ta", label: "TA" },
  { code: "te", label: "TE" },
  { code: "kn", label: "KN" },
  { code: "ml", label: "ML" },
  { code: "pa", label: "PA" },
  { code: "ur", label: "UR" },
  { code: "or", label: "OR" },
  { code: "as", label: "AS" }
];

export default function TranslateSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("en");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);

  useEffect(() => {
    document.documentElement.dir = ["ar","he","ur"].includes(active) ? "rtl" : "ltr";
  }, [active]);

  const switchTo = async (lang: string) => {
    setOpen(false);
    if (lang === active) return;

    setLoading(true);
    setProgress([0,0]);

    try {
      if (lang === "en") {
        // go back to original English: full reload ensures react state is reset
        location.reload();
        return;
      }

      // call the backend-powered page translator
      await translatePage(lang, (done, total) => setProgress([done, total]));
      setActive(lang);
    } catch (err) {
      console.error("Translate failed:", err);
      alert("Translation failed. Check console and backend.");
    } finally {
      setLoading(false);
      setTimeout(()=>setProgress(null), 800);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block", minWidth: 80 }}>
      <button onClick={() => setOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer", fontWeight: 600 }}>
        <span>{active.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" tabIndex={-1} style={{ position: "absolute", right: 0, marginTop: 8, padding: 8, width: 140, maxHeight: 260, overflowY: "auto", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", background: "#fff", listStyle: "none", zIndex: 10010 }}>
          {LANGS.map(l => (
            <li key={l.code} style={{ marginBottom: 6 }}>
              <button onClick={() => switchTo(l.code)} style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, background: l.code === active ? "#0b74ff" : "transparent", color: l.code === active ? "#fff" : "#111", border: "none", cursor: "pointer", fontWeight: 600 }}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <div style={{ position: "absolute", right: 0, marginTop: 40, padding: 8, background: "#fff", borderRadius: 6, boxShadow:"0 6px 18px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Translating...</div>
          {progress && <div style={{ fontSize: 12 }}>{progress[0]} / {progress[1]}</div>}
        </div>
      )}
    </div>
  );
}