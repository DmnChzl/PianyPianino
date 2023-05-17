import { Component, HostListener, computed, signal } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { RecordService } from '../services/record.service';

@Component({
  selector: 'pp-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent {
  allTimers = signal<number[]>([]);
  // consider playing if there are timers in the list
  isPlaying = computed(() => this.allTimers().length > 0);
  selectedRange = signal(4);
  withKeys = signal(false);

  constructor(private recordService: RecordService, private audioService: AudioService) {}

  isRecording() {
    return this.recordService.isRecording();
  }

  hasRecords() {
    return this.recordService.hasRecords();
  }

  toggleRecord() {
    if (this.recordService.isRecording()) {
      this.recordService.stopRecord();
    } else {
      this.recordService.startRecord();
    }
  }

  /**
   *
   * @param event { key }
   */
  @HostListener('document:keydown.escape', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    this.toggleRecord();
  }

  playAllRecords() {
    this.recordService.records().forEach(record => {
      const timer = setTimeout(() => {
        const element = document.getElementById(record.value);

        // Simulate click by focusing button element
        if (element) element.focus();
        this.audioService.playEffect(record.value);

        // clear only one timer (the current one) and erase it from list
        this.allTimers.update(timers => timers.filter(t => t !== timer));

        clearTimeout(timer);
      }, record.timestamp);

      // add timer id to the list
      this.allTimers.update(timers => [...timers, timer]);
    });
  }

  stopAllRecords() {
    // clear all timers, and wipe list
    this.allTimers().forEach(timer => clearTimeout(timer));
    this.allTimers.set([]);
  }

  setSelectedRange(event: any) {
    const value = +(event.target as HTMLInputElement).value;
    this.selectedRange.set(value);
  }

  toggleKeysOn() {
    this.withKeys.set(true);
  }

  toggleKeysOff() {
    this.withKeys.set(false);
  }

  toggleKeys() {
    this.withKeys.update(value => !value);
  }
}
