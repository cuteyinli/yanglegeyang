/**
 * 道具：透视
 *
 * 点击后进入透视模式，再点击任意顶层卡牌，
 * 该卡牌周围 3×3 区域的最顶层卡牌闪烁透明 3 秒，
 * 可看到底层卡牌。
 *
 * use() 返回 'peek' 通知 game.js 进入透视选择模式。
 */

/**
 * @param {Object} state - { cards, slots, stash }
 * @returns {boolean|string} 'peek'=进入透视模式，字符串=失败原因
 */
function use(state) {
  const { cards } = state
  const remaining = cards.filter(c => !c.removed)
  if (remaining.length === 0) {
    console.log('[道具] 透视：无可透视的卡牌')
    return '无可透视的卡牌'
  }
  console.log('[道具] 透视：进入透视模式')
  return 'peek'
}

module.exports = { use }
