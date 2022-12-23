type Buttons = { text: string; callback: Record<string, any> }[][];

function pager(aggregator: string, page: number, options: Buttons[number]) {
  const controls: Buttons = [[], []];
  controls[0].push({
    text: page > 0 ? "👈" : "🤚",
    callback: page > 0 ? { prev: aggregator } : {},
  });
  controls[0].push({
    text: "🗑️",
    callback: { close: aggregator },
  });
  controls[0].push({
    text: "👉",
    callback: { next: aggregator },
  });

  return keyboard([...options.map((x) => [x]), ...controls]);
}

function keyboard(buttons: Buttons) {
  return JSON.stringify({
    inline_keyboard: buttons.map((x) =>
      x.map(({ text, callback }) => ({
        text,
        callback_data: JSON.stringify(callback),
      }))
    ),
  });
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
  return "MarkdownV2";
}

export { keyboard, markdown, escape, pager };
