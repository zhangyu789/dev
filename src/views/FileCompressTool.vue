<template>
  <div class="space-y-4">
    <h2 class="tool-header">📦 在线文件压缩</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">所有处理均在本地浏览器完成，文件不会上传到任何服务器。</p>

    <div class="tool-card space-y-4">
      <div
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDrop"
        :class="['border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer', dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-slate-600']"
        @click="$refs.fileInput.click()"
      >
        <input ref="fileInput" type="file" accept="image/*,.pdf" @change="handleFileChange" class="hidden" multiple />
        <p class="text-gray-500 dark:text-gray-400 mb-2">拖拽文件到此处，或点击选择</p>
        <p class="text-xs text-gray-400">支持图片 (PNG, JPG, WebP) 和 PDF</p>
      </div>

      <!-- File list -->
      <div v-if="files.length" class="space-y-2">
        <div v-for="(file, i) in files" :key="i" class="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-4 py-3">
          <span class="text-lg">{{ file.type.startsWith('image') ? '🖼️' : '📄' }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ file.name }}</p>
            <p class="text-xs text-gray-400">{{ formatSize(file.size) }} → <span v-if="file.compressed" class="text-green-500">{{ formatSize(file.compressedSize) }} (节省 {{ file.saved }}%)</span><span v-else>等待压缩...</span></p>
          </div>
          <div v-if="file.compressed" class="flex gap-2">
            <button @click="downloadFile(file)" class="btn-primary btn-sm">下载</button>
          </div>
          <div v-else-if="file.compressing" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs text-gray-400">压缩中...</span>
          </div>
        </div>
      </div>

      <!-- Compress options -->
      <div v-if="files.length" class="space-y-3">
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">图片质量:</label>
          <input type="range" v-model.number="quality" min="0.1" max="1" step="0.05" class="flex-1" />
          <span class="text-sm font-mono text-gray-500 w-12 text-right">{{ Math.round(quality * 100) }}%</span>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">输出格式</label>
          <select v-model="outputFormat" class="input-field w-40">
            <option value="original">保持原格式</option>
            <option value="image/webp">转为 WebP</option>
            <option value="image/jpeg">转为 JPEG</option>
            <option value="image/png">转为 PNG</option>
          </select>
        </div>
        <button @click="compressAll" class="btn-primary w-full">批量压缩</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../composables/useToast'
import imageCompression from 'browser-image-compression'

const { show } = useToast()

const dragOver = ref(false)
const files = ref([])
const quality = ref(0.7)
const outputFormat = ref('original')

function handleDrop(e) {
  dragOver.value = false
  const droppedFiles = Array.from(e.dataTransfer.files)
  addFiles(droppedFiles)
}

function handleFileChange(e) {
  const selectedFiles = Array.from(e.target.files)
  addFiles(selectedFiles)
}

function addFiles(newFiles) {
  for (const file of newFiles) {
    files.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file,
      compressed: false,
      compressing: false,
      compressedSize: 0,
      saved: 0,
      compressedBlob: null,
    })
  }
}

async function compressAll() {
  for (const file of files.value) {
    if (file.compressed || file.compressing) continue
    await compressFile(file)
  }
}

async function compressFile(file) {
  file.compressing = true

  try {
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality.value,
        fileType: outputFormat.value === 'original' ? undefined : outputFormat.value,
      }
      
      const compressed = await imageCompression(file.raw, options)
      file.compressedBlob = compressed
      file.compressedSize = compressed.size
      file.saved = Math.round((1 - compressed.size / file.size) * 100)
      file.compressed = true
    } else {
      // For PDF and other files, we can't compress in browser easily
      file.compressed = true
      file.compressedSize = file.size
      file.saved = 0
      show('PDF 暂不支持浏览器端压缩', 'error')
    }
  } catch (e) {
    show(`${file.name} 压缩失败: ${e.message}`, 'error')
  } finally {
    file.compressing = false
  }
}

function downloadFile(file) {
  if (!file.compressedBlob) return
  const url = URL.createObjectURL(file.compressedBlob)
  const a = document.createElement('a')
  a.href = url
  const ext = file.compressedBlob.type.split('/')[1] || 'png'
  a.download = file.name.replace(/\.[^.]+$/, '') + '_compressed.' + ext
  a.click()
  URL.revokeObjectURL(url)
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
