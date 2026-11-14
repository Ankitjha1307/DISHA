import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer;
let app: import("express").Express;

const OFFICER_EMAIL = "officer@test.local";
const OFFICER_PASSWORD = "TestOfficer!2026";
const TEST_UPLOAD_DIR = path.join(
  os.tmpdir(),
  `disha-uploads-test-${process.pid}`
);

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z3m0AAAAASUVORK5CYII=",
  "base64"
);

type TestAgent = ReturnType<typeof request.agent>;

async function registerCitizenAgent(email: string, name = "Test Citizen") {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ name, email, password: "CitizenPass!2026" })
    .expect(201);
  return agent;
}

function incidentFields(overrides: Record<string, string> = {}) {
  return {
    category: "fire",
    description:
      "Smoke is coming from a closed shop and people are moving away from the entrance.",
    locationLabel: "Alpha 2 Market, Greater Noida",
    latitude: "28.4791",
    longitude: "77.5145",
    ...overrides,
  };
}

function submitIncident(
  agent: TestAgent,
  overrides: Record<string, string> = {}
) {
  const builder = agent.post("/api/incidents");

  for (const [key, value] of Object.entries(incidentFields(overrides))) {
    builder.field(key, value);
  }

  return builder;
}

async function loginOfficerAgent() {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .send({ email: OFFICER_EMAIL, password: OFFICER_PASSWORD })
    .expect(200);
  return agent;
}

async function createVerifiedIncident(
  citizen: TestAgent,
  officer: TestAgent,
  overrides: Record<string, string> = {}
) {
  const created = await submitIncident(citizen, overrides).expect(201);
  const incidentId = created.body.incident.id as string;

  await officer
    .patch(`/api/officer/incidents/${incidentId}/review`)
    .send({})
    .expect(200);
  await officer
    .patch(`/api/officer/incidents/${incidentId}/verify`)
    .send({})
    .expect(200);

  return created.body.incident as {
    id: string;
    reportId: string;
    status: string;
  };
}

async function findResourceByCode(officer: TestAgent, code: string) {
  const response = await officer.get("/api/officer/resources").expect(200);
  const resource = response.body.resources.find(
    (item: { resourceCode: string }) => item.resourceCode === code
  );

  assert.ok(resource, `Expected seeded resource ${code}`);
  return resource as {
    id: string;
    resourceCode: string;
    availability: string;
  };
}

before(async () => {
  memoryServer = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = memoryServer.getUri("disha-test");
  process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-validation";
  process.env.CLIENT_ORIGIN = "http://localhost:3000";
  process.env.OFFICER_SEED_EMAIL = OFFICER_EMAIL;
  process.env.OFFICER_SEED_PASSWORD = OFFICER_PASSWORD;
  process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  // Keep tests hermetic: never send test images to a real Cloudinary account.
  process.env.CLOUDINARY_CLOUD_NAME = "";
  process.env.CLOUDINARY_API_KEY = "";
  process.env.CLOUDINARY_API_SECRET = "";

  const { connectDatabase } = await import("./config/db");
  await connectDatabase();

  const { seedDatabase } = await import("./services/seed");
  await seedDatabase();

  const { createApp } = await import("./app");
  app = createApp();
});

after(async () => {
  const { disconnectDatabase } = await import("./config/db");
  await disconnectDatabase();
  await memoryServer.stop();
  fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
});

test("GET /api/health reports a connected database", async () => {
  const response = await request(app).get("/api/health").expect(200);

  assert.equal(response.body.status, "ok");
  assert.equal(response.body.database, "connected");
});

test("CORS only advertises the configured frontend origin", async () => {
  const allowed = await request(app)
    .get("/api/health")
    .set("Origin", "http://localhost:3000")
    .expect(200);

  assert.equal(
    allowed.headers["access-control-allow-origin"],
    "http://localhost:3000"
  );

  // A browser on another origin receives the configured origin, not its own,
  // so the browser blocks the response. It never receives a wildcard.
  const otherOrigin = await request(app)
    .get("/api/health")
    .set("Origin", "http://evil.example")
    .expect(200);

  assert.equal(
    otherOrigin.headers["access-control-allow-origin"],
    "http://localhost:3000"
  );
  assert.notEqual(
    otherOrigin.headers["access-control-allow-origin"],
    "http://evil.example"
  );
  assert.notEqual(otherOrigin.headers["access-control-allow-origin"], "*");
});

