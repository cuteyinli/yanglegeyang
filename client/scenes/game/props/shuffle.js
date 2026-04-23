/**
 * 道具：洗牌
 *
 * 将棋盘上所有未移除的卡牌的图标随机重新分配，
 * 不改变卡牌位置和层级，只换图标。
 */

function use(state) {
  console.log('[道具] 洗牌')
  return true
}

module.exports = { use }
