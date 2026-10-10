import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createParticleLine, stepParticleLine, beginParticleEntry, stepParticleEntry, beginParticleReturn, stepParticleReturn } from '../src/components/landingParticleMotion.js'

test('visible dust does not recycle when only its destination crosses the edge', () => {
  const particle = createParticleLine(1, 1000, 700)[0]
  Object.assign(particle, { homeX: 1047, x: 980, y: 350, speed: 60, vx: 60 })
  stepParticleLine([particle], 1 / 30, 4)
  assert.ok(particle.x > 980 && particle.x < 990)
  particle.x = 1049
  stepParticleLine([particle], 1 / 30, 4)
  assert.ok(particle.x < 0)
})

test('returning to the menu hides the ring and reveals the dispersed stream', () => {
  const particles = createParticleLine(160, 1396, 790)
  beginParticleEntry(particles, 1396, 790, { burst: false })
  stepParticleEntry(particles, 1, { x: 1100, y: 30, radius: 26 })
  beginParticleReturn(particles)
  stepParticleReturn(particles, 0, 2)
  assert.ok(particles.every(p => p.opacity === 0))
  stepParticleReturn(particles, 1, 3.6)
  assert.ok(particles.every(p => p.opacity === 1))
  assert.ok(particles.some(p => Math.hypot(p.x - 1100, p.y - 30) > 200))
})
