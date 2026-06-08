<template>
  <div class="space-y-4">
    <h2 class="tool-header">🧮 Hash 计算</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入文本</label>
          <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="input" class="textarea-field h-60" placeholder="输入要计算哈希的文本..."></textarea>
        <div class="flex items-center gap-3 mt-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="inputType" value="text" class="text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">文本</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="inputType" value="file" class="text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">文件</span>
          </label>
        </div>
        <div v-if="inputType === 'file'" class="mt-3">
          <div
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
            :class="['border-2 border-dashed rounded-lg p-6 text-center transition-colors', dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-slate-600']"
          >
            <input ref="fileInput" type="file" @change="handleFileChange" class="hidden" />
            <p class="text-gray-500 dark:text-gray-400 mb-2">{{ fileName || '拖拽文件到此处，或' }}</p>
            <button @click="$refs.fileInput.click()" class="btn-primary btn-sm">选择文件</button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="tool-card space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">哈希结果</h3>
        <div v-for="algo in algorithms" :key="algo.key" class="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <span class="text-xs font-semibold text-primary-500 whitespace-nowrap w-16">{{ algo.label }}</span>
          <span class="text-sm font-mono text-gray-800 dark:text-gray-200 break-all flex-1">{{ results[algo.key] || '—' }}</span>
          <CopyButton v-if="results[algo.key]" :text="results[algo.key]" />
        </div>
        <div class="flex items-center gap-3 mt-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="uppercase" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">大写输出</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const algorithms = [
  { key: 'md5', label: 'MD5' },
  { key: 'sha1', label: 'SHA-1' },
  { key: 'sha256', label: 'SHA-256' },
  { key: 'sha384', label: 'SHA-384' },
  { key: 'sha512', label: 'SHA-512' },
]

const input = ref('')
const inputType = ref('text')
const uppercase = ref(false)
const results = ref({})
const fileName = ref('')
const fileBuffer = ref(null)
const dragOver = ref(false)

