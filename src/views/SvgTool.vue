<template>
  <div class="space-y-4">
    <h2 class="tool-header">🎨 SVG 预览编辑</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">SVG 代码</label>
          <div class="flex gap-2">
            <button @click="formatSvg" class="btn-secondary btn-sm">格式化</button>
            <button @click="minifySvg" class="btn-secondary btn-sm">压缩</button>
          </div>
        </div>
        <textarea v-model="svgCode" class="textarea-field h-80 font-mono text-xs" placeholder="粘贴 SVG 代码..." @input="updatePreview"></textarea>
      </div>
      <div class="tool-card space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">预览</h3>
        <div class="min-h-[200px] flex items-center justify-center bg-white rounded-lg p-4 border border-gray-200 dark:border-slate-600" v-html="sanitizedSvg"></div>
        <div class="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>标签数: {{ stats.tags }}</span>
          <span>字符数: {{ stats.chars }}</span>
          <span>大小: {{ stats.size }}</span>
        </div>
        <div class="flex gap-2">
          <button @click="downloadSvg" class="btn-primary btn-sm">下载 SVG</button>
          <CopyButton :text="svgCode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const svgCode = ref(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="50" fill="#6366f1" opacity="0.8"/>
  <text x="60" y="65" text-anchor="middle" fill="white" font-size="20" font-weight="bold">SVG</text>
</svg>`)

const sanitizedSvg = computed(() => {
  const code = svgCode.value.trim()
  if (!code.startsWith('<svg')) return ''
  // Basic sanitization: remove script tags
  return code.replace(/<script[\s\S]*?<\/script>/gi, '')
})

const stats = computed(() => {
  const code = svgCode.value
  const tags = (code.match(/<[a-zA-Z]/g) || []).length
  const chars = code.length
  const size = chars < 1024 ? chars + ' B' : (chars / 1024).toFixed(1) + ' KB'
  return { tags, chars, size }
})

function updatePreview() {}

function formatSvg() {
  try {
    let code = svgCode.value.trim()
    let formatted = ''
    let indent = 0
    const lines = code.replace(/>\s*</g, '>\n<').split('\n')

    for (let line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      if (trimmed.startsWith('</')) indent = Math.max(0, indent - 1)
      formatted += '  '.repeat(indent) + trimmed + '\n'
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<!') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
        indent++
      }
    }
    svgCode.value = formatted.trim()
  } catch {}
}

function minifySvg() {
  svgCode.value = svgCode.value
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, '')
    .trim()
}

function downloadSvg() {
  const blob = new Blob([svgCode.value], { type: 'image/svg+xml' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'image.svg'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>
