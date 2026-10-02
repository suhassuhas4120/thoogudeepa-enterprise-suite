import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../providers/QueryProvider';
import { CustomerProvider } from '../context/CustomerContext';
import { BridgeSyncProvider } from '../providers/BridgeSyncProvider';

export const metadata: Metadata = {
  title: 'Thoogudeepa Donne Biryani Mane',
  description: 'Authentic Donne Biryani - Dine-in, Takeaway & Table Ordering',
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
          <CustomerProvider>
            {/* BridgeSyncProvider activates Supabase Realtime CDC for the shared bridge */}
            <BridgeSyncProvider>
              {children}
            </BridgeSyncProvider>
          </CustomerProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
