# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Earplay product preferences
- Keep the friendly mint/purple UI free of slogans and instruction blocks.
- Guitar uses a close-up walnut fretboard with realistic metal frets, wound strings, abalone position markers, and narrow fret spacing.
- Show the full selected CAGED scale; highlight only the level's available solfège degrees in the target octave and fade the rest. Root dots say Do.
- Offer nylon and steel guitar samples; piano/solfège use piano samples.
- Check each tapped note immediately. On error, show the tapped syllable and a large red X, play the tapped note, then clear the whole answer after the X fades.
- Completing a melody automatically advances and plays the next. Large success text and a success sound start together 420ms after the last selected note. Level completion adds fanfare and returns to Levels.

- Every level starts with Guitar input and the G CAGED shape selected.
- Piano is a compact one-octave close-up with larger keys. Only the current level's target-octave notes are bright/playable; other scale notes remain translucent. Playable keys use a strong yellow hover highlight.
- Every round has exactly five notes. Levels increase pitch vocabulary and range, descending gradually to Sol below the root, then add minor, modes, and chromatic material.
- Keep level cards compact and the mint/purple UI simple. Custom levels support scale, root, and range, and can be saved, edited, and deleted locally.

- Home keeps Level 0–3 tabs. Within the selected level, show ten large pastel lesson cards stacked vertically, with a large lesson number, colored chips for every available pitch, and a five-note label. The user prefers the original card style over the horizontal lesson path.
- Instrument type, root, scale inlays, guitar tone, and CAGED controls belong inside a collapsed cogwheel settings panel.
- Incorrect taps must sound the actual tapped pitch, never the expected pitch. Touch fretboard feedback appears only while pressed; no sticky hover glow.
