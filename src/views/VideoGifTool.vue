<template>
  <div class="space-y-4">
    <h2 class="tool-header">🎬 视频/音频转 GIF</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Upload -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">上传视频</h3>
        <input type="file" accept="video/*" @change="handleVideoChange" class="input-field text-sm" />
        <video v-if="videoSrc" ref="videoEl" :src="videoSrc" controls class="w-full rounded-lg max-h-64"></video>

        <div v-if="videoSrc" class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              起始时间: {{ startTime }}s
            </label>
            <input type="range" v-model.number="startTime" min="0" :max="duration" step="0.1" class="w-full" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              持续时间: {{ gifDuration }}s
            </label>
            <input type="range" v-model.number="gifDuration" min="0.5" :max="10" step="0.5" class="w-full" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              帧率: {{ fps }} FPS
            </label>
            <input type="range" v-model.number="fps" min="5" max="25" step="5" class="w-full" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              宽度: {{ width }}px
            </label>
            <input type="range" v-model.number="width" min="200" max="800" step="50" class="w-full" />
          </div>
          <button @click="generateGif" :disabled="generating" class="btn-primary w-full">
            {{ generating ? '生成中...' : '生成 GIF' }}
          </button>
        </div>
      </div>

      <!-- Result -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">GIF 结果</h3>
        <div v-if="gifSrc" class="space-y-3">
          <img :src="gifSrc" class="max-w-full rounded-lg border border-gray-200 dark:border-slate-600" />
          <p class="text-xs text-gray-400">大小: {{ gifSize }}</p>
          <button @click="downloadGif" class="btn-primary w-full">下载 GIF</button>
        </div>
        <div v-else class="text-gray-400 text-center py-8">
          上传视频并配置参数后点击生成
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../composables/useToast'
import GIF from 'gif.js'

const { show } = useToast()

const videoSrc = ref('')
const videoEl = ref(null)
const duration = ref(10)
const startTime = ref(0)
const gifDuration = ref(3)
const fps = ref(10)
const width = ref(400)
const generating = ref(false)
const gifSrc = ref('')
const gifSize = ref('')

function handleVideoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  videoSrc.value = URL.createObjectURL(file)
  
  // Get duration
  const video = document.createElement('video')
  video.src = videoSrc.value
  video.onloadedmetadata = () => {
    duration.value = Math.floor(video.duration)
  }
}

async function generateGif() {
  if (!videoSrc.value) return
  generating.value = true
  gifSrc.value = ''

  try {
    const video = document.createElement('video')
    video.src = videoSrc.value
    video.muted = true
    video.playsInline = true
    await new Promise(resolve => { video.onloadeddata = resolve; video.load() })

    const canvas = document.createElement('canvas')
    const scale = width.value / video.videoWidth
    canvas.width = width.value
    canvas.height = Math.round(video.videoHeight * scale)
    const ctx = canvas.getContext('2d')

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: new URL('gif.js/dist/gif.worker.js', import.meta.url).href,
    })

    const frameCount = fps.value * gifDuration.value
    const frameDelay = 1000 / fps.value

    for (let i = 0; i < frameCount; i++) {
      video.currentTime = startTime.value + (i / fps.value)
      await new Promise(resolve => { video.onseeked = resolve })
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      gif.addFrame(ctx, { copy: true, delay: frameDelay })
    }

    gif.on('finished', (blob) => {
      gifSrc.value = URL.createObjectURL(blob)
      gifSize.value = formatSize(blob.size)
      generating.value = false
      show('GIF 生成完成！', 'success')
    })

    gif.render()
  } catch (e) {
    generating.value = false
    show('生成失败: ' + e.message, 'error')
  }
}

function downloadGif() {
  if (!gifSrc.value) return
  const a = document.createElement('a')
  a.href = gifSrc.value
  a.download = 'devpocket-output.gif'
  a.click()
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
