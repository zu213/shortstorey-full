import cors from "@fastify/cors";
import { Story, User } from "@prisma/client";
import fastify from "fastify";
import Prisma from "./db";

export const server = fastify();

server.register(cors, {});


// User endpoints
server.get<{ Reply: User[] }>("/user/", async (req, reply) => {
  const dbAllEntries = await Prisma.user.findMany({});
  reply.send(dbAllEntries);
});

server.get<{ Body: User; Params: { id: string } }>("/user/:id", async (req, reply) => {
  const dbEntry = await Prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!dbEntry) {
    reply.status(500).send({ msg: `Error finding User with id ${req.params.id}` });
  }
  reply.send(dbEntry);
});

server.post<{ Body: User }>("/user/create/", async (req, reply) => {

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

  try {
    const createdStoryData = await Prisma.story.create({ data: req.body });
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
