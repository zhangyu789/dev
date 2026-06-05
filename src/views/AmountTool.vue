<template>
  <div class="space-y-4">
    <h2 class="tool-header">💰 金额大写转换</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">输入金额</label>
          <input v-model="amount" type="text" class="input-field font-mono text-lg" placeholder="输入阿拉伯数字金额，如：12345.67" />
        </div>
        <button @click="convert" class="btn-primary w-full">转换为大写</button>
      </div>

      <div class="tool-card space-y-4">
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">中文大写金额</label>
            <CopyButton :text="result" />
          </div>
          <div class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-lg font-semibold text-primary-600 dark:text-primary-400 min-h-[52px]">
            {{ result || '—' }}
          </div>
        </div>
      </div>
    </div>

    <div class="tool-card">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">常用金额参考</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div v-for="example in examples" :key="example.value" class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ example.value }}</span>
          <span class="text-sm text-gray-500">{{ example.result }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const amount = ref('')
const result = ref('')

const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const units = ['', '拾', '佰', '仟']
const bigUnits = ['', '万', '亿', '万亿']

function convert() {
  const input = amount.value.trim()
  if (!input) { result.value = ''; return }

  let num
  try {
    num = parseFloat(input)
  } catch {
    result.value = '请输入有效的数字'
    return
  }
  if (isNaN(num)) { result.value = '请输入有效的数字'; return }
  if (num > 999999999999.99) { result.value = '金额超出转换范围'; return }

  // Handle negative
  if (num < 0) { result.value = '不支持负数金额'; return }

  const isZero = num === 0
  const [intPart, decPart] = num.toFixed(2).split('.')
  let intStr = ''
  
  if (isZero) {
    intStr = '零'
  } else {
    const intNum = parseInt(intPart)
    intStr = convertInteger(intNum)
  }

  // Decimal part
  const jiao = parseInt(decPart[0])
  const fen = parseInt(decPart[1])
  
  let decStr = ''
  if (jiao === 0 && fen === 0) {
    decStr = '整'
  } else {
    if (jiao > 0) decStr += digits[jiao] + '角'
    else if (fen > 0 && !isZero) decStr += '零'
    if (fen > 0) decStr += digits[fen] + '分'
  }

  result.value = (isZero ? '' : '人民币') + intStr + '元' + decStr
}

function convertInteger(num) {
  if (num === 0) return ''
  
  const groups = []
  let n = num
  while (n > 0) {
    groups.push(n % 10000)
    n = Math.floor(n / 10000)
  }

  let result = ''
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]
    if (g === 0) {
      if (i < groups.length - 1 && result[result.length - 1] !== '零') result += '零'
      continue
    }
    result += convertGroup(g) + bigUnits[i]
  }
  
  return result
}

function convertGroup(num) {
  if (num === 0) return ''
  let result = ''
  const d = [Math.floor(num/1000), Math.floor((num%1000)/100), Math.floor((num%100)/10), num%10]
  
  for (let i = 0; i < 4; i++) {
    if (d[i] === 0) {
      if (result && result[result.length-1] !== '零') result += '零'
    } else {
      result += digits[d[i]] + units[3-i]
    }
  }
  
  // Remove trailing zero
  if (result.endsWith('零')) result = result.slice(0, -1)
  return result
}

const examples = [
  { value: '0.00', result: '零元整' },
  { value: '100.50', result: '壹佰元零伍角' },
  { value: '1,234.56', result: '壹仟贰佰叁拾肆元伍角陆分' },
  { value: '10000.00', result: '壹万元整' },
  { value: '100000.00', result: '壹拾万元整' },
  { value: '1000000.00', result: '壹佰万元整' },
]
</script>
