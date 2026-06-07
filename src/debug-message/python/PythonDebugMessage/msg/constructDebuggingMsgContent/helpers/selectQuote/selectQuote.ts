export function selectPythonQuote(defaultQuote: string, content: string): string {
  const hasDouble = content.includes('"');
  const hasSingle = content.includes("'");

  if (hasDouble && !hasSingle) return "'";
  if (hasSingle && !hasDouble) return '"';
  if (defaultQuote === '"' || defaultQuote === "'") return defaultQuote;
  return '"';
}
