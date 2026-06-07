export default {
  name: "single-line-body def falls back to after the def, never above it",
  lines: ["def stub(host): return host", "next_value = 1"],
  selectionLine: 0,
  // body is on the def line itself — no separate body line exists, so the log
  // must NOT go above the def (line 0). Degrade to after the statement (line 1).
  expectedLine: 1,
};
