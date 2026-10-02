import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../providers/QueryProvider';
import { CustomerProvider } from '../context/CustomerContext';

export const metadata: Metadata = {
  title: 'Customer Experience Framework | React 19 + Next.js',
  description: '10-Screen Customer Journey Architecture for Modern Restaurant SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <CustomerProvider>{children}</CustomerProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
