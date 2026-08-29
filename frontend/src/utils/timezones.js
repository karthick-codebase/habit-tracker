export const POPULAR_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST, UTC+05:30)" },
  { value: "Asia/Dubai", label: "Dubai Time (GST, UTC+04:00)" },
  { value: "Asia/Singapore", label: "Singapore Time (UTC+08:00)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST, UTC+09:00)" },
  { value: "Asia/Seoul", label: "Korean Standard Time (KST, UTC+09:00)" },
  { value: "Europe/London", label: "London Time (GMT, UTC+00:00)" },
  { value: "Europe/Paris", label: "Paris Time (CET, UTC+01:00)" },
  { value: "Europe/Berlin", label: "Berlin Time (CET, UTC+01:00)" },
  { value: "Europe/Madrid", label: "Madrid Time (CET, UTC+01:00)" },
  { value: "Europe/Athens", label: "Athens Time (EET, UTC+02:00)" },
  {
    value: "Africa/Johannesburg",
    label: "Johannesburg Time (SAST, UTC+02:00)",
  },
  { value: "America/New_York", label: "New York Time (EST, UTC-05:00)" },
  { value: "America/Chicago", label: "Chicago Time (CST, UTC-06:00)" },
  { value: "America/Los_Angeles", label: "Los Angeles Time (PST, UTC-08:00)" },
  { value: "America/Mexico_City", label: "Mexico City Time (CST, UTC-06:00)" },
  { value: "America/Sao_Paulo", label: "São Paulo Time (BRT, UTC-03:00)" },
  { value: "Australia/Sydney", label: "Sydney Time (AEST, UTC+10:00)" },
  { value: "Pacific/Auckland", label: "Auckland Time (NZST, UTC+12:00)" },
];

export const formatTimezoneLabel = (timezone) => {
  if (!timezone) {
    return "Timezone unavailable";
  }

  const matchingZone = POPULAR_TIMEZONES.find(
    (zone) => zone.value === timezone,
  );

  if (matchingZone) {
    return matchingZone.label;
  }

  return timezone
    .replace(/_/g, " ")
    .replace(/\//g, " / ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getDefaultTimezone = () => {
  const detectedTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return POPULAR_TIMEZONES.some((zone) => zone.value === detectedTimezone)
    ? detectedTimezone
    : "UTC";
};

export default POPULAR_TIMEZONES;
