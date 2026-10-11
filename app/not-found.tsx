import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p className="m">That page does not exist.</p>
      <Link href="/">Back to SpendWise Z</Link>
    </main>
  );
}
