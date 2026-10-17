import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/content/content-editor";
import { Forbidden } from "@/components/admin/forbidden";
import { ButtonLink } from "@/components/ui/button";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Content & settings" };

export default async function ContentPage({ searchParams }: PageProps<"/admin/content">) {
  const user = await requirePageUser();
  if (!can(user.role, "content.manage")) return <Forbidden />;
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  return (
    <>
      <PageHeader
        title="Content & settings"
        description="Edit the garage's details, opening hours and the text and photos on the website. Changes go live when you save."
        actions={
          <ButtonLink href="/" target="_blank" variant="subtle" size="sm">
            View website
          </ButtonLink>
        }
      />
      <ContentEditor initial={settings} initialTab={tab} />
    </>
  );
}
