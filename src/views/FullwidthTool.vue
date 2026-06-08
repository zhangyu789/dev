<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔄 全角/半角转换</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入文本</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-64" placeholder="输入包含全角或半角字符的文本..."></textarea>
      </div>

      <!-- Output -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">转换结果</label>
          <CopyButton :text="output" />
        </div>
        <textarea v-model="output" class="textarea-field h-64" readonly></textarea>
      </div>
    </div>

    <!-- Actions -->
    <div class="tool-card">
      <div class="flex flex-wrap gap-2">
        <button @click="convertToFull('all')" class="btn-primary">全角转换（全部）</button>
        <button @click="convertToFull('alnum')" class="btn-secondary">仅数字字母转全角</button>
        <button @click="convertToFull('space')" class="btn-secondary">仅空格转全角</button>
        <div class="w-px bg-gray-200 dark:bg-slate-600 mx-1"></div>
        <button @click="convertToHalf('all')" class="btn-primary">半角转换（全部）</button>
        <button @click="convertToHalf('alnum')" class="btn-secondary">仅数字字母转半角</button>
        <button @click="convertToHalf('space')" class="btn-secondary">仅空格转半角</button>
      </div>
    </div>

    <!-- Reference -->
    <div class="tool-card">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">全角/半角对照表</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-slate-600">
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">半角</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">全角</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">名称</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">半角</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">全角</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">名称</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in refTable" :key="i" class="border-b border-gray-100 dark:border-slate-700/50">
              <td class="py-1.5 px-3 font-mono text-lg">{{ row[0] }}</td>
              <td class="py-1.5 px-3 font-mono text-lg text-primary-500">{{ row[1] }}</td>
              <td class="py-1.5 px-3 text-gray-500 dark:text-gray-400">{{ row[2] }}</td>
              <td class="py-1.5 px-3 font-mono text-lg">{{ row[3] }}</td>
              <td class="py-1.5 px-3 font-mono text-lg text-primary-500">{{ row[4] }}</td>
              <td class="py-1.5 px-3 text-gray-500 dark:text-gray-400">{{ row[5] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')

// Half-width to Full-width conversion
const halfToFullMap = {}
const fullToHalfMap = {}

// Digits: 0-9 → ０-９
for (let i = 0; i <= 9; i++) {
  const half = String(i)
  const full = String.fromCharCode(0xFF10 + i) // ０
  halfToFullMap[half] = full
  fullToHalfMap[full] = half
}

// Uppercase: A-Z → Ａ-Ｚ
for (let i = 0; i < 26; i++) {
  const half = String.fromCharCode(65 + i)
  const full = String.fromCharCode(0xFF21 + i)
  halfToFullMap[half] = full
  fullToHalfMap[full] = half
}

// Lowercase: a-z → ａ-ｚ
for (let i = 0; i < 26; i++) {
  const half = String.fromCharCode(97 + i)
  const full = String.fromCharCode(0xFF41 + i)
  halfToFullMap[half] = full
  fullToHalfMap[full] = half
}

// Space
halfToFullMap[' '] = '\u3000'
fullToHalfMap['\u3000'] = ' '

// Punctuation
const punctMap = [
  ['!', '！'], ['"', '＂'], ['#', '＃'], ['$', '＄'], ['%', '％'],
  ['&', '＆'], ["'", '＇'], ['(', '（'], [')', '）'], ['*', '＊'],
  ['+', '＋'], [',', '，'], ['-', '－'], ['.', '．'], ['/', '／'],
  [':', '：'], [';', '；'], ['<', '＜'], ['=', '＝'], ['>', '＞'],
  ['?', '？'], ['@', '＠'], ['[', '［'], ['\\', '＼'], [']', '］'],
  ['^', '＾'], ['_', '＿'], ['`', '｀'], ['{', '｛'], ['|', '｜'],
  ['}', '｝'], ['~', '～'],
]
for (const [half, full] of punctMap) {
  halfToFullMap[half] = full
  fullToHalfMap[full] = half
}

function isAlnum(char) {
  const code = char.charCodeAt(0)
  return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
}

function isFullAlnum(char) {
  const code = char.charCodeAt(0)
  return (code >= 0xFF10 && code <= 0xFF19) || (code >= 0xFF21 && code <= 0xFF3A) || (code >= 0xFF41 && code <= 0xFF5A)
}

function convertToFull(mode) {
  let result = ''
  for (const char of input.value) {
    if (mode === 'all') {
      result += halfToFullMap[char] || char
    } else if (mode === 'alnum') {
      result += (isAlnum(char) && halfToFullMap[char]) ? halfToFullMap[char] : char
    } else if (mode === 'space') {
      result += char === ' ' ? '\u3000' : char
    }
  }
  output.value = result
}

function convertToHalf(mode) {
  let result = ''
  for (const char of input.value) {
    if (mode === 'all') {
      result += fullToHalfMap[char] || char
    } else if (mode === 'alnum') {
      result += (isFullAlnum(char) && fullToHalfMap[char]) ? fullToHalfMap[char] : char
    } else if (mode === 'space') {
      result += char === '\u3000' ? ' ' : char
    }
  }
  output.value = result
}

const refTable = [
  ['0', '０', '零', 'A', 'Ａ', '大写A'],
  ['1', '１', '一', 'B', 'Ｂ', '大写B'],
  ['2', '２', '二', 'a', 'ａ', '小写a'],
  ['3', '３', '三', 'b', 'ｂ', '小写b'],
  [' ', '\u3000', '空格', ',', '，', '逗号'],
  ['.', '．', '句点', ';', '；', '分号'],
  [':', '：', '冒号', '!', '！', '感叹号'],
  ['?', '？', '问号', '(', '（', '左括号'],
  [')', '）', '右括号', '-', '－', '连字符'],
]
</script>
