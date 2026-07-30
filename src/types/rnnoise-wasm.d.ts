declare module '@jitsi/rnnoise-wasm' {
  interface RNNoiseModule {
    _malloc(bytes: number): number;
    _free(ptr: number): void;
    _rnnoise_create(state?: number): number;
    _rnnoise_destroy(state: number): void;
    _rnnoise_process_frame(state: number, output: number, input: number): number;
    HEAPF32: Float32Array;
  }
  export function createRNNWasmModule(options?: { locateFile?: (file: string) => string }): Promise<RNNoiseModule>;
}
