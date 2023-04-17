type Buttons = { text: string; callback: Record<string, any> }[][];

const icon = {
  all: "⏬",
  page: "🔽",
  shuffle: "🔀",
  stop: "🤚",
  prev: "👈",
  next: "👉",
  close: "👌",
  search: "🔎",
  artist: "👤",
  album: "💿",
  similar: "📻",
  lyrics: "📃",
  load: "⏳",
  history: "📜",
  cancel: "🚫",
  recognize: "🌀",
};

function pager(
  aggregator: number,
  page: number,
  options: Buttons[number],
  next = true
) {
  const controls: Buttons = [[], []];
  controls[0].push(
    ...(["page", "shuffle", "all"] as const).map((x) => ({
      text: icon[x],
      callback: { [x]: aggregator },
    }))
  );
  controls[1].push({
    text: page > 0 ? icon.prev : icon.stop,
    callback: page > 0 ? { prev: aggregator } : {},
  });
  controls[1].push({
    text: icon.close,
    callback: { close: aggregator },
  });
  controls[1].push({
    text: next ? icon.next : icon.stop,
    callback: next ? { next: aggregator } : {},
  });

  if (options.length <= 1) controls.shift();
  return keyboard([...options.map((x) => [x]), ...controls]);
}

function menu(id: number) {
  const controls: Buttons = [[]];
  controls[0].push({
    text: icon.artist,
    callback: { artists: id },
  });
  controls[0].push({
    text: icon.album,
    callback: { album: id },
  });
  controls[0].push({
    text: icon.similar,
    callback: { similar: id },
  });
  controls[0].push({
    text: icon.lyrics,
    callback: { lyrics: id },
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

function replies(options: string[]) {
  return JSON.stringify({
    keyboard: options.map((x) => [{ text: x }]),
    one_time_keyboard: true,
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

export { keyboard, markdown, escape, pager, menu, replies, icon };
