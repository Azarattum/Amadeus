<script lang="ts">
  const src =
    "https://avatars.yandex.net/get-music-content/176019/c2751396.a.5363481-1/800x800";

  const resize = (src: string, size = 48) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.height = size * devicePixelRatio;
        canvas.width = size * devicePixelRatio;
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
    });
  };
</script>

{#await resize(src) then src}
  <img {src} width="48" height="48" alt="thumbnail" />
{/await}
