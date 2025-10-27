import type { AcornNode } from './types';

/**
 * Recursively adjusts all line and byte offset positions in the AST.
 * This is necessary when parsing extracted script content from Vue SFC or HTML files
 * to ensure both line numbers and byte offsets match the original document.
 *
 * @param node - The AST node to adjust
 * @param lineOffset - The number of lines to add to all line positions
 * @param byteOffset - The number of bytes to add to all start/end positions
 * @returns The adjusted AST node
 */
export function adjustASTLocations(
  node: AcornNode,
  lineOffset: number,
  byteOffset: number,
): AcornNode {
  // Adjust byte offset positions
  if (typeof node.start === 'number') {
    node.start = node.start + byteOffset;
  }
  if (typeof node.end === 'number') {
    node.end = node.end + byteOffset;
  }

  // Adjust location if it exists
  if (node.loc) {
    node.loc = {
      start: {
        line: node.loc.start.line + lineOffset,
        column: node.loc.start.column,
      },
      end: {
        line: node.loc.end.line + lineOffset,
        column: node.loc.end.column,
      },
    };
  }

  // Recursively adjust all child nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const key in node as any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (node as any)[key];

    // Handle arrays of nodes
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item && typeof item === 'object' && 'type' in item) {
          adjustASTLocations(item as AcornNode, lineOffset, byteOffset);
        }
      });
    }
    // Handle single node objects
    else if (value && typeof value === 'object' && 'type' in value) {
      adjustASTLocations(value as AcornNode, lineOffset, byteOffset);
    }
  }

  return node;
}
