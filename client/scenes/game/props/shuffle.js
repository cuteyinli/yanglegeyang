/**
 * 道具：洗牌
 *
 * 将棋盘上所有未移除的卡牌的图标随机重新分配，
 * 不改变卡牌位置和层级，只换图标。
 * 保证洗牌后每种图标数量不变（仍可消除）。
 */

/** Fisher-Yates 洗牌 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * @param {Object} state - { cards, slots, stash }
 * @returns {boolean|string} true=成功，字符串=失败原因
 */
function use(state) {
  const { cards } = state

  // 收集所有未移除卡牌的图标
  const remaining = cards.filter(c => !c.removed)
  if (remaining.length === 0) {
    console.log('[道具] 洗牌：无可洗的卡牌')
    return '无可洗的卡牌'
  }

  // 提取图标并打乱
  const icons = remaining.map(c => c.icon)
  shuffleArray(icons)

  // 重新分配图标
  for (let i = 0; i < remaining.length; i++) {
    remaining[i].icon = icons[i]
  }

  console.log('[道具] 洗牌成功，打乱 ' + remaining.length + ' 张卡牌')
  return true
}

module.exports = { use }
