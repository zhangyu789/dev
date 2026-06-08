<template>
  <div class="space-y-4">
    <h2 class="tool-header">⌨️ 键盘键码查询</h2>
    <div class="tool-card text-center space-y-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">按下任意键查看详细信息</p>
      <div
        tabindex="0"
        ref="keyArea"
        @keydown.prevent="onKeyDown"
        class="min-h-[120px] flex items-center justify-center bg-gray-50 dark:bg-slate-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 focus:border-primary-500 focus:outline-none transition-colors cursor-text"
      >
        <div v-if="!keyInfo" class="text-gray-400 text-lg">点击此区域后按键...</div>
        <div v-else class="text-6xl font-bold text-primary-500">{{ keyInfo.key }}</div>
      </div>
    </div>

    <div v-if="keyInfo" class="tool-card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">按键详情</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div v-for="item in keyDetails" :key="item.label"
          class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.label }}</span>
          <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ item.value }}</span>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button @click="keyHistory = []" class="btn-secondary btn-sm">清空历史</button>
      </div>
    </div>

    <div v-if="keyHistory.length > 0" class="tool-card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">按键历史</h3>
      <div class="flex flex-wrap gap-2">
        <span v-for="(k, i) in keyHistory" :key="i"
          class="px-2 py-1 bg-gray-50 dark:bg-slate-700/50 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
          {{ k }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const keyArea = ref(null)
const keyInfo = ref(null)
const keyHistory = ref([])

const keyDetails = computed(() => {
  if (!keyInfo.value) return []
  const k = keyInfo.value
  return [
    { label: 'event.key', value: k.key },
    { label: 'event.code', value: k.code },
    { label: 'event.keyCode', value: k.keyCode },
    { label: 'event.which', value: k.which },
    { label: 'event.key (原始)', value: k.rawKey },
    { label: 'event.code (物理键)', value: k.code },
  ]
})

function onKeyDown(e) {
  keyInfo.value = {
    key: e.key === ' ' ? 'Space' : e.key,
    code: e.code,
    keyCode: e.keyCode,
    which: e.which,
    rawKey: e.key,
  }
  keyHistory.value.push(e.key === ' ' ? 'Space' : e.key)
  if (keyHistory.value.length > 50) keyHistory.value.shift()
}
</script>
