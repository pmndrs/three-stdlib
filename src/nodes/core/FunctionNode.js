import CodeNode from './CodeNode.js'
import FunctionCallNode from './FunctionCallNode.js'

class FunctionNode extends CodeNode {
  constructor(code = '') {
    super(code)

    this.keywords = {}
  }

  getNodeType(builder) {
    return this.getNodeFunction(builder).type
  }

  getInputs(builder) {
    return this.getNodeFunction(builder).inputs
  }

  getNodeFunction(builder) {
    const nodeData = builder.getDataFromNode(this)

    let nodeFunction = nodeData.nodeFunction

    if (nodeFunction === undefined) {
      nodeFunction = builder.parser.parseFunction(this.code)

      nodeData.nodeFunction = nodeFunction
    }

    return nodeFunction
  }

  call(parameters = {}) {
    return new FunctionCallNode(this, parameters)
  }

  generate(builder, output) {
    super.generate(builder)

    const nodeFunction = this.getNodeFunction(builder)

    const name = nodeFunction.name
    const type = nodeFunction.type

    const nodeCode = builder.getCodeFromNode(this, type)

    if (name !== '') {
      // use a custom property name

      nodeCode.name = name
    }

    const propertyName = builder.getPropertyName(nodeCode)

    let code = this.getNodeFunction(builder).getCode(propertyName)

    const keywords = this.keywords
    const keywordsProperties = Object.keys(keywords)

    if (keywordsProperties.length > 0) {
      for (const property of keywordsProperties) {
        const propertyRegExp = new RegExp(`\\b${property}\\b`, 'g')
        const nodeProperty = keywords[property].build(builder, 'property')

        code = code.replace(propertyRegExp, nodeProperty)
      }
    }

    nodeCode.code = code

    if (output === 'property') {
      return propertyName
    } else {
      return builder.format(`${propertyName}()`, type, output)
    }
  }
}

export default FunctionNode
