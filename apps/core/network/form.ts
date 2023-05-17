import { PassThrough, Readable } from "stream";

const boundary = "xXx_boundary_xXx";

export class Form extends PassThrough {
  private params: [string, string | number | boolean][];
  private streams: [string, [Readable, string]][];

  public constructor(params: Record<string, any> = {}) {
    super();
    const isFile = (x: any) => x?.[0] instanceof Readable;
    const entries = Object.entries(params);
    this.params = entries.filter((x) => !isFile(x[1])) as any;
    this.streams = entries.filter((x) => isFile(x[1])) as any;

    if (!entries.length) this.end();
    else {
      this.once("resume", async () => {
        await this.writeParams();
        await this.writeStreams();
        await this.endStream();
      });
    }
  }

  public static get headers(): Record<string, string> {
    return {
      "Content-Type": `multipart/form-data;boundary="${boundary}"`,
    };
  }

  private writeParams(): void {
    for (const param of this.params) {
      let [name, value] = param;
      if (typeof value == "object") value = JSON.stringify(value);
      name = name.toString();
      if (value == null) continue;

      const data = this.formatProperty(name, value.toString());
      this.write(data);
    }
  }

  private async writeStreams(): Promise<void> {
    for await (const stream of this.streams) {
      const [name, [readable, filename]] = stream;
      this.write(this.formatStream(name, filename));

      readable.pipe(this, { end: false });
      await new Promise((resolve) => {
        readable.on("end", resolve);
      });
      this.write("\r\n");
      readable.destroy();
    }
  }

  private formatStream(name: string, filename: string): Buffer {
    return Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n\r\n`
    );
  }

  private formatProperty(name: string, value: string): Buffer {
    return Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        value +
        "\r\n"
    );
  }

  private endStream(): void {
    this.write(`--${boundary}--\r\n`);
    this.end();
  }
}
