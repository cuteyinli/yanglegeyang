/**
 * 卡牌渲染模块
 * 负责：图片预加载、根据关卡配置生成卡牌数组、遮挡判定、绘制卡牌与槽位
 */

const LEVELS = require('./levels')

// ==================== 屏幕比例参数（统一管理） ====================
// 卡牌区
// cardScale 和 gapScale 在 levels.js 中每关单独配置
const CARD_ICON_PAD    = 0.07    // 卡牌图标内边距 = 卡牌尺寸 × 7%
const CARD_FONT_SCALE  = 0.45   // 卡牌文字字号 = 卡牌尺寸 × 45%

// 槽位区
const SLOT_SIZE_SCALE  = 0.11   // 槽位卡牌尺寸 = 屏幕宽度 × 11%
const SLOT_GAP_SCALE   = 0.015  // 槽位间距   = 屏幕宽度 × 1.5%
const SLOT_PAD_SCALE   = 0.02   // 槽位背景内边距 = 屏幕宽度 × 2%
const SLOT_BOTTOM      = 0.04   // 槽位底部边距 = 屏幕高度 × 4%
const SLOT_ICON_PAD    = 0.06   // 槽位图标内边距 = 槽位尺寸 × 6%
const SLOT_FONT_SCALE  = 0.45   // 槽位文字字号 = 槽位尺寸 × 45%
// ========================================================

// 卡牌图标（16种动物卡牌图片）
const ICON_COUNT = 16
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
 * @param {number} level    - 当前关卡号（从 1 开始）
 * @param {number} screenW  - 屏幕宽度
 * @param {number} screenH  - 屏幕高度
 * @returns {Array} cards 数组
 */
function generateCards(level, screenW, screenH) {
  const levelIdx = Math.min(level - 1, LEVELS.length - 1)
  const cfg = LEVELS[levelIdx]

  // 从屏幕比例计算实际像素值
  const size = Math.round(screenW * (cfg.cardScale || 0.12))
  const gap = Math.round(screenW * (cfg.gapScale || 0.01))

  // 统计总卡牌数
  let totalCards = 0
  for (const layerCfg of cfg.layers) {
    totalCards += layerCfg.cards.length
  }

  // 构建卡池：每种图标生成 3 的倍数张
  const triplets = Math.ceil(totalCards / 3 / cfg.iconTypes)
  const pool = []
  for (let i = 1; i <= cfg.iconTypes; i++) {
    for (let j = 0; j < triplets * 3; j++) {
      pool.push(String(i))
    }
  }
  shuffle(pool)

  // 计算网格中最大列号和行号，用于居中
  let maxCol = 0, maxRow = 0
  for (const layerCfg of cfg.layers) {
    const offC = layerCfg.offsetCol || 0
    const offR = layerCfg.offsetRow || 0
    for (const c of layerCfg.cards) {
      maxCol = Math.max(maxCol, c.col + offC)
      maxRow = Math.max(maxRow, c.row + offR)
    }
  }

  // 整体棋盘像素尺寸 & 居中
  const cellW = size + gap
  const cellH = size + gap
  const boardW = maxCol * cellW + size
  const boardH = maxRow * cellH + size
  const startX = (screenW - boardW) / 2
  const startY = screenH * (cfg.boardTop || 0.15)

  // 按层生成卡牌
  const cards = []
  let idx = 0
  for (const layerCfg of cfg.layers) {
    const offC = layerCfg.offsetCol || 0
    const offR = layerCfg.offsetRow || 0

    for (const pos of layerCfg.cards) {
      if (idx >= pool.length) break
      cards.push({
        icon: pool[idx],
        x: startX + (pos.col + offC) * cellW,
        y: startY + (pos.row + offR) * cellH,
        width: size,
        height: size,
        layer: layerCfg.layer,
        removed: false
      })
      idx++
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
  const threshold = card.width * card.height * 0.15
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

/**
 * 绘制棋盘区所有卡牌
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} cards
 */
function renderCards(ctx, cards) {
  for (const card of cards) {
    if (card.removed) continue
    const blocked = isBlocked(card, cards)

    // 卡牌底色
    ctx.fillStyle = blocked ? '#636e72' : '#fffdf5'
    ctx.fillRect(card.x, card.y, card.width, card.height)

    // 卡牌边框
    ctx.strokeStyle = blocked ? '#999' : '#c8a96e'
    ctx.lineWidth = 1.5
    ctx.strokeRect(card.x, card.y, card.width, card.height)

    // 图标（图片或文字兖底）
    const iconImg = ICON_IMGS[card.icon]
    if (iconImg) {
      const pad = card.width * CARD_ICON_PAD
      if (blocked) { ctx.globalAlpha = 0.5 }
      ctx.drawImage(iconImg, card.x + pad, card.y + pad, card.width - pad * 2, card.height - pad * 2)
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
  const bottomMargin = Math.round(height * SLOT_BOTTOM)
  const padding = Math.round(width * SLOT_PAD_SCALE)

  const totalSlotWidth = maxSlots * (slotSize + slotGap)
  const slotStartX = (width - totalSlotWidth) / 2
  const slotY = height - slotSize - bottomMargin - padding * 2

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

module.exports = {
  preloadImages,
  generateCards,
  isBlocked,
  renderCards,
  renderSlots
}
