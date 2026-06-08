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
import UrlTool from './views/UrlTool.vue'
import HashTool from './views/HashTool.vue'
import JwtTool from './views/JwtTool.vue'
import DiffTool from './views/DiffTool.vue'
import CronTool from './views/CronTool.vue'
import HtmlEntityTool from './views/HtmlEntityTool.vue'
import SqliteTool from './views/SqliteTool.vue'
import SqlFormatTool from './views/SqlFormatTool.vue'
import CssShadowTool from './views/CssShadowTool.vue'
import CssRadiusTool from './views/CssRadiusTool.vue'
import CssAnimationTool from './views/CssAnimationTool.vue'
import TextStatsTool from './views/TextStatsTool.vue'
import FullwidthTool from './views/FullwidthTool.vue'
import DateCalcTool from './views/DateCalcTool.vue'
import CountdownTool from './views/CountdownTool.vue'
import NumChineseTool from './views/NumChineseTool.vue'
import CssFlexTool from './views/CssFlexTool.vue'
import TextSortTool from './views/TextSortTool.vue'
import CsvJsonTool from './views/CsvJsonTool.vue'
import IpCalcTool from './views/IpCalcTool.vue'
import BarcodeTool from './views/BarcodeTool.vue'
import HttpStatusTool from './views/HttpStatusTool.vue'
import KeyCodeTool from './views/KeyCodeTool.vue'
import EncryptTool from './views/EncryptTool.vue'
import SvgTool from './views/SvgTool.vue'
import CssUnitTool from './views/CssUnitTool.vue'
import CodeShotTool from './views/CodeShotTool.vue'
import GitCheatTool from './views/GitCheatTool.vue'
import ImgConvertTool from './views/ImgConvertTool.vue'
import MorseTool from './views/MorseTool.vue'
import RandomTool from './views/RandomTool.vue'

