import { prisma, User } from '@prisma/client'
import Prisma from "./db";
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'secret'

export function generateToken(user: User) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export async function verifyToken(request: any, reply: any) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, name: string }
    
    // Check if user actually exists
    const userRequesting = await Prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!userRequesting) {
      return reply.code(401).send({ error: 'User not found or invalid token' })
    }

    
    if (!await checkIdFromRequest(request, userRequesting.id)) {
      return reply.code(401).send({ error: 'Token does not match user info' })
    }

    // Attach to request for use in route handlers
    request.user = userRequesting
  } catch (err) {
    reply.code(401).send({ error: 'Invalid or expired token' })
  }
}

async function checkIdFromRequest(request: any, userId: string) {
  const url = request.url
  var idToCheck = null
  if(url.includes('/stories')){
    if(request.method == ('DELETE') || request.method == ('PUT')){
      const story = await Prisma.story.findFirst({ where: { id:request.params.id }})
      idToCheck = story?.user_id
    } else if(request.method == ('POST')){
      idToCheck = request.body.user_id
    }
  } else if(url.includes('/ratings')){
    if(request.method == ('DELETE') || request.method == ('PUT')){
      const rating = await Prisma.rating.findFirst({ where: { id:request.params.id }})
      idToCheck = rating?.user_id
    } else if(request.method == ('POST')){
      idToCheck = request.body.user_id
    }
  } else if(url.includes('/user')){
    if(request.method == ('DELETE') || request.method == ('PUT')){
      idToCheck = request.params.id
    }
  }
  if(idToCheck == null) return true
  return userId === idToCheck
}
