<template>
  <div class="marble-game-container">
    <!-- 顶部数据看板区 -->
    <div class="game-header">
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">总积分</span>
          <div class="stat-value">{{ totalScore }}</div>
        </div>
        <div class="stat-item">
          <span class="stat-label">总珠子</span>
          <div class="stat-value">{{ totalBalls }}</div>
        </div>
        <div class="stat-item">
          <span class="stat-label">奖励珠子</span>
          <div class="stat-value">{{ rewardBalls }}</div>
        </div>
        <div class="stat-item">
          <span class="stat-label">奖励积分</span>
          <div class="stat-value">{{ rewardScore }}</div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="header-buttons">
        <button class="btn-icon" @click="showLeaderboard">
          <span class="icon">🏆</span>
          <span class="btn-text">排行榜</span>
        </button>
        <button class="btn-icon" @click="showGameCircle">
          <span class="icon">🎮</span>
          <span class="btn-text">游戏圈</span>
        </button>
        <button class="btn-icon" @click="addFreeBalls">
          <span class="icon">⚽</span>
          <span class="btn-text">免费加珠</span>
        </button>
        <button class="btn-icon" @click="showSettings">
          <span class="icon">⚙️</span>
          <span class="btn-text">设置</span>
        </button>
      </div>
    </div>

    <!-- 中部核心游戏场景区 -->
    <div class="game-area">
      <canvas ref="gameCanvas" class="game-canvas" width="400" height="380"></canvas>
      
      <!-- 游戏状态覆盖层 -->
      <div v-if="gameOverlay.show" class="game-overlay">
        <div class="overlay-content">
          <div class="overlay-icon">{{ gameOverlay.icon }}</div>
          <div class="overlay-title">{{ gameOverlay.title }}</div>
          <div class="overlay-message">{{ gameOverlay.message }}</div>
          <div v-if="gameOverlay.showButton" class="overlay-button" @click="resetGame">再来一局</div>
        </div>
      </div>
    </div>

    <!-- 底部操作控制区 -->
    <div class="game-controls">
      <div class="ball-display">
        <div class="ball-preview">
          <div class="preview-ball"></div>
          <span class="ball-count">{{ betCount }}</span>
        </div>
        <div class="add-hint">长按快速加珠</div>
      </div>
      
      <button 
        class="btn-primary-large btn-bet" 
        :disabled="betCount >= maxBet || totalBalls <= 0 || gameState !== 'ready'"
        @click="addBet"
        @mousedown="startHoldAdd"
        @mouseup="stopHoldAdd"
        @mouseleave="stopHoldAdd"
        @touchstart.prevent="startHoldAdd"
        @touchend="stopHoldAdd"
      >
        <span class="btn-content">投珠</span>
      </button>
      
      <button 
        class="btn-primary-large btn-start" 
        :disabled="betCount <= 0 || gameState !== 'ready'"
        @click="startGame"
      >
        <span class="btn-content">开始</span>
      </button>

      <!-- 右侧弹珠发射器（拉杆+弹簧） -->
      <div 
        class="launch-button" 
        :class="{ active: gameState === 'readyToLaunch' }"
      >
        <div class="launch-base" @mousedown="startPlunger" @touchstart.prevent="startPlunger">
          <div class="launch-spring" :class="{ compressed: isPlungerPulled }"></div>
          <div class="launch-lever" :class="{ pulled: isPlungerPulled }"></div>
        </div>
      </div>
    </div>

    <!-- 底部倍率显示（12个通道） -->
    <div class="multiplier-display">
      <div 
        v-for="(multiplier, index) in slotMultipliers" 
        :key="index" 
        class="slot-item"
        :class="{ 
          active: multiplier !== 'x0' && gameState !== 'ready',
          'x2': multiplier === 'x2',
          'x4': multiplier === 'x4',
          'x6': multiplier === 'x6',
          'x8': multiplier === 'x8',
          'x10': multiplier === 'x10'
        }"
      >
        <span class="slot-light"></span>
        <span class="slot-mult">{{ multiplier }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 当前局倍率（每局锁定一个）
const currentMultiplier = ref(1)

// 游戏状态
const gameState = ref('ready') // ready, betting, locked, readyToLaunch, launching, playing, ended
const totalScore = ref(1000)
const totalBalls = ref(100)
const rewardBalls = ref(0)
const rewardScore = ref(0)
const progress = ref(30)
const betCount = ref(0)
const maxBet = 99
const isPlungerPulled = ref(false)
const plungerPower = ref(0)

// 底部通道倍率（12个通道）
const slotMultipliers = ref(['x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0'])

// 游戏覆盖层
const gameOverlay = ref({
  show: false,
  icon: '',
  title: '',
  message: '',
  showButton: false
})

// Canvas相关
const gameCanvas = ref(null)
let ctx = null
let animationId = null
let canvasWidth = 0
let canvasHeight = 0

// 游戏常量
const CHANNEL_WIDTH = 35 // 发射通道宽度
const GATE_WIDTH = 20 // 闸门宽度
let channelWidth = CHANNEL_WIDTH // 可变的通道宽度（在initGame中初始化）
let gateWidth = GATE_WIDTH // 可变的闸门宽度（在initGame中初始化）

// 物理引擎相关
let balls = []
let pegs = []
let slots = []
let dividers = [] // 挡板数组
let mainBall = null // 始终存在的银色弹珠
let plungerVelocity = 0

// 小球状态
let ballState = 'waiting' // waiting: 等待区域, launching: 发射区域, flying: 飞行中

// 闸门状态
let gateOpen = false // 闸门是否打开
let gateY = 0 // 闸门当前Y位置

// 跑马灯效果
let marqueeIndex = 0
let marqueeTimer = null

// 长按投珠定时器
let holdTimer = null

// 自动重置游戏定时器
let gameTimeout = null

// 投珠按钮点击
const addBet = () => {
  if (betCount.value < maxBet && totalBalls.value > 0 && gameState.value === 'ready') {
    betCount.value++
    totalBalls.value--
    // 启动跑马灯效果
    startMarquee()
  }
}

// 长按连加开始
const startHoldAdd = () => {
  if (gameState.value !== 'ready') return
  addBet()
  holdTimer = setInterval(() => {
    if (betCount.value < maxBet && totalBalls.value > 0) {
      betCount.value++
      totalBalls.value--
    } else {
      stopHoldAdd()
    }
  }, 100)
}

// 长按连加停止
const stopHoldAdd = () => {
  if (holdTimer) {
    clearInterval(holdTimer)
    holdTimer = null
  }
}

// 启动跑马灯效果
const startMarquee = () => {
  if (marqueeTimer) return
  
  marqueeTimer = setInterval(() => {
    // 清空所有通道灯
    slotMultipliers.value = new Array(12).fill('x0')
    
    // 点亮当前位置的红灯
    slotMultipliers.value[marqueeIndex] = 'x2'
    
    // 移动到下一个位置
    marqueeIndex = (marqueeIndex + 1) % 12
  }, 100) // 每100ms移动一个位置
}

// 停止跑马灯效果
const stopMarquee = () => {
  if (marqueeTimer) {
    clearInterval(marqueeTimer)
    marqueeTimer = null
    marqueeIndex = 0
  }
}

// 点击开始按钮
const startGame = () => {
  if (betCount.value <= 0 || gameState.value !== 'ready') {
    console.log('无法开始游戏: betCount=', betCount.value, 'gameState=', gameState.value)
    return
  }
  
  console.log('开始游戏，投注数量:', betCount.value)
  
  // 停止跑马灯效果
  stopMarquee()
  
  // 锁定当前投入数量
  gameState.value = 'locked'
  frameCount = 0 // 重置帧计数
  
  // 每局随机锁定一个倍率（根据新规则：x2、x4、x8、x10）
  const multipliers = ['x2', 'x4', 'x8', 'x10']
  const randomIndex = Math.floor(Math.random() * multipliers.length)
  const lockedMultiplier = multipliers[randomIndex]
  
  // 设置当前局倍率（转换为数字）
  currentMultiplier.value = parseInt(lockedMultiplier.replace('x', ''))
  console.log('本局锁定倍率:', lockedMultiplier)
  
  // 根据倍率决定亮灯数量（新规则）
  const lightCountMap = {
    'x2': 4,   // x2时亮4个通道
    'x4': 3,   // x4时亮3个通道
    'x8': 2,   // x8时亮2个通道
    'x10': 1   // x10时亮1个通道
  }
  const lightCount = lightCountMap[lockedMultiplier]
  
  // 使用 slotMultipliers.value 直接操作，避免遮蔽外层 slots 变量
  slotMultipliers.value = new Array(12).fill('x0')
  
  // 随机选择亮灯位置
  const positions = [...Array(12).keys()]
  
  // 随机打乱位置
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }
  
  // 前lightCount个位置亮灯，使用当前倍率
  for (let i = 0; i < lightCount; i++) {
    slotMultipliers.value[positions[i]] = lockedMultiplier
  }
  console.log('通道亮灯情况:', slotMultipliers.value)
  
  // 激活拉杆
  setTimeout(() => {
    gameState.value = 'readyToLaunch'
    console.log('游戏状态切换为 readyToLaunch')
    
    // 打开闸门
    openGate()
    
    // 移动小球到发射区域
    moveBallToLaunchPosition()
  }, 500)
}

