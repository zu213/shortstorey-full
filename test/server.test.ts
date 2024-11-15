import Prisma from "../src/db";
import { server } from "../src/server";

var created_entries: string[] = [];

async function createEntry(
  title = "Placeholder",
  description = "Placeholder",
  created_at = new Date(),
  scheduled_for = new Date()
) {
  const testEntry = await Prisma.entry.create({
    data: {
      title: title,
      description: description,
      created_at: created_at,
      scheduled_for: scheduled_for,
    },
  });
  created_entries.push(testEntry.id);

  return testEntry;
}

async function deleteEntry(id: string) {
  await Prisma.entry.delete({ where: { id: id } });
  created_entries.pop();
}

async function cleanDatabase() {
  while (created_entries.length > 0) {
    const id = created_entries.pop();
    await Prisma.entry.delete({ where: { id: id } });
  }
}

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await cleanDatabase();
  await server.close();
  await Prisma.$disconnect;
});

// create route tests

test("Valid request on create route", async () => {
  const request = {
    title: "",
    description: "",
    created_at: new Date(),
    scheduled_for: new Date(),
  };

  const response = await server.inject({
    method: "POST",
    url: "/create/",
    payload: request,
  });
  expect(response.statusCode).toEqual(200);

  const body = JSON.parse(response.body);
  created_entries.push(body.id);
  await deleteEntry(body.id);
});

test("Invalid request on create route - empty", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/create/",
    payload: {},
  });
  expect(response.statusCode).toEqual(500);
});

test("Invalid request on create route - created at", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/create/",
    payload: { title: "", description: "", created_at: "Friday" },
  });
  expect(response.statusCode).toEqual(500);
});

test("Request without scheduled_for on create route", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/create/",
    payload: { title: "", description: "", created_at: new Date() },
  });
  expect(response.statusCode).toEqual(200);

  const body = JSON.parse(response.body);
  created_entries.push(body.id);
  await deleteEntry(body.id);
});

// /get/ route tests

test('requests the "/get/" route', async () => {
  const response = await server.inject({
    method: "GET",
    url: "/get/",
  });
  expect(response.statusCode).toEqual(200);
});

test('requests the "/get/" route expecting responses', async () => {
  const testEntry = await createEntry("/get/test");

  const response = await server.inject({
    method: "GET",
    url: "/get/",
  });
  expect(response.statusCode).toEqual(200);

  const body = JSON.parse(response.body);

  for (var i in body) {
    const parsed_i = JSON.parse(i);
    if (parsed_i.id == testEntry.id) {
      expect(parsed_i.title).toEqual("/get/test");
      break;
    }
  }

  await deleteEntry(testEntry.id);
});

// /get/:id route tests

test('Valid request to "/get/id" route', async () => {
  const testEntry = await createEntry("/get/id/test");

  const response = await server.inject({
    method: "GET",
    url: `/get/${testEntry.id}`,
  });
  expect(response.statusCode).toEqual(200);

  const body = JSON.parse(response.body);

  expect(body.title).toEqual("/get/id/test");
  expect(body.id).toEqual(testEntry.id);

  await deleteEntry(testEntry.id);
});

test('invalid request to "/get/id" route - does not exist', async () => {
  const response = await server.inject({
    method: "GET",
    url: "/get/randomuuid12345",
  });
  expect(response.statusCode).toEqual(500);
});

// /delete/:id route tests

test("Valid request to delete route", async () => {
  const count_before = await Prisma.entry.count();
  const testEntry = await createEntry();

  const response = await server.inject({
    method: "DELETE",
    url: `/delete/${testEntry.id}`,
  });
  expect(response.statusCode).toEqual(200);
  const count_after = await Prisma.entry.count();
  expect(count_before).toEqual(count_after);

  // make sure to kick it out of list if successful
  created_entries.pop();
});

test("invalid request to delete route - does not exist", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: "/delete/randomuuid1234",
  });
  expect(response.statusCode).toEqual(500);
});

// /update/:id route tests

test('Valid request to "/update/id" route', async () => {
  const testEntry = await createEntry();
  const testDate = new Date();

  const response = await server.inject({
    method: "PUT",
    url: `/update/${testEntry.id}`,
    payload: { title: "New title", description: "New description", created_at: testDate, scheduled_for: testDate },
  });
  expect(response.statusCode).toEqual(200);

  const entry = await Prisma.entry.findFirst({ where: { id: testEntry.id } });
  expect(entry?.title).toEqual("New title");
  expect(entry?.description).toEqual("New description");
  expect(entry?.created_at).toEqual(testDate);
  expect(entry?.scheduled_for).toEqual(testDate);

  await deleteEntry(testEntry.id);
});

test('invalid request to "/update/id" route - does not exist', async () => {
  const response = await server.inject({
    method: "PUT",
    url: `/update/randomuuid12345`,
    payload: { title: "", description: "", created_at: new Date() },
  });
  expect(response.statusCode).toEqual(500);
});

test('invalid request to "/update/id" route - invalid title format', async () => {
  const testEntry = await createEntry();

  const response = await server.inject({
    method: "PUT",
    url: `/update/${testEntry.id}`,
    payload: { title: 123, description: "Placeholder", created_at: new Date() },
  });
  expect(response.statusCode).toEqual(500);

  await deleteEntry(testEntry.id);
});

test('Invalid request on "/update/id" route - invalid description format', async () => {
  const testEntry = await createEntry();

  const response = await server.inject({
    method: "PUT",
    url: `/update/${testEntry.id}`,
    payload: { title: "Placeholder", description: 123, created_at: new Date() },
  });
  expect(response.statusCode).toEqual(500);

  await deleteEntry(testEntry.id);
});

test('Invalid request on "/update/id" route - invalid created at format', async () => {
  const testEntry = await createEntry();

  const response = await server.inject({
    method: "PUT",
    url: `/update/${testEntry.id}`,
    payload: { title: "Placeholder", description: "Placeholder", created_at: "Friday" },
  });
  expect(response.statusCode).toEqual(500);

  await deleteEntry(testEntry.id);
});
