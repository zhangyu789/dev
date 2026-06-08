<template>
  <div class="space-y-4">
    <h2 class="tool-header">📏 文本字数统计</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入文本</label>
          <div class="flex gap-2">
            <button @click="text = ''" class="btn-secondary btn-sm">清空</button>
          </div>
        </div>
        <textarea v-model="text" class="textarea-field h-80" placeholder="在此输入或粘贴文本，实时统计..."></textarea>
      </div>

      <!-- Stats -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">统计结果</h3>

        <!-- Main stats -->
        <div class="grid grid-cols-2 gap-3">
          <div v-for="stat in mainStats" :key="stat.label"
            class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div class="text-2xl font-bold text-primary-500">{{ stat.value }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Detail stats -->
        <div class="space-y-1">
          <div v-for="stat in detailStats" :key="stat.label"
            class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ stat.label }}</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ stat.value }}</span>
          </div>
        </div>

        <!-- Character frequency -->
        <div v-if="topChars.length > 0" class="border-t border-gray-200 dark:border-slate-600 pt-3">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">高频字符 Top 10</h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="item in topChars" :key="item.char"
              class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-xs">
              <span class="font-mono text-primary-500">{{ item.char === ' ' ? '空格' : item.char === '\n' ? '换行' : item.char }}</span>
              <span class="text-gray-400">{{ item.count }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const text = ref('')

const mainStats = computed(() => [
  { label: '字符数（含空格）', value: text.value.length },
  { label: '字符数（不含空格）', value: text.value.replace(/\s/g, '').length },
  { label: '中文字数', value: (text.value.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length },
  { label: '英文单词数', value: text.value.trim() ? (text.value.match(/[a-zA-Z]+/g) || []).length : 0 },
])

const detailStats = computed(() => {
  const t = text.value
  const lines = t.split('\n')
  const paragraphs = t.split(/\n\s*\n/).filter(p => p.trim())
  const chineseChars = (t.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
  const englishChars = (t.match(/[a-zA-Z]/g) || []).length
  const digits = (t.match(/[0-9]/g) || []).length
  const spaces = (t.match(/ /g) || []).length
  const punctuation = (t.match(/[，。！？、；：""''【】（）《》—…·,.!?;:'"()\[\]{}<>]/g) || []).length

  // Byte calculation
  let bytes = 0
  for (const char of t) {
    const code = char.codePointAt(0)
    if (code <= 0x7f) bytes += 1
    else if (code <= 0x7ff) bytes += 2
    else if (code <= 0xffff) bytes += 3
    else bytes += 4
  }

  return [
    { label: '行数', value: lines.length },
    { label: '非空行数', value: lines.filter(l => l.trim()).length },
    { label: '段落数', value: paragraphs.length },
    { label: '英文字母', value: englishChars },
    { label: '数字', value: digits },
    { label: '中文标点', value: punctuation },
    { label: '空格数', value: spaces },
    { label: 'UTF-8 字节数', value: bytes },
  ]
})

const topChars = computed(() => {
  if (!text.value) return []
  const freq = {}
  for (const char of text.value) {
    if (char === '\r' || char === '\t') continue
    freq[char] = (freq[char] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([char, count]) => ({ char, count }))
})
</script>
