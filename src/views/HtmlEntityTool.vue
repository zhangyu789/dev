<template>
  <div class="space-y-4">
    <h2 class="tool-header">📄 HTML 实体编解码</h2>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600']"
      >{{ tab.label }}</button>
    </div>

    <!-- Encode/Decode -->
    <div v-if="activeTab === 'codec'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">原始文本</label>
          <button @click="rawInput = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="rawInput" class="textarea-field h-60" placeholder="输入原始文本，如：<div>Hello & World></div>"></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">实体编码结果</label>
          <div class="flex gap-2">
            <button @click="encodeHtml" class="btn-primary btn-sm">编码 →</button>
            <button @click="decodeHtml" class="btn-secondary btn-sm">← 解码</button>
            <CopyButton :text="encodedOutput" />
          </div>
        </div>
        <textarea v-model="encodedOutput" class="textarea-field h-60" placeholder="HTML 实体编码结果..."></textarea>
        <div v-if="codecError" class="mt-2 text-sm text-red-500">{{ codecError }}</div>
      </div>
    </div>

    <!-- Named entities reference -->
    <div v-if="activeTab === 'reference'" class="tool-card space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">HTML 实体参考表</h3>
        <input v-model="searchQuery" class="input-field max-w-xs text-sm" placeholder="搜索实体名称..." />
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-slate-600">
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">字符</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">实体名称</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">十进制编码</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">十六进制编码</th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">描述</th>
              <th class="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entity in filteredEntities" :key="entity.name" class="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
              <td class="py-2 px-3 text-xl text-center w-12">{{ entity.char }}</td>
              <td class="py-2 px-3 font-mono text-primary-500">{{ entity.name }}</td>
              <td class="py-2 px-3 font-mono text-gray-700 dark:text-gray-300">{{ entity.decimal }}</td>
              <td class="py-2 px-3 font-mono text-gray-700 dark:text-gray-300">{{ entity.hex }}</td>
              <td class="py-2 px-3 text-gray-500 dark:text-gray-400">{{ entity.desc }}</td>
              <td class="py-2 px-3"><CopyButton :text="entity.name" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Numeric entities -->
    <div v-if="activeTab === 'numeric'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Unicode 字符查询</h3>
        <input v-model="charInput" class="input-field" placeholder="输入字符或 Unicode 码点 (如: A 或 U+0041)" @input="lookupChar" />
        <div v-if="charInfo" class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
          <div class="flex items-center gap-3">
            <span class="text-4xl">{{ charInfo.char }}</span>
            <div>
              <div class="text-sm font-mono text-gray-800 dark:text-gray-200">U+{{ charInfo.codePoint.toString(16).toUpperCase().padStart(4, '0') }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">十进制: {{ charInfo.codePoint }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-white dark:bg-slate-800 rounded px-2 py-1.5">
              <span class="text-gray-400">HTML 十进制:</span>
              <span class="font-mono ml-1 text-gray-800 dark:text-gray-200">&amp;#{{ charInfo.codePoint }};</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded px-2 py-1.5">
              <span class="text-gray-400">HTML 十六进制:</span>
              <span class="font-mono ml-1 text-gray-800 dark:text-gray-200">&amp;#x{{ charInfo.codePoint.toString(16).toUpperCase() }};</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded px-2 py-1.5">
              <span class="text-gray-400">CSS 转义:</span>
              <span class="font-mono ml-1 text-gray-800 dark:text-gray-200">\{{ charInfo.codePoint.toString(16).toUpperCase() }}</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded px-2 py-1.5">
              <span class="text-gray-400">JS 转义:</span>
              <span class="font-mono ml-1 text-gray-800 dark:text-gray-200">\u{{ charInfo.codePoint.toString(16).toUpperCase().padStart(4, '0') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tool-card space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">批量转换</h3>
        <textarea v-model="batchInput" class="textarea-field h-32" placeholder="输入要转换的文本..."></textarea>
        <div class="flex gap-2">
          <button @click="batchConvert('decimal')" class="btn-primary btn-sm">十进制编码</button>
          <button @click="batchConvert('hex')" class="btn-secondary btn-sm">十六进制编码</button>
          <button @click="batchConvert('css')" class="btn-secondary btn-sm">CSS 转义</button>
          <CopyButton :text="batchOutput" />
        </div>
        <textarea v-model="batchOutput" class="textarea-field h-24" readonly placeholder="转换结果..."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const tabs = [
  { key: 'codec', label: '编解码' },
  { key: 'reference', label: '实体参考表' },
  { key: 'numeric', label: '数字编码' },
]
const activeTab = ref('codec')

// Codec
const rawInput = ref('')
const encodedOutput = ref('')
const codecError = ref('')

function encodeHtml() {
  codecError.value = ''
  try {
    const div = document.createElement('div')
    div.appendChild(document.createTextNode(rawInput.value))
    encodedOutput.value = div.innerHTML
  } catch (e) {
    codecError.value = '编码失败: ' + e.message
  }
}

function decodeHtml() {
  codecError.value = ''
  try {
    const div = document.createElement('div')
    div.innerHTML = encodedOutput.value
    rawInput.value = div.textContent
  } catch (e) {
    codecError.value = '解码失败: 输入不是有效的 HTML 实体'
  }
}

// Reference table
const searchQuery = ref('')

const namedEntities = [
  { char: '&', name: '&amp;', decimal: '&#38;', hex: '&#x26;', desc: '与号' },
  { char: '<', name: '&lt;', decimal: '&#60;', hex: '&#x3C;', desc: '小于号' },
  { char: '>', name: '&gt;', decimal: '&#62;', hex: '&#x3E;', desc: '大于号' },
  { char: '"', name: '&quot;', decimal: '&#34;', hex: '&#x22;', desc: '双引号' },
  { char: "'", name: '&apos;', decimal: '&#39;', hex: '&#x27;', desc: '单引号' },
  { char: ' ', name: '&nbsp;', decimal: '&#160;', hex: '&#xA0;', desc: '不换行空格' },
  { char: '©', name: '&copy;', decimal: '&#169;', hex: '&#xA9;', desc: '版权符号' },
  { char: '®', name: '&reg;', decimal: '&#174;', hex: '&#xAE;', desc: '注册商标' },
  { char: '™', name: '&trade;', decimal: '&#8482;', hex: '&#x2122;', desc: '商标' },
  { char: '€', name: '&euro;', decimal: '&#8364;', hex: '&#x20AC;', desc: '欧元符号' },
  { char: '£', name: '&pound;', decimal: '&#163;', hex: '&#xA3;', desc: '英镑符号' },
  { char: '¥', name: '&yen;', decimal: '&#165;', hex: '&#xA5;', desc: '人民币/日元符号' },
  { char: '¢', name: '&cent;', decimal: '&#162;', hex: '&#xA2;', desc: '分符号' },
  { char: '§', name: '&sect;', decimal: '&#167;', hex: '&#xA7;', desc: '章节符号' },
  { char: '¶', name: '&para;', decimal: '&#182;', hex: '&#xB6;', desc: '段落符号' },
  { char: '°', name: '&deg;', decimal: '&#176;', hex: '&#xB0;', desc: '度数符号' },
  { char: '±', name: '&plusmn;', decimal: '&#177;', hex: '&#xB1;', desc: '加减号' },
  { char: '×', name: '&times;', decimal: '&#215;', hex: '&#xD7;', desc: '乘号' },
  { char: '÷', name: '&divide;', decimal: '&#247;', hex: '&#xF7;', desc: '除号' },
  { char: '←', name: '&larr;', decimal: '&#8592;', hex: '&#x2190;', desc: '左箭头' },
  { char: '→', name: '&rarr;', decimal: '&#8594;', hex: '&#x2192;', desc: '右箭头' },
  { char: '↑', name: '&uarr;', decimal: '&#8593;', hex: '&#x2191;', desc: '上箭头' },
  { char: '↓', name: '&darr;', decimal: '&#8595;', hex: '&#x2193;', desc: '下箭头' },
  { char: '♠', name: '&spades;', decimal: '&#9824;', hex: '&#x2660;', desc: '黑桃' },
  { char: '♣', name: '&clubs;', decimal: '&#9827;', hex: '&#x2663;', desc: '梅花' },
  { char: '♥', name: '&hearts;', decimal: '&#9829;', hex: '&#x2665;', desc: '红心' },
  { char: '♦', name: '&diams;', decimal: '&#9830;', hex: '&#x2666;', desc: '方块' },
  { char: '…', name: '&hellip;', decimal: '&#8230;', hex: '&#x2026;', desc: '省略号' },
  { char: '–', name: '&ndash;', decimal: '&#8211;', hex: '&#x2013;', desc: '短破折号' },
  { char: '—', name: '&mdash;', decimal: '&#8212;', hex: '&#x2014;', desc: '长破折号' },
  { char: '«', name: '&laquo;', decimal: '&#171;', hex: '&#xAB;', desc: '左书名号' },
  { char: '»', name: '&raquo;', decimal: '&#187;', hex: '&#xBB;', desc: '右书名号' },
  { char: '•', name: '&bull;', decimal: '&#8226;', hex: '&#x2022;', desc: '圆点' },
  { char: '‰', name: '&permil;', decimal: '&#8240;', hex: '&#x2030;', desc: '千分号' },
  { char: '†', name: '&dagger;', decimal: '&#8224;', hex: '&#x2020;', desc: '剑号' },
  { char: '‡', name: '&Dagger;', decimal: '&#8225;', hex: '&#x2021;', desc: '双剑号' },
]

const filteredEntities = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return namedEntities
  return namedEntities.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.desc.includes(q) ||
    e.char.includes(q)
  )
})

