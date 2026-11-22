declare module 'virtual:content' {
  import type { Content } from '../content/schema';
  const content: Content;
  export default content;
}

declare module 'virtual:qr' {
  const qr: { token: string };
  export default qr;
}
