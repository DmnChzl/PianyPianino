import { Injectable, signal, computed } from '@angular/core';

type Record = {
  value: string;
  timestamp: number;
};

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  records = signal<Record[]>([]);
  // Consider 'hasRecord' when 'records' not empty
  hasRecords = computed(() => this.records().length > 0);
  startTime = signal(0);
  endTime = signal(0);
  // Consider 'isRecording' when 'startTime' is truthy and 'endTime' is falsy
  isRecording = computed(() => !!this.startTime() && !this.endTime());

  /**
   * Cleaning all records and initializing timestamps
   */
  startRecord() {
    this.records.set([]);
    this.startTime.set(new Date().getTime());
    this.endTime.set(0);
  }

  /**
   * Add a record with a timestamp
   *
   * @param {string} value
   */
  addRecord(value: string) {
    if (this.isRecording()) {
      this.records.update(records => [
        ...records,
        {
          value,
          timestamp: new Date().getTime() - this.startTime()
        }
      ]);
    }
  }

  /**
   * Timestamps cleaning
   */
  stopRecord() {
    this.startTime.set(0);
    this.endTime.set(new Date().getTime());
  }
}
