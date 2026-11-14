import { Counter } from "../models/Counter";

/**
 * Generates a human-readable report ID such as DSH-2026-0001.
 * The Counter collection keeps the sequence unique per year, and the
 * Incident.reportId unique index provides a final collision guard.
 */
export async function generateReportId() {
  const year = new Date().getFullYear();
  const key = `incident-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  ).lean();

  if (!counter) {
    throw new Error("Could not generate an incident report ID");
  }

  return `DSH-${year}-${String(counter.seq).padStart(4, "0")}`;
}
