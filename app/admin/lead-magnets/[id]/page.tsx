import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions/page-guard";
import { EditLeadMagnetForm } from "@/components/admin/edit-lead-magnet-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLeadMagnetPage({ params }: PageProps) {
  // Prüfe Berechtigung
  await requirePermission("lead_magnets.edit");
  
  const { id } = await params;
  const supabase = await createClient();
  
  // Fetch the lead magnet
  const { data: leadMagnet, error } = await supabase
    .from("lead_magnets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !leadMagnet) {
    notFound();
  }

  // Fetch the flow steps for this lead magnet
  const { data: flowSteps } = await supabase
    .from("flow_steps")
    .select("*")
    .eq("lead_magnet_id", id)
    .order("step_number", { ascending: true });

  // Merge flow steps into the lead magnet config
  const leadMagnetWithSteps = {
    ...leadMagnet,
    config: {
      ...leadMagnet.config,
      steps: flowSteps || []
    }
  };

  return <EditLeadMagnetForm leadMagnet={leadMagnetWithSteps} />;
}

