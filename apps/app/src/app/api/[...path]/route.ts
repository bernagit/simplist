import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL!

async function proxy(req: NextRequest, path: string[]) {
  const token = (await cookies()).get('accessToken')?.value

  const url = `${API_URL}/${path.join('/')}${req.nextUrl.search}`

  const headers = new Headers(req.headers)

  headers.delete('host')
  headers.delete('cookie')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const body =
    req.method === 'GET' || req.method === 'HEAD'
      ? undefined
      : await req.text()

  const response = await fetch(url, {
    method: req.method,
    headers,
    ...(body !== undefined ? { body } : {}),
  })

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  })
}

type RouteContext = {
  params: Promise<{
    path: string[]
  }>
}

async function handle(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params
  return proxy(req, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle