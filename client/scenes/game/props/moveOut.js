/**
 * 道具：移出
 *
 * 将槽位中的卡牌移到临时暂存区（不占主槽位空间）。
 * 暂存区最多容纳 3 张，每次移出补满至 3 张。
 * 暂存区已满 3 张或槽位为空时不可使用。
 */

const STASH_MAX = 3

/**
 * @param {Object} state - { cards, slots, stash }
 *   stash: 暂存区数组（由 game.js 维护）
 * @returns {boolean|string} true=成功，字符串=失败原因
 */
function use(state) {
  const { slots, stash } = state

  // 暂存区已满
  if (stash && stash.length >= STASH_MAX) {
    console.log('[道具] 移出：暂存区已满')
    return '暂存区已满'
  }

  // 槽位为空，无牌可移
  if (!slots || slots.length === 0) {
    console.log('[道具] 移出：槽位为空')
    return '槽位为空'
  }

  // 计算需要移出的数量：补满暂存区至 3 张
  const need = STASH_MAX - (stash ? stash.length : 0)
  const count = Math.min(need, slots.length)
  const moved = slots.splice(0, count)
  for (const card of moved) {
    stash.push(card)
  }

  console.log('[道具] 移出成功，移出 ' + count + ' 张')
  return true
}

module.exports = { use }
