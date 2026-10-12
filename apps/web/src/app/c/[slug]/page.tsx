import Community from '@/components/pages/Community';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Community slug={slug} />;
}
