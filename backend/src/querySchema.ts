

import { FastifySchema } from 'fastify'

export const querySchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      user_id: { type: 'string', minLength: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 }
    },
    additionalProperties: false
  }
}