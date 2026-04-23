const Scene = require('./base')
const LEVELS = require('./game/levels')
const cardRender = require('./game/cardRender')
const gameLogic = require('./game/gameLogic')
const props = require('./game/props/index')

/**
 * 游戏核心场景
 * 羊了个羊 三消玩法：多层卡牌 + 底部槽位
 *
 * 职责：场景生命周期、背景/HUD 渲染、关卡切换
 * 卡牌生成与绘制 → cardRender
 * 游戏逻辑 → gameLogic
 * 关卡数据 → levels
 */

// ==================== 屏幕比例参数（统一管理） ====================
// 标题区
const TITLE_FONT_SCALE = 0.055   // 标题字号 = 屏幕宽度 × 5.5%
const TITLE_TOP        = 0.02    // 标题顶部 = 屏幕高度 × 2%

// 结束覆盖层
const END_BIG_FONT     = 0.10    // 大标题字号 = 屏幕宽度 × 10%
const END_BIG_Y        = 0.45    // 大标题位置 = 屏幕高度 × 45%
const END_SMALL_FONT   = 0.05    // 小提示字号 = 屏幕宽度 × 5%
const END_SMALL_Y      = 0.52    // 小提示位置 = 屏幕高度 × 52%
// ========================================================

class GameScene extends Scene {
  constructor() {
    super()
    this.cards = []
    this.slots = []
    this.maxSlots = 7
    this.gameOver = false
    this.gameWin = false
    this.bgImg = null
    this.level = 1
    this.anims = []  // 飞行动画队列
    this.matchFx = []  // 消除特效
    this.particles = [] // 粒子效果
    this.showConfirm = false // 退出确认弹窗
  }

  /** 从菜单进入时重置关卡 */
  onEnter() {
    this.level = 1
    this._startLevel()
  }

  /** 开始当前关卡（不重置 level） */
  _startLevel() {
    this.cards = []
    this.slots = []
    this.gameOver = false
    this.gameWin = false
    this._nextLevel = false

    // 加载背景图
    const bg = wx.createImage()
    bg.src = 'images/game/bgs/game_bg01.png'
    bg.onload = () => { this.bgImg = bg }

    // 预加载卡牌图片
    cardRender.preloadImages()

    // 根据关卡配置生成卡牌
    this.cards = cardRender.generateCards(this.level, this.width, this.height)
  }

