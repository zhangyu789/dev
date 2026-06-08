<template>
  <div class="space-y-4">
    <h2 class="tool-header">🖼️ CSS 阴影生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Controls -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">阴影参数</h3>

        <div class="flex gap-2 mb-3">
          <button
            v-for="(layer, i) in shadows" :key="i"
            @click="activeLayer = i"
            :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', activeLayer === i ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']"
          >阴影 {{ i + 1 }}</button>
          <button @click="addShadow" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-700 text-primary-500 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">+ 添加</button>
        </div>

        <div v-if="shadows[activeLayer]" class="space-y-3">
          <!-- Offset X -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">偏移 X</label>
            <input type="range" v-model.number="shadows[activeLayer].x" min="-50" max="50" class="flex-1" />
            <input type="number" v-model.number="shadows[activeLayer].x" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
          <!-- Offset Y -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">偏移 Y</label>
            <input type="range" v-model.number="shadows[activeLayer].y" min="-50" max="50" class="flex-1" />
            <input type="number" v-model.number="shadows[activeLayer].y" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
          <!-- Blur -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">模糊</label>
            <input type="range" v-model.number="shadows[activeLayer].blur" min="0" max="100" class="flex-1" />
            <input type="number" v-model.number="shadows[activeLayer].blur" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
          <!-- Spread -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">扩展</label>
            <input type="range" v-model.number="shadows[activeLayer].spread" min="-50" max="50" class="flex-1" />
            <input type="number" v-model.number="shadows[activeLayer].spread" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
          <!-- Color -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">颜色</label>
            <input type="color" v-model="shadows[activeLayer].color" class="w-8 h-8 rounded cursor-pointer border-0" />
            <input type="text" v-model="shadows[activeLayer].color" class="input-field flex-1 text-sm font-mono" />
          </div>
          <!-- Opacity -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">透明度</label>
            <input type="range" v-model.number="shadows[activeLayer].opacity" min="0" max="100" class="flex-1" />
            <span class="text-xs text-gray-500 w-10 text-right">{{ shadows[activeLayer].opacity }}%</span>
          </div>
          <!-- Inset -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="shadows[activeLayer].inset" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">内阴影 (inset)</span>
          </label>

          <button v-if="shadows.length > 1" @click="removeShadow(activeLayer)" class="text-sm text-red-500 hover:text-red-600 transition-colors">删除此阴影</button>
        </div>

        <!-- Box settings -->
        <div class="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-3">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400">预览盒子设置</h4>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">背景色</label>
              <input type="color" v-model="boxBg" class="w-full h-8 rounded cursor-pointer border-0" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">圆角</label>
              <input type="number" v-model.number="boxRadius" class="input-field text-sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- Preview & Code -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">实时预览</h3>
        <div class="flex items-center justify-center min-h-[240px] bg-gray-100 dark:bg-slate-700/30 rounded-lg p-8">
          <div
            :style="{
              width: '160px',
              height: '160px',
              background: boxBg,
              borderRadius: boxRadius + 'px',
              boxShadow: cssValue
            }"
            class="transition-all duration-150"
          ></div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">CSS 代码</label>
            <CopyButton :text="fullCss" />
          </div>
          <pre class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">{{ fullCss }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`
}

const defaultShadow = () => ({ x: 0, y: 4, blur: 20, spread: 0, color: '#000000', opacity: 25, inset: false })
const shadows = ref([defaultShadow()])
const activeLayer = ref(0)
const boxBg = ref('#ffffff')
const boxRadius = ref(12)

function addShadow() {
  shadows.value.push(defaultShadow())
  activeLayer.value = shadows.value.length - 1
}

function removeShadow(index) {
  shadows.value.splice(index, 1)
  if (activeLayer.value >= shadows.value.length) activeLayer.value = shadows.value.length - 1
}

const cssValue = computed(() => {
  return shadows.value.map(s => {
    const color = hexToRgba(s.color, s.opacity)
    return `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${color}`
  }).join(', ')
})

const fullCss = computed(() => {
  return `box-shadow: ${cssValue.value};`
})
</script>
