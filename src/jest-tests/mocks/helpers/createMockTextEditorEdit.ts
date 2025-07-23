import { TextEditorEdit } from 'vscode';

export const createMockTextEditorEdit = () =>
  ({
    insert: jest.fn(),
    delete: jest.fn(),
    replace: jest.fn(),
  }) as unknown as TextEditorEdit;
