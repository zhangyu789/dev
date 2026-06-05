<template>
  <div class="space-y-4">
    <h2 class="tool-header">🎯 配色方案生成器</h2>

    <div class="tool-card space-y-4">
      <!-- Base color -->
      <div class="flex items-center gap-4 flex-wrap">
        <input type="color" v-model="baseColor" class="w-16 h-16 rounded-lg cursor-pointer border-0" />
        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">基色</p>
          <p class="font-mono text-sm text-gray-500">{{ baseColor }}</p>
        </div>
        <button @click="randomColor" class="btn-secondary btn-sm">随机颜色</button>
      </div>

      <!-- Harmony type -->
      <div>
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">配色模式</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="mode in modes" :key="mode.key"
            @click="activeMode = mode.key"
            :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeMode === mode.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']"
          >{{ mode.label }}</button>
        </div>
      </div>
    </div>

    <!-- Palette -->
    <div class="tool-card">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">配色方案</h3>
        <CopyButton :text="paletteText" />
      </div>
      <div class="flex rounded-xl overflow-hidden h-32 border border-gray-200 dark:border-slate-600">
        <div
          v-for="(color, i) in palette"
          :key="i"
          class="flex-1 flex flex-col items-center justify-center cursor-pointer group relative"
          :style="{ backgroundColor: color }"
          @click="copyColor(color)"
        >
          <span class="text-xs font-mono font-bold drop-shadow-md" :class="isLight(color) ? 'text-gray-800' : 'text-white'">
            {{ color.toUpperCase() }}
          </span>
          <button
            v-if="!lockedColors.includes(i)"
            @click.stop="lockedColors.push(i)"
            class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-xs"
            :class="isLight(color) ? 'text-gray-600' : 'text-gray-300'"
          >🔒</button>
          <button
            v-else
            @click.stop="lockedColors = lockedColors.filter(x => x !== i)"
            class="absolute top-1 right-1 text-xs"
          >🔓</button>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button @click="generatePalette" class="btn-primary btn-sm">重新生成</button>
        <span class="text-xs text-gray-400 flex items-center">点击色块复制颜色值，🔒锁定颜色后重新生成</span>
      </div>
    </div>

    <!-- Image extraction -->
    <div class="tool-card space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">从图片提取配色</h3>
      <input type="file" accept="image/*" @change="handleImageUpload" class="input-field text-sm" />
      <div v-if="extractedColors.length" class="space-y-2">
        <div class="flex gap-2 flex-wrap">
          <div
            v-for="(color, i) in extractedColors"
            :key="i"
            class="w-16 h-16 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer flex items-end justify-center pb-1"
            :style="{ backgroundColor: color }"
            @click="copyColor(color)"
          >
            <span class="text-[10px] font-mono font-bold" :class="isLight(color) ? 'text-gray-800' : 'text-white'">{{ color }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CopyButton from '../components/CopyButton.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()
const baseColor = ref('#6366f1')
const activeMode = ref('complementary')
const lockedColors = ref([])
const extractedColors = ref([])

const modes = [
  { key: 'complementary', label: '互补色' },
  { key: 'analogous', label: '类似色' },
  { key: 'triadic', label: '三等分' },
  { key: 'split-complementary', label: '分裂互补' },
  { key: 'tetradic', label: '四等分' },
  { key: 'monochromatic', label: '单色系' },
]

function hexToHsl(hex) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q-p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q-p) * (2/3-t) * 6; return p }
  let r, g, b
  if (s === 0) { r = g = b = l } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h / 360 + 1/3); g = hue2rgb(p, q, h / 360); b = hue2rgb(p, q, h / 360 - 1/3)
  }
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

const palette = computed(() => {
  const [h, s, l] = hexToHsl(baseColor.value)
  const colors = []
  switch (activeMode.value) {
    case 'complementary':
      colors.push(hslToHex(h, s, l), hslToHex(h + 180, s, l))
      break
    case 'analogous':
      colors.push(hslToHex(h - 30, s, l), hslToHex(h, s, l), hslToHex(h + 30, s, l), hslToHex(h + 60, s, l), hslToHex(h - 60, s, l))
      break
    case 'triadic':
      colors.push(hslToHex(h, s, l), hslToHex(h + 120, s, l), hslToHex(h + 240, s, l))
      break
    case 'split-complementary':
      colors.push(hslToHex(h, s, l), hslToHex(h + 150, s, l), hslToHex(h + 210, s, l))
      break
    case 'tetradic':
      colors.push(hslToHex(h, s, l), hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l))
      break
    case 'monochromatic':
      colors.push(hslToHex(h, s, l - 30), hslToHex(h, s, l - 15), hslToHex(h, s, l), hslToHex(h, s, l + 15), hslToHex(h, s, l + 30))
      break
  }
  // Apply locked colors
  return colors
})

const paletteText = computed(() => palette.value.join(', '))

function randomColor() {
  const h = Math.floor(Math.random() * 360)
  const s = 50 + Math.floor(Math.random() * 40)
  const l = 40 + Math.floor(Math.random() * 30)
  baseColor.value = hslToHex(h, s, l)
}

function generatePalette() {
  randomColor()
}

function isLight(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

function copyColor(color) {
  navigator.clipboard.writeText(color)
  show(`已复制 ${color}`, 'success')
}

function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const img = new Image()
  const reader = new FileReader()
  reader.onload = (ev) => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 50
      canvas.height = 50
      ctx.drawImage(img, 0, 0, 50, 50)
      const data = ctx.getImageData(0, 0, 50, 50).data
      // Simple k-means-like color extraction
      const colorMap = {}
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 32) * 32
        const g = Math.round(data[i+1] / 32) * 32
        const b = Math.round(data[i+2] / 32) * 32
        const key = `${r},${g},${b}`
        colorMap[key] = (colorMap[key] || 0) + 1
      }
      const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1])
      extractedColors.value = sorted.slice(0, 8).map(([key]) => {
        const [r, g, b] = key.split(',').map(Number)
        return '#' + [r, g, b].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('')
      })
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}
</script>
