import { notFound } from "next/navigation";

const VALID_WORK_SLUGS = [
  "float",
  "7shifts",
  "sonnet",
  "teck",
  "telus-digital",
  "willowtree",
  "visier",
  "gojek",
] as const;

interface WorkExperiencePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return VALID_WORK_SLUGS.map((slug) => ({
    slug,
  }));
}

export default async function WorkExperiencePage({
  params,
}: WorkExperiencePageProps) {
  const { slug } = await params;

  const isValidSlug = (VALID_WORK_SLUGS as readonly string[]).includes(slug);

  if (!isValidSlug) {
    notFound();
  }

  return <main className="flex-1 w-full" />;
}
