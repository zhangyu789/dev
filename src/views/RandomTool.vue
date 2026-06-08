<template>
  <div class="space-y-4">
    <h2 class="tool-header">🎲 随机决策器</h2>

    <!-- Tab Navigation -->
    <div class="tool-card">
      <div class="flex gap-2">
        <button v-for="tab in tabs" :key="tab.key"
          @click="activeTab = tab.key"
          :class="[activeTab === tab.key ? 'btn-primary' : 'btn-secondary', 'btn-sm']">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 随机抽签 -->
    <div v-if="activeTab === 'lottery'" class="space-y-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">候选项（每行一个）</label>
          <button @click="lotteryItems = ['选项A', '选项B', '选项C', '选项D']" class="btn-secondary btn-sm">重置</button>
        </div>
        <textarea v-model="lotteryText" class="textarea-field h-40" placeholder="每行输入一个选项..."></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center gap-3 mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">抽取数量</label>
          <input v-model.number="lotteryCount" type="number" min="1" class="input-field w-20 text-center" />
          <button @click="drawLottery" class="btn-primary">🎯 抽签</button>
        </div>
        <div v-if="lotteryResult.length" class="mt-3">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">抽签结果：</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="(item, i) in lotteryResult" :key="i"
              class="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-medium text-sm">
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 掷骰子 -->
    <div v-if="activeTab === 'dice'" class="space-y-4">
      <div class="tool-card">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">骰子数</label>
            <input v-model.number="diceCount" type="number" min="1" max="20" class="input-field w-20 text-center" />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">面数</label>
            <select v-model.number="diceFaces" class="input-field w-20">
              <option :value="4">D4</option>
              <option :value="6">D6</option>
              <option :value="8">D8</option>
              <option :value="10">D10</option>
              <option :value="12">D12</option>
              <option :value="20">D20</option>
              <option :value="100">D100</option>
            </select>
          </div>
          <button @click="rollDice" class="btn-primary">🎲 掷骰子</button>
        </div>
        <div v-if="diceResults.length" class="space-y-3">
          <div class="flex flex-wrap gap-3 justify-center">
            <div v-for="(val, i) in diceResults" :key="i"
              class="w-14 h-14 flex items-center justify-center bg-white dark:bg-slate-700 border-2 border-primary-300 dark:border-primary-600 rounded-xl text-xl font-bold text-primary-600 dark:text-primary-400 shadow-md">
              {{ val }}
            </div>
          </div>
          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            总和：<span class="font-bold text-lg text-gray-700 dark:text-gray-200">{{ diceSum }}</span>
            <span v-if="diceResults.length > 1" class="ml-3">
              平均：<span class="font-bold text-gray-700 dark:text-gray-200">{{ diceAvg }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 随机排序 -->
    <div v-if="activeTab === 'shuffle'" class="space-y-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">列表（每行一个）</label>
          <button @click="shuffleInput = '苹果\n香蕉\n橙子\n葡萄\n西瓜\n草莓\n芒果\n樱桃'" class="btn-secondary btn-sm">示例</button>
        </div>
        <textarea v-model="shuffleInput" class="textarea-field h-40" placeholder="每行输入一个项目..."></textarea>
      </div>
      <div class="tool-card">
        <div class="flex flex-wrap gap-2 mb-3">
          <button @click="shuffleList" class="btn-primary">🔀 随机排序</button>
          <button @click="pickOne" class="btn-secondary">☝️ 随机抽取一个</button>
        </div>
        <div v-if="shuffleResult.length" class="space-y-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">结果：</p>
          <div v-for="(item, i) in shuffleResult" :key="i"
            class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 rounded text-sm">
            <span class="w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold">{{ i + 1 }}</span>
            <span class="text-gray-700 dark:text-gray-300">{{ item }}</span>
          </div>
        </div>
        <div v-if="shufflePicked" class="mt-3 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">随机抽取</p>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ shufflePicked }}</p>
        </div>
      </div>
    </div>

    <!-- 随机数生成 -->
    <div v-if="activeTab === 'number'" class="space-y-4">
      <div class="tool-card">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">最小值</label>
            <input v-model.number="numMin" type="number" class="input-field w-24 text-center" />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">最大值</label>
            <input v-model.number="numMax" type="number" class="input-field w-24 text-center" />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">个数</label>
            <input v-model.number="numCount" type="number" min="1" max="100" class="input-field w-20 text-center" />
          </div>
          <label class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <input v-model="numUnique" type="checkbox" class="rounded" /> 不重复
          </label>
        </div>
        <button @click="generateNumbers" class="btn-primary mb-3">🔢 生成随机数</button>
        <div v-if="numResults.length" class="flex flex-wrap gap-2">
          <span v-for="(n, i) in numResults" :key="i"
            class="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
            {{ n }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const tabs = [
  { key: 'lottery', label: '随机抽签', icon: '🎯' },
  { key: 'dice', label: '掷骰子', icon: '🎲' },
  { key: 'shuffle', label: '随机排序', icon: '🔀' },
  { key: 'number', label: '随机数', icon: '🔢' },
]

const activeTab = ref('lottery')

// 抽签
const lotteryItems = ref(['选项A', '选项B', '选项C', '选项D'])
const lotteryText = computed({
  get: () => lotteryItems.value.join('\n'),
  set: (v) => { lotteryItems.value = v.split('\n').filter(s => s.trim()) }
})
const lotteryCount = ref(1)
const lotteryResult = ref([])

function drawLottery() {
  const items = [...lotteryItems.value]
  const count = Math.min(lotteryCount.value, items.length)
  const result = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * items.length)
    result.push(items.splice(idx, 1)[0])
  }
  lotteryResult.value = result
}

// 骰子
const diceCount = ref(2)
const diceFaces = ref(6)
const diceResults = ref([])
const diceSum = computed(() => diceResults.value.reduce((a, b) => a + b, 0))
const diceAvg = computed(() => (diceSum.value / diceResults.value.length).toFixed(1))

function rollDice() {
  const results = []
  for (let i = 0; i < diceCount.value; i++) {
    results.push(Math.floor(Math.random() * diceFaces.value) + 1)
  }
  diceResults.value = results
}

// 随机排序
const shuffleInput = ref('苹果\n香蕉\n橙子\n葡萄\n西瓜\n草莓\n芒果\n樱桃')
const shuffleResult = ref([])
const shufflePicked = ref('')

function shuffleList() {
  const arr = shuffleInput.value.split('\n').filter(s => s.trim())
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  shuffleResult.value = arr
  shufflePicked.value = ''
}

function pickOne() {
  const arr = shuffleInput.value.split('\n').filter(s => s.trim())
  if (arr.length) {
    shufflePicked.value = arr[Math.floor(Math.random() * arr.length)]
    shuffleResult.value = []
  }
}

// 随机数
const numMin = ref(1)
const numMax = ref(100)
const numCount = ref(5)
const numUnique = ref(false)
const numResults = ref([])

function generateNumbers() {
  const min = numMin.value
  const max = numMax.value
  const count = numCount.value
  const results = []

  if (numUnique.value && count > (max - min + 1)) {
    numResults.value = ['范围不足以生成不重复的随机数']
    return
  }

  if (numUnique.value) {
    const pool = []
    for (let i = min; i <= max; i++) pool.push(i)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    results.push(...pool.slice(0, count))
  } else {
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * (max - min + 1)) + min)
    }
  }
  numResults.value = results
}
</script>