# Orbit Pass

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: it installs dependencies, runs the tests, builds, and publishes `dist` to GitHub Pages at `/copy/`.

One-time setup: in the repository settings, go to Settings > Pages and set **Source** to **GitHub Actions**.
