import { escapeHtml } from '@/pro/TurboProShowcasePanel/renderers/escapeHtml';

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape less-than characters', () => {
    expect(escapeHtml('1 < 2')).toBe('1 &lt; 2');
  });

  it('should escape greater-than characters', () => {
    expect(escapeHtml('2 > 1')).toBe('2 &gt; 1');
  });

  it('should escape double quotes', () => {
    expect(escapeHtml('He said "Hello"')).toBe('He said &quot;Hello&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("It's working")).toBe('It&#x27;s working');
  });

  it('should escape multiple characters in one string', () => {
    const input = '<script>alert("XSS & stuff\'s dangerous")</script>';
    const expected =
      '&lt;script&gt;alert(&quot;XSS &amp; stuff&#x27;s dangerous&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  it('should handle empty strings', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle strings with no special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('should prevent XSS injection attempts', () => {
    const maliciousInput = '<img src="x" onerror="alert(\'XSS\')" />';
    const result = escapeHtml(maliciousInput);

    // Should not contain any unescaped HTML tags or quotes
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror="alert');
    expect(result).toContain('&lt;img');
    expect(result).toContain('onerror=&quot;alert');
    expect(result).toContain('&quot;');
  });
});
