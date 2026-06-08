<template>
  <div class="space-y-4">
    <h2 class="tool-header">⏳ 倒计时工具</h2>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="switchTab(tab.key)"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600']"
      >{{ tab.label }}</button>
    </div>

    <!-- 目标日期倒计时 -->
    <div v-if="activeTab === 'target'" class="space-y-4">
      <div class="tool-card space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">目标日期</label>
            <input type="date" v-model="targetDate" class="input-field" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">目标时间</label>
            <input type="time" v-model="targetTime" class="input-field" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">备注</label>
            <input type="text" v-model="targetLabel" class="input-field" placeholder="如：项目上线" />
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="startTargetCountdown" class="btn-primary">开始倒计时</button>
          <button @click="stopTargetCountdown" class="btn-secondary">停止</button>
        </div>
      </div>

      <div v-if="targetResult" class="tool-card">
        <div v-if="targetLabel" class="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">{{ targetLabel }}</div>
        <div class="text-center mb-4">
          <span v-if="targetResult.isPast" class="text-sm text-red-500">已过期</span>
          <span v-else class="text-sm text-green-500">倒计时进行中</span>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div class="px-3 py-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
            <div class="text-4xl font-bold text-primary-500 font-mono">{{ targetResult.days }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">天</div>
          </div>
          <div class="px-3 py-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
            <div class="text-4xl font-bold text-primary-500 font-mono">{{ targetResult.hours }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">时</div>
          </div>
          <div class="px-3 py-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
            <div class="text-4xl font-bold text-primary-500 font-mono">{{ targetResult.minutes }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">分</div>
          </div>
          <div class="px-3 py-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
            <div class="text-4xl font-bold text-primary-500 font-mono animate-pulse">{{ targetResult.seconds }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">秒</div>
          </div>
        </div>
        <div class="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          共 {{ targetResult.totalDays }} 天 {{ targetResult.totalHours }} 小时
        </div>
      </div>

      <!-- Saved targets -->
      <div v-if="savedTargets.length > 0" class="tool-card space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">已保存的倒计时</h3>
          <button @click="savedTargets = []" class="text-xs text-gray-400 hover:text-red-400">清空</button>
        </div>
        <div v-for="(t, i) in savedTargets" :key="i"
          class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <div>
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ t.label || '未命名' }}</span>
            <span class="text-xs text-gray-400 ml-2">{{ t.date }} {{ t.time }}</span>
          </div>
          <button @click="loadSavedTarget(t)" class="text-xs text-primary-500 hover:text-primary-600">使用</button>
        </div>
      </div>
    </div>

    <!-- 秒表 -->
    <div v-if="activeTab === 'stopwatch'" class="space-y-4">
      <div class="tool-card text-center space-y-6">
        <div class="py-6">
          <div class="text-6xl font-bold font-mono text-gray-900 dark:text-gray-100">
            {{ stopwatchDisplay }}
          </div>
          <div class="text-sm text-gray-400 mt-2">{{ stopwatchRunning ? '计时中...' : '就绪' }}</div>
        </div>
        <div class="flex justify-center gap-3">
          <button @click="startStopwatch" class="btn-primary px-6">
            {{ stopwatchRunning ? '暂停' : '开始' }}
          </button>
          <button @click="lapStopwatch" :disabled="!stopwatchRunning" class="btn-secondary px-6">计次</button>
          <button @click="resetStopwatch" class="btn-secondary px-6">重置</button>
        </div>
      </div>

      <!-- Laps -->
      <div v-if="laps.length > 0" class="tool-card space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">计次记录</h3>
        <div class="max-h-48 overflow-y-auto space-y-1">
          <div v-for="(lap, i) in laps" :key="i"
            :class="['flex items-center justify-between px-3 py-2 rounded-lg text-sm',
              lap.isBest ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
              lap.isWorst ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
              'bg-gray-50 dark:bg-slate-700/50']"
          >
            <span class="text-gray-500 dark:text-gray-400">#{{ laps.length - i }}</span>
            <span class="font-mono">{{ lap.split }}</span>
            <span class="font-mono">{{ lap.lap }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义计时器 -->
    <div v-if="activeTab === 'timer'" class="space-y-4">
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">设置时间</h3>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">小时</label>
            <input type="number" v-model.number="timerHours" min="0" max="99" class="input-field text-center text-2xl font-bold" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">分钟</label>
            <input type="number" v-model.number="timerMinutes" min="0" max="59" class="input-field text-center text-2xl font-bold" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">秒</label>
            <input type="number" v-model.number="timerSeconds" min="0" max="59" class="input-field text-center text-2xl font-bold" />
          </div>
        </div>

        <!-- Quick presets -->
        <div class="flex flex-wrap gap-2">
          <button v-for="preset in timerPresets" :key="preset.label"
            @click="applyTimerPreset(preset)"
            class="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >{{ preset.label }}</button>
        </div>

        <div class="flex gap-2">
          <button @click="startTimer" :disabled="timerState === 'running'" class="btn-primary flex-1">开始</button>
          <button @click="pauseTimer" :disabled="timerState !== 'running'" class="btn-secondary flex-1">暂停</button>
          <button @click="resetTimer" class="btn-secondary flex-1">重置</button>
        </div>
      </div>

      <!-- Timer display -->
      <div class="tool-card text-center space-y-4">
        <div class="py-6">
          <div :class="['text-6xl font-bold font-mono',
            timerState === 'finished' ? 'text-red-500 animate-pulse' :
            timerRemaining <= 10 && timerState === 'running' ? 'text-orange-500' :
            'text-gray-900 dark:text-gray-100']"
          >
            {{ timerDisplay }}
          </div>
          <div class="text-sm text-gray-400 mt-2">
            {{ timerState === 'running' ? '计时中...' : timerState === 'paused' ? '已暂停' : timerState === 'finished' ? '时间到！' : '就绪' }}
          </div>
        </div>

        <!-- Progress bar -->
        <div v-if="timerTotal > 0 && timerState !== 'idle'" class="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3">
          <div
            :class="['h-3 rounded-full transition-all duration-1000',
              timerState === 'finished' ? 'bg-red-500' :
              timerRemaining <= 10 ? 'bg-orange-500' : 'bg-primary-500']"
            :style="{ width: timerProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const tabs = [
  { key: 'target', label: '目标倒计时' },
  { key: 'stopwatch', label: '秒表' },
  { key: 'timer', label: '自定义计时' },
]
const activeTab = ref('target')

