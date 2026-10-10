// Two curved streams feed directly into the measured portrait center.
export function createParticleLine(count, width, height, target) {
  let seed = 721
  const random = () => {
    seed = seed * 16807 % 2147483647
    return (seed - 1) / 2147483646
  }
  const particles = Array.from({ length: count }, (_, index) => ({
    side: index % 2 ? 1 : -1, progress: random(), duration: 4 + random() * 3,
    spread: (random() - .5) * height * .16, depth: random(),
    phase: random() * Math.PI * 2, radius: .6 + random() * 1.3,
    x: 0, y: 0, opacity: 0,
  }))
  stepParticleLine(particles, 0, 0, width, height, target)
  return particles
}

export function stepParticleLine(particles, delta, time, width, height, target) {
  for (const particle of particles) {
    particle.progress = (particle.progress + delta / particle.duration) % 1
    const t = particle.progress
    const u = 1 - t
    const startX = particle.side < 0 ? -24 : width + 24
    const startY = height * .8 + particle.spread
    const controlX = target.x + particle.side * width * .24
    const controlY = target.y + height * .4 + particle.spread
    particle.x = u * u * startX + 2 * u * t * controlX + t * t * target.x
    particle.y = u * u * startY + 2 * u * t * controlY + t * t * target.y
      + Math.sin(time * .7 + particle.phase) * 8 * u
    particle.opacity = Math.min(1, t * 12, (1 - t) * 10)
  }
}
