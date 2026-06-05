<template>
  <div class="space-y-4">
    <h2 class="tool-header">🏮 传统色彩库</h2>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        v-for="cat in categories" :key="cat.key"
        @click="activeCategory = cat.key"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeCategory === cat.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300']"
      >{{ cat.label }}</button>
    </div>

    <!-- Search -->
    <div class="flex gap-2">
      <input v-model="searchQuery" class="input-field" placeholder="搜索颜色名称..." />
    </div>

    <!-- Color grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      <div
        v-for="color in filteredColors"
        :key="color.name"
        class="group cursor-pointer rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-shadow"
        @click="copyColor(color)"
      >
        <div class="h-20 relative" :style="{ backgroundColor: color.hex }">
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
            <span class="text-white text-xs font-medium">点击复制</span>
          </div>
        </div>
        <div class="p-2 bg-white dark:bg-slate-800">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ color.name }}</p>
          <p class="text-xs font-mono text-gray-500">{{ color.hex }}</p>
          <p v-if="color.pinyin" class="text-[10px] text-gray-400 truncate">{{ color.pinyin }}</p>
        </div>
      </div>
    </div>

    <div v-if="filteredColors.length === 0" class="text-center text-gray-400 py-8">
      未找到匹配的颜色
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()
const activeCategory = ref('chinese')
const searchQuery = ref('')

const categories = [
  { key: 'chinese', label: '中国传统色' },
  { key: 'japanese', label: '日式传统色' },
]

const chineseColors = [
  { name: '赤', hex: '#C03F3C', pinyin: 'chì' },
  { name: '丹', hex: '#D64541', pinyin: 'dān' },
  { name: '朱砂', hex: '#FF461F', pinyin: 'zhū shā' },
  { name: '石榴红', hex: '#F20C00', pinyin: 'shí liú hóng' },
  { name: '胭脂', hex: '#C03F3C', pinyin: 'yān zhī' },
  { name: '绯红', hex: '#C83C23', pinyin: 'fēi hóng' },
  { name: '朱红', hex: '#ED5736', pinyin: 'zhū hóng' },
  { name: '嫣红', hex: '#EF7A82', pinyin: 'yān hóng' },
  { name: '橙', hex: '#FA8C35', pinyin: 'chéng' },
  { name: '橘黄', hex: '#FFA631', pinyin: 'jú huáng' },
  { name: '杏黄', hex: '#FFA400', pinyin: 'xìng huáng' },
  { name: '金黄', hex: '#EACD76', pinyin: 'jīn huáng' },
  { name: '鹅黄', hex: '#FFF143', pinyin: 'é huáng' },
  { name: '姜黄', hex: '#FFC773', pinyin: 'jiāng huáng' },
  { name: '缃色', hex: '#F0C239', pinyin: 'xiāng sè' },
  { name: '黄', hex: '#FFD400', pinyin: 'huáng' },
  { name: '茶色', hex: '#B35C44', pinyin: 'chá sè' },
  { name: '驼色', hex: '#A88462', pinyin: 'tuó sè' },
  { name: '秋香色', hex: '#D9B611', pinyin: 'qiū xiāng sè' },
  { name: '绿', hex: '#00BC12', pinyin: 'lǜ' },
  { name: '松花绿', hex: '#057748', pinyin: 'sōng huā lǜ' },
  { name: '松花色', hex: '#BCE672', pinyin: 'sōng huā sè' },
  { name: '豆绿', hex: '#9ED048', pinyin: 'dòu lǜ' },
  { name: '豆青', hex: '#96CE54', pinyin: 'dòu qīng' },
  { name: '石青', hex: '#7BCFA6', pinyin: 'shí qīng' },
  { name: '翡翠色', hex: '#3DE1AD', pinyin: 'fěi cuì sè' },
  { name: '青', hex: '#00E079', pinyin: 'qīng' },
  { name: '碧蓝', hex: '#3EEDE7', pinyin: 'bì lán' },
  { name: '蓝', hex: '#0EB83A', pinyin: 'lán' },
  { name: '靛蓝', hex: '#065279', pinyin: 'diàn lán' },
  { name: '群青', hex: '#4C8DAE', pinyin: 'qún qīng' },
  { name: '藏蓝', hex: '#3B2E7E', pinyin: 'zàng lán' },
  { name: '藏青', hex: '#2E4E7E', pinyin: 'zàng qīng' },
  { name: '紫', hex: '#8D4BBB', pinyin: 'zǐ' },
  { name: '紫酱', hex: '#815476', pinyin: 'zǐ jiàng' },
  { name: '酱紫', hex: '#815463', pinyin: 'jiàng zǐ' },
  { name: '雪青', hex: '#B0A4E3', pinyin: 'xuě qīng' },
  { name: '藕色', hex: '#EDD1D8', pinyin: 'ǒu sè' },
  { name: '藕荷', hex: '#E4C6D0', pinyin: 'ǒu hé' },
  { name: '墨', hex: '#50616D', pinyin: 'mò' },
  { name: '玄色', hex: '#622A1D', pinyin: 'xuán sè' },
  { name: '乌黑', hex: '#725F6B', pinyin: 'wū hēi' },
  { name: '漆黑', hex: '#161823', pinyin: 'qī hēi' },
  { name: '黛', hex: '#4A4266', pinyin: 'dài' },
  { name: '素', hex: '#E0F0E9', pinyin: 'sù' },
  { name: '月白', hex: '#D6ECF0', pinyin: 'yuè bái' },
  { name: '象牙白', hex: '#FFFBF0', pinyin: 'xiàng yá bái' },
  { name: '缟', hex: '#F2ECDE', pinyin: 'gǎo' },
]

