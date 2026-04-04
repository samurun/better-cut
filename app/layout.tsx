import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Better Cut — Auto Subtitle Generator',
  description: 'สร้าง subtitle อัตโนมัติจากวิดีโอด้วย AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        'h-full',
        'dark antialiased',
        inter.variable,
        geistMono.variable,
        'font-sans'
      )}
    >
      <body className='h-full lg:overflow-hidden overflow-y-auto'>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
