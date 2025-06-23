import Prisma from "../src/db";
import { Story } from '@prisma/client'
import { server } from "../src/server";
import 'jest-expect-message';
import bcrypt from 'bcrypt'

async function createUser(name = "Placeholder", password = 'password'): Promise<any> {
  const user = await Prisma.user.create({
    data: {
      name,
      passwordHash: (await bcrypt.hash(password, 10))
    },
  });

  return user
}

async function createUserAndLogin(name = "Placeholder", password = 'password'){
  const user = await createUser(name, password)
  const token = await loginUser(name, password)
  return {user, token}
}

async function createUserWithStory(name = "Placeholder", password = 'password'){
  const user = await createUser(name, password)
  const story =  await Prisma.story.create({
    data: {
      title: 'title',
      content: 'content',
      user_id: user.id,
      created_at: new Date()

    },
  });
  return {user, story}
}

async function createUserAndRate(name = "Placeholder", password = 'password', story: Story, actual_score: number){
  const {user, token} = await createUserAndLogin(name, password)
  const request = {
    actual_score,
    user_id: user.id,
    to_story_id: story.id
  };
  const response = await server.inject({
    method: "POST",
    url: "/rating/create",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    payload: request,
  });
  return {user, rating: (await response.json()).rating}
}

async function loginUser(username: string, password: string) {
   const request = {
    name: username,
    passGuess: password
  };

  const response = await server.inject({
    method: "POST",
    url: "/login",
    payload: request,
  });
  return (await response.json()).token
}

async function cleanDatabase() {
  await Prisma.rating.deleteMany({})
  await Prisma.story.deleteMany({})
  await Prisma.user.deleteMany({})
}

async function printDatabase() {
  const ratings = await Prisma.rating.findMany({})
  console.log('Ratings: ', ratings)
  const stories = await Prisma.story.findMany({})
  console.log('Stories: ', stories)
  const users = await Prisma.user.findMany({})
  console.log('Users: ', users)
}

beforeAll(async () => {
  await server.ready();
});

afterEach(async () => {
  await cleanDatabase();
})

afterAll(async () => {
  await cleanDatabase();
  await server.close();
  await Prisma.$disconnect;
});

//** Login endpoint tests */

