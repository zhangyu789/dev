<template>
  <div class="space-y-4">
    <h2 class="tool-header">🌐 IP 子网计算器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">IP 地址 / CIDR</label>
          <div class="flex gap-2">
            <input v-model="ipInput" class="input-field font-mono" placeholder="192.168.1.0/24" />
            <button @click="calculate" class="btn-primary shrink-0">计算</button>
          </div>
          <div v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</div>
        </div>
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 mb-2 block">常用 CIDR</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="cidr in [8,12,16,20,24,25,26,27,28,29,30,32]" :key="cidr"
              @click="setCidr(cidr)"
              class="px-2 py-1 text-xs bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors"
            >/{{ cidr }}</button>
          </div>
        </div>
      </div>

      <div v-if="result" class="tool-card space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">计算结果</h3>
        <div v-for="item in resultItems" :key="item.label"
          class="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.label }}</span>
          <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const ipInput = ref('192.168.1.0/24')
const error = ref('')
const result = ref(null)

function setCidr(cidr) {
  const ip = ipInput.value.split('/')[0] || '192.168.1.0'
  ipInput.value = ip + '/' + cidr
  calculate()
}

function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

function intToIp(num) {
  return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.')
}

function calculate() {
  error.value = ''
  result.value = null

  const parts = ipInput.value.trim().split('/')
  if (parts.length !== 2) { error.value = '请输入 CIDR 格式，如 192.168.1.0/24'; return }

  const ip = parts[0]
  const cidr = parseInt(parts[1])

  const ipParts = ip.split('.')
  if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
    error.value = '无效的 IP 地址'; return
  }
  if (isNaN(cidr) || cidr < 0 || cidr > 32) { error.value = 'CIDR 必须在 0-32 之间'; return }

  const ipInt = ipToInt(ip)
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0
  const network = (ipInt & mask) >>> 0
  const broadcast = (network | ~mask) >>> 0
  const firstHost = cidr >= 31 ? network : (network + 1) >>> 0
  const lastHost = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0
  const totalHosts = Math.pow(2, 32 - cidr)
  const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalHosts - 2

  // IP class
  const firstOctet = parseInt(ipParts[0])
  let ipClass = 'C'
  if (firstOctet < 128) ipClass = 'A'
  else if (firstOctet < 192) ipClass = 'B'
  else if (firstOctet < 224) ipClass = 'C'
  else if (firstOctet < 240) ipClass = 'D (组播)'
  else ipClass = 'E (保留)'

  let ipType = '公网'
  if (firstOctet === 10 || (firstOctet === 172 && parseInt(ipParts[1]) >= 16 && parseInt(ipParts[1]) <= 31) || (firstOctet === 192 && parseInt(ipParts[1]) === 168)) {
    ipType = '私网 (RFC 1918)'
  } else if (firstOctet === 127) {
    ipType = '回环地址'
  }

  result.value = {
    items: [
      { label: '网络地址', value: intToIp(network) },
      { label: '广播地址', value: intToIp(broadcast) },
      { label: '子网掩码', value: intToIp(mask) },
      { label: 'CIDR 前缀', value: '/' + cidr },
      { label: '第一个可用主机', value: intToIp(firstHost) },
      { label: '最后一个可用主机', value: intToIp(lastHost) },
      { label: '总地址数', value: totalHosts.toLocaleString() },
      { label: '可用主机数', value: usableHosts.toLocaleString() },
      { label: 'IP 类别', value: ipClass },
      { label: '地址类型', value: ipType },
      { label: '通配符掩码', value: intToIp((~mask) >>> 0) },
      { label: '二进制掩码', value: mask.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1 ').trim() },
    ]
  }
}

const resultItems = ref([])
const unwatch = ref(null)
import { watch } from 'vue'
watch(() => result.value, (val) => {
  resultItems.value = val ? val.items : []
}, { immediate: true })
</script>
