const LANG_ALIASES: Record<string, string[]> = {
  english: ["english", "eng", "en", "dual"],
  italian: ["italian", "ita", "it"],
  french: ["french", "fre", "fra", "fr"],
  german: ["german", "ger", "deu", "de"],
  spanish: ["spanish", "spa", "es", "esp"],
  portuguese: ["portuguese", "por", "pt"],
  russian: ["russian", "rus", "ru"],
  japanese: ["japanese", "jpn", "jp", "ja"],
  korean: ["korean", "kor", "ko"],
  chinese: ["chinese", "chi", "zho", "zh"],
  mandarin: ["mandarin", "chi", "zho", "zh"],
  dutch: ["dutch", "dut", "nld", "nl"],
  swedish: ["swedish", "swe", "sv"],
  norwegian: ["norwegian", "nor", "no"],
  danish: ["danish", "dan", "da"],
  finnish: ["finnish", "fin", "fi"],
  polish: ["polish", "pol", "pl"],
  arabic: ["arabic", "ara", "ar"],
  hindi: ["hindi", "hin", "hi"],
  turkish: ["turkish", "tur", "tr"],
  hebrew: ["hebrew", "heb", "he"],
  greek: ["greek", "gre", "ell", "el"],
  czech: ["czech", "cze", "ces", "cs"],
  hungarian: ["hungarian", "hun", "hu"],
  romanian: ["romanian", "rum", "ron", "ro"],
  thai: ["thai", "tha", "th"],
  vietnamese: ["vietnamese", "vie", "vi"],
  indonesian: ["indonesian", "ind", "id"],
};

// Reverse index: any token → canonical
const CANONICAL = new Map<string, string>();
for (const [canon, aliases] of Object.entries(LANG_ALIASES)) {
  for (const a of aliases) CANONICAL.set(a.toLowerCase(), canon);
  CANONICAL.set(canon.toLowerCase(), canon);
}

export function canonicalLang(lang: string): string {
  const lc = lang.trim().toLowerCase();
  return CANONICAL.get(lc) ?? lc;
}

export function langMatches(wanted: string, streamLang: string): boolean {
  return canonicalLang(wanted) === canonicalLang(streamLang);
}
