// @ts-nocheck

export default function generator(plop: NodePlopAPI): void {
  // make our custom helpers available for use in templates as handlebars helpers
  helpers.init(plop);

  plop.setGenerator('test', {
    description: 'Create a new test',
    actions: function (answers) {
      const { name } = answers as ErrorResponse;
      const errorsRoot = path.join(plop.getDestBasePath(), 'errors');

      return [
        {
          type: 'add',
          path: path.join(errorsRoot, `{{ toFileName name }}.mdx`),
          templateFile: path.join(errorsRoot, `template.txt`),
        },
        `Url for the error: https://nextjs.org/docs/messages/${helpers.toFileName(
          name,
        )}`,
      ];
    },
  });
}
