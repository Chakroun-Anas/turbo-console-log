export default {
  name: "walrus target in if condition inserts into the body, not before",
  lines: [
    "def handle(r):",
    "    if (seek := getattr(r, 'seek', None)) is not None:",
    "        seek(0)",
  ],
  selectionLine: 1,
  expectedLine: 2,
};
