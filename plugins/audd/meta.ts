const concat = () => {
  let size = 0;
  const chunks: Uint8Array[] = [];
  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk) {
      chunks.push(chunk);
      size += chunk.byteLength;
    },
    flush(controller) {
      const data = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.byteLength;
      }
      controller.enqueue(data);
    },
  });
};

export { concat };