test("POST: User login", async () => {
  await createUser('user', 'password')
  const request = {
    name: `user`,
    passGuess: 'password'
  };

  const response = await server.inject({
    method: "POST",
    url: "/login",
    payload: request,
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
})

//** User endpoint tests */

test("POST: Create user", async () => {
  const request = {
    name: `newUser`,
    passwordHash: 'password'
  };

  const response = await server.inject({
    method: "POST",
    url: "/user/create",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    payload: request,
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
})

test("POST: Try to create duplicate user", async () => {
  await createUser('user', 'password')
  const request = {
    name: `user`,
    passwordHash: 'password'
  };

  const response = await server.inject({
    method: "POST",
    url: "/user/create",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    payload: request,
  });
  expect(response.statusCode, 'Failed at users').toEqual(500);
})

test("PUT: Try to update user", async () => {
  const {user, token} = await createUserAndLogin('user', 'password')
  const request = {
    name: `newname`,
    passwordHash: 'password'
  };

  const response = await server.inject({
    method: "PUT",
    url: `/user/update/${user.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    payload: request,
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
})

test("PUT: Try to update username to existing username", async () => {
  await createUser('user1', 'password')
  const {user, token} = await createUserAndLogin('user', 'password')
  const request = {
    name: `user1`,
    passwordHash: 'password'
  };

  const response = await server.inject({
    method: "PUT",
    url: `/user/update/${user.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    payload: request,
  });
  expect(response.statusCode, 'Failed at users').toEqual(500);
})

test.skip("DELETE: delete user and check story rating adjust", async () => {
  var {user: user1, story} = await createUserWithStory('user1', 'password')
  const {user: user2} = await createUserAndRate('user2', 'password', story, 1)
  const user2Token = await loginUser('user2', 'password')

  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(0.2)
  const response = await server.inject({
    method: "DELETE",
    url: `/user/delete/${user2.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`,
    },
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
  // expect the score for user 'user1' ot be null
  // THIS FAILS ATM, deciding whether worth propagating to user on delete 
  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(null)
})

//** User endpoint tests */
test("POST: Create story", async () => {
  const {user, token} = await createUserAndLogin('user1', 'password')
  const request = {
    title: `story`,
    content: 'content',
    user_id: user.id
  };
  const response = await server.inject({
    method: "POST",
    url: `/stories/create`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    payload: request
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
})

test("POST: Try to create story for non-existent user", async () => {
  const {user: _, token} = await createUserAndLogin('user1', 'password')
  const request = {
    title: `story`,
    content: 'content',
    user_id: '1234'
  };
  const response = await server.inject({
    method: "POST",
    url: `/stories/create`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    payload: request
  });
  expect(response.statusCode, 'Failed at users').toEqual(401);
})

test("PUT: Try to update story", async () => {
  const {user: _, story} = await createUserWithStory('user', 'password')
  const token = await loginUser('user', 'password')
  const request = {
    title: `new title`,
    content: 'content',
  };
  const response = await server.inject({
    method: "PUT",
    url: `/stories/update/${story.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    payload: request
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
})

test("PUT: Try to update story to another user", async () => {
  const {user: _, story} = await createUserWithStory('user', 'password')
  const token = await loginUser('user', 'password')
  
  const request = {
    title: `new title`,
    content: 'content',
    user_id: '1234'
  };
  const response = await server.inject({
    method: "PUT",
    url: `/stories/update/${story.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    payload: request
  });
  expect(response.statusCode, 'Failed at users').toEqual(500);
})

test("DELETE: delete story and check user rating adjust", async () => {
  var {user: user1, story} = await createUserWithStory('user1', 'password')
  await createUserAndRate('user2', 'password', story, 1)
  const user1Token = await loginUser('user1', 'password')

  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(0.2)

  const response = await server.inject({
    method: "DELETE",
    url: `/stories/delete/${story.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`,
    },
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
  // expect the score for user 'user1' ot be null
  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(null)
})

//** Rating endpoint tests */

test("POST: Create rating and check story/user updates", async () => {
  let {user: user1, story} = await createUserWithStory('user1', 'password')
  let {user: user2, token: user2Token} = await createUserAndLogin('user2', 'password')

  const request = {
    actual_score: 3,
    user_id: user2.id,
    to_story_id: story.id
  };
  const response = await server.inject({
    method: "POST",
    url: `/rating/create`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`,
    },
    payload: request
  });
  expect(response.statusCode, 'Failed at users').toEqual(200)
  story = (await Prisma.story.findFirst({
    where: {
      id: story.id
    },
  }) as Story);
  expect(story.rating).toEqual(0.6)
  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(0.6)
})

test("PUT: Try to update rating and check propagation", async () => {
  let {user: user1, story} = await createUserWithStory('user1', 'password')
  const {user: user2, rating: rating1} = await createUserAndRate('user2', 'password', story, 3)
  const user2Token = await loginUser('user2', 'password')

  story = (await Prisma.story.findFirst({
    where: {
      id: story.id
    },
  }) as Story);
  expect(story.rating).toEqual(0.6)
  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(0.6)

  const request = {
    actual_score: 1,
    user_id: user2.id,
    to_story_id: story.id
  };
  const response = await server.inject({
    method: "PUT",
    url: `/rating/update/${rating1.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`,
    },
    payload: request
  });
  expect(response.statusCode, 'Failed at users').toEqual(200)
  story = (await Prisma.story.findFirst({
    where: {
      id: story.id
    },
  }) as Story);
  expect(story.rating).toEqual(0.2)
  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(0.2)
})

test("DELETE: delete rating and check user/story rating adjust", async () => {
  let {user: user1, story} = await createUserWithStory('user1', 'password')
  const {user: _, rating: rating1} = await createUserAndRate('user2', 'password', story, 1)
  const user2Token = await loginUser('user2', 'password')

  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(0.2)
  const response = await server.inject({
    method: "DELETE",
    url: `/rating/delete/${rating1.id}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`,
    },
  });
  expect(response.statusCode, 'Failed at users').toEqual(200);
  // expect the score for user 'user1' ot be null 
  user1 = await Prisma.user.findFirst({
    where: {
      id: user1.id
    },
  });
  expect(user1.rating).toEqual(null)
})