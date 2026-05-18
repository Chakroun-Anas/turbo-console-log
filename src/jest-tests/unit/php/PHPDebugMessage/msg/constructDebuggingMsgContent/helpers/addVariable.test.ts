import { addVariable } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/addVariable';

describe('PHP addVariable', () => {
  it('should add variable with suffix', () => {
    const result = addVariable('$user', ':');
    expect(result).toEqual(['$user', ':']);
  });

  it('should add variable without suffix when empty', () => {
    const result = addVariable('$data', '');
    expect(result).toEqual(['$data', '']);
  });

  it('should handle array access variables', () => {
    const result = addVariable('$array[0]', ':');
    expect(result).toEqual(['$array[0]', ':']);
  });

  it('should handle object property access', () => {
    const result = addVariable('$obj->prop', ':');
    expect(result).toEqual(['$obj->prop', ':']);
  });

  it('should handle method call chains', () => {
    const result = addVariable('$obj->method()->prop', ':');
    expect(result).toEqual(['$obj->method()->prop', ':']);
  });

  it('should always return array of two elements', () => {
    const result = addVariable('$x', ' = ');
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('$x');
    expect(result[1]).toBe(' = ');
  });

  it('should handle complex variable expressions', () => {
    const result = addVariable('$this->items[0]->name', ':');
    expect(result).toEqual(['$this->items[0]->name', ':']);
  });
});
