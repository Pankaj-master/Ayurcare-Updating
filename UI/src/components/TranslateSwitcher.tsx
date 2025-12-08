import React, { useEffect, useState } from "react";

const LANGS: { code: string; label: string }[] = [
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
  const [active, setActive] = useState(() => {
    const m = document.cookie.match(/(?:^|;)\s*googtrans=\/[a-z]{2}\/([a-z]{2})/);
    return m ? m[1] : "en";
  });

  useEffect(() => {
    document.documentElement.dir = ["ar", "he", "ur"].includes(active) ? "rtl" : "ltr";
  }, [active]);

  const switchTo = (lang: string) => {
    if (lang === active) { setOpen(false); return; }
    // @ts-ignore
    if (window.setGoogleTranslateCookie) {
      // @ts-ignore
      window.setGoogleTranslateCookie(lang);
    } else {
      document.cookie = "googtrans=/en/" + lang + ";path=/";
      location.reload();
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block", minWidth: 80 }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #e6e6e6",
          background: "#fff",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        <span>{active.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            padding: 8,
            width: 120,
            maxHeight: 260,
            overflowY: "auto",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            background: "#fff",
            listStyle: "none",
            zIndex: 10010
          }}
        >
          {LANGS.map(l => (
            <li key={l.code} style={{ marginBottom: 6 }}>
              <button
                onClick={() => switchTo(l.code)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 6,
                  background: l.code === active ? "#0b74ff" : "transparent",
                  color: l.code === active ? "#fff" : "#111",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
