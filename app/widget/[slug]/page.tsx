import { WidgetContainer } from "@/components/public/widget-container";

type WidgetPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ tenant?: string }>;
};

export default async function WidgetPage({
  params,
  searchParams,
}: WidgetPageProps) {
  const { slug } = await params;
  const { tenant } = (await searchParams) ?? {};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <WidgetContainer
        slug={slug}
        tenantId={tenant}
      />
    </div>
  );
}

