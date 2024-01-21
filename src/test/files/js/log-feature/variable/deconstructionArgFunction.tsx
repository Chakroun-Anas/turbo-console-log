// @ts-nocheck

export function FancyComponent({
  importantProp,
}: FancyComponentProps): JSX.Element {
  const someContext = React.useContext(GreatContext);
  return (
    <SomeComponent
      isGreat
      steps={steps.map(({ step, name, stepFields }) => {
        return {
          name,
          step,
          allowNext: stepFields.every(({ name, isRequired }) => {
            return (
              !isRequired ||
              (!!formContext?.watch(name) && !formContext?.errors?.[name])
            );
          }),
        };
      })}
    />
  );
}
