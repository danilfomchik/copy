declare module 'virtual:content' {
  import type { Content } from '../content/schema';
  const content: Content;
  export default content;
}

declare module 'virtual:qr' {
  const qr: { size: number; path: string };
  export default qr;
}
