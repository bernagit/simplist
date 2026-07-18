import fs from 'node:fs'
import path from 'node:path'

const packageJsonPath = path.resolve(process.cwd(), './package.json')

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
  name: string
  version: string
}

export const appInfo = {
  name: packageJson.name,
  version: packageJson.version
}