test("state-changing requests from a foreign origin are rejected", async () => {
  const response = await request(app)
    .post("/api/health")
    .set("Origin", "http://evil.example")
    .expect(403);

  assert.match(response.body.error.message, /origin is not allowed/i);
});

test("unknown routes return a consistent JSON 404", async () => {
  const response = await request(app).get("/api/does-not-exist").expect(404);

  assert.match(response.body.error.message, /Route not found/);
});

test("seed creates the officer account and demo resources", async () => {
  const { User } = await import("./models/User");
  const { Resource } = await import("./models/Resource");

  assert.equal(await User.countDocuments({ role: "officer" }), 1);
  assert.equal(await Resource.countDocuments(), 6);
});

test("a citizen can register, receive a cookie and read their session", async () => {
  const agent = request.agent(app);

  const response = await agent
    .post("/api/auth/register")
    .send({
      name: "Asha Verma",
      email: "asha@test.local",
      password: "CitizenPass!2026",
    })
    .expect(201);

  assert.equal(response.body.user.role, "citizen");
  assert.equal(response.body.user.email, "asha@test.local");
  assert.equal(response.body.user.passwordHash, undefined);
  assert.match(response.headers["set-cookie"]?.[0] ?? "", /HttpOnly/);

  const me = await agent.get("/api/auth/me").expect(200);

  assert.equal(me.body.user.email, "asha@test.local");
  assert.equal(me.body.user.role, "citizen");
});

test("duplicate registration is rejected", async () => {
  const payload = {
    name: "Duplicate User",
    email: "duplicate@test.local",
    password: "CitizenPass!2026",
  };

  await request(app).post("/api/auth/register").send(payload).expect(201);

  const duplicate = await request(app)
    .post("/api/auth/register")
    .send(payload)
    .expect(409);

  assert.match(duplicate.body.error.message, /already exists/i);
});

test("a public registration cannot self-assign the officer role", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Role Attempt",
      email: "role-attempt@test.local",
      password: "CitizenPass!2026",
      role: "officer",
    })
    .expect(201);

  assert.equal(response.body.user.role, "citizen");
});

test("invalid registration input is rejected by the server", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "A",
      email: "not-an-email",
      password: "short",
    })
    .expect(400);

  assert.equal(response.body.error.message, "Validation failed");
});

test("invalid credentials are rejected with a generic message", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: OFFICER_EMAIL, password: "wrong-password" })
    .expect(401);

  assert.equal(response.body.error.message, "Invalid email or password");
});

test("the seeded officer can log in and access officer endpoints", async () => {
  const officer = request.agent(app);

  const login = await officer
    .post("/api/auth/login")
    .send({ email: OFFICER_EMAIL, password: OFFICER_PASSWORD })
    .expect(200);

  assert.equal(login.body.user.role, "officer");

  const dashboard = await officer.get("/api/officer/dashboard").expect(200);

  assert.equal(dashboard.body.kpis.activeIncidents, 0);
  assert.equal(dashboard.body.kpis.availableResources, 5);
  assert.ok(Array.isArray(dashboard.body.recentIncidents));
});

test("a citizen cannot access officer endpoints", async () => {
  const citizen = await registerCitizenAgent("forbidden@test.local");

  const response = await citizen
    .get("/api/officer/dashboard")
    .expect(403);

  assert.match(response.body.error.message, /permission/i);
});

test("unauthenticated requests cannot access protected endpoints", async () => {
  await request(app).get("/api/auth/me").expect(401);
  await request(app).get("/api/officer/dashboard").expect(401);
});

test("logout clears the session cookie", async () => {
  const citizen = await registerCitizenAgent("logout@test.local");

  await citizen.get("/api/auth/me").expect(200);
  await citizen.post("/api/auth/logout").expect(200);
  await citizen.get("/api/auth/me").expect(401);
});