// Numeric / Unicode
const charInput = ref('')
const charInfo = ref(null)

function lookupChar() {
  const input = charInput.value.trim()
  if (!input) { charInfo.value = null; return }

  // Try as U+XXXX format
  const uMatch = input.match(/^[Uu]\+([0-9a-fA-F]+)$/)
  if (uMatch) {
    const cp = parseInt(uMatch[1], 16)
    charInfo.value = { char: String.fromCodePoint(cp), codePoint: cp }
    return
  }

  // Try as decimal number
  if (/^\d+$/.test(input)) {
    const cp = parseInt(input)
    if (cp > 0 && cp <= 0x10FFFF) {
      charInfo.value = { char: String.fromCodePoint(cp), codePoint: cp }
      return
    }
  }

  // Use first character
  if (input.length > 0) {
    const cp = input.codePointAt(0)
    charInfo.value = { char: String.fromCodePoint(cp), codePoint: cp }
  }
}

// Batch convert
const batchInput = ref('')
const batchOutput = ref('')

function batchConvert(type) {
  const text = batchInput.value
  if (!text) { batchOutput.value = ''; return }

  const parts = []
  for (const char of text) {
    const cp = char.codePointAt(0)
    if (type === 'decimal') parts.push(`&#${cp};`)
    else if (type === 'hex') parts.push(`&#x${cp.toString(16).toUpperCase()};`)
    else if (type === 'css') parts.push(`\\${cp.toString(16).toUpperCase()}`)
  }
  batchOutput.value = parts.join('')
}
</script>
