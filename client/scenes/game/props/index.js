/**
 * 道具模块汇总入口
 *
 * 按索引对应道具区按钮顺序：
 *   0 - 移出（moveOut）
 *   1 - 撤回（undo）
 *   2 - 洗牌（shuffle）
 *
 * 用法：
 *   const props = require('./props')
 *   const success = props.use(index, state)
 */

const moveOut = require('./moveOut')
const undo = require('./undo')
const shuffle = require('./shuffle')

const PROPS = [moveOut, undo, shuffle]

/**
 * 使用指定道具
 * @param {number} index - 道具索引 0/1/2
 * @param {Object} state - 游戏状态 { cards, slots, history, stash }
 * @returns {boolean} 是否成功使用
 */
function use(index, state) {
  if (index < 0 || index >= PROPS.length) return false
  return PROPS[index].use(state)
}

module.exports = { use }
