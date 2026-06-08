<template>
  <div class="space-y-4">
    <h2 class="tool-header">🗄️ SQLite 查看器</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">所有处理均在本地浏览器完成，数据库文件不会上传到任何服务器。</p>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
      ⚠️ {{ error }}
    </div>

    <!-- File Upload -->
    <div v-if="!db" class="tool-card">
      <div
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDrop"
        :class="['border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer', dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-slate-600']"
        @click="$refs.fileInput.click()"
      >
        <input ref="fileInput" type="file" accept=".db,.sqlite,.sqlite3,.db3" @change="handleFileChange" class="hidden" />
        <div class="text-4xl mb-3">📂</div>
        <p class="text-gray-500 dark:text-gray-400 mb-1">拖拽 SQLite 文件到此处，或点击选择</p>
        <p class="text-xs text-gray-400">支持 .db / .sqlite / .sqlite3 / .db3 格式</p>
      </div>
      <div v-if="loading" class="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
        <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        正在加载数据库...
      </div>
    </div>

    <!-- Database Content -->
    <div v-if="db" class="space-y-4">
      <!-- Toolbar -->
      <div class="tool-card !p-4 flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>📄</span>
          <span class="font-medium truncate max-w-[200px]" :title="fileName">{{ fileName }}</span>
          <span class="text-gray-400">({{ formatSize(fileSize) }})</span>
        </div>
        <div class="flex-1"></div>
        <button @click="closeDb" class="btn-secondary btn-sm">关闭数据库</button>
        <button @click="$refs.fileInput2.click()" class="btn-secondary btn-sm">打开其他文件</button>
        <input ref="fileInput2" type="file" accept=".db,.sqlite,.sqlite3,.db3" @change="handleFileChange" class="hidden" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <!-- Table List -->
        <div class="tool-card !p-4 lg:col-span-1">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📋 数据表</h3>
          <div class="space-y-1 max-h-96 overflow-y-auto">
            <button
              v-for="table in tables"
              :key="table.name"
              @click="selectTable(table.name)"
              :class="['w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2', activeTable === table.name ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700']"
            >
              <span class="text-xs opacity-60">#</span>
              <span class="truncate">{{ table.name }}</span>
              <span class="ml-auto text-xs text-gray-400">{{ table.count }}</span>
            </button>
          </div>
        </div>

        <!-- Data / Query -->
        <div class="lg:col-span-3 space-y-4">
          <!-- SQL Query -->
          <div class="tool-card !p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">🔍 SQL 查询</h3>
              <div class="flex gap-2">
                <button @click="runQuery" class="btn-primary btn-sm" :disabled="!sqlQuery.trim()">执行</button>
              </div>
            </div>
            <textarea
              v-model="sqlQuery"
              class="textarea-field h-20"
              placeholder="输入 SQL 语句，如：SELECT * FROM users LIMIT 100"
              spellcheck="false"
              @keydown.ctrl.enter="runQuery"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1">按 Ctrl+Enter 快捷执行</p>
          </div>

          <!-- Query Error -->
          <div v-if="queryError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {{ queryError }}
          </div>

          <!-- Result Table -->
          <div v-if="queryResult" class="tool-card !p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                📊 查询结果
                <span class="text-xs text-gray-400 font-normal ml-2">共 {{ queryResult.rows.length }} 行</span>
              </h3>
              <div class="flex gap-2">
                <button @click="exportCSV" class="btn-secondary btn-sm" :disabled="!queryResult.rows.length">导出 CSV</button>
                <button @click="exportJSON" class="btn-secondary btn-sm" :disabled="!queryResult.rows.length">导出 JSON</button>
              </div>
            </div>
            <div class="overflow-auto max-h-[500px] border border-gray-200 dark:border-slate-700 rounded-lg">
              <table v-if="queryResult.rows.length" class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-slate-700/50 sticky top-0">
                  <tr>
                    <th v-for="col in queryResult.columns" :key="col" class="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 whitespace-nowrap">
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in queryResult.rows" :key="i" class="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td v-for="col in queryResult.columns" :key="col" class="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[300px] truncate" :title="String(row[col] ?? '')">
                      <span v-if="row[col] === null" class="text-gray-400 italic">NULL</span>
                      <span v-else>{{ row[col] }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="px-4 py-8 text-center text-gray-400 text-sm">
                查询结果为空
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalRows > pageSize" class="flex items-center justify-between mt-3">
              <span class="text-xs text-gray-400">显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalRows) }} / 共 {{ totalRows }} 行</span>
              <div class="flex gap-1">
                <button @click="currentPage = 1" :disabled="currentPage === 1" class="btn-secondary btn-sm !px-2 !py-1 text-xs">首页</button>
                <button @click="currentPage--" :disabled="currentPage === 1" class="btn-secondary btn-sm !px-2 !py-1 text-xs">上一页</button>
                <button @click="currentPage++" :disabled="currentPage >= totalPages" class="btn-secondary btn-sm !px-2 !py-1 text-xs">下一页</button>
                <button @click="currentPage = totalPages" :disabled="currentPage >= totalPages" class="btn-secondary btn-sm !px-2 !py-1 text-xs">末页</button>
              </div>
            </div>
          </div>

          <!-- Table Schema -->
          <div v-if="schemaInfo" class="tool-card !p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">📝 表结构: {{ activeTable }}</h3>
              <button @click="schemaInfo = null" class="text-gray-400 hover:text-gray-600 text-sm">收起</button>
            </div>
            <div class="overflow-auto border border-gray-200 dark:border-slate-700 rounded-lg">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">字段名</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">类型</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">非空</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">默认值</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">主键</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="col in schemaInfo" :key="col.name" class="border-t border-gray-100 dark:border-slate-700/50">
                    <td class="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono">{{ col.name }}</td>
                    <td class="px-3 py-2 text-gray-500 dark:text-gray-400 font-mono">{{ col.type }}</td>
                    <td class="px-3 py-2">
                      <span :class="col.notnull ? 'text-red-500' : 'text-green-500'">{{ col.notnull ? '是' : '否' }}</span>
                    </td>
                    <td class="px-3 py-2 text-gray-500 dark:text-gray-400 font-mono">{{ col.dflt_value ?? '-' }}</td>
                    <td class="px-3 py-2">
                      <span v-if="col.pk" class="text-primary-500 font-bold">🔑</span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const dragOver = ref(false)
