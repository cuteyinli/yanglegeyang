/**
 * 道具模块汇总入口
 *
 * 按索引对应道具区按钮顺序：
 *   0 - 移出（moveOut）
 *   1 - 撤回（undo）
 *   2 - 洗牌（shuffle）
 *   3 - 透视（peek）
 *
 * 用法：
 *   const props = require('./props')
 *   const success = props.use(index, state)
 */

const moveOut = require('./moveOut')
const undo = require('./undo')
const shuffle = require('./shuffle')
const peek = require('./peek')

const PROPS = [moveOut, undo, shuffle, peek]

/**
 * 使用指定道具
 * @param {number} index - 道具索引 0/1/2/3
 * @param {Object} state - 游戏状态 { cards, slots, history, stash }
 * @returns {boolean|string} true=成功，字符串=失败原因
 */
function use(index, state) {
  if (index < 0 || index >= PROPS.length) return '无效道具'
  return PROPS[index].use(state)
}

module.exports = { use }