// 打开闸门
const openGate = () => {
  gateOpen = true
  // 闸门向上移动到缺口顶部以上，完全打开
  const targetY = canvasHeight - 80 - 50 // 移动到缺口顶部以上（缺口顶部=canvasHeight-80，闸门高度=50）
  const animateGate = () => {
    if (gateY > targetY) {
      gateY -= 5
      requestAnimationFrame(animateGate)
    }
  }
  animateGate()
  
  // 1秒后自动关闭闸门
  setTimeout(() => {
    closeGate()
  }, 1000)
}

// 关闭闸门
const closeGate = () => {
  if (!gateOpen) return // 已经关闭，无需重复关闭
  
  gateOpen = false
  // 闸门向下移动回到缺口位置（顶部与缺口顶部对齐）
  const targetY = canvasHeight - 80 // 缺口顶部位置
  const animateGate = () => {
    if (gateY < targetY) {
      gateY += 5
      requestAnimationFrame(animateGate)
    }
  }
  animateGate()
}

// 移动小球到发射位置
const moveBallToLaunchPosition = () => {
  // 小球会自然滚过闸门，不需要动画移动
  // 只更新状态
  if (mainBall) {
    ballState = 'waiting'
  }
}

// 开始拉杆蓄力
const startPlunger = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  console.log('拉杆被按下, 当前状态:', gameState.value)
  
  if (gameState.value !== 'readyToLaunch') {
    console.log('游戏状态不对，无法发射')
    return
  }
  
  isPlungerPulled.value = true
  console.log('拉杆已拉下，开始蓄力')
  
  // 蓄力逻辑
  let startTime = Date.now()
  const maxChargeTime = 800 // 最大蓄力时间
  
  // 使用 requestAnimationFrame 进行蓄力
  const chargeLoop = () => {
    if (!isPlungerPulled.value) return
    
    const elapsed = Date.now() - startTime
    plungerPower.value = Math.min(elapsed / maxChargeTime, 1)
    
    requestAnimationFrame(chargeLoop)
  }
  
  chargeLoop()
  
  // 鼠标/触摸松开时发射
  const releaseHandler = (e) => {
    e.preventDefault()
    
    if (isPlungerPulled.value) {
      console.log('拉杆松开，发射弹珠')
      isPlungerPulled.value = false
      
      // 计算发射速度
      plungerVelocity = 8 + plungerPower.value * 12 // 速度范围 8-20
      console.log('发射速度:', plungerVelocity)
      plungerPower.value = 0
      
      // 发射弹珠
      launchBall()
      
      gameState.value = 'playing'
    }
    
    // 移除事件监听
    document.removeEventListener('mouseup', releaseHandler)
    document.removeEventListener('touchend', releaseHandler)
  }
  
  // 添加事件监听
  document.addEventListener('mouseup', releaseHandler)
  document.addEventListener('touchend', releaseHandler)
}

