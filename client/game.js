require('./global')

const LoadingScene = require('./scenes/loading')
const MenuScene = require('./scenes/menu')
const GameScene = require('./scenes/game')

// 初始化画布
const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')
const windowInfo = wx.getWindowInfo()
const deviceInfo = wx.getDeviceInfo()

// 存入全局
GameGlobal.canvas = canvas
GameGlobal.ctx = ctx
GameGlobal.screenWidth = windowInfo.screenWidth
GameGlobal.screenHeight = windowInfo.screenHeight
GameGlobal.pixelRatio = windowInfo.pixelRatio || deviceInfo.pixelRatio

// ==================== 场景管理 ====================
let currentScene = null

function switchScene(scene) {
  if (currentScene && currentScene.onExit) currentScene.onExit()
  currentScene = scene
  if (currentScene && currentScene.onEnter) currentScene.onEnter()
}

// 创建场景实例
const loadingScene = new LoadingScene()
const menuScene = new MenuScene()
const gameScene = new GameScene()

// 场景跳转链接
loadingScene.onComplete = () => switchScene(menuScene)
menuScene.onStartGame = () => switchScene(gameScene)
gameScene.onBack = () => switchScene(menuScene)

// ==================== 触摸事件 ====================
wx.onTouchStart((e) => {
  const touch = e.touches[0]
  if (currentScene && currentScene.onTouchStart) {
    currentScene.onTouchStart(touch.clientX, touch.clientY)
  }
})

// ==================== 游戏主循环 ====================
let lastTime = Date.now()

function gameLoop() {
  const now = Date.now()
  const dt = now - lastTime
  lastTime = now

  if (currentScene) {
    if (currentScene.update) currentScene.update(dt)
    if (currentScene.render) currentScene.render()
  }

  requestAnimationFrame(gameLoop)
}

// 启动
switchScene(loadingScene)
requestAnimationFrame(gameLoop)
