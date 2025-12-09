// @vitest-environment node
import { describe, it, expect } from 'vitest'
import express, { Request, Response } from 'express'
import authRoutes from '../src/routes/authRoutes'
import { resetStore } from '../src/dataStore'

describe('authRoutes', () => {
  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRoutes)

  it('signs up and logs in a new user', async () => {
    resetStore()
    const signupHandler = findHandler(authRoutes, '/signup')
    const signupJson: any = {}
    const signupRes = buildRes(signupJson)
    await signupHandler({ body: { name: 'New User', email: 'new@example.com', password: 'secret' } } as unknown as Request, signupRes)
    expect(signupRes.statusCode).toBe(201)
    expect(signupJson.user.email).toBe('new@example.com')

    const loginHandler = findHandler(authRoutes, '/login')
    const loginJson: any = {}
    const loginRes = buildRes(loginJson)
    await loginHandler({ body: { email: 'new@example.com', password: 'secret' } } as unknown as Request, loginRes)
    expect(loginRes.statusCode).toBe(200)
    expect(loginJson.user.email).toBe('new@example.com')
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