// 发射弹珠
const launchBall = () => {
  if (!mainBall || ballState !== 'launching') return
  
  // 发射主弹珠
  const channelLeft = canvasWidth - channelWidth - 5
  
  mainBall.x = channelLeft + 17
  mainBall.y = canvasHeight - 50
  mainBall.vx = -2 + (Math.random() - 0.5) * 2 // 略微向左，带随机偏移
  mainBall.vy = -plungerVelocity * 0.8 // 向上发射
  ballState = 'flying'
  
  // 添加到物理更新列表
  balls = [mainBall]
}

// 计算弹珠所在通道索引（考虑墙壁和分隔板宽度）
const computeSlotIndex = (ballX, slotCount) => {
  const wallWidth = 8
  const dividerWidth = 4
  const totalDividerWidth = dividerWidth * (slotCount - 1)
  const actualSlotWidth = (canvasWidth - totalDividerWidth - channelWidth - 5 - wallWidth * 2) / slotCount
  const slotStep = actualSlotWidth + dividerWidth
  return Math.floor((ballX - wallWidth) / slotStep)
}

// 更新弹珠物理
const updateBall = (ball, frameCount) => {
  // 限制最大速度，防止穿透
  const maxSpeed = 15
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
  if (speed > maxSpeed) {
    ball.vx = (ball.vx / speed) * maxSpeed
    ball.vy = (ball.vy / speed) * maxSpeed
  }
  
  // 应用重力
  ball.vy += 0.4
  
  // 更新位置
  ball.x += ball.vx
  ball.y += ball.vy
  
  // 左右边界碰撞
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius
    ball.vx *= -0.8
  }
  if (ball.x + ball.radius > canvasWidth) {
    ball.x = canvasWidth - ball.radius
    ball.vx *= -0.8
  }
  
  // 顶部边界
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius
    ball.vy *= -0.8
  }
  
  // 与钉子碰撞检测
  pegs.forEach(peg => {
    const dx = ball.x - peg.x
    const dy = ball.y - peg.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < ball.radius + peg.radius) {
      // 碰撞响应 - 反弹到相反方向
      const angle = Math.atan2(dy, dx)
      const bounceSpeed = Math.max(speed * 0.85, 3)
      
      ball.vx = Math.cos(angle) * bounceSpeed + (Math.random() - 0.5) * 2
      ball.vy = Math.sin(angle) * bounceSpeed + Math.abs(Math.random() * 2)
      
      // 分离弹珠和钉子
      const overlap = ball.radius + peg.radius - distance + 1
      ball.x += Math.cos(angle) * overlap
      ball.y += Math.sin(angle) * overlap
    }
  })
  
  // 与挡板碰撞检测
  dividers.forEach(divider => {
    // 简化的矩形碰撞检测
    const closestX = Math.max(divider.x, Math.min(ball.x, divider.x + divider.width))
    const closestY = Math.max(divider.y, Math.min(ball.y, divider.y + divider.height))
    
    const dx = ball.x - closestX
    const dy = ball.y - closestY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < ball.radius) {
      // 碰撞响应
      if (distance > 0) {
        const angle = Math.atan2(dy, dx)
        const overlap = ball.radius - distance
        
        // 分离弹珠和挡板
        ball.x += Math.cos(angle) * overlap
        ball.y += Math.sin(angle) * overlap
        
        // 反弹
        const dotProduct = ball.vx * (dx / distance) + ball.vy * (dy / distance)
        ball.vx -= 2 * dotProduct * (dx / distance)
        ball.vy -= 2 * dotProduct * (dy / distance)
        
        // 衰减速度
        ball.vx *= 0.9
        ball.vy *= 0.9
      }
    }
  })
  
  // 与闸门碰撞检测（闸门关闭时阻挡弹珠）
  if (!gateOpen) {
    const wallWidth = 8
    const rightWallX = canvasWidth - channelWidth - 5
    const gateLeft = rightWallX - wallWidth // 闸门位置与右侧墙壁对齐
    const gateHeight = 50
    
    // 检查弹珠是否碰到闸门（闸门在缺口底部，高度50像素）
    if (ball.x + ball.radius > gateLeft && ball.x - ball.radius < gateLeft + wallWidth) {
      if (ball.y + ball.radius > gateY && ball.y - ball.radius < gateY + gateHeight) {
        // 弹珠碰到闸门，阻止通过
        ball.x = gateLeft - ball.radius - 1
        ball.vx *= -0.5 // 轻微反弹
      }
    }
  }
  
  // 左侧墙壁碰撞检测（墙壁宽度为8像素）
  const wallWidth = 8
  if (ball.x - ball.radius < wallWidth) {
    ball.x = wallWidth + ball.radius
    ball.vx *= -0.8 // 反弹
  }
  
  // 右侧墙壁碰撞检测（在发射通道左侧边缘，墙壁宽度为8像素）
  const rightWallX = canvasWidth - channelWidth - 5
  const rightWallLeft = rightWallX - wallWidth
  
  // 右侧墙壁有缺口（闸门位置）
  const gapTop = canvasHeight - 80
  const gapHeight = 50
  
  // 检查是否碰到右侧墙壁（排除缺口区域）
  if (ball.x + ball.radius > rightWallLeft) {
    // 如果闸门关闭，缺口也被阻挡
    if (!gateOpen || ball.y < gapTop || ball.y > gapTop + gapHeight) {
      ball.x = rightWallLeft - ball.radius
      ball.vx *= -0.8 // 反弹
    }
    // 如果闸门打开且小球在缺口区域，允许通过
  }
  
  // 检查是否在下坡区域（通道下方）
  const slotHeight = 40
  // wallWidth 已在上面定义
  const slopeStartY = canvasHeight - slotHeight - 35 // 斜坡左侧起始高度（高）
  const slopeEndY = canvasHeight - slotHeight - 15 // 斜坡右侧结束高度（低）
  const slopeLength = canvasWidth - channelWidth - 5 - wallWidth * 2 // 斜坡水平长度（考虑两侧墙壁和发射通道偏移）
  
  // 计算斜坡方程: y = mx + b
  const slope = (slopeEndY - slopeStartY) / slopeLength // 斜率（负数，从高到低）
  const intercept = slopeStartY - slope * wallWidth // 截距（考虑墙壁宽度）
  
  // 检查小球是否与斜坡碰撞
  const ballGroundY = slope * ball.x + intercept
  
  if (ball.y + ball.radius > ballGroundY && ball.x < canvasWidth - channelWidth - 5 - wallWidth) {
    // 小球接触斜坡
    
    // 将小球定位在斜坡上
    ball.y = ballGroundY - ball.radius
    
    // 计算斜坡法线角度（垂直于斜坡）
    const slopeAngle = Math.atan(slope)
    const normalAngle = slopeAngle + Math.PI / 2
    
    // 将速度分解为沿斜坡和垂直斜坡的分量
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
    const velocityAngle = Math.atan2(ball.vy, ball.vx)
    
    // 计算沿斜坡方向的速度分量
    const alongSlopeSpeed = speed * Math.cos(velocityAngle - slopeAngle)
    // 计算垂直斜坡方向的速度分量
    const normalSpeed = speed * Math.sin(velocityAngle - normalAngle)
    
    // 垂直方向反弹（带能量损失）
    const bounceNormalSpeed = Math.abs(normalSpeed) * 0.3
    
    // 沿斜坡方向的摩擦力
    const friction = 0.98
    const newAlongSlopeSpeed = alongSlopeSpeed * friction + 0.2 // 重力沿斜坡的分量
    
    // 转换回x,y速度
    ball.vx = Math.cos(slopeAngle) * newAlongSlopeSpeed + Math.cos(normalAngle) * bounceNormalSpeed
    ball.vy = Math.sin(slopeAngle) * newAlongSlopeSpeed + Math.sin(normalAngle) * bounceNormalSpeed
    
    // 限制最大速度
    const maxSpeed = 8
    const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
    if (currentSpeed > maxSpeed) {
      ball.vx = (ball.vx / currentSpeed) * maxSpeed
      ball.vy = (ball.vy / currentSpeed) * maxSpeed
    }
    
  }
  
  // ========== 闸门通过检测（独立于斜坡条件，防止互斥Bug） ==========
  const gateLeft = rightWallX - wallWidth
  const hasPassedGate = ball.x > gateLeft + wallWidth
  
  if (hasPassedGate && gateOpen && ballState === 'waiting') {
    // 小球已通过闸门，定位到U形球槽底部中央（避免与闸门重叠）
    ball.x = canvasWidth - channelWidth - 5 + 17  // 与 launchBall() 的发射位置一致
    ball.y = canvasHeight - 50                    // U形球槽内
    ball.vx = 0
    ball.vy = 0
    ballState = 'launching'
  }
  
  // 飞行中的弹珠到达发射区域，进行结算
  if (hasPassedGate && ballState === 'flying') {
    const slotCount = slotMultipliers.value.length
    const slotIndex = computeSlotIndex(ball.x, slotCount)
    const clampedIndex = Math.max(0, Math.min(slotIndex, slotCount - 1))
    const multiplier = slotMultipliers.value[clampedIndex]
    settleGame(multiplier)
    return false
  }
  
  // 超时处理：如果弹珠在游戏区域停留太久，强制结算
  if (frameCount > 600) { // 约10秒（60fps * 10秒）
    const slotCount = slotMultipliers.value.length
    const slotIndex = computeSlotIndex(ball.x, slotCount)
    const clampedIndex = Math.max(0, Math.min(slotIndex, slotCount - 1))
    const multiplier = slotMultipliers.value[clampedIndex]
    settleGame(multiplier)
    return false
  }
  
  return true
}

