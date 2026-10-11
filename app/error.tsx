'use client';

/** Route-level error boundary: keeps the app recoverable instead of a blank screen. */
export default function ErrorPage({ error, reset }: { error: { message: string }; reset: () => void }) {
  return (
    <main role="alert">
      <h1>Something went wrong</h1>
      <p className="m">{error.message}</p>
      <button className="pri" onClick={reset}>Try again</button>
    </main>
  );
}
