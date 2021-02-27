import { FunctionNode } from './FunctionNode'

function ExpressionNode(src, type, keywords, extensions, includes) {
  FunctionNode.call(this, src, includes, extensions, keywords, type)
}

ExpressionNode.prototype = Object.create(FunctionNode.prototype)
ExpressionNode.prototype.constructor = ExpressionNode
ExpressionNode.prototype.nodeType = 'Expression'

export { ExpressionNode }
