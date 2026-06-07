export default {
  name: "for loop whose first body statement is a compound if (requests utils.py:432)",
  lines: [
    "for item in _parse_list_header(value):",
    "    if item[:1] == item[-1:]:",
    "        item = unquote_header_value(item)",
    "    result.append(item)",
  ],
  selectionLine: 0,
  expectedLine: 1,
};
