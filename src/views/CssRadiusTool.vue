<template>
  <div class="space-y-4">
    <h2 class="tool-header">⬜ CSS 圆角生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Controls -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">圆角参数</h3>

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="uniform" class="w-4 h-4 rounded text-primary-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">统一四角</span>
        </label>

        <!-- Uniform mode -->
        <div v-if="uniform" class="space-y-3">
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">圆角</label>
            <input type="range" v-model.number="radius.topLeft" min="0" max="150" class="flex-1" />
            <input type="number" v-model.number="radius.topLeft" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
        </div>

        <!-- Individual mode -->
        <div v-else class="space-y-3">
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">左上</label>
            <input type="range" v-model.number="radius.topLeft" min="0" max="150" class="flex-1" />
            <input type="number" v-model.number="radius.topLeft" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">右上</label>
            <input type="range" v-model.number="radius.topRight" min="0" max="150" class="flex-1" />
            <input type="number" v-model.number="radius.topRight" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">右下</label>
            <input type="range" v-model.number="radius.bottomRight" min="0" max="150" class="flex-1" />
            <input type="number" v-model.number="radius.bottomRight" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">左下</label>
            <input type="range" v-model.number="radius.bottomLeft" min="0" max="150" class="flex-1" />
            <input type="number" v-model.number="radius.bottomLeft" class="input-field w-16 text-center text-sm" />
            <span class="text-xs text-gray-400">px</span>
          </div>
        </div>

        <!-- Box settings -->
        <div class="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-3">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400">预览设置</h4>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">宽度</label>
              <input type="number" v-model.number="boxWidth" class="input-field text-sm" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">高度</label>
              <input type="number" v-model.number="boxHeight" class="input-field text-sm" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">背景色</label>
              <input type="color" v-model="boxBg" class="w-full h-8 rounded cursor-pointer border-0" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">边框</label>
              <input type="number" v-model.number="boxBorder" class="input-field text-sm" />
            </div>
          </div>
        </div>

        <!-- Presets -->
        <div class="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-2">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400">常用预设</h4>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="preset in presets" :key="preset.label"
              @click="applyPreset(preset)"
              class="px-2 py-1.5 text-xs bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors text-center"
            >
              <div
                class="w-8 h-8 mx-auto mb-1 bg-primary-500"
                :style="{ borderRadius: preset.css }"
              ></div>
              {{ preset.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Preview & Code -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">实时预览</h3>
        <div class="flex items-center justify-center min-h-[240px] bg-gray-100 dark:bg-slate-700/30 rounded-lg p-8">
          <div
            :style="{
              width: boxWidth + 'px',
              height: boxHeight + 'px',
              background: boxBg,
              border: boxBorder + 'px solid #e5e7eb',
              borderRadius: cssValue
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
import { ref, computed, watch } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const uniform = ref(true)
const radius = ref({ topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 })
const boxWidth = ref(180)
const boxHeight = ref(180)
const boxBg = ref('#6366f1')
const boxBorder = ref(0)

watch(uniform, (val) => {
  if (val) {
    radius.value.topRight = radius.value.topLeft
    radius.value.bottomRight = radius.value.topLeft
    radius.value.bottomLeft = radius.value.topLeft
  }
})

watch(() => radius.value.topLeft, (val) => {
  if (uniform.value) {
    radius.value.topRight = val
    radius.value.bottomRight = val
    radius.value.bottomLeft = val
  }
})

const cssValue = computed(() => {
  const r = radius.value
  if (r.topLeft === r.topRight && r.topRight === r.bottomRight && r.bottomRight === r.bottomLeft) {
    return r.topLeft + 'px'
  }
  return `${r.topLeft}px ${r.topRight}px ${r.bottomRight}px ${r.bottomLeft}px`
})

const fullCss = computed(() => {
  return `border-radius: ${cssValue.value};`
})

const presets = [
  { label: '圆角', css: '16px', r: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 } },
  { label: '大圆角', css: '32px', r: { topLeft: 32, topRight: 32, bottomRight: 32, bottomLeft: 32 } },
  { label: '胶囊', css: '999px', r: { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999 } },
  { label: '圆形', css: '50%', r: { topLeft: 150, topRight: 150, bottomRight: 150, bottomLeft: 150 } },
  { label: '叶子', css: '64px 0', r: { topLeft: 64, topRight: 0, bottomRight: 0, bottomLeft: 64 } },
  { label: '水滴', css: '0 64px', r: { topLeft: 0, topRight: 64, bottomRight: 64, bottomLeft: 0 } },
]

function applyPreset(preset) {
  uniform.value = false
  radius.value = { ...preset.r }
}
</script>
