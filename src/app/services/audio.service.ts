import { Injectable, signal, computed } from '@angular/core';

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
  effects = signal<Record<string, HTMLAudioElement>>({});

  constructor() {
    // Initialize all audio tracks
    for (let idx = 2; idx <= 6; idx++) {
      Object.values(KEY_MAP).forEach(getKey => {
        const key = getKey(idx);

        this.effects.mutate(effects => {
          effects[key] = new Audio(`assets/effects/${key}.mp3`);
        });
      });
    }
  }

  playEffect(key: string) {
    const effect = this.effects()[key];

    try {
      // Stop previous audio
      effect.pause();
      effect.currentTime = 0;
      // Play audio (again)
      effect.play();
    } catch {
      console.log('Unable to play effect...');
    }
  }
}
