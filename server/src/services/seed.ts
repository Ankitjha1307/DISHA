import bcrypt from "bcryptjs";

import { env } from "../config/env";
import { Resource } from "../models/Resource";
import { User } from "../models/User";

const demoResources = [
  {
    resourceCode: "AMB-01",
    name: "Alpha 1 ambulance unit",
    type: "ambulance",
    capabilities: ["medical_emergency", "road_accident"],
    location: {
      label: "Alpha 1, Greater Noida",
      latitude: 28.4757,
      longitude: 77.5101,
    },
    availability: "available",
  },
  {
    resourceCode: "AMB-02",
    name: "Knowledge Park ambulance",
    type: "ambulance",
    capabilities: ["medical_emergency", "road_accident"],
    location: {
      label: "Knowledge Park II, Greater Noida",
      latitude: 28.4744,
      longitude: 77.504,
    },
    availability: "available",
  },
  {
    resourceCode: "FIRE-01",
    name: "Fire station Sector 37, unit 1",
    type: "fire_unit",
    capabilities: ["fire", "building_damage"],
    location: {
      label: "Sector 37, Greater Noida",
      latitude: 28.5642,
      longitude: 77.3485,
    },
    availability: "available",
  },
  {
    resourceCode: "FIRE-02",
    name: "Fire station Surajpur, unit 2",
    type: "fire_unit",
    capabilities: ["fire", "building_damage", "road_accident"],
    location: {
      label: "Surajpur, Greater Noida",
      latitude: 28.5124,
      longitude: 77.4668,
    },
    availability: "deployed",
  },
  {
    resourceCode: "RESCUE-01",
    name: "Demo rescue team",
    type: "rescue_team",
    capabilities: ["flooding", "building_damage", "road_accident"],
    location: {
      label: "Knowledge Park V, Greater Noida",
      latitude: 28.4513,
      longitude: 77.4899,
    },
    availability: "available",
  },
  {
    resourceCode: "SHELTER-01",
    name: "Community shelter, Sector 62",
    type: "shelter",
    capabilities: ["flooding", "building_damage", "other"],
    location: {
      label: "Sector 62, Greater Noida",
      latitude: 28.6255,
      longitude: 77.3577,
    },
    availability: "available",
  },
] as const;

export async function seedDatabase() {
  const officerEmail = env.OFFICER_SEED_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(env.OFFICER_SEED_PASSWORD, 12);

  await User.findOneAndUpdate(
    { email: officerEmail },
    {
      $set: {
        name: "Demo Officer",
        email: officerEmail,
        role: "officer",
      },
      // Keep an existing officer password when the seed is re-run against a
      // persistent database. The password is only set when the account is
      // first created.
      $setOnInsert: { passwordHash },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await Resource.bulkWrite(
    demoResources.map((resource) => ({
      updateOne: {
        filter: { resourceCode: resource.resourceCode },
        update: {
          $set: {
            resourceCode: resource.resourceCode,
            name: resource.name,
            type: resource.type,
            capabilities: resource.capabilities,
            location: resource.location,
          },
          // Availability reflects live demo state. Only use the seeded value
          // when the resource is first created; never reset an active
          // deployment just because the seed script ran again.
          $setOnInsert: { availability: resource.availability },
        },
        upsert: true,
      },
    }))
  );

  return {
    officerEmail,
    resourceCount: demoResources.length,
  };
}