const loading = ref(false)
const error = ref('')
const db = ref(null)
const fileName = ref('')
const fileSize = ref(0)
const tables = ref([])
const activeTable = ref('')
const sqlQuery = ref('')
const queryResult = ref(null)
const queryError = ref('')
const schemaInfo = ref(null)
const currentPage = ref(1)
const pageSize = 100
const totalRows = ref(0)

const totalPages = computed(() => Math.ceil(totalRows.value / pageSize))

// Load sql.js lazily
let SQL = null

async function loadSqlJs() {
  if (SQL) return SQL
  const initSqlJs = (await import('sql.js')).default
  SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  })
  return SQL
}

async function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) await openFile(file)
}

async function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) await openFile(file)
  e.target.value = ''
}

async function openFile(file) {
  error.value = ''
  loading.value = true
  queryResult.value = null
  queryError.value = ''
  schemaInfo.value = null
  activeTable.value = ''
  sqlQuery.value = ''

  try {
    const SQLModule = await loadSqlJs()
    const buffer = await file.arrayBuffer()
    const database = new SQLModule.Database(new Uint8Array(buffer))
    
    db.value = database
    fileName.value = file.name
    fileSize.value = file.size

    // Get table list
    const result = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    const tableNames = result[0]?.values.map(v => v[0]) || []
    
    tables.value = tableNames.map(name => {
      const countResult = database.exec(`SELECT COUNT(*) FROM "${name}"`)
      const count = countResult[0]?.values[0]?.[0] ?? 0
      return { name, count }
    })

    show('数据库加载成功', 'success')
  } catch (e) {
    error.value = `加载失败: ${e.message}`
    show('数据库加载失败', 'error')
  } finally {
    loading.value = false
  }
}

function closeDb() {
  if (db.value) {
    db.value.close()
    db.value = null
  }
  tables.value = []
  activeTable.value = ''
  sqlQuery.value = ''
  queryResult.value = null
  queryError.value = ''
  schemaInfo.value = null
  fileName.value = ''
  fileSize.value = 0
  totalRows.value = 0
  currentPage.value = 1
}

async function selectTable(tableName) {
  activeTable.value = tableName
  currentPage.value = 1
  sqlQuery.value = `SELECT * FROM "${tableName}" LIMIT ${pageSize}`
  queryError.value = ''
  
  // Load schema
  try {
    const schemaResult = db.value.exec(`PRAGMA table_info("${tableName}")`)
    if (schemaResult[0]) {
      schemaInfo.value = schemaResult[0].values.map(row => ({
        cid: row[0],
        name: row[1],
        type: row[2],
        notnull: row[3],
        dflt_value: row[4],
        pk: row[5]
      }))
    }
  } catch {}

  // Get total row count
  try {
    const countResult = db.value.exec(`SELECT COUNT(*) FROM "${tableName}"`)
    totalRows.value = countResult[0]?.values[0]?.[0] ?? 0
  } catch {}

  runQuery()
}

function runQuery() {
  if (!db.value || !sqlQuery.value.trim()) return
  queryError.value = ''

  try {
    const result = db.value.exec(sqlQuery.value)
    if (result[0]) {
      const columns = result[0].columns
      const rows = result[0].values.map(v => {
        const obj = {}
        columns.forEach((col, i) => { obj[col] = v[i] })
        return obj
      })
      queryResult.value = { columns, rows }
    } else {
      queryResult.value = { columns: [], rows: [] }
    }
  } catch (e) {
    queryError.value = e.message
    queryResult.value = null
  }
}

// Pagination watcher
watch(currentPage, () => {
  if (!activeTable.value) return
  const offset = (currentPage.value - 1) * pageSize
  sqlQuery.value = `SELECT * FROM "${activeTable.value}" LIMIT ${pageSize} OFFSET ${offset}`
  runQuery()
})

function exportCSV() {
  if (!queryResult.value?.rows.length) return
  const { columns, rows } = queryResult.value
  const escape = v => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [columns.map(escape).join(','), ...rows.map(row => columns.map(c => escape(row[c])).join(','))].join('\n')
  downloadFile(csv, `${activeTable.value || 'query'}.csv`, 'text/csv')
  show('CSV 导出成功', 'success')
}

function exportJSON() {
  if (!queryResult.value?.rows.length) return
  const json = JSON.stringify(queryResult.value.rows, null, 2)
  downloadFile(json, `${activeTable.value || 'query'}.json`, 'application/json')
  show('JSON 导出成功', 'success')
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
