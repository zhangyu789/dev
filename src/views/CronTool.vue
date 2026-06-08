<template>
  <div class="space-y-4">
    <h2 class="tool-header">⏱️ Cron 表达式</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input & Presets -->
      <div class="tool-card space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Cron 表达式</label>
          <div class="flex gap-2">
            <input v-model="cronInput" class="input-field font-mono" placeholder="*/5 * * * *" @input="parseCron" />
            <button @click="parseCron" class="btn-primary btn-sm shrink-0">解析</button>
          </div>
          <div v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</div>
        </div>

        <!-- Field description -->
        <div v-if="!error" class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
          <div class="grid grid-cols-6 gap-2 text-center">
            <div v-for="(field, i) in fields" :key="i" class="space-y-1">
              <div class="text-xs font-semibold text-primary-500">{{ field.label }}</div>
              <div class="text-sm font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 rounded px-1 py-0.5">{{ fieldParts[i] || '*' }}</div>
            </div>
          </div>
        </div>

        <!-- Human readable -->
        <div v-if="humanReadable" class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
          <span class="text-sm text-primary-700 dark:text-primary-300">{{ humanReadable }}</span>
        </div>

        <!-- Presets -->
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">常用预设</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in presets" :key="preset.expr"
              @click="cronInput = preset.expr; parseCron()"
              class="px-3 py-2 text-left bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <div class="text-xs font-mono text-primary-500">{{ preset.expr }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ preset.desc }}</div>
            </button>
          </div>
        </div>

        <!-- Builder -->
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">可视化构建</label>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">分钟</label>
              <select v-model="builder.minute" @change="buildCron" class="input-field text-sm">
                <option value="*">每分钟</option>
                <option value="0">第 0 分</option>
                <option value="15">第 15 分</option>
                <option value="30">第 30 分</option>
                <option value="45">第 45 分</option>
                <option value="*/5">每 5 分钟</option>
                <option value="*/10">每 10 分钟</option>
                <option value="*/15">每 15 分钟</option>
                <option value="*/30">每 30 分钟</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">小时</label>
              <select v-model="builder.hour" @change="buildCron" class="input-field text-sm">
                <option value="*">每小时</option>
                <option value="0">0 点</option>
                <option value="6">6 点</option>
                <option value="8">8 点</option>
                <option value="12">12 点</option>
                <option value="18">18 点</option>
                <option value="*/2">每 2 小时</option>
                <option value="*/6">每 6 小时</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">日</label>
              <select v-model="builder.day" @change="buildCron" class="input-field text-sm">
                <option value="*">每天</option>
                <option value="1">1 号</option>
                <option value="15">15 号</option>
                <option value="*/5">每 5 天</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">月</label>
              <select v-model="builder.month" @change="buildCron" class="input-field text-sm">
                <option value="*">每月</option>
                <option value="1">1 月</option>
                <option value="*/3">每 3 月</option>
                <option value="*/6">每 6 月</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">星期</label>
              <select v-model="builder.weekday" @change="buildCron" class="input-field text-sm">
                <option value="*">每天</option>
                <option value="1">周一</option>
                <option value="2">周二</option>
                <option value="3">周三</option>
                <option value="4">周四</option>
                <option value="5">周五</option>
                <option value="6">周六</option>
                <option value="0">周日</option>
                <option value="1-5">周一至周五</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Next execution times -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">下次执行时间</h3>
        <div class="space-y-1">
          <div
            v-for="(time, i) in nextTimes"
            :key="i"
            class="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
          >
            <span class="text-xs text-gray-400 w-6">#{{ i + 1 }}</span>
            <span class="text-sm font-mono text-gray-800 dark:text-gray-200">{{ time }}</span>
          </div>
          <div v-if="nextTimes.length === 0" class="text-center text-gray-400 text-sm py-8">
            输入 Cron 表达式后查看下次执行时间
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const cronInput = ref('0 * * * *')
const error = ref('')
const humanReadable = ref('')
const nextTimes = ref([])

const builder = ref({
  minute: '0',
  hour: '*',
  day: '*',
  month: '*',
  weekday: '*',
})

const fields = [
  { label: '分钟' },
  { label: '小时' },
  { label: '日' },
  { label: '月' },
  { label: '星期' },
]

const fieldParts = computed(() => {
  return cronInput.value.trim().split(/\s+/)
})

const presets = [
  { expr: '* * * * *', desc: '每分钟' },
  { expr: '*/5 * * * *', desc: '每 5 分钟' },
  { expr: '0 * * * *', desc: '每小时' },
  { expr: '0 */2 * * *', desc: '每 2 小时' },
  { expr: '0 0 * * *', desc: '每天零点' },
  { expr: '0 8 * * *', desc: '每天早上 8 点' },
  { expr: '0 0 * * 1-5', desc: '工作日零点' },
  { expr: '0 0 1 * *', desc: '每月 1 号零点' },
  { expr: '0 0 1 1 *', desc: '每年 1 月 1 日零点' },
  { expr: '*/30 * * * *', desc: '每 30 分钟' },
]

