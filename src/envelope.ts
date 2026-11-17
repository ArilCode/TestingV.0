// Mengubah audio menjadi "tingkat suara" per frame (0..1)
export const computeEnvelope = (
  samples: Float32Array,
  sampleRate: number,
  fps: number,
  frames: number,
): number[] => {
  const spf = sampleRate / fps;
  const raw: number[] = [];
  for (let f = 0; f < frames; f++) {
    const s = Math.floor(f * spf);
    const e = Math.min(samples.length, Math.floor((f + 1) * spf));
    let sum = 0;
    for (let i = s; i < e; i++) sum += samples[i] * samples[i];
    raw.push(e > s ? Math.sqrt(sum / (e - s)) : 0);
  }
  const sorted = [...raw].sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1;
  return raw.map((v) => Math.round(Math.min(1, v / ref) * 1000) / 1000);
};

export const smooth = (arr: number[], f: number, r = 1): number => {
  let sum = 0;
  let n = 0;
  for (let i = f - r; i <= f + r; i++) {
    if (i >= 0 && i < arr.length) {
      sum += arr[i];
      n++;
    }
  }
  return n ? sum / n : 0;
};