function switchTab(key) {
  // Stop target countdown when switching away
  if (activeTab.value === 'target') stopTargetCountdown()
  if (activeTab.value === 'stopwatch') { /* keep running */ }
  activeTab.value = key
  if (key === 'target' && targetInterval.value) startTargetCountdown()
}

// ========== Target Countdown ==========
const now = new Date()
const targetDate = ref(now.toISOString().split('T')[0])
const targetTime = ref('00:00')
const targetLabel = ref('')
const targetResult = ref(null)
const targetInterval = ref(null)
const savedTargets = ref([])

function startTargetCountdown() {
  stopTargetCountdown()
  updateTargetCountdown()
  targetInterval.value = setInterval(updateTargetCountdown, 1000)
}

function stopTargetCountdown() {
  if (targetInterval.value) {
    clearInterval(targetInterval.value)
    targetInterval.value = null
  }
}

function updateTargetCountdown() {
  const target = new Date(targetDate.value + 'T' + targetTime.value + ':00')
  if (isNaN(target.getTime())) return

  const now = new Date()
  const diffMs = target - now
  const isPast = diffMs < 0
  const absMs = Math.abs(diffMs)

  const totalSeconds = Math.floor(absMs / 1000)
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalDays = Math.floor(totalSeconds / 86400)
  const days = totalDays
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  targetResult.value = {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    totalDays,
    totalHours,
    isPast,
  }

  // Auto-save
  if (targetLabel.value && !savedTargets.value.find(t => t.label === targetLabel.value)) {
    savedTargets.value.unshift({ label: targetLabel.value, date: targetDate.value, time: targetTime.value })
    if (savedTargets.value.length > 10) savedTargets.value.pop()
  }
}

function loadSavedTarget(t) {
  targetDate.value = t.date
  targetTime.value = t.time
  targetLabel.value = t.label
  startTargetCountdown()
}

// ========== Stopwatch ==========
const stopwatchMs = ref(0)
const stopwatchRunning = ref(false)
const stopwatchInterval = ref(null)
const stopwatchStartTime = ref(0)
const stopwatchAccumulated = ref(0)
const laps = ref([])

const stopwatchDisplay = computed(() => {
  const ms = stopwatchMs.value
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centiseconds = Math.floor((ms % 1000) / 10)
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
})

