# BG Remover

Free, client-side background removal powered by AI. Runs entirely in your browser — no uploads, no servers, no cost.

**[Live Demo](https://garrik.design/bgremover) · [Launch App](https://garrik.design/bgremover/app)**

## Features

- **100% Private** — images never leave your device
- **AI-Powered** — ISNet segmentation model via [@imgly/background-removal](https://github.com/imgly/background-removal-js)
- **Fast** — WebGPU acceleration with WASM fallback
- **Free** — no sign-ups, no limits, no watermarks
- **Before/After Slider** — compare results instantly
- **Download as PNG** — transparent background, full resolution

## How It Works

1. Drop an image (PNG, JPG, WebP)
2. AI model processes it locally in your browser
3. Compare with the before/after slider
4. Download the result as a transparent PNG

The model (~40MB) downloads on first use and is cached for subsequent visits.

## Tech Stack

- **Vite** — dev server & bundler
- **@imgly/background-removal** — ONNX/WASM-based segmentation (Apache 2.0)
- **Vanilla JS** — no framework, minimal dependencies

## Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5180`. First load will download the AI model.

### Build for Production

```bash
npm run build
```

Outputs to `dist/`. Requires these response headers on your hosting:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

These enable `SharedArrayBuffer` for multi-threaded WASM processing.

## Project Structure

```
bgremover/
  index.html          # Landing page (garrik.design/bgremover)
  app/
    index.html         # App (garrik.design/bgremover/app)
    src/
      main.js          # App logic
      style.css        # Styles
  vite.config.js       # Vite config (root: app, base: /bgremover/app/)
  package.json
```

## Hosting

Works on any static host that supports custom headers. Free options:

- **Cloudflare Pages** — add a `_headers` file
- **Netlify** — configure in `netlify.toml`
- **Vercel** — configure in `vercel.json`

## License

MIT

---

Built by [garrik.design](https://garrik.design)
