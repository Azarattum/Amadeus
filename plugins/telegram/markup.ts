type Buttons = { text: string; callback: Record<string, any> }[][];

function pager(id: string, page: number, options: Buttons[number]) {
  const controls: Buttons = [[], []];
  if (page > 0) {
    controls[0].push({
      text: "👈",
      callback: { page: id, number: page - 1 },
    });
  }
  controls[0].push({
    text: "👉",
    callback: { page: id, number: page + 1 },
  });
  controls[1].push({
    text: "🗑️",
    callback: { invalidate: id },
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
