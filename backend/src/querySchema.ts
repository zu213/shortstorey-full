

import { FastifySchema } from 'fastify'

export const querySchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      userId: { type: 'string', minLength: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 }
    },
    additionalProperties: false
  }
}