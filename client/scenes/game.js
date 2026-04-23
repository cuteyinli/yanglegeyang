const Scene = require('./base')
const LEVELS = require('./game/levels')
const cardRender = require('./game/cardRender')
const gameLogic = require('./game/gameLogic')

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
  }

  onEnter() {
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
    if (this.gameOver || this.gameWin) {
      if (this.gameWin && this._nextLevel) {
        this._nextLevel = false
        this.level++
        this.onEnter()
      } else {
        if (this.onBack) this.onBack()
      }
      return
    }

    // 点击检测
    const card = gameLogic.handleTouch(x, y, this.cards)
    if (!card) return

    // 放入槽位
    gameLogic.pickCard(card, this.slots)

    // 三消检查
    this.slots = gameLogic.checkMatch(this.slots)

    // 输赢判定
    const result = gameLogic.checkResult(this.cards, this.slots, this.maxSlots)
    this.gameOver = result.gameOver
    this.gameWin = result.gameWin

    // 通关后进入下一关
    if (this.gameWin && this.level < LEVELS.length) {
      this._nextLevel = true
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
  }
}

module.exports = GameScene
