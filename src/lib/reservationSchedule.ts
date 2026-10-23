type ScheduleValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateSchedule(
  date: string,
  time: string,
  timezone: string,
): ScheduleValidationResult {
  if (!date || !time) {
    return {
      valid: false,
      error: "Please choose a date and time.",
    };
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!dateMatch || !timeMatch) {
    return {
      valid: false,
      error: "Please choose a valid date and time.",
    };
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  const dateCheck = new Date(Date.UTC(year, month - 1, day));

  if (
    year < 2020 ||
    year > 2100 ||
    dateCheck.getUTCFullYear() !== year ||
    dateCheck.getUTCMonth() !== month - 1 ||
    dateCheck.getUTCDate() !== day
  ) {
    return {
      valid: false,
      error: "Please choose a valid date.",
    };
  }

  let formatter: Intl.DateTimeFormat;

  try {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      calendar: "gregory",
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    return {
      valid: false,
      error: "Please select a valid time zone.",
    };
  }

  function localParts(timestamp: number) {
    const parts = formatter.formatToParts(new Date(timestamp));

    const get = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);

    return {
      year: get("year"),
      month: get("month"),
      day: get("day"),
      hour: get("hour"),
      minute: get("minute"),
    };
  }

  const targetWallTime = Date.UTC(year, month - 1, day, hour, minute);

  // Find the UTC offsets near the requested date.
  // Checking both sides handles daylight-saving changes.
  const offsets = new Set<number>();

  for (let h = -36; h <= 36; h += 6) {
    const timestamp = targetWallTime + h * 60 * 60 * 1000;

    const parts = localParts(timestamp);

    const displayedAsUTC = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );

    offsets.add((displayedAsUTC - timestamp) / 60_000);
  }

  const matchingInstants: number[] = [];

  for (const offset of offsets) {
    const timestamp = targetWallTime - offset * 60_000;

    const parts = localParts(timestamp);

    if (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      parts.hour === hour &&
      parts.minute === minute
    ) {
      matchingInstants.push(timestamp);
    }
  }

  const uniqueInstants = [...new Set(matchingInstants)];

  // Example: 02:30 may not exist when clocks move forward.
  if (uniqueInstants.length === 0) {
    return {
      valid: false,
      error:
        "This time does not exist in the selected time zone. " +
        "Please choose another time.",
    };
  }

  // Example: 02:30 can occur twice when clocks move backward.
  // Ask the buyer to select an unambiguous time.
  if (uniqueInstants.length > 1) {
    return {
      valid: false,
      error:
        "This time occurs twice because of a clock change. " +
        "Please choose another time.",
    };
  }

  if (uniqueInstants[0] <= Date.now()) {
    return {
      valid: false,
      error:
        "The selected date and time have already passed " +
        "in your chosen time zone.",
    };
  }

  return { valid: true };
}
