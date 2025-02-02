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
