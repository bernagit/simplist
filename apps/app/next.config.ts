import type { NextConfig } from 'next'
import fs from 'node:fs';
import path from 'node:path';
import packageJson from './package.json';

const fallbackPath = path.resolve(process.cwd(), './CHANGELOG.md');

let rawChangelog = '';
if (fs.existsSync(fallbackPath)) {
  rawChangelog = fs.readFileSync(fallbackPath, 'utf8');
}

const nextConfig: NextConfig = {
  output: 'standalone',
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

export default nextConfig
