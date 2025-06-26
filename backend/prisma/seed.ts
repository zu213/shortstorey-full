import { PrismaClient, Story, User } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function insertUsers() {
  const passwordHash = await bcrypt.hash('password', 10)
  const alice = await prisma.user.create({
    data: {
      name: 'Bob',
      passwordHash: passwordHash,
      rating: 3
    },
  })
  console.log({ alice })
  return [alice]
}

async function insertStories(users: User[]) {
  const story = await prisma.story.create({
    data: {
      title: 'Bob\'s story',
      content: 'story content',
      user: {
        connect: { id: users[0].id }, // Correct way to relate to existing user
      },
      created_at: new Date()
    },
  })
  console.log({ story })
  return [story]
}

async function insertRatings(users: User[], stories: Story[]) {
  const alice = await prisma.rating.create({
    data: {
      created_at: new Date(),
      actual_score: 4,
      user_id: users[0].id,
      rating_power: users[0].rating ?? 0.5,
      to_story:  {
        connect: { id: stories[0].id }, // Correct way to relate to existing user
      },
    },
  })
console.log({ alice })
}

async function main() {
  await prisma.rating.deleteMany();
  await prisma.story.deleteMany();
  await prisma.user.deleteMany();
  const users = await insertUsers()
  const stories = await insertStories(users)
  await insertRatings(users, stories)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })