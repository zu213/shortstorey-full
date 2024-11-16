import Prisma from "../src/db";
import { server } from "../src/server";
import 'jest-expect-message';

var created_users: Return_User[] = [];
var created_stories: Return_Story[] = []

type Rating = {
  actual_score:number
  user_id:string
  story_id:string
}

type Story = {
  title:string
  content:string
  user_id:string
}

type User = {
  title:string
}

type Return_User = {
  id: string
}

type Return_Story = {
  id: string
}

async function createUser(
  title = "Placeholder",
) {
  const user = await Prisma.user.create({
    data: {
      title,
    },
  });
  created_users.push(user);

  return user
}

async function deleteUser(id: string) {
  await Prisma.user.delete({ where: { id: id } });
  created_users.pop();
}

async function slowlyCleanDatabase() {
  // the stories should in turn delete
  while (created_users.length > 0) {
    const user = created_users.pop();
    const id = user ? user.id: ''
    await Prisma.user.delete({ where: { id: id } });
  }
}

async function cleanDatabase() {
  await Prisma.rating.deleteMany({}) //delete posts first
  await Prisma.story.deleteMany({})
  await Prisma.user.deleteMany({})
}

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await cleanDatabase();
  await server.close();
  await Prisma.$disconnect;
});

test("Simulated database example, add user and scores update", async () => {
  
  // Populate database with users
  for(var i = 0; i < 5; i++){
    const request = {
      title: `newUser-${i}`,
    };

    const response = await server.inject({
      method: "POST",
      url: "/user/create/",
      payload: request,
    });
    expect(response.statusCode, 'Failed at users').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_users.push(body);
  }

  // create some stories for user 1
  for(var i = 0; i < 2; i++){
    const request:Story = {
      title: `Story-${i}`,
      content: '',
      user_id: created_users[0].id
    };

    const response = await server.inject({
      method: "POST",
      url: "/story/create/",
      payload: request,
    });
    console.log(response)
    expect(response.statusCode, 'Failed at stories').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_stories.push(body);

  }

  // create some stories for user 2
  for(var i = 0; i < 2; i++){
    const request:Story = {
      title: `Story-${i}`,
      content: '',
      user_id: created_users[1].id
    };

    const response = await server.inject({
      method: "POST",
      url: "/story/create/",
      payload: request,
    });
    expect(response.statusCode, 'Failed at stories').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_stories.push(body.id);

  }

  // Now give some ratings
  for(var i = 1; i < 5; i++){
    const request:Rating = {
      actual_score: i,
      user_id: created_users[i].id,
      story_id: created_stories[0].id
    };

    const response = await server.inject({
      method: "POST",
      url: "/rating/create/",
      payload: request,
    });
    expect(response.statusCode, 'Failed at ratings').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_stories.push(body.id);

  }

});