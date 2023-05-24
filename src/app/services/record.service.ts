import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  // prettier-ignore
  records = signal<{
    sampleKey: string;
    timeMillis: number;
  }[]>([]);

  // Consider 'hasRecord' when 'records' not empty
  hasRecords: Signal<boolean> = computed(() => this.records().length > 0);

  // 1st and last timestamps
  startTime: WritableSignal<undefined | number> = signal(undefined);
  endTime: WritableSignal<undefined | number> = signal(undefined);

  // Consider 'isRecording' when 'startTime' is truthy and 'endTime' is falsy
  isRecording: Signal<boolean> = computed(() => !!this.startTime() && !this.endTime());

  /**
   * Cleaning all records and initializing timestamps
   */
  startRecord() {
    this.records.set([]);

    this.startTime.set(new Date().getTime());
    this.endTime.set(undefined);
  }

  /**
   * Add a record with a timestamp
   *
   * @param {string} sampleKey 'c2_sharp', 'd3', 'e4', 'f5', 'g6_sharp', etc...
   */
  addRecord(sampleKey: string) {
    this.records.update(records => [
      ...records,
      {
        sampleKey,
        timeMillis: new Date().getTime() - (this.startTime() as number)
      }
    ]);
  }

  /**
   * Timestamps cleaning
   */
  stopRecord() {
    this.startTime.set(undefined);
    this.endTime.set(new Date().getTime());
  }
}
