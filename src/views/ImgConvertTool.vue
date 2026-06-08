<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔄 图片格式转换</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <div
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          :class="['border-2 border-dashed rounded-lg p-8 text-center transition-colors', dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-slate-600']"
        >
          <input ref="fileInput" type="file" accept="image/*" @change="handleFile" class="hidden" />
          <p class="text-gray-500 dark:text-gray-400 mb-2">拖拽图片到此处，或</p>
          <button @click="$refs.fileInput.click()" class="btn-primary btn-sm">选择图片</button>
        </div>

        <div v-if="preview" class="space-y-3">
          <img :src="preview" class="max-h-40 rounded-lg mx-auto" />
          <div class="text-sm text-gray-500 dark:text-gray-400 text-center">{{ fileName }} ({{ fileInfo }})</div>
        </div>

        <div v-if="preview" class="space-y-3">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">目标格式</label>
            <select v-model="targetFormat" class="input-field text-sm">
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          <div v-if="targetFormat === 'image/jpeg'">
            <label class="text-xs text-gray-500 dark:text-gray-400">质量 ({{ quality }}%)</label>
            <input type="range" v-model.number="quality" min="10" max="100" class="w-full" />
          </div>
          <button @click="convert" class="btn-primary w-full">转换并下载</button>
        </div>
      </div>

      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">批量转换</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">选择多张图片</label>
            <input ref="batchInput" type="file" accept="image/*" multiple @change="handleBatch" class="input-field text-sm" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">目标格式</label>
            <select v-model="batchFormat" class="input-field text-sm">
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          <button @click="batchConvert" :disabled="batchFiles.length === 0" class="btn-primary w-full">批量转换</button>
        </div>
        <div v-if="batchResults.length > 0" class="space-y-2">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400">转换结果</h4>
          <div v-for="(r, i) in batchResults" :key="i" class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm">
            <span class="text-gray-700 dark:text-gray-300 truncate">{{ r.name }}</span>
            <a :href="r.url" :download="r.downloadName" class="text-primary-500 hover:text-primary-600">下载</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const dragOver = ref(false)
const fileInput = ref(null)
const batchInput = ref(null)
const preview = ref('')
const fileName = ref('')
const fileInfo = ref('')
const imageBuffer = ref(null)
const targetFormat = ref('image/png')
const quality = ref(85)
const batchFormat = ref('image/png')
const batchFiles = ref([])
const batchResults = ref([])

const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

function readFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    preview.value = e.target.result
    fileName.value = file.name
    fileInfo.value = (file.size / 1024).toFixed(1) + ' KB'
    imageBuffer.value = file
  }
  reader.readAsDataURL(file)
}

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) readFile(file)
}

function handleFile(e) {
  const file = e.target.files[0]
  if (file) readFile(file)
}

function handleBatch(e) {
  batchFiles.value = Array.from(e.target.files)
  batchResults.value = []
}

async function doConvert(file, format, q) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        resolve({ url, blob })
      }, format, q / 100)
    }
    img.src = URL.createObjectURL(file)
  })
}

async function convert() {
  if (!imageBuffer.value) return
  const { url } = await doConvert(imageBuffer.value, targetFormat.value, quality.value)
  const a = document.createElement('a')
  a.href = url
  const baseName = fileName.value.replace(/\.[^.]+$/, '')
  a.download = `${baseName}.${extMap[targetFormat.value]}`
  a.click()
}

async function batchConvert() {
  batchResults.value = []
  for (const file of batchFiles.value) {
    const { url } = await doConvert(file, batchFormat.value, quality.value)
    const baseName = file.name.replace(/\.[^.]+$/, '')
    batchResults.value.push({
      name: file.name,
      url,
      downloadName: `${baseName}.${extMap[batchFormat.value]}`,
    })
  }
}
</script>
