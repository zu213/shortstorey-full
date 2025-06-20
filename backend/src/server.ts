import cors from "@fastify/cors";
import { Story, User, Rating } from "@prisma/client";
import fastify from "fastify";
import Prisma from "./db";
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "./token";
import { storiesQuerySchema, ratingsQuerySchema } from "./querySchema";

export const server = fastify();

server.register(cors, {});

// User endpoints
// login endpoint
server.post<{ Body: {name: string, passGuess: string}, Reply: Object }>("/login", async (req, reply) => {
  const dbEntry = await Prisma.user.findFirst({
    where: { name: req.body.name },
  });
  if(dbEntry && await bcrypt.compare(req.body.passGuess, dbEntry.passwordHash)){
    reply.send({validUser: true, token: generateToken(dbEntry), username: dbEntry.name, userId: dbEntry.id})
  }else if(dbEntry) {
    reply.send({validUser: true});
  }else {
    reply.send({validUser: false});
  }
});

// needs password change
// not real endpoint
server.get<{ Reply: User[] }>("/user", async (req, reply) => {
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
  // needs change to prune password hash and such
  reply.send(dbEntry);
});

// need to add check if username already exists
server.post<{ Body: User }>("/user/create", async (req, reply) => {
  let password = await bcrypt.hash(req.body.passwordHash, 10);
  let userCreateBody = {name: req.body.name, passwordHash: password};
  try {
    const createdUserData = await Prisma.user.create({ data: userCreateBody });
    reply.send(createdUserData);
  } catch(e) {
    console.log(e)
    reply.status(500).send({ msg: "Error creating User" });
  }
});

// needs to check password
server.delete<{ Params: { id: string } }>("/user/delete/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    await Prisma.user.delete({ where: { id: req.params.id } });
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting User" });
  }
});

// needs to check password
server.put<{ Params: { id: string }; Body: {id: string, name: string | undefined, password: string | undefined} }>("/user/update/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    const { name, password: passwordHash } = req.body
    console.log(req.body)
    const hashedPassword = typeof passwordHash === 'string' && passwordHash.length > 0 ? await bcrypt.hash(passwordHash, 10) : null
    const response = await Prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(hashedPassword && { passwordHash: hashedPassword })
      }
    })
    reply.send({ msg: "Updated successfully", user: response });
  } catch {
    reply.status(500).send({ msg: "Error updating" });
  }
});

// Story endpoints
server.get<{ Reply: Story[] }>("/stories", { schema: storiesQuerySchema }, async (req, reply) => {
  let dbAllEntries;
  if(req?.query && Object.entries(req.query).length > 0){
    dbAllEntries = await Prisma.story.findMany({
      where: req.query,
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
  }else{
    dbAllEntries = await Prisma.story.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
  }
  reply.send(dbAllEntries);
});

server.get<{ Body: Story; Params: { id: string } }>("/stories/:id", async (req, reply) => {
  const dbEntry = await Prisma.story.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          name: true,
        }
      },
    },
  });
  if (!dbEntry) {
    reply.status(500).send({ msg: `Error finding Story with id ${req.params.id}` });
  }
  reply.send(dbEntry);
});

// needs to check password - wht I'll check works first
server.post<{ Body: Story }>("/stories/create", { preHandler: verifyToken }, async (req, reply) => {
  let updatedEntryBody = req.body;
  updatedEntryBody.created_at = new Date()
  try {
    const createdStoryData = await Prisma.story.create({ data: updatedEntryBody });
    reply.send(createdStoryData);
  } catch {
    reply.status(500).send({ msg: "Error creating Story" });
  }
});

// needs to check password
server.delete<{ Params: { id: string } }>("/stories/delete/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    await Prisma.story.delete({ where: { id: req.params.id } });
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting Story" });
  }
});

// needs to check password
server.put<{ Params: { id: string }; Body: Story }>("/stories/update/:id", { preHandler: verifyToken }, async (req, reply) => {
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
server.get<{ Reply: Rating[] }>("/rating", { schema: ratingsQuerySchema }, async (req, reply) => {
  let dbAllEntries;
  if(req.query && Object.entries(req.query).length > 0){
    dbAllEntries = await Prisma.rating.findMany({
      where: req.query,
    });
  } else {
    dbAllEntries = await Prisma.rating.findMany({});
  }
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

server.get<{ Params: { storyid: string, userid: string }}>("/rating/:storyid/:userid", async (req, reply) => {
  const existing = await Prisma.rating.findFirst({
    where: {
      user_id: req.params.userid,
      to_story_id: req.params.storyid,
    },
  });
  reply.send({ exists: existing });
});

// needs to check password
server.post<{ Body: {actual_score: number, user_id: string, to_story_id: string} }>("/rating/create", { preHandler: verifyToken }, async (req, reply) => {
  let updatedEntryBody : any = req.body;

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

  updatedEntryBody["created_at"] = new Date()
  updatedEntryBody.final_score = final_score
  updatedEntryBody.user_score = multiplier

  try {
    const createdRatingData = await Prisma.rating.create({ data: updatedEntryBody as Rating });
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

// needs to check password  - needs to update rating weights also
server.delete<{ Params: { id: string } }>("/rating/delete/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    await Prisma.rating.delete({ where: { id: req.params.id } });
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting rating" });
  }
});

// needs to check password - needs to update rating weights also
server.put<{ Params: { id: string }; Body: Rating }>("/rating/update/:id", { preHandler: verifyToken }, async (req, reply) => {
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