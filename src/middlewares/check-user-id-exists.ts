import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkUserIdExists(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const userId = req.cookies.userId

  if (!userId) return res.status(401).send({ error: 'Unauthorized' })
}