// MD5 pure JS implementation
function md5(input) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)) }
  function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b) }
  function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t) }
  function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t) }
  function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t) }

  function binlMD5(x, len) {
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
    for (let i = 0; i < x.length; i += 16) {
      const oa = a, ob = b, oc = c, od = d
      a = md5ff(a, b, c, d, x[i], 7, -680876936); d = md5ff(d, a, b, c, x[i+1], 12, -389564586)
      c = md5ff(c, d, a, b, x[i+2], 17, 606105819); b = md5ff(b, c, d, a, x[i+3], 22, -1044525330)
      a = md5ff(a, b, c, d, x[i+4], 7, -176418897); d = md5ff(d, a, b, c, x[i+5], 12, 1200080426)
      c = md5ff(c, d, a, b, x[i+6], 17, -1473231341); b = md5ff(b, c, d, a, x[i+7], 22, -45705983)
      a = md5ff(a, b, c, d, x[i+8], 7, 1770035416); d = md5ff(d, a, b, c, x[i+9], 12, -1958414417)
      c = md5ff(c, d, a, b, x[i+10], 17, -42063); b = md5ff(b, c, d, a, x[i+11], 22, -1990404162)
      a = md5ff(a, b, c, d, x[i+12], 7, 1804603682); d = md5ff(d, a, b, c, x[i+13], 12, -40341101)
      c = md5ff(c, d, a, b, x[i+14], 17, -1502002290); b = md5ff(b, c, d, a, x[i+15], 22, 1236535329)
      a = md5gg(a, b, c, d, x[i+1], 5, -165796510); d = md5gg(d, a, b, c, x[i+6], 9, -1069501632)
      c = md5gg(c, d, a, b, x[i+11], 14, 643717713); b = md5gg(b, c, d, a, x[i], 20, -373897302)
      a = md5gg(a, b, c, d, x[i+5], 5, -701558691); d = md5gg(d, a, b, c, x[i+10], 9, 38016083)
      c = md5gg(c, d, a, b, x[i+15], 14, -660478335); b = md5gg(b, c, d, a, x[i+4], 20, -405537848)
      a = md5gg(a, b, c, d, x[i+9], 5, 568446438); d = md5gg(d, a, b, c, x[i+14], 9, -1019803690)
      c = md5gg(c, d, a, b, x[i+3], 14, -187363961); b = md5gg(b, c, d, a, x[i+8], 20, 1163531501)
      a = md5gg(a, b, c, d, x[i+13], 5, -1444681467); d = md5gg(d, a, b, c, x[i+2], 9, -51403784)
      c = md5gg(c, d, a, b, x[i+7], 14, 1735328473); b = md5gg(b, c, d, a, x[i+12], 20, -1926607734)
      a = md5hh(a, b, c, d, x[i+5], 4, -378558); d = md5hh(d, a, b, c, x[i+8], 11, -2022574463)
      c = md5hh(c, d, a, b, x[i+11], 16, 1839030562); b = md5hh(b, c, d, a, x[i+14], 23, -35309556)
      a = md5hh(a, b, c, d, x[i+1], 4, -1530992060); d = md5hh(d, a, b, c, x[i+4], 11, 1272893353)
      c = md5hh(c, d, a, b, x[i+7], 16, -155497632); b = md5hh(b, c, d, a, x[i+10], 23, -1094730640)
      a = md5hh(a, b, c, d, x[i+13], 4, 681279174); d = md5hh(d, a, b, c, x[i], 11, -358537222)
      c = md5hh(c, d, a, b, x[i+3], 16, -722521979); b = md5hh(b, c, d, a, x[i+6], 23, 76029189)
      a = md5hh(a, b, c, d, x[i+9], 4, -640364487); d = md5hh(d, a, b, c, x[i+12], 11, -421815835)
      c = md5hh(c, d, a, b, x[i+15], 16, 530742520); b = md5hh(b, c, d, a, x[i+2], 23, -995338651)
      a = md5ii(a, b, c, d, x[i], 6, -198630844); d = md5ii(d, a, b, c, x[i+7], 10, 1126891415)
      c = md5ii(c, d, a, b, x[i+14], 15, -1416354905); b = md5ii(b, c, d, a, x[i+5], 21, -57434055)
      a = md5ii(a, b, c, d, x[i+12], 6, 1700485571); d = md5ii(d, a, b, c, x[i+3], 10, -1894986606)
      c = md5ii(c, d, a, b, x[i+10], 15, -1051523); b = md5ii(b, c, d, a, x[i+1], 21, -2054922799)
      a = md5ii(a, b, c, d, x[i+8], 6, 1873313359); d = md5ii(d, a, b, c, x[i+15], 10, -30611744)
      c = md5ii(c, d, a, b, x[i+6], 15, -1560198380); b = md5ii(b, c, d, a, x[i+13], 21, 1309151649)
      a = md5ii(a, b, c, d, x[i+4], 6, -145523070); d = md5ii(d, a, b, c, x[i+11], 10, -1120210379)
      c = md5ii(c, d, a, b, x[i+2], 15, 718787259); b = md5ii(b, c, d, a, x[i+9], 21, -343485551)
      a = safeAdd(a, oa); b = safeAdd(b, ob); c = safeAdd(c, oc); d = safeAdd(d, od)
    }
    return [a, b, c, d]
  }

  function binl2hex(binarray) {
    const hexTab = uppercase.value ? '0123456789ABCDEF' : '0123456789abcdef'
    let str = ''
    for (let i = 0; i < binarray.length * 32; i += 8) {
      str += hexTab.charAt((binarray[i >> 5] >>> (i % 32)) & 0xf) + hexTab.charAt((binarray[i >> 5] >>> (i % 32 + 4)) & 0xf)
    }
    return str
  }

  function str2binl(str) {
    const bin = []
    const mask = (1 << 8) - 1
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32)
    }
    return bin
  }

  const raw = unescape(encodeURIComponent(input))
  return binl2hex(binlMD5(str2binl(raw), raw.length * 8))
}

async function computeSHA(algorithm, data) {
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function computeHashes() {
  const r = {}
  if (!input.value && inputType.value === 'text') {
    results.value = r
    return
  }

  let data
  if (inputType.value === 'file' && fileBuffer.value) {
    data = fileBuffer.value
  } else {
    const encoder = new TextEncoder()
    data = encoder.encode(input.value)
  }

  // MD5
  if (inputType.value === 'text') {
    r.md5 = md5(input.value)
  } else {
    r.md5 = '(文件模式暂不支持 MD5)'
  }

  // SHA
  try {
    r.sha1 = await computeSHA('SHA-1', data)
    r.sha256 = await computeSHA('SHA-256', data)
    r.sha384 = await computeSHA('SHA-384', data)
    r.sha512 = await computeSHA('SHA-512', data)
  } catch (e) {
    r.sha1 = '计算失败'
    r.sha256 = '计算失败'
    r.sha384 = '计算失败'
    r.sha512 = '计算失败'
  }

  if (uppercase.value) {
    for (const key in r) {
      if (typeof r[key] === 'string' && r[key] !== '计算失败' && !r[key].startsWith('(')) {
        r[key] = r[key].toUpperCase()
      }
    }
  }

  results.value = r
}

watch([input, uppercase], () => {
  if (inputType.value === 'text') computeHashes()
})

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

function processFile(file) {
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = async (e) => {
    fileBuffer.value = e.target.result
    await computeHashes()
  }
  reader.readAsArrayBuffer(file)
}
</script>
