<template>
  <div class="space-y-4">
    <h2 class="tool-header">📋 文本去重排序</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入文本（每行一条）</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-72" placeholder="每行一条数据..."></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">处理结果</label>
          <div class="flex gap-2">
            <CopyButton :text="output" />
            <span class="text-xs text-gray-400">{{ outputLines }} 行</span>
          </div>
        </div>
        <textarea v-model="output" class="textarea-field h-72" readonly></textarea>
      </div>
    </div>

    <div class="tool-card">
      <div class="flex flex-wrap gap-2">
        <button @click="doAction('dedup')" class="btn-primary">去重</button>
        <button @click="doAction('sort')" class="btn-secondary">排序 A→Z</button>
        <button @click="doAction('sort-desc')" class="btn-secondary">排序 Z→A</button>
        <button @click="doAction('sort-num')" class="btn-secondary">数字排序 ↑</button>
        <button @click="doAction('sort-num-desc')" class="btn-secondary">数字排序 ↓</button>
        <div class="w-px bg-gray-200 dark:bg-slate-600 mx-1"></div>
        <button @click="doAction('reverse')" class="btn-secondary">反转</button>
        <button @click="doAction('shuffle')" class="btn-secondary">随机打乱</button>
        <button @click="doAction('trim')" class="btn-secondary">去首尾空格</button>
        <button @click="doAction('noempty')" class="btn-secondary">去空行</button>
        <button @click="doAction('dedup-sort')" class="btn-primary">去重+排序</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')

const outputLines = computed(() => output.value ? output.value.split('\n').length : 0)

function doAction(action) {
  let lines = input.value.split('\n')

  switch (action) {
    case 'dedup':
      lines = [...new Set(lines)]
      break
    case 'sort':
      lines = [...lines].sort((a, b) => a.localeCompare(b, 'zh-CN'))
      break
    case 'sort-desc':
      lines = [...lines].sort((a, b) => b.localeCompare(a, 'zh-CN'))
      break
    case 'sort-num':
      lines = [...lines].sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0))
      break
    case 'sort-num-desc':
      lines = [...lines].sort((a, b) => (parseFloat(b) || 0) - (parseFloat(a) || 0))
      break
    case 'reverse':
      lines = [...lines].reverse()
      break
    case 'shuffle':
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]]
      }
      break
    case 'trim':
      lines = lines.map(l => l.trim())
      break
    case 'noempty':
      lines = lines.filter(l => l.trim() !== '')
      break
    case 'dedup-sort':
      lines = [...new Set(lines)].sort((a, b) => a.localeCompare(b, 'zh-CN'))
      break
  }

  output.value = lines.join('\n')
}
</script>
