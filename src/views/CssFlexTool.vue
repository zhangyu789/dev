<template>
  <div class="space-y-4">
    <h2 class="tool-header">📐 CSS Flexbox 生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Controls -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">容器属性</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">flex-direction</label>
            <select v-model="flex.direction" class="input-field text-sm">
              <option v-for="v in ['row','row-reverse','column','column-reverse']" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">justify-content</label>
            <select v-model="flex.justifyContent" class="input-field text-sm">
              <option v-for="v in ['flex-start','flex-end','center','space-between','space-around','space-evenly']" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">align-items</label>
            <select v-model="flex.alignItems" class="input-field text-sm">
              <option v-for="v in ['flex-start','flex-end','center','stretch','baseline']" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">flex-wrap</label>
            <select v-model="flex.wrap" class="input-field text-sm">
              <option v-for="v in ['nowrap','wrap','wrap-reverse']" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">gap</label>
            <input type="number" v-model.number="flex.gap" min="0" max="40" class="input-field text-sm" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">子元素数量</label>
            <input type="number" v-model.number="childCount" min="1" max="12" class="input-field text-sm" />
          </div>
        </div>
      </div>

      <!-- Preview & Code -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">实时预览</h3>
        <div class="min-h-[240px] bg-gray-100 dark:bg-slate-700/30 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-slate-600">
          <div :style="containerStyle" class="min-h-[200px]">
            <div v-for="i in childCount" :key="i"
              class="flex items-center justify-center bg-primary-500 text-white rounded-lg font-bold text-sm"
              :style="{ minHeight: (40 + (i % 3) * 20) + 'px', padding: '8px 16px' }"
            >{{ i }}</div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">CSS 代码</label>
            <CopyButton :text="cssCode" />
          </div>
          <pre class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">{{ cssCode }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const flex = ref({
  direction: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  wrap: 'nowrap',
  gap: 8,
})
const childCount = ref(4)

const containerStyle = computed(() => ({
  display: 'flex',
  flexDirection: flex.value.direction,
  justifyContent: flex.value.justifyContent,
  alignItems: flex.value.alignItems,
  flexWrap: flex.value.wrap,
  gap: flex.value.gap + 'px',
}))

const cssCode = computed(() => {
  return `display: flex;\nflex-direction: ${flex.value.direction};\njustify-content: ${flex.value.justifyContent};\nalign-items: ${flex.value.alignItems};\nflex-wrap: ${flex.value.wrap};\ngap: ${flex.value.gap}px;`
})
</script>
