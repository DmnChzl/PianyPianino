import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { RecordService } from '../services/record.service';

type SimpleChange<T> = {
  firstChange: boolean;
  previousValue: T;
  currentValue: T;
};

const KEYBOARD_MAP: Record<string, (idx: number) => string> = {
  q: (idx: number) => `c${idx}`,
  z: (idx: number) => `c${idx}_sharp`,
  s: (idx: number) => `d${idx}`,
  e: (idx: number) => `d${idx}_sharp`,
  d: (idx: number) => `e${idx}`,
  f: (idx: number) => `f${idx}`,
  t: (idx: number) => `f${idx}_sharp`,
  g: (idx: number) => `g${idx}`,
  y: (idx: number) => `g${idx}_sharp`,
  h: (idx: number) => `a${idx}`,
  u: (idx: number) => `a${idx}_sharp`,
  j: (idx: number) => `b${idx}`
};

@Component({
  selector: 'pp-keyboard',
  templateUrl: './keyboard.component.html'
})
export class BoardComponent implements OnInit, OnChanges {
  @Input() selectedRange!: number; // WritableSignal.value()
  @Input() withKeys!: boolean; // WritableSignal.value()

  displayedRanges = signal<number[]>([]);

  constructor(private audioService: AudioService, private recordService: RecordService) {}

  /**
   * Calculate 'displayedRanges' (depends on 'selectedRange')
   *
   * @param {number} innerWidth
   */
  calcRanges(innerWidth: number) {
    if (innerWidth >= 1280) {
      // XL screen, so display all ranges
      this.displayedRanges.set([2, 3, 4, 5, 6]);
    } else if (innerWidth < 1280 && innerWidth >= 1024) {
      // Large screen, so display a range of four
      const selectedRange = this.selectedRange;

      if (selectedRange <= 4) {
        this.displayedRanges.set([2, 3, 4, 5]);
      } else if (selectedRange > 4) {
        this.displayedRanges.set([3, 4, 5, 6]);
      } else {
        this.displayedRanges.set([selectedRange - 2, selectedRange - 1, selectedRange, selectedRange + 1]);
      }
    } else if (innerWidth < 1024 && innerWidth >= 768) {
      // Medium screen, so display a range of trhee
      const selectedRange = this.selectedRange;

      if (selectedRange <= 3) {
        this.displayedRanges.set([2, 3, 4]);
      } else if (selectedRange >= 5) {
        this.displayedRanges.set([4, 5, 6]);
      } else {
        this.displayedRanges.set([selectedRange - 1, selectedRange, selectedRange + 1]);
      }
    } else if (innerWidth < 768 && innerWidth >= 640) {
      // Small screen, so display a range of 2
      const selectedRange = this.selectedRange;

      if (selectedRange < 3) {
        this.displayedRanges.set([2, 3]);
      } else if (selectedRange > 5) {
        this.displayedRanges.set([5, 6]);
      } else {
        this.displayedRanges.set([selectedRange - 1, selectedRange]);
      }
    } else {
      // XS screen, so display the current range
      this.displayedRanges.set([this.selectedRange]);
    }
  }

  ngOnInit() {
    // Calculate display range at component did mount
    this.calcRanges(window.innerWidth);
  }

  ngOnChanges(changes: SimpleChanges) {
    const selectedRange: SimpleChange<number> = changes['selectedRange'];

    if (!selectedRange?.firstChange && selectedRange?.previousValue !== selectedRange?.currentValue) {
      // Calculate display range at component did update
      this.calcRanges(window.innerWidth);
    }
  }

  /**
   * @param event { target: { innerWidth } }
   */
  @HostListener('window:resize', ['$event'])
  onResizeHandler(event: UIEvent) {
    // Calculate display range when screen size changes
    this.calcRanges((event.target as Window).innerWidth);
  }

  /**
   * @param {string} key 'c2_sharp', 'd3', 'e4', 'f5', 'g6_sharp', etc...
   */
  play(key: string) {
    if (this.recordService.isRecording()) {
      this.recordService.addRecord(key);
    }

    this.audioService.playSample(key);
  }

  /**
   * @param event { key }
   */
  @HostListener('document:keypress', ['$event'])
  onKeyPressHandler(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const func = KEYBOARD_MAP[key];

    // 'func' maybe 'undefined', if the key isn't mapped...
    if (func) {
      const sampleKey = func(this.selectedRange);
      const element = document.getElementById(sampleKey);

      // Simulate click by focusing button element
      if (element) element.focus();
      this.play(sampleKey);
    }
  }
}
