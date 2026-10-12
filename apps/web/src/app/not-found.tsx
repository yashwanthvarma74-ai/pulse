import Link from 'next/link';

export default function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>
        That page does not exist. <Link href="/">Back to the feed</Link>
      </p>
    </section>
  );
}