// 游戏结算
const settleGame = (multiplier) => {
  gameState.value = 'ended'
  
  if (multiplier !== 'x0') {
    // 中奖 - 落入亮灯通道，使用当前局倍率计算奖励
    const winnings = betCount.value * currentMultiplier.value
    
    totalBalls.value += winnings
    rewardBalls.value += winnings
    
    // 检查额外奖励
    if (winnings >= 50) {
      rewardScore.value += 1
    }
  }
  
  // 将小球移回初始位置（闸门左侧，与斜坡对齐）
  if (mainBall) {
    mainBall.x = canvasWidth - channelWidth - 5 - 15 // 右侧墙壁左侧（距离墙壁15像素）
    mainBall.y = canvasHeight - 50 // 在斜坡上，靠近闸门位置
    mainBall.vx = 0
    mainBall.vy = 0
    ballState = 'waiting'
  }
  
  // 清空物理更新列表
  balls = []
  
  // 自动重置游戏，直接进入下一局
  if (gameTimeout) clearTimeout(gameTimeout)
  gameTimeout = setTimeout(() => {
    gameTimeout = null
    resetGame()
  }, 500)
}

// 重置游戏
const resetGame = () => {
  gameOverlay.value.show = false
  betCount.value = 0
  slotMultipliers.value = ['x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0', 'x0']
  gameState.value = 'ready'
  frameCount = 0
  // 停止跑马灯效果
  stopMarquee()
  // 清空物理更新列表
  balls = []
  // 关闭闸门（回到缺口位置，顶部对齐缺口顶部）
  gateOpen = false
  gateY = canvasHeight - 80 // 缺口顶部（闸门高度50，正好覆盖50px的缺口）
  // 将小球移回初始位置（闸门左侧，与斜坡对齐）
  if (mainBall) {
    mainBall.x = canvasWidth - channelWidth - 5 - 15 // 右侧墙壁左侧（距离墙壁15像素）
    mainBall.y = canvasHeight - 50 // 在斜坡上，靠近闸门位置
    mainBall.vx = 0
    mainBall.vy = 0
    ballState = 'waiting'
  }
}

