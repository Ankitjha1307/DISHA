import { connectDatabase, disconnectDatabase } from "./config/db";
import { Deployment } from "./models/Deployment";
import { Incident } from "./models/Incident";
import { Resource } from "./models/Resource";
import { User } from "./models/User";

async function main() {
  await connectDatabase();

  const [
    users,
    officers,
    incidents,
    resources,
    deployments,
    activeDeployments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "officer" }),
    Incident.countDocuments(),
    Resource.countDocuments(),
    Deployment.countDocuments(),
    Deployment.countDocuments({ status: "assigned" }),
  ]);

  console.log("MongoDB collections are available.");
  console.log(`Users: ${users} (officers: ${officers})`);
  console.log(`Incidents: ${incidents}`);
  console.log(`Resources: ${resources}`);
  console.log(`Deployments: ${deployments} (active: ${activeDeployments})`);

  await disconnectDatabase();
}

main().catch(async (error) => {
  const message =
    error instanceof Error ? error.message : "Unknown database check error";
  console.error(`Database check failed: ${message}`);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
