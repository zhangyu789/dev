<template>
  <div class="space-y-4">
    <h2 class="tool-header">📏 CSS 单位转换</h2>

    <div class="tool-card space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">数值</label>
          <input type="number" v-model.number="inputValue" class="input-field text-lg font-bold" @input="convert" />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">输入单位</label>
          <select v-model="fromUnit" class="input-field" @change="convert">
            <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">基准字号 (rem基准)</label>
          <input type="number" v-model.number="baseFontSize" min="1" max="64" class="input-field" @input="convert" />
        </div>
      </div>
    </div>

    <div class="tool-card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">转换结果</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div v-for="r in results" :key="r.unit"
          class="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <span class="text-xs font-semibold text-primary-500">{{ r.unit }}</span>
          <span class="text-sm font-mono text-gray-800 dark:text-gray-200">{{ r.value }}</span>
        </div>
      </div>
    </div>

    <!-- Quick reference -->
    <div class="tool-card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">常用换算速查（基准 {{ baseFontSize }}px）</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-slate-600">
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">px</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">rem</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">pt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in refTable" :key="row.px" class="border-b border-gray-100 dark:border-slate-700/50">
              <td class="py-1.5 px-3 font-mono">{{ row.px }}px</td>
              <td class="py-1.5 px-3 font-mono">{{ row.rem }}rem</td>
              <td class="py-1.5 px-3 font-mono">{{ row.pt }}pt</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const inputValue = ref(16)
const fromUnit = ref('px')
const baseFontSize = ref(16)
const viewportWidth = ref(1920)
const viewportHeight = ref(1080)
const units = ['px', 'rem', 'em', 'pt', 'vw', 'vh', '%', 'cm', 'mm', 'in']

const results = computed(() => {
  const val = inputValue.value
  const base = baseFontSize.value
  let px = 0

  // Convert to px first
  switch (fromUnit.value) {
    case 'px': px = val; break
    case 'rem': case 'em': px = val * base; break
    case 'pt': px = val * (96 / 72); break
    case 'vw': px = val * viewportWidth.value / 100; break
    case 'vh': px = val * viewportHeight.value / 100; break
    case '%': px = val * base / 100; break
    case 'cm': px = val * (96 / 2.54); break
    case 'mm': px = val * (96 / 25.4); break
    case 'in': px = val * 96; break
  }

  return [
    { unit: 'px', value: parseFloat(px.toFixed(2)) + 'px' },
    { unit: 'rem', value: parseFloat((px / base).toFixed(4)) + 'rem' },
    { unit: 'em', value: parseFloat((px / base).toFixed(4)) + 'em' },
    { unit: 'pt', value: parseFloat((px * 72 / 96).toFixed(2)) + 'pt' },
    { unit: 'vw', value: parseFloat((px * 100 / viewportWidth.value).toFixed(4)) + 'vw' },
    { unit: 'vh', value: parseFloat((px * 100 / viewportHeight.value).toFixed(4)) + 'vh' },
    { unit: '%', value: parseFloat((px * 100 / base).toFixed(2)) + '%' },
    { unit: 'cm', value: parseFloat((px * 2.54 / 96).toFixed(4)) + 'cm' },
    { unit: 'mm', value: parseFloat((px * 25.4 / 96).toFixed(4)) + 'mm' },
    { unit: 'in', value: parseFloat((px / 96).toFixed(4)) + 'in' },
  ]
})

const refTable = computed(() => {
  const base = baseFontSize.value
  const sizes = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]
  return sizes.map(px => ({
    px,
    rem: parseFloat((px / base).toFixed(4)),
    pt: parseFloat((px * 72 / 96).toFixed(1)),
  }))
})

function convert() {}
</script>
