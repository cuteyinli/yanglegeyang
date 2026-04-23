/**
 * 卡牌渲染模块
 * 负责：图片预加载、根据关卡配置生成卡牌数组、遮挡判定、绘制卡牌与槽位
 */

const LEVELS = require('./levels')

// ==================== 屏幕比例参数（统一管理） ====================
// 卡牌可用区域边界
const BOARD_TOP        = 0.10   // 卡牌区顶部 = 屏幕高度 × 10%（标题下方）
const BOARD_SIDE       = 0.07   // 卡牌区左右边距 = 屏幕宽度 × 7%
const BOARD_BOTTOM     = 0.65   // 卡牌区底部 = 屏幕高度 × 65%
// 卡牌绘制
const CARD_SIZE_SCALE  = 0.12   // 卡牌尺寸 = 屏幕宽度 × 12%（全局统一）
const CARD_3D_DEPTH    = 0.1    // 3D厚度 = 卡牌尺寸 × 10%
const CARD_RADIUS      = 8      // 卡牌圆角半径（px）
const CARD_ICON_PAD    = 0.07   // 卡牌图标内边距 = 卡牌尺寸 × 7%
const CARD_FONT_SCALE  = 0.45   // 卡牌文字字号 = 卡牌尺寸 × 45%
const CARD_BLOCKED_THR = 0.1    // 遮挡判定阈值 = 重叠面积 ÷ 卡牌面积

// 槽位区
const SLOT_TOP         = 0.82   // 槽位区顶部 = 屏幕高度 × 82%
const SLOT_SIZE_SCALE  = 0.11   // 槽位卡牌尺寸 = 屏幕宽度 × 11%
const SLOT_GAP_SCALE   = 0.015  // 槽位间距   = 屏幕宽度 × 1.5%
const SLOT_PAD_SCALE   = 0.02   // 槽位背景内边距 = 屏幕宽度 × 2%
const SLOT_ICON_PAD    = 0.06   // 槽位图标内边距 = 槽位尺寸 × 6%
const SLOT_FONT_SCALE  = 0.45   // 槽位文字字号 = 槽位尺寸 × 45%

// 道具区
const PROP_TOP         = 0.90   // 道具区顶部 = 屏幕高度 × 90%
const PROP_SIZE_SCALE  = 0.2    // 道具按钮尺寸 = 屏幕宽度 × 20%
const PROP_GAP_SCALE   = 0.08   // 道具按钮间距 = 屏幕宽度 × 8%
const PROP_COUNT       = 3      // 道具数量（移出 / 撤回 / 洗牌）
const PROP_RADIUS      = 10     // 道具按钮圆角半径（px）
const PROP_FONT_SCALE  = 0.28   // 道具按钮文字字号 = 按钮尺寸 × 28%
const PROP_LABEL_Y     = 0.72   // 道具文字纵向位置 = 按钮顶部 + 按钮尺寸 × 72%
// ========================================================

// 卡牌图标（18种动物卡牌图片）
const ICON_COUNT = 18
const ICON_IMGS = {}  // { '1': Image, '2': Image, ... }

/** 预加载所有卡牌图片 */
function preloadImages() {
  for (let i = 1; i <= ICON_COUNT; i++) {
    const img = wx.createImage()
    img.src = 'images/game/cards/animals/' + i + '.png'
    img.onload = () => { ICON_IMGS[String(i)] = img }
  }
}

/** 洗牌（Fisher-Yates） */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 根据关卡配置生成卡牌数组
 *
 * 先计算卡牌可用区域（标题下方 → 槽位上方，左右留边距），
 * 然后区域的 x, y 基于可用区域定位（0~1 比例）。
 *
 * 配置层级：
 *   关卡级：iconTypes
 *   区域级：x, y（区域左上角，相对卡牌可用区域的比例 0~1）
 *   层级：  gapRatio、offsetCol、offsetRow、cards
 */
function generateCards(level, screenW, screenH) {
  const levelIdx = Math.min(level - 1, LEVELS.length - 1)
  const cfg = LEVELS[levelIdx]

  // 卡牌尺寸（全局统一）
  const size = Math.round(screenW * CARD_SIZE_SCALE)
  const regions = cfg.regions

  // ---- 计算卡牌可用区域 ----
  const areaTop = screenH * BOARD_TOP
  const areaBottom = screenH * BOARD_BOTTOM
  // 左右边距
  const areaLeft = screenW * BOARD_SIDE
  const areaRight = screenW * (1 - BOARD_SIDE)
  // 可用区域宽高
  const areaW = areaRight - areaLeft
  const areaH = areaBottom - areaTop

  // ---- 1. 统计总卡牌数 & 构建卡池 ----
  let totalCards = 0
  for (const region of regions) {
    for (const layerCfg of region.layers) {
      totalCards += layerCfg.cards.length
    }
  }

  // 从 ICON_COUNT 种图标中随机挑选 iconTypes 种
  const allIcons = []
  for (let i = 1; i <= ICON_COUNT; i++) allIcons.push(String(i))
  shuffle(allIcons)
  const selectedIcons = allIcons.slice(0, cfg.iconTypes)

  const triplets = Math.ceil(totalCards / 3 / cfg.iconTypes)
  const pool = []
  for (const icon of selectedIcons) {
    for (let j = 0; j < triplets * 3; j++) {
      pool.push(icon)
    }
  }
  shuffle(pool)

  // ---- 2. 逐区域生成卡牌 ----
  const cards = []
  let idx = 0

  for (const region of regions) {
    // 区域左上角 = 可用区域原点 + 可用区域尺寸 × 比例
    const originX = areaLeft + areaW * region.x
    const originY = areaTop + areaH * region.y

    for (const layerCfg of region.layers) {
      const gapRatio = layerCfg.gapRatio != null ? layerCfg.gapRatio : 0.12
      const gap = Math.round(size * gapRatio)
      const cellW = size + gap
      const cellH = size + gap
      const offC = layerCfg.offsetCol || 0
      const offR = layerCfg.offsetRow || 0

      for (const pos of layerCfg.cards) {
        if (idx >= pool.length) break
        cards.push({
          icon: pool[idx],
          x: originX + (pos.col + offC) * cellW,
          y: originY + (pos.row + offR) * cellH,
          width: size,
          height: size,
          layer: layerCfg.layer,
          removed: false
        })
        idx++
      }
    }
  }

  return cards
}

/**
 * 判断卡牌是否被上层遮挡（基于矩形重叠面积）
 * @param {Object} card  - 目标卡牌
 * @param {Array}  cards - 所有卡牌
 * @returns {boolean}
 */
function isBlocked(card, cards) {
  const threshold = card.width * card.height * CARD_BLOCKED_THR
  for (const other of cards) {
    if (other.removed || other.layer <= card.layer) continue
    const overlapX = Math.max(0, Math.min(card.x + card.width, other.x + other.width) - Math.max(card.x, other.x))
    const overlapY = Math.max(0, Math.min(card.y + card.height, other.y + other.height) - Math.max(card.y, other.y))
    if (overlapX * overlapY > threshold) {
      return true
    }
  }
  return false
}

/** 绘制圆角矩形路径 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * 绘制棋盘区所有卡牌
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} cards
 */
function renderCards(ctx, cards) {
  const radius = CARD_RADIUS

  for (const card of cards) {
    const depth = Math.round(card.width * CARD_3D_DEPTH)
    if (card.removed) continue
    const blocked = isBlocked(card, cards)

    // 卡牌侧面（底部厚度）
    ctx.fillStyle = blocked ? '#4a5354' : '#b8923a'
    roundRect(ctx, card.x + 1, card.y + depth, card.width, card.height, radius)
    ctx.fill()

    // 卡牌正面底色
    ctx.fillStyle = blocked ? '#636e72' : '#fffdf5'
    roundRect(ctx, card.x, card.y, card.width, card.height, radius)
    ctx.fill()

    // 卡牌边框
    ctx.strokeStyle = blocked ? '#999' : '#c8a96e'
    ctx.lineWidth = 1.5
    roundRect(ctx, card.x, card.y, card.width, card.height, radius)
    ctx.stroke()

    // 图标（图片或文字兄底）
    const iconImg = ICON_IMGS[card.icon]
    if (iconImg) {
      const pad = card.width * CARD_ICON_PAD
      if (blocked) { ctx.globalAlpha = 0.5 }
      // 裁剪圆角区域
      ctx.save()
      roundRect(ctx, card.x, card.y, card.width, card.height, radius)
      ctx.clip()
      ctx.drawImage(iconImg, card.x + pad, card.y + pad, card.width - pad * 2, card.height - pad * 2)
      ctx.restore()
      if (blocked) { ctx.globalAlpha = 1.0 }
    } else {
      const fontSize = Math.round(card.width * CARD_FONT_SCALE)
      ctx.font = fontSize + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = blocked ? '#999999' : '#000000'
      ctx.fillText(card.icon, card.x + card.width / 2, card.y + card.height / 2)
    }
  }
}

/**
 * 绘制底部槽位
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}  slots     - 当前槽位数据
 * @param {Object} config    - { width, height, maxSlots }
 */
