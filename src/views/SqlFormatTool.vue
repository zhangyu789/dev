<template>
  <div class="space-y-4">
    <h2 class="tool-header">🗃️ SQL 格式化</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入 SQL</label>
          <div class="flex gap-2">
            <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
            <button @click="format" class="btn-primary btn-sm">格式化 →</button>
            <button @click="compress" class="btn-secondary btn-sm">压缩 →</button>
          </div>
        </div>
        <textarea v-model="input" class="textarea-field h-80" placeholder="输入 SQL 语句，如：SELECT * FROM users WHERE id = 1 AND name = 'hello'"></textarea>
      </div>

      <!-- Output -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">格式化结果</label>
          <CopyButton :text="output" />
        </div>
        <textarea v-model="output" class="textarea-field h-80" readonly></textarea>
      </div>
    </div>

    <!-- Options -->
    <div class="tool-card">
      <div class="flex flex-wrap items-center gap-4">
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">缩进</label>
        <select v-model="indentType" class="input-field w-32 text-sm">
          <option value="2">2 空格</option>
          <option value="4">4 空格</option>
          <option value="tab">Tab</option>
        </select>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="uppercaseKeywords" class="w-4 h-4 rounded text-primary-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">关键字大写</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="trimWhitespace" class="w-4 h-4 rounded text-primary-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">去除多余空白</span>
        </label>
      </div>
    </div>

    <!-- Presets -->
    <div class="tool-card">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">示例 SQL</h3>
      <div class="flex flex-wrap gap-2">
        <button v-for="preset in presets" :key="preset.label"
          @click="input = preset.sql; format()"
          class="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
        >{{ preset.label }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')
const indentType = ref('2')
const uppercaseKeywords = ref(true)
const trimWhitespace = ref(true)

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'NOT IN', 'EXISTS',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
  'ALTER', 'DROP', 'INDEX', 'VIEW', 'JOIN', 'INNER JOIN', 'LEFT JOIN',
  'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'AS', 'IS', 'IS NOT',
  'NULL', 'LIKE', 'BETWEEN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
  'OFFSET', 'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'DISTINCT',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'WITH',
  'RECURSIVE', 'OVER', 'PARTITION BY', 'WINDOW', 'FETCH', 'NEXT', 'ROWS',
  'ONLY', 'TOP', 'IF', 'BEGIN', 'COMMIT', 'ROLLBACK', 'GRANT', 'REVOKE',
  'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'CONSTRAINT', 'DEFAULT',
  'CHECK', 'UNIQUE', 'AUTO_INCREMENT', 'SERIAL', 'RETURNING',
]

// Sort by length descending so longer keywords match first
const sortedKeywords = [...KEYWORDS].sort((a, b) => b.length - a.length)

function getIndent(level) {
  const type = indentType.value
  const unit = type === 'tab' ? '\t' : ' '.repeat(parseInt(type))
  return unit.repeat(level)
}

function tokenize(sql) {
  const tokens = []
  let i = 0
  while (i < sql.length) {
    // Whitespace
    if (/\s/.test(sql[i])) {
      let j = i
      while (j < sql.length && /\s/.test(sql[j])) j++
      tokens.push({ type: 'ws', value: sql.slice(i, j) })
      i = j
      continue
    }
    // String literal
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i]
      let j = i + 1
      while (j < sql.length) {
        if (sql[j] === quote && sql[j + 1] === quote) { j += 2; continue }
        if (sql[j] === quote) break
        j++
      }
      tokens.push({ type: 'string', value: sql.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Number
    if (/[0-9]/.test(sql[i])) {
      let j = i
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++
      tokens.push({ type: 'number', value: sql.slice(i, j) })
      i = j
      continue
    }
    // Punctuation
    if ('(),.;'.includes(sql[i])) {
      tokens.push({ type: 'punct', value: sql[i] })
      i++
      continue
    }
    // Operators
    if ('<>=!'.includes(sql[i])) {
      let j = i
      while (j < sql.length && '<>=!'.includes(sql[j])) j++
      tokens.push({ type: 'op', value: sql.slice(i, j) })
      i = j
      continue
    }
    if (sql[i] === '*' || sql[i] === '+' || sql[i] === '/' || sql[i] === '%') {
      tokens.push({ type: 'op', value: sql[i] })
      i++
      continue
    }
    // Word (identifier or keyword)
    if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++
      const word = sql.slice(i, j)
      const upper = word.toUpperCase()
      const isKeyword = sortedKeywords.some(kw => kw === upper)
      tokens.push({ type: isKeyword ? 'keyword' : 'word', value: word })
      i = j
      continue
    }
    // Other
    tokens.push({ type: 'other', value: sql[i] })
    i++
  }
  return tokens
}