function buildCron() {
  const b = builder.value
  cronInput.value = `${b.minute} ${b.hour} ${b.day} ${b.month} ${b.weekday}`
  parseCron()
}

// Parse cron field to get matching values
function parseField(field, min, max) {
  const values = new Set()
  if (field === '*') {
    for (let i = min; i <= max; i++) values.add(i)
    return values
  }

  const parts = field.split(',')
  for (const part of parts) {
    if (part.includes('/')) {
      const [range, step] = part.split('/')
      const stepNum = parseInt(step)
      let start = min, end = max
      if (range !== '*') {
        if (range.includes('-')) {
          [start, end] = range.split('-').map(Number)
        } else {
          start = parseInt(range)
        }
      }
      for (let i = start; i <= end; i += stepNum) values.add(i)
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      for (let i = start; i <= end; i++) values.add(i)
    } else {
      values.add(parseInt(part))
    }
  }
  return values
}

function generateHumanReadable(parts) {
  if (parts.length < 5) return ''
  const [minute, hour, day, month, weekday] = parts

  let desc = ''

  // Weekday
  if (weekday !== '*') {
    const weekNames = ['日', '一', '二', '三', '四', '五', '六']
    if (weekday.includes('-')) {
      const [s, e] = weekday.split('-').map(Number)
      desc += `每周${weekNames[s]}到周${weekNames[e]}`
    } else if (weekday.includes(',')) {
      desc += '每周' + weekday.split(',').map(n => `周${weekNames[Number(n)]}`).join('、')
    } else {
      desc += `每周${weekNames[Number(weekday)]}`
    }
  } else if (month !== '*') {
    if (month.includes('-')) desc += `每年${month}月`
    else if (month === '*/3') desc += '每季度'
    else if (month === '*/6') desc += '每半年'
    else desc += `${month}月`
  } else if (day !== '*') {
    if (day.includes('/')) desc += `每${day.split('/')[1]}天`
    else desc += `每月${day}号`
  } else {
    desc += '每天'
  }

  // Time
  if (hour !== '*') {
    if (hour.includes('/')) desc += ` 每${hour.split('/')[1]}小时`
    else desc += ` ${hour}点`
    if (minute !== '*' && !minute.includes('/')) desc += `${minute}分`
    else if (minute.includes('/')) desc += ` 每${minute.split('/')[1]}分钟`
  } else if (minute !== '*') {
    if (minute.includes('/')) desc += ` 每${minute.split('/')[1]}分钟`
    else desc += ` 每小时第${minute}分钟`
  }

  return desc.trim()
}

function getNextExecutions(parts, count = 10) {
  if (parts.length < 5) return []
  const minutes = parseField(parts[0], 0, 59)
  const hours = parseField(parts[1], 0, 23)
  const days = parseField(parts[2], 1, 31)
  const months = parseField(parts[3], 1, 12)
  const weekdays = parseField(parts[4], 0, 6)

  const results = []
  const now = new Date()
  // Start from next minute
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0)

  // Limit search to 4 years to avoid infinite loop
  const maxDate = new Date(start.getTime() + 4 * 365.25 * 24 * 60 * 60 * 1000)

  let current = new Date(start)
  while (results.length < count && current < maxDate) {
    if (months.has(current.getMonth() + 1) &&
        days.has(current.getDate()) &&
        weekdays.has(current.getDay()) &&
        hours.has(current.getHours()) &&
        minutes.has(current.getMinutes())) {
      results.push(current.toLocaleString('zh-CN'))
    }
    // Move to next minute
    current = new Date(current.getTime() + 60 * 1000)
  }
  return results
}

function parseCron() {
  error.value = ''
  humanReadable.value = ''
  nextTimes.value = []

  const expr = cronInput.value.trim()
  if (!expr) return

  const parts = expr.split(/\s+/)
  if (parts.length !== 5) {
    error.value = 'Cron 表达式应包含 5 个字段：分钟 小时 日 月 星期'
    return
  }

  // Validate each field
  const fieldRanges = [
    { min: 0, max: 59, name: '分钟' },
    { min: 0, max: 23, name: '小时' },
    { min: 1, max: 31, name: '日' },
    { min: 1, max: 12, name: '月' },
    { min: 0, max: 6, name: '星期' },
  ]

  for (let i = 0; i < 5; i++) {
    try {
      const values = parseField(parts[i], fieldRanges[i].min, fieldRanges[i].max)
      if (values.size === 0) throw new Error('empty')
      for (const v of values) {
        if (v < fieldRanges[i].min || v > fieldRanges[i].max) {
          throw new Error('out of range')
        }
      }
    } catch {
      error.value = `"${fieldRanges[i].name}" 字段无效: ${parts[i]}`
      return
    }
  }

  humanReadable.value = generateHumanReadable(parts)
  nextTimes.value = getNextExecutions(parts)
}
</script>
