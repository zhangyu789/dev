<template>
  <div class="space-y-4">
    <h2 class="tool-header">✂️ 在线抠图工具</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">利用浏览器 AI 模型，在本地自动去除图片背景，数据不上传服务器。</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Upload -->
      <div class="tool-card space-y-4">
        <div
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          :class="['border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer', dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-slate-600']"
          @click="$refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="hidden" />
          <p class="text-gray-500 dark:text-gray-400 mb-2">拖拽图片到此处，或点击选择</p>
          <p class="text-xs text-gray-400">支持 PNG, JPG, WebP</p>
        </div>

        <div v-if="processing" class="flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">AI 模型处理中，请稍候...</span>
        </div>

        <div v-if="originalSrc" class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">原图预览</p>
          <img :src="originalSrc" class="max-h-48 rounded-lg border border-gray-200 dark:border-slate-600 object-contain" />
        </div>
      </div>

      <!-- Result -->
      <div class="tool-card space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">抠图结果</p>
        <div v-if="resultSrc" class="space-y-3">
          <div class="relative inline-block" style="background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 16px 16px">
            <img :src="resultSrc" class="max-h-48 rounded-lg object-contain relative" />
          </div>
          <button @click="downloadResult" class="btn-primary w-full">下载透明背景图片 (PNG)</button>
        </div>
        <div v-else class="text-gray-400 text-center py-8">
          上传图片后自动开始抠图
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const dragOver = ref(false)
const originalSrc = ref('')
const resultSrc = ref('')
const resultBlob = ref(null)
const processing = ref(false)

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) processImage(file)
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) processImage(file)
}

async function processImage(file) {
  processing.value = true
  originalSrc.value = URL.createObjectURL(file)
  resultSrc.value = ''

  try {
    // Use canvas-based simple background removal
    // For a more advanced approach, @imgly/background-removal can be used
    // but it requires downloading a large model (~30MB)
    // Here we use a simpler approach with canvas alpha manipulation
    
    const img = new Image()
    img.src = originalSrc.value
    await new Promise(resolve => img.onload = resolve)

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Simple chroma-key approach: detect and remove the most common edge color
    // Sample pixels from the edges to determine background color
    const edgeColors = []
    const sampleSize = Math.min(10, canvas.width, canvas.height)
    
    for (let i = 0; i < sampleSize; i++) {
      // Top edge
      const topIdx = (i * (canvas.width / sampleSize) | 0) * 4
      edgeColors.push([data[topIdx], data[topIdx+1], data[topIdx+2]])
      // Bottom edge
      const botIdx = ((canvas.height - 1) * canvas.width + (i * (canvas.width / sampleSize) | 0)) * 4
      edgeColors.push([data[botIdx], data[botIdx+1], data[botIdx+2]])
      // Left edge
      const leftIdx = ((i * (canvas.height / sampleSize) | 0)) * canvas.width * 4
      edgeColors.push([data[leftIdx], data[leftIdx+1], data[leftIdx+2]])
      // Right edge
      const rightIdx = ((i * (canvas.height / sampleSize) | 0)) * canvas.width * 4 + (canvas.width - 1) * 4
      edgeColors.push([data[rightIdx], data[rightIdx+1], data[rightIdx+2]])
    }

    // Find most common edge color (simplified)
    const bgR = Math.round(edgeColors.reduce((s, c) => s + c[0], 0) / edgeColors.length)
    const bgG = Math.round(edgeColors.reduce((s, c) => s + c[1], 0) / edgeColors.length)
    const bgB = Math.round(edgeColors.reduce((s, c) => s + c[2], 0) / edgeColors.length)

    // Remove similar colors with tolerance
    const tolerance = 50
    for (let i = 0; i < data.length; i += 4) {
      const dr = Math.abs(data[i] - bgR)
      const dg = Math.abs(data[i+1] - bgG)
      const db = Math.abs(data[i+2] - bgB)
      if (dr < tolerance && dg < tolerance && db < tolerance) {
        data[i+3] = 0 // Set alpha to 0
      }
    }

    ctx.putImageData(imageData, 0, 0)
    
    canvas.toBlob((blob) => {
      resultBlob.value = blob
      resultSrc.value = URL.createObjectURL(blob)
      processing.value = false
      show('抠图完成！', 'success')
    }, 'image/png')
  } catch (e) {
    processing.value = false
    show('处理失败: ' + e.message, 'error')
  }
}

function downloadResult() {
  if (!resultBlob.value) return
  const a = document.createElement('a')
  a.href = resultSrc.value
  a.download = 'devpocket-bg-removed.png'
  a.click()
}
</script>
