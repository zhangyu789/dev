<template>
  <div class="space-y-4">
    <h2 class="tool-header">📖 Git 命令速查</h2>
    <input v-model="search" class="input-field text-sm" placeholder="搜索命令或描述..." />

    <div v-for="group in filteredGroups" :key="group.label" class="tool-card space-y-2">
      <h3 class="text-sm font-semibold text-primary-500">{{ group.icon }} {{ group.label }}</h3>
      <div v-for="cmd in group.items" :key="cmd.cmd"
        class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <code class="text-sm font-mono text-primary-600 dark:text-primary-400 whitespace-nowrap shrink-0">{{ cmd.cmd }}</code>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ cmd.desc }}</span>
        <CopyButton v-if="cmd.copy" :text="cmd.copy || cmd.cmd" class="sm:ml-auto" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const search = ref('')

const groups = [
  { label: '基础操作', icon: '📦', items: [
    { cmd: 'git init', desc: '初始化仓库' },
    { cmd: 'git clone <url>', desc: '克隆远程仓库' },
    { cmd: 'git status', desc: '查看状态' },
    { cmd: 'git add .', desc: '添加所有修改到暂存区' },
    { cmd: 'git commit -m "msg"', desc: '提交' },
    { cmd: 'git push', desc: '推送到远程' },
    { cmd: 'git pull', desc: '拉取远程更新' },
  ]},
  { label: '分支管理', icon: '🌿', items: [
    { cmd: 'git branch', desc: '列出分支' },
    { cmd: 'git branch <name>', desc: '创建分支' },
    { cmd: 'git checkout <branch>', desc: '切换分支' },
    { cmd: 'git checkout -b <name>', desc: '创建并切换分支' },
    { cmd: 'git merge <branch>', desc: '合并分支' },
    { cmd: 'git branch -d <name>', desc: '删除分支' },
    { cmd: 'git branch -D <name>', desc: '强制删除分支' },
  ]},
  { label: '撤销与回退', icon: '↩️', items: [
    { cmd: 'git checkout -- <file>', desc: '撤销工作区修改' },
    { cmd: 'git reset HEAD <file>', desc: '取消暂存' },
    { cmd: 'git reset --soft HEAD~1', desc: '撤销最近提交（保留修改）' },
    { cmd: 'git reset --hard HEAD~1', desc: '撤销最近提交（丢弃修改）' },
    { cmd: 'git revert <commit>', desc: '创建反向提交' },
    { cmd: 'git stash', desc: '暂存当前修改' },
    { cmd: 'git stash pop', desc: '恢复暂存修改' },
  ]},
  { label: '查看历史', icon: '📜', items: [
    { cmd: 'git log --oneline', desc: '简洁查看日志' },
    { cmd: 'git log --graph', desc: '图形化查看日志' },
    { cmd: 'git diff', desc: '查看未暂存的修改' },
    { cmd: 'git diff --cached', desc: '查看已暂存的修改' },
    { cmd: 'git show <commit>', desc: '查看某次提交详情' },
    { cmd: 'git blame <file>', desc: '查看文件每行修改者' },
  ]},
  { label: '远程操作', icon: '🌐', items: [
    { cmd: 'git remote -v', desc: '查看远程仓库' },
    { cmd: 'git remote add origin <url>', desc: '添加远程仓库' },
    { cmd: 'git fetch', desc: '获取远程更新（不合并）' },
    { cmd: 'git push -u origin <branch>', desc: '推送并设置上游' },
    { cmd: 'git push origin --delete <branch>', desc: '删除远程分支' },
  ]},
  { label: '标签', icon: '🏷️', items: [
    { cmd: 'git tag', desc: '列出标签' },
    { cmd: 'git tag v1.0.0', desc: '创建轻量标签' },
    { cmd: 'git tag -a v1.0.0 -m "msg"', desc: '创建附注标签' },
    { cmd: 'git push origin --tags', desc: '推送标签' },
  ]},
  { label: '高级操作', icon: '⚡', items: [
    { cmd: 'git rebase <branch>', desc: '变基' },
    { cmd: 'git cherry-pick <commit>', desc: '摘取提交' },
    { cmd: 'git rebase -i HEAD~3', desc: '交互式变基（修改历史）' },
    { cmd: 'git bisect', desc: '二分查找 Bug 引入' },
    { cmd: 'git reflog', desc: '查看操作历史（可找回丢失提交）' },
  ]},
]

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return groups
  return groups.map(g => ({
    ...g,
    items: g.items.filter(i => i.cmd.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
  })).filter(g => g.items.length > 0)
})
</script>
