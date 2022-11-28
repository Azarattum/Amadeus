function keyboard(buttons: string[], callbacks: string[]) {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons.map((x, i) => [
        { text: x, callback_data: callbacks[i] },
      ]),
    }),
  };
}

function escape(text: string) {
  return text
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
    .replace(/>/g, "\\>")
    .replace(/#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/-/g, "\\-")
    .replace(/=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/!/g, "\\!");
}

function markdown() {
  return {
    parse_mode: "MarkdownV2",
  };
}

export { keyboard, markdown, escape };
