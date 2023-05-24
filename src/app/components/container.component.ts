import { Component, HostListener, Signal, computed, signal } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { RecordService } from '../services/record.service';

@Component({
  selector: 'pp-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent {
  selectedRange = signal(4);
  withKeys = signal(false);

  // Preserve all timers to be able to stop them later
  playingTimers = signal<number[]>([]);

  recordingTime = signal(0);
  playingTime = signal(0);

  recordingInterval: undefined | number = undefined;
  playingInterval: undefined | number = undefined;

  // Consider 'isPlaying' when 'playingTime' is greater than zero
  isPlaying: Signal<boolean> = computed(() => this.playingTime() > 0);

  // Map the 'signal' from constructor...
  hasRecords!: Signal<boolean>;

  constructor(private recordService: RecordService, private audioService: AudioService) {
    this.hasRecords = recordService.hasRecords;
  }

  // ... Or refer to the 'signal' from a method
  isRecording() {
    return this.recordService.isRecording();
  }

  toggleRecord() {
    if (this.recordService.isRecording()) {
      clearInterval(this.recordingInterval);
      this.recordService.stopRecord();
    } else {
      this.stopAllSamples();

      // Initialize 'recordingTime'
      this.recordingTime.set(0);
      const now = new Date().getTime();

      this.recordingInterval = setInterval(() => {
        // Refresh the time every 100 millis
        this.recordingTime.set(new Date().getTime() - now);
      }, 100);

      this.recordService.startRecord();
    }
  }

  /**
   * convert 'recordingTime' millis to seconds with only 1 decimal
   *
   * @returns {string} Time in seconds
   */
  getRecordingTime(): string {
    return (this.recordingTime() / 1000).toFixed(1);
  }

  /**
   * Convert 'playingTime' millis to seconds with 1 decimal
   *
   * @returns {string} Time in seconds
   */
  getPlayingTime(): string {
    return (this.playingTime() / 1000).toFixed(1);
  }

  /**
   *
   * @param event { key }
   */
  @HostListener('document:keydown.escape', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    this.toggleRecord();
  }

  playAllSamples() {
    // Initialize 'playingTime'
    this.playingTime.set(0);
    const now = new Date().getTime();

    this.playingInterval = setInterval(() => {
      // Refresh the time every 100 millis
      this.playingTime.set(new Date().getTime() - now);
    }, 100);

    const firstTimer = setTimeout(() => {
      // Reset the time interval, which means that the app doesn't play samples
      this.playingTime.set(0);
      clearInterval(this.playingInterval);

      // Clear the 1st timer and erase it from list, at the end
      this.playingTimers.update(timers => timers.filter(t => t !== firstTimer));
      clearTimeout(firstTimer);
    }, this.recordingTime());

    // Add 1st timer ID to the list
    this.playingTimers.update(timers => [...timers, firstTimer]);

    this.recordService.records().forEach(record => {
      const timer = setTimeout(() => {
        const element = document.getElementById(record.sampleKey);

        // Simulate click by focusing button element
        if (element) element.focus();
        this.audioService.playSample(record.sampleKey);

        // Clear only one timer (the current one) and erase it from list
        this.playingTimers.update(timers => timers.filter(t => t !== timer));

        clearTimeout(timer);
      }, record.timeMillis);

      // Add timer ID to the list
      this.playingTimers.update(timers => [...timers, timer]);
    });
  }

  stopAllSamples() {
    // Reset the time interval, which means that the app doesn't play samples
    this.playingTime.set(0);
    clearInterval(this.playingInterval);

    // Clear all timers, and wipe list
    this.playingTimers().forEach(timer => clearTimeout(timer));
    this.playingTimers.set([]);
  }

  setSelectedRange(event: Event) {
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
