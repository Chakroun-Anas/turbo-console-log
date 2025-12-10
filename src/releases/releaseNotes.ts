export const releaseNotes: Record<
  string,
  {
    isPro: boolean;
    date?: Date;
  }
> = {
  '3.12.0': {
    isPro: false,
    date: new Date('2025-12-10'),
  },
  '3.11.0': {
    isPro: true,
    date: new Date('2025-12-01'),
  },
};
