

import { FastifySchema } from 'fastify'

export const storiesQuerySchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      user_id: { type: 'string', minLength: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 }
    },
    additionalProperties: false
  }
}

export const ratingsQuerySchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      to_story_id: { type: 'string', minLength: 1 },
      user_id: { type: 'string', minLength: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 }
    },
    additionalProperties: false
  }
}