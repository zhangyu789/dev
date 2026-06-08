<template>
  <div class="space-y-4">
    <h2 class="tool-header">📛 条形码生成</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">条形码内容</label>
          <input v-model="barcodeText" class="input-field font-mono" placeholder="输入内容..." @input="generate" />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">类型</label>
          <select v-model="barcodeType" @change="generate" class="input-field text-sm">
            <option value="CODE128">CODE128（通用）</option>
            <option value="EAN13">EAN-13（商品）</option>
            <option value="EAN8">EAN-8</option>
            <option value="UPC">UPC-A</option>
            <option value="CODE39">CODE39</option>
            <option value="ITF14">ITF-14</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">宽度</label>
            <input type="number" v-model.number="barWidth" min="1" max="5" class="input-field text-sm" @change="generate" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">高度</label>
            <input type="number" v-model.number="barHeight" min="30" max="200" class="input-field text-sm" @change="generate" />
          </div>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="showText" class="w-4 h-4 rounded text-primary-500" @change="generate" />
          <span class="text-sm text-gray-700 dark:text-gray-300">显示文本</span>
        </label>
        <button @click="generate" class="btn-primary w-full">生成</button>
      </div>

      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">预览</h3>
        <div class="flex items-center justify-center min-h-[160px] bg-white rounded-lg p-4">
          <canvas ref="canvasRef"></canvas>
        </div>
        <div v-if="error" class="text-sm text-red-500">{{ error }}</div>
        <div class="flex gap-2">
          <button @click="download" class="btn-secondary btn-sm" :disabled="!barcodeText">下载 PNG</button>
          <CopyButton :text="barcodeText" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const barcodeText = ref('DevPocket-2024')
const barcodeType = ref('CODE128')
const barWidth = ref(2)
const barHeight = ref(100)
const showText = ref(true)
const canvasRef = ref(null)
const error = ref('')

// CODE128 encoder
const CODE128_PATTERNS = [
  '11011001100','11001101100','11001100110','10010011000','10010001100',
  '10001001100','10011001000','10011000100','10001100100','11001001000',
  '11001000100','11000100100','10110011100','10011011100','10011001110',
  '10111001100','10011101100','10011100110','11001110010','11001011100',
  '11001001110','11011100100','11001110100','11101101110','11101001110',
  '11100101110','11100101110','11001111010','11001011110','11100111100',
  '11100101110','11100010110','11100001010','11010000100','11000100010',
  '11000010010','11001011000','11001000100','11000100100','11000011000',
  '11000001100','11001000000','11000010000','11000001000','11000000100',
  '10001011000','10001000100','10000010010','10100011000','10001010000',
  '10100001000','10001000010','11000001010','11001000010','11110111010',
  '11000010100','10000101100','10000100110','10000010110','11101110110',
  '11101101110','11101100110','11100110110','11100101110','11100100110',
  '11100010110','11100001010','11011000010','11010000100','11000100010',
  '11000010010','10110011000','10100011000','10011011000','10001011000',
  '11011001000','11010001000','11000101000','10110010000','10011010000',
  '10001101000','10110000100','10011000100','10001100100','11001101000',
  '11001001000','11000101000','10100110000','10100001100','10010110000',
  '10010001100','10000101100','10100100100','10100010010','10010010100',
  '10010001010','11000100100','11001000010','10100110000','10100001100',
  '10010110000','10010001100','10000101100','10100100100','10100010010',
  '10010010100','10010001010','11000100100','11001000010',
]

const CODE128_START_B = 104
const CODE128_STOP = 106

function encodeCode128(text) {
  let encoded = CODE128_PATTERNS[CODE128_START_B]
  let checksum = CODE128_START_B
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32
    if (code < 0 || code > 95) continue
    encoded += CODE128_PATTERNS[code]
    checksum += code * (i + 1)
  }
  checksum = checksum % 103
  encoded += CODE128_PATTERNS[checksum]
  encoded += CODE128_PATTERNS[CODE128_STOP]
  return encoded
}

// Simple EAN-13 check digit
function ean13CheckDigit(digits) {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3)
  }
  return (10 - (sum % 10)) % 10
}

function generate() {
  error.value = ''
  const canvas = canvasRef.value
  if (!canvas || !barcodeText.value.trim()) return

  const text = barcodeText.value.trim()

  if (barcodeType.value === 'EAN13') {
    if (!/^\d{12,13}$/.test(text)) {
      error.value = 'EAN-13 需要 12 或 13 位数字'
      return
    }
  } else if (barcodeType.value === 'EAN8') {
    if (!/^\d{7,8}$/.test(text)) {
      error.value = 'EAN-8 需要 7 或 8 位数字'
      return
    }
  } else if (barcodeType.value === 'UPC') {
    if (!/^\d{11,12}$/.test(text)) {
      error.value = 'UPC-A 需要 11 或 12 位数字'
      return
    }
  }

  const encoded = encodeCode128(text)
  const ctx = canvas.getContext('2d')
  const w = barWidth.value
  const h = barHeight.value
  const totalWidth = encoded.length * w

  canvas.width = totalWidth + 40
  canvas.height = h + (showText.value ? 30 : 0) + 20

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#000000'
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === '1') {
      ctx.fillRect(20 + i * w, 10, w, h)
    }
  }

  if (showText.value) {
    ctx.font = '14px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, h + 26)
  }
}

function download() {
  const canvas = canvasRef.value
  if (!canvas) return
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = 'barcode.png'
  a.click()
}

onMounted(() => generate())
</script>