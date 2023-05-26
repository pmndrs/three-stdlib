import { Loader } from 'three'
// core
import ArrayUniformNode from '../core/ArrayUniformNode.js'
import AttributeNode from '../core/AttributeNode.js'
import BypassNode from '../core/BypassNode.js'
import CodeNode from '../core/CodeNode.js'
import ConstNode from '../core/ConstNode.js'
import ContextNode from '../core/ContextNode.js'
import ExpressionNode from '../core/ExpressionNode.js'
import FunctionCallNode from '../core/FunctionCallNode.js'
import FunctionNode from '../core/FunctionNode.js'
import Node from '../core/Node.js'
import NodeAttribute from '../core/NodeAttribute.js'
import NodeBuilder from '../core/NodeBuilder.js'
import NodeCode from '../core/NodeCode.js'
import NodeFrame from '../core/NodeFrame.js'
import NodeFunctionInput from '../core/NodeFunctionInput.js'
import NodeKeywords from '../core/NodeKeywords.js'
import NodeUniform from '../core/NodeUniform.js'
import NodeVar from '../core/NodeVar.js'
import NodeVary from '../core/NodeVary.js'
import PropertyNode from '../core/PropertyNode.js'
import TempNode from '../core/TempNode.js'
import UniformNode from '../core/UniformNode.js'
import VarNode from '../core/VarNode.js'
import VaryNode from '../core/VaryNode.js'

// accessors
import BufferNode from '../accessors/BufferNode.js'
import CameraNode from '../accessors/CameraNode.js'
import CubeTextureNode from '../accessors/CubeTextureNode.js'
import MaterialNode from '../accessors/MaterialNode.js'
import MaterialReferenceNode from '../accessors/MaterialReferenceNode.js'
import ModelNode from '../accessors/ModelNode.js'
import ModelViewProjectionNode from '../accessors/ModelViewProjectionNode.js'
import NormalNode from '../accessors/NormalNode.js'
import Object3DNode from '../accessors/Object3DNode.js'
import PointUVNode from '../accessors/PointUVNode.js'
import PositionNode from '../accessors/PositionNode.js'
import ReferenceNode from '../accessors/ReferenceNode.js'
import ReflectNode from '../accessors/ReflectNode.js'
import SkinningNode from '../accessors/SkinningNode.js'
import TextureNode from '../accessors/TextureNode.js'
import UVNode from '../accessors/UVNode.js'

// display
import ColorSpaceNode from '../display/ColorSpaceNode.js'
import NormalMapNode from '../display/NormalMapNode.js'

// math
import MathNode from '../math/MathNode.js'
import OperatorNode from '../math/OperatorNode.js'
import CondNode from '../math/CondNode.js'

// lights
import LightContextNode from '../lights/LightContextNode.js'
import LightNode from '../lights/LightNode.js'
import LightsNode from '../lights/LightsNode.js'

// utils
import ArrayElementNode from '../utils/ArrayElementNode.js'
import ConvertNode from '../utils/ConvertNode.js'
import JoinNode from '../utils/JoinNode.js'
import SplitNode from '../utils/SplitNode.js'
import SpriteSheetUVNode from '../utils/SpriteSheetUVNode.js'
import MatcapUVNode from '../utils/MatcapUVNode.js'
import OscNode from '../utils/OscNode.js'
import TimerNode from '../utils/TimerNode.js'

// procedural
import CheckerNode from '../procedural/CheckerNode.js'

// fog
import FogNode from '../fog/FogNode.js'
import FogRangeNode from '../fog/FogRangeNode.js'

const nodeLib = {
  // core
  ArrayUniformNode,
  AttributeNode,
  BypassNode,
  CodeNode,
  ContextNode,
  ConstNode,
  ExpressionNode,
  FunctionCallNode,
  FunctionNode,
  Node,
  NodeAttribute,
  NodeBuilder,
  NodeCode,
  NodeFrame,
  NodeFunctionInput,
  NodeKeywords,
  NodeUniform,
  NodeVar,
  NodeVary,
  PropertyNode,
  TempNode,
  UniformNode,
  VarNode,
  VaryNode,

  // accessors
  BufferNode,
  CameraNode,
  CubeTextureNode,
  MaterialNode,
  MaterialReferenceNode,
  ModelNode,
  ModelViewProjectionNode,
  NormalNode,
  Object3DNode,
  PointUVNode,
  PositionNode,
  ReferenceNode,
  ReflectNode,
  SkinningNode,
  TextureNode,
  UVNode,

  // display
  ColorSpaceNode,
  NormalMapNode,

  // math
  MathNode,
  OperatorNode,
  CondNode,

  // lights
  LightContextNode,
  LightNode,
  LightsNode,

  // utils
  ArrayElementNode,
  ConvertNode,
  JoinNode,
  SplitNode,
  SpriteSheetUVNode,
  MatcapUVNode,
  OscNode,
  TimerNode,

  // procedural
  CheckerNode,

  // fog
  FogNode,
  FogRangeNode,
}

const fromType = (type) => {
  return new nodeLib[type]()
}

class NodeLoader extends Loader {
  constructor(manager) {
    super(manager)

    this.textures = {}
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new FileLoader(this.manager)
    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)
    loader.load(
      url,
      (text) => {
        try {
          onLoad(this.parse(JSON.parse(text)))
        } catch (e) {
          if (onError) {
            onError(e)
          } else {
            console.error(e)
          }

          this.manager.itemError(url)
        }
      },
      onProgress,
      onError,
    )
  }

  parseNodes(json) {
    const nodes = {}

    if (json !== undefined) {
      for (const nodeJSON of json) {
        const { uuid, type } = nodeJSON

        nodes[uuid] = fromType(type)
        nodes[uuid].uuid = uuid
      }

      const meta = { nodes, textures: this.textures }

      for (const nodeJSON of json) {
        nodeJSON.meta = meta

        const node = nodes[nodeJSON.uuid]
        node.deserialize(nodeJSON)

        delete nodeJSON.meta
      }
    }

    return nodes
  }

  parse(json) {
    const node = fromType(type)
    node.uuid = json.uuid

    const nodes = this.parseNodes(json.inputNodes)
    const meta = { nodes, textures: this.textures }

    json.meta = meta

    node.deserialize(json)

    delete json.meta

    return node
  }

  setTextures(value) {
    this.textures = value
    return this
  }
}

export default NodeLoader
