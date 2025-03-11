document.addEventListener("DOMContentLoaded", () => {
  const colorPicker = document.getElementById("color-picker")
  const colorDisplay = document.getElementById("color-display")
  const colorCode = document.getElementById("color-code")
  const hexInput = document.getElementById("hex-input")
  const rgbInput = document.getElementById("rgb-input")
  const hslInput = document.getElementById("hsl-input")
  const copyButton = document.getElementById("copy-button")
  const eyedropperButton = document.getElementById("eyedropper-button")
  const tailwindColorsGrid = document.getElementById("tailwind-colors-grid")
  const tooltip = document.getElementById("tooltip")
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")
  const refreshButton = document.getElementById("refresh-button")
  const generatedColors = document.getElementById("generated-colors")

  let currentColor = colorPicker.value

  const popupContainer = document.querySelector(".popup-container")
  const themeToggle = document.createElement("button")
  themeToggle.className = "theme-toggle"
  themeToggle.innerHTML = "🌙"
  themeToggle.title = "Toggle dark mode"
  popupContainer.appendChild(themeToggle)

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark")
    themeToggle.innerHTML = "☀️"
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab

      tabButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      tabContents.forEach((content) => content.classList.remove("active"))
      document.getElementById(`${tabName}-tab`).classList.add("active")
    })
  })

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark")
    themeToggle.innerHTML = document.body.classList.contains("dark") ? "☀️" : "🌙"
  })

  function hexToRgb(hex) {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  function rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h,
      s,
      l = (max + min) / 2

    if (max === min) {
      h = s = 0 
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h = Math.round(h * 60)
    }

    s = Math.round(s * 100)
    l = Math.round(l * 100)

    return { h, s, l }
  }

  // Function to convert HSL to RGB
  function hslToRgb(h, s, l) {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let r, g, b

    if (0 <= h && h < 60) {
      ;[r, g, b] = [c, x, 0]
    } else if (60 <= h && h < 120) {
      ;[r, g, b] = [x, c, 0]
    } else if (120 <= h && h < 180) {
      ;[r, g, b] = [0, c, x]
    } else if (180 <= h && h < 240) {
      ;[r, g, b] = [0, x, c]
    } else if (240 <= h && h < 300) {
      ;[r, g, b] = [x, 0, c]
    } else {
      ;[r, g, b] = [c, 0, x]
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
        .toUpperCase()
    )
  }

  function generateRandomColor() {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return rgbToHex(r, g, b)
  }

  function generateTailwindShades(baseColor) {
    const rgb = hexToRgb(baseColor)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

    const lightnessValues = {
      50: 97,
      100: 94,
      200: 86,
      300: 77,
      400: 66,
      500: 50, 
      600: 40,
      700: 30,
      800: 20,
      900: 10,
    }

    const shades = {}

    for (const [shade, lightness] of Object.entries(lightnessValues)) {
      const adjustedRgb = hslToRgb(hsl.h, hsl.s, lightness)
      shades[shade] = rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b)
    }

    return shades
  }

  function displayTailwindShades(shades) {
    tailwindColorsGrid.innerHTML = ""

    for (const [shade, color] of Object.entries(shades)) {
      const colorShadeElement = document.createElement("div")
      colorShadeElement.className = "color-shade"
      colorShadeElement.dataset.color = color
      colorShadeElement.dataset.shade = shade

      const colorBox = document.createElement("div")
      colorBox.className = "color-shade-box"
      colorBox.style.backgroundColor = color

      const shadeLabel = document.createElement("div")
      shadeLabel.className = "color-shade-label"
      shadeLabel.textContent = shade

      const colorValue = document.createElement("div")
      colorValue.className = "color-shade-value"
      colorValue.textContent = color

      colorShadeElement.appendChild(colorBox)
      colorShadeElement.appendChild(shadeLabel)
      colorShadeElement.appendChild(colorValue)

      colorShadeElement.addEventListener("click", function () {
        const colorValue = this.dataset.color

        navigator.clipboard
          .writeText(colorValue)
          .then(() => {
            showTooltip(this, `Copied ${colorValue}`)
          })
          .catch((err) => {
            console.error("Failed to copy: ", err)
          })
      })

      tailwindColorsGrid.appendChild(colorShadeElement)
    }
  }

  function generateRandomPalette(count = 8) {
    generatedColors.innerHTML = ""
    const colors = []

    for (let i = 0; i < count; i++) {
      const color = generateRandomColor()
      colors.push(color)

      const colorElement = document.createElement("div")
      colorElement.className = "generated-color"
      colorElement.style.backgroundColor = color
      colorElement.dataset.color = color

      const colorLabel = document.createElement("div")
      colorLabel.className = "generated-color-label"
      colorLabel.textContent = color

      colorElement.appendChild(colorLabel)

      colorElement.addEventListener("click", function () {
        const selectedColor = this.dataset.color
        selectColor(selectedColor)

        document.querySelectorAll(".generated-color").forEach((el) => {
          el.style.border = "none"
        })
        this.style.border = "2px solid white"
      })

      generatedColors.appendChild(colorElement)
    }

    return colors
  }

  function showTooltip(element, message) {
    const rect = element.getBoundingClientRect()
    tooltip.textContent = message
    tooltip.style.top = `${rect.top - 30}px`
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`
    tooltip.classList.add("visible")

    setTimeout(() => {
      tooltip.classList.remove("visible")
    }, 1500)
  }

  function selectColor(color) {
    currentColor = color

    colorPicker.value = color

    colorDisplay.style.backgroundColor = color
    colorCode.textContent = color

    hexInput.value = color

    const rgb = hexToRgb(color)
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    colorCode.style.backgroundColor = brightness < 128 ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)"
    colorCode.style.color = brightness < 128 ? "white" : "black"

    const tailwindShades = generateTailwindShades(color)
    displayTailwindShades(tailwindShades)
  }

  selectColor(colorPicker.value)

  generateRandomPalette()

  colorPicker.addEventListener("input", function () {
    selectColor(this.value)
  })

  refreshButton.addEventListener("click", () => {
    generateRandomPalette()
  })

  copyButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(hexInput.value)
      .then(() => {
        const originalText = copyButton.textContent
        copyButton.textContent = "✅ Copied!"
        setTimeout(() => {
          copyButton.textContent = originalText
        }, 1500)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  })

  if ("EyeDropper" in window) {
    eyedropperButton.addEventListener("click", async () => {
      try {
        const eyeDropper = new EyeDropper()
        const result = await eyeDropper.open()
        selectColor(result.sRGBHex)
      } catch (e) {
        console.error(e)
      }
    })
  } else {
    eyedropperButton.disabled = true
    eyedropperButton.title = "Eyedropper not supported in this browser"
    eyedropperButton.style.opacity = "0.5"
  }
})

