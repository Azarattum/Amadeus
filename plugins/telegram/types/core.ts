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
    text: string(),
    reply_to_message: optional(
      type({
        message_id: number(),
      })
    ),
  }),
});

const audio = type({
  message: type({
    audio: type({
      title: optional(string()),
      performer: optional(string()),
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
    text: optional(string()),
    chat: type({
      id: number(),
    }),
    audio: optional(
      type({
        title: optional(string()),
        performer: optional(string()),
      })
    ),
  }),
});

const callback = type({
  callback_query: type({
    id: string(),
    data: string(),
    message: type({
      message_id: number(),
    }),
    from: type({
      id: number(),
    }),
  }),
});

const invite = type({
  my_chat_member: type({
    new_chat_member: type({
      status: literal("administrator"),
    }),
    chat: type({
      id: number(),
      title: string(),
    }),
  }),
});

const me = type({
  id: number(),
  username: string(),
});

const sent = type({
  message_id: number(),
  audio: optional(type({ file_id: string() })),
});

const file = type({
  file_id: string(),
  file_unique_id: string(),
  file_size: number(),
  file_path: string(),
});

const chat = type({
  id: number(),
  type: string(),
  title: optional(string()),
  description: optional(string()),
});

const responseOf = <T extends Struct<any, any>>(result: T) =>
  type({
    ok: literal(true),
    result: result,
  });

export { responseOf };
export { callback, invite, audio, voice, text, sent, post, file, chat, me };
