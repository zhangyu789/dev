<template>
  <div class="space-y-4">
    <h2 class="tool-header">⚙️ Nginx 配置生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Options -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">配置选项</h3>

        <!-- Server -->
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">监听端口</label>
          <input v-model.number="config.port" type="number" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">域名</label>
          <input v-model="config.domain" class="input-field" placeholder="example.com" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">根目录</label>
          <input v-model="config.root" class="input-field font-mono" placeholder="/var/www/html" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">默认首页</label>
          <input v-model="config.index" class="input-field" placeholder="index.html index.htm" />
        </div>

        <!-- Features -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">功能选项</label>
          <label v-for="opt in options" :key="opt.key" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="config[opt.key]" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
          </label>
        </div>

        <!-- Reverse proxy -->
        <div v-if="config.proxy" class="space-y-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">反向代理地址</label>
          <input v-model="config.proxyPass" class="input-field font-mono" placeholder="http://127.0.0.1:3000" />
        </div>

        <!-- SSL -->
        <div v-if="config.ssl" class="space-y-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">SSL 证书路径</label>
          <input v-model="config.sslCert" class="input-field font-mono" placeholder="/etc/nginx/ssl/cert.pem" />
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">SSL 密钥路径</label>
          <input v-model="config.sslKey" class="input-field font-mono" placeholder="/etc/nginx/ssl/key.pem" />
        </div>
      </div>

      <!-- Output -->
      <div class="tool-card space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">生成配置</h3>
          <CopyButton :text="nginxConfig" />
        </div>
        <pre class="textarea-field h-[500px] overflow-auto text-xs">{{ nginxConfig }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const options = [
  { key: 'ssl', label: '启用 HTTPS (SSL)' },
  { key: 'gzip', label: '启用 Gzip 压缩' },
  { key: 'proxy', label: '反向代理模式' },
  { key: 'spa', label: 'SPA 单页应用 (history 路由)' },
  { key: 'cors', label: '允许 CORS 跨域' },
  { key: 'cache', label: '静态资源缓存' },
  { key: 'security', label: '安全头部' },
  { key: 'accessLog', label: '访问日志' },
  { key: 'blockDotFiles', label: '禁止访问隐藏文件' },
]

const config = reactive({
  port: 80,
  domain: 'example.com',
  root: '/var/www/html',
  index: 'index.html index.htm',
  ssl: false,
  gzip: true,
  proxy: false,
  proxyPass: 'http://127.0.0.1:3000',
  spa: false,
  cors: false,
  cache: true,
  security: true,
  accessLog: true,
  blockDotFiles: true,
  sslCert: '/etc/nginx/ssl/cert.pem',
  sslKey: '/etc/nginx/ssl/key.pem',
})

const nginxConfig = computed(() => {
  const lines = []
  const listenPort = config.ssl ? 443 : config.port
  
  // Server block
  lines.push('server {')
  lines.push(`    listen ${listenPort}${config.ssl ? ' ssl' : ''};`)
  lines.push(`    server_name ${config.domain};`)
  lines.push('')
  
  // SSL
  if (config.ssl) {
    lines.push('    # SSL Configuration')
    lines.push(`    ssl_certificate ${config.sslCert};`)
    lines.push(`    ssl_certificate_key ${config.sslKey};`)
    lines.push('    ssl_protocols TLSv1.2 TLSv1.3;')
    lines.push('    ssl_ciphers HIGH:!aNULL:!MD5;')
    lines.push('    ssl_prefer_server_ciphers on;')
    lines.push('')
  }
  
  // Access log
  if (config.accessLog) {
    lines.push(`    access_log /var/log/nginx/${config.domain}.access.log;`)
    lines.push(`    error_log /var/log/nginx/${config.domain}.error.log;`)
    lines.push('')
  }
  
  // Root & Index
  if (!config.proxy) {
    lines.push(`    root ${config.root};`)
    lines.push(`    index ${config.index};`)
    lines.push('')
  }
  
  // Gzip
  if (config.gzip) {
    lines.push('    # Gzip Compression')
    lines.push('    gzip on;')
    lines.push('    gzip_vary on;')
    lines.push('    gzip_min_length 1024;')
    lines.push('    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;')
    lines.push('')
  }
  
  // Security headers
  if (config.security) {
    lines.push('    # Security Headers')
    lines.push('    add_header X-Frame-Options "SAMEORIGIN" always;')
    lines.push('    add_header X-Content-Type-Options "nosniff" always;')
    lines.push('    add_header X-XSS-Protection "1; mode=block" always;')
    lines.push('    add_header Referrer-Policy "strict-origin-when-cross-origin" always;')
    lines.push('')
  }
  
  // CORS
  if (config.cors) {
    lines.push('    # CORS')
    lines.push('    add_header Access-Control-Allow-Origin "*";')
    lines.push('    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";')
    lines.push('    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization";')
    lines.push('')
  }
  
  // Block dot files
  if (config.blockDotFiles) {
    lines.push('    # Block dot files')
    lines.push('    location ~ /\\. {')
    lines.push('        deny all;')
    lines.push('    }')
    lines.push('')
  }
  
  // Reverse proxy
  if (config.proxy) {
    lines.push('    # Reverse Proxy')
    lines.push(`    location / {`)
    lines.push(`        proxy_pass ${config.proxyPass};`)
    lines.push('        proxy_set_header Host $host;')
    lines.push('        proxy_set_header X-Real-IP $remote_addr;')
    lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;')
    lines.push('        proxy_set_header X-Forwarded-Proto $scheme;')
    lines.push('        proxy_http_version 1.1;')
    lines.push('        proxy_set_header Upgrade $http_upgrade;')
    lines.push('        proxy_set_header Connection "upgrade";')
    lines.push('    }')
    lines.push('')
  } else {
    // SPA or static
    lines.push('    location / {')
    if (config.spa) {
      lines.push('        try_files $uri $uri/ /index.html;')
    } else {
      lines.push('        try_files $uri $uri/ =404;')
    }
    lines.push('    }')
    lines.push('')
  }
  
  // Static cache
  if (config.cache && !config.proxy) {
    lines.push('    # Static file cache')
    lines.push('    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {')
    lines.push('        expires 30d;')
    lines.push('        add_header Cache-Control "public, immutable";')
    lines.push('    }')
    lines.push('')
  }
  
  lines.push('}')
  
  // HTTP redirect if SSL
  if (config.ssl) {
    lines.push('')
    lines.push('# HTTP to HTTPS redirect')
    lines.push('server {')
    lines.push(`    listen 80;`)
    lines.push(`    server_name ${config.domain};`)
    lines.push(`    return 301 https://$host$request_uri;`)
    lines.push('}')
  }
  
  return lines.join('\n')
})
</script>
