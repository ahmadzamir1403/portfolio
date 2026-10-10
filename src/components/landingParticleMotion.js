// A broad, gently curved stream of fine, sharply defined dust.
export const ENTRY_PARTICLE_DURATION = 1600

function streamY(x, width, height, spread) {
  const along = x / Math.max(1, width)
  return height * (.82 - along * .38 - Math.sin(along * Math.PI * 2) * .1) + spread
}

export function createParticleLine(count, width, height, { scattered = false } = {}) {
  let seed = 721
  const random = () => {
    seed = seed * 16807 % 2147483647
    return (seed - 1) / 2147483646
  }
  const particles = Array.from({ length: count }, (_, index) => {
    const depth = random()
    const along = (index + random()) / count
    const homeX = along * width
    const spreadY = (random() + random() + random() - 1.5) * height * .14
    const homeY = streamY(homeX, width, height, spreadY)
    const scale = Math.max(.85, Math.min(1, width / 738))
    return { homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0,
      lineWidth: width, lineHeight: height, spreadY, speed: 24 + depth * 36,
      radius: (.65 + depth ** 2 * 1.45) * scale, depth, phase: random() * Math.PI * 2,
      spread: random(), flight: 0, opacity: 1 }
  })
  if (scattered) {
    for (const particle of particles) {
      particle.x = random() * width
      particle.y = random() * height
      particle.vx = (random() - .5) * 80
      particle.vy = (random() - .5) * 50
      // Stagger the attraction slightly, then let the existing spring gather the dust.
      particle.flight = .08 + random() * .16
    }
  }
  return particles
}

export function beginParticleEntry(particles, width, height) {
  particles.forEach((particle, index) => {
    particle.entryX = particle.x
    particle.entryY = particle.y
    particle.entryOpacity = particle.opacity
    const distance = Math.min(width * .32, height * .25, 70 + particle.depth * 180)
    particle.scatterX = Math.max(3, Math.min(width - 3, particle.x + Math.cos(particle.phase) * distance))
    particle.scatterY = Math.max(3, Math.min(height - 3, particle.y + Math.sin(particle.phase) * distance))
    particle.ringAngle = index / particles.length * Math.PI * 2
  })
}

// Burst apart first, then curl into a visible ring around the header portrait.
export function stepParticleEntry(particles, progress, target) {
  for (const particle of particles) {
    particle.opacity = particle.entryOpacity
    if (progress < .22) {
      const t = Math.max(0, progress / .22)
      const eased = 1 - (1 - t) ** 3
      particle.x = particle.entryX + (particle.scatterX - particle.entryX) * eased
      particle.y = particle.entryY + (particle.scatterY - particle.entryY) * eased
      continue
    }
    const delay = particle.depth * .06
    const t = Math.max(0, Math.min(1, (progress - .22 - delay) / (.52 - delay)))
    const eased = t * t * (3 - 2 * t)
    const u = 1 - eased
    const angle = particle.ringAngle + u * Math.PI * .8
    const ringX = target.x + Math.cos(angle) * target.radius
    const ringY = target.y + Math.sin(angle) * target.radius
    const controlX = particle.scatterX + (ringX - particle.scatterX) * .28 + Math.sin(particle.phase) * 60
    const controlY = particle.scatterY + (ringY - particle.scatterY) * .72 + Math.cos(particle.phase) * 45
    particle.x = u * u * particle.scatterX + 2 * u * eased * controlX + eased * eased * ringX
    particle.y = u * u * particle.scatterY + 2 * u * eased * controlY + eased * eased * ringY
  }
}

export function beginParticleReturn(particles) {
  for (const particle of particles) {
    particle.returnX = particle.x
    particle.returnY = particle.y
    particle.returnOpacity = particle.opacity
  }
}

// Release into the live stream with a gentle curve and no orbital turn.
export function stepParticleReturn(particles, progress, time) {
  for (const particle of particles) {
    const delay = particle.depth * .06
    const t = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)))
    const eased = t * t * (3 - 2 * t)
    const u = 1 - eased
    particle.homeY = streamY(particle.homeX, particle.lineWidth, particle.lineHeight, particle.spreadY)
    const endX = particle.homeX
    const endY = particle.homeY + Math.sin(time * .9 + particle.phase) * (10 + particle.depth * 10)
    const dx = endX - particle.returnX
    const dy = endY - particle.returnY
    const controlX1 = particle.returnX + dx * .35
    const controlY1 = particle.returnY + dy * .1
    const controlX2 = particle.returnX + dx * .75
    const controlY2 = particle.returnY + dy * .85
    particle.x = u ** 3 * particle.returnX + 3 * u * u * eased * controlX1 + 3 * u * eased * eased * controlX2 + eased ** 3 * endX
    particle.y = u ** 3 * particle.returnY + 3 * u * u * eased * controlY1 + 3 * u * eased * eased * controlY2 + eased ** 3 * endY
    particle.opacity = particle.returnOpacity
  }
}

export function stepParticleLine(particles, delta, time) {
  const flow = Math.max(0, Math.min(1, time - 2))
  for (const particle of particles) {
    particle.flight = Math.max(0, particle.flight - delta)
    const returning = particle.flight === 0
    // After gathering, transport the dust along the entire curve rather than parking it.
    particle.homeX += particle.speed * flow * delta
    const wrapped = particle.homeX > particle.lineWidth + 48
    if (wrapped) particle.homeX = -48
    particle.homeY = streamY(particle.homeX, particle.lineWidth, particle.lineHeight, particle.spreadY)
    const homeY = particle.homeY + Math.sin(time * .9 + particle.phase) * (10 + particle.depth * 10)
    if (wrapped && returning) {
      // Recycle beyond the edges so individual particles never jump across the screen.
      particle.x = particle.homeX
      particle.y = homeY
      particle.vx = particle.speed
      particle.vy = 0
    }
    if (returning) {
      particle.vx += (particle.homeX - particle.x) * 9 * delta
      particle.vy += (homeY - particle.y) * 9 * delta
    }
    const drag = Math.exp(-(returning ? 5 : 1.2) * delta)
    particle.vx *= drag
    particle.vy *= drag
    particle.x += particle.vx * delta
    particle.y += particle.vy * delta
  }
}
