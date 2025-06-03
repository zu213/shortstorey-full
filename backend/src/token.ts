import { User } from '@prisma/client'
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

export function verifyToken(request: any, reply: any, done: any) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    request.user = decoded // attach user data to request
    done()
  } catch (err) {
    reply.code(401).send({ error: 'Invalid or expired token' })
  }
}