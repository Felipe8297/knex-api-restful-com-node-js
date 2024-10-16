import { execSync } from 'node:child_process'
import supertest from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('transactions routes', () => {
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

  it('should be able to create a new transaction', async () => {
    const response = await supertest(app.server).post('/transactions').send({
      title: 'Micro SaaS',
      amount: 8000,
      type: 'credit',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionsResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'Serviço Freela',
        amount: 2300,
        type: 'credit',
      })

    const cookies = createTransactionsResponse.get('Set-Cookie') ?? []

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Serviço Freela',
        amount: 2300,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionsResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionsResponse.get('Set-Cookie') ?? []

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionsResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'Serviço Freela',
        amount: 2300,
        type: 'credit',
      })

    const cookies = createTransactionsResponse.get('Set-Cookie') ?? []

    await supertest(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Supermercado',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await supertest(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 300,
    })
  })
})
