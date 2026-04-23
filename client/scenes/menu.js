const Scene = require('./base')

/**
 * 主菜单场景
 * 显示游戏标题和功能按钮
 */
class MenuScene extends Scene {
  constructor() {
    super()
    this.startBtn = null
    this.startImg = null
    this.bgImg = null
  }

  onEnter() {
    const btnWidth = this.width * 0.5
    const btnHeight = 60

    this.startBtn = {
      text: '开始游戏',
      x: (this.width - btnWidth) / 2,
      y: this.height * 0.75,
      width: btnWidth,
      height: btnHeight,
      action: 'start'
    }

    // 加载背景图
    const bg = wx.createImage()
    bg.src = 'images/menu/bgs/menu_bg01.png'
    bg.onload = () => { this.bgImg = bg }

    // 加载按钮图片
    const img = wx.createImage()
    img.src = 'images/menu/buttons/button_start.png'
    img.onload = () => {
      this.startImg = img
      const ratio = img.width / img.height
      this.startBtn.height = this.startBtn.width / ratio
      this.startBtn.x = (this.width - this.startBtn.width) / 2
      this.startBtn.y = this.height * 0.75
    }
    img.onerror = () => {
      this.startImg = null
    }
  }

  onTouchStart(x, y) {
    const btn = this.startBtn
    if (btn && x >= btn.x && x <= btn.x + btn.width &&
        y >= btn.y && y <= btn.y + btn.height) {
      console.log('点击了: 开始游戏')
      if (this.onStartGame) this.onStartGame()
    }
  }

  update(dt) {}

  render() {
    const { ctx, width, height } = this

    // 背景
    if (this.bgImg) {
      ctx.drawImage(this.bgImg, 0, 0, width, height)
    } else {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)
    }

    // 开始游戏按钮
    const btn = this.startBtn
    if (this.startImg) {
      ctx.drawImage(this.startImg, btn.x, btn.y, btn.width, btn.height)
    } else {
      ctx.beginPath()
      const r = 10
      ctx.moveTo(btn.x + r, btn.y)
      ctx.arcTo(btn.x + btn.width, btn.y, btn.x + btn.width, btn.y + btn.height, r)
      ctx.arcTo(btn.x + btn.width, btn.y + btn.height, btn.x, btn.y + btn.height, r)
      ctx.arcTo(btn.x, btn.y + btn.height, btn.x, btn.y, r)
      ctx.arcTo(btn.x, btn.y, btn.x + btn.width, btn.y, r)
      ctx.closePath()
      ctx.fillStyle = '#4ecca3'
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2)
    }
  }
}

module.exports = MenuScene
