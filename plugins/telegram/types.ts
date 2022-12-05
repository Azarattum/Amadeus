import {
  intersection,
  optional,
  literal,
  number,
  object,
  string,
  type,
  union,
} from "@amadeus-music/core";

const Download = object({
  download: string(),
});

const Page = object({
  page: string(),
  number: number(),
});

const Invalidate = object({
  invalidate: string(),
});

const Query = union([Download, Page, Invalidate]);

const Text = type({
  message: type({
    text: string(),
    reply_to_message: optional(
      type({
        message_id: number(),
      })
    ),
  }),
});

const Audio = type({
  message: type({
    audio: type({
      title: optional(string()),
      performer: optional(string()),
    }),
  }),
});

const Voice = type({
  message: type({
    voice: type({
      file_id: string(),
    }),
  }),
});

const Post = type({
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

const Callback = type({
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

const Invite = type({
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

const Me = type({
  result: type({
    id: number(),
    username: string(),
  }),
});

const From = type({
  message_id: optional(number()),
  from: type({
    id: number(),
    username: optional(string()),
  }),
});

const Chat = type({
  message_id: optional(number()),
  chat: type({
    id: number(),
    type: string(),
  }),
});

const Sender = type({
  message: optional(intersection([From, Chat])),
  my_chat_member: optional(intersection([From, Chat])),
  callback_query: optional(intersection([From, type({ message: Chat })])),
  channel_post: optional(Chat),
});

const Sent = type({
  ok: literal(true),
  result: type({
    message_id: number(),
  }),
});

export {
  Invalidate,
  Callback,
  Download,
  Invite,
  Sender,
  Query,
  Audio,
  Voice,
  Text,
  Sent,
  Page,
  Post,
  Me,
};
