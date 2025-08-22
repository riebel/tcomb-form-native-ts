import { mergeDatePart, mergeTimePart } from './dateUtils';

export type PickerMode = 'date' | 'time' | 'datetime';
export type PickerStage = 'date' | 'time' | null;

interface HandleChangeArgs {
  mode: PickerMode;
  stage: PickerStage;
  date: Date;
  selectedDate?: Date;
  onMerged: (d: Date) => void;
  setDate: (d: Date) => void;
  setStage: (s: PickerStage) => void;
  close: () => void;
}

// Shared core for iOS/Android DateTime change logic.
export function handleDateChangeCore({
  mode,
  stage,
  date,
  selectedDate,
  onMerged,
  setDate,
  setStage,
  close,
}: HandleChangeArgs): void {
  if (mode === 'datetime') {
    if (stage === 'date' && selectedDate) {
      const next = mergeDatePart(date, selectedDate);
      setDate(next);
      setStage('time');
      return;
    }
    if (stage === 'time' && selectedDate) {
      const merged = mergeTimePart(date, selectedDate);
      setDate(merged);
      onMerged(merged);
    }
    close();
    return;
  }

  if (selectedDate) {
    setDate(selectedDate);
    onMerged(selectedDate);
  }
  close();
}
