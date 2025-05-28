import Prisma from "../src/db";
import { server } from "../src/server";
import 'jest-expect-message';

var created_users: Return_User[] = [];
var created_stories: Return_Story[] = []
var created_ratings: Return_Rating[] = []

type Rating = {
  actual_score:number
  user_id:string
  to_story_id:string
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

type Return_Rating = {
  id: string
}

async function createUser(
  name = "Placeholder",
) {
  const user = await Prisma.user.create({
    data: {
      name,
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

async function printDatabase() {
  const ratings = await Prisma.rating.findMany({})
  console.log('Ratings: ',ratings)
  const stories = await Prisma.story.findMany({})
  console.log('Stories: ', stories)
  const users = await Prisma.user.findMany({})
  console.log('Users: ', users)
}

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await printDatabase();
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
    created_stories.push(body);

  }

  // Now give some ratings
  for(var i = 1; i < 5; i++){
    const request:Rating = {
      actual_score: i,
      user_id: created_users[i].id,
      to_story_id: created_stories[0].id
    };

    const response = await server.inject({
      method: "POST",
      url: "/rating/create/",
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
      const request:Rating = {
        actual_score: i,
        user_id: created_users[i].id,
        to_story_id: created_stories[2].id
      };
  
      const response = await server.inject({
        method: "POST",
        url: "/rating/create/",
        payload: request,
      });
      expect(response.statusCode, 'Failed at ratings2').toEqual(200);
      
      const body = JSON.parse(response.body);
      created_ratings.push(body);
  
    }





});