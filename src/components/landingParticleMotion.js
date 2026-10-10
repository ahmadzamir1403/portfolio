// A broad, gently curved stream of fine, sharply defined dust.
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

export function beginParticleEntry(particles) {
  for (const particle of particles) {
    particle.entryX = particle.x
    particle.entryY = particle.y
    particle.entryOpacity = particle.opacity
  }
}

// On entry, gather the existing stream into the small header portrait.
export function stepParticleEntry(particles, progress, target) {
  for (const particle of particles) {
    const delay = particle.depth * .16
    const t = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)))
    const eased = t * t * (3 - 2 * t)
    const u = 1 - eased
    const controlX = particle.entryX + (target.x - particle.entryX) * .28 + Math.sin(particle.phase) * 60
    const controlY = particle.entryY + (target.y - particle.entryY) * .72 + Math.cos(particle.phase) * 45
    particle.x = u * u * particle.entryX + 2 * u * eased * controlX + eased * eased * target.x
    particle.y = u * u * particle.entryY + 2 * u * eased * controlY + eased * eased * target.y
    particle.opacity = particle.entryOpacity * Math.min(1, (1 - eased) * 8)
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
