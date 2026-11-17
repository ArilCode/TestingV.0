import React from 'react';
import {Composition, staticFile} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import {getAudioData} from '@remotion/media-utils';
import {NewsVideo} from './NewsVideo';
import type {NewsProps} from './NewsVideo';
import {AUDIO_FILE, FPS, HEIGHT, WIDTH} from './config';
import {computeEnvelope} from './envelope';

// Durasi video dihitung otomatis dari file audio -> selalu pas
const calculateMetadata: CalculateMetadataFunction<NewsProps> = async ({props}) => {
  const audio = await getAudioData(staticFile(AUDIO_FILE));
  const durationInFrames = Math.ceil(audio.durationInSeconds * FPS);
  const envelope = computeEnvelope(
    audio.channelWaveforms[0],
    audio.sampleRate,
    FPS,
    durationInFrames,
  );
  return {durationInFrames, props: {...props, envelope}};
};

export const Root: React.FC = () => (
  <Composition
    id="Berita"
    component={NewsVideo}
    durationInFrames={1800}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{envelope: [] as number[]}}
    calculateMetadata={calculateMetadata}
  />
);
