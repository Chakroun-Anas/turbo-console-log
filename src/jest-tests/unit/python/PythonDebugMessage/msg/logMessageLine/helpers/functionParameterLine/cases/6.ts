export default {
  name: "decorated multi-line method def inserts into the body (not the signature)",
  lines: [
    "class RequestEncodingMixin:",
    "    @staticmethod",
    "    def _encode_files(",
    "        files, data",
    "    ) -> tuple[bytes, str]:",
    '        """doc"""',
    "        return 1",
  ],
  selectionLine: 3,
  expectedLine: 5,
};
