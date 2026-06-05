<template>
  <div class="space-y-4">
    <h2 class="tool-header">字 繁简转换</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入文本</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-60" placeholder="输入中文文本..."></textarea>
      </div>

      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">转换结果</label>
          <CopyButton :text="output" />
        </div>
        <textarea v-model="output" class="textarea-field h-60" readonly></textarea>
      </div>
    </div>

    <div class="flex gap-2 justify-center">
      <button @click="convert('s2t')" class="btn-primary">简体 → 繁体</button>
      <button @click="convert('t2s')" class="btn-primary">繁体 → 简体</button>
    </div>

    <div class="tool-card">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">示例文本</h3>
      <div class="flex gap-2 flex-wrap">
        <button @click="loadSample('s')" class="btn-secondary btn-sm">简体示例</button>
        <button @click="loadSample('t')" class="btn-secondary btn-sm">繁体示例</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'
import * as OpenCC from 'opencc-js'

const input = ref('')
const output = ref('')

const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' })
const t2sConverter = OpenCC.Converter({ from: 'tw', to: 'cn' })

function convert(mode) {
  if (!input.value.trim()) { output.value = ''; return }
  try {
    if (mode === 's2t') {
      output.value = s2tConverter(input.value)
    } else {
      output.value = t2sConverter(input.value)
    }
  } catch (e) {
    output.value = '转换失败: ' + e.message
  }
}

function loadSample(type) {
  if (type === 's') {
    input.value = '自古以来，汉字就是中华文化的重要载体。在漫长的历史发展中，汉字经历了从甲骨文、金文、篆书到隶书、楷书的演变。简体字是现代中国通用的书写形式，而繁体字则保留了更多的传统笔画和结构美。'
  } else {
    input.value = '自古以來，漢字就是中華文化的重要載體。在漫長的歷史發展中，漢字經歷了從甲骨文、金文、篆書到隸書、楷書的演變。簡體字是現代中國通用的書寫形式，而繁體字則保留了更多的傳統筆畫和結構美。'
  }
}
</script>
