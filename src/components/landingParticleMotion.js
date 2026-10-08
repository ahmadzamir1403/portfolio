// A broad, gently curved stream with fine dust and soft foreground bokeh.
export function createParticleLine(count, width, height) {
  let seed = 721
  const random = () => {
    seed = seed * 16807 % 2147483647
    return (seed - 1) / 2147483646
  }
  return Array.from({ length: count }, (_, index) => {
    const depth = random()
    const along = (index + random()) / count
    const homeX = along * width
    const spreadY = (random() + random() + random() - 1.5) * height * .14
    const homeY = height * (.82 - along * .38 - Math.sin(along * Math.PI * 2) * .1) + spreadY
    const scale = Math.max(.75, Math.min(1.45, width / 738))
    return { homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0,
      radius: (.45 + depth ** 5 * 5.5) * scale, depth, phase: random() * Math.PI * 2,
      spread: random(), flight: 0 }
  })
}

export function scatterParticleLine(particles, x, y) {
  for (const particle of particles) {
    const angle = Math.atan2(particle.y - y, particle.x - x) + (particle.spread - .5) * 1.8
    const speed = 340 + particle.depth * 440
    particle.vx = Math.cos(angle) * speed
    particle.vy = Math.sin(angle) * speed
    particle.flight = .85
  }
}

export function stepParticleLine(particles, delta, time) {
  for (const particle of particles) {
    particle.flight = Math.max(0, particle.flight - delta)
    const returning = particle.flight === 0
    const homeY = particle.homeY + Math.sin(time * .55 + particle.phase) * 3
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
