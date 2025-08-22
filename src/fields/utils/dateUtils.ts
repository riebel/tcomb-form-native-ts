export function mergeDatePart(base: Date, selected: Date): Date {
  const next = new Date(base);
  next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
  return next;
}

export function mergeTimePart(base: Date, selected: Date): Date {
  const next = new Date(base);
  next.setHours(
    selected.getHours(),
    selected.getMinutes(),
    selected.getSeconds(),
    selected.getMilliseconds(),
  );
  return next;
}
