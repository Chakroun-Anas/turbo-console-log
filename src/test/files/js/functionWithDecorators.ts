// @ts-nocheck

@Get()
  @SuccessApiResponse('Success', [Object])
  @ApiQuery({ name: 'fields', type: [String], required: false })
  @ApiOptionalQuery('text', 'skip', 'take', 'withCount', { parameter: 'fields', type: [String] })
  async function findAll(
    @Query('text') text?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('withCount') withCount?: boolean,
    @Query('fields') fields?: FieldArray<Object>,
  ): Promise<PagedResult<Object> | Object[]> {
    return this.sdkProjectService.findSdkProjects(text, skip, take, withCount, fields);
}