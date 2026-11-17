import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Studio} from './Studio';
import {Overlay} from './Overlay';
import {analyse, buildChunks, buildCuts} from './align';
import {smooth} from './envelope';
import {AUDIO_FILE, CONTENT} from './config';

export type NewsProps = {envelope: number[]};

export const NewsVideo: React.FC<NewsProps> = ({envelope}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();

  const cuts = useMemo(() => {
    const {pauses} = analyse(envelope, fps);
    return buildCuts(pauses, durationInFrames, fps);
  }, [envelope, fps, durationInFrames]);

  const chunks = useMemo(
    () => buildChunks(CONTENT.script, envelope, fps),
    [envelope, fps],
  );

  const level = smooth(envelope, frame, 1);
  const speaking = Math.min(1, smooth(envelope, frame, 12) * 2.2);

  let idx = 0;
  for (let i = 0; i < cuts.length; i++) if (frame >= cuts[i]) idx = i;
  const sinceCut = frame - cuts[idx];
  const flash = idx === 0 ? 0 : Math.max(0, 0.3 * (1 - sinceCut / 6));

  const t = frame / fps;

  return (
    <AbsoluteFill style={{backgroundColor: '#2a1b6e'}}>
      <Audio src={staticFile(AUDIO_FILE)} />

      {/* latar belakang */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${160 + Math.sin(t * 0.3) * 15}deg, #2a1b6e 0%, #5b2a9e 45%, #ff4f8b 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.4}deg at 50% 36%, rgba(255,255,255,0.08) 0deg 10deg, rgba(255,255,255,0) 10deg 20deg)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.14) 3px, transparent 3.5px)',
          backgroundSize: '36px 36px',
          backgroundPosition: `${frame * 0.6}px ${frame * 0.3}px`,
          opacity: 0.6,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 36%, rgba(255,255,255,0.28), rgba(255,255,255,0) 45%)',
          transform: `scale(${1 + level * 0.06})`,
        }}
      />

      <ThreeCanvas
        width={width}
        height={height}
        style={{position: 'absolute', top: 0, left: 0}}
        camera={{fov: 32, position: [0, 0.7, 11.5], near: 0.1, far: 100}}
      >
        <Studio frame={frame} fps={fps} level={level} speaking={speaking} cuts={cuts} />
      </ThreeCanvas>

      <Overlay
        frame={frame}
        fps={fps}
        total={durationInFrames}
        chunks={chunks}
        flash={flash}
      />
    </AbsoluteFill>
  );
};
