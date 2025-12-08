// @vitest-environment node
import { describe, it, expect } from 'vitest'
import express, { Request, Response } from 'express'
import restaurantAuthRoutes from '../src/routes/restaurantAuthRoutes'
import restaurantOrdersRoutes from '../src/routes/restaurantOrdersRoutes'
import { resetStore } from '../src/dataStore'
import { authenticateRestaurant } from '../src/services/restaurantAccountService'

describe('restaurant auth + orders routes (unit handlers)', () => {
  const app = express()
  app.use(express.json())
  app.use('/api/restaurants', restaurantAuthRoutes)
  app.use('/api/restaurants', restaurantOrdersRoutes)

  it('signs up and fetches own profile', async () => {
    resetStore()
    const signupHandler = findHandler(restaurantAuthRoutes, '/signup')
    const loginJson: any = {}
    const signupRes = buildRes(loginJson)
    await signupHandler({ body: { name: 'Test Resto', email: 'resto@example.com', password: 'secret' } } as Request, signupRes)
    expect(signupRes.statusCode).toBe(201)
    const token = loginJson.token

    const meHandler = findHandler(restaurantAuthRoutes, '/me', 'get')
    const meJson: any = {}
    const meRes = buildRes(meJson)
    await meHandler({ headers: { 'x-restaurant-token': token } } as unknown as Request, meRes)
    expect(meRes.statusCode).toBe(200)
    expect(meJson.account.email).toBe('resto@example.com')
  })

  it('rejects unauthorized orders access', async () => {
    const handler = findHandler(restaurantOrdersRoutes, '/me/orders', 'get')
    const json: any = {}
    const res = buildRes(json)
    await handler({ headers: {} } as unknown as Request, res)
    expect(res.statusCode).toBe(401)
  })
})

function findHandler(router: any, path: string, method: string = 'post') {
  const layer = router.stack.find((l: any) => l.route?.path === path && l.route?.methods?.[method])
  if (!layer) throw new Error(`Route ${path} not found`)
  return layer.route.stack[0].handle
}

function buildRes(json: any): Response & { statusCode: number } {
  const res: any = {}
  res.statusCode = 200
  res.status = (code: number) => { res.statusCode = code; return res }
  res.json = (body: any) => Object.assign(json, body)
  return res as Response & { statusCode: number }
}
