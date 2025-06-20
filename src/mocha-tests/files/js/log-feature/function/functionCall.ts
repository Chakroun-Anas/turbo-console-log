// @ts-nocheck
const setGlobal = useCallback(() => {
  someGlobal.value = true;
}, []);

const CustomIcon = styled(Image, {
  shouldForwardProp(propName) {
    return propName !== '$backgroundColor';
  },
})<{ $backgroundColor: BackgroundColor }>`
  cursor: pointer;
  background-color: ${(props) => {
    return iconBackgroundColor(props.$backgroundColor);
  }};
`;

function Form({ handle }: AcceleratorStripePaiementProps) {
  const theme = useTheme();
  const stripe = useCool();
  const elements = useElements();
}

function filesWithLintingIssues() {
  const proc = exec(
    `java -jar ${googleJavaFormatPath} --dry-run $(${javaFilesCommand})`,
    { silent: true },
  );

  if (proc.code !== 0) {
    throw new Error(proc.stderr);
  }

  return proc.stdout.split('\n').filter((x) => x);
}

function unifiedDiff(file) {
  const lintedProc = exec(
    `java -jar ${googleJavaFormatPath} --set-exit-if-changed ${file}`,
    { silent: true },
  );

  //Exit code 1 indicates lint violations, which is what we're expecting
  if (lintedProc.code !== 1) {
    throw new Error(lintedProc.stderr);
  }

  const diffProc = lintedProc.exec(`diff -U 0 ${file} -`, { silent: true });
  //Exit code 0 if inputs are the same, 1 if different, 2 if trouble.
  if (diffProc.code !== 0 && diffProc.code !== 1) {
    throw new Error(diffProc.stderr);
  }

  return {
    file,
    diff: diffProc.stdout,
  };
}
