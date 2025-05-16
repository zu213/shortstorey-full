import cors from "@fastify/cors";
import { Story, User, Rating } from "@prisma/client";
import fastify from "fastify";
import Prisma from "./db";

export const server = fastify();

server.register(cors, {});


// User endpoints
server.get<{ Reply: User[] }>("/user/", async (req, reply) => {
  const dbAllEntries = await Prisma.user.findMany({});
  reply.send(dbAllEntries);
});

server.get<{ Body: User, Params: { id: string } }>("/user/:id", async (req, reply) => {
  const dbEntry = await Prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!dbEntry) {
    reply.status(500).send({ msg: `Error finding User with id ${req.params.id}` });
  }
  reply.send(dbEntry);
});

server.post<{ Body: User }>("/user/create/", async (req, reply) => {
  console.log(req.body)
  try {
    const createdUserData = await Prisma.user.create({ data: req.body });
    reply.send(createdUserData);
  } catch {
    reply.status(500).send({ msg: "Error creating User" });
  }
});

server.delete<{ Params: { id: string } }>("/user/delete/:id", async (req, reply) => {
  try {
    await Prisma.user.delete({ where: { id: req.params.id } });
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting User" });
  }
});

server.put<{ Params: { id: string }; Body: User }>("/user/update/:id", async (req, reply) => {

  try {
    await Prisma.user.update({
      data: req.body,
      where: { id: req.params.id },
    });
    reply.send({ msg: "Updated successfully" });
  } catch {
    reply.status(500).send({ msg: "Error updating" });
  }
});

// Story endpoints
server.get<{ Reply: Story[] }>("/story/", async (req, reply) => {
  const dbAllEntries = await Prisma.story.findMany({});
  reply.send(dbAllEntries);
});

server.get<{ Body: Story; Params: { id: string } }>("/story/:id", async (req, reply) => {
  const dbEntry = await Prisma.story.findUnique({
    where: { id: req.params.id },
  });
  if (!dbEntry) {
    reply.status(500).send({ msg: `Error finding Story with id ${req.params.id}` });
  }
  reply.send(dbEntry);
});

server.post<{ Body: Story }>("/story/create/", async (req, reply) => {
  let updatedEntryBody = req.body;
  updatedEntryBody.created_at = new Date()
  try {
    const createdStoryData = await Prisma.story.create({ data: updatedEntryBody });
    reply.send(createdStoryData);
  } catch {
    reply.status(500).send({ msg: "Error creating Story" });
  }
});

server.delete<{ Params: { id: string } }>("/story/delete/:id", async (req, reply) => {
  try {
    await Prisma.story.delete({ where: { id: req.params.id } });
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting Story" });
  }
});

server.put<{ Params: { id: string }; Body: Story }>("/story/update/:id", async (req, reply) => {
  try {
    await Prisma.story.update({
      data: req.body,
      where: { id: req.params.id },
    });
    reply.send({ msg: "Updated successfully" });
  } catch {
    reply.status(500).send({ msg: "Error updating" });
  }
});


// Rating endpoints
server.get<{ Reply: Rating[] }>("/rating/", async (req, reply) => {
  const dbAllEntries = await Prisma.rating.findMany({});
  reply.send(dbAllEntries);
});

server.get<{ Body: Rating, Params: { id: string } }>("/rating/:id", async (req, reply) => {
  const dbEntry = await Prisma.rating.findUnique({
    where: { id: req.params.id },
  });
  if (!dbEntry) {
    reply.status(500).send({ msg: `Error finding rating with id ${req.params.id}` });
  }
  reply.send(dbEntry);
});

server.post<{ Body: Rating }>("/rating/create/", async (req, reply) => {
  let updatedEntryBody = req.body;

  if(updatedEntryBody.actual_score < 0 || updatedEntryBody.actual_score > 5){
    throw Error('Invalid scre given')
  }

  let dupeCount = await Prisma.rating.count(
    {
      where: {
        user_id: updatedEntryBody.user_id,
        to_story_id: updatedEntryBody.to_story_id
      }
    }
  )
  if(dupeCount > 0){
    throw Error('Review already given')
  }

  const from_user = await Prisma.user.findUnique({
    where: { id: req.body.user_id},
  });
  // if not found user global average
  var multiplier
  if (from_user && from_user.rating) {
    multiplier =  from_user.rating / 5
  }else{
     multiplier = 0.5
  }

  // now get the users average score
  const story = await Prisma.story.findUnique({
    where: { id: req.body.to_story_id},
  });
  if(!story){
    throw new Error('Error story not found')
  }

  const to_user = await Prisma.user.findUnique({
    where: { id: story?.user_id},
  });

  if(!to_user){
    throw Error('Invalid no reviewer id found')
  }

  if(to_user?.id == from_user?.id){
    throw Error('Invalid review, you cannot self review!')
  }

  var user_score;
  if(to_user && to_user.rating){
    user_score = to_user.rating
  }
  const final_score =  user_score ? user_score * (1-multiplier) + updatedEntryBody.actual_score * multiplier : updatedEntryBody.actual_score

  updatedEntryBody.created_at = new Date()
  updatedEntryBody.final_score = final_score
  updatedEntryBody.user_score = multiplier

  try {
    const createdRatingData = await Prisma.rating.create({ data: updatedEntryBody });
    reply.send(createdRatingData);
  } catch {
    reply.status(500).send({ msg: "Error creating rating" });
  }

  // Now we update the story then the users rating
  try {
    let ratingCount = await Prisma.rating.count(
      {
        where: {
          to_story_id: updatedEntryBody.to_story_id
        }
      }
    )
    var new_rating;
    if(story.rating)
      new_rating = (story.rating * ratingCount + final_score / 5) / (ratingCount + 1)
    else{
      new_rating = final_score / 5
    }
    const createdRatingData = await Prisma.story.update(
      {
        data: {rating:new_rating },
        where: { id: story?.id },
  });
    reply.send(createdRatingData);
  } catch {
    reply.status(500).send({ msg: "Error updating story" });
  }
  try {
    let storyCount = await Prisma.rating.count(
      {
        where: {
          to_story_id: updatedEntryBody.to_story_id
        }
      }
    )
    if(!new_rating){
      throw Error('Somethign went wrong :/')
    }
    if(to_user?.rating){
      if(!story.rating){
        story.rating = to_user.rating
      }
      new_rating = (to_user.rating * storyCount - story.rating  + new_rating) / (storyCount)
    }
    const createdRatingData = await Prisma.user.update(
      {
        data: {rating: new_rating},
        where: { id: to_user.id },
  });
    reply.send(createdRatingData);
  } catch {
    reply.status(500).send({ msg: "Error updating user" });
  }


});

server.delete<{ Params: { id: string } }>("/rating/delete/:id", async (req, reply) => {
  try {
    await Prisma.rating.delete({ where: { id: req.params.id } });
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting rating" });
  }
});

server.put<{ Params: { id: string }; Body: Rating }>("/rating/update/:id", async (req, reply) => {
  try {
    await Prisma.rating.update({
      data: req.body,
      where: { id: req.params.id },
    });
    reply.send({ msg: "Updated successfully" });
  } catch {
    reply.status(500).send({ msg: "Error updating" });
  }
});