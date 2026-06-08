<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔑 JWT 解码</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">JWT Token</label>
          <div class="flex gap-2">
            <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
            <button @click="decodeJwt" class="btn-primary btn-sm">解码</button>
          </div>
        </div>
        <textarea v-model="input" class="textarea-field h-72" placeholder="粘贴 JWT Token，如：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"></textarea>
        <div v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</div>
      </div>

      <!-- Decoded Result -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">解码结果</h3>

        <div v-if="decoded.header" class="space-y-3">
          <!-- Header -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-primary-500">HEADER <span class="text-gray-400 font-normal">(算法与类型)</span></span>
              <CopyButton :text="headerJson" />
            </div>
            <pre class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">{{ headerJson }}</pre>
          </div>

          <!-- Payload -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-primary-500">PAYLOAD <span class="text-gray-400 font-normal">(数据)</span></span>
              <CopyButton :text="payloadJson" />
            </div>
            <pre class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">{{ payloadJson }}</pre>
          </div>

          <!-- Signature -->
          <div>
            <span class="text-xs font-semibold text-primary-500">VERIFY SIGNATURE</span>
            <div class="mt-1 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm font-mono text-gray-500 dark:text-gray-400 break-all">
              {{ decoded.signature || '—' }}
            </div>
          </div>

          <!-- Time claims -->
          <div v-if="timeClaims.length > 0" class="space-y-1">
            <span class="text-xs font-semibold text-primary-500">时间字段解读</span>
            <div v-for="claim in timeClaims" :key="claim.label" class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ claim.label }}</span>
              <span class="text-sm font-mono text-gray-800 dark:text-gray-200">{{ claim.value }}</span>
              <span v-if="claim.human" class="text-xs text-gray-400 dark:text-gray-500">({{ claim.human }})</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-400 text-sm py-8">
          输入 JWT Token 后点击解码查看结果
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const error = ref('')
const decoded = ref({ header: null, payload: null, signature: '' })

const headerJson = computed(() => {
  return decoded.value.header ? JSON.stringify(decoded.value.header, null, 2) : ''
})

const payloadJson = computed(() => {
  return decoded.value.payload ? JSON.stringify(decoded.value.payload, null, 2) : ''
})

const timeClaims = computed(() => {
  const claims = []
  const payload = decoded.value.payload
  if (!payload) return claims

  const timeFields = [
    { key: 'iat', label: '签发时间 (iat)' },
    { key: 'exp', label: '过期时间 (exp)' },
    { key: 'nbf', label: '生效时间 (nbf)' },
    { key: 'auth_time', label: '认证时间 (auth_time)' },
  ]

  for (const field of timeFields) {
    if (payload[field.key] !== undefined) {
      const ts = payload[field.key]
      const date = new Date(ts * 1000)
      claims.push({
        label: field.label,
        value: String(ts),
        human: formatDate(date),
      })
    }
  }

  return claims
})

function formatDate(date) {
  if (isNaN(date.getTime())) return '无效日期'
  const now = new Date()
  const diff = now - date
  let relative = ''
  if (diff > 0) {
    if (diff < 60000) relative = '刚刚'
    else if (diff < 3600000) relative = `${Math.floor(diff / 60000)} 分钟前`
    else if (diff < 86400000) relative = `${Math.floor(diff / 3600000)} 小时前`
    else relative = `${Math.floor(diff / 86400000)} 天前`
  } else {
    const abs = -diff
    if (abs < 60000) relative = '即将'
    else if (abs < 3600000) relative = `${Math.floor(abs / 60000)} 分钟后`
    else if (abs < 86400000) relative = `${Math.floor(abs / 3600000)} 小时后`
    else relative = `${Math.floor(abs / 86400000)} 天后`
  }
  return `${date.toLocaleString('zh-CN')} (${relative})`
}

function base64UrlDecode(str) {
  // Replace Base64URL chars with standard Base64 chars
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  // Pad with '='
  const pad = str.length % 4
  if (pad) str += '='.repeat(4 - pad)
  return atob(str)
}

function decodeJwt() {
  error.value = ''
  decoded.value = { header: null, payload: null, signature: '' }

  const token = input.value.trim()
  if (!token) return

  const parts = token.split('.')
  if (parts.length !== 3) {
    error.value = '无效的 JWT 格式：JWT 应由 3 部分组成（header.payload.signature）'
    return
  }

  try {
    const headerStr = base64UrlDecode(parts[0])
    decoded.value.header = JSON.parse(headerStr)
  } catch {
    error.value = 'Header 部分解码失败'
    return
  }

  try {
    const payloadStr = base64UrlDecode(parts[1])
    decoded.value.payload = JSON.parse(payloadStr)
  } catch {
    error.value = 'Payload 部分解码失败'
    return
  }

  decoded.value.signature = parts[2]
}
</script>
