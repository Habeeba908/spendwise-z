import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpendWise Z — Survive the Month on ₹10,000',
  description: 'Gen Z personal finance simulator: income, commitments, subscriptions, savings goals, unexpected expenses, forecast, risk and health.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b0d14' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip" href="#main-content">Skip to main content</a>{children}</body></html>;
}
