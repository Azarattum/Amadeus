type Buttons = { callback: Record<string, any>; text: string }[][];

const icon = {
  recognize: "🌀",
  history: "📜",
  shuffle: "🔀",
  similar: "📻",
  search: "🔎",
  artist: "👤",
  lyrics: "📃",
  cancel: "🚫",
  close: "👌",
  album: "💿",
  page: "🔽",
  stop: "🤚",
  prev: "👈",
  next: "👉",
  load: "⏳",
  all: "⏬",
};

function pager(
  aggregator: number,
  page: number,
  options: Buttons[number],
  next = true,
) {
  const controls: Buttons = [[], []];
  controls[0].push(
    ...(["page", "shuffle", "all"] as const).map((x) => ({
      callback: { [x]: aggregator },
      text: icon[x],
    })),
  );
  controls[1].push({
    callback: page > 0 ? { prev: aggregator } : {},
    text: page > 0 ? icon.prev : icon.stop,
  });
  controls[1].push({
    callback: { close: aggregator },
    text: icon.close,
  });
  controls[1].push({
    callback: next ? { next: aggregator } : {},
    text: next ? icon.next : icon.stop,
  });

  if (options.length <= 1) controls.shift();
  return keyboard([...options.map((x) => [x]), ...controls]);
}

function menu(id: number) {
  const controls: Buttons = [[]];
  controls[0].push({
    callback: { artists: id },
    text: icon.artist,
  });
  controls[0].push({
    callback: { album: id },
    text: icon.album,
  });
  controls[0].push({
    callback: { similar: id },
    text: icon.similar,
  });
  controls[0].push({
    callback: { lyrics: id },
    text: icon.lyrics,
  });
  return keyboard(controls);
}

function keyboard(buttons: Buttons) {
  return JSON.stringify({
    inline_keyboard: buttons.map((x) =>
      x.map(({ callback, text }) => ({
        callback_data: JSON.stringify(callback),
        text,
      })),
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

export { keyboard, markdown, replies, escape, pager, menu, icon };
