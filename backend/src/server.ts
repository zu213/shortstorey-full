import cors from "@fastify/cors";
import { Story, User, Rating } from "@prisma/client";
import fastify from "fastify";
import Prisma from "./db";
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "./token";
import { storiesQuerySchema, ratingsQuerySchema } from "./querySchema";
import { checkIfRatingExists, createNewRating, deleteRating, propagateRatingToStory, propagateRatingToUser, updateRating, updateStoryBlind } from "./ratingHandler";

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
server.get<{}>("/user", async (req, reply) => {
  const dbAllEntries = await Prisma.user.findMany({
    select: {
      id: true,
      name: true,
      rating: true,
    }
  });
  reply.send(dbAllEntries);
});

server.get<{ Body: User, Params: { id: string } }>("/user/:id", async (req, reply) => {
  const dbEntry = await Prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      rating: true,
    },
  });
  if (!dbEntry) {
    reply.status(500).send({ msg: `Error finding User with id ${req.params.id}` });
  }
  // needs change to prune password hash and such
  reply.send(dbEntry);
});

server.post<{ Body: User }>("/user/create", async (req, reply) => {
  if(await Prisma.user.findFirst({where: {name: req.body.name}})){
    return reply.status(500).send({msg: "Username already taken"})
  }
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
    const ratings = await Prisma.rating.findMany({ where: { user_id: req.params.id } })
    await Prisma.user.delete({ where: { id: req.params.id } });
    for(const rating of ratings){
      updateStoryBlind(rating.to_story_id);
      // For now we aren;t updating the users score on deletion immediately
    }
    reply.send({ msg: "Deleted successfully" });
  } catch (e) {
    console.log(e)
    reply.status(500).send({ msg: e });
  }
});

server.put<{ Params: { id: string }; Body: {id: string, name: string | undefined, password: string | undefined} }>("/user/update/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    const { name, password: passwordHash } = req.body
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
        user: { select: { name: true } }
      }
    });
  }else{
    dbAllEntries = await Prisma.story.findMany({
      include: { 
        user: { select: { name: true } }
      }
    });
  }
  reply.send(dbAllEntries);
});

server.get<{ Body: Story; Params: { id: string } }>("/stories/:id", async (req, reply) => {
  const dbEntry = await Prisma.story.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true } }
    },
  });
  if (!dbEntry) {
    reply.status(500).send({ msg: `Error finding Story with id ${req.params.id}` });
  }
  reply.send(dbEntry);
});

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

server.delete<{ Params: { id: string } }>("/stories/delete/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    const story = await Prisma.story.findUnique({ where: { id: req.params.id } })
    await Prisma.story.delete({ where: { id: req.params.id } });
    if(story?.user_id) {
      await propagateRatingToUser(story?.user_id) // update relevant ratings
    }
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting Story" });
  }
});

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

// Check if a specific user left a rating ona  specific story
server.get<{ Params: { storyid: string, userid: string }}>("/rating/:storyid/:userid", async (req, reply) => {
  const existing = await Prisma.rating.findFirst({
    where: {
      user_id: req.params.userid,
      to_story_id: req.params.storyid,
    },
  });
  reply.send({ exists: existing });
});

server.post<{ Body: {actual_score: number, user_id: string, to_story_id: string} }>("/rating/create", { preHandler: verifyToken }, async (req, reply) => {
  if(req.body.actual_score < 0 || req.body.actual_score > 5){
    throw Error('Invalid score given')
  }
  let alreadyExists = await checkIfRatingExists(req.body.user_id, req.body.to_story_id)
  if(alreadyExists){
    throw new Error('Rating already exists!')
  }

  try {
    const rating = await createNewRating(req.body.actual_score, req.body.user_id, req.body.to_story_id)
    const story = await propagateRatingToStory(rating);
    await propagateRatingToUser(story.user_id);
    reply.send({ msg: 'Successfully updated rating and propagated', rating });
  } catch (e) {
    reply.status(500).send({msg: e})
  }
});

// needs to check password  - needs to update rating weights also
server.delete<{ Params: { id: string } }>("/rating/delete/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    const storyId = await deleteRating(req.params.id)
    const story = await updateStoryBlind(storyId);
    await propagateRatingToUser(story.user_id);
    reply.send({ msg: "Deleted successfully" });

  } catch (e) {
    console.log(e)
    reply.status(500).send({msg: e})
  }
});

// needs to check password - needs to update rating weights also
server.put<{ Params: { id: string }; Body: Rating }>("/rating/update/:id", { preHandler: verifyToken }, async (req, reply) => {
  try {
    const rating = await updateRating(req.body.actual_score, req.params.id, req.body.user_id)
    const story = await propagateRatingToStory(rating, true);
    await propagateRatingToUser(story.user_id);
    reply.send({ msg: 'Successfully updated rating and propagated' });
  } catch (e) {
    reply.status(500).send({msg: e})
  }
});