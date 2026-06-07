export default {
  name: "method with self and data param",
  lines: ["def run(self, payload):","    return self.handle(payload)"],
  selectionLine: 0,
  expectedLine: 1,
};
