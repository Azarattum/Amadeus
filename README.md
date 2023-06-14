# Amadeus

[![Watch the video](https://img.youtube.com/vi/c6TdBs1JCI8/maxresdefault.jpg)](https://www.youtube.com/watch?v=c6TdBs1JCI8)

This is a rewrite of [AmadeusCore](https://github.com/Azarattum/AmadeusCore) and [AmadeusUI](https://github.com/Azarattum/AmadeusUI) in one monorepo. Currently it is heavy work in progress (not in a usable state yet). If you are looking for LibFun, check it [here](https://github.com/Azarattum/Amadeus/tree/main/packages/libfun).

## Plugins
Plugins can provide Amadeus with source of data, endpoints to deliver and persistence to store. To learn how to develop plugins please refer to [plugins documentation](plugins/README.md).

Amadeus provides following 1st party plugins:
| Plugin   | Purpose     | Capabilities                                 | Auth                                                              |
| -------- | ----------- | -------------------------------------------- | ----------------------------------------------------------------- |
| Yandex   | Provider    | Search, Recommendations, Lyrics, Recognition | [Token](https://yandex-music.readthedocs.io/en/latest/token.html) |
| VK       | Provider    | Search, Recommendations, Lyrics              | [Token](https://vkhost.github.io/)                                |
| AudD     | Provider    | Recognition                                  | [Token](https://docs.audd.io/enterprise#where-to-get-a-token)     |
| Telegram | Endpoint    | Bot                                          | [Token](https://core.telegram.org/bots/features#botfather)        |
| tRPC     | Endpoint    | WebSocket API                                | -                                                                 |
| SQLite   | Persistence | Storage                                      | -                                                                 |