test("a citizen can submit an incident with an image and read it back", async () => {
  const citizen = await registerCitizenAgent("reporter@test.local", "Reporter One");

  const created = await submitIncident(citizen)
    .attach("image", ONE_PIXEL_PNG, {
      filename: "evidence.png",
      contentType: "image/png",
    })
    .expect(201);

  const incident = created.body.incident;

  assert.match(incident.reportId, /^DSH-\d{4}-\d{4}$/);
  assert.equal(incident.status, "submitted");
  assert.equal(incident.severity, undefined);
  assert.equal(incident.location.label, "Alpha 2 Market, Greater Noida");
  assert.equal(incident.location.latitude, 28.4791);
  assert.ok(incident.imageUrl.startsWith("/uploads/"));

  const imageResponse = await request(app)
    .get(incident.imageUrl)
    .expect(200);
  assert.match(imageResponse.headers["content-type"] ?? "", /^image\/png/);

  const list = await citizen.get("/api/incidents/my").expect(200);
  assert.equal(
    list.body.incidents.some(
      (item: { id: string }) => item.id === incident.id
    ),
    true
  );

  const detail = await citizen
    .get(`/api/incidents/my/${incident.id}`)
    .expect(200);
  assert.equal(detail.body.incident.reportId, incident.reportId);
  assert.equal(detail.body.incident.officerNotes, undefined);
});

test("coordinates are optional but must be provided together", async () => {
  const citizen = await registerCitizenAgent("no-coordinates@test.local");

  const created = await submitIncident(citizen, {
    latitude: "",
    longitude: "",
  }).expect(201);

  assert.equal(created.body.incident.location.latitude, undefined);
  assert.equal(created.body.incident.location.longitude, undefined);

  const partial = await submitIncident(citizen, { longitude: "" }).expect(400);
  assert.equal(partial.body.error.message, "Validation failed");
});

test("invalid incident input is rejected", async () => {
  const citizen = await registerCitizenAgent("invalid-incident@test.local");

  const response = await submitIncident(citizen, {
    description: "too short",
    category: "not_a_category",
  }).expect(400);

  assert.equal(response.body.error.message, "Validation failed");
});

test("citizen-supplied status, severity and reporter fields are ignored", async () => {
  const citizen = await registerCitizenAgent("field-tamper@test.local");

  const response = await submitIncident(citizen, {
    status: "resolved",
    severity: "critical",
    reporterId: "000000000000000000000000",
  }).expect(201);

  assert.equal(response.body.incident.status, "submitted");
  assert.equal(response.body.incident.severity, undefined);
});

test("a non-image upload is rejected by content inspection", async () => {
  const citizen = await registerCitizenAgent("fake-image@test.local");

  const response = await submitIncident(citizen)
    .attach("image", Buffer.from("this is not an image"), {
      filename: "fake.png",
      contentType: "image/png",
    })
    .expect(400);

  assert.match(response.body.error.message, /valid JPEG, PNG or WebP/i);
});

test("an oversized image is rejected", async () => {
  const citizen = await registerCitizenAgent("large-image@test.local");

  const response = await submitIncident(citizen)
    .attach("image", Buffer.alloc(5 * 1024 * 1024 + 1, 1), {
      filename: "large.png",
      contentType: "image/png",
    })
    .expect(400);

  assert.match(response.body.error.message, /5 MB or smaller/i);
});

test("a citizen cannot read another citizen's report", async () => {
  const owner = await registerCitizenAgent("owner@test.local", "Owner");
  const stranger = await registerCitizenAgent("stranger@test.local", "Stranger");

  const created = await submitIncident(owner).expect(201);
  const incidentId = created.body.incident.id as string;

  await stranger.get(`/api/incidents/my/${incidentId}`).expect(404);

  const strangerList = await stranger.get("/api/incidents/my").expect(200);
  assert.equal(
    strangerList.body.incidents.some(
      (item: { id: string }) => item.id === incidentId
    ),
    false
  );
});

test("officers cannot use citizen incident endpoints", async () => {
  const officer = await loginOfficerAgent();

  await officer.get("/api/incidents/my").expect(403);

  const response = submitIncident(officer);
  const submitted = await response.expect(403);
  assert.match(submitted.body.error.message, /permission/i);
});

