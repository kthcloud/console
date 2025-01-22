export function getDaysLeftUntilStale(
  accessedAt: string | undefined
): number | false {
  if (!accessedAt) return false;

  const accessedDate = new Date(accessedAt);
  const staleDate = new Date(accessedDate);
  staleDate.setMonth(staleDate.getMonth() + 3);

  const today = new Date();
  const timeDifference = staleDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysLeft > 0 ? daysLeft : 0;
}

export function getStaleTimestamp(
  accessedAt: string | undefined
): number | false {
  if (!accessedAt) return false;

  const accessedDate = new Date(accessedAt);
  const staleDate = new Date(accessedDate);
  staleDate.setMonth(staleDate.getMonth() + 3);

  return staleDate.getTime();
}