// 绘制游戏
let frameCount = 0
const draw = () => {
  if (!ctx) return
  frameCount++
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // 绘制背景
  ctx.fillStyle = '#87CEEB'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // 绘制左右墙壁（绿色）
  drawWalls()
  
  // 绘制右侧发射通道
  drawLaunchChannel()
  
  // 绘制钉子阵列
  pegs.forEach(peg => {
    ctx.beginPath()
    ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2)
    ctx.fillStyle = peg.color
    ctx.fill()
    ctx.strokeStyle = '#4A90A4'
    ctx.lineWidth = 2
    ctx.stroke()
  })
  
  // 绘制底部通道（12个）
  const slotCount = 12
  const dividerWidth = 4 // 挡板宽度
  const wallWidth = 8 // 墙壁宽度
  const totalDividerWidth = dividerWidth * (slotCount - 1)
  const actualSlotWidth = (canvasWidth - totalDividerWidth - channelWidth - 5 - wallWidth * 2) / slotCount // 考虑两侧墙壁和发射通道偏移
  
  slots.forEach((slot, index) => {
    // 根据倍率确定通道颜色
    const multiplier = slotMultipliers.value[index]
    const isActive = multiplier !== 'x0' && gameState.value !== 'ready'
    
    // 绘制挡板（通道之间的分隔板）
    ctx.fillStyle = '#2C5F7C'
    ctx.strokeStyle = '#1A3D5C'
    ctx.lineWidth = 1
    
    // 左侧挡板（除了第一个通道）
    if (index > 0) {
      // 挡板位于两个通道之间，即当前通道起始位置（slot.x）
      const dividerX = slot.x
      
      // 绘制垂直竖条挡板（从通道上方30px开始，避免与钉子重叠）
      ctx.fillRect(dividerX, slot.y - 30, dividerWidth, slot.height + 30)
      ctx.strokeRect(dividerX, slot.y - 30, dividerWidth, slot.height + 30)
    }
    
    // 绘制通道内部（不包括挡板）
    if (isActive) {
      // 根据倍率设置不同的灯光颜色
      let lightColor = 'rgba(255, 68, 68, 0.6)' // 默认红色
      if (multiplier === 'x4') lightColor = 'rgba(255, 170, 0, 0.6)'
      else if (multiplier === 'x6') lightColor = 'rgba(255, 255, 0, 0.6)'
      else if (multiplier === 'x8') lightColor = 'rgba(0, 255, 0, 0.6)'
      else if (multiplier === 'x10') lightColor = 'rgba(255, 215, 0, 0.8)'
      
      // 绘制发光效果
      ctx.shadowColor = multiplier === 'x10' ? 'rgba(255, 215, 0, 1)' : lightColor.replace('0.6', '0.8')
      ctx.shadowBlur = multiplier === 'x10' ? 15 : 10
      
      ctx.fillStyle = lightColor
    } else {
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(0, 50, 80, 0.5)'
    }
    
  // 绘制通道主体（使用slot.x + dividerWidth作为起点，避免覆盖挡板）
    ctx.fillRect(slot.x + dividerWidth, slot.y, actualSlotWidth, slot.height)
    ctx.shadowBlur = 0
    
    // 绘制倍率文字
    if (isActive) {
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      // 文字位于通道中心（通道起始位置 + 挡板宽度 + 通道宽度的一半）
      const textX = slot.x + dividerWidth + actualSlotWidth / 2
      ctx.fillText(multiplier, textX, slot.y + slot.height / 2)
    }
  })
  
  // 绘制通道下方的下坡（从左向右倾斜）
  drawDownhill()
  
  // 绘制弹珠
  balls.forEach(ball => {
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    
    // 渐变填充
    const gradient = ctx.createRadialGradient(
      ball.x - ball.radius * 0.3, 
      ball.y - ball.radius * 0.3, 
      0, 
      ball.x, 
      ball.y, 
      ball.radius
    )
    gradient.addColorStop(0, '#FFFFCC')
    gradient.addColorStop(0.5, '#FFD700')
    gradient.addColorStop(1, '#FFA500')
    
    ctx.fillStyle = gradient
    ctx.fill()
    
    // 发光效果
    ctx.shadowColor = '#FFD700'
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowBlur = 0
  })
  
  // 绘制闸门
  drawGate()
  
  // 确保主弹珠参与物理模拟（等待滚入发射位 或 飞行中）
  if (mainBall && (ballState === 'waiting' || ballState === 'flying')) {
    balls = [mainBall]
    balls = balls.filter(ball => updateBall(ball, frameCount))
  } else {
    balls = []
  }
  
  animationId = requestAnimationFrame(draw)
}

// 绘制通道下方的下坡
const drawDownhill = () => {
  const slotHeight = 40
  const wallWidth = 8
  const slopeStartY = canvasHeight - slotHeight - 35 // 左侧起始高度（高，与通道底部对齐后向上5像素）
  const slopeEndY = canvasHeight - slotHeight - 15 // 右侧结束高度（低）
  
  // 绘制下坡斜坡（左侧高，右侧低）
  ctx.fillStyle = '#4A90A4'
  ctx.strokeStyle = '#2C5F7C'
  ctx.lineWidth = 2
  
  ctx.beginPath()
  ctx.moveTo(wallWidth, slopeStartY) // 左上角（高，从墙壁右侧开始）
  ctx.lineTo(canvasWidth - channelWidth - 5 - wallWidth, slopeEndY) // 右侧终点（发射通道左侧边缘，低，从墙壁左侧结束）
  ctx.lineTo(canvasWidth - channelWidth - 5 - wallWidth, canvasHeight) // 右下角
  ctx.lineTo(wallWidth, canvasHeight) // 左下角
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // 绘制下坡表面（稍微倾斜）
  ctx.fillStyle = '#6BB3C9'
  ctx.beginPath()
  ctx.moveTo(wallWidth, slopeStartY)
  ctx.lineTo(canvasWidth - channelWidth - 5 - wallWidth, slopeEndY)
  ctx.lineTo(canvasWidth - channelWidth - 5 - wallWidth, slopeEndY + 8)
  ctx.lineTo(wallWidth, slopeStartY + 8)
  ctx.closePath()
  ctx.fill()
}

