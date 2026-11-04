import type { NextConfig } from 'next'
import { networkInterfaces } from 'node:os';
import packageJson from './package.json';
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// In production nginx routes /api to the Express API (docker/nginx/simplist.conf). In development
// there is no nginx, so Next.js forwards /api itself to keep the API on the same origin
// (the auth cookies are scoped to /api). `next build` runs with NODE_ENV=production: no rewrite.
const devApiUrl = process.env.NODE_ENV === 'development' ? process.env.API_URL : undefined

// Development only: Next.js blocks dev assets requested from another host, so a phone opening
// https://<lan-ip>:3000 (yarn dev:https) needs this machine's LAN addresses allowed.
const VIRTUAL_INTERFACES = /^(docker|br-|veth|virbr|vmnet|vboxnet|tun|tap|wg|tailscale|zt|lo)/
const lanAddresses =
  process.env.NODE_ENV === 'development'
    ? Object.entries(networkInterfaces())
        .filter(([name]) => !VIRTUAL_INTERFACES.test(name))
        .flatMap(([, addresses]) => addresses ?? [])
        .filter(address => address.family === 'IPv4' && !address.internal)
        .map(address => address.address)
    : []

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: lanAddresses,
  async rewrites() {
    return devApiUrl ? [{ source: '/api/:path*', destination: `${devApiUrl}/:path*` }] : []
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'"
          }
        ]
      }
    ]
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version
  }
}

export default withNextIntl(nextConfig)
