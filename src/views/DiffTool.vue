<template>
  <div class="space-y-4">
    <h2 class="tool-header">📊 文本差异对比</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left text -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">原始文本</label>
          <button @click="leftText = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="leftText" class="textarea-field h-56" placeholder="输入原始文本..."></textarea>
      </div>

      <!-- Right text -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">修改文本</label>
          <button @click="rightText = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="rightText" class="textarea-field h-56" placeholder="输入修改后的文本..."></textarea>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button @click="compare" class="btn-primary">对比差异</button>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="ignoreWhitespace" class="w-4 h-4 rounded text-primary-500" />
        <span class="text-sm text-gray-700 dark:text-gray-300">忽略空白差异</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="ignoreCase" class="w-4 h-4 rounded text-primary-500" />
        <span class="text-sm text-gray-700 dark:text-gray-300">忽略大小写</span>
      </label>
    </div>

    <!-- Stats -->
    <div v-if="diffResult" class="tool-card">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          共 <strong class="text-gray-900 dark:text-gray-100">{{ stats.total }}</strong> 处差异
        </span>
        <span class="text-sm">
          <span class="inline-block w-3 h-3 bg-green-200 dark:bg-green-800 rounded mr-1"></span>
          新增 <strong class="text-green-600 dark:text-green-400">{{ stats.added }}</strong> 行
        </span>
        <span class="text-sm">
          <span class="inline-block w-3 h-3 bg-red-200 dark:bg-red-800 rounded mr-1"></span>
          删除 <strong class="text-red-600 dark:text-red-400">{{ stats.removed }}</strong> 行
        </span>
        <span class="text-sm text-gray-500">
          未变 <strong>{{ stats.unchanged }}</strong> 行
        </span>
        <CopyButton :text="diffText" class="ml-auto" />
      </div>
    </div>

    <!-- Diff View -->
    <div v-if="diffResult" class="tool-card">
      <div class="flex gap-2 mb-3">
        <button
          v-for="mode in viewModes" :key="mode.key"
          @click="viewMode = mode.key"
          :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', viewMode === mode.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']"
        >{{ mode.label }}</button>
      </div>

      <!-- Unified View -->
      <div v-if="viewMode === 'unified'" class="font-mono text-sm overflow-x-auto">
        <div
          v-for="(line, i) in diffResult"
          :key="i"
          :class="[
            'flex border-b border-gray-100 dark:border-slate-700 last:border-0',
            line.type === 'added' ? 'bg-green-50 dark:bg-green-900/20' :
            line.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20' : ''
          ]"
        >
          <span class="w-10 shrink-0 text-right pr-2 text-gray-400 dark:text-gray-600 select-none text-xs leading-7">{{ line.leftNum || '' }}</span>
          <span class="w-10 shrink-0 text-right pr-2 text-gray-400 dark:text-gray-600 select-none text-xs leading-7">{{ line.rightNum || '' }}</span>
          <span class="w-5 shrink-0 text-center leading-7 select-none"
            :class="line.type === 'added' ? 'text-green-500' : line.type === 'removed' ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'"
          >{{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}</span>
          <span class="whitespace-pre-wrap break-all leading-7"
            :class="line.type === 'added' ? 'text-green-700 dark:text-green-300' : line.type === 'removed' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'"
          >{{ line.text }}</span>
        </div>
      </div>

      <!-- Side by Side View -->
      <div v-if="viewMode === 'side'" class="grid grid-cols-2 gap-0 font-mono text-sm overflow-x-auto">
        <div class="border-r border-gray-200 dark:border-slate-600">
          <div class="px-3 py-1 text-xs text-gray-400 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600">原始文本</div>
          <div
            v-for="(line, i) in leftLines"
            :key="'l' + i"
            :class="[
              'flex border-b border-gray-100 dark:border-slate-700/50 last:border-0',
              line.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20' : ''
            ]"
          >
            <span class="w-8 shrink-0 text-right pr-2 text-gray-400 dark:text-gray-600 select-none text-xs leading-7">{{ line.num }}</span>
            <span class="w-5 shrink-0 text-center leading-7 select-none"
              :class="line.type === 'removed' ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'"
            >{{ line.type === 'removed' ? '-' : ' ' }}</span>
            <span class="whitespace-pre-wrap break-all leading-7"
              :class="line.type === 'removed' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'"
            >{{ line.text }}</span>
          </div>
        </div>
        <div>
          <div class="px-3 py-1 text-xs text-gray-400 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600">修改文本</div>
          <div
            v-for="(line, i) in rightLines"
            :key="'r' + i"
            :class="[
              'flex border-b border-gray-100 dark:border-slate-700/50 last:border-0',
              line.type === 'added' ? 'bg-green-50 dark:bg-green-900/20' : ''
            ]"
          >
            <span class="w-8 shrink-0 text-right pr-2 text-gray-400 dark:text-gray-600 select-none text-xs leading-7">{{ line.num }}</span>
            <span class="w-5 shrink-0 text-center leading-7 select-none"
              :class="line.type === 'added' ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'"
            >{{ line.type === 'added' ? '+' : ' ' }}</span>
            <span class="whitespace-pre-wrap break-all leading-7"
              :class="line.type === 'added' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'"
            >{{ line.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="diffResult && diffResult.length === 0" class="tool-card text-center text-gray-400 text-sm py-8">
      两段文本完全相同，没有差异
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const leftText = ref('')
const rightText = ref('')
const ignoreWhitespace = ref(false)
const ignoreCase = ref(false)
const viewMode = ref('unified')

const viewModes = [
  { key: 'unified', label: '合并视图' },
  { key: 'side', label: '并排视图' },
]

const diffResult = ref(null)
const leftLines = ref([])
const rightLines = ref([])

const stats = computed(() => {
  if (!diffResult.value) return { total: 0, added: 0, removed: 0, unchanged: 0 }
  let added = 0, removed = 0, unchanged = 0
  for (const line of diffResult.value) {
    if (line.type === 'added') added++
    else if (line.type === 'removed') removed++
    else unchanged++
  }
  return { total: added + removed, added, removed, unchanged }
})

const diffText = computed(() => {
  if (!diffResult.value) return ''
  return diffResult.value.map(l => {
    const prefix = l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  '
    return prefix + l.text
  }).join('\n')
})

// Simple LCS-based diff algorithm
function computeLCS(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  // Backtrack
  const result = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'unchanged', leftIdx: i - 1, rightIdx: j - 1 })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', rightIdx: j - 1 })
      j--
    } else {
      result.unshift({ type: 'removed', leftIdx: i - 1 })
      i--
    }
  }
  return result
}

