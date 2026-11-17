import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {loadFont} from '@remotion/google-fonts/LilitaOne';
import {COLORS, CONTENT} from './config';
import type {CapChunk} from './align';

const {fontFamily} = loadFont();
const INK = COLORS.ink;

type Props = {
  frame: number;
  fps: number;
  total: number;
  chunks: CapChunk[];
  flash: number;
};

export const Overlay: React.FC<Props> = ({frame, fps, total, chunks, flash}) => {
  const bIn = spring({frame, fps, config: {damping: 14}});
  const hIn = spring({frame: frame - 18, fps, config: {damping: 13}});

  // Ticker berjalan
  const ITEM = 1000;
  const items = CONTENT.ticker;
  const cycle = items.length * ITEM;
  const shift = (frame * 5) % cycle;
  const tickerItems = [...items, ...items, ...items];

  // Subtitle
  let cur = -1;
  for (let i = 0; i < chunks.length; i++) if (frame >= chunks[i].start) cur = i;
  const chunk = cur >= 0 && frame <= chunks[cur].end + 10 ? chunks[cur] : null;
  const chunkPop = chunk
    ? interpolate(frame - chunk.start, [0, 6], [0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const progress = Math.min(1, frame / Math.max(1, total - 1));

  const pill = (bg: string, color: string): React.CSSProperties => ({
    background: bg,
    color,
    fontFamily,
    fontSize: 44,
    padding: '10px 26px 6px',
    borderRadius: 18,
    border: `6px solid ${INK}`,
    boxShadow: `0 8px 0 ${INK}`,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    lineHeight: 1.1,
  });

  return (
    <AbsoluteFill style={{fontFamily}}>
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,5,40,0.55) 100%)',
        }}
      />

      {/* badge atas */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 50,
          display: 'flex',
          gap: 16,
          transform: `translateX(${(1 - bIn) * -800}px)`,
        }}
      >
        <div style={pill(COLORS.red, '#fff')}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              opacity: 0.5 + 0.5 * Math.sin(frame * 0.35),
            }}
          />
          {CONTENT.badge}
        </div>
        <div style={pill(COLORS.yellow, INK)}>{CONTENT.channel}</div>
      </div>

      {/* ticker */}
      <div
        style={{
          position: 'absolute',
          top: 262,
          left: 0,
          width: '100%',
          height: 70,
          background: INK,
          borderTop: `5px solid ${COLORS.cyan}`,
          borderBottom: `5px solid ${COLORS.cyan}`,
          overflow: 'hidden',
          opacity: bIn,
        }}
      >
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            transform: `translateX(${-shift}px)`,
            height: '100%',
            alignItems: 'center',
          }}
        >
          {tickerItems.map((txt, i) => (
            <div
              key={i}
              style={{
                width: ITEM,
                flexShrink: 0,
                textAlign: 'center',
                color: '#fff',
                fontSize: 36,
              }}
            >
              <span style={{color: COLORS.yellow}}>★ </span>
              {txt}
            </div>
          ))}
        </div>
      </div>

      {/* progress */}
      <div
        style={{
          position: 'absolute',
          top: 350,
          left: 50,
          width: 980,
          height: 12,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.25)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.pink})`,
          }}
        />
      </div>

      {/* subtitle */}
      {chunk && (
        <div
          style={{
            position: 'absolute',
            top: 1120,
            left: 60,
            width: 960,
            height: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0 24px',
            textAlign: 'center',
            transform: `scale(${chunkPop})`,
          }}
        >
          {chunk.words.map((w, i) => {
            const active = frame >= w.start && frame < w.end;
            const pop = active
              ? 1 + 0.3 * Math.max(0, 1 - (frame - w.start) / 6)
              : 1;
            return (
              <span
                key={i}
                style={{
                  fontSize: 88,
                  lineHeight: 1.1,
                  color: active ? COLORS.yellow : '#fff',
                  WebkitTextStroke: `12px ${INK}`,
                  paintOrder: 'stroke fill',
                  textShadow: `0 10px 0 ${INK}`,
                  transform: `scale(${pop})`,
                  display: 'inline-block',
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      )}

      {/* headline bawah */}
      <div
        style={{
          position: 'absolute',
          top: 1400,
          left: 50,
          width: 980,
          transform: `translateX(${(1 - hIn) * -1200}px)`,
        }}
      >
        <div
          style={{
            background: '#fff',
            color: INK,
            fontSize: 56,
            padding: '14px 28px 8px',
            borderRadius: 20,
            border: `6px solid ${INK}`,
            boxShadow: `0 10px 0 ${INK}`,
            lineHeight: 1.1,
          }}
        >
          {CONTENT.headline}
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 20,
            marginLeft: 30,
            background: COLORS.pink,
            color: '#fff',
            fontSize: 34,
            padding: '8px 22px 4px',
            borderRadius: 14,
            border: `5px solid ${INK}`,
            boxShadow: `0 6px 0 ${INK}`,
          }}
        >
          {CONTENT.subheadline}
        </div>
      </div>

      {/* kilatan saat ganti kamera */}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