  onTouchStart(x, y) {
    // 确认弹窗状态下的点击处理
    if (this.showConfirm) {
      const dlgW = this.width * 0.7
      const dlgH = this.height * 0.22
      const dlgX = (this.width - dlgW) / 2
      const dlgY = (this.height - dlgH) / 2
      const btnW = dlgW * 0.35
      const btnH = dlgH * 0.28
      const btnY = dlgY + dlgH * 0.62
      const cancelX = dlgX + dlgW * 0.12
      const confirmX = dlgX + dlgW * 0.53

      // 点击“确认退出”
      if (x >= confirmX && x <= confirmX + btnW && y >= btnY && y <= btnY + btnH) {
        this.showConfirm = false
        if (this.onBack) this.onBack()
        return
      }
      // 点击“继续游戏”
      if (x >= cancelX && x <= cancelX + btnW && y >= btnY && y <= btnY + btnH) {
        this.showConfirm = false
        return
      }
      // 点击弹窗外也关闭
      if (x < dlgX || x > dlgX + dlgW || y < dlgY || y > dlgY + dlgH) {
        this.showConfirm = false
      }
      return
    }

    // 返回按钮点击检测
    const backSize = Math.round(this.width * 0.09)
    const backX = this.width * 0.03
    const backY = this.height * 0.015
    if (x >= backX && x <= backX + backSize && y >= backY && y <= backY + backSize) {
      this.showConfirm = true
      return
    }

    if (this.gameOver || this.gameWin) {
      if (this.gameWin && this._nextLevel) {
        this._nextLevel = false
        this.level++
        this._startLevel()
      } else {
        if (this.onBack) this.onBack()
      }
      return
    }

    // 道具区点击检测
    for (let i = 0; i < 3; i++) {
      const btn = cardRender.getPropPosition(i, { width: this.width, height: this.height })
      if (x >= btn.x && x <= btn.x + btn.size && y >= btn.y && y <= btn.y + btn.size) {
        props.use(i, { cards: this.cards, slots: this.slots })
        return
      }
    }

    // 动画进行中不响应点击
    if (this.anims.length > 0) return

    // 点击检测
    const card = gameLogic.handleTouch(x, y, this.cards)
    if (!card) return

    // 标记卡牌移除（棋盘上不再显示）
    card.removed = true

    // 计算目标槽位索引（模拟 pickCard 的插入位置）
    let insertIdx = this.slots.length
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].icon === card.icon) {
        insertIdx = i + 1
        while (insertIdx < this.slots.length && this.slots[insertIdx].icon === card.icon) {
          insertIdx++
        }
        break
      }
    }

    // 计算目标位置
    const target = cardRender.getSlotPosition(insertIdx, { width: this.width, height: this.height })

    // 创建飞行动画
    this.anims.push({
      icon: card.icon,
      card: card,
      fromX: card.x,
      fromY: card.y,
      fromW: card.width,
      fromH: card.height,
      toX: target.x,
      toY: target.y,
      toW: target.size,
      toH: target.size,
      progress: 0,
      duration: 250,  // 动画时长 ms
      insertIdx: insertIdx
    })
  }

  update(dt) {
    // 更新飞行动画
    for (let i = this.anims.length - 1; i >= 0; i--) {
      const anim = this.anims[i]
      anim.progress += dt
      if (anim.progress >= anim.duration) {
        // 动画结束，正式放入槽位
        this.slots.splice(anim.insertIdx, 0, { icon: anim.icon })

        // 三消检查（带动效）
        const oldSlots = this.slots.slice()
        this.slots = gameLogic.checkMatch(this.slots)

        // 如果有消除，生成消除特效
        if (this.slots.length < oldSlots.length) {
          this._spawnMatchFx(oldSlots, this.slots)
        }

        // 输赢判定
        const result = gameLogic.checkResult(this.cards, this.slots, this.maxSlots)
        this.gameOver = result.gameOver
        this.gameWin = result.gameWin
        if (this.gameWin && this.level < LEVELS.length) {
          this._nextLevel = true
        }

        this.anims.splice(i, 1)
      }
    }

    // 更新消除特效
    for (let i = this.matchFx.length - 1; i >= 0; i--) {
      this.matchFx[i].progress += dt
      if (this.matchFx[i].progress >= this.matchFx[i].duration) {
        this.matchFx.splice(i, 1)
      }
    }

    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.progress += dt
      p.x += p.vx * (dt / 16)
      p.y += p.vy * (dt / 16)
      p.vy += 0.3  // 重力
      if (p.progress >= p.duration) {
        this.particles.splice(i, 1)
      }
    }
  }

  /** 生成消除特效和粒子 */
  _spawnMatchFx(oldSlots, newSlots) {
    const removedMap = {}
    for (const s of oldSlots) removedMap[s.icon] = (removedMap[s.icon] || 0) + 1
    for (const s of newSlots) removedMap[s.icon] = (removedMap[s.icon] || 0) - 1

    let removedIcon = null
    for (const icon in removedMap) {
      if (removedMap[icon] > 0) { removedIcon = icon; break }
    }
    if (!removedIcon) return

    let count = 0
    for (let i = 0; i < oldSlots.length && count < 3; i++) {
      if (oldSlots[i].icon === removedIcon) {
        const pos = cardRender.getSlotPosition(i, { width: this.width, height: this.height })
        // 闪光缩放特效
        this.matchFx.push({
          x: pos.x, y: pos.y, size: pos.size,
          icon: removedIcon,
          progress: 0, duration: 350
        })
        // 粒子爆发
        const cx = pos.x + pos.size / 2
        const cy = pos.y + pos.size / 2
        const colors = ['#FFD700', '#FF6B6B', '#48DBFB', '#FF9FF3', '#FECA57', '#00D2D3']
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI * 2 / 6) * j + Math.random() * 0.5
          const speed = 2 + Math.random() * 3
          this.particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            radius: 2 + Math.random() * 3,
            color: colors[j % colors.length],
            progress: 0,
            duration: 400 + Math.random() * 200
          })
        }
        count++
      }
    }
  }

  render() {
    const { ctx, width, height } = this

    // 背景
    if (this.bgImg) {
      ctx.drawImage(this.bgImg, 0, 0, width, height)
    } else {
      ctx.fillStyle = '#2d3436'
      ctx.fillRect(0, 0, width, height)
    }

    // 返回按钮
    const backSize = Math.round(width * 0.09)
    const backX = width * 0.03
    const backY = height * 0.015
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.arc(backX + backSize / 2, backY + backSize / 2, backSize / 2, 0, Math.PI * 2)
    ctx.fill()
    // 箭头
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const cx = backX + backSize / 2
    const cy = backY + backSize / 2
    const ar = backSize * 0.22
    ctx.beginPath()
    ctx.moveTo(cx + ar * 0.3, cy - ar)
    ctx.lineTo(cx - ar * 0.7, cy)
    ctx.lineTo(cx + ar * 0.3, cy + ar)
    ctx.stroke()
    ctx.restore()

    // 关卡标题
    const levelIdx = Math.min(this.level - 1, LEVELS.length - 1)
    ctx.fillStyle = '#ffffff'
    const titleSize = Math.round(width * TITLE_FONT_SCALE)
    ctx.font = 'bold ' + titleSize + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(LEVELS[levelIdx].title, width / 2, height * TITLE_TOP)

    // 绘制卡牌
    cardRender.renderCards(ctx, this.cards)

    // 绘制槽位
    cardRender.renderSlots(ctx, this.slots, {
      width, height,
      maxSlots: this.maxSlots
    })

    // 绘制道具区
    cardRender.renderProps(ctx, { width, height })

    // 绘制飞行动画中的卡牌
    for (const anim of this.anims) {
      const t = Math.min(anim.progress / anim.duration, 1)
      // easeOutCubic 缓动
      const ease = 1 - Math.pow(1 - t, 3)
      const cx = anim.fromX + (anim.toX - anim.fromX) * ease
      const cy = anim.fromY + (anim.toY - anim.fromY) * ease
      const cw = anim.fromW + (anim.toW - anim.fromW) * ease
      const ch = anim.fromH + (anim.toH - anim.fromH) * ease

      // 绘制卡牌背景
      ctx.fillStyle = '#fffdf5'
      ctx.fillRect(cx, cy, cw, ch)
      ctx.strokeStyle = '#c8a96e'
      ctx.lineWidth = 1.5
      ctx.strokeRect(cx, cy, cw, ch)

      // 绘制图标
      const iconImg = cardRender.getIconImg(anim.icon)
      if (iconImg) {
        const pad = cw * 0.07
        ctx.drawImage(iconImg, cx + pad, cy + pad, cw - pad * 2, ch - pad * 2)
      }
    }

    // 绘制消除特效
    for (const fx of this.matchFx) {
      const t = fx.progress / fx.duration
      const scale = 1 + t * 0.4          // 放大到 1.4 倍
      const alpha = 1 - t                 // 淡出
      const cx = fx.x + fx.size / 2
      const cy = fx.y + fx.size / 2
      const sw = fx.size * scale
      const sh = fx.size * scale

      ctx.save()
      ctx.globalAlpha = alpha
      // 白色闪光底
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(cx - sw / 2, cy - sh / 2, sw, sh)
      // 卡牌图标
      const iconImg = cardRender.getIconImg(fx.icon)
      if (iconImg) {
        const pad = sw * 0.07
        ctx.drawImage(iconImg, cx - sw / 2 + pad, cy - sh / 2 + pad, sw - pad * 2, sh - pad * 2)
      }
      ctx.restore()
    }

    // 绘制粒子
    for (const p of this.particles) {
      const t = p.progress / p.duration
      const alpha = 1 - t
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius * (1 - t * 0.5), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // 游戏结束/胜利覆盖层
    if (this.gameOver || this.gameWin) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = this.gameWin ? '#00b894' : '#d63031'
      const bigFont = Math.round(width * END_BIG_FONT)
      ctx.font = 'bold ' + bigFont + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.gameWin ? '恭喜通关！' : '游戏结束', width / 2, height * END_BIG_Y)

      ctx.fillStyle = '#ffffff'
      const smallFont = Math.round(width * END_SMALL_FONT)
      ctx.font = smallFont + 'px sans-serif'
      if (this.gameWin && this._nextLevel) {
        ctx.fillText('点击屏幕进入下一关', width / 2, height * END_SMALL_Y)
      } else {
        ctx.fillText('点击屏幕返回主菜单', width / 2, height * END_SMALL_Y)
      }
    }
    // 退出确认弹窗
    if (this.showConfirm) {
      // 蒙层
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, width, height)

      // 弹窗
      const dlgW = width * 0.7
      const dlgH = height * 0.22
      const dlgX = (width - dlgW) / 2
      const dlgY = (height - dlgH) / 2
      const r = 12

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(dlgX + r, dlgY)
      ctx.arcTo(dlgX + dlgW, dlgY, dlgX + dlgW, dlgY + dlgH, r)
      ctx.arcTo(dlgX + dlgW, dlgY + dlgH, dlgX, dlgY + dlgH, r)
      ctx.arcTo(dlgX, dlgY + dlgH, dlgX, dlgY, r)
      ctx.arcTo(dlgX, dlgY, dlgX + dlgW, dlgY, r)
      ctx.closePath()
      ctx.fill()

      // 标题
      ctx.fillStyle = '#333333'
      const dlgFont = Math.round(width * 0.045)
      ctx.font = 'bold ' + dlgFont + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('确认退出游戏？', width / 2, dlgY + dlgH * 0.3)

      // 按钮
      const btnW = dlgW * 0.35
      const btnH = dlgH * 0.28
      const btnY = dlgY + dlgH * 0.62
      const btnR = 8
      const btnFont = Math.round(width * 0.035)

      // 继续游戏按钮
      const cancelX = dlgX + dlgW * 0.12
      ctx.fillStyle = '#e0e0e0'
      ctx.beginPath()
      ctx.moveTo(cancelX + btnR, btnY)
      ctx.arcTo(cancelX + btnW, btnY, cancelX + btnW, btnY + btnH, btnR)
      ctx.arcTo(cancelX + btnW, btnY + btnH, cancelX, btnY + btnH, btnR)
      ctx.arcTo(cancelX, btnY + btnH, cancelX, btnY, btnR)
      ctx.arcTo(cancelX, btnY, cancelX + btnW, btnY, btnR)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#333'
      ctx.font = btnFont + 'px sans-serif'
      ctx.fillText('继续游戏', cancelX + btnW / 2, btnY + btnH / 2)

      // 确认退出按钮
      const confirmX = dlgX + dlgW * 0.53
      ctx.fillStyle = '#ff6b6b'
      ctx.beginPath()
      ctx.moveTo(confirmX + btnR, btnY)
      ctx.arcTo(confirmX + btnW, btnY, confirmX + btnW, btnY + btnH, btnR)
      ctx.arcTo(confirmX + btnW, btnY + btnH, confirmX, btnY + btnH, btnR)
      ctx.arcTo(confirmX, btnY + btnH, confirmX, btnY, btnR)
      ctx.arcTo(confirmX, btnY, confirmX + btnW, btnY, btnR)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.fillText('确认退出', confirmX + btnW / 2, btnY + btnH / 2)
    }
  }
}

module.exports = GameScene
