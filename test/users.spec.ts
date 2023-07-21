import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Teste',
        email: 'teste@teste.com',
      })
      .expect(201)
  })

  it('should be able to list all users', async () => {
    await request(app.server).post('/users').send({
      name: 'Teste',
      email: 'teste@teste.com',
    })

    const usersList = await request(app.server).get('/users')

    expect(usersList.body.users).toEqual([
      expect.objectContaining({
        name: 'Teste',
        email: 'teste@teste.com',
      }),
    ])
  })

  it('should be able to login user', async () => {
    await request(app.server).post('/users').send({
      name: 'Teste',
      email: 'teste@teste.com',
    })

    await request(app.server)
      .post('/users/login')
      .send({
        email: 'teste@teste.com',
      })
      .expect(200)
  })

  it('should be able to logout user', async () => {
    await request(app.server).post('/users').send({
      name: 'Teste',
      email: 'teste@teste.com',
    })

    await request(app.server).post('/users/login').send({
      email: 'teste@teste.com',
    })

    await request(app.server).post('/users/logout').send().expect(200)
  })
})