// 绘制左右墙壁
const drawWalls = () => {
  const wallWidth = 8
  const wallHeight = canvasHeight
  
  // 左侧墙壁（绿色）
  const leftWallGradient = ctx.createLinearGradient(0, 0, wallWidth, 0)
  leftWallGradient.addColorStop(0, '#228B22') // 深绿色
  leftWallGradient.addColorStop(0.5, '#32CD32') // 亮绿色
  leftWallGradient.addColorStop(1, '#228B22') // 深绿色
  
  ctx.fillStyle = leftWallGradient
  ctx.fillRect(0, 0, wallWidth, wallHeight)
  
  // 左侧墙壁边框
  ctx.strokeStyle = '#006400'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, wallWidth, wallHeight)
  
  // 右侧墙壁（绿色，在发射通道左侧边缘）
  const rightWallX = canvasWidth - channelWidth - 5 // 与发射通道左边缘对齐
  const rightWallGradient = ctx.createLinearGradient(rightWallX - wallWidth, 0, rightWallX, 0)
  rightWallGradient.addColorStop(0, '#228B22') // 深绿色
  rightWallGradient.addColorStop(0.5, '#32CD32') // 亮绿色
  rightWallGradient.addColorStop(1, '#228B22') // 深绿色
  
  ctx.fillStyle = rightWallGradient
  
  // 右侧墙壁分成两部分，中间有一个缺口（闸门位置）
  const gapTop = canvasHeight - 80 // 缺口顶部位置
  const gapHeight = 50 // 缺口高度
  
  // 上半部分墙壁
  ctx.fillRect(rightWallX - wallWidth, 0, wallWidth, gapTop)
  
  // 下半部分墙壁
  ctx.fillRect(rightWallX - wallWidth, gapTop + gapHeight, wallWidth, wallHeight - gapTop - gapHeight)
  
  // 右侧墙壁边框
  ctx.strokeStyle = '#006400'
  ctx.lineWidth = 2
  
  // 上半部分边框
  ctx.strokeRect(rightWallX - wallWidth, 0, wallWidth, gapTop)
  
  // 下半部分边框
  ctx.strokeRect(rightWallX - wallWidth, gapTop + gapHeight, wallWidth, wallHeight - gapTop - gapHeight)
}

