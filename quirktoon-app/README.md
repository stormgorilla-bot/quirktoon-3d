# QuirkToon — The Big Idea

A playable, vertical 9:16 3D cartoon starring Quirk and Byte. Character meshes are built from procedural Three.js geometry; animation is a real-time articulated animation, not moving still images.

## Run locally

The page uses ES modules, so open it through a local HTTP server (not `file://`). From this directory, for example:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Three.js is loaded from jsDelivr, so the first run needs an internet connection. Any static HTTP server works.

## Play

- The scene automatically plays its 10-second loop.
- **Replay** restarts at the beginning; **Pause/Play** and clicking the canvas toggle playback.
- Space toggles playback when focus is not on a button.
- On Android, open the hosted page in Chrome; the layout uses the viewport-safe-height units, touch-sized controls, low-power rendering, and a capped device pixel ratio.

## Publish

Publish the `quirktoon-app/` directory as the site root using any static host (for example GitHub Pages with the Pages source set to this directory via a deployment workflow, or a static hosting provider). `index.html`, `style.css`, and `src/main.js` must remain together at the published root paths. No build step is required.

## Animation beats

- **0–2s:** Quirk walks in with alternating leg and arm swings.
- **2–4s:** Quirk stops, raises a finger, and talks through the idea.
- **4–6s:** Byte turns toward Quirk and blinks suspiciously.
- **6–8s:** Quirk points toward the viewer.
- **8–10s:** Byte tilts its head and narrows its digital eyes in disbelief.

## Repository note

This app is intentionally separate from Three.js engine source. It imports the published Three.js module and does not change `mrdoob/three.js` or any engine files.
