import {
  type Struct,
  optional,
  literal,
  number,
  string,
  type,
} from "@amadeus-music/core";

const text = type({
  message: type({
    reply_to_message: optional(
      type({
        message_id: number(),
      }),
    ),
    text: string(),
  }),
});

const audio = type({
  message: type({
    audio: type({
      performer: optional(string()),
      title: optional(string()),
    }),
  }),
});

const voice = type({
  message: type({
    voice: type({
      file_id: string(),
    }),
  }),
});

const post = type({
  channel_post: type({
    audio: optional(
      type({
        performer: optional(string()),
        title: optional(string()),
      }),
    ),
    chat: type({
      id: number(),
    }),
    text: optional(string()),
  }),
});

const callback = type({
  callback_query: type({
    message: type({
      message_id: number(),
    }),
    from: type({
      id: number(),
    }),
    data: string(),
    id: string(),
  }),
});

const invite = type({
  my_chat_member: type({
    new_chat_member: type({
      status: literal("administrator"),
    }),
    chat: type({
      title: string(),
      id: number(),
    }),
  }),
});

const me = type({
  username: string(),
  id: number(),
});

const sent = type({
  audio: optional(type({ file_id: string() })),
  message_id: number(),
});

const file = type({
  file_unique_id: string(),
  file_size: number(),
  file_path: string(),
  file_id: string(),
});

const chat = type({
  description: optional(string()),
  title: optional(string()),
  type: string(),
  id: number(),
});

const responseOf = <T extends Struct<any, any>>(result: T) =>
  type({
    ok: literal(true),
    result: result,
  });

export { responseOf };
export { callback, invite, audio, voice, text, sent, post, file, chat, me };
