import { randomUUID } from "crypto";

const auth = {
  event: {
    payload: {
      auth_token: "5983ba91-339e-443c-8452-390fe7d9d308",
      accept_invalid_auth: true,
      uuid: randomUUID(),
    },
    header: {
      name: "SynchronizeState",
      messageId: randomUUID(),
      namespace: "System",
    },
  },
};

let streams = -1;
const header = () => ({
  event: {
    header: {
      streamId: (streams += 2),
      messageId: randomUUID(),
      name: "Recognize",
      namespace: "ASR",
    },
    payload: {
      music_request2: {
        headers: {
          "Content-Type": "audio/opus",
        },
      },
    },
  },
});

const ogg = [..."OggS"].map((x) => x.charCodeAt(0));
const transform = (id: number) => {
  const number = Buffer.alloc(4);
  number.writeUint32BE(id);
  const magic = new Uint8Array(number.buffer);

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      let offset = 0;
      loop: for (let i = 0; i < chunk.byteLength; i++) {
        for (let j = 0; j < ogg.length; j++) {
          if (chunk[i + j] !== ogg[j]) continue loop;
        }
        if (i) {
          const item = new Uint8Array(i - offset + 4);
          item.set(magic);
          item.set(chunk.slice(offset, i), 4);
          controller.enqueue(item);
        }
        offset = i;
      }
      const item = new Uint8Array(chunk.length - offset + 4);
      item.set(magic);
      item.set(chunk.slice(offset), 4);
      controller.enqueue(item);
    },
  });
};

export { transform, header, auth };
