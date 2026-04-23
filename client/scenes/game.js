const Scene = require('./base')

/**
 * 游戏核心场景
 * 羊了个羊 三消玩法：多层卡牌 + 底部槽位
 */

// 卡牌图标（16种动物卡牌图片）
const ICON_COUNT = 16
const ICON_IMGS = {}  // { '1': Image, '2': Image, ... }

class GameScene extends Scene {
  constructor() {
    super()
    this.cards = []       // 所有卡牌
    this.slots = []       // 底部槽位（最多7张）
    this.maxSlots = 7
    this.gameOver = false
    this.gameWin = false
    this.bgImg = null

    // 布局参数
    this.cardSize = 44
    this.slotHeight = 64
  }

  onEnter() {
    this.cards = []
    this.slots = []
    this.gameOver = false
    this.gameWin = false

    // 加载背景图
    const bg = wx.createImage()
    bg.src = 'images/game/bgs/game_bg01.png'
    bg.onload = () => { this.bgImg = bg }

    // 预加载卡牌图片
    for (let i = 1; i <= ICON_COUNT; i++) {
      const img = wx.createImage()
      img.src = 'images/game/cards/animals/' + i + '.png'
      img.onload = () => { ICON_IMGS[String(i)] = img }
    }

    this._generateCards()
  }

  /** 生成羊了个羊风格的多层卡牌 */
  _generateCards() {
    const size = this.cardSize
    const half = size / 2

    // 每种图标生成 3 的倍数张，保证可以消除
    const pool = []
    const triplesPerIcon = 2  // 每种图标 2 组 × 3 张 = 6 张，16种 = 96 张
    for (let i = 1; i <= ICON_COUNT; i++) {
      for (let j = 0; j < triplesPerIcon * 3; j++) {
        pool.push(String(i))
      }
    }
    // 洗牌
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }

    // 棋盘可用区域（在背景图的中间框内）
    const boardLeft = this.width * 0.1
    const boardRight = this.width * 0.9
    const boardTop = this.height * 0.1
    const boardBottom = this.height * 0.7
    const boardW = boardRight - boardLeft
    const boardH = boardBottom - boardTop

    // 定义每层的布局（行列数 + 偏移）—— 模拟羊了个羊的交错堆叠
    const layerConfigs = [
      { cols: 6, rows: 6, offsetX: 0, offsetY: 0 },           // 底层：6×6 整齐网格
      { cols: 5, rows: 5, offsetX: half, offsetY: half },      // 中层：5×5 偏移半卡
      { cols: 4, rows: 4, offsetX: size, offsetY: size },      // 顶层：4×4 再偏移
    ]

