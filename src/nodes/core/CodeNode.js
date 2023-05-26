import Node from './Node.js'

class CodeNode extends Node {
  constructor(code = '', nodeType = 'code') {
    super(nodeType)

    this.code = code

    this._includes = []
  }

  setIncludes(includes) {
    this._includes = includes

    return this
  }

  getIncludes(/*builder*/) {
    return this._includes
  }

  generate(builder) {
    const includes = this.getIncludes(builder)

    for (const include of includes) {
      include.build(builder)
    }

    const nodeCode = builder.getCodeFromNode(this, this.getNodeType(builder))
    nodeCode.code = this.code

    return nodeCode.code
  }
}

CodeNode.prototype.isCodeNode = true

export default CodeNode
