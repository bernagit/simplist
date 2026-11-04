import fs from 'node:fs'
import path from 'node:path'
import { createPrivateKey, createPublicKey, generateKeyPairSync } from 'node:crypto'
import webpush from 'web-push'

/**
 * The instance's secrets, created on first start and kept in the keys folder (KEYS_DIR, by
 * default `keys/` at the repository root, `/app/keys` in Docker):
 *
 * - private.key / public.pem: EC P-384 pair that signs the sessions (ES384). Changing it logs
 *   every user out.
 * - vapid.json: Web Push key pair for reminders. Changing it disconnects every device.
 *
 * Environment variables win over the files (JWT_PRIVATE_KEY / JWT_PUBLIC_KEY, VAPID_PUBLIC_KEY
 * / VAPID_PRIVATE_KEY), for setups that inject secrets. The folder must be persistent and
 * included in backups.
 *
 * Runs at import time, before the logger exists: what happened is returned in `notes` and
 * logged by the server once it starts.
 */

const keysDir = path.resolve(process.cwd(), process.env.KEYS_DIR ?? '../../keys')
const PRIVATE_KEY_FILE = path.join(keysDir, 'private.key')
const PUBLIC_KEY_FILE = path.join(keysDir, 'public.pem')
const VAPID_FILE = path.join(keysDir, 'vapid.json')

const JSON_INDENT = 2

const notes: string[] = []

function read(file: string) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
}

function write(file: string, content: string) {
  try {
    fs.mkdirSync(keysDir, { recursive: true })
    // Owner only: these are private keys
    fs.writeFileSync(file, content, { mode: 0o600, flag: 'wx' })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Cannot create ${file} (${reason}). The keys folder must be writable on first start: ` +
        `check the volume mounted on ${keysDir} (no ":ro") and its permissions.`,
      { cause: error }
    )
  }
}

function loadSessionKeys() {
  const fromEnv = { privateKey: process.env.JWT_PRIVATE_KEY, publicKey: process.env.JWT_PUBLIC_KEY }
  if (fromEnv.privateKey && fromEnv.publicKey) {
    return { privateKey: fromEnv.privateKey, publicKey: fromEnv.publicKey }
  }

  let privateKey = read(PRIVATE_KEY_FILE)
  let publicKey = read(PUBLIC_KEY_FILE)

  if (!privateKey) {
    if (publicKey) {
      // Without its private half the public key is useless; replacing it would hide the problem
      throw new Error(
        `${PUBLIC_KEY_FILE} exists but ${PRIVATE_KEY_FILE} is missing: restore it from a backup, ` +
          'or delete public.pem to create a new pair (every user will have to log in again).'
      )
    }
    const pair = generateKeyPairSync('ec', {
      namedCurve: 'secp384r1',
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' }
    })
    write(PRIVATE_KEY_FILE, pair.privateKey)
    write(PUBLIC_KEY_FILE, pair.publicKey)
    notes.push(`Session keys created in ${keysDir}: keep this folder in your backups.`)
    return pair
  }

  if (!publicKey) {
    publicKey = createPublicKey(createPrivateKey(privateKey))
      .export({ type: 'spki', format: 'pem' })
      .toString()
    write(PUBLIC_KEY_FILE, publicKey)
    notes.push(`${PUBLIC_KEY_FILE} was missing: recreated from the private key.`)
  }

  return { privateKey, publicKey }
}

function loadVapidKeys() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    return { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY }
  }

  const stored = read(VAPID_FILE)
  if (stored) {
    const parsed = JSON.parse(stored) as { publicKey?: string; privateKey?: string }
    if (!parsed.publicKey || !parsed.privateKey) {
      throw new Error(
        `${VAPID_FILE} is not valid: restore it from a backup, or delete it to create new keys.`
      )
    }
    return { publicKey: parsed.publicKey, privateKey: parsed.privateKey }
  }

  const keys = webpush.generateVAPIDKeys()
  write(VAPID_FILE, `${JSON.stringify(keys, null, JSON_INDENT)}\n`)
  notes.push(`Push notification keys created in ${VAPID_FILE}.`)
  return keys
}

export const secrets = {
  session: loadSessionKeys(),
  vapid: loadVapidKeys(),
  keysDir,
  /** Messages for the startup log */
  notes
}
