<template>
  <div class="h-full flex flex-col">
    <h2 class="tool-header">📐 CAD 在线画图</h2>
    <div ref="cadContainer" class="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden" style="min-height: 600px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { MainView, initCadContainer, initLocale, registerMessages, t } from 'vjcad'

const cadContainer = ref(null)
let cadView = null

onMounted(async () => {
  try {
    // 初始化语言（自动检测）
    initLocale()

    // 注册应用级翻译
    registerMessages({
      'zh-CN': {
        'app.name': '在线CAD画图'
      },
      'en-US': {
        'app.name': 'Online CAD Drawing'
      }
    })

    // 创建 MainView 实例
    cadView = new MainView({
      appname: t('app.name'),
      version: 'v1.0.0',
      sidebarStyle: 'left'  // 左侧工具栏
    })

    // 挂载到 DOM 容器
    if (cadContainer.value) {
      initCadContainer(cadContainer.value, cadView)
      // 等待初始化完成
      await cadView.onLoad()
    }
  } catch (error) {
    console.error('VJCAD 初始化失败:', error)
  }
})

onBeforeUnmount(() => {
  // 清理资源
  if (cadView) {
    cadView = null
  }
})
</script>

<style scoped>
/* VJCAD 会自动处理样式 */
</style>