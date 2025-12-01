<template>
  <div>
    <canvas id="outerspace" @click="handleClick"></canvas>
    <div class="score-counter" v-if="score > 0">Score: {{ score }}</div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'

export default defineComponent({
  setup() {
    const score = ref(0)
    let animationFrameId = null

    // Canvas variables
    let outerspace = null
    let mainContext = null
    let canvasWidth = 0
    let canvasHeight = 0
    let centerX = 0
    let centerY = 0
    let numberOfStars = 500

    // Assets
    let starAssets = {}
    const STAR_SIZE = 20
    const HALF_STAR_SIZE = STAR_SIZE / 2
    const STAR_COLORS = [
      { name: 'white', stops: ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'] },
      { name: 'blue', stops: ['rgba(170, 191, 255, 1)', 'rgba(170, 191, 255, 0)'] },
      { name: 'red', stops: ['rgba(255, 204, 170, 1)', 'rgba(255, 204, 170, 0)'] },
      { name: 'yellow', stops: ['rgba(255, 255, 170, 1)', 'rgba(255, 255, 170, 0)'] }
    ]

    let stars = []
    let shootingStar = null
    let nebulaCanvas = null
    let nebulaContext = null

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function remap(value, istart, istop, ostart, ostop) {
      return ostart + (ostop - ostart) * ((value - istart) / (istop - istart))
    }

    class Star {
      constructor() {
        this.x = getRandomInt(-centerX, centerX)
        this.y = getRandomInt(-centerY, centerY)
        this.counter = getRandomInt(1, canvasWidth)
        this.radiusMax = 1 + Math.random() * 2
        this.speed = getRandomInt(5, 10)
        this.alpha = 0.7 + Math.random() * 0.3
        this.isSpiky = Math.random() > 0.5
        this.colorName = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)].name
        this.twinkleOffset = Math.random() * Math.PI * 2

        this.currentX = 0
        this.currentY = 0
        this.currentRadius = 0
      }

      reset() {
        this.counter = canvasWidth
        this.x = getRandomInt(-centerX, centerX)
        this.y = getRandomInt(-centerY, centerY)
        this.radiusMax = getRandomInt(1, 10)
        this.speed = getRandomInt(1, 5)
        this.colorName = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)].name
        this.isSpiky = Math.random() > 0.5
      }

      drawStar() {
        this.counter -= this.speed

        if (this.counter < 1) {
          this.reset()
        }

        let xRatio = this.x / this.counter
        let yRatio = this.y / this.counter

        let starX = remap(xRatio, 0, 1, 0, canvasWidth)
        let starY = remap(yRatio, 0, 1, 0, canvasHeight)

        let outerRadius = remap(this.counter, 0, canvasWidth, this.radiusMax, 0)

        if (outerRadius <= 0) return

        this.currentX = starX
        this.currentY = starY
        this.currentRadius = outerRadius

        const diameter = outerRadius * 2

        const twinkle = Math.sin(Date.now() * 0.003 + this.twinkleOffset) * 0.15
        let currentAlpha = this.alpha + twinkle
        if (currentAlpha < 0.2) currentAlpha = 0.2
        if (currentAlpha > 1) currentAlpha = 1

        if (mainContext) {
          mainContext.globalAlpha = currentAlpha
          const img = this.isSpiky ? starAssets[this.colorName].spiky : starAssets[this.colorName].round
          mainContext.drawImage(img, starX - outerRadius, starY - outerRadius, diameter, diameter)
          mainContext.globalAlpha = 1.0
        }
      }
    }

    class ShootingStar {
      constructor() {
        this.x = 0
        this.y = 0
        this.vx = 0
        this.vy = 0
        this.active = false
        this.opacity = 0
      }

      trigger() {
        if (this.active) return
        this.active = true
        this.opacity = 1

        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight

        const angle = Math.random() * Math.PI * 2
        const speed = 15 + Math.random() * 10
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
      }

      draw() {
        if (!this.active) {
          if (Math.random() < 0.005) {
            this.trigger()
          }
          return
        }

        this.x += this.vx
        this.y += this.vy
        this.opacity -= 0.015

        if (this.opacity <= 0) {
          this.active = false
          return
        }

        if (mainContext) {
          mainContext.beginPath()
          const gradient = mainContext.createLinearGradient(this.x, this.y, this.x - this.vx * 3, this.y - this.vy * 3)
          gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`)
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

          mainContext.lineWidth = 2
          mainContext.strokeStyle = gradient
          mainContext.moveTo(this.x, this.y)
          mainContext.lineTo(this.x - this.vx * 3, this.y - this.vy * 3)
          mainContext.stroke()
        }
      }
    }

    function preRenderStars() {
      // Create canvases on client side only
      if (typeof document === 'undefined') return

      STAR_COLORS.forEach(color => {
        const roundStarCanvas = document.createElement('canvas')
        roundStarCanvas.width = STAR_SIZE
        roundStarCanvas.height = STAR_SIZE
        const rCtx = roundStarCanvas.getContext('2d')

        const rGradient = rCtx.createRadialGradient(HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE)
        rGradient.addColorStop(0, color.stops[0])
        rGradient.addColorStop(1, color.stops[1])

        rCtx.fillStyle = rGradient
        rCtx.beginPath()
        rCtx.arc(HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE, 0, Math.PI * 2)
        rCtx.fill()

        const spikyStarCanvas = document.createElement('canvas')
        spikyStarCanvas.width = STAR_SIZE
        spikyStarCanvas.height = STAR_SIZE
        const sCtx = spikyStarCanvas.getContext('2d')

        const sGradient = sCtx.createRadialGradient(HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE)
        sGradient.addColorStop(0, color.stops[0])
        sGradient.addColorStop(1, color.stops[1])

        sCtx.fillStyle = sGradient

        let innerRadius = HALF_STAR_SIZE / 2
        let outerRadius = HALF_STAR_SIZE
        let rot = Math.PI / 2 * 3
        const spikes = 5
        let step = Math.PI / spikes

        sCtx.beginPath()
        sCtx.moveTo(HALF_STAR_SIZE, HALF_STAR_SIZE - outerRadius)

        for (let i = 0; i < spikes; i++) {
          let x = HALF_STAR_SIZE + Math.cos(rot) * outerRadius
          let y = HALF_STAR_SIZE + Math.sin(rot) * outerRadius
          sCtx.lineTo(x, y)
          rot += step

          x = HALF_STAR_SIZE + Math.cos(rot) * innerRadius
          y = HALF_STAR_SIZE + Math.sin(rot) * innerRadius
          sCtx.lineTo(x, y)
          rot += step
        }
        sCtx.lineTo(HALF_STAR_SIZE, HALF_STAR_SIZE - outerRadius)
        sCtx.closePath()
        sCtx.fill()

        starAssets[color.name] = { round: roundStarCanvas, spiky: spikyStarCanvas }
      })
    }

    function createNebula() {
      if (typeof document === 'undefined') return

      nebulaCanvas = document.createElement('canvas')
      nebulaCanvas.width = canvasWidth
      nebulaCanvas.height = canvasHeight
      nebulaContext = nebulaCanvas.getContext('2d')

      const gradient = nebulaContext.createRadialGradient(
        canvasWidth * 0.5,
        canvasHeight * 0.5,
        0,
        canvasWidth * 0.5,
        canvasHeight * 0.5,
        canvasWidth * 0.6
      )
      gradient.addColorStop(0, 'rgba(100, 50, 150, 0.4)')
      gradient.addColorStop(0.5, 'rgba(50, 20, 100, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      nebulaContext.fillStyle = gradient
      nebulaContext.beginPath()
      nebulaContext.arc(canvasWidth * 0.5, canvasHeight * 0.5, canvasWidth * 0.6, 0, Math.PI * 2)
      nebulaContext.fill()

      const secondGradient = nebulaContext.createRadialGradient(
        canvasWidth * 0.3,
        canvasHeight * 0.3,
        0,
        canvasWidth * 0.3,
        canvasHeight * 0.3,
        canvasWidth * 0.3
      )
      secondGradient.addColorStop(0, 'rgba(255, 100, 200, 0.3)')
      secondGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.1)')
      secondGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      nebulaContext.fillStyle = secondGradient
      nebulaContext.beginPath()
      nebulaContext.arc(canvasWidth * 0.3, canvasHeight * 0.3, canvasWidth * 0.3, 0, Math.PI * 2)
      nebulaContext.fill()
    }

    function draw() {
      if (!mainContext) return

      mainContext.fillStyle = 'rgba(0, 0, 0, 0.3)'
      mainContext.fillRect(0, 0, canvasWidth, canvasHeight)

      if (nebulaCanvas) {
        mainContext.drawImage(nebulaCanvas, 0, 0)
      }

      mainContext.translate(centerX, centerY)

      for (let i = 0; i < stars.length; i++) {
        stars[i].drawStar()
      }

      mainContext.translate(-centerX, -centerY)

      if (shootingStar) {
        shootingStar.draw()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    function handleClick(event) {
      const rect = event.target.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i]
        const translatedClickX = clickX - centerX
        const translatedClickY = clickY - centerY

        const dx = translatedClickX - star.currentX
        const dy = translatedClickY - star.currentY
        const distance = Math.sqrt(dx * dx + dy * dy)

        const hitRadius = Math.max(star.currentRadius, 5)

        if (distance <= hitRadius) {
          score.value++
          break
        }
      }
    }

    onMounted(() => {
      outerspace = document.querySelector('#outerspace')
      if (!outerspace) return

      mainContext = outerspace.getContext('2d', { alpha: false })
      if (!mainContext) return

      outerspace.width = window.innerWidth
      outerspace.height = window.innerHeight

      canvasWidth = outerspace.width
      canvasHeight = outerspace.height
      centerX = canvasWidth * 0.5
      centerY = canvasHeight * 0.5

      preRenderStars()

      for (let i = 0; i < numberOfStars; i++) {
        stars.push(new Star())
      }

      shootingStar = new ShootingStar()
      createNebula()
      draw()

      window.addEventListener('resize', handleResize)
    })

    function handleResize() {
        if (!outerspace) return
        outerspace.width = window.innerWidth
        outerspace.height = window.innerHeight
        canvasWidth = outerspace.width
        canvasHeight = outerspace.height
        centerX = canvasWidth * 0.5
        centerY = canvasHeight * 0.5
        createNebula()
    }

    onBeforeUnmount(() => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
        }
        window.removeEventListener('resize', handleResize)
    })

    return {
      score,
      handleClick
    }
  }
})
</script>

<style scoped>
#outerspace {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.score-counter {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-family: sans-serif;
  font-size: 24px;
  pointer-events: none;
  z-index: 10;
}
</style>
