import Prisma from "../src/db";
import { server } from "../src/server";

var created_users: string[] = [];

async function createUser(
  title = "Placeholder",
  description = "Placeholder",
) {
  const testEntry = await Prisma.user.create({
    data: {
      title,
      description,
      rating: 0.0
    },
  });
  created_users.push(testEntry.id);

  return testEntry;
}

async function deleteUser(id: string) {
  await Prisma.user.delete({ where: { id: id } });
  created_users.pop();
}

async function cleanDatabase() {
  // the stories should in turn delete
  while (created_users.length > 0) {
    const id = created_users.pop();
    await Prisma.user.delete({ where: { id: id } });
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

test("Valid request on create route", async () => {
  const request = {
  };

  const response = await server.inject({
    method: "POST",
    url: "/create/",
    payload: request,
  });
  expect(response.statusCode).toEqual(200);

  const body = JSON.parse(response.body);
  created_users.push(body.id);
  await deleteUser(body.id);
});