test("officers can review, set severity and verify a report", async () => {
  const citizen = await registerCitizenAgent("workflow@test.local");
  const officer = await loginOfficerAgent();

  const created = await submitIncident(citizen).expect(201);
  const incidentId = created.body.incident.id as string;
  const reportId = created.body.incident.reportId as string;

  const queue = await officer.get("/api/officer/incidents").expect(200);
  assert.equal(
    queue.body.incidents.some(
      (item: { id: string }) => item.id === incidentId
    ),
    true
  );

  const reviewed = await officer
    .patch(`/api/officer/incidents/${incidentId}/review`)
    .send({ notes: "Checking the reported location with the demo map." })
    .expect(200);

  assert.equal(reviewed.body.incident.status, "under_review");
  assert.equal(
    reviewed.body.incident.officerNotes,
    "Checking the reported location with the demo map."
  );

  const severity = await officer
    .patch(`/api/officer/incidents/${incidentId}/severity`)
    .send({ severity: "critical" })
    .expect(200);
  assert.equal(severity.body.incident.severity, "critical");

  const verified = await officer
    .patch(`/api/officer/incidents/${incidentId}/verify`)
    .send({ notes: "Accepted for a demo response." })
    .expect(200);

  assert.equal(verified.body.incident.status, "verified");
  assert.equal(verified.body.incident.severity, "critical");

  const filtered = await officer
    .get("/api/officer/incidents")
    .query({ status: "verified", category: "fire", q: reportId })
    .expect(200);

  assert.equal(filtered.body.incidents.length, 1);
  assert.equal(filtered.body.incidents[0].id, incidentId);

  const citizenDetail = await citizen
    .get(`/api/incidents/my/${incidentId}`)
    .expect(200);

  assert.equal(citizenDetail.body.incident.status, "verified");
  assert.equal(citizenDetail.body.incident.severity, "critical");
  assert.equal(citizenDetail.body.incident.officerNotes, undefined);
});

test("invalid officer status transitions are rejected", async () => {
  const citizen = await registerCitizenAgent("transitions@test.local");
  const officer = await loginOfficerAgent();

  const created = await submitIncident(citizen).expect(201);
  const incidentId = created.body.incident.id as string;

  const earlyVerify = await officer
    .patch(`/api/officer/incidents/${incidentId}/verify`)
    .send({})
    .expect(409);
  assert.match(earlyVerify.body.error.message, /under review/i);

  await officer
    .patch(`/api/officer/incidents/${incidentId}/review`)
    .send({})
    .expect(200);

  await officer
    .patch(`/api/officer/incidents/${incidentId}/reject`)
    .send({ notes: "Rejected during demo review." })
    .expect(200);

  const verifyRejected = await officer
    .patch(`/api/officer/incidents/${incidentId}/verify`)
    .send({})
    .expect(409);
  assert.match(verifyRejected.body.error.message, /under review/i);

  const severityRejected = await officer
    .patch(`/api/officer/incidents/${incidentId}/severity`)
    .send({ severity: "high" })
    .expect(409);
  assert.match(severityRejected.body.error.message, /rejected/i);
});

test("officers can reject a newly submitted report from the queue", async () => {
  const citizen = await registerCitizenAgent("reject-queue@test.local");
  const officer = await loginOfficerAgent();

  const created = await submitIncident(citizen).expect(201);
  const incidentId = created.body.incident.id as string;

  const rejected = await officer
    .patch(`/api/officer/incidents/${incidentId}/reject`)
    .send({ notes: "Duplicate of an existing demo report." })
    .expect(200);

  assert.equal(rejected.body.incident.status, "rejected");

  const detail = await officer
    .get(`/api/officer/incidents/${incidentId}`)
    .expect(200);
  assert.equal(detail.body.incident.officerNotes, "Duplicate of an existing demo report.");
});

test("citizens cannot invoke officer incident operations", async () => {
  const citizen = await registerCitizenAgent("citizen-officer@test.local");

  const created = await submitIncident(citizen).expect(201);
  const incidentId = created.body.incident.id as string;

  await citizen.get("/api/officer/incidents").expect(403);
  await citizen.get(`/api/officer/incidents/${incidentId}`).expect(403);
  await citizen
    .patch(`/api/officer/incidents/${incidentId}/review`)
    .send({})
    .expect(403);
  await citizen
    .patch(`/api/officer/incidents/${incidentId}/severity`)
    .send({ severity: "critical" })
    .expect(403);
});

