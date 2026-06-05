<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔤 汉字转拼音</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入汉字</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-48" placeholder="输入汉字文本..."></textarea>
      </div>

      <div class="tool-card space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">带声调拼音</label>
          <CopyButton :text="pinyinWithTone" />
        </div>
        <div class="px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg font-mono text-sm min-h-[60px]">
          {{ pinyinWithTone || '—' }}
        </div>

        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">无声调拼音</label>
          <CopyButton :text="pinyinNoTone" />
        </div>
        <div class="px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg font-mono text-sm min-h-[60px]">
          {{ pinyinNoTone || '—' }}
        </div>

        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">首字母</label>
          <CopyButton :text="pinyinInitial" />
        </div>
        <div class="px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg font-mono text-sm">
          {{ pinyinInitial || '—' }}
        </div>
      </div>
    </div>

    <div class="tool-card">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">示例文本</h3>
      <div class="flex gap-2 flex-wrap">
        <button @click="loadSample('poem')" class="btn-secondary btn-sm">古诗词</button>
        <button @click="loadSample('sentence')" class="btn-secondary btn-sm">日常用语</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'
import { pinyin } from 'pinyin-pro'

const input = ref('')

const pinyinWithTone = computed(() => {
  if (!input.value.trim()) return ''
  return pinyin(input.value, { toneType: 'symbol', type: 'array' }).join(' ')
})

const pinyinNoTone = computed(() => {
  if (!input.value.trim()) return ''
  return pinyin(input.value, { toneType: 'none', type: 'array' }).join(' ')
})

const pinyinInitial = computed(() => {
  if (!input.value.trim()) return ''
  return pinyin(input.value, { pattern: 'first', type: 'array' }).join('')
})

function loadSample(type) {
  if (type === 'poem') {
    input.value = '床前明月光，疑是地上霜。举头望明月，低头思故乡。'
  } else {
    input.value = '你好世界，欢迎使用开发者工具箱！'
  }
}
</script>
