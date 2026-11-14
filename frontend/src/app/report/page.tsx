import { redirect } from "next/navigation";

export default function LegacyReportRedirect() {
  redirect("/report-incident");
}
