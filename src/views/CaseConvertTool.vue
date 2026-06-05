<template>
  <div class="space-y-4">
    <h2 class="tool-header">Aa 大小写转换</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入文本</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-48" placeholder="输入英文文本..."></textarea>
      </div>

      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">转换结果</label>
          <CopyButton :text="output" />
        </div>
        <textarea v-model="output" class="textarea-field h-48" readonly></textarea>
      </div>
    </div>

    <div class="flex gap-2 flex-wrap justify-center">
      <button @click="convert('upper')" class="btn-primary">全部大写</button>
      <button @click="convert('lower')" class="btn-primary">全部小写</button>
      <button @click="convert('capitalize')" class="btn-primary">首字母大写</button>
      <button @click="convert('sentence')" class="btn-primary">句首大写</button>
      <button @click="convert('toggle')" class="btn-primary">大小写互换</button>
      <button @click="convert('camel')" class="btn-primary">驼峰命名</button>
      <button @click="convert('snake')" class="btn-primary">蛇形命名</button>
      <button @click="convert('kebab')" class="btn-primary">短横线命名</button>
    </div>

    <div class="tool-card">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">示例</h3>
      <div class="flex gap-2 flex-wrap">
        <button @click="loadSample" class="btn-secondary btn-sm">加载示例</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')

function convert(mode) {
  const text = input.value
  if (!text) { output.value = ''; return }
  
  switch (mode) {
    case 'upper': output.value = text.toUpperCase(); break
    case 'lower': output.value = text.toLowerCase(); break
    case 'capitalize': output.value = text.replace(/\b\w/g, c => c.toUpperCase()); break
    case 'sentence': output.value = text.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase()); break
    case 'toggle': output.value = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''); break
    case 'camel': {
      const words = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
      output.value = words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
      break
    }
    case 'snake': {
      output.value = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      break
    }
    case 'kebab': {
      output.value = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      break
    }
  }
}

function loadSample() {
  input.value = 'the quick brown fox jumps over the lazy dog. hello world!'
}
</script>
