<template>
  <div class="space-y-4">
    <h2 class="tool-header">📸 代码截图</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-3">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">代码</label>
          <textarea v-model="code" class="textarea-field h-60 font-mono text-sm" placeholder="粘贴代码..."></textarea>
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">语言</label>
          <select v-model="language" class="input-field text-sm">
            <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">主题</label>
            <select v-model="theme" class="input-field text-sm">
              <option value="dark">深色</option>
              <option value="light">浅色</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">内边距</label>
            <select v-model="padding" class="input-field text-sm">
              <option value="16">16px</option>
              <option value="32">32px</option>
              <option value="48">48px</option>
              <option value="64">64px</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">背景色</label>
            <input type="color" v-model="bgColor" class="w-full h-8 rounded cursor-pointer border-0" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">字号</label>
            <select v-model="fontSize" class="input-field text-sm">
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="showLineNumbers" class="w-4 h-4 rounded text-primary-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">显示行号</span>
        </label>
      </div>

      <div class="tool-card space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">预览</h3>
        <div class="flex justify-center overflow-auto">
          <div :style="{ background: bgColor, padding: padding + 'px', borderRadius: '12px' }" ref="previewRef">
            <div :class="['rounded-lg p-4', theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50']" :style="{ fontSize: fontSize + 'px' }">
              <pre class="overflow-x-auto"><code><span v-for="(line, i) in codeLines" :key="i" class="block"><span v-if="showLineNumbers" class="inline-block w-8 text-right mr-4 select-none" :class="theme === 'dark' ? 'text-gray-600' : 'text-gray-400'">{{ i + 1 }}</span><span :class="theme === 'dark' ? 'text-gray-100' : 'text-gray-800'" class="font-mono">{{ line || ' ' }}</span></span></code></pre>
            </div>
          </div>
        </div>
        <button @click="downloadImage" class="btn-primary w-full">下载为图片</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const code = ref('function hello() {\n  console.log("Hello, DevPocket!");\n}')
const language = ref('JavaScript')
const theme = ref('dark')
const padding = ref('32')
const bgColor = ref('#1a1b26')
const fontSize = ref('14')
const showLineNumbers = ref(true)
const previewRef = ref(null)
const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C', 'C++', 'HTML', 'CSS', 'SQL', 'Shell', 'JSON', 'YAML', 'Markdown']

const codeLines = computed(() => code.value.split('\n'))

async function downloadImage() {
  // Use canvas to render
  const canvas = document.createElement('canvas')
  const lines = codeLines.value
  const lineH = parseInt(fontSize.value) * 1.6
  const pad = parseInt(padding.value)
  const lineNumW = showLineNumbers.value ? 48 : 0
  const codeW = Math.max(...lines.map(l => l.length * (parseInt(fontSize.value) * 0.6))) + lineNumW + 64
  const codeH = lines.length * lineH + 64

  canvas.width = codeW + pad * 2
  canvas.height = codeH + pad * 2
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Code background
  const isDark = theme.value === 'dark'
  ctx.fillStyle = isDark ? '#111827' : '#f9fafb'
  const rx = pad, ry = pad, rw = codeW, rh = codeH, r = 8
  ctx.beginPath(); ctx.moveTo(rx + r, ry); ctx.lineTo(rx + rw - r, ry); ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r)
  ctx.lineTo(rx + rw, ry + rh - r); ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh)
  ctx.lineTo(rx + r, ry + rh); ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r)
  ctx.lineTo(rx, ry + r); ctx.quadraticCurveTo(rx, ry, rx + r, ry); ctx.fill()

  // Text
  ctx.font = `${fontSize.value}px monospace`
  ctx.fillStyle = isDark ? '#f3f4f6' : '#1f2937'
  lines.forEach((line, i) => {
    const y = pad + 32 + i * lineH + lineH * 0.75
    if (showLineNumbers.value) {
      ctx.fillStyle = isDark ? '#4b5563' : '#9ca3af'
      ctx.textAlign = 'right'
      ctx.fillText(String(i + 1), pad + 36, y)
    }
    ctx.fillStyle = isDark ? '#f3f4f6' : '#1f2937'
    ctx.textAlign = 'left'
    ctx.fillText(line, pad + 44 + lineNumW, y)
  })

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = 'code-screenshot.png'
  a.click()
}
</script>
