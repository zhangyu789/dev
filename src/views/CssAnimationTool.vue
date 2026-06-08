<template>
  <div class="space-y-4">
    <h2 class="tool-header">🎭 CSS 动画生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Controls -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">动画参数</h3>

        <!-- Presets -->
        <div>
          <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">预设动画</label>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="preset in presets" :key="preset.key"
              @click="applyPreset(preset)"
              :class="['px-2 py-1.5 text-xs rounded-lg transition-colors', activePreset === preset.key ? 'bg-primary-500 text-white' : 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300']"
            >{{ preset.label }}</button>
          </div>
        </div>

        <!-- Animation properties -->
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">动画名称</label>
            <input v-model="animName" class="input-field text-sm font-mono" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">时长</label>
              <div class="flex gap-1">
                <input type="number" v-model.number="duration" min="0" step="0.1" class="input-field text-sm" />
                <span class="text-xs text-gray-400 py-2">s</span>
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">延迟</label>
              <div class="flex gap-1">
                <input type="number" v-model.number="delay" min="0" step="0.1" class="input-field text-sm" />
                <span class="text-xs text-gray-400 py-2">s</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">缓动函数</label>
              <select v-model="easing" class="input-field text-sm">
                <option v-for="e in easings" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">循环</label>
              <select v-model="iteration" class="input-field text-sm">
                <option value="1">1 次</option>
                <option value="2">2 次</option>
                <option value="3">3 次</option>
                <option value="infinite">无限</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">方向</label>
            <select v-model="direction" class="input-field text-sm">
              <option value="normal">normal</option>
              <option value="reverse">reverse</option>
              <option value="alternate">alternate</option>
              <option value="alternate-reverse">alternate-reverse</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">填充模式</label>
            <select v-model="fillMode" class="input-field text-sm">
              <option value="none">none</option>
              <option value="forwards">forwards</option>
              <option value="backwards">backwards</option>
              <option value="both">both</option>
            </select>
          </div>
        </div>

        <!-- Keyframes editor -->
        <div class="border-t border-gray-200 dark:border-slate-600 pt-3">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">@keyframes</label>
            <button @click="resetKeyframes" class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">重置</button>
          </div>
          <div class="space-y-2">
            <div v-for="(kf, i) in keyframes" :key="i" class="flex gap-2 items-start">
              <input v-model="kf.percent" class="input-field w-16 text-sm font-mono text-center" placeholder="0%" />
              <textarea v-model="kf.css" class="textarea-field flex-1 text-xs" rows="2" :placeholder="'transform: scale(1);'"></textarea>
              <button v-if="keyframes.length > 2" @click="keyframes.splice(i, 1)" class="text-red-400 hover:text-red-500 text-sm mt-1">✕</button>
            </div>
            <button @click="addKeyframe" class="text-xs text-primary-500 hover:text-primary-600">+ 添加关键帧</button>
          </div>
        </div>
      </div>

      <!-- Preview & Code -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">实时预览</h3>
        <div class="flex items-center justify-center min-h-[180px] bg-gray-100 dark:bg-slate-700/30 rounded-lg p-8">
          <div class="w-20 h-20 bg-primary-500 rounded-lg" :style="previewStyle"></div>
        </div>
        <div class="flex gap-2">
          <button @click="playing = !playing" class="btn-primary btn-sm">{{ playing ? '暂停' : '播放' }}</button>
          <button @click="restart" class="btn-secondary btn-sm">重播</button>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">CSS 代码</label>
            <CopyButton :text="fullCss" />
          </div>
          <pre class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">{{ fullCss }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const animName = ref('fadeIn')
const duration = ref(1)
const delay = ref(0)
const easing = ref('ease')
const iteration = ref('infinite')
const direction = ref('normal')
const fillMode = ref('both')
const playing = ref(true)
const activePreset = ref('fadeIn')
const animUid = ref(0)

const easings = [
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
  'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
  'steps(4, end)',
]

