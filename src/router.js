import JsonTool from './views/JsonTool.vue'
import Base64Tool from './views/Base64Tool.vue'
import CodeFormatTool from './views/CodeFormatTool.vue'
import RegexTool from './views/RegexTool.vue'
import TimestampTool from './views/TimestampTool.vue'
import QrcodeTool from './views/QrcodeTool.vue'
import PasswordTool from './views/PasswordTool.vue'
import PostmanTool from './views/PostmanTool.vue'
import ImageTool from './views/ImageTool.vue'
import A11yTool from './views/A11yTool.vue'
import ColorConvertTool from './views/ColorConvertTool.vue'
import ColorPaletteTool from './views/ColorPaletteTool.vue'
import GradientTool from './views/GradientTool.vue'
import TraditionalColorsTool from './views/TraditionalColorsTool.vue'
import ZhConvertTool from './views/ZhConvertTool.vue'
import PinyinTool from './views/PinyinTool.vue'
import AmountTool from './views/AmountTool.vue'
import CaseConvertTool from './views/CaseConvertTool.vue'
import MarkdownTool from './views/MarkdownTool.vue'
import BaseConvertTool from './views/BaseConvertTool.vue'
import UuidTool from './views/UuidTool.vue'
import NginxTool from './views/NginxTool.vue'
import BgRemoverTool from './views/BgRemoverTool.vue'
import VideoGifTool from './views/VideoGifTool.vue'
import FileCompressTool from './views/FileCompressTool.vue'

export const routes = [
  { path: '/', redirect: '/json' },
  // 文本与代码
  { path: '/json', name: 'json', component: JsonTool, meta: { title: 'JSON 格式化', icon: '📐', group: 'text' } },
  { path: '/base64', name: 'base64', component: Base64Tool, meta: { title: 'Base64 编解码', icon: '🔐', group: 'text' } },
  { path: '/code-format', name: 'code-format', component: CodeFormatTool, meta: { title: '代码美化压缩', icon: '🎨', group: 'text' } },
  { path: '/regex', name: 'regex', component: RegexTool, meta: { title: '正则测试器', icon: '🔍', group: 'text' } },
  // 时间与数据
  { path: '/timestamp', name: 'timestamp', component: TimestampTool, meta: { title: '时间戳转换', icon: '🕐', group: 'time' } },
  { path: '/qrcode', name: 'qrcode', component: QrcodeTool, meta: { title: '二维码生成', icon: '📱', group: 'time' } },
  { path: '/password', name: 'password', component: PasswordTool, meta: { title: '密码生成器', icon: '🔑', group: 'time' } },
  // 颜色与视觉
  { path: '/color-convert', name: 'color-convert', component: ColorConvertTool, meta: { title: '颜色格式转换', icon: '🎨', group: 'color' } },
  { path: '/color-palette', name: 'color-palette', component: ColorPaletteTool, meta: { title: '配色方案生成', icon: '🎯', group: 'color' } },
  { path: '/gradient', name: 'gradient', component: GradientTool, meta: { title: '渐变生成器', icon: '🌈', group: 'color' } },
  { path: '/traditional-colors', name: 'traditional-colors', component: TraditionalColorsTool, meta: { title: '传统色彩库', icon: '🏮', group: 'color' } },
  // 文本与字符
  { path: '/zh-convert', name: 'zh-convert', component: ZhConvertTool, meta: { title: '繁简转换', icon: '字', group: 'char' } },
  { path: '/pinyin', name: 'pinyin', component: PinyinTool, meta: { title: '汉字转拼音', icon: '🔤', group: 'char' } },
  { path: '/amount', name: 'amount', component: AmountTool, meta: { title: '金额大写', icon: '💰', group: 'char' } },
  { path: '/case-convert', name: 'case-convert', component: CaseConvertTool, meta: { title: '大小写转换', icon: 'Aa', group: 'char' } },
  { path: '/markdown', name: 'markdown', component: MarkdownTool, meta: { title: 'Markdown排版', icon: '📝', group: 'char' } },
  // 开发者辅助
  { path: '/base-convert', name: 'base-convert', component: BaseConvertTool, meta: { title: '进制转换', icon: '🔢', group: 'dev' } },
  { path: '/uuid', name: 'uuid', component: UuidTool, meta: { title: 'UUID/随机数', icon: '🆔', group: 'dev' } },
  { path: '/nginx', name: 'nginx', component: NginxTool, meta: { title: 'Nginx配置', icon: '⚙️', group: 'dev' } },
  // 进阶与多媒体
  { path: '/postman', name: 'postman', component: PostmanTool, meta: { title: '接口调试', icon: '🚀', group: 'advanced' } },
  { path: '/image', name: 'image', component: ImageTool, meta: { title: '图片处理', icon: '🖼️', group: 'advanced' } },
  { path: '/a11y', name: 'a11y', component: A11yTool, meta: { title: '无障碍辅助', icon: '♿', group: 'advanced' } },
  { path: '/bg-remover', name: 'bg-remover', component: BgRemoverTool, meta: { title: '在线抠图', icon: '✂️', group: 'media' } },
  { path: '/video-gif', name: 'video-gif', component: VideoGifTool, meta: { title: '视频转GIF', icon: '🎬', group: 'media' } },
  { path: '/file-compress', name: 'file-compress', component: FileCompressTool, meta: { title: '文件压缩', icon: '📦', group: 'media' } },
]

export const toolGroups = {
  text: { label: '文本与代码', icon: '📝' },
  time: { label: '时间与数据', icon: '⏰' },
  color: { label: '颜色与视觉', icon: '🎨' },
  char: { label: '文本与字符', icon: '📖' },
  dev: { label: '开发者辅助', icon: '💻' },
  advanced: { label: '进阶工具', icon: '⚡' },
  media: { label: '多媒体处理', icon: '🎞️' },
}
