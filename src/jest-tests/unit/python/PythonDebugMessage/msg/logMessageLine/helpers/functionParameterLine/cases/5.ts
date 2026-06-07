export default {
  name: "multi-line def header, param on the second line (insert at first body statement)",
  lines: [
    "def iter_slices(",
    "    string, slice_length",
    "):",
    "    pos = 0",
    "    return pos",
  ],
  selectionLine: 1,
  expectedLine: 3,
};
