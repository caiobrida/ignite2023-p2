import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'
import { checkUserPermission } from '../middlewares/check-user-permission'
import { identifyArraySequence } from '../utils/identifyArraySequence'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkUserIdExists)

  app.get('/', async (req) => {
    const userId = req.cookies.userId

    const meals = await knex('meals').where('user_id', userId)

    return { meals }
  })

  app.get('/get-metrics', async (req) => {
    const userId = req.cookies.userId

    const mealsMetrics = await knex('meals')
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('SUM(CASE WHEN in_diet = 1 THEN 1 ELSE 0 END) as totalInDiet'),
        knex.raw(
          'SUM(CASE WHEN in_diet = 0 THEN 1 ELSE 0 END) as totalNotInDiet',
        ),
      )
      .where('user_id', userId)

    const meals = await knex('meals').where('user_id', userId)

    const dietSequence = identifyArraySequence(meals, 'in_diet', 1)

    return { metrics: { ...mealsMetrics[0], dietSequence } }
  })

  app.get(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (req) => {
      const getMealIdSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealIdSchema.parse(req.params)

      const userId = req.cookies.userId

      const meal = await knex('meals').where({ id, user_id: userId }).first()

      return { meal }
    },
  )

  app.post('/', async (req, res) => {
    const createMealSchema = z.object({
      nome: z.string(),
      description: z.string().nullable(),
    })

    const { nome, description } = createMealSchema.parse(req.body)

    const userId = req.cookies.userId

    await knex('meals').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      nome,
      description,
    })

    return res.status(201).send()
  })

  app.put(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (req, res) => {
      const getMealIdSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealIdSchema.parse(req.params)

      const body = req.body || {}

      const userId = req.cookies.userId

      const data = {}

      Object.keys(body).map((key) => {
        if (body[key] !== undefined && body[key] !== null) data[key] = body[key]

        return true
      })

      await knex('meals')
        .update({ ...data, updated_at: new Date().toISOString() })
        .where({ id, user_id: userId })

      return res.status(200).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (req, res) => {
      const getMealIdSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealIdSchema.parse(req.params)

      const userId = req.cookies.userId

      await knex('meals').delete().where({ id, user_id: userId })

      return res.status(200).send()
    },
  )
}
