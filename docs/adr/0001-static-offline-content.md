# All content is bundled at build time, with no runtime network access

Orbit Pass is a privacy-first practice app, so every piece of content lives in the Content file and is compiled into the bundle. The app makes no fetches after the first load, and a strict Content-Security-Policy (`connect-src 'none'`) enforces this in the browser. We rejected loading a JSON file at runtime and running a small backend: both make editing easier but add a request surface, and the privacy guarantee would then depend on discipline rather than on the browser.

## Consequences

Changing any content means editing the Content file and redeploying. An end-to-end test asserts that no requests leave the app's own origin.
