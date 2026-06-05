<template>
  <div class="space-y-4">
    <h2 class="tool-header">🆔 UUID / 随机数生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- UUID -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">UUID 生成器</h3>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">版本</label>
          <select v-model="uuidVersion" class="input-field">
            <option value="v4">UUID v4 (随机)</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">生成数量</label>
          <input v-model.number="uuidCount" type="number" min="1" max="100" class="input-field" />
        </div>
        <div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="uuidUppercase" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">大写</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer ml-4">
            <input type="checkbox" v-model="uuidNoDash" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">无连字符</span>
          </label>
        </div>
        <button @click="generateUUIDs" class="btn-primary w-full">生成 UUID</button>
      </div>

      <!-- Random numbers -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">随机数生成器</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">最小值</label>
            <input v-model.number="randMin" type="number" class="input-field" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">最大值</label>
            <input v-model.number="randMax" type="number" class="input-field" />
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">生成数量</label>
          <input v-model.number="randCount" type="number" min="1" max="100" class="input-field" />
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="randUnique" class="w-4 h-4 rounded text-primary-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">不重复</span>
        </label>
        <button @click="generateRandoms" class="btn-primary w-full">生成随机数</button>
      </div>
    </div>

    <!-- Results -->
    <div class="tool-card space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ activeResult === 'uuid' ? 'UUID 结果' : '随机数结果' }}
        </h3>
        <div class="flex gap-2">
          <CopyButton :text="resultText" />
          <button @click="results = []" class="btn-secondary btn-sm">清空</button>
        </div>
      </div>
      <div class="max-h-60 overflow-y-auto space-y-1">
        <div
          v-for="(item, i) in results"
          :key="i"
          class="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 rounded text-sm font-mono"
        >
          <span>{{ item }}</span>
          <CopyButton :text="item" />
        </div>
      </div>
      <div v-if="results.length === 0" class="text-center text-gray-400 text-sm py-4">点击生成按钮查看结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const uuidVersion = ref('v4')
const uuidCount = ref(5)
const uuidUppercase = ref(false)
const uuidNoDash = ref(false)
const randMin = ref(1)
const randMax = ref(100)
const randCount = ref(10)
const randUnique = ref(false)

const results = ref([])
const activeResult = ref('uuid')

const resultText = computed(() => results.value.join('\n'))

function generateUUID() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function generateUUIDs() {
  activeResult.value = 'uuid'
  const list = []
  for (let i = 0; i < uuidCount.value; i++) {
    let uuid = generateUUID()
    if (uuidNoDash.value) uuid = uuid.replace(/-/g, '')
    if (uuidUppercase.value) uuid = uuid.toUpperCase()
    list.push(uuid)
  }
  results.value = list
}

function generateRandoms() {
  activeResult.value = 'random'
  const list = []
  const min = randMin.value
  const max = randMax.value
  const count = randCount.value
  const unique = randUnique.value

  if (unique && (max - min + 1) < count) {
    results.value = ['范围不足以生成不重复的随机数']
    return
  }

  const generated = new Set()
  while (list.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    if (unique && generated.has(num)) continue
    generated.add(num)
    list.push(String(num))
  }
  results.value = list
}
</script>
