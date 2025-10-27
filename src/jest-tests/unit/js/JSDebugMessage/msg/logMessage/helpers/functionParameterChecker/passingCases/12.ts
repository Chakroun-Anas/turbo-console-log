// Class method with decorators (valid TypeScript - NestJS style)
export default {
  name: 'class method with decorators and parameter decorators',
  fileExtension: '.ts',
  lines: [
    '// @ts-nocheck',
    '',
    "@Controller('projects')",
    'export class ProjectController {',
    '  @Get()',
    "  @SuccessApiResponse('Success', [Object])",
    "  @ApiQuery({ name: 'fields', type: [String], required: false })",
    "  @ApiOptionalQuery('text', 'skip', 'take', 'withCount', { parameter: 'fields', type: [String] })",
    '  async findAll(',
    "    @Query('text') text?: string,",
    "    @Query('skip') skip?: number,",
    "    @Query('take') take?: number,",
    "    @Query('withCount') withCount?: boolean,",
    "    @Query('fields') fields?: FieldArray<Object>,",
    '  ): Promise<PagedResult<Object> | Object[]> {',
    '    return this.sdkProjectService.findSdkProjects(text, skip, take, withCount, fields);',
    '  }',
    '}',
  ],
  selectionLine: 9, // Line with "@Query('text') text?: string," (line 10 in 1-indexed = line 9 in 0-indexed)
  variableName: 'text',
};
