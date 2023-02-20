type Buttons = { text: string; callback: Record<string, any> }[][];

function pager(
  aggregator: number,
  page: number,
  options: Buttons[number],
  next = true
) {
  const controls: Buttons = [[], []];
  controls[0].push({
    text: "🔽",
    callback: { page: aggregator },
  });
  controls[0].push({
    text: "🔀",
    callback: { shuffle: aggregator },
  });
  if (page > 0) {
    controls[0].push({
      text: "⏬",
      callback: { all: aggregator },
    });
  }
  controls[1].push({
    text: page > 0 ? "👈" : "🤚",
    callback: page > 0 ? { prev: aggregator } : {},
  });
  controls[1].push({
    text: "🗑️",
    callback: { close: aggregator },
  });
  controls[1].push({
    text: next ? "👉" : "🤚",
    callback: next ? { next: aggregator } : {},
  });

  return keyboard([...options.map((x) => [x]), ...controls]);
}

function details(id: number) {
  const controls: Buttons = [[]];
  controls[0].push({
    text: "👤",
    callback: { artists: id },
  });
  controls[0].push({
    text: "💿",
    callback: { album: id },
  });
  controls[0].push({
    text: "📻",
    callback: { similar: id },
  });
  return keyboard(controls);
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

export { keyboard, markdown, escape, pager, details };
