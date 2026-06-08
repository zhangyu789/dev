<template>
  <div class="space-y-4">
    <h2 class="tool-header">📡 摩尔斯电码</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入文本</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-40" placeholder="输入文本或摩尔斯电码..."></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">转换结果</label>
          <CopyButton :text="output" />
        </div>
        <textarea v-model="output" class="textarea-field h-40" readonly></textarea>
      </div>
    </div>

    <div class="tool-card">
      <div class="flex flex-wrap gap-2">
        <button @click="encode" class="btn-primary">文本 → 摩尔斯</button>
        <button @click="decode" class="btn-secondary">摩尔斯 → 文本</button>
      </div>
    </div>

    <!-- Reference -->
    <div class="tool-card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">摩尔斯电码对照表</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-1">
        <div v-for="(val, key) in morseMap" :key="key"
          class="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-slate-700/50 rounded text-xs">
          <span class="font-bold text-gray-700 dark:text-gray-300">{{ key }}</span>
          <span class="font-mono text-primary-500">{{ val }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')

const morseMap = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
  'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
  'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.',
  '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
}

const reverseMap = {}
for (const [k, v] of Object.entries(morseMap)) {
  reverseMap[v] = k
}

function encode() {
  const text = input.value.toUpperCase()
  const result = []
  for (const char of text) {
    if (char === ' ') result.push('/')
    else if (morseMap[char]) result.push(morseMap[char])
    else result.push(char)
  }
  output.value = result.join(' ')
}

function decode() {
  const parts = input.value.trim().split(/\s+/)
  const result = []
  for (const part of parts) {
    if (part === '/') result.push(' ')
    else if (reverseMap[part]) result.push(reverseMap[part])
    else result.push(part)
  }
  output.value = result.join('')
}
</script>
