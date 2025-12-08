// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express, { Request, Response } from 'express'

vi.mock('../src/services/restaurantService', () => {
  return {
    listRestaurants: vi.fn(),
    getRestaurant: vi.fn(),
    getMenuItems: vi.fn(),
    getMenuItem: vi.fn()
  }
})

import { listRestaurants, getRestaurant, getMenuItems } from '../src/services/restaurantService'
import businessRoutes from '../src/routes/businessRoutes'

describe('businessRoutes', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns businesses list', async () => {
    ;(listRestaurants as any).mockResolvedValue([{ id: 'r1', name: 'Pizza' }])
    const handler = findHandler(businessRoutes, '/')
    const req = { query: {} } as unknown as Request
    const json = vi.fn()
    const res = buildRes(json)
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    expect(json).toHaveBeenCalledWith({ businesses: [{ id: 'r1', name: 'Pizza' }] })
    expect(listRestaurants).toHaveBeenCalled()
  })

  it('returns 404 when restaurant missing on menu fetch', async () => {
    ;(getRestaurant as any).mockResolvedValue(null)
    const handler = findHandler(businessRoutes, '/:id/menu')
    const req = { params: { id: 'r1' } } as unknown as Request
    const json = vi.fn()
    const res = buildRes(json)
    await handler(req, res)
    expect(res.statusCode).toBe(404)
  })

  it('returns menu for restaurant', async () => {
    ;(getRestaurant as any).mockResolvedValue({ id: 'r1', name: 'Pizza' })
    ;(getMenuItems as any).mockResolvedValue([{ id: 'm1', name: 'Slice' }])
    const handler = findHandler(businessRoutes, '/:id/menu')
    const req = { params: { id: 'r1' } } as unknown as Request
    const json = vi.fn()
    const res = buildRes(json)
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    expect(json).toHaveBeenCalledWith({ restaurant: { id: 'r1', name: 'Pizza' }, menu: [{ id: 'm1', name: 'Slice' }] })
  })
})

function findHandler(router: express.Router, path: string) {
  const layer = (router as any).stack.find((l: any) => l.route?.path === path)
  if (!layer) throw new Error(`Route ${path} not found`)
  return layer.route.stack[0].handle
}

function buildRes(json: any): Response & { statusCode: number } {
  const res: any = {}
  res.statusCode = 200
  res.status = (code: number) => { res.statusCode = code; return res }
  res.json = json
  return res as Response & { statusCode: number }
}
