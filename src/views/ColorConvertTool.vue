<template>
  <div class="space-y-4">
    <h2 class="tool-header">🎨 颜色格式转换器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Color Picker -->
      <div class="tool-card flex flex-col items-center gap-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 w-full">选色器</h3>
        <input type="color" v-model="hexValue" class="w-40 h-40 rounded-xl cursor-pointer border-0" />
        <div class="w-full h-16 rounded-lg border border-gray-200 dark:border-slate-600" :style="{ backgroundColor: hexValue }"></div>
      </div>

      <!-- Format Values -->
      <div class="tool-card space-y-3 lg:col-span-2">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">颜色值</h3>
        
        <div v-for="fmt in formats" :key="fmt.key" class="flex items-center gap-2">
          <span class="text-xs font-semibold text-gray-400 w-16 shrink-0">{{ fmt.label }}</span>
          <input :value="fmt.value" readonly class="input-field font-mono text-sm flex-1" @focus="$event.target.select()" />
          <CopyButton :text="fmt.value" />
        </div>

        <!-- Alpha -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">透明度:</label>
            <input type="range" v-model.number="alpha" min="0" max="100" step="1" class="flex-1" />
            <span class="text-sm font-mono text-gray-500 w-12 text-right">{{ alpha }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input parse -->
    <div class="tool-card space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">输入颜色值解析</h3>
      <div class="flex gap-2">
        <input v-model="parseInput" class="input-field font-mono" placeholder="输入任意格式颜色值，如 #ff0000 / rgb(255,0,0) / hsl(0,100%,50%) / cmyk(0,100,100,0)" />
        <button @click="parseColorInput" class="btn-primary btn-sm shrink-0">解析</button>
      </div>
      <div v-if="parseError" class="text-sm text-red-500">{{ parseError }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const hexValue = ref('#6366f1')
const alpha = ref(100)

function hexToRgb(hex) {
  hex = hex.replace('#', '')
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  }
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function rgbToCmyk(r, g, b) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 }
  const c1 = 1 - r / 255, m1 = 1 - g / 255, y1 = 1 - b / 255
  const k = Math.min(c1, m1, y1)
  return {
    c: Math.round(((c1 - k) / (1 - k)) * 100),
    m: Math.round(((m1 - k) / (1 - k)) * 100),
    y: Math.round(((y1 - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  }
}

const formats = computed(() => {
  const rgb = hexToRgb(hexValue.value)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
  const a = (alpha.value / 100).toFixed(2)
  return [
    { key: 'hex', label: 'HEX', value: hexValue.value.toUpperCase() },
    { key: 'rgb', label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: 'rgba', label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})` },
    { key: 'hsl', label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { key: 'hsla', label: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})` },
    { key: 'cmyk', label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ]
})

// Parse input
const parseInput = ref('')
const parseError = ref('')

function parseColorInput() {
  parseError.value = ''
  const input = parseInput.value.trim()
  if (!input) return

  let r, g, b
  // HEX
  const hexMatch = input.match(/^#?([0-9a-fA-F]{3,8})$/)
  if (hexMatch) {
    let hex = hexMatch[1]
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
    if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16)
      g = parseInt(hex.substring(2, 4), 16)
      b = parseInt(hex.substring(4, 6), 16)
    }
  }
  // RGB
  if (!r && !g && !b) {
    const rgbMatch = input.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
    if (rgbMatch) {
      r = parseInt(rgbMatch[1]); g = parseInt(rgbMatch[2]); b = parseInt(rgbMatch[3])
    }
  }
  // HSL
  if (!r && r !== 0) {
    const hslMatch = input.match(/hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360
      const s = parseInt(hslMatch[2]) / 100
      const l = parseInt(hslMatch[3]) / 100
      // HSL to RGB
      let r1, g1, b1
      if (s === 0) { r1 = g1 = b1 = l } else {
        const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r1 = hue2rgb(p, q, h + 1/3); g1 = hue2rgb(p, q, h); b1 = hue2rgb(p, q, h - 1/3)
      }
      r = Math.round(r1 * 255); g = Math.round(g1 * 255); b = Math.round(b1 * 255)
    }
  }

  if (r !== undefined && g !== undefined && b !== undefined) {
    r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); b = Math.min(255, Math.max(0, b))
    hexValue.value = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
  } else {
    parseError.value = '无法解析该颜色值，请检查格式'
  }
}
</script>
