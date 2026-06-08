<template>
  <div class="space-y-4">
    <h2 class="tool-header">📋 HTTP 状态码速查</h2>
    <div class="flex gap-2 mb-2">
      <input v-model="search" class="input-field flex-1 text-sm" placeholder="搜索状态码或描述..." />
    </div>
    <div v-for="group in filteredGroups" :key="group.label" class="tool-card space-y-2">
      <h3 class="text-sm font-semibold text-primary-500">{{ group.label }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
        <div v-for="item in group.items" :key="item.code"
          class="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <span :class="['text-sm font-bold font-mono w-10', codeColor(item.code)]">{{ item.code }}</span>
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')

const groups = [
  { label: '1xx 信息响应', items: [
    { code: 100, desc: 'Continue 继续' }, { code: 101, desc: 'Switching Protocols 切换协议' }, { code: 102, desc: 'Processing 处理中' },
  ]},
  { label: '2xx 成功', items: [
    { code: 200, desc: 'OK 成功' }, { code: 201, desc: 'Created 已创建' }, { code: 202, desc: 'Accepted 已接受' },
    { code: 204, desc: 'No Content 无内容' }, { code: 206, desc: 'Partial Content 部分内容' }, { code: 207, desc: 'Multi-Status 多状态' },
  ]},
  { label: '3xx 重定向', items: [
    { code: 300, desc: 'Multiple Choices 多种选择' }, { code: 301, desc: 'Moved Permanently 永久重定向' },
    { code: 302, desc: 'Found 临时重定向' }, { code: 304, desc: 'Not Modified 未修改' },
    { code: 307, desc: 'Temporary Redirect 临时重定向' }, { code: 308, desc: 'Permanent Redirect 永久重定向' },
  ]},
  { label: '4xx 客户端错误', items: [
    { code: 400, desc: 'Bad Request 错误请求' }, { code: 401, desc: 'Unauthorized 未授权' },
    { code: 403, desc: 'Forbidden 禁止访问' }, { code: 404, desc: 'Not Found 未找到' },
    { code: 405, desc: 'Method Not Allowed 方法不允许' }, { code: 408, desc: 'Request Timeout 请求超时' },
    { code: 409, desc: 'Conflict 冲突' }, { code: 410, desc: 'Gone 已删除' },
    { code: 413, desc: 'Payload Too Large 请求体过大' }, { code: 414, desc: 'URI Too Long URI 过长' },
    { code: 415, desc: 'Unsupported Media Type 不支持的媒体类型' }, { code: 418, desc: "I'm a Teapot 我是茶壶" },
    { code: 422, desc: 'Unprocessable Entity 无法处理的实体' }, { code: 429, desc: 'Too Many Requests 请求过多' },
    { code: 451, desc: 'Unavailable For Legal Reasons 因法律原因不可用' },
  ]},
  { label: '5xx 服务端错误', items: [
    { code: 500, desc: 'Internal Server Error 服务器内部错误' }, { code: 501, desc: 'Not Implemented 未实现' },
    { code: 502, desc: 'Bad Gateway 网关错误' }, { code: 503, desc: 'Service Unavailable 服务不可用' },
    { code: 504, desc: 'Gateway Timeout 网关超时' }, { code: 505, desc: 'HTTP Version Not Supported HTTP版本不支持' },
    { code: 507, desc: 'Insufficient Storage 存储不足' }, { code: 508, desc: 'Loop Detected 检测到循环' },
    { code: 510, desc: 'Not Extended 未扩展' }, { code: 511, desc: 'Network Authentication Required 需要网络认证' },
  ]},
]

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return groups
  return groups.map(g => ({
    ...g,
    items: g.items.filter(i => String(i.code).includes(q) || i.desc.toLowerCase().includes(q))
  })).filter(g => g.items.length > 0)
})

function codeColor(code) {
  if (code < 200) return 'text-gray-500'
  if (code < 300) return 'text-green-500'
  if (code < 400) return 'text-yellow-500'
  if (code < 500) return 'text-orange-500'
  return 'text-red-500'
}
</script>
