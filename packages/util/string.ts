import { bright, black, reset } from "./color";

/**
 * Makes the first letter of first/every word uppercase in a string
 * @param string String to capitalize
 * @param all Capitalize all the words
 */
export function capitalize(string?: string, all = true) {
  if (!string) return string;
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
    x.replace(/^"|"$/g, "").trim(),
  );
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

/**
 * Normalizes and cleans given text
 * @param text Text to clean
 */
export function clean(text: string) {
  return text.normalize().trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Deduplicates identical lines with the specifies format
 * @param input Input text (multiline)
 * @param format Format function
 */
export function dedupe(
  input: string,
  format = (line: string, i: number) =>
    `${line} ${bright + black}(x${i})${reset}`,
) {
  const lines = input.split("\n");
  let count = 1;
  return (
    lines.slice(1).reduce((result, line, index) => {
      if (line === lines[index] && line.trim()) {
        count++;
        return result;
      }
      const formatted = count > 1 ? format(lines[index], count) : lines[index];
      count = 1;
      return `${result}${formatted}\n`;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    }, "") + (count > 1 ? format(lines.pop()!, count) : lines.pop())
  );
}

/**
 * Removes all the contents between parentheses in a string
 * @param string String to process
 */
export function unbrace(string: string) {
  let bracketCount = 0;
  let output = "";
  for (const letter of string) {
    if (letter === "(") bracketCount += 1;
    else if (letter === ")") bracketCount -= 1;
    else if (bracketCount === 0) output += letter;
  }
  return bracketCount === 0 ? output.trim() : "";
}
