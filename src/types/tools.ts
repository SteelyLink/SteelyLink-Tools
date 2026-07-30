export type ToolCategory =
  | 'image' | 'pdf' | 'dev' | 'light'
  | 'calc' | 'finance' | 'encode' | 'audio' | 'edit' | 'game';

export type ImageMode =
  | 'png-to-jpg'
  | 'jpg-to-png'
  | 'webp-to-jpg'
  | 'jpg-to-webp'
  | 'compress-image'
  | 'resize-image'
  | 'crop-image'
  | 'rotate-image'
  | 'webp-to-png'
  | 'png-to-webp'
  | 'heic-to-jpg'
  | 'heic-to-png'
  | 'avif-to-jpg'
  | 'avif-to-png'
  | 'svg-to-png'
  | 'svg-to-jpg'
  | 'image-filter'
  | 'video-to-gif'
  | 'mp4-to-gif';

export type PdfMode =
  | 'image-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'pdf-compress'
  | 'pdf-encrypt'
  | 'pdf-decrypt'
  | 'pdf-watermark'
  | 'pdf-to-txt'
  | 'pdf-to-csv'
  | 'pdf-to-word'
  | 'word-to-pdf';

export type DevMode =
  | 'json-formatter'
  | 'base64'
  | 'uuid-generator'
  | 'timestamp-converter'
  | 'json-validator'
  | 'regex-tester'
  | 'text-case'
  | 'lorem-ipsum'
  | 'hash-generator'
  | 'qr-reader'
  | 'csv-formatter'
  | 'xml-formatter'
  | 'yaml-formatter'
  | 'markdown-formatter';

export type LightMode =
  | 'word-counter'
  | 'qr-code'
  | 'password-generator'
  | 'timezone-converter'
  | 'ip-lookup'
  | 'ocr-tool'
  | 'us-address-generator';

export type CalcMode =
  | 'base-convert'
  | 'random-number'
  | 'binary-calculator'
  | 'boolean-calculator'
  | 'bitwise-calculator'
  | 'ip-calculator'
  | 'time-diff'
  | 'bmi-calculator'
  | 'loan-calculator'
  | 'matrix-calculator'
  | 'string-analyzer'
  | 'date-calculator'
  | 'bank-bin'
  | 'currency-converter'
  | 'unit-converter';

export type EncodeMode = 'text-encoder' | 'online-notepad';

export type AudioMode =
  | 'audio-trim'
  | 'audio-volume'
  | 'audio-convert'
  | 'audio-merge'
  | 'audio-split'
  | 'audio-denoise';

export type EditMode =
  | 'remove-bg'
  | 'add-watermark'
  | 'drawing-canvas'
  | 'image-batch';

export type GameMode =
  | 'cps-test'
  | 'reaction-test'
  | 'sensitivity-converter'
  | 'valorant-sensitivity-converter'
  | 'cs2-sensitivity-converter'
  | 'apex-sensitivity-converter'
  | 'overwatch2-sensitivity-converter'
  | 'r6siege-sensitivity-converter'
  | 'pubg-sensitivity-converter'
  | 'fortnite-sensitivity-converter'
  | 'cod-sensitivity-converter'
  | 'tarkov-sensitivity-converter'
  | 'bf2042-sensitivity-converter'
  | 'halo-sensitivity-converter'
  | 'thefinals-sensitivity-converter'
  | 'warframe-sensitivity-converter'
  | 'cs2-to-valorant-sensitivity'
  | 'valorant-to-cs2-sensitivity'
  | 'apex-to-valorant-sensitivity'
  | 'valorant-to-apex-sensitivity'
  | 'cs2-to-apex-sensitivity'
  | 'apex-to-cs2-sensitivity'
  | 'overwatch2-to-valorant-sensitivity'
  | 'valorant-to-overwatch2-sensitivity'
  | 'cs2-to-overwatch2-sensitivity'
  | 'overwatch2-to-cs2-sensitivity'
  | 'pubg-to-cs2-sensitivity'
  | 'cs2-to-pubg-sensitivity'
  | 'fortnite-to-valorant-sensitivity'
  | 'valorant-to-fortnite-sensitivity'
  | 'cod-to-cs2-sensitivity'
  | 'cs2-to-cod-sensitivity'
  | 'aim-trainer';

export type ToolMode =
  | ImageMode | PdfMode | DevMode | LightMode
  | CalcMode | EncodeMode | AudioMode | EditMode | GameMode;

export interface ToolDefinition {
  id: ToolMode;
  category: ToolCategory;
  icon: string;
  colorClass: string;
  iconBgClass: string;
  maxFileSizeMB: number;
  acceptedFormats: string[];
  related: ToolMode[];
  keywords: string[];
}

export interface ProcessResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  newSize: number;
}

export type CompressFormat = 'png' | 'jpg' | 'webp' | 'avif';

export interface ProcessOptions {
  quality?: number;
  format?: CompressFormat;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  degrees?: 90 | 180 | 270;
  // Image filter options
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
}
