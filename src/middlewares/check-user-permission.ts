import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function checkUserPermission(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const getMealIdSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = getMealIdSchema.parse(req.params)
  const userId = req.cookies.userId

  const meal = await knex('meals').where({ id, user_id: userId }).first()

  if (!meal) return res.status(401).send({ error: 'Unauthorized' })
}
