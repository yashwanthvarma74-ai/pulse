import Link from 'next/link';
import { splitMentions } from '@pulse/shared';

// Post text as React text, never HTML, with @mentions turned into links to profiles.
export default function PostText({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {splitMentions(text).map((part, index) =>
        part.mention ? (
          <Link key={index} href={`/u/${part.mention}`}>
            {part.text}
          </Link>
        ) : (
          part.text
        ),
      )}
    </p>
  );
}
