import Prisma from "../src/db";
import { User, Rating, Story } from '@prisma/client'
import { server } from "../src/server";
import 'jest-expect-message';
import bcrypt from 'bcrypt'

var created_users: Return_User[] = [];
var created_stories: Return_Story[] = []
var created_ratings: Return_Rating[] = []



type Return_User = {
  id: string
}

type Return_Story = {
  id: string
}

type Return_Rating = {
  id: string
}

async function createUser(name = "Placeholder", password = 'password'): Promise<any> {
  const user = await Prisma.user.create({
    data: {
      name,
      passwordHash: (await bcrypt.hash(password, 10))
    },
  });
  created_users.push(user); // to be removed

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
  const user = await createUser(name, password)
  const rating =  await Prisma.rating.create({
    data: {
      actual_score,
      to_story_id: story.id,
      user_id: user.id,
      created_at: new Date(),
      rating_power: 1
    },
  });
  return {user, rating}
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

test("DELETE: delete user and check story rating adjust", async () => {
  const {user, story} = await createUserWithStory('user1', 'password')
  const {user: user2, rating: _} = await createUserAndRate('user2', 'password', story, 1)
  const user2Token = await loginUser('user2', 'password')

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
  // expect the score ot be null 
})

//** User endpoint tests */

test("POST: Create story", async () => {

})

test("POST: Try to create story for non-existent user", async () => {

})

test("PUT: Try to update story", async () => {

})

test("PUT: Try to update story to another user", async () => {

})

test("DELETE: delete story and check user rating adjust", async () => {

})

//** Rating endpoint tests */

test("POST: Create rating and check story/user updates", async () => {

})

test("POST: Create third rating and check story/user updates", async () => {

})

test("PUT: Try to update rating and check propagation", async () => {

})

test("PUT: Try to update story to another story / user", async () => {

})

test("DELETE: delete rating and check user/story rating adjust", async () => {

})


//** Old tests */

test("Simulated database example, add user and scores update", async () => {
  
  // Populate database with users
  for(var i = 0; i < 5; i++){
    const request = {
      name: `newUser-${i}`,
      passwordHash: 'throwaway'
    };

    const response = await server.inject({
      method: "POST",
      url: "/user/create",
      payload: request,
    });
    expect(response.statusCode, 'Failed at users').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_users.push(body);
  }

  // create some stories for user 1
  for(var i = 0; i < 2; i++){
    const request:any = {
      title: `Story-${i}`,
      content: '',
      user_id: created_users[0].id
    };

    const response = await server.inject({
      method: "POST",
      url: "/stories/create",
      payload: request,
    });
    console.log(response)
    expect(response.statusCode, 'Failed at stories').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_stories.push(body);

  }

  // create some stories for user 2
  for(var i = 0; i < 2; i++){
    const request:any = {
      title: `Story-${i}`,
      content: '',
      user_id: created_users[1].id
    };

    const response = await server.inject({
      method: "POST",
      url: "/stories/create",
      payload: request,
    });
    expect(response.statusCode, 'Failed at stories').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_stories.push(body);

  }

  // Now give some ratings
  for(var i = 1; i < 5; i++){
    const request:any = {
      actual_score: i,
      user_id: created_users[i].id,
      to_story_id: created_stories[0].id
    };

    const response = await server.inject({
      method: "POST",
      url: "/rating/create",
      payload: request,
    });
    expect(response.statusCode, 'Failed at ratings').toEqual(200);
    
    const body = JSON.parse(response.body);
    created_ratings.push(body);

  }

    // Now give some ratings after people have recieved ratings
    for(var i = 0; i < 4; i++){
      if(i == 1){
        continue
      }
      const request:any = {
        actual_score: i,
        user_id: created_users[i].id,
        to_story_id: created_stories[2].id
      };
  
      const response = await server.inject({
        method: "POST",
        url: "/rating/create",
        payload: request,
      });
      expect(response.statusCode, 'Failed at ratings2').toEqual(200);
      
      const body = JSON.parse(response.body);
      created_ratings.push(body);
  
    }

});