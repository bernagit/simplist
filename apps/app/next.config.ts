import type { NextConfig } from 'next'
import fs from 'node:fs';
import path from 'node:path';
import packageJson from './package.json';
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const fallbackPath = path.resolve(process.cwd(), './CHANGELOG.md');

let rawChangelog = '';
if (fs.existsSync(fallbackPath)) {
  rawChangelog = fs.readFileSync(fallbackPath, 'utf8');
}

// In production nginx routes /api to the Express API (docker/nginx/simplist.conf). In development
// there is no nginx, so Next.js forwards /api itself to keep the API on the same origin
// (the auth cookies are scoped to /api). `next build` runs with NODE_ENV=production: no rewrite.
const devApiUrl = process.env.NODE_ENV === 'development' ? process.env.API_URL : undefined

const nextConfig: NextConfig = {
  output: 'standalone',
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
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_CHANGELOG: rawChangelog
  }
}

export default withNextIntl(nextConfig)
