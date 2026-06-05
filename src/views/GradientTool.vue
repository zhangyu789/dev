<template>
  <div class="space-y-4">
    <h2 class="tool-header">🌈 渐变生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Preview -->
      <div class="tool-card">
        <div
          class="w-full h-64 rounded-xl border border-gray-200 dark:border-slate-600"
          :style="{ background: gradientCSS }"
        ></div>
        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">CSS 代码</span>
            <CopyButton :text="gradientCSS" />
          </div>
          <pre class="textarea-field h-20 text-xs">{{ gradientCSS }}</pre>
        </div>
      </div>

      <!-- Controls -->
      <div class="tool-card space-y-4">
        <!-- Gradient type -->
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">渐变类型</label>
          <div class="flex gap-2">
            <button
              v-for="t in ['linear', 'radial']" :key="t"
              @click="gradientType = t"
              :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', gradientType === t ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']"
            >{{ t === 'linear' ? '线性渐变' : '径向渐变' }}</button>
          </div>
        </div>

        <!-- Angle (linear only) -->
        <div v-if="gradientType === 'linear'">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            角度: {{ angle }}°
          </label>
          <input type="range" v-model.number="angle" min="0" max="360" step="1" class="w-full" />
          <div class="flex gap-2 mt-2">
            <button v-for="a in [0, 45, 90, 135, 180, 225, 270, 315]" :key="a" @click="angle = a" class="btn-secondary btn-sm text-xs">{{ a }}°</button>
          </div>
        </div>

        <!-- Radial shape -->
        <div v-if="gradientType === 'radial'">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">形状</label>
          <div class="flex gap-2">
            <button
              v-for="s in ['circle', 'ellipse']" :key="s"
              @click="radialShape = s"
              :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', radialShape === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']"
            >{{ s === 'circle' ? '圆形' : '椭圆' }}</button>
          </div>
        </div>

        <!-- Color stops -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">色标</label>
            <button @click="addStop" :disabled="stops.length >= 8" class="btn-secondary btn-sm">+ 添加色标</button>
          </div>
          <div class="space-y-2">
            <div v-for="(stop, i) in stops" :key="i" class="flex items-center gap-2">
              <input type="color" v-model="stop.color" class="w-10 h-10 rounded cursor-pointer border-0" />
              <input type="range" v-model.number="stop.position" min="0" max="100" step="1" class="flex-1" />
              <span class="text-xs text-gray-400 w-10 text-right">{{ stop.position }}%</span>
              <button v-if="stops.length > 2" @click="stops.splice(i, 1)" class="text-red-400 hover:text-red-500 text-sm">✕</button>
            </div>
          </div>
        </div>

        <!-- Presets -->
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">预设渐变</label>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="(preset, i) in presets" :key="i"
              class="h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-600 hover:scale-105 transition-transform"
              :style="{ background: preset.css }"
              @click="applyPreset(preset)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const gradientType = ref('linear')
const angle = ref(135)
const radialShape = ref('circle')
const stops = ref([
  { color: '#6366f1', position: 0 },
  { color: '#ec4899', position: 100 },
])

const gradientCSS = computed(() => {
  const colorStops = [...stops.value].sort((a, b) => a.position - b.position)
    .map(s => `${s.color} ${s.position}%`).join(', ')
  if (gradientType.value === 'linear') {
    return `linear-gradient(${angle.value}deg, ${colorStops})`
  }
  return `radial-gradient(${radialShape.value}, ${colorStops})`
})

function addStop() {
  if (stops.value.length >= 8) return
  const lastPos = stops.value[stops.value.length - 1]?.position || 50
  stops.value.push({ color: '#ffffff', position: Math.min(100, lastPos) })
}

const presets = [
  { css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }], angle: 135 },
  { css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }], angle: 135 },
  { css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', stops: [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }], angle: 135 },
  { css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', stops: [{ color: '#43e97b', position: 0 }, { color: '#38f9d7', position: 100 }], angle: 135 },
  { css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', stops: [{ color: '#fa709a', position: 0 }, { color: '#fee140', position: 100 }], angle: 135 },
  { css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', stops: [{ color: '#a18cd1', position: 0 }, { color: '#fbc2eb', position: 100 }], angle: 135 },
  { css: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', stops: [{ color: '#fccb90', position: 0 }, { color: '#d57eeb', position: 100 }], angle: 135 },
  { css: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)', stops: [{ color: '#0c3483', position: 0 }, { color: '#a2b6df', position: 100 }], angle: 135 },
]

function applyPreset(preset) {
  stops.value = preset.stops.map(s => ({ ...s }))
  angle.value = preset.angle || 135
  gradientType.value = 'linear'
}
</script>
