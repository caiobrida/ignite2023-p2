import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users')

    return { users }
  })

  app.post('/', async (req, res) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserSchema.parse(req.body)

    const user = await knex('users').where('email', email).first()

    if (user) return res.status(400).send({ error: 'Email in use' })

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
    })

    return res.status(201).send()
  })

  app.post('/login', async (req, res) => {
    const createLoginSchema = z.object({
      email: z.string(),
    })

    const { email } = createLoginSchema.parse(req.body)

    const user = await knex('users').where('email', email).first()

    if (!user) return res.status(404).send({ error: 'User not found' })

    res.cookie('userId', user.id, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
    })

    return res.status(200).send({ userId: user.id })
  })

  app.post('/logout', async (req, res) => {
    const userId = req.cookies.userId

    if (userId)
      res.cookie('userId', userId, {
        path: '/',
        maxAge: 1,
      })

    return res.status(200).send()
  })
}
