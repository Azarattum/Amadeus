import { optional, literal, number, string, type } from "@amadeus-music/core";

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
        file_id: string(),
      })
    ),
  }),
});

const callback = type({
  callback_query: type({
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
  result: type({
    id: number(),
    username: string(),
  }),
});

const sent = type({
  ok: literal(true),
  result: type({
    message_id: number(),
  }),
});

export { callback, invite, audio, voice, text, sent, post, me };
