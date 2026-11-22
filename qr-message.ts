// The URL encoded by the QR view: scanning it opens the Scan page
// (scan.html, served from the GitHub Pages deploy) for the signed-in Member.
// Shared by the build-time filler calculation (qr-plugin.ts), the QR view and
// the Scan page; it is not Content-file text.
export const QR_URL = 'https://danilfomchik.github.io/copy/scan.html';

// QR version 18 (89 x 89 modules) matches the original's density.
export const QR_VERSION = 18;

// A Scan id: 128 random bits as lowercase hex. It names the Member's public
// scans/{id} document, so it must be unguessable and safe in a Firestore path.
export const SCAN_ID = /^[0-9a-f]{32}$/;

// The text put into the QR code. The Scan id travels in the query; the filler
// token sits in the fragment (after `#`), so the server never sees it.
// `base` overrides the page URL (the dev server points it at itself).
export function qrText(scanId: string | undefined, token: string, base = QR_URL): string {
  return `${base}${scanId ? `?id=${scanId}` : ''}#${token}`;
}