function renderSlots(ctx, slots, config) {
  const { width, height, maxSlots } = config

  // 所有尺寸基于屏幕比例计算
  const slotSize = Math.round(width * SLOT_SIZE_SCALE)
  const slotGap = Math.round(width * SLOT_GAP_SCALE)
  const padding = Math.round(width * SLOT_PAD_SCALE)

  const totalSlotWidth = maxSlots * (slotSize + slotGap)
  const slotStartX = (width - totalSlotWidth) / 2
  const slotY = Math.round(height * SLOT_TOP)

  // 槽位背景
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(slotStartX - padding, slotY - padding,
    totalSlotWidth + padding * 2, slotSize + padding * 2)

  // 画空槽位
  for (let i = 0; i < maxSlots; i++) {
    const sx = slotStartX + i * (slotSize + slotGap)
    ctx.fillStyle = '#44555566'
    ctx.fillRect(sx, slotY, slotSize, slotSize)
    ctx.strokeStyle = '#ffffff33'
    ctx.lineWidth = 1
    ctx.strokeRect(sx, slotY, slotSize, slotSize)
  }

  // 画已放入的卡牌
  for (let i = 0; i < slots.length; i++) {
    const sx = slotStartX + i * (slotSize + slotGap)
    const iconImg = ICON_IMGS[slots[i].icon]
    ctx.fillStyle = '#fffdf5'
    ctx.fillRect(sx, slotY, slotSize, slotSize)
    ctx.strokeStyle = '#c8a96e'
    ctx.lineWidth = 1
    ctx.strokeRect(sx, slotY, slotSize, slotSize)
    if (iconImg) {
      const pad = slotSize * SLOT_ICON_PAD
      ctx.drawImage(iconImg, sx + pad, slotY + pad, slotSize - pad * 2, slotSize - pad * 2)
    } else {
      const fontSize = Math.round(slotSize * SLOT_FONT_SCALE)
      ctx.font = fontSize + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#000000'
      ctx.fillText(slots[i].icon, sx + slotSize / 2, slotY + slotSize / 2)
    }
  }
}

/**
 * 计算某个槽位索引的屏幕位置
 * @param {number} index    - 槽位索引
 * @param {Object} config   - { width, height }
 * @returns {{ x, y, size }}
 */
function getSlotPosition(index, config) {
  const { width, height } = config
  const slotSize = Math.round(width * SLOT_SIZE_SCALE)
  const slotGap = Math.round(width * SLOT_GAP_SCALE)
  const padding = Math.round(width * SLOT_PAD_SCALE)
  const maxSlots = 7
  const totalSlotWidth = maxSlots * (slotSize + slotGap)
  const slotStartX = (width - totalSlotWidth) / 2
  const slotY = Math.round(height * SLOT_TOP)
  return {
    x: slotStartX + index * (slotSize + slotGap),
    y: slotY,
    size: slotSize
  }
}

/** 获取卡牌图标图片 */
function getIconImg(icon) {
  return ICON_IMGS[icon] || null
}

// ==================== 道具区 ====================

const PROP_LABELS = ['移出', '撤回', '洗牌']

/**
 * 渲染道具区（3 个按钮水平居中）
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config - { width, height }
 */
function renderProps(ctx, config) {
  const { width, height } = config
  const btnSize = Math.round(width * PROP_SIZE_SCALE)
  const btnGap = Math.round(width * PROP_GAP_SCALE)
  const topY = Math.round(height * PROP_TOP)

  const totalW = PROP_COUNT * btnSize + (PROP_COUNT - 1) * btnGap
  const startX = (width - totalW) / 2

  const radius = PROP_RADIUS
  const fontSize = Math.round(btnSize * PROP_FONT_SCALE)

  for (let i = 0; i < PROP_COUNT; i++) {
    const bx = startX + i * (btnSize + btnGap)
    const by = topY

    // 按钮背景（圆角矩形）
    ctx.fillStyle = 'rgba(50,130,220,0.85)'
    ctx.beginPath()
    ctx.moveTo(bx + radius, by)
    ctx.arcTo(bx + btnSize, by, bx + btnSize, by + btnSize, radius)
    ctx.arcTo(bx + btnSize, by + btnSize, bx, by + btnSize, radius)
    ctx.arcTo(bx, by + btnSize, bx, by, radius)
    ctx.arcTo(bx, by, bx + btnSize, by, radius)
    ctx.closePath()
    ctx.fill()

    // 按钮边框
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 文字标签
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold ' + fontSize + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(PROP_LABELS[i], bx + btnSize / 2, by + btnSize * PROP_LABEL_Y)
  }
}

/**
 * 获取道具按钮的位置信息（用于点击检测）
 * @param {number} index   - 按钮索引 0/1/2
 * @param {Object} config  - { width, height }
 * @returns {{ x, y, size }}
 */
function getPropPosition(index, config) {
  const { width, height } = config
  const btnSize = Math.round(width * PROP_SIZE_SCALE)
  const btnGap = Math.round(width * PROP_GAP_SCALE)
  const topY = Math.round(height * PROP_TOP)
  const totalW = PROP_COUNT * btnSize + (PROP_COUNT - 1) * btnGap
  const startX = (width - totalW) / 2
  return {
    x: startX + index * (btnSize + btnGap),
    y: topY,
    size: btnSize
  }
}

module.exports = {
  preloadImages,
  generateCards,
  isBlocked,
  renderCards,
  renderSlots,
  getSlotPosition,
  getIconImg,
  renderProps,
  getPropPosition
}
