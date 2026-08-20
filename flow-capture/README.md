# FLOW Capture

FLOW Capture is a standalone Czech-language progressive web application for collecting manufacturing know-how directly on the shop floor. It records problems, resolutions, photographs, machine settings, technical-list notes, and handover checkpoints.

## Capabilities

- Capture text, photographs, and voice notes.
- Find records by technical list, problem, tag, section, machine, or date.
- Filter unresolved and critical problems.
- Mark usable resolutions as verified.
- Track parameter and changeover histories.
- Export and restore data.
- Work offline using IndexedDB, with a Local Storage fallback.

## Run locally

Serve this folder with any static HTTP server, then open its address in a modern browser. Do not open `index.html` directly from the file system: service workers and browser storage require an HTTP(S) origin.

```sh
npx serve flow-capture
```

The app is installable as a PWA when served over HTTPS or from `localhost`.

## Files

- `index.html`, `app.js`, and `styles.css` provide the user interface and client-side state.
- `manifest.webmanifest`, `service-worker.js`, `icon-192.png`, and `icon-512.png` provide PWA installation and offline support.
- `FLOW_provozni_prirucka.docx` is the operating guide for production users.
- `create_flow_guide.py` generates the operating guide.

## Data handling

Use the Data screen to create regular JSON backups. JSON exports include records and photographs; CSV and XLSX are intended for sharing and analysis. Restoring a JSON backup replaces the app's current data, so restore only a known backup.

For handover records, state what happened, where, on which equipment, and the operational impact. Assign critical issues to a responsible person and close them only after a resolution has been verified in operation.
