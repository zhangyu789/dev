<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔗 URL 编解码</h2>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600']"
      >{{ tab.label }}</button>
    </div>

    <!-- URL Encode/Decode -->
    <div v-if="activeTab === 'encode'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">原始文本</label>
          <button @click="rawInput = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="rawInput" class="textarea-field h-60" placeholder="输入原始文本，如：你好世界"></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">编码结果</label>
          <div class="flex gap-2">
            <button @click="encodeUrl" class="btn-primary btn-sm">编码 →</button>
            <button @click="decodeUrl" class="btn-secondary btn-sm">← 解码</button>
            <CopyButton :text="encodedOutput" />
          </div>
        </div>
        <textarea v-model="encodedOutput" class="textarea-field h-60" placeholder="编码后的结果..."></textarea>
        <div v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</div>
      </div>
    </div>

    <!-- URL Parse -->
    <div v-if="activeTab === 'parse'" class="space-y-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入 URL</label>
          <button @click="parseUrl" class="btn-primary btn-sm">解析</button>
        </div>
        <textarea v-model="urlInput" class="textarea-field h-24" placeholder="输入完整 URL，如：https://example.com/path?key=value&name=hello#section"></textarea>
      </div>

      <div v-if="parsedUrl" class="tool-card space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">解析结果</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="item in parsedParts" :key="item.label" class="flex items-start gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <span class="text-xs font-semibold text-primary-500 whitespace-nowrap pt-0.5">{{ item.label }}</span>
            <span class="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{{ item.value || '(空)' }}</span>
          </div>
        </div>
        <div v-if="queryParams.length > 0" class="mt-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">查询参数</h4>
          <div class="space-y-1">
            <div v-for="(param, i) in queryParams" :key="i" class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <span class="text-sm font-mono text-primary-500">{{ param.key }}</span>
              <span class="text-gray-400">=</span>
              <span class="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{{ param.value }}</span>
              <CopyButton :text="param.value" class="ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const tabs = [
  { key: 'encode', label: '编解码' },
  { key: 'parse', label: 'URL 解析' },
]
const activeTab = ref('encode')

// Encode/Decode
const rawInput = ref('')
const encodedOutput = ref('')
const error = ref('')

function encodeUrl() {
  error.value = ''
  try {
    encodedOutput.value = encodeURIComponent(rawInput.value)
  } catch (e) {
    error.value = '编码失败: ' + e.message
  }
}

function decodeUrl() {
  error.value = ''
  try {
    rawInput.value = decodeURIComponent(encodedOutput.value)
  } catch (e) {
    error.value = '解码失败: 输入不是有效的编码字符串'
  }
}

// URL Parse
const urlInput = ref('')
const parsedUrl = ref(null)
const parsedParts = ref([])
const queryParams = ref([])

function parseUrl() {
  try {
    const url = new URL(urlInput.value)
    parsedUrl.value = url
    parsedParts.value = [
      { label: '协议', value: url.protocol },
      { label: '主机', value: url.hostname },
      { label: '端口', value: url.port },
      { label: '路径', value: url.pathname },
      { label: '哈希', value: url.hash },
      { label: '完整来源', value: url.origin },
    ]
    queryParams.value = []
    url.searchParams.forEach((value, key) => {
      queryParams.value.push({ key, value })
    })
  } catch {
    parsedUrl.value = null
    parsedParts.value = []
    queryParams.value = []
    error.value = '无效的 URL 格式'
  }
}
</script>
