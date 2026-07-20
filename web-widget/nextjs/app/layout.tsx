// Morvero + Next.js App Router: load the widget once in the root layout.
// Client-side only — the widget is a browser Shadow-DOM component; there is
// nothing to configure on the server.
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://morvero.com/widget.js"
          data-feedback-key={process.env.NEXT_PUBLIC_MORVERO_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
