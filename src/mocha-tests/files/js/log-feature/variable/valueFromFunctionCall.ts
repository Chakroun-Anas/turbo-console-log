// @ts-nocheck

export function useUserSettings() {
  const currencies = useQuery({
    enabled: false,
    queryFn: () => sdk.unified.getCurrencies(),
    queryKey: ['settings', 'currencies'],
  });
  const setCurrentCurrency = (value: string) => {
    setCookie(CURRENCY_COOKIE, value, {
      sameSite: 'strict',
      secure: true,
    });
    currencies.refetch();
    queryClient.removeQueries({
      queryKey: ['lazyProduct'],
      type: 'active',
    });
    setCurrency(value);
  };
  return { setCurrentCurrency, setCurrentLocale };
}
