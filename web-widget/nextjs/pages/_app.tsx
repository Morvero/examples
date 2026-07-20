// Morvero + Next.js Pages Router: load the widget once in _app.
import Script from 'next/script';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://morvero.com/widget.js"
        data-feedback-key={process.env.NEXT_PUBLIC_MORVERO_KEY}
        strategy="afterInteractive"
      />
    </>
  );
}
