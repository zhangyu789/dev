<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔢 数字大小写转换</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">阿拉伯数字</label>
          <button @click="arabicInput = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="arabicInput" class="textarea-field h-40" placeholder="输入数字，如：12345"></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">中文数字</label>
          <CopyButton :text="chineseOutput" />
        </div>
        <textarea v-model="chineseOutput" class="textarea-field h-40" readonly></textarea>
      </div>
    </div>

    <div class="tool-card">
      <div class="flex flex-wrap gap-2">
        <button @click="convertToChinese('lower')" class="btn-primary">转为小写中文（一二三）</button>
        <button @click="convertToChinese('upper')" class="btn-primary">转为大写中文（壹贰叁）</button>
        <button @click="convertFromChinese" class="btn-secondary">中文转阿拉伯数字</button>
      </div>
    </div>

    <!-- Reverse conversion -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">中文数字输入</label>
          <button @click="chineseInput = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="chineseInput" class="textarea-field h-28" placeholder="输入中文数字，如：一万二千三百四十五"></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">阿拉伯数字结果</label>
          <CopyButton :text="arabicOutput" />
        </div>
        <textarea v-model="arabicOutput" class="textarea-field h-28" readonly></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const arabicInput = ref('')
const chineseOutput = ref('')
const chineseInput = ref('')
const arabicOutput = ref('')

const lowerDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const upperDigits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const lowerUnits = ['', '十', '百', '千']
const upperUnits = ['', '拾', '佰', '仟']
const lowerBigUnits = ['', '万', '亿', '万亿']
const upperBigUnits = ['', '万', '亿', '万亿']

function numberToChinese(num, mode) {
  const digits = mode === 'upper' ? upperDigits : lowerDigits
  const units = mode === 'upper' ? upperUnits : lowerUnits
  const bigUnits = mode === 'upper' ? upperBigUnits : lowerBigUnits

  if (num === 0) return digits[0]
  if (num < 0) return '负' + numberToChinese(-num, mode)

  const intPart = Math.floor(num)
  const decPart = num - intPart

  let result = convertIntPart(intPart, digits, units, bigUnits)

  if (decPart > 0) {
    const decStr = String(decPart.toFixed(10)).slice(2).replace(/0+$/, '')
    result += '点' + decStr.split('').map(d => digits[parseInt(d)]).join('')
  }

  return result
}

function convertIntPart(num, digits, units, bigUnits) {
  if (num === 0) return digits[0]

  const groups = []
  while (num > 0) {
    groups.push(num % 10000)
    num = Math.floor(num / 10000)
  }

  let result = ''
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]
    if (g === 0) continue

    const gStr = convertGroup(g, digits, units)
    result += gStr + bigUnits[i]

    // Add zero between groups if needed
    if (i > 0 && groups[i - 1] > 0 && groups[i - 1] < 1000) {
      result += digits[0]
    }
  }

  return result
}

function convertGroup(num, digits, units) {
  if (num === 0) return ''
  let result = ''
  const str = String(num)
  let hasZero = false

  for (let i = 0; i < str.length; i++) {
    const d = parseInt(str[i])
    const unitIdx = str.length - 1 - i

    if (d === 0) {
      hasZero = true
    } else {
      if (hasZero) { result += digits[0]; hasZero = false }
      result += digits[d] + units[unitIdx]
    }
  }

  return result
}

function convertToChinese(mode) {
  const input = arabicInput.value.trim()
  if (!input) { chineseOutput.value = ''; return }

  const lines = input.split('\n')
  chineseOutput.value = lines.map(line => {
    const num = parseFloat(line.trim())
    if (isNaN(num)) return '(无效数字)'
    return numberToChinese(num, mode)
  }).join('\n')
}

function convertFromChinese() {
  const input = chineseInput.value.trim()
  if (!input) { arabicOutput.value = ''; return }

  const lowerMap = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '百': 100, '千': 1000, '万': 10000, '亿': 100000000 }
  const upperMap = { '零': 0, '壹': 1, '贰': 2, '叁': 3, '肆': 4, '伍': 5, '陆': 6, '柒': 7, '捌': 8, '玖': 9, '拾': 10, '佰': 100, '仟': 1000, '万': 10000, '亿': 100000000 }
  const map = { ...lowerMap, ...upperMap }

  try {
    const lines = input.split('\n')
    arabicOutput.value = lines.map(line => {
      const str = line.trim()
      if (!str) return ''
      return chineseToNumber(str, map)
    }).join('\n')
  } catch (e) {
    arabicOutput.value = '转换失败: ' + e.message
  }
}

function chineseToNumber(str, map) {
  let result = 0
  let current = 0
  let hasPoint = false
  let pointResult = ''

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '点') {
      hasPoint = true
      continue
    }
    if (str[i] === '负') continue

    if (hasPoint) {
      pointResult += map[str[i]]
      continue
    }

    const val = map[str[i]]
    if (val === undefined) continue

    if (val >= 10) {
      if (current === 0) current = 1
      if (val >= 10000) {
        current *= val
        result += current
        current = 0
      } else {
        current *= val
      }
    } else {
      current += val
    }
  }

  result += current
  if (hasPoint && pointResult) {
    return result + '.' + pointResult
  }
  return String(result)
}
</script>
