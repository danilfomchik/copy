# Release check

## Lighthouse (automated, local)

Run on 2026-11-06 against the production build served by `vite preview`
(`/copy/`), Lighthouse 13.6.0, Playwright Chromium, mobile emulation, headless.
Lighthouse 13 no longer has a PWA category, so installability is covered by
`tests/pwa.spec.ts` (manifest, icons, offline reload) and the manual check below.

| Category | Score |
| --- | --- |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 45 (intentional) |

SEO is low on purpose: the app is private, so it ships `noindex`, a
disallow-all `robots.txt` and no meta description. Those three audits are the
only SEO failures. The accessibility score was also 100 with Chromium forced
into dark mode, but it was not confirmed that the app actually rendered dark in
that run.

Reproduce: `npm run build`, `npx vite preview --port 4321`, then
`CHROME_PATH=<playwright chromium> npx lighthouse http://localhost:4321/copy/ --chrome-flags="--headless=new --no-sandbox"`.
Lighthouse is a dev dependency only; nothing from it ships in the app.

## Manual checklist (needs a person with real devices)

Not done by the agent. Leave unchecked until you have checked them yourself.

### Android (Chrome)

- [ ] Open the deployed URL, install via the browser prompt or menu "Install app"
- [ ] The home-screen icon is the maskable Orbit Pass icon, not a screenshot
- [ ] Launches standalone (no address bar); status bar colour matches the app
- [ ] Airplane mode: the app still opens and every tab works
- [ ] Layout is correct on a small and a large phone, portrait
- [ ] Light and dark theme (Menu > Theme, and system) look right
- [ ] Onest font is used (Cyrillic text is not in a fallback font)
- [ ] Bell, +, flip, Actions sheet, Notifications sheet, swipe-down close work
- [ ] With "remove animations" on, the card flip, ribbon and spinner do not animate

### iOS (Safari, then Add to Home Screen)

- [ ] Add to Home Screen; the icon is the Orbit Pass apple-touch icon
- [ ] Launches standalone; content is not hidden under the status bar or notch
- [ ] Tab bar clears the home indicator; sheets respect the bottom inset
- [ ] Landscape: content respects the left and right insets
- [ ] Airplane mode: the app still opens and every tab works
- [ ] Light and dark theme look right
- [ ] With "Reduce Motion" on, the card flip, ribbon and spinner do not animate
