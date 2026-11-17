// Menganalisis jeda bicara, memotong adegan kamera, dan menyelaraskan subtitle
export type Pause = {start: number; end: number; len: number};
export type CapWord = {text: string; start: number; end: number};
export type CapChunk = {words: CapWord[]; start: number; end: number};

const TH = 0.07;

export const analyse = (envelope: number[], fps: number) => {
  let first = envelope.findIndex((v) => v > TH);
  if (first < 0) first = 0;
  let last = envelope.length - 1;
  while (last > 0 && envelope[last] <= TH) last--;
  const minPause = Math.round(0.28 * fps);
  const pauses: Pause[] = [];
  let runStart = -1;
  for (let i = first; i <= last; i++) {
    if (envelope[i] <= TH) {
      if (runStart < 0) runStart = i;
    } else if (runStart >= 0) {
      const len = i - runStart;
      if (len >= minPause) pauses.push({start: runStart, end: i, len});
      runStart = -1;
    }
  }
  return {first, last: last + 1, pauses};
};

// Titik pergantian kamera: mengikuti jeda bicara, tidak terlalu rapat / jarang
export const buildCuts = (pauses: Pause[], total: number, fps: number): number[] => {
  const cuts = [0];
  const minGap = Math.round(2.6 * fps);
  const maxGap = Math.round(6 * fps);
  let last = 0;
  for (const p of pauses) {
    const c = p.end;
    if (c - last < minGap || total - c < 1.5 * fps) continue;
    while (c - last > maxGap) {
      last += Math.round((c - last) / 2);
      cuts.push(last);
    }
    cuts.push(c);
    last = c;
  }
  while (total - last > maxGap) {
    last += Math.round(maxGap * 0.8);
    cuts.push(last);
  }
  return cuts;
};

export const buildChunks = (script: string, envelope: number[], fps: number): CapChunk[] => {
  const clean = script.replace(/\s+/g, ' ').trim();
  if (!clean || envelope.length === 0) return [];
  const {first, last, pauses} = analyse(envelope, fps);
  const sentences = (clean.match(/[^.!?…]+[.!?…]*/g) || [clean])
    .map((s) => s.trim())
    .filter(Boolean);
  const n = sentences.length;
  const chars = sentences.map((s) => s.length);
  const totalChars = chars.reduce((a, b) => a + b, 0);

  const proportional = () => {
    const out: {start: number; end: number}[] = [];
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const s = first + ((last - first) * acc) / totalChars;
      acc += chars[i];
      const e = first + ((last - first) * acc) / totalChars;
      out.push({start: s, end: e});
    }
    return out;
  };

  let segs: {start: number; end: number}[] = [];
  if (n === 1) {
    segs = [{start: first, end: last}];
  } else if (pauses.length >= n - 1) {
    const chosen = [...pauses]
      .sort((a, b) => b.len - a.len)
      .slice(0, n - 1)
      .sort((a, b) => a.start - b.start);
    for (let i = 0; i < n; i++) {
      const s = i === 0 ? first : chosen[i - 1].end;
      const e = i === n - 1 ? last : chosen[i].start;
      segs.push({start: s, end: e});
    }
    // Cek kewajaran: kecepatan bicara tiap kalimat tidak boleh terlalu jauh beda
    const rates = segs.map((sg, i) => (sg.end - sg.start) / chars[i]);
    if (Math.max(...rates) / Math.min(...rates) > 2.4) segs = proportional();
  } else {
    segs = proportional();
  }

  const chunks: CapChunk[] = [];
  sentences.forEach((sentence, si) => {
    const tokens = sentence.split(' ').filter(Boolean);
    const weights = tokens.map((w) => w.length + (/[,;:]$/.test(w) ? 3 : 0));
    const totalW = weights.reduce((a, b) => a + b, 0) || 1;
    const {start, end} = segs[si];
    let acc = 0;
    const words: CapWord[] = tokens.map((text, i) => {
      const s = start + ((end - start) * acc) / totalW;
      acc += weights[i];
      const e = start + ((end - start) * acc) / totalW;
      return {text, start: Math.round(s), end: Math.round(e)};
    });
    let cur: CapWord[] = [];
    let curChars = 0;
    const flush = () => {
      if (cur.length) {
        chunks.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
      }
      cur = [];
      curChars = 0;
    };
    words.forEach((w) => {
      cur.push(w);
      curChars += w.text.length;
      if (cur.length >= 4 || curChars >= 22 || /[,;:.!?…]$/.test(w.text)) flush();
    });
    flush();
  });
  return chunks;
};