export const routes = [
  { path: '/', redirect: '/json' },
  // 文本与代码
  { path: '/json', name: 'json', component: JsonTool, meta: { title: 'JSON 格式化', icon: '📐', group: 'text' } },
  { path: '/base64', name: 'base64', component: Base64Tool, meta: { title: 'Base64 编解码', icon: '🔐', group: 'text' } },
  { path: '/code-format', name: 'code-format', component: CodeFormatTool, meta: { title: '代码美化压缩', icon: '🎨', group: 'text' } },
  { path: '/regex', name: 'regex', component: RegexTool, meta: { title: '正则测试器', icon: '🔍', group: 'text' } },
  { path: '/url', name: 'url', component: UrlTool, meta: { title: 'URL编解码', icon: '🔗', group: 'text' } },
  { path: '/html-entity', name: 'html-entity', component: HtmlEntityTool, meta: { title: 'HTML实体编解码', icon: '📄', group: 'text' } },
  { path: '/sql-format', name: 'sql-format', component: SqlFormatTool, meta: { title: 'SQL格式化', icon: '🗃️', group: 'text' } },
  { path: '/csv-json', name: 'csv-json', component: CsvJsonTool, meta: { title: 'CSV/JSON互转', icon: '📊', group: 'text' } },
  // 时间与数据
  { path: '/timestamp', name: 'timestamp', component: TimestampTool, meta: { title: '时间戳转换', icon: '🕐', group: 'time' } },
  { path: '/qrcode', name: 'qrcode', component: QrcodeTool, meta: { title: '二维码生成', icon: '📱', group: 'time' } },
  { path: '/password', name: 'password', component: PasswordTool, meta: { title: '密码生成器', icon: '🔑', group: 'time' } },
  { path: '/date-calc', name: 'date-calc', component: DateCalcTool, meta: { title: '日期计算器', icon: '📅', group: 'time' } },
  { path: '/countdown', name: 'countdown', component: CountdownTool, meta: { title: '倒计时工具', icon: '⏳', group: 'time' } },
  { path: '/barcode', name: 'barcode', component: BarcodeTool, meta: { title: '条形码生成', icon: '🏷️', group: 'time' } },
  { path: '/random', name: 'random', component: RandomTool, meta: { title: '随机决策器', icon: '🎲', group: 'time' } },
  // 颜色与视觉
  { path: '/color-convert', name: 'color-convert', component: ColorConvertTool, meta: { title: '颜色格式转换', icon: '🎨', group: 'color' } },
  { path: '/color-palette', name: 'color-palette', component: ColorPaletteTool, meta: { title: '配色方案生成', icon: '🎯', group: 'color' } },
  { path: '/gradient', name: 'gradient', component: GradientTool, meta: { title: '渐变生成器', icon: '🌈', group: 'color' } },
  { path: '/traditional-colors', name: 'traditional-colors', component: TraditionalColorsTool, meta: { title: '传统色彩库', icon: '🏮', group: 'color' } },
  { path: '/css-shadow', name: 'css-shadow', component: CssShadowTool, meta: { title: 'CSS阴影生成器', icon: '🖼️', group: 'color' } },
  { path: '/css-radius', name: 'css-radius', component: CssRadiusTool, meta: { title: 'CSS圆角生成器', icon: '⬜', group: 'color' } },
  { path: '/css-animation', name: 'css-animation', component: CssAnimationTool, meta: { title: 'CSS动画生成器', icon: '🎭', group: 'color' } },
  { path: '/css-flex', name: 'css-flex', component: CssFlexTool, meta: { title: 'CSS Flexbox生成器', icon: '🧩', group: 'color' } },
  { path: '/css-unit', name: 'css-unit', component: CssUnitTool, meta: { title: 'CSS单位转换', icon: '📐', group: 'color' } },
  // 文本与字符
  { path: '/zh-convert', name: 'zh-convert', component: ZhConvertTool, meta: { title: '繁简转换', icon: '字', group: 'char' } },
  { path: '/pinyin', name: 'pinyin', component: PinyinTool, meta: { title: '汉字转拼音', icon: '🔤', group: 'char' } },
  { path: '/amount', name: 'amount', component: AmountTool, meta: { title: '金额大写', icon: '💰', group: 'char' } },
  { path: '/case-convert', name: 'case-convert', component: CaseConvertTool, meta: { title: '大小写转换', icon: 'Aa', group: 'char' } },
  { path: '/markdown', name: 'markdown', component: MarkdownTool, meta: { title: 'Markdown排版', icon: '📝', group: 'char' } },
  { path: '/text-stats', name: 'text-stats', component: TextStatsTool, meta: { title: '文本字数统计', icon: '📏', group: 'char' } },
  { path: '/fullwidth', name: 'fullwidth', component: FullwidthTool, meta: { title: '全角/半角转换', icon: '🔄', group: 'char' } },
  { path: '/num-chinese', name: 'num-chinese', component: NumChineseTool, meta: { title: '数字大小写转换', icon: '🔢', group: 'char' } },
  { path: '/text-sort', name: 'text-sort', component: TextSortTool, meta: { title: '文本去重排序', icon: '📑', group: 'char' } },
  { path: '/morse', name: 'morse', component: MorseTool, meta: { title: '摩尔斯电码', icon: '📡', group: 'char' } },
  // 开发者辅助
  { path: '/base-convert', name: 'base-convert', component: BaseConvertTool, meta: { title: '进制转换', icon: '🔢', group: 'dev' } },
  { path: '/uuid', name: 'uuid', component: UuidTool, meta: { title: 'UUID/随机数', icon: '🆔', group: 'dev' } },
  { path: '/nginx', name: 'nginx', component: NginxTool, meta: { title: 'Nginx配置', icon: '⚙️', group: 'dev' } },
  { path: '/hash', name: 'hash', component: HashTool, meta: { title: 'Hash计算', icon: '🧮', group: 'dev' } },
  { path: '/jwt', name: 'jwt', component: JwtTool, meta: { title: 'JWT解码', icon: '🔑', group: 'dev' } },
  { path: '/diff', name: 'diff', component: DiffTool, meta: { title: '文本差异对比', icon: '📊', group: 'dev' } },
  { path: '/cron', name: 'cron', component: CronTool, meta: { title: 'Cron表达式', icon: '⏱️', group: 'dev' } },
  { path: '/ip-calc', name: 'ip-calc', component: IpCalcTool, meta: { title: 'IP子网计算器', icon: '🌐', group: 'dev' } },
  { path: '/http-status', name: 'http-status', component: HttpStatusTool, meta: { title: 'HTTP状态码速查', icon: '📋', group: 'dev' } },
  { path: '/key-code', name: 'key-code', component: KeyCodeTool, meta: { title: '键盘键码查询', icon: '⌨️', group: 'dev' } },
  { path: '/encrypt', name: 'encrypt', component: EncryptTool, meta: { title: '文本加密解密', icon: '🔒', group: 'dev' } },
  { path: '/git-cheat', name: 'git-cheat', component: GitCheatTool, meta: { title: 'Git命令速查', icon: '📦', group: 'dev' } },
  // 进阶与多媒体
  { path: '/postman', name: 'postman', component: PostmanTool, meta: { title: '接口调试', icon: '🚀', group: 'advanced' } },
  { path: '/image', name: 'image', component: ImageTool, meta: { title: '图片处理', icon: '🖼️', group: 'advanced' } },
  { path: '/a11y', name: 'a11y', component: A11yTool, meta: { title: '无障碍辅助', icon: '♿', group: 'advanced' } },
  { path: '/svg', name: 'svg', component: SvgTool, meta: { title: 'SVG预览编辑', icon: '🖼️', group: 'advanced' } },
  { path: '/code-shot', name: 'code-shot', component: CodeShotTool, meta: { title: '代码截图', icon: '📸', group: 'advanced' } },
  { path: '/bg-remover', name: 'bg-remover', component: BgRemoverTool, meta: { title: '在线抠图', icon: '✂️', group: 'media' } },
  { path: '/video-gif', name: 'video-gif', component: VideoGifTool, meta: { title: '视频转GIF', icon: '🎬', group: 'media' } },
  { path: '/file-compress', name: 'file-compress', component: FileCompressTool, meta: { title: '文件压缩', icon: '📦', group: 'media' } },
  { path: '/img-convert', name: 'img-convert', component: ImgConvertTool, meta: { title: '图片格式转换', icon: '🔄', group: 'media' } },
  { path: '/sqlite', name: 'sqlite', component: SqliteTool, meta: { title: 'SQLite查看', icon: '🗄️', group: 'dev' } },
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
