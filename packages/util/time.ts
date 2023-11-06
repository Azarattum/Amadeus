/**
 * Formats the date into a relative or absolute string representation
 * @param date Date to format
 */
export function format(date: number | Date, relative = false) {
  if (!relative) {
    date = Math.round(+date);
    if (date <= 0) date = 0;
    const hours = ~~(date / 3600);
    date -= hours * 3600;
    const minutes = ~~(date / 60);
    date -= minutes * 60;
    const seconds = date;

    const pad = (x: number) => x.toString().padStart(2, "0");
    if (hours) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    return `${minutes}:${pad(seconds)}`;
  }

  const intl = new Intl.RelativeTimeFormat("en");

  const seconds = Math.floor((Date.now() - +date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds <= 1) return "just now";
  if (seconds < 60) return intl.format(-seconds, "seconds");
  if (minutes < 60) return intl.format(-minutes, "minutes");
  if (hours < 24) return intl.format(-hours, "hours");
  return intl.format(-days, "days");
}

/**
 * Returns string representation of the way the date is compared to the present
 * @param date Date to compare against
 */
export function compare(date: Date) {
  const now = new Date();
  if (+date > +now) return "In The Future";
  if (date.getFullYear() === now.getFullYear()) {
    if (date.getMonth() === now.getMonth()) {
      if (now.getDate() - date.getDate() === 0) return "Today";
      if (now.getDate() - date.getDate() === 1) return "Yesterday";
      if (now.getDate() - date.getDate() < 7 && now.getDay() > date.getDay()) {
        return "This Week";
      }
      if (
        now.getDate() - date.getDate() < 7 ||
        (now.getDate() - date.getDate() < 14 && now.getDay() >= date.getDay())
      ) {
        return "Last Week";
      }
      return "This Month";
    }
    if (now.getMonth() - date.getMonth() === 1) return "Last Month";
    return `In ${date.toLocaleString("default", { month: "long" })}`;
  }
  return date.getFullYear().toString();
}
