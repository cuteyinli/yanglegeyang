/**
 * 游戏逻辑模块
 * 负责：点击检测、槽位管理、三消匹配、输赢判定
 */

const cardRender = require('./cardRender')

/**
 * 处理触摸事件，找到被点击的可操作卡牌
 * @param {number} x       - 触摸 x 坐标
 * @param {number} y       - 触摸 y 坐标
 * @param {Array}  cards   - 所有卡牌
 * @returns {Object|null}  被点击的卡牌，未命中返回 null
 */
function handleTouch(x, y, cards) {
  // 从最上层开始检测点击
  for (let i = cards.length - 1; i >= 0; i--) {
    const card = cards[i]
    if (card.removed) continue
    if (x >= card.x && x <= card.x + card.width &&
        y >= card.y && y <= card.y + card.height) {
      // 被遮挡的不能点
      if (cardRender.isBlocked(card, cards)) continue
      return card
    }
  }
  return null
}

/**
 * 将选中的卡牌放入槽位（同类图标相邻插入）
 * @param {Object} card  - 被选中的卡牌
 * @param {Array}  slots - 当前槽位数组（会被原地修改）
 */
function pickCard(card, slots) {
  card.removed = true

  // 插入槽位：找到同类图标旁边插入
  let insertIdx = slots.length
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].icon === card.icon) {
      insertIdx = i + 1
      // 继续往后找连续的同类
      while (insertIdx < slots.length && slots[insertIdx].icon === card.icon) {
        insertIdx++
      }
      break
    }
  }
  slots.splice(insertIdx, 0, { icon: card.icon })
}

/**
 * 检查并消除 3 个相同图标
 * @param {Array} slots - 当前槽位数组
 * @returns {Array} 消除后的新槽位数组
 */
function checkMatch(slots) {
  const counts = {}
  for (const slot of slots) {
    counts[slot.icon] = (counts[slot.icon] || 0) + 1
  }
  let result = slots
  for (const icon in counts) {
    if (counts[icon] >= 3) {
      let removed = 0
      result = result.filter(s => {
        if (s.icon === icon && removed < 3) {
          removed++
          return false
        }
        return true
      })
    }
  }
  return result
}

/**
 * 判断游戏结果
 * @param {Array}  cards    - 所有卡牌
 * @param {Array}  slots    - 当前槽位
 * @param {number} maxSlots - 最大槽位数
 * @param {Array}  [stash]  - 暂存区卡牌
 * @returns {{ gameOver: boolean, gameWin: boolean }}
 */
function checkResult(cards, slots, maxSlots, stash) {
  const gameOver = slots.length >= maxSlots
  const hasStash = stash && stash.length > 0
  const gameWin = cards.every(c => c.removed) && !hasStash
  return { gameOver, gameWin }
}

module.exports = {
  handleTouch,
  pickCard,
  checkMatch,
  checkResult
}