test("officers can list resources and update demo availability", async () => {
  const officer = await loginOfficerAgent();
  const citizen = await registerCitizenAgent("resource-rbac@test.local");

  const resources = await officer.get("/api/officer/resources").expect(200);
  assert.equal(resources.body.resources.length, 6);

  const ambulance = await findResourceByCode(officer, "AMB-01");

  const updated = await officer
    .patch(`/api/officer/resources/${ambulance.id}/availability`)
    .send({ availability: "unavailable" })
    .expect(200);
  assert.equal(updated.body.resource.availability, "unavailable");

  await officer
    .patch(`/api/officer/resources/${ambulance.id}/availability`)
    .send({ availability: "available" })
    .expect(200);

  await officer
    .patch(`/api/officer/resources/${ambulance.id}/availability`)
    .send({ availability: "deployed" })
    .expect(400);

  await citizen.get("/api/officer/resources").expect(403);
  await citizen
    .patch(`/api/officer/resources/${ambulance.id}/availability`)
    .send({ availability: "unavailable" })
    .expect(403);
});

test("recommendations exclude incompatible resources and show straight-line distance", async () => {
  const citizen = await registerCitizenAgent("recommendation@test.local");
  const officer = await loginOfficerAgent();

  const incident = await createVerifiedIncident(citizen, officer, {
    category: "fire",
  });

  const response = await officer
    .get(`/api/officer/incidents/${incident.id}/recommendations`)
    .expect(200);

  assert.equal(response.body.proximityAvailable, true);
  assert.equal(response.body.recommendations.length, 1);

  const recommendation = response.body.recommendations[0];

  assert.equal(recommendation.resourceCode, "FIRE-01");
  assert.equal(recommendation.capabilities.includes("fire"), true);
  assert.equal(recommendation.availability, "available");
  assert.ok(recommendation.distanceKm > 0);
  assert.match(recommendation.explanation, /straight-line/i);
  assert.match(recommendation.explanation, /km/);
});

test("missing coordinates list eligible resources without inventing distance", async () => {
  const citizen = await registerCitizenAgent("no-proximity@test.local");
  const officer = await loginOfficerAgent();

  const incident = await createVerifiedIncident(citizen, officer, {
    category: "fire",
    latitude: "",
    longitude: "",
  });

  const response = await officer
    .get(`/api/officer/incidents/${incident.id}/recommendations`)
    .expect(200);

  assert.equal(response.body.proximityAvailable, false);
  assert.match(response.body.message, /coordinates/i);
  assert.equal(response.body.recommendations.length, 1);
  assert.equal(response.body.recommendations[0].distanceKm, undefined);
  assert.match(response.body.recommendations[0].explanation, /unavailable/i);
});

test("recommendations return a clear empty state when no resource is eligible", async () => {
  const citizen = await registerCitizenAgent("no-resource@test.local");
  const officer = await loginOfficerAgent();
  const shelter = await findResourceByCode(officer, "SHELTER-01");

  try {
    await officer
      .patch(`/api/officer/resources/${shelter.id}/availability`)
      .send({ availability: "unavailable" })
      .expect(200);

    const incident = await createVerifiedIncident(citizen, officer, {
      category: "other",
    });

    const response = await officer
      .get(`/api/officer/incidents/${incident.id}/recommendations`)
      .expect(200);

    assert.equal(response.body.recommendations.length, 0);
    assert.equal(response.body.proximityAvailable, true);
    assert.match(response.body.message, /No available demo resource/i);
  } finally {
    await officer
      .patch(`/api/officer/resources/${shelter.id}/availability`)
      .send({ availability: "available" })
      .expect(200);
  }
});

