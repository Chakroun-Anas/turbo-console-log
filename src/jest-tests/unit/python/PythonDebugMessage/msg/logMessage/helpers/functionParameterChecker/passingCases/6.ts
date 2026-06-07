export default {
  name: "parameter on a decorated method with multi-line signature",
  lines: [
    "class RequestEncodingMixin:",
    "    @staticmethod",
    "    def _encode_files(",
    "        files, data",
    "    ) -> tuple:",
    "        return 1",
  ],
  selectionLine: 3,
  variableName: "files",
};