function processKeywords(tokens) {
  // Merge multi-word keywords (e.g., "GROUP BY", "LEFT JOIN")
  const result = []
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'keyword') {
      let merged = tokens[i].value
      let j = i + 1
      // Check for following whitespace + keyword that forms a multi-word keyword
      while (j < tokens.length) {
        if (tokens[j].type === 'ws' && j + 1 < tokens.length && tokens[j + 1].type === 'keyword') {
          const candidate = (merged + ' ' + tokens[j + 1].value).toUpperCase()
          if (sortedKeywords.includes(candidate)) {
            merged += ' ' + tokens[j + 1].value
            j += 2
            continue
          }
        }
        break
      }
      result.push({ type: 'keyword', value: uppercaseKeywords.value ? merged.toUpperCase() : merged })
      i = j - 1
    } else if (tokens[i].type === 'word' && uppercaseKeywords.value) {
      // Don't uppercase identifiers
      result.push(tokens[i])
    } else {
      result.push(tokens[i])
    }
  }
  return result
}

function format() {
  let sql = input.value
  if (trimWhitespace.value) {
    sql = sql.replace(/\s+/g, ' ').trim()
  }
  const tokens = processKeywords(tokenize(sql))

  // Major keywords that cause a new line + indent
  const newLineKeywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'INNER JOIN', 'LEFT JOIN',
    'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'SET', 'VALUES', 'GROUP BY',
    'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO',
    'INTO', 'WHEN', 'ELSE', 'END', 'CASE',
  ])

  const indentKeywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'SET', 'VALUES', 'GROUP BY', 'ORDER BY', 'HAVING',
    'LIMIT', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
  ])

  const outdentKeywords = new Set([
    'AND', 'OR',
  ])

  let level = 0
  let lines = []
  let currentLine = ''

  function pushLine() {
    if (currentLine.trim()) {
      lines.push(currentLine)
    }
    currentLine = ''
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'ws') continue

    if (token.type === 'keyword' && newLineKeywords.has(token.value.toUpperCase())) {
      pushLine()
      if (outdentKeywords.has(token.value.toUpperCase())) {
        currentLine = getIndent(level) + token.value
      } else {
        currentLine = getIndent(level) + token.value
      }
    } else if (token.type === 'punct' && token.value === '(') {
      currentLine += token.value
      level++
    } else if (token.type === 'punct' && token.value === ')') {
      level = Math.max(0, level - 1)
      currentLine += token.value
    } else if (token.type === 'punct' && token.value === ',') {
      currentLine += token.value
      pushLine()
      currentLine = getIndent(level) + getIndent(1).trimStart()
    } else {
      currentLine += (currentLine && !currentLine.endsWith('(') && !currentLine.endsWith('.') ? ' ' : '') + token.value
    }
  }
  pushLine()

  output.value = lines.join('\n')
}

function compress() {
  let sql = input.value
  // Collapse all whitespace
  sql = sql.replace(/\s+/g, ' ').trim()
  // Remove spaces around certain punctuation
  sql = sql.replace(/\s*\(\s*/g, '(')
  sql = sql.replace(/\s*\)\s*/g, ')')
  sql = sql.replace(/\s*,\s*/g, ', ')
  sql = sql.replace(/\s*=\s*/g, '=')
  const tokens = processKeywords(tokenize(sql))
  output.value = tokens.filter(t => t.type !== 'ws').map(t => t.value).join(' ')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*=\s*/g, ' = ')
    .replace(/\s*<\s*/g, ' < ')
    .replace(/\s*>\s*/g, ' > ')
    .replace(/\s*<=\s*/g, ' <= ')
    .replace(/\s*>=\s*/g, ' >= ')
    .replace(/\s*!=\s*/g, ' != ')
    .replace(/\s*<>\s*/g, ' <> ')
    .trim()
}

const presets = [
  {
    label: 'SELECT 查询',
    sql: "SELECT u.id, u.name, u.email, o.order_id, o.total FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.total > 100 GROUP BY u.id, u.name, u.email ORDER BY o.total DESC LIMIT 10",
  },
  {
    label: 'INSERT 语句',
    sql: "INSERT INTO users (name, email, age, status) VALUES ('张三', 'zhangsan@example.com', 28, 'active')",
  },
  {
    label: 'UPDATE 语句',
    sql: "UPDATE users SET name = '李四', email = 'lisi@example.com', updated_at = NOW() WHERE id = 1 AND status = 'active'",
  },
  {
    label: '子查询',
    sql: "SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products WHERE category = 'electronics') AND stock > 0 ORDER BY price ASC",
  },
]
</script>
