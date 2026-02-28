
export const metadata = {
  title: 'Inventory (TanStack + MUI)',
  description: 'Multi-layer table built with TanStack Table and Material UI on Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
