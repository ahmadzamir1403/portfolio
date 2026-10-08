import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(resolve(root, 'public/favicon.svg'))

// Theme colors taken from src/index.css / brand mark.
const NAVY = '#091e40' // app background

async function renderIcon(size, { background, contentRatio, output }) {
  const contentSize = Math.round(size * contentRatio)
  const icon = await sharp(svg)
    .resize(contentSize, contentSize, { fit: 'contain' })
    .png()
    .toBuffer()
  const offset = Math.round((size - contentSize) / 2)
  const canvas = { width: size, height: size, channels: 4, background }
  await sharp({ create: canvas })
    .composite([{ input: icon, left: offset, top: offset }])
    .png()
    .toFile(resolve(root, 'public', output))
  console.log(`✔ ${output} (${size}x${size})`)
}

// "any" purpose — transparent background with padding.
await renderIcon(192, { background: { r: 0, g: 0, b: 0, alpha: 0 }, contentRatio: 0.8, output: 'pwa-192x192.png' })
await renderIcon(512, { background: { r: 0, g: 0, b: 0, alpha: 0 }, contentRatio: 0.8, output: 'pwa-512x512.png' })

// "maskable" purpose — solid navy background, content inside the safe zone (~60%).
await renderIcon(192, { background: NAVY, contentRatio: 0.6, output: 'maskable-192x192.png' })
await renderIcon(512, { background: NAVY, contentRatio: 0.6, output: 'maskable-512x512.png' })

// Apple touch icon — solid background (iOS renders transparency as black).
await renderIcon(180, { background: NAVY, contentRatio: 0.78, output: 'apple-touch-icon.png' })

console.log('PWA icons generated.')
