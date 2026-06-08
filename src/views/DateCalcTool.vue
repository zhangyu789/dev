<template>
  <div class="space-y-4">
    <h2 class="tool-header">📅 日期计算器</h2>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600']"
      >{{ tab.label }}</button>
    </div>

    <!-- 日期间隔计算 -->
    <div v-if="activeTab === 'diff'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">日期间隔计算</h3>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">开始日期</label>
          <input type="date" v-model="diffStart" class="input-field" />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">结束日期</label>
          <input type="date" v-model="diffEnd" class="input-field" />
        </div>
        <button @click="calcDiff" class="btn-primary w-full">计算间隔</button>
      </div>

      <div v-if="diffResult" class="tool-card space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">计算结果</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary-500">{{ diffResult.days }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">天</div>
          </div>
          <div class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary-500">{{ diffResult.weeks }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">周</div>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">总天数</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ diffResult.days }} 天</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">整周 + 余天</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ diffResult.weeks }} 周 {{ diffResult.remainDays }} 天</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">总小时</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ diffResult.hours.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">总分钟</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ diffResult.minutes.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">工作日（周一~周五）</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ diffResult.workdays }} 天</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">自然月数</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ diffResult.months }}</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">年月日</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ diffResult.ymd }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期加减 -->
    <div v-if="activeTab === 'add'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">日期加减</h3>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">起始日期</label>
          <input type="date" v-model="addBase" class="input-field" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">年</label>
            <input type="number" v-model.number="addYears" class="input-field" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">月</label>
            <input type="number" v-model.number="addMonths" class="input-field" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">周</label>
            <input type="number" v-model.number="addWeeks" class="input-field" />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">天</label>
            <input type="number" v-model.number="addDays" class="input-field" />
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="calcAdd" class="btn-primary flex-1">计算 +</button>
          <button @click="calcSub" class="btn-secondary flex-1">计算 −</button>
        </div>
      </div>

      <div v-if="addResult" class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">计算结果</h3>
        <div class="px-4 py-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
          <div class="text-3xl font-bold text-primary-500">{{ addResult.date }}</div>
          <div class="text-sm text-primary-600 dark:text-primary-400 mt-1">{{ addResult.weekday }}</div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">距今天</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ addResult.fromNow }}</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">Unix 时间戳</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ addResult.timestamp }}</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">ISO 8601</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ addResult.iso }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 倒计时 -->
    <div v-if="activeTab === 'countdown'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">目标日期倒计时</h3>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">目标日期</label>
          <input type="date" v-model="countdownTarget" class="input-field" />
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">备注</label>
          <input type="text" v-model="countdownLabel" class="input-field" placeholder="如：项目上线" />
        </div>
        <button @click="calcCountdown" class="btn-primary w-full">计算</button>
      </div>

      <div v-if="countdownResult" class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ countdownLabel || '目标日期' }} — {{ countdownResult.isPast ? '已过去' : '倒计时' }}
        </h3>
        <div class="grid grid-cols-4 gap-3">
          <div class="px-3 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary-500">{{ Math.abs(countdownResult.days) }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">天</div>
          </div>
          <div class="px-3 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary-500">{{ countdownResult.hours }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">时</div>
          </div>
          <div class="px-3 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary-500">{{ countdownResult.minutes }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">分</div>
          </div>
          <div class="px-3 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary-500">{{ countdownResult.seconds }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">秒</div>
          </div>
        </div>
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          {{ countdownResult.isPast ? '已过去' : '距目标还有' }} {{ Math.abs(countdownResult.totalDays) }} 天
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">工作日</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ countdownResult.workdays }} 天</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-400">周末</span>
            <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ countdownResult.weekends }} 天</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tabs = [
  { key: 'diff', label: '日期间隔' },
  { key: 'add', label: '日期加减' },
  { key: 'countdown', label: '倒计时' },
]
const activeTab = ref('diff')

// Diff
const today = new Date().toISOString().split('T')[0]
const diffStart = ref(today)
const diffEnd = ref(today)
const diffResult = ref(null)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function calcWorkdays(start, end) {
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

function calcDiff() {
  const start = new Date(diffStart.value)
  const end = new Date(diffEnd.value)
  if (isNaN(start) || isNaN(end)) return

  const diffMs = end - start
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const absDays = Math.abs(totalDays)

  // Months calculation
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (totalDays < 0) months = -Math.abs(months)

  // Years, months, days
  let y = Math.abs(end.getFullYear() - start.getFullYear())
  let m = Math.abs(end.getMonth() - start.getMonth())
  let d = Math.abs(end.getDate() - start.getDate())
  if (d < 0) { m--; d += new Date(end.getFullYear(), end.getMonth(), 0).getDate() }
  if (m < 0) { y--; m += 12 }
  const ymdText = totalDays >= 0
    ? `${y}年${m}月${d}日`
    : `${y}年${m}月${d}日`

  const workdays = calcWorkdays(
    totalDays >= 0 ? start : end,
    totalDays >= 0 ? end : start
  )

  diffResult.value = {
    days: absDays,
    weeks: Math.floor(absDays / 7),
    remainDays: absDays % 7,
    hours: absDays * 24,
    minutes: absDays * 24 * 60,
    workdays,
    months: months !== 0 ? Math.abs(months) + ' 个月' : '0 个月',
    ymd: ymdText,
  }
}

// Add/Sub
const addBase = ref(today)
const addYears = ref(0)
const addMonths = ref(0)
const addWeeks = ref(0)
const addDays = ref(0)
const addResult = ref(null)

function calcAdd() { calcDateAdd(1) }
function calcSub() { calcDateAdd(-1) }

function calcDateAdd(sign) {
  const base = new Date(addBase.value)
  if (isNaN(base)) return

  base.setFullYear(base.getFullYear() + sign * addYears.value)
  base.setMonth(base.getMonth() + sign * addMonths.value)
  base.setDate(base.getDate() + sign * (addWeeks.value * 7 + addDays.value))

  const dateStr = base.toISOString().split('T')[0]
  const now = new Date()
  const diffDays = Math.round((base - now) / (1000 * 60 * 60 * 24))
  let fromNow = ''
  if (diffDays === 0) fromNow = '今天'
  else if (diffDays > 0) fromNow = `${diffDays} 天后`
  else fromNow = `${Math.abs(diffDays)} 天前`

  addResult.value = {
    date: dateStr,
    weekday: '星期' + weekDays[base.getDay()],
    fromNow,
    timestamp: Math.floor(base.getTime() / 1000),
    iso: base.toISOString(),
  }
}

// Countdown
const countdownTarget = ref('')
const countdownLabel = ref('')
const countdownResult = ref(null)

function calcCountdown() {
  const target = new Date(countdownTarget.value + 'T00:00:00')
  if (isNaN(target)) return

  const now = new Date()
  const diffMs = target - now
  const isPast = diffMs < 0
  const absMs = Math.abs(diffMs)

  const totalSeconds = Math.floor(absMs / 1000)
  const totalDays = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const startDate = isPast ? target : now
  const endDate = isPast ? now : target
  const workdays = calcWorkdays(startDate, endDate)
  const weekends = totalDays - workdays

  countdownResult.value = {
    days: totalDays,
    hours,
    minutes,
    seconds,
    totalDays,
    isPast,
    workdays,
    weekends: weekends > 0 ? weekends : 0,
  }
}
</script>
