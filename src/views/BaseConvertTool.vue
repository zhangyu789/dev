<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔢 进制转换工具</h2>

    <div class="tool-card space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">输入值</label>
          <input v-model="inputValue" class="input-field font-mono" placeholder="输入数值" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">源进制 (2-36)</label>
          <input v-model.number="fromBase" type="number" min="2" max="36" class="input-field font-mono" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">目标进制 (2-36)</label>
          <input v-model.number="toBase" type="number" min="2" max="36" class="input-field font-mono" />
        </div>
      </div>
      
      <button @click="convert" class="btn-primary">转换</button>

      <div v-if="error" class="text-sm text-red-500">{{ error }}</div>
    </div>

    <div v-if="result" class="tool-card space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">转换结果</label>
        <CopyButton :text="result" />
      </div>
      <div class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg font-mono text-lg text-primary-600 dark:text-primary-400 break-all">
        {{ result }}
      </div>
    </div>

    <!-- Quick conversions -->
    <div class="tool-card space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">常用进制速查</h3>
      <div v-if="quickResults" class="space-y-2">
        <div v-for="item in quickResults" :key="item.base" class="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
          <span class="text-xs font-semibold text-gray-400">{{ item.label }}</span>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm">{{ item.value }}</span>
            <CopyButton :text="item.value" />
          </div>
        </div>
      </div>
    </div>

    <!-- Floating point support -->
    <div class="tool-card space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">浮点数进制转换</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">十进制浮点数</label>
          <input v-model="floatInput" class="input-field font-mono" placeholder="如：3.14" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">二进制表示</label>
          <div class="flex items-center gap-2">
            <input :value="floatResult" readonly class="input-field font-mono" />
            <CopyButton v-if="floatResult" :text="floatResult" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const inputValue = ref('')
const fromBase = ref(10)
const toBase = ref(16)
const result = ref('')
const error = ref('')
const floatInput = ref('')

const quickResults = computed(() => {
  if (!inputValue.value.trim() || error.value) return null
  const num = parseInt(inputValue.value, fromBase.value)
  if (isNaN(num)) return null
  return [
    { base: 2, label: '二进制 (BIN)', value: num.toString(2) },
    { base: 8, label: '八进制 (OCT)', value: num.toString(8) },
    { base: 10, label: '十进制 (DEC)', value: num.toString(10) },
    { base: 16, label: '十六进制 (HEX)', value: num.toString(16).toUpperCase() },
    { base: 32, label: '三十二进制', value: num.toString(32).toUpperCase() },
    { base: 36, label: '三十六进制', value: num.toString(36).toUpperCase() },
  ]
})

const floatResult = computed(() => {
  if (!floatInput.value.trim()) return ''
  const num = parseFloat(floatInput.value)
  if (isNaN(num)) return '无效数字'
  
  // Convert float to binary representation
  const intPart = Math.floor(Math.abs(num))
  let decPart = Math.abs(num) - intPart
  
  let intBin = intPart === 0 ? '0' : intPart.toString(2)
  let decBin = ''
  let maxDigits = 32
  
  while (decPart > 0 && maxDigits > 0) {
    decPart *= 2
    if (decPart >= 1) {
      decBin += '1'
      decPart -= 1
    } else {
      decBin += '0'
    }
    maxDigits--
  }
  
  return (num < 0 ? '-' : '') + intBin + (decBin ? '.' + decBin : '')
})

function convert() {
  error.value = ''
  result.value = ''
  
  const val = inputValue.value.trim()
  if (!val) return
  
  try {
    const num = parseInt(val, fromBase.value)
    if (isNaN(num)) {
      error.value = '输入值不是有效的 ' + fromBase.value + ' 进制数'
      return
    }
    result.value = num.toString(toBase.value).toUpperCase()
  } catch (e) {
    error.value = '转换失败: ' + e.message
  }
}
</script>
