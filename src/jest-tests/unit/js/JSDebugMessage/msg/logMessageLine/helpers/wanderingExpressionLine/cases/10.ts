// `export default` is a statement boundary: the log goes after it, below the
// `'use client'` directive and the declarations it reads.
export default {
  name: 'identifier in export default call is logged after the export',
  fileExtension: '.tsx',
  lines: [
    "'use client';",
    '',
    'function ProductCard({ product }: Props) {',
    '  return <article>{product.name}</article>;',
    '}',
    '',
    'export default memo(ProductCard);',
  ],
  selectionLine: 6,
  variableName: 'ProductCard',
  expectedLine: 7,
};
