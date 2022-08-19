<script lang="ts">
  import { autoscroll } from "@amadeus/ui/action";
  import { Sortable, Overlay } from "@amadeus/ui";
  import { onMount } from "svelte";

  const images = [
    "https://sun1-95.userapi.com/impf/c855328/v855328177/18dbbe/rYh16bZyfIE.jpg?size=1184x0&quality=90&sign=1d9ba905c7c78828178d29fcbe13569d&c_uniq_tag=0GT0Bea-rUHkbcNEYDYch2r-4Vq0fqZhlObjmmQBYpQ",
    "https://avatars.yandex.net/get-music-content/176019/c2751396.a.5363481-1/800x800",
    "https://sun4-10.userapi.com/impf/c854524/v854524663/21d4a/W5aNd6fXd7A.jpg?size=1184x0&quality=90&sign=7a97cf07090272d6c8ec8143d8dcb859&c_uniq_tag=Owo5F27YFvaqvp_kLjWcaYQRDeXSop3VigrW-KXHyDM",
    "https://avatars.yandex.net/get-music-content/1781407/4420f61b.a.13008974-1/800x800",
    "https://sun4-15.userapi.com/impf/c856024/v856024277/258476/lEXX-zvaD1g.jpg?size=1184x0&quality=90&sign=c4e3f0577cf5c186a1e1c6d15bdb792c&c_uniq_tag=JO9jjEEsfrgMbj6-aOms1iPX414v4flTOopo0YuPuYI",
    "https://sun4-11.userapi.com/impf/c858432/v858432866/23011b/bfvDwYeMDfE.jpg?size=1184x0&quality=90&sign=bcae561bcd5ce0566e035ec03b5f1586&c_uniq_tag=MitPqfUMhjyCdhTlYjQ0Sl1EZsk6ZC7dRvqwzts07Ys",
    "https://sun4-11.userapi.com/impf/c855036/v855036597/49254/aLY-2RY4b7U.jpg?size=1184x0&quality=90&sign=a93971b5ff6a3acf8bf2fedb2a0eb305&c_uniq_tag=rxxXGBohWOr3QOifhg8IgLu1sye5lOqJwGiUXb6jsKo",
    "https://avatars.yandex.net/get-music-content/5099136/407bba04.a.19030241-1/800x800",
    "https://sun4-17.userapi.com/impf/c844321/v844321041/6ba64/-crSo6EZ3U4.jpg?size=1184x0&quality=90&sign=112d2d0c53f68004f213176adb89e8e4&c_uniq_tag=lfBjbrKHZ9c4RMvMsSadUZWz3HIRUZWvFg6hc0kZnvA",
    "https://sun4-17.userapi.com/impf/881JaoqAu-_ydMtez4jkmzQjG7TaItcn1vSphQ/wURbTXpJa38.jpg?size=300x0&quality=90&sign=a0c5f141c1ade22ab729eea00bfe506f&c_uniq_tag=CaYfM-K5Ks-9eW0BQQtN9Dy3iQBqjUJlOS_ApF4T2lM",
    "https://sun4-12.userapi.com/impf/c855536/v855536219/255638/Dh39sjE-V0Q.jpg?size=1184x1184&quality=96&sign=3bb0336a128193ddb198211a87b83e80&c_uniq_tag=J_bKgEnd4gF4EA32m5ULLBwBAoeRinBulzct7lqiH4A&type=audio",
    "https://sun4-16.userapi.com/impf/c86TBXU03oh4AEbwc7eP5r2OkHvg4GU7XirNWw/ZfafjblgOsk.jpg?size=1184x1184&quality=96&sign=c6016f754ce250678a423e0d4a5df63c&c_uniq_tag=yZYiDvTFcmrOS5OlyHIC4jPM3PPxzuoN-e3sj15cFJ4&type=audio",
    "https://sun4-12.userapi.com/impf/c849420/v849420698/dd734/T8GeKR9lIEM.jpg?size=1184x1184&quality=96&sign=bf63dae02d03daf3ee8893019f0abeca&c_uniq_tag=o4MqX8bBpEW8UIjGMT-wNIu6lK8p1aLY84rUzOiYUn0&type=audio",
  ];

  /** We want resize images to thumbnails */
  const load = (src: string) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 48 * devicePixelRatio;
        canvas.height = 48 * devicePixelRatio;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingQuality = "high";
        ctx?.drawImage(
          img,
          0,
          0,
          img.height,
          img.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob((blob) => {
          if (!blob) return reject();
          resolve(URL.createObjectURL(blob));
        });

        // const dataURL = canvas.toDataURL("image/png");
        // resolve(dataURL);
      };

      img.src = src;
    });
  };

  let items: { canvas: string; image: string }[] = [];
  onMount(async () => {
    const loading = images.map(load);
    items = (await Promise.all(loading)).map((x, i) => ({
      canvas: x,
      image: images[i],
    }));
  });
</script>

<Overlay />
<main use:autoscroll>
  <h1>This is a header</h1>
  <h1>This is a header 2</h1>
  <h1>This is a header 3</h1>
  <Sortable {items} let:item let:index animation={200}>
    <article class="item" style="--animation: 200ms">
      <img src={item.canvas} alt="img" draggable="false" />
      <p>{index}</p>
    </article>
  </Sortable>
  <h1>This is a content</h1>
  <h1>This is a content too</h1>
  <Sortable items={items.slice()} let:item let:index animation={0}>
    <article class="item" style="--animation: 200ms">
      <img src={item.canvas} alt="img" draggable="false" />
      <p>{index}</p>
    </article>
  </Sortable>
  <h1>This is a footer</h1>
</main>

<style>
  main {
    width: auto;
    height: 100%;
    /* ///TODO: broken when full size! */
    max-height: 300px;
    -webkit-overflow-scrolling: touch;
    overflow-y: scroll;
    overflow-x: hidden;
    -webkit-user-select: none;
    user-select: none;
  }
  article {
    display: flex;
    align-items: center;
    background-color: pink;
    margin: 4px;
    border-radius: 8px;

    position: relative;
    transition: transform var(--animation) ease;
  }
  img {
    width: 48px;
    height: 48px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
  }
  p {
    font-size: 17px;
    text-indent: 8px;
    margin: 0;
  }

  article::before {
    content: "";
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;

    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    border-radius: 8px;

    transition: opacity var(--animation) ease;
    opacity: 0;
  }

  :global([dragging]) article {
    transform: scale(1.05);
  }
  :global([dragging]) article::before {
    opacity: 1;
  }
  :global([draggable="false"]) article {
    background-color: #fff;
    box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.2);

    visibility: visible;
    z-index: -1;
  }
  :global([draggable="false"]) article > * {
    visibility: hidden;
  }
</style>
