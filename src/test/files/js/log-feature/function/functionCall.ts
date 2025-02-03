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
