# susubuddy

A soft mochi desktop buddy that lives in the corner of your screen.

- **Quick thought** — jot an idea; it saves locally with timestamp + tags.
- **Archive** — all notes grouped by day, searchable.
- **Lives in the system tray** — hide/show, quit from there.

## Repo layout

- `app/` — Electron app (main/renderer/build config)
- `susubuddy.html` — standalone design-canvas exploration (open in a browser)
- `susubuddy/` — original design handoff bundle

## Build locally

```bash
cd app
npm install
npm start              # run unpackaged
npm run dist           # Windows .exe installer (NSIS)
npm run dist:mac       # macOS .dmg + .zip (must run on macOS)
```

Output lands in `app/dist/`.

## CI builds

Pushes to `main` and any `v*` tag trigger a matrix build on `macos-14` and `windows-latest`. Artifacts are uploaded to each run; tag pushes also attach to the GitHub release.

Icons are regenerated on each CI run from `app/build/make_icon.py` (Python + Pillow).
