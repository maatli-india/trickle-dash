import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/session";
import { DeletionReasonsDashboard } from "./DeletionReasonsDashboard";

export const metadata = { title: "Account deletion reasons — Trickle Dash" };

export default async function DeletionsPage() {
  const session = await getSession();
  if (!session || !["admin", "product_growth"].includes(session.role)) unauthorized();

  return <DeletionReasonsDashboard />;
}