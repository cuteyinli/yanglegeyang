/**
 * 关卡配置汇总入口
 *
 * 每关配置独立存放在 levels/ 文件夹下
 * 新增关卡只需：1. 在 levels/ 下新建 levelN.js  2. 在此处 require 加入数组
 *
 * 每个关卡文件包含：
 *   title     - 关卡标题（用于 HUD 显示）
 *   iconTypes - 使用的图标种类数
 *   cardSize  - 卡牌尺寸 = 屏幕宽度 × cardSize（关卡级统一）
 *   regions   - 多区域布局数组，每个 region 包含：
 *     x, y    - 区域左上角（相对卡牌可用区域的比例 0~1）
 *     layers  - 该区域的卡牌层数据，每层包含：
 *       layer    - 层级编号
 *       gapRatio - 间距占卡牌尺寸的比例
 *       offsetCol/offsetRow - 层偏移（网格单位）
 *       cards    - 卡牌位置数组 { col, row }
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
