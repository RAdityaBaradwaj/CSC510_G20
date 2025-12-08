import { Request } from 'express'

export function resolveUserId(req: Request): string {
  return (req.headers['x-user-id'] as string) || (req as any).userId || 'user-1'
}
