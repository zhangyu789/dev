<template>
  <div class="space-y-4">
    <h2 class="tool-header">📝 Markdown 排版工具</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Editor -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Markdown 编辑器</label>
          <div class="flex gap-2">
            <button @click="loadSample" class="btn-secondary btn-sm">示例</button>
            <button @click="mdText = ''" class="btn-secondary btn-sm">清空</button>
          </div>
        </div>
        <textarea v-model="mdText" class="textarea-field h-[500px]" placeholder="输入 Markdown 内容..." spellcheck="false"></textarea>
      </div>

      <!-- Preview -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">实时预览</label>
          <div class="flex gap-2">
            <CopyButton :text="mdText" />
          </div>
        </div>
        <div class="h-[500px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none px-2" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

const mdText = ref('')

const renderedHtml = computed(() => {
  if (!mdText.value.trim()) return '<p class="text-gray-400">预览区域</p>'
  try {
    return marked(mdText.value)
  } catch {
    return '<p class="text-red-500">渲染失败</p>'
  }
})

function loadSample() {
  mdText.value = `# DevPocket 开发者工具箱

## 简介

**DevPocket** 是一款纯前端开发者效率工具箱，特点如下：

- 即开即用，无需后端
- 数据安全，本地处理
- 极简设计，无广告

## 功能列表

| 模块 | 工具 | 说明 |
|------|------|------|
| 文本处理 | JSON 格式化 | 支持格式化/压缩/高亮 |
| 文本处理 | Base64 编解码 | 文本与图片互转 |
| 颜色工具 | 配色方案生成 | 多种配色模式 |

## 代码示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}
hello('DevPocket');
\`\`\`

## 引用

> 工欲善其事，必先利其器。 —— 《论语》

---

*感谢使用 DevPocket！*
`
}
</script>

<style>
.prose h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
.prose h2 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.prose h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
.prose p { margin-bottom: 0.75rem; line-height: 1.7; }
.prose ul, .prose ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
.prose li { margin-bottom: 0.25rem; }
.prose code { background: #e5e7eb; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.85em; }
.dark .prose code { background: #374151; }
.prose pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
.prose pre code { background: transparent; padding: 0; }
.prose blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; color: #6b7280; margin-bottom: 0.75rem; }
.prose table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
.prose th, .prose td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
.dark .prose th, .dark .prose td { border-color: #475569; }
.prose th { background: #f3f4f6; font-weight: 600; }
.dark .prose th { background: #1e293b; }
.prose hr { border-top: 1px solid #d1d5db; margin: 1rem 0; }
.dark .prose hr { border-color: #475569; }
.prose img { max-width: 100%; border-radius: 0.5rem; }
.prose strong { font-weight: 700; }
.prose em { font-style: italic; }
</style>
