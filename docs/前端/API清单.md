# 微信小游戏 API 清单

本项目用到的微信小游戏 API 按功能分类整理如下。

---

## 1. 画布与渲染

游戏所有内容都绘制在 Canvas 上，这是最核心的 API。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.createCanvas()` | 创建游戏主画布 | 游戏启动时创建，全局唯一 |
| `canvas.getContext('2d')` | 获取 2D 渲染上下文 | 绑定 ctx 后绘制所有内容 |
| `requestAnimationFrame(cb)` | 请求下一帧回调 | 驱动游戏主循环（60fps） |
| `cancelAnimationFrame(id)` | 取消帧回调 | 暂停游戏时停止循环 |

**示例：**
```js
const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // 绘制逻辑...
  requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)
```

---

## 2. 图片资源

用于加载卡片图标、背景图等游戏素材。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.createImage()` | 创建 Image 对象 | 加载 png/jpg 图片资源 |
| `image.src` | 设置图片路径 | 指定要加载的图片 |
| `image.onload` | 图片加载完成回调 | Loading 场景统计加载进度 |
| `image.onerror` | 图片加载失败回调 | 错误处理 |
| `ctx.drawImage()` | 将图片绘制到画布 | 渲染卡片、背景等 |

**示例：**
```js
const img = wx.createImage()
img.src = 'images/card.png'
img.onload = () => {
  ctx.drawImage(img, x, y, width, height)
}
```

---

## 3. 触摸事件

小游戏没有鼠标，全靠触摸事件响应玩家操作。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.onTouchStart(cb)` | 手指触摸屏幕 | 检测玩家点击了哪张卡片 |
| `wx.onTouchMove(cb)` | 手指在屏幕上移动 | 预留拖拽功能 |
| `wx.onTouchEnd(cb)` | 手指离开屏幕 | 确认点击操作 |
| `wx.offTouchStart(cb)` | 取消触摸监听 | 场景切换时清理事件 |

**回调参数：**
```js
wx.onTouchStart((e) => {
  const touch = e.touches[0]
  const x = touch.clientX  // 触摸点 X 坐标
  const y = touch.clientY  // 触摸点 Y 坐标
})
```

---

## 4. 系统信息

获取设备信息，用于屏幕适配。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.getSystemInfoSync()` | 同步获取系统信息 | 启动时获取屏幕宽高 |
| `wx.getWindowInfo()` | 获取窗口信息 | 获取可用区域尺寸 |
| `wx.getDeviceInfo()` | 获取设备信息 | 判断设备类型 |

**常用字段：**
```js
const info = wx.getSystemInfoSync()
info.screenWidth   // 屏幕宽度（px）
info.screenHeight  // 屏幕高度（px）
info.pixelRatio    // 设备像素比
info.platform      // 平台：ios / android / devtools
```

---

## 5. 网络请求

与后端 API 通信，用于登录、获取关卡、提交成绩等。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.request()` | 发起 HTTP 请求 | 调用后端所有接口 |

**示例：**
```js
wx.request({
  url: 'https://your-server.com/api/level/config',
  method: 'GET',
  header: {
    'Authorization': `Bearer ${token}`
  },
  success(res) {
    console.log(res.data)
  },
  fail(err) {
    console.error('请求失败', err)
  }
})
```

---

## 6. 登录与用户

微信登录体系，获取用户身份。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.login()` | 获取登录 code | 启动时调用，code 发给后端换 openid |
| `wx.getUserInfo()` | 获取用户信息（需授权） | 获取昵称、头像 |

**登录流程：**
```js
wx.login({
  success(res) {
    const code = res.code
    // 将 code 发送给后端，换取 token
    wx.request({
      url: 'https://your-server.com/api/auth/login',
      method: 'POST',
      data: { code },
      success(res) {
        const token = res.data.token
        wx.setStorageSync('token', token)
      }
    })
  }
})
```

---

## 7. 本地存储

在设备本地保存数据，断网也能用。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.setStorageSync(key, value)` | 同步写入本地存储 | 保存 token、游戏设置 |
| `wx.getStorageSync(key)` | 同步读取本地存储 | 读取已保存的数据 |
| `wx.removeStorageSync(key)` | 同步删除本地存储 | 清除登录态 |

**示例：**
```js
// 保存设置
wx.setStorageSync('settings', { sound: true, music: true })

// 读取设置
const settings = wx.getStorageSync('settings')
```

---

## 8. 音频

背景音乐和消除音效。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.createInnerAudioContext()` | 创建音频实例 | 播放音效和背景音乐 |
| `audio.src` | 设置音频路径 | 指定音频文件 |
| `audio.play()` | 播放 | 触发消除时播放音效 |
| `audio.pause()` | 暂停 | 游戏暂停时静音 |
| `audio.loop` | 是否循环 | 背景音乐设为 true |

**示例：**
```js
// 背景音乐
const bgm = wx.createInnerAudioContext()
bgm.src = 'audio/bgm.mp3'
bgm.loop = true
bgm.play()

// 消除音效
const sfx = wx.createInnerAudioContext()
sfx.src = 'audio/match.mp3'
sfx.play()  // 每次消除时调用
```

---

## 9. 分享

支持分享到好友和群。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.shareAppMessage()` | 主动分享 | 结算页点击分享按钮 |
| `wx.onShareAppMessage(cb)` | 监听右上角分享 | 设置分享内容 |
| `wx.showShareMenu()` | 显示分享菜单 | 启用分享功能 |

**示例：**
```js
wx.onShareAppMessage(() => ({
  title: '羊了个羊 - 你能过第二关吗？',
  imageUrl: 'images/share.png'
}))
```

---

## 10. 界面

菜单样式、Loading 提示等。

| API | 说明 | 使用场景 |
|-----|------|---------|
| `wx.setMenuStyle()` | 设置菜单按钮样式 | 适配深色/浅色主题 |
| `wx.showToast()` | 显示提示框 | 操作反馈（如"已保存"） |
| `wx.showModal()` | 显示确认弹窗 | 退出游戏确认 |
| `wx.showLoading()` | 显示加载动画 | 网络请求等待时 |

---

## 优先级总结

| 优先级 | API 分类 | 原因 |
|--------|---------|------|
| P0 必须 | 画布渲染、图片、触摸事件 | 没有这些游戏跑不起来 |
| P1 重要 | 系统信息、网络请求、登录 | 适配和用户体系 |
| P2 增强 | 音频、本地存储 | 提升游戏体验 |
| P3 锦上添花 | 分享、界面 | 传播和美化 |
