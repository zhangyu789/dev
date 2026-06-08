<template>
  <div class="space-y-4">
    <h2 class="tool-header">📊 CSV/JSON 互转</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-72" :placeholder="placeholderText"></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输出</label>
          <CopyButton :text="output" />
        </div>
        <textarea v-model="output" class="textarea-field h-72" readonly></textarea>
        <div v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</div>
      </div>
    </div>

    <div class="tool-card">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex gap-2">
          <button @click="switchTab('csv2json')" :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'csv2json' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']">CSV → JSON</button>
          <button @click="switchTab('json2csv')" :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'json2csv' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']">JSON → CSV</button>
        </div>
        <button @click="convert" class="btn-primary">转换</button>
        <label class="flex items-center gap-2 cursor-pointer ml-2">
          <input type="text" v-model="delimiter" class="input-field w-16 text-sm text-center" />
          <span class="text-xs text-gray-500">分隔符</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const activeTab = ref('csv2json')
const delimiter = ref(',')

const placeholderText = computed(() => {
  return activeTab.value === 'csv2json'
    ? '粘贴 CSV 数据...\nname,age,city\n张三,28,北京\n李四,32,上海'
    : '粘贴 JSON 数组...\n[\n  {"name": "张三", "age": 28}\n]'
})

function switchTab(tab) { activeTab.value = tab; error.value = '' }

function csvToJson(csv, sep) {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) throw new Error('CSV 至少需要标题行和一行数据')

  const headers = parseCsvLine(lines[0], sep)
  const result = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = parseCsvLine(lines[i], sep)
    const obj = {}
    headers.forEach((h, idx) => {
      let val = values[idx] || ''
      if (val !== '' && !isNaN(val) && val.trim() !== '') val = Number(val)
      obj[h.trim()] = val
    })
    result.push(obj)
  }
  return result
}

function parseCsvLine(line, sep) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++ }
      else if (ch === '"') inQuotes = false
      else current += ch
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === sep) { result.push(current); current = '' }
      else current += ch
    }
  }
  result.push(current)
  return result
}

function jsonToCsv(json, sep) {
  const data = typeof json === 'string' ? JSON.parse(json) : json
  if (!Array.isArray(data) || data.length === 0) throw new Error('需要非空 JSON 数组')

  const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))]
  const csvLines = [headers.join(sep)]

  for (const item of data) {
    const row = headers.map(h => {
      const val = item[h] !== undefined ? String(item[h]) : ''
      return val.includes(sep) || val.includes('"') || val.includes('\n')
        ? '"' + val.replace(/"/g, '""') + '"'
        : val
    })
    csvLines.push(row.join(sep))
  }
  return csvLines.join('\n')
}

function convert() {
  error.value = ''
  try {
    if (activeTab.value === 'csv2json') {
      const result = csvToJson(input.value, delimiter.value)
      output.value = JSON.stringify(result, null, 2)
    } else {
      const result = jsonToCsv(input.value, delimiter.value)
      output.value = result
    }
  } catch (e) {
    error.value = '转换失败: ' + e.message
  }
}
</script>
