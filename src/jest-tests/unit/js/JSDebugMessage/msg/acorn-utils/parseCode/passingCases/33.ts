export default {
  name: 'Regular .js file without JSX (should parse without fallback)',
  sourceCode: [
    "const express = require('express');",
    'const app = express();',
    '',
    'function handleRequest(req, res) {',
    '  const data = req.body;',
    '  const result = processData(data);',
    '  res.json({ success: true, result });',
    '}',
    '',
    'app.post("/api/data", handleRequest);',
  ],
  fileExtension: '.js',
  selectionLine: 4,
};