test("an officer can deploy a resource and duplicate assignments are rejected", async () => {
  const citizen = await registerCitizenAgent("deployment@test.local");
  const officer = await loginOfficerAgent();

  const incident = await createVerifiedIncident(citizen, officer, {
    category: "fire",
  });
  const recommendations = await officer
    .get(`/api/officer/incidents/${incident.id}/recommendations`)
    .expect(200);
  const fireUnit = recommendations.body.recommendations.find(
    (item: { resourceCode: string }) => item.resourceCode === "FIRE-01"
  );

  assert.ok(fireUnit);

  await citizen
    .post(`/api/officer/incidents/${incident.id}/deployments`)
    .send({ resourceId: fireUnit.id })
    .expect(403);

  const deployed = await officer
    .post(`/api/officer/incidents/${incident.id}/deployments`)
    .send({
      resourceId: fireUnit.id,
      notes: "Officer-confirmed demo deployment.",
    })
    .expect(201);

  assert.equal(deployed.body.incident.status, "dispatched");
  assert.equal(deployed.body.activeDeployment.status, "assigned");
  assert.equal(
    deployed.body.activeDeployment.resource.resourceCode,
    "FIRE-01"
  );
  assert.equal(deployed.body.activeDeployment.resource.availability, "deployed");

  const activeDeploymentId = deployed.body.activeDeployment.id as string;

  await citizen
    .patch(`/api/officer/deployments/${activeDeploymentId}`)
    .send({ status: "cancelled" })
    .expect(403);

  const availabilityBlocked = await officer
    .patch(`/api/officer/resources/${fireUnit.id}/availability`)
    .send({ availability: "unavailable" })
    .expect(409);
  assert.match(
    availabilityBlocked.body.error.message,
    /active deployment/i
  );

  const secondIncident = await createVerifiedIncident(citizen, officer, {
    category: "fire",
  });
  const duplicate = await officer
    .post(`/api/officer/incidents/${secondIncident.id}/deployments`)
    .send({ resourceId: fireUnit.id })
    .expect(409);
  assert.match(duplicate.body.error.message, /not currently available/i);

  const deployments = await officer
    .get("/api/officer/deployments")
    .expect(200);
  const listed = deployments.body.deployments.find(
    (item: { id: string }) => item.id === activeDeploymentId
  );

  assert.ok(listed);
  assert.equal(listed.incident.reportId, incident.reportId);
  assert.equal(listed.resource.resourceCode, "FIRE-01");

  const completed = await officer
    .patch(`/api/officer/deployments/${activeDeploymentId}`)
    .send({ status: "completed", notes: "Demo response complete." })
    .expect(200);

  assert.equal(completed.body.incident.status, "resolved");
  assert.equal(completed.body.activeDeployment, null);

  const freedResource = await findResourceByCode(officer, "FIRE-01");
  assert.equal(freedResource.availability, "available");

  const citizenDetail = await citizen
    .get(`/api/incidents/my/${incident.id}`)
    .expect(200);
  assert.equal(citizenDetail.body.incident.status, "resolved");

  await officer
    .patch(`/api/officer/deployments/${activeDeploymentId}`)
    .send({ status: "completed" })
    .expect(409);

  await officer
    .get(`/api/officer/incidents/${incident.id}/recommendations`)
    .expect(409);
});

test("cancelling a deployment returns the report to verified and frees the resource", async () => {
  const citizen = await registerCitizenAgent("deployment-cancel@test.local");
  const officer = await loginOfficerAgent();

  const incident = await createVerifiedIncident(citizen, officer, {
    category: "fire",
  });
  const recommendations = await officer
    .get(`/api/officer/incidents/${incident.id}/recommendations`)
    .expect(200);
  const fireUnit = recommendations.body.recommendations.find(
    (item: { resourceCode: string }) => item.resourceCode === "FIRE-01"
  );

  assert.ok(fireUnit);

  const deployed = await officer
    .post(`/api/officer/incidents/${incident.id}/deployments`)
    .send({ resourceId: fireUnit.id })
    .expect(201);

  const deploymentId = deployed.body.activeDeployment.id as string;

  await officer
    .patch(`/api/officer/deployments/${deploymentId}`)
    .send({ status: "assigned" })
    .expect(400);

  const cancelled = await officer
    .patch(`/api/officer/deployments/${deploymentId}`)
    .send({ status: "cancelled", notes: "Demo deployment cancelled." })
    .expect(200);

  assert.equal(cancelled.body.incident.status, "verified");
  assert.equal(cancelled.body.activeDeployment, null);

  const freedResource = await findResourceByCode(officer, "FIRE-01");
  assert.equal(freedResource.availability, "available");

  const recommendationsAgain = await officer
    .get(`/api/officer/incidents/${incident.id}/recommendations`)
    .expect(200);
  assert.equal(
    recommendationsAgain.body.recommendations.some(
      (item: { resourceCode: string }) => item.resourceCode === "FIRE-01"
    ),
    true
  );

  const redeployed = await officer
    .post(`/api/officer/incidents/${incident.id}/deployments`)
    .send({ resourceId: fireUnit.id })
    .expect(201);

  await officer
    .patch(`/api/officer/deployments/${redeployed.body.activeDeployment.id}`)
    .send({ status: "completed" })
    .expect(200);
});