    let idx = 0
    for (let layer = 0; layer < layerConfigs.length && idx < pool.length; layer++) {
      const cfg = layerConfigs[layer]
      // 计算该层的网格间距，让卡牌均匀分布在棋盘区域
      const gapX = (boardW - cfg.offsetX * 2 - size) / (cfg.cols - 1)
      const gapY = (boardH - cfg.offsetY * 2 - size) / (cfg.rows - 1)

      for (let row = 0; row < cfg.rows && idx < pool.length; row++) {
        for (let col = 0; col < cfg.cols && idx < pool.length; col++) {
          // 每张卡加一点随机偏移，让布局不那么死板
          const jitterX = (Math.random() - 0.5) * half * 0.4
          const jitterY = (Math.random() - 0.5) * half * 0.4

          this.cards.push({
            icon: pool[idx],
            x: boardLeft + cfg.offsetX + col * gapX + jitterX,
            y: boardTop + cfg.offsetY + row * gapY + jitterY,
            width: size,
            height: size,
            layer: layer,
            removed: false
          })
          idx++
        }
      }
    }
  }

  /** 判断卡牌是否被上层遮挡（基于矩形重叠面积） */
  _isBlocked(card) {
    const threshold = card.width * card.height * 0.15  // 重叠超过 15% 算遮挡
    for (const other of this.cards) {
      if (other.removed || other.layer <= card.layer) continue
      // 计算两张卡的重叠面积
      const overlapX = Math.max(0, Math.min(card.x + card.width, other.x + other.width) - Math.max(card.x, other.x))
      const overlapY = Math.max(0, Math.min(card.y + card.height, other.y + other.height) - Math.max(card.y, other.y))
      if (overlapX * overlapY > threshold) {
        return true
      }
    }
    return false
  }

  onTouchStart(x, y) {
    if (this.gameOver || this.gameWin) {
      if (this.onBack) this.onBack()
      return
    }

    // 从最上层开始检测点击
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i]
      if (card.removed) continue
      if (x >= card.x && x <= card.x + card.width &&
          y >= card.y && y <= card.y + card.height) {
        // 被遮挡的不能点
        if (this._isBlocked(card)) continue
        this._pickCard(card)
        break
      }
    }
  }

  /** 选中卡牌放入槽位 */
  _pickCard(card) {
    card.removed = true

    // 插入槽位：找到同类图标旁边插入
    let insertIdx = this.slots.length
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].icon === card.icon) {
        insertIdx = i + 1
        // 继续往后找连续的同类
        while (insertIdx < this.slots.length && this.slots[insertIdx].icon === card.icon) {
          insertIdx++
        }
        break
      }
    }
    this.slots.splice(insertIdx, 0, { icon: card.icon })

    // 检查是否有 3 个相同的可以消除
    this._checkMatch()

    // 检查输赢
    if (this.slots.length >= this.maxSlots) {
      this.gameOver = true
    }
    if (this.cards.every(c => c.removed)) {
      this.gameWin = true
    }
  }

  /** 消除 3 个相同图标 */
  _checkMatch() {
    const counts = {}
    for (const slot of this.slots) {
      counts[slot.icon] = (counts[slot.icon] || 0) + 1
    }
    for (const icon in counts) {
      if (counts[icon] >= 3) {
        // 移除 3 个
        let removed = 0
        this.slots = this.slots.filter(s => {
          if (s.icon === icon && removed < 3) {
            removed++
            return false
          }
          return true
        })
      }
    }
  }

  update(dt) {}

  render() {
    const { ctx, width, height } = this

    // 背景
    if (this.bgImg) {
      ctx.drawImage(this.bgImg, 0, 0, width, height)
    } else {
      ctx.fillStyle = '#2d3436'
      ctx.fillRect(0, 0, width, height)
    }

    // 绘制卡牌（按层从底到上）
    for (const card of this.cards) {
      if (card.removed) continue
      const blocked = this._isBlocked(card)

      // 卡牌底色
      ctx.fillStyle = blocked ? '#636e72' : '#fffdf5'
      ctx.fillRect(card.x, card.y, card.width, card.height)

      // 卡牌边框
      ctx.strokeStyle = blocked ? '#999' : '#c8a96e'
      ctx.lineWidth = 1.5
      ctx.strokeRect(card.x, card.y, card.width, card.height)

      // 图标（图片或文字兑底）
      const iconImg = ICON_IMGS[card.icon]
      if (iconImg) {
        const pad = 4
        if (blocked) { ctx.globalAlpha = 0.5 }
        ctx.drawImage(iconImg, card.x + pad, card.y + pad, card.width - pad * 2, card.height - pad * 2)
        if (blocked) { ctx.globalAlpha = 1.0 }
      } else {
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = blocked ? '#999999' : '#000000'
        ctx.fillText(card.icon, card.x + card.width / 2, card.y + card.height / 2)
      }
    }

    // ==================== 底部槽位 ====================
    const slotY = height - this.slotHeight - 30
    const slotSize = this.cardSize
    const totalSlotWidth = this.maxSlots * (slotSize + 6)
    const slotStartX = (width - totalSlotWidth) / 2

    // 槽位背景
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    const padding = 8
    ctx.fillRect(slotStartX - padding, slotY - padding,
      totalSlotWidth + padding * 2, slotSize + padding * 2)

    // 画空槽位
    for (let i = 0; i < this.maxSlots; i++) {
      const sx = slotStartX + i * (slotSize + 6)
      ctx.fillStyle = '#44555566'
      ctx.fillRect(sx, slotY, slotSize, slotSize)
      ctx.strokeStyle = '#ffffff33'
      ctx.lineWidth = 1
      ctx.strokeRect(sx, slotY, slotSize, slotSize)
    }

    // 画已放入的卡牌
    for (let i = 0; i < this.slots.length; i++) {
      const sx = slotStartX + i * (slotSize + 6)
      // 画已放入的卡牌
      const iconImg = ICON_IMGS[this.slots[i].icon]
      ctx.fillStyle = '#fffdf5'
      ctx.fillRect(sx, slotY, slotSize, slotSize)
      ctx.strokeStyle = '#c8a96e'
      ctx.lineWidth = 1
      ctx.strokeRect(sx, slotY, slotSize, slotSize)
      if (iconImg) {
        const pad = 3
        ctx.drawImage(iconImg, sx + pad, slotY + pad, slotSize - pad * 2, slotSize - pad * 2)
      } else {
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#000000'
        ctx.fillText(this.slots[i].icon, sx + slotSize / 2, slotY + slotSize / 2)
      }
    }

    // ==================== 游戏结束/胜利 ====================
    if (this.gameOver || this.gameWin) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = this.gameWin ? '#00b894' : '#d63031'
      ctx.font = 'bold 40px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.gameWin ? '恭喜通关！' : '游戏结束', width / 2, height / 2 - 30)

      ctx.fillStyle = '#ffffff'
      ctx.font = '20px sans-serif'
      ctx.fillText('点击屏幕返回主菜单', width / 2, height / 2 + 20)
    }
  }
}

module.exports = GameScene
