// // src/i18n.ts
// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";

// /**
//  * Minimal i18n shim:
//  * - Provides a readable fallback for missing keys by humanizing the key string.
//  * - Keeps react-i18next hooks usable across the app (so you don't need to change all components now).
//  * - If you later remove i18n entirely, you'll need to replace usages of `t()` / useTranslation().
//  */

// i18n
//   .use(initReactI18next)
//   .init({
//     lng: "en",
//     resources: { en: { translation: {} } }, // empty resource; we use parseMissingKeyHandler
//     interpolation: { escapeValue: false },
//     // When a key is missing, convert it into a readable fallback.
//     parseMissingKeyHandler: (key: string) => {
//       // Replace dots with spaces and split camelCase into words:
//       const withSpaces = key.replace(/\./g, " ");
//       const splitCamel = withSpaces.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
//       // Capitalize first letter of each word (optional):
//       return splitCamel
//         .split(" ")
//         .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
//         .join(" ");
//     },
//   });

// export default i18n;
