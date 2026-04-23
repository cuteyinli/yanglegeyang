/**
 * 场景基类
 * 所有场景继承此类，实现对应的生命周期方法
 */
class Scene {
  constructor() {
    this.ctx = GameGlobal.ctx
    this.width = GameGlobal.screenWidth
    this.height = GameGlobal.screenHeight
  }

  onEnter() {}
  onExit() {}
  update(dt) {}
  render() {}
  onTouchStart(x, y) {}
  onTouchMove(x, y) {}
  onTouchEnd(x, y) {}
}

module.exports = Scene
