/**
 * 道具：撤回
 *
 * 撤回上一步操作：将最后放入槽位的卡牌
 * 恢复到棋盘原来的位置。
 */

/**
 * @param {Object} state - { cards, slots, history, stash }
 *   history: [{ card, insertIdx?, fromStash? }]
 * @returns {boolean|string} true=成功，字符串=失败原因
 */
function use(state) {
  const { slots, history, stash } = state
  if (!history || history.length === 0) {
    console.log('[道具] 撤回：无可撤回的操作')
    return '无可撤回的操作'
  }

  // 弹出最后一次操作（先预检，不直接 pop）
  const last = history[history.length - 1]
  const card = last.card

  // 若要退回暂存区，检查暂存区是否已满
  if (last.fromStash && stash && stash.length >= 3) {
    console.log('[道具] 撤回：暂存区卡牌已满')
    return '暂存区卡牌已满'
  }

  // 预检通过，正式弹出
  history.pop()

  // 从槽位中移除该卡牌（找到同图标的最后一张）
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i].icon === card.icon) {
      slots.splice(i, 1)
      break
    }
  }

  if (last.fromStash) {
    // 来自暂存区的卡牌，退回暂存区
    stash.push(card)
    console.log('[道具] 撤回成功（回到暂存区）')
  } else {
    // 来自棋盘的卡牌，退回棋盘
    card.removed = false
    console.log('[道具] 撤回成功（回到棋盘）')
  }

  return true
}

module.exports = { use }
