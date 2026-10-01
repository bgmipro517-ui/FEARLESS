import './globals.css';

export const metadata = {
  title: 'Fearless Shops',
  description: 'Your Trust • Our Priority',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