// 绘制右侧发射通道（简洁直筒 + 底部U形球槽）
const drawLaunchChannel = () => {
  const wallWidth = 8
  const channelLeft = canvasWidth - channelWidth - 5 - wallWidth // 考虑右侧墙壁宽度
  const channelRight = canvasWidth - 5
  const channelTop = 55 // 通道顶部高度
  const channelBottom = canvasHeight - 5 // 通道底部高度
  const radius = 10 // 顶部圆角半径

  // ---- 绘制通道主体（简洁的直筒圆角矩形，顶部右圆角） ----
  ctx.fillStyle = 'rgba(100, 180, 220, 0.6)'
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 3

  ctx.beginPath()
  ctx.roundRect(channelLeft, channelTop, channelWidth, channelBottom - channelTop, [0, radius, 0, 0])
  ctx.fill()
  ctx.stroke()

  // ---- 绘制通道底部U形球槽（弹珠等待发射的入口） ----
  const slotTop = canvasHeight - 48
  const slotDepth = 22
  const slotR = 8

  // U形球槽白色边框
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(channelLeft + 3, slotTop)
  ctx.lineTo(channelLeft + 3, slotTop + slotDepth - slotR)
  ctx.quadraticCurveTo(channelLeft + 3, slotTop + slotDepth, channelLeft + 3 + slotR, slotTop + slotDepth)
  ctx.lineTo(channelRight - 5 - slotR, slotTop + slotDepth)
  ctx.quadraticCurveTo(channelRight - 5, slotTop + slotDepth, channelRight - 5, slotTop + slotDepth - slotR)
  ctx.lineTo(channelRight - 5, slotTop)
  ctx.stroke()

  // U形球槽填充
  ctx.fillStyle = 'rgba(80, 170, 210, 0.5)'
  ctx.beginPath()
  ctx.moveTo(channelLeft + 4, slotTop + 1)
  ctx.lineTo(channelLeft + 4, slotTop + slotDepth - slotR)
  ctx.quadraticCurveTo(channelLeft + 4, slotTop + slotDepth - 1, channelLeft + 3 + slotR, slotTop + slotDepth - 1)
  ctx.lineTo(channelRight - 5 - slotR, slotTop + slotDepth - 1)
  ctx.quadraticCurveTo(channelRight - 6, slotTop + slotDepth - 1, channelRight - 6, slotTop + slotDepth - slotR)
  ctx.lineTo(channelRight - 6, slotTop + 1)
  ctx.closePath()
  ctx.fill()

  // ---- 绘制银色主弹珠（始终显示） ----
  if (mainBall) {
    ctx.beginPath()
    ctx.arc(mainBall.x, mainBall.y, mainBall.radius, 0, Math.PI * 2)
    const gradient = ctx.createRadialGradient(
      mainBall.x - 2, mainBall.y - 2, 0,
      mainBall.x, mainBall.y, mainBall.radius
    )
    gradient.addColorStop(0, '#FFFFFF')
    gradient.addColorStop(0.3, '#C0C0C0')
    gradient.addColorStop(1, '#808080')
    ctx.fillStyle = gradient
    ctx.fill()
    // 弹珠阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
}

// 绘制闸门（绿色，与墙壁颜色一致，填补墙壁缺口）
const drawGate = () => {
  const wallWidth = 8
  const rightWallX = canvasWidth - channelWidth - 5
  const gateLeft = rightWallX - wallWidth // 闸门位置与右侧墙壁对齐
  
  // 绘制闸门主体（绿色，与墙壁颜色一致）
  const gateGradient = ctx.createLinearGradient(gateLeft, 0, gateLeft + wallWidth, 0)
  gateGradient.addColorStop(0, '#228B22') // 深绿色
  gateGradient.addColorStop(0.5, '#32CD32') // 亮绿色
  gateGradient.addColorStop(1, '#228B22') // 深绿色
  
  ctx.fillStyle = gateGradient
  ctx.strokeStyle = '#006400'
  ctx.lineWidth = 2
  
  // 绘制闸门主体（高度为缺口高度）
  const gateHeight = 50
  ctx.beginPath()
  ctx.roundRect(gateLeft, gateY, wallWidth, gateHeight, 3)
  ctx.fill()
  ctx.stroke()
  
  // 绘制闸门顶部和底部的金属边缘
  const edgeGradient = ctx.createLinearGradient(gateLeft - 1, 0, gateLeft - 1, 10)
  edgeGradient.addColorStop(0, '#32CD32')
  edgeGradient.addColorStop(1, '#228B22')
  
  ctx.fillStyle = edgeGradient
  ctx.fillRect(gateLeft - 1, gateY, wallWidth + 2, 4)
  ctx.fillRect(gateLeft - 1, gateY + gateHeight - 4, wallWidth + 2, 4)
}

// 初始化游戏
const initGame = () => {
  if (!gameCanvas.value) return
  
  ctx = gameCanvas.value.getContext('2d')
  canvasWidth = gameCanvas.value.width
  canvasHeight = gameCanvas.value.height
  
  const slotHeight = 40 // 定义通道高度
  
  // 初始化闸门位置（关闭状态，在缺口位置，阻挡小球）
  gateOpen = false
  const gapTop = canvasHeight - 80
  gateY = gapTop // 闸门顶部对齐缺口顶部，高度50正好覆盖整个缺口
  
  // 创建银色主弹珠（初始位置在下坡右侧，闸门左侧，靠近右侧墙壁）
  mainBall = {
    x: canvasWidth - channelWidth - 5 - 15, // 右侧墙壁左侧（距离墙壁15像素）
    y: canvasHeight - 50, // 在斜坡上，靠近闸门位置
    vx: 0,
    vy: 0,
    radius: 8
  }
  ballState = 'waiting'
  
  // 生成钉子阵列
  pegs = []
  
  const wallWidth = 8 // 墙壁宽度
  
  // 上部稀疏大钉子（只1排）
  const topRows = 1
  const topCols = 7
  const topStartX = wallWidth + 22 // 从墙壁右侧开始
  const topStartY = 40
  const topSpacingX = 50
  const topSpacingY = 35
  
  for (let row = 0; row < topRows; row++) {
    for (let col = 0; col < topCols; col++) {
      const offsetX = row % 2 === 0 ? 0 : topSpacingX / 2
      pegs.push({
        x: topStartX + col * topSpacingX + offsetX,
        y: topStartY + row * topSpacingY,
        radius: 10,
        color: '#FFFFFF'
      })
    }
  }
  
  // 中部密集细小钉子（5排，交替10个和9个）
  const midRows = 5
  const midStartX = wallWidth + 12 // 从墙壁右侧开始
  const midStartY = 80
  const midSpacingX = 38
  const midSpacingY = 28
  
  for (let row = 0; row < midRows; row++) {
    // 奇数排（0, 2, 4）有10个，偶数排（1, 3）有9个
    const cols = row % 2 === 0 ? 10 : 9
    // 偶数排（9个）需要向右偏移半个间距
    const offsetX = row % 2 === 0 ? 0 : midSpacingX / 2
    
    for (let col = 0; col < cols; col++) {
      pegs.push({
        x: midStartX + col * midSpacingX + offsetX,
        y: midStartY + row * midSpacingY,
        radius: 6,
        color: '#FFFFFF'
      })
    }
  }
  
  // 生成底部通道（12个）
  slots = []
  dividers = [] // 挡板数组
  const slotCount = 12
  // slotHeight 已在函数开头定义
  const slotY = canvasHeight - slotHeight - 40 // 向上移动30像素
  const dividerWidth = 4
  // wallWidth 已在上面定义
  
  // 计算通道区域宽度（减去发射通道的空间和两侧墙壁）
  const totalDividerWidth = dividerWidth * (slotCount - 1)
  const actualSlotWidth = (canvasWidth - totalDividerWidth - channelWidth - 5 - wallWidth * 2) / slotCount // 考虑两侧墙壁和发射通道偏移
  
  // 生成通道和挡板
  for (let i = 0; i < slotCount; i++) {
    // 计算通道位置（考虑挡板和左侧墙壁）
    const slotX = wallWidth + i * (actualSlotWidth + dividerWidth) // 从左侧墙壁右侧开始
    
    slots.push({
      x: slotX,
      y: slotY,
      width: actualSlotWidth,
      height: slotHeight,
      color: 'rgba(0, 100, 150, 0.3)'
    })
    
    // 生成挡板（除了最后一个通道）
    if (i < slotCount - 1) {
      const dividerX = slotX + actualSlotWidth
      dividers.push({
        x: dividerX,
        y: slotY - 30, // 从通道上方30px开始（避免与钉子重叠）
        width: dividerWidth,
        height: slotHeight + 30 // 延伸到通道上方
      })
    }
  }
  
  // 开始渲染循环
  draw()
}

// 功能按钮
const showLeaderboard = () => {
  alert('排行榜功能开发中')
}

const showGameCircle = () => {
  alert('游戏圈功能开发中')
}

const addFreeBalls = () => {
  totalBalls.value += 10
  alert('获得10颗免费弹珠！')
}

const showSettings = () => {
  alert('设置功能开发中')
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  stopHoldAdd()
  if (gameTimeout) {
    clearTimeout(gameTimeout)
    gameTimeout = null
  }
})
</script>

