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
