/**
 * 关卡配置汇总入口
 *
 * 每关配置独立存放在 levels/ 文件夹下
 * 新增关卡只需：1. 在 levels/ 下新建 levelN.js  2. 在此处 require 加入数组
 *
 * 每个关卡文件包含：
 *   title     - 关卡标题（用于 HUD 显示）
 *   iconTypes - 使用的图标种类数
 *   cardScale - 卡牌尺寸 = 屏幕宽度 × cardScale
 *   gapScale  - 卡牌间距 = 屏幕宽度 × gapScale
 *   boardTop  - 棋盘顶部 = 屏幕高度 × boardTop
 *   layers    - 卡牌层数据数组
 *
 * 规则约束：
 *   - 总卡牌数必须是 3 的倍数
 *   - iconTypes × triplets × 3 = 总卡牌数
 */

const LEVELS = [
  require('./levels/level1'),
  require('./levels/level2'),
]

module.exports = LEVELS
