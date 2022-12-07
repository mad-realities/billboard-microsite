export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
