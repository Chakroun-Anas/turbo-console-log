import { renderTableComponent } from '@/pro/TurboProShowcasePanel/renderers/renderTableComponent';
import { TablePanelComponent } from '@/pro/TurboProShowcasePanel/types';

// Mock escapeHtml to focus on component logic
jest.mock('@/pro/TurboProShowcasePanel/renderers/escapeHtml', () => ({
  escapeHtml: jest.fn((text: string) => text), // Return text as-is for testing
}));

import { escapeHtml } from '@/pro/TurboProShowcasePanel/renderers/escapeHtml';
const mockEscapeHtml = escapeHtml as jest.MockedFunction<typeof escapeHtml>;

describe('renderTableComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEscapeHtml.mockImplementation((text: string) => text);
  });

  it('should render a table with headers and rows', () => {
    const component: TablePanelComponent = {
      title: 'Keyboard Shortcuts',
      columns: ['Description', 'macOS', 'Windows'],
      rows: [
        { Description: 'Insert log', macOS: 'Cmd+L', Windows: 'Ctrl+L' },
        { Description: 'Delete logs', macOS: 'Cmd+D', Windows: 'Ctrl+D' },
      ],
    };

    const result = renderTableComponent(component);

    // Check structure
    expect(result).toContain('<section class="section">');
    expect(result).toContain('<h3>Keyboard Shortcuts</h3>');
    expect(result).toContain('<table class="commands-table">');
    expect(result).toContain('<thead>');
    expect(result).toContain('<tbody>');

    // Check headers
    expect(result).toContain('<th>Description</th>');
    expect(result).toContain('<th>macOS</th>');
    expect(result).toContain('<th>Windows</th>');

    // Check data rows
    expect(result).toContain('<td>Insert log</td>');
    expect(result).toContain('<td>Cmd+L</td>');
    expect(result).toContain('<td>Ctrl+L</td>');
    expect(result).toContain('<td>Delete logs</td>');
    expect(result).toContain('<td>Cmd+D</td>');
    expect(result).toContain('<td>Ctrl+D</td>');
  });

  it('should escape all text content using escapeHtml', () => {
    const component: TablePanelComponent = {
      title: 'Table with <script>',
      columns: ['Col "1"', 'Col & 2'],
      rows: [{ 'Col "1"': 'Value <test>', 'Col & 2': 'Value "quoted"' }],
    };

    mockEscapeHtml.mockImplementation((text: string) => `escaped:${text}`);

    const result = renderTableComponent(component);

    // Verify escaping is called for all text content
    expect(mockEscapeHtml).toHaveBeenCalledWith('Table with <script>');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Col "1"');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Col & 2');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Value <test>');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Value "quoted"');

    expect(result).toContain('escaped:Table with <script>');
    expect(result).toContain('escaped:Col "1"');
    expect(result).toContain('escaped:Value <test>');
  });

  it('should handle empty table data gracefully', () => {
    const component: TablePanelComponent = {
      title: 'Empty Table',
      columns: [],
      rows: [],
    };

    const result = renderTableComponent(component);

    expect(result).toContain('<h3>Empty Table</h3>');
    expect(result).toContain('<table class="commands-table">');
    expect(result).toContain('<thead>');
    expect(result).toContain('<tbody>');

    // Should have empty header and body
    expect(result).toContain('<tr></tr>'); // Empty header row
  });

  it('should handle missing row data with empty cells', () => {
    const component: TablePanelComponent = {
      title: 'Incomplete Data',
      columns: ['Col1', 'Col2', 'Col3'],
      rows: [
        { Col1: 'Value1' }, // Missing Col2 and Col3
        { Col2: 'Value2', Col3: 'Value3' }, // Missing Col1
      ],
    };

    const result = renderTableComponent(component);

    // Should render empty cells for missing data
    expect(result).toContain('<td>Value1</td><td></td><td></td>');
    expect(result).toContain('<td></td><td>Value2</td><td>Value3</td>');

    // Verify escaping is called for empty strings
    expect(mockEscapeHtml).toHaveBeenCalledWith('');
  });

  it('should maintain correct HTML structure', () => {
    const component: TablePanelComponent = {
      title: 'Test Table',
      columns: ['A', 'B'],
      rows: [{ A: '1', B: '2' }],
    };

    const result = renderTableComponent(component);

    // Check order of elements
    const sectionIndex = result.indexOf('<section class="section">');
    const h3Index = result.indexOf('<h3>');
    const tableIndex = result.indexOf('<table class="commands-table">');
    const theadIndex = result.indexOf('<thead>');
    const tbodyIndex = result.indexOf('<tbody>');

    expect(sectionIndex).toBeLessThan(h3Index);
    expect(h3Index).toBeLessThan(tableIndex);
    expect(tableIndex).toBeLessThan(theadIndex);
    expect(theadIndex).toBeLessThan(tbodyIndex);
  });

  it('should handle single column table', () => {
    const component: TablePanelComponent = {
      title: 'Single Column',
      columns: ['Items'],
      rows: [{ Items: 'Item 1' }, { Items: 'Item 2' }],
    };

    const result = renderTableComponent(component);

    expect(result).toContain('<th>Items</th>');
    expect(result).toContain('<td>Item 1</td>');
    expect(result).toContain('<td>Item 2</td>');

    // Should have correct number of rows (2 data rows)
    const trMatches = result.match(/<tr>/g);
    expect(trMatches).toHaveLength(3); // 1 header + 2 data rows
  });
});
