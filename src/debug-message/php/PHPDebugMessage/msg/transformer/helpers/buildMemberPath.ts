import {
  isVariable,
  type PHPNode,
  type Variable,
} from '../../php-parser-utils';

/**
 * Helper to build a member expression path for PHP nodes
 * Examples:
 *  - $item -> "item"
 *  - $obj->prop -> "obj->prop"
 *  - $arr['key'] -> "arr['key']"
 */
export function buildMemberPath(node: PHPNode): string {
  if (isVariable(node)) {
    const varNode = node as Variable;
    // Variable name can be a string or another node
    if (typeof varNode.name === 'string') {
      return varNode.name;
    }
  }

  // Handle property access: $obj->prop
  if (node.kind === 'propertylookup') {
    const propLookup = node as unknown as {
      what: PHPNode;
      offset: PHPNode;
    };

    const objectPath = buildMemberPath(propLookup.what);

    // Get property name
    if (isVariable(propLookup.offset)) {
      const propVar = propLookup.offset as Variable;
      if (typeof propVar.name === 'string') {
        return `${objectPath}->${propVar.name}`;
      }
    } else if (propLookup.offset.kind === 'identifier') {
      const identifier = propLookup.offset as unknown as { name: string };
      return `${objectPath}->${identifier.name}`;
    }
  }

  // Handle array access: $arr['key'] or $arr[$index]
  if (node.kind === 'offsetlookup') {
    const offsetLookup = node as unknown as {
      what: PHPNode;
      offset: PHPNode;
    };

    const arrayPath = buildMemberPath(offsetLookup.what);

    // Get offset/key
    if (offsetLookup.offset) {
      if (offsetLookup.offset.kind === 'string') {
        const strNode = offsetLookup.offset as unknown as { value: string };
        return `${arrayPath}['${strNode.value}']`;
      } else if (offsetLookup.offset.kind === 'number') {
        const numNode = offsetLookup.offset as unknown as { value: number };
        return `${arrayPath}[${numNode.value}]`;
      } else if (isVariable(offsetLookup.offset)) {
        const varNode = offsetLookup.offset as Variable;
        if (typeof varNode.name === 'string') {
          return `${arrayPath}[$${varNode.name}]`;
        }
      }
    }

    return arrayPath; // Can't build full path for complex offsets
  }

  return '';
}
