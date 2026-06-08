<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔒 文本加密解密</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">明文</label>
          <button @click="plaintext = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="plaintext" class="textarea-field h-48" placeholder="输入要加密的文本..."></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">密文</label>
          <CopyButton :text="ciphertext" />
        </div>
        <textarea v-model="ciphertext" class="textarea-field h-48" placeholder="加密后的结果..."></textarea>
      </div>
    </div>

    <div class="tool-card space-y-3">
      <div class="flex flex-wrap gap-2">
        <button @click="encrypt" class="btn-primary">加密 →</button>
        <button @click="decrypt" class="btn-secondary">← 解密</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">算法</label>
          <select v-model="algorithm" class="input-field text-sm">
            <option value="AES-GCM">AES-256-GCM</option>
            <option value="AES-CBC">AES-256-CBC</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">密钥（密码）</label>
          <input type="text" v-model="password" class="input-field text-sm font-mono" placeholder="输入密码..." />
        </div>
      </div>
      <div v-if="error" class="text-sm text-red-500">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const plaintext = ref('')
const ciphertext = ref('')
const password = ref('')
const algorithm = ref('AES-GCM')
const error = ref('')

async function deriveKey(pwd, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: algorithm.value, length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function ab2b64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function b642ab(base64) {
  const bin = atob(base64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr.buffer
}

async function encrypt() {
  error.value = ''
  if (!plaintext.value || !password.value) { error.value = '请输入文本和密码'; return }
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const key = await deriveKey(password.value, salt)
    const enc = new TextEncoder()
    let encrypted, iv

    if (algorithm.value === 'AES-GCM') {
      iv = crypto.getRandomValues(new Uint8Array(12))
      encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext.value))
      ciphertext.value = ab2b64(salt) + '.' + ab2b64(iv) + '.' + ab2b64(encrypted)
    } else {
      iv = crypto.getRandomValues(new Uint8Array(16))
      encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, enc.encode(plaintext.value))
      ciphertext.value = ab2b64(salt) + '.' + ab2b64(iv) + '.' + ab2b64(encrypted)
    }
  } catch (e) {
    error.value = '加密失败: ' + e.message
  }
}

async function decrypt() {
  error.value = ''
  if (!ciphertext.value || !password.value) { error.value = '请输入密文和密码'; return }
  try {
    const parts = ciphertext.value.split('.')
    if (parts.length !== 3) { error.value = '密文格式无效'; return }
    const salt = b642ab(parts[0])
    const iv = b642ab(parts[1])
    const data = b642ab(parts[2])
    const key = await deriveKey(password.value, salt)
    const decrypted = await crypto.subtle.decrypt({ name: algorithm.value, iv }, key, data)
    plaintext.value = new TextDecoder().decode(decrypted)
  } catch {
    error.value = '解密失败：密码错误或密文已损坏'
  }
}
</script>