const japaneseColors = [
  { name: '桜色', hex: '#FEDFE1', pinyin: 'Sakura-iro' },
  { name: '撫子色', hex: '#EEBBCB', pinyin: 'Nadeshiko-iro' },
  { name: '薔薇色', hex: '#E95464', pinyin: 'Bara-iro' },
  { name: '紅色', hex: '#A22041', pinyin: 'Kurenai-iro' },
  { name: '茜色', hex: '#B5491B', pinyin: 'Akane-iro' },
  { name: '朱色', hex: '#EB6101', pinyin: 'Shu-iro' },
  { name: '橙色', hex: '#EE8B21', pinyin: 'Daidai-iro' },
  { name: '蜜柑色', hex: '#F5A623', pinyin: 'Mikan-iro' },
  { name: '金茶色', hex: '#C9944A', pinyin: 'Kincha-iro' },
  { name: '山吹色', hex: '#FFBF00', pinyin: 'Yamabuki-iro' },
  { name: '鶯色', hex: '#9C8A5A', pinyin: 'Uguisu-iro' },
  { name: '抹茶色', hex: '#B4C49A', pinyin: 'Matcha-iro' },
  { name: '若竹色', hex: '#5D8C46', pinyin: 'Wakatake-iro' },
  { name: '萌葱色', hex: '#006847', pinyin: 'Moegi-iro' },
  { name: '深緑色', hex: '#00543A', pinyin: 'Fukamidori-iro' },
  { name: '青竹色', hex: '#6A8D73', pinyin: 'Aodake-iro' },
  { name: '浅葱色', hex: '#66BAD5', pinyin: 'Asagi-iro' },
  { name: '瑠璃色', hex: '#1C2A6E', pinyin: 'Ruri-iro' },
  { name: '紺色', hex: '#192F60', pinyin: 'Kon-iro' },
  { name: '藤色', hex: '#8B81C3', pinyin: 'Fuji-iro' },
  { name: '桔梗色', hex: '#6A3FA0', pinyin: 'Kikyo-iro' },
  { name: '鳩羽色', hex: '#8E6D8B', pinyin: 'Hatoiba-iro' },
  { name: '江戸紫', hex: '#7B3D6E', pinyin: 'Edo-murasaki' },
  { name: '白磁', hex: '#F5F5F2', pinyin: 'Hakuji' },
  { name: '生成色', hex: '#E8E3D8', pinyin: 'Kinari-iro' },
  { name: '利休白茶', hex: '#BDBA8F', pinyin: 'Rikyu-shiracha' },
  { name: '枯色', hex: '#9C7B5A', pinyin: 'Kare-iro' },
  { name: '煤色', hex: '#4A4A48', pinyin: 'Susui-iro' },
  { name: '墨色', hex: '#1C1C1C', pinyin: 'Sumi-iro' },
  { name: '漆黒', hex: '#0A0A0A', pinyin: 'Shikkoku' },
]

const allColors = computed(() => {
  return activeCategory.value === 'chinese' ? chineseColors : japaneseColors
})

const filteredColors = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return allColors.value
  return allColors.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.hex.toLowerCase().includes(q) ||
    (c.pinyin && c.pinyin.toLowerCase().includes(q))
  )
})

function copyColor(color) {
  navigator.clipboard.writeText(color.hex)
  show(`已复制 ${color.name} (${color.hex})`, 'success')
}
</script>
