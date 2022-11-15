/**
 * Makes the first letter of first/every word uppercase in a string
 * @param string String to capitalize
 * @param all Capitalize all the words
 */
export function capitalize(string: string, all = true) {
  if (all) return string.replace(/\b\w/g, (c) => c.toUpperCase());
  return string.replace(/\b\w/, (c) => c.toUpperCase());
}

/**
 * Removes all '@' and '-' prefixes from a string.
 *
 * For example `@some/prefix-data` -> `data`
 * @param string String to unprefix
 */
export function unprefix(string: string) {
  return string.replace(/(@(\w|-)*\/)|((\w|-)*-)/g, "");
}

/**
 * Offsets a string with respect to multiple lines
 * @param string String to offset
 * @param offset Offset size (in spaces)
 */
export function offset(string: string, offset = 4) {
  return string.replace(/^|\n/g, "$&" + " ".repeat(offset));
}

/**
 * Regex escape function. Makes a string safe to use in a regular expression
 * @param string String to escape
 */
export function rescape(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns the given word in it's plural form
 * @param word Word to change
 * @param count How many of this word
 */
export function plural(word: string, count?: number) {
  if (count === 1) return word;
  if (word.endsWith("s")) return word + "es";
  return word + "s";
}

/**
 * Splits the given text into space separated parts, respecting quotes
 * @param text Text to splits
 */
export function split(text: string) {
  return (text.trim().match(/(--\S+=)?"(\\"|[^"])*"|[^ "]+/g) || []).map((x) =>
    x.replace(/^"|"$/g, "").trim()
  );
}

/**
 * Creates an approximate relative date string representation
 * @param date Relative date
 */
export function format(date: Date) {
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
 * Finds the longest common prefix within given words
 * @param words Words to search in
 * @returns
 */
export function prefix(words: string[]) {
  if (!words[0] || words.length == 1) return words[0] || "";
  let i = 0;
  while (words[0][i] && words.every((w) => w[i] === words[0][i])) {
    i++;
  }

  return words[0].substring(0, i);
}
