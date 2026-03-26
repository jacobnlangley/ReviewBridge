const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDayDelta(endAt: Date | null, now = new Date()) {
  if (!endAt) {
    return null;
  }

  const diffMs = endAt.getTime() - now.getTime();
  const diffDays = diffMs / MS_PER_DAY;

  return diffDays >= 0 ? Math.ceil(diffDays) : Math.floor(diffDays);
}
