const Scene = require('./base')

/**
 * 加载场景
 * 负责预加载游戏资源，显示加载进度
 */
class LoadingScene extends Scene {
  constructor() {
    super()
    this.progress = 0
    this.targetProgress = 0
    this.loaded = false
    this.onComplete = null  // 加载完成回调
    this.bgImg = null
  }

  onEnter() {
    this.progress = 0
    this.targetProgress = 0
    this.loaded = false

    // 加载背景图
    const bg = wx.createImage()
    bg.src = 'images/loading/bgs/loading_bg01.png'
    bg.onload = () => { this.bgImg = bg }

    this._loadResources()
  }

  _loadResources() {
    const images = [
      'images/menu/bgs/menu_bg01.png',
      'images/menu/buttons/button_start.png',
      'images/menu/titles/title.png',
      'images/game/bgs/game_bg01.png'
    ]
    let loadedCount = 0
    const totalCount = images.length

    if (totalCount === 0) {
      this.targetProgress = 100
      return
    }

    images.forEach(src => {
      const img = wx.createImage()
      img.src = src
      img.onload = () => {
        loadedCount++
        this.targetProgress = Math.floor((loadedCount / totalCount) * 100)
      }
      img.onerror = () => {
        loadedCount++
        this.targetProgress = Math.floor((loadedCount / totalCount) * 100)
      }
    })
  }

  update(dt) {
    if (this.progress < this.targetProgress) {
      this.progress = Math.min(this.progress + 2, this.targetProgress)
    }
    if (this.progress >= 100 && !this.loaded) {
      this.loaded = true
      if (this.onComplete) this.onComplete()
    }
  }

  render() {
    const { ctx, width, height } = this

    // 背景
    if (this.bgImg) {
      ctx.drawImage(this.bgImg, 0, 0, width, height)
    } else {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)
    }

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('牛马日记', width / 2, height / 2 - 60)

    const barWidth = width * 0.6
    const barHeight = 12
    const barX = (width - barWidth) / 2
    const barY = height / 2 + 20

    ctx.fillStyle = '#333333'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    ctx.fillStyle = '#4ecca3'
    ctx.fillRect(barX, barY, barWidth * (this.progress / 100), barHeight)

    ctx.fillStyle = '#aaaaaa'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('加载中... ' + this.progress + '%', width / 2, barY + 40)
  }
}

module.exports = LoadingScene
