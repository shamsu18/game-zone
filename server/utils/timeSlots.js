// Time-slot helpers for booking availability.
// Times are handled as "HH:mm" 24-hour strings.

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const toHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Two intervals [aStart,aEnd) and [bStart,bEnd) overlap if start < otherEnd and otherStart < end
export const overlaps = (aStart, aEnd, bStart, bEnd) => {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
};

// Generate hourly slots between opening and closing (defaults 10:00–23:00)
export const generateHourlySlots = (open = '10:00', close = '23:00') => {
  const slots = [];
  for (let t = toMinutes(open); t + 60 <= toMinutes(close); t += 60) {
    slots.push({ startTime: toHHMM(t), endTime: toHHMM(t + 60) });
  }
  return slots;
};

// Given existing bookings for a station/day, return slots with availability flags.
export const buildAvailability = (existingBookings, open, close) => {
  const active = existingBookings.filter((b) => b.status !== 'cancelled');
  return generateHourlySlots(open, close).map((slot) => {
    const booked = active.some((b) =>
      overlaps(slot.startTime, slot.endTime, b.startTime, b.endTime)
    );
    return { ...slot, available: !booked };
  });
};