<style scoped>
.marble-game-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background: linear-gradient(180deg, #4ECDC4 0%, #44A08D 100%);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* 顶部数据看板区 */
.game-header {
  background: linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%);
  border-radius: 15px;
  padding: 12px;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 4px;
}

.stat-value {
  background: linear-gradient(180deg, #1a1a1a 0%, #000 100%);
  color: #FFD700;
  font-size: 18px;
  font-weight: bold;
  padding: 6px 8px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  box-shadow: inset 0 2px 4px rgba(255, 215, 0, 0.3);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.header-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-icon .icon {
  font-size: 18px;
}

.btn-icon .btn-text {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
}

/* 中部核心游戏场景区 */
.game-area {
  background: #87CEEB;
  border-radius: 20px;
  padding: 5px;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.game-canvas {
  width: 100%;
  height: 380px;
  border-radius: 15px;
  display: block;
}

/* 游戏状态覆盖层 */
.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  z-index: 10;
}

.overlay-content {
  text-align: center;
  padding: 30px;
}

.overlay-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.overlay-title {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
}

.overlay-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 20px;
}

.overlay-button {
  background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
  color: #333;
  font-size: 18px;
  font-weight: bold;
  padding: 12px 40px;
  border-radius: 30px;
  cursor: pointer;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  transition: transform 0.2s;
}

.overlay-button:hover {
  transform: scale(1.05);
}

/* 底部操作控制区 */
.game-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 5px;
  position: relative;
  z-index: 1;
}

.ball-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px;
}

.ball-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-ball {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
  border: 2px solid #FFD700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.ball-count {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.add-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.btn-primary-large {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(30, 144, 255, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary-large:not(:disabled):hover {
  transform: scale(1.05);
}

.btn-primary-large:not(:disabled):active {
  transform: scale(0.95);
}

.btn-primary-large .btn-content {
  color: #fff;
  font-size: 15px;
  font-weight: bold;
}

.btn-bet {
  background: linear-gradient(180deg, #1E90FF 0%, #0066CC 100%);
}

.btn-start {
  background: linear-gradient(180deg, #FF6347 0%, #DC143C 100%);
  box-shadow: 0 4px 15px rgba(255, 99, 71, 0.4);
}

/* 右侧弹珠发射器（拉杆+弹簧） */
.launch-button {
  margin-left: auto;
  cursor: default;
}

.launch-button.active {
  cursor: pointer;
}

/* 发射器底座（深色轨道筒） */
.launch-base {
  width: 42px;
  min-height: 90px;
  background: linear-gradient(90deg, #2a2a2a 0%, #111 100%);
  border-radius: 8px 14px 14px 8px;
  padding: 10px 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid #444;
}

/* 弹簧 */
.launch-spring {
  width: 8px;
  height: 30px;
  background: repeating-linear-gradient(
    0deg,
    #888,
    #888 4px,
    #aaa 4px,
    #aaa 7px
  );
  border-radius: 4px;
  transition: height 0.15s ease;
  flex-shrink: 0;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
}

/* 弹簧压缩状态 */
.launch-spring.compressed {
  height: 12px;
}

/* 大红圆形发射按钮 */
.launch-lever {
  width: 38px;
  height: 38px;
  background: radial-gradient(circle at 35% 30%, #FF6666 0%, #DD2222 40%, #AA0000 100%);
  border-radius: 50%;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 3px 6px rgba(255,255,255,0.2);
  border: 2px solid #FF5555;
  transition: transform 0.15s ease;
  flex-shrink: 0;
  cursor: pointer;
}

/* 按钮拉下状态（模拟弹簧压缩） */
.launch-lever.pulled {
  transform: translateY(14px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5), inset 0 -3px 6px rgba(0,0,0,0.3);
}

/* 底部倍率显示 */
.multiplier-display {
  display: flex;
  justify-content: space-around;
  padding: 8px 5px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  margin-top: 10px;
}

.slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: bold;
  padding: 4px 2px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  min-width: 28px;
}

.slot-light {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #333;
  margin-bottom: 3px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.slot-mult {
  font-size: 9px;
  transition: all 0.3s ease;
}

.slot-item.active .slot-light {
  background: radial-gradient(circle at 30% 30%, #FF6B6B, #CC0000);
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.slot-item.active {
  color: #fff;
  background: rgba(255, 0, 0, 0.3);
}

.slot-item.active .slot-mult {
  color: #FFD700;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

/* 不同倍率的灯光颜色 */
.slot-item.x2.active .slot-light {
  background: radial-gradient(circle at 30% 30%, #FF8888, #CC4444);
  box-shadow: 0 0 8px rgba(255, 68, 68, 0.6);
}

.slot-item.x4.active .slot-light {
  background: radial-gradient(circle at 30% 30%, #FFAA00, #CC7700);
  box-shadow: 0 0 8px rgba(255, 170, 0, 0.6);
}

.slot-item.x6.active .slot-light {
  background: radial-gradient(circle at 30% 30%, #FFFF00, #CCCC00);
  box-shadow: 0 0 8px rgba(255, 255, 0, 0.6);
}

.slot-item.x8.active .slot-light {
  background: radial-gradient(circle at 30% 30%, #00FF00, #00CC00);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
}

.slot-item.x10.active .slot-light {
  background: radial-gradient(circle at 30% 30%, #FFD700, #FFA500);
  box-shadow: 0 0 15px rgba(255, 215, 0, 1);
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }
  to {
    box-shadow: 0 0 20px rgba(255, 215, 0, 1);
  }
}
</style>