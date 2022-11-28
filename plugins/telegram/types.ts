import {
  any,
  intersection,
  literal,
  number,
  optional,
  string,
  type,
} from "@amadeus-music/core";

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

const Query = any();

const Callback = type({
  callback_query: type({
    data: Query,
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
  from: type({
    id: number(),
    username: optional(string()),
  }),
});

const Chat = type({
  chat: type({
    id: number(),
  }),
});

const Sender = type({
  message: optional(intersection([From, Chat])),
  my_chat_member: optional(intersection([From, Chat])),
  callback_query: optional(intersection([From, type({ message: Chat })])),
  channel_post: optional(Chat),
});

export { Text, Audio, Voice, Post, Me, Query, Callback, Invite, Sender };
