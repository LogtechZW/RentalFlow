declare module 'qrcode' {
  interface ToDataURLOptions {
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  const QRCode: {
    toDataURL(text: string, options?: ToDataURLOptions): Promise<string>;
  };

  export default QRCode;
}
