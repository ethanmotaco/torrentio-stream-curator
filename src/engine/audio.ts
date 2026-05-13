const TABLE: Record<string, number> = {
  Atmos: 60,
  TrueHD: 50,
  "DTS-HD": 40,
  DTS: 30,
  AC3: 20,
  AAC: 10,
};

export function audioScore(audio: string | null): number {
  if (audio === null) return 0;
  return TABLE[audio] ?? 0;
}