function startStopwatch() {
  if (stopwatchRunning.value) {
    // Pause
    stopwatchRunning.value = false
    clearInterval(stopwatchInterval.value)
    stopwatchAccumulated.value = stopwatchMs.value
  } else {
    // Start
    stopwatchRunning.value = true
    stopwatchStartTime.value = Date.now()
    stopwatchInterval.value = setInterval(() => {
      stopwatchMs.value = stopwatchAccumulated.value + (Date.now() - stopwatchStartTime.value)
    }, 10)
  }
}

function formatMs(ms) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centiseconds = Math.floor((ms % 1000) / 10)
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
}

function lapStopwatch() {
  if (!stopwatchRunning.value) return
  const currentMs = stopwatchMs.value
  const prevMs = laps.value.length > 0 ? laps.value[0].totalMs : 0
  const lapMs = currentMs - prevMs

  laps.value.unshift({
    totalMs: currentMs,
    lapMs,
    split: formatMs(currentMs),
    lap: formatMs(lapMs),
    isBest: false,
    isWorst: false,
  })

  // Mark best/worst (only if 2+ laps)
  if (laps.value.length >= 2) {
    let bestIdx = 0, worstIdx = 0
    for (let i = 0; i < laps.value.length; i++) {
      laps.value[i].isBest = false
      laps.value[i].isWorst = false
      if (laps.value[i].lapMs < laps.value[bestIdx].lapMs) bestIdx = i
      if (laps.value[i].lapMs > laps.value[worstIdx].lapMs) worstIdx = i
    }
    laps.value[bestIdx].isBest = true
    laps.value[worstIdx].isWorst = true
  }
}

function resetStopwatch() {
  stopwatchRunning.value = false
  clearInterval(stopwatchInterval.value)
  stopwatchMs.value = 0
  stopwatchAccumulated.value = 0
  laps.value = []
}

// ========== Custom Timer ==========
const timerHours = ref(0)
const timerMinutes = ref(5)
const timerSeconds = ref(0)
const timerRemaining = ref(0) // in seconds
const timerTotal = ref(0)
const timerState = ref('idle') // idle, running, paused, finished
const timerInterval = ref(null)

const timerPresets = [
  { label: '1 分钟', h: 0, m: 1, s: 0 },
  { label: '3 分钟', h: 0, m: 3, s: 0 },
  { label: '5 分钟', h: 0, m: 5, s: 0 },
  { label: '10 分钟', h: 0, m: 10, s: 0 },
  { label: '15 分钟', h: 0, m: 15, s: 0 },
  { label: '25 分钟 (番茄钟)', h: 0, m: 25, s: 0 },
  { label: '30 分钟', h: 0, m: 30, s: 0 },
  { label: '1 小时', h: 1, m: 0, s: 0 },
]

function applyTimerPreset(preset) {
  timerHours.value = preset.h
  timerMinutes.value = preset.m
  timerSeconds.value = preset.s
  resetTimer()
}

const timerDisplay = computed(() => {
  const remaining = Math.max(0, timerRemaining.value)
  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const timerProgress = computed(() => {
  if (timerTotal.value === 0) return 0
  return Math.max(0, ((timerTotal.value - timerRemaining.value) / timerTotal.value) * 100)
})

function startTimer() {
  if (timerState.value === 'paused') {
    // Resume
    timerState.value = 'running'
    timerInterval.value = setInterval(tickTimer, 1000)
    return
  }

  const total = timerHours.value * 3600 + timerMinutes.value * 60 + timerSeconds.value
  if (total <= 0) return

  timerTotal.value = total
  timerRemaining.value = total
  timerState.value = 'running'
  timerInterval.value = setInterval(tickTimer, 1000)
}

function pauseTimer() {
  timerState.value = 'paused'
  clearInterval(timerInterval.value)
}

function resetTimer() {
  timerState.value = 'idle'
  clearInterval(timerInterval.value)
  timerRemaining.value = 0
  timerTotal.value = 0
}

function tickTimer() {
  if (timerRemaining.value <= 0) {
    timerRemaining.value = 0
    timerState.value = 'finished'
    clearInterval(timerInterval.value)
    // Play notification sound
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.value = 0.3
      osc.start()
      setTimeout(() => { osc.stop(); ctx.close() }, 300)
    } catch {}
    return
  }
  timerRemaining.value--
}

// Cleanup
onUnmounted(() => {
  stopTargetCountdown()
  clearInterval(stopwatchInterval.value)
  clearInterval(timerInterval.value)
})
</script>