function preprocess(text) {
  let lines = text.split('\n')
  if (ignoreCase.value) lines = lines.map(l => l.toLowerCase())
  if (ignoreWhitespace.value) lines = lines.map(l => l.replace(/\s+/g, ' ').trim())
  return lines
}

function compare() {
  const leftLines = leftText.value.split('\n')
  const rightLines = rightText.value.split('\n')
  const leftProcessed = preprocess(leftText.value)
  const rightProcessed = preprocess(rightText.value)

  const lcs = computeLCS(leftProcessed, rightProcessed)

  // Unified view
  const unified = []
  let leftNum = 0, rightNum = 0
  for (const item of lcs) {
    if (item.type === 'unchanged') {
      leftNum = item.leftIdx + 1
      rightNum = item.rightIdx + 1
      unified.push({ type: 'unchanged', text: leftLines[item.leftIdx], leftNum, rightNum })
    } else if (item.type === 'removed') {
      leftNum = item.leftIdx + 1
      unified.push({ type: 'removed', text: leftLines[item.leftIdx], leftNum, rightNum: '' })
    } else {
      rightNum = item.rightIdx + 1
      unified.push({ type: 'added', text: rightLines[item.rightIdx], leftNum: '', rightNum })
    }
  }
  diffResult.value = unified

  // Side by side view
  const ll = [], rl = []
  let ln = 0, rn = 0
  for (const item of lcs) {
    if (item.type === 'unchanged') {
      ln = item.leftIdx + 1
      rn = item.rightIdx + 1
      ll.push({ type: 'unchanged', text: leftLines[item.leftIdx], num: ln })
      rl.push({ type: 'unchanged', text: rightLines[item.rightIdx], num: rn })
    } else if (item.type === 'removed') {
      ln = item.leftIdx + 1
      ll.push({ type: 'removed', text: leftLines[item.leftIdx], num: ln })
    } else {
      rn = item.rightIdx + 1
      rl.push({ type: 'added', text: rightLines[item.rightIdx], num: rn })
    }
  }
  // Balance side-by-side with empty lines for alignment
  const maxLen = Math.max(ll.length, rl.length)
  while (ll.length < maxLen) ll.push({ type: 'empty', text: '', num: '' })
  while (rl.length < maxLen) rl.push({ type: 'empty', text: '', num: '' })

  leftLines.value = ll
  rightLines.value = rl
}
</script>
