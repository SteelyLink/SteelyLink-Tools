declare module 'lamejs' {
  class Mp3Encoder {
    constructor(channels: 1 | 2, sampleRate: number, kbps: number);
    encodeBuffer(left: Int16Array, right?: Int16Array): Uint8Array;
    flush(): Uint8Array;
  }
  export { Mp3Encoder };
}
