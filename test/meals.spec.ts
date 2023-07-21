import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
  let cookies: string[] = []

  beforeAll(async () => {
    await app.ready()

    await request(app.server)
      .post('/users')
      .send({ name: 'Teste', email: 'teste@teste.com' })

    const loginRes = await request(app.server)
      .post('/users/login')
      .send({ email: 'teste@teste.com' })

    cookies = loginRes.get('Set-Cookie')
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        nome: 'Refeicao 1',
        description: 'Descricao',
      })
      .set('Cookie', cookies)
      .expect(201)
  })

  it('should be able to show a user meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        nome: 'Refeicao 1',
        description: 'Descricao',
      })
      .set('Cookie', cookies)

    const mealRes = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const id = mealRes.body.meals[0].id

    const showMealRes = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', cookies)

    expect(showMealRes.body.meal).toEqual(expect.objectContaining({ id }))
  })

  it('should be able to see user metrics', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        nome: 'Refeicao 1',
        description: 'Descricao',
      })
      .set('Cookie', cookies)

    const showMealRes = await request(app.server)
      .get(`/meals/get-metrics`)
      .set('Cookie', cookies)

    expect(showMealRes.body.metrics).toEqual(
      expect.objectContaining({ dietSequence: 0 }),
    )
  })

  it('should be able to list all user meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        nome: 'Refeicao 1',
        description: 'Descricao',
      })
      .set('Cookie', cookies)

    const mealRes = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealRes.body.meals).toEqual([
      expect.objectContaining({
        nome: 'Refeicao 1',
        description: 'Descricao',
      }),
    ])
  })

  it('should be able to update a meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        nome: 'Refeicao 1',
        description: 'Descricao',
      })
      .set('Cookie', cookies)

    const mealRes = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const id = mealRes.body.meals[0].id

    await request(app.server)
      .put(`/meals/${id}`)
      .send({
        nome: 'Refeicao 2',
        description: 'Descricao 2',
      })
      .set('Cookie', cookies)

    const mealUpdated = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealUpdated.body.meals).toEqual([
      expect.objectContaining({
        nome: 'Refeicao 2',
        description: 'Descricao 2',
      }),
    ])
  })

  it('should be able to delete a meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        nome: 'Refeicao 1',
        description: 'Descricao',
      })
      .set('Cookie', cookies)

    const mealRes = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const id = mealRes.body.meals[0].id

    await request(app.server).delete(`/meals/${id}`).set('Cookie', cookies)

    const mealUpdated = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealUpdated.body.meals).toEqual([])
  })
})
