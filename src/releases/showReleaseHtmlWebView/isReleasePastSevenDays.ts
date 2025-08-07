export function isReleasePastSevenDays(
  releaseDate: Date,
  currentDate: Date = new Date(),
): boolean {
  const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  const releaseTime = releaseDate.getTime();
  const currentTime = currentDate.getTime();

  return currentTime - releaseTime >= sevenDaysInMilliseconds;
}