const defaultKeyframes = {
  fadeIn: [
    { percent: '0%', css: 'opacity: 0;' },
    { percent: '100%', css: 'opacity: 1;' },
  ],
  fadeOut: [
    { percent: '0%', css: 'opacity: 1;' },
    { percent: '100%', css: 'opacity: 0;' },
  ],
  bounce: [
    { percent: '0%, 100%', css: 'transform: translateY(0);' },
    { percent: '50%', css: 'transform: translateY(-30px);' },
  ],
  pulse: [
    { percent: '0%, 100%', css: 'transform: scale(1);' },
    { percent: '50%', css: 'transform: scale(1.1);' },
  ],
  shake: [
    { percent: '0%, 100%', css: 'transform: translateX(0);' },
    { percent: '25%', css: 'transform: translateX(-10px);' },
    { percent: '75%', css: 'transform: translateX(10px);' },
  ],
  rotate: [
    { percent: '0%', css: 'transform: rotate(0deg);' },
    { percent: '100%', css: 'transform: rotate(360deg);' },
  ],
  slideUp: [
    { percent: '0%', css: 'transform: translateY(40px); opacity: 0;' },
    { percent: '100%', css: 'transform: translateY(0); opacity: 1;' },
  ],
  flip: [
    { percent: '0%', css: 'transform: perspective(400px) rotateY(0);' },
    { percent: '100%', css: 'transform: perspective(400px) rotateY(180deg);' },
  ],
}

const presets = [
  { key: 'fadeIn', label: '淡入' },
  { key: 'fadeOut', label: '淡出' },
  { key: 'bounce', label: '弹跳' },
  { key: 'pulse', label: '脉冲' },
  { key: 'shake', label: '抖动' },
  { key: 'rotate', label: '旋转' },
  { key: 'slideUp', label: '上滑' },
  { key: 'flip', label: '翻转' },
]

const keyframes = ref([
  { percent: '0%', css: 'opacity: 0;' },
  { percent: '100%', css: 'opacity: 1;' },
])

function applyPreset(preset) {
  activePreset.value = preset.key
  animName.value = preset.key
  keyframes.value = defaultKeyframes[preset.key].map(kf => ({ ...kf }))
  // Reset uid to force re-render
  animUid.value++
  restart()
}

function addKeyframe() {
  keyframes.value.push({ percent: '50%', css: '' })
}

function resetKeyframes() {
  applyPreset(presets.find(p => p.key === activePreset.value) || presets[0])
}

const keyframesCss = computed(() => {
  const lines = keyframes.value.map(kf => `  ${kf.percent} {\n    ${kf.css.split('\n').join('\n    ')}\n  }`)
  return `@keyframes ${animName.value} {\n${lines.join('\n')}\n}`
})

const animationProperty = computed(() => {
  return `${animName.value} ${duration.value}s ${easing.value} ${delay.value}s ${iteration.value} ${direction.value} ${fillMode.value}`
})

const fullCss = computed(() => {
  return `${keyframesCss.value}\n\nanimation: ${animationProperty.value};`
})

const previewStyle = computed(() => {
  const uid = animUid.value
  return {
    animation: playing.value ? `${animName.value}_${uid} ${duration.value}s ${easing.value} ${delay.value}s ${iteration.value} ${direction.value} ${fillMode.value}` : 'none',
  }
})

function restart() {
  playing.value = false
  animUid.value++
  requestAnimationFrame(() => {
    playing.value = true
  })
}

// Inject keyframes dynamically
let styleEl = null

function injectStyles() {
  if (!styleEl) {
    styleEl = document.createElement('style')
    document.head.appendChild(styleEl)
  }
  const uid = animUid.value
  const lines = keyframes.value.map(kf => `  ${kf.percent} {\n    ${kf.css.split('\n').join('\n    ')}\n  }`)
  styleEl.textContent = `@keyframes ${animName.value}_${uid} {\n${lines.join('\n')}\n}`
}

watch([keyframes, animUid], () => {
  injectStyles()
}, { deep: true })

onMounted(() => {
  injectStyles()
})
</script>
