import { Injectable, signal } from '@angular/core';

const KEY_MAP: Record<string, (idx: number) => string> = {
  c: (idx: number) => `c${idx}`,
  cSharp: (idx: number) => `c${idx}_sharp`,
  d: (idx: number) => `d${idx}`,
  dSharp: (idx: number) => `d${idx}_sharp`,
  e: (idx: number) => `e${idx}`,
  f: (idx: number) => `f${idx}`,
  fSharp: (idx: number) => `f${idx}_sharp`,
  g: (idx: number) => `g${idx}`,
  gSharp: (idx: number) => `g${idx}_sharp`,
  a: (idx: number) => `a${idx}`,
  aSharp: (idx: number) => `a${idx}_sharp`,
  b: (idx: number) => `b${idx}`
};

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  samples = signal<Record<string, HTMLAudioElement>>({});

  constructor() {
    // Initialize all audio tracks
    for (let idx = 2; idx <= 6; idx++) {
      Object.values(KEY_MAP).forEach(getKey => {
        const key = getKey(idx);
        const audio = new Audio(`assets/samples/${key}.mp3`);

        this.samples.mutate(samples => {
          samples[key] = audio;
        });
      });
    }
  }

  /**
   * Play asynchronous sample
   *
   * @param {string} key 'c2_sharp', 'd3', 'e4', 'f5', 'g6_sharp', etc...
   */
  playSample(key: string): Promise<void> {
    const audioSample = this.samples()[key];

    try {
      // Stop previous audio
      audioSample.pause();
      audioSample.currentTime = 0;

      // Play audio (again)
      audioSample.play();

      return new Promise(resolve => {
        setTimeout(resolve, audioSample.duration * 1000);
      });
    } catch {
      console.log('Unable to play sample...');
      return Promise.reject(new Error('Unable to play sample...'));
    }
  }
}
