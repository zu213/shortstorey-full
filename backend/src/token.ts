import { User } from '@prisma/client'
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

export async function verifyToken(request: any, reply: any, done: any) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, name: string }
    
    // Check if user actually exists
    const user = await Prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return reply.code(401).send({ error: 'User not found or invalid token' })
    }

    // Optionally: check if user's name matches too
    if (user.name !== decoded.name) {
      return reply.code(401).send({ error: 'Token does not match user info' })
    }

    // Attach to request for use in route handlers
    request.user = user
    done()
  } catch (err) {
    reply.code(401).send({ error: 'Invalid or expired token' })
  }
}