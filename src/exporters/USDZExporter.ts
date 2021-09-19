import { zipSync, strToU8, Zippable } from 'fflate'
import {
  BufferGeometry,
  Color,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
  Vector2,
} from 'three'
import { Nullable } from 'types/utils'

type MaterialRepresentaion = MeshStandardMaterial | MeshPhysicalMaterial

class USDZExporter {
  private readonly PRECISION = 7

  private materials: { [key: string]: MaterialRepresentaion }
  private textures: { [key: string]: Texture }

  private files: Nullable<Zippable>

  constructor() {
    this.materials = {}
    this.textures = {}

    this.files = {}
  }

  public async parse(scene: Object3D): Promise<Uint8Array> {
    const modelFileName = 'model.usda'

    // model file should be first in USDZ archive so we init it here
    this.files[modelFileName] = null

    let output: string | null = this.buildHeader()

    scene.traverseVisible((object) => {
      if (object instanceof Mesh && object.isMesh && object.material.isMeshStandardMaterial) {
        const geometry: BufferGeometry = object.geometry
        const material: MaterialRepresentaion = object.material

        const geometryFileName = 'geometries/Geometry_' + geometry.id + '.usd'

        if (!(geometryFileName in this.files)) {
          const meshObject = this.buildMeshObject(geometry)
          this.files[geometryFileName] = this.buildUSDFileAsString(meshObject)
        }

        if (!(material.uuid in this.materials)) {
          this.materials[material.uuid] = material
        }

        output += this.buildXform(object, geometry, material)
      }
    })

    output += this.buildMaterials(this.materials)

    this.files[modelFileName] = strToU8(output)
    output = null

    for (const id in this.textures) {
      const texture = this.textures[id]
      const color = id.split('_')[1]
      const isRGBA = texture.format === 1023

      const canvas = this.imageToCanvas(texture.image, color)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas?.toBlob(resolve, isRGBA ? 'image/png' : 'image/jpeg', 1),
      )

      if (blob) {
        this.files[`textures/Texture_${id}.${isRGBA ? 'png' : 'jpg'}`] = new Uint8Array(await blob.arrayBuffer())
      }
    }

    // 64 byte alignment
    // https://github.com/101arrowz/fflate/issues/39#issuecomment-777263109

    let offset = 0

    for (const filename in this.files) {
      const file = this.files[filename]
      const headerSize = 34 + filename.length

      offset += headerSize

      const offsetMod64 = offset & 63

      if (offsetMod64 !== 4 && file !== null && file instanceof Uint8Array) {
        const padLength = 64 - offsetMod64
        const padding = new Uint8Array(padLength)

        this.files[filename] = [file, { extra: { 12345: padding } }]
      }

      if (file && typeof file.length === 'number') {
        offset = file.length
      }
    }

    return zipSync(this.files as Zippable, { level: 0 })
  }

  private imageToCanvas(
    image: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap,
    color: string,
  ): HTMLCanvasElement | undefined {
    if (
      (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
      (typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas) ||
      (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap)
    ) {
      const scale = 1024 / Math.max(image.width, image.height)

      const canvas = document.createElement('canvas')
      canvas.width = image.width * Math.min(1, scale)
      canvas.height = image.height * Math.min(1, scale)

      const context = canvas.getContext('2d')
      context?.drawImage(image, 0, 0, canvas.width, canvas.height)

      if (color !== undefined) {
        const hex = parseInt(color, 16)

        const r = ((hex >> 16) & 255) / 255
        const g = ((hex >> 8) & 255) / 255
        const b = (hex & 255) / 255

        const imagedata = context?.getImageData(0, 0, canvas.width, canvas.height)
        if (imagedata) {
          const data = imagedata?.data

          for (let i = 0; i < data.length; i += 4) {
            data[i + 0] = data[i + 0] * r
            data[i + 1] = data[i + 1] * g
            data[i + 2] = data[i + 2] * b
          }

          context?.putImageData(imagedata, 0, 0)
        }
      }

      return canvas
    }
  }

  private buildHeader(): string {
    return `#usda 1.0
(
    customLayerData = {
        string creator = "Three.js USDZExporter"
    }
    metersPerUnit = 1
    upAxis = "Y"
)
`
  }

  private buildUSDFileAsString(dataToInsert: string): Uint8Array {
    let output = this.buildHeader()
    output += dataToInsert
    return strToU8(output)
  }

  // Xform
  private buildXform(object: Object3D, geometry: BufferGeometry, material: MaterialRepresentaion): string {
    const name = 'Object_' + object.id
    const transform = this.buildMatrix(object.matrixWorld)

    if (object.matrixWorld.determinant() < 0) {
      console.warn('THREE.USDZExporter: USDZ does not support negative scales', object)
    }

    return `def Xform "${name}" (
    prepend references = @./geometries/Geometry_${geometry.id}.usd@</Geometry>
)
{
    matrix4d xformOp:transform = ${transform}
    uniform token[] xformOpOrder = ["xformOp:transform"]
    rel material:binding = </Materials/Material_${material.id}>
}
`
  }

  private buildMatrix(matrix: Matrix4): string {
    const array = matrix.elements

    return `( ${this.buildMatrixRow(array, 0)}, ${this.buildMatrixRow(array, 4)}, ${this.buildMatrixRow(
      array,
      8,
    )}, ${this.buildMatrixRow(array, 12)} )`
  }

  private buildMatrixRow(array: number[], offset: number): string {
    return `(${array[offset + 0]}, ${array[offset + 1]}, ${array[offset + 2]}, ${array[offset + 3]})`
  }

  // Mesh
  private buildMeshObject(geometry: BufferGeometry): string {
    const mesh = this.buildMesh(geometry)
    return `
def "Geometry"
{
  ${mesh}
}
`
  }

  private buildMesh(geometry: BufferGeometry): string {
    const name = 'Geometry'
    const attributes = geometry.attributes
    const count = attributes.position.count

    return `
    def Mesh "${name}"
    {
        int[] faceVertexCounts = [${this.buildMeshVertexCount(geometry)}]
        int[] faceVertexIndices = [${this.buildMeshVertexIndices(geometry)}]
        normal3f[] normals = [${this.buildVector3Array(attributes.normal, count)}] (
            interpolation = "vertex"
        )
        point3f[] points = [${this.buildVector3Array(attributes.position, count)}]
        float2[] primvars:st = [${this.buildVector2Array(attributes.uv, count)}] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
    }
`
  }

  private buildMeshVertexCount(geometry: BufferGeometry): string {
    const count = geometry.index !== null ? geometry.index.array.length : geometry.attributes.position.count

    return Array(count / 3)
      .fill(3)
      .join(', ')
  }

  private buildMeshVertexIndices(geometry: BufferGeometry): string {
    if (geometry.index !== null) {
      // @ts-expect-error
      return geometry.index.array.join(', ')
    }

    const array: number[] = []
    const length = geometry.attributes.position.count

    for (let i = 0; i < length; i++) {
      array.push(i)
    }

    return array.join(', ')
  }

  private buildVector3Array(attribute: BufferGeometry['attributes'][number], count: number): string {
    if (attribute === undefined) {
      console.warn('USDZExporter: Normals missing.')
      return Array(count).fill('(0, 0, 0)').join(', ')
    }

    const array: string[] = []
    const data = attribute.array

    for (let i = 0; i < data.length; i += 3) {
      array.push(
        `(${data[i + 0].toPrecision(this.PRECISION)}, ${data[i + 1].toPrecision(this.PRECISION)}, ${data[
          i + 2
        ].toPrecision(this.PRECISION)})`,
      )
    }

    return array.join(', ')
  }

  private buildVector2Array(attribute: BufferGeometry['attributes'][number], count: number): string {
    if (attribute === undefined) {
      console.warn('USDZExporter: UVs missing.')
      return Array(count).fill('(0, 0)').join(', ')
    }

    const array: string[] = []
    const data = attribute.array

    for (let i = 0; i < data.length; i += 2) {
      // @ts-expect-error
      array.push(`(${data[i + 0].toPrecision(this.PRECISION)}, ${1 - data[i + 1].toPrecision(this.PRECISION)})`)
    }

    return array.join(', ')
  }

  // Materials
  private buildMaterials(materials: USDZExporter['materials']): string {
    const array: string[] = []

    for (const uuid in materials) {
      const material = materials[uuid]

      array.push(this.buildMaterial(material))
    }

    return `def "Materials"
{
${array.join('')}
}
`
  }

  private buildMaterial(material: MaterialRepresentaion): string {
    // https://graphics.pixar.com/usd/docs/UsdPreviewSurface-Proposal.html

    const pad = '            '
    const inputs = []
    const samplers = []

    if (material.map !== null) {
      inputs.push(
        `${pad}color3f inputs:diffuseColor.connect = </Materials/Material_${material.id}/Texture_${material.map.id}_diffuse.outputs:rgb>`,
      )

      samplers.push(this.buildTexture(material, material.map, 'diffuse', material.color))
    } else {
      inputs.push(`${pad}color3f inputs:diffuseColor = ${this.buildColor(material.color)}`)
    }

    if (material.emissiveMap !== null) {
      inputs.push(
        `${pad}color3f inputs:emissiveColor.connect = </Materials/Material_${material.id}/Texture_${material.emissiveMap.id}_emissive.outputs:rgb>`,
      )

      samplers.push(this.buildTexture(material, material.emissiveMap, 'emissive'))
    } else if (material.emissive.getHex() > 0) {
      inputs.push(`${pad}color3f inputs:emissiveColor = ${this.buildColor(material.emissive)}`)
    }

    if (material.normalMap !== null) {
      inputs.push(
        `${pad}normal3f inputs:normal.connect = </Materials/Material_${material.id}/Texture_${material.normalMap.id}_normal.outputs:rgb>`,
      )

      samplers.push(this.buildTexture(material, material.normalMap, 'normal'))
    }

    if (material.aoMap !== null) {
      inputs.push(
        `${pad}float inputs:occlusion.connect = </Materials/Material_${material.id}/Texture_${material.aoMap.id}_occlusion.outputs:r>`,
      )

      samplers.push(this.buildTexture(material, material.aoMap, 'occlusion'))
    }

    if (material.roughnessMap !== null && material.roughness === 1) {
      inputs.push(
        `${pad}float inputs:roughness.connect = </Materials/Material_${material.id}/Texture_${material.roughnessMap.id}_roughness.outputs:g>`,
      )

      samplers.push(this.buildTexture(material, material.roughnessMap, 'roughness'))
    } else {
      inputs.push(`${pad}float inputs:roughness = ${material.roughness}`)
    }

    if (material.metalnessMap !== null && material.metalness === 1) {
      inputs.push(
        `${pad}float inputs:metallic.connect = </Materials/Material_${material.id}/Texture_${material.metalnessMap.id}_metallic.outputs:b>`,
      )

      samplers.push(this.buildTexture(material, material.metalnessMap, 'metallic'))
    } else {
      inputs.push(`${pad}float inputs:metallic = ${material.metalness}`)
    }

    inputs.push(`${pad}float inputs:opacity = ${material.opacity}`)

    if (material instanceof MeshPhysicalMaterial) {
      inputs.push(`${pad}float inputs:clearcoat = ${material.clearcoat}`)
      inputs.push(`${pad}float inputs:clearcoatRoughness = ${material.clearcoatRoughness}`)
      inputs.push(`${pad}float inputs:ior = ${material.ior}`)
    }

    return `
  {
      def Material "Material_${material.id}"
        def Shader "PreviewSurface"
        {
            uniform token info:id = "UsdPreviewSurface"
${inputs.join('\n')}
            int inputs:useSpecularWorkflow = 0
            token outputs:surface
        }
        token outputs:surface.connect = </Materials/Material_${material.id}/PreviewSurface.outputs:surface>
        token inputs:frame:stPrimvarName = "st"
        def Shader "uvReader_st"
        {
            uniform token info:id = "UsdPrimvarReader_float2"
            token inputs:varname.connect = </Materials/Material_${material.id}.inputs:frame:stPrimvarName>
            float2 inputs:fallback = (0.0, 0.0)
            float2 outputs:result
        }
${samplers.join('\n')}
    }
`
  }

  private buildTexture(material: MaterialRepresentaion, texture: Texture, mapType: string, color?: Color): string {
    const id = texture.id + (color ? '_' + color.getHexString() : '')
    const isRGBA = texture.format === 1023

    this.textures[id] = texture

    return `
      def Shader "Transform2d_${mapType}" (
          sdrMetadata = {
              string role = "math"
          }
      )
      {
          uniform token info:id = "UsdTransform2d"
          float2 inputs:in.connect = </Materials/Material_${material.id}/uvReader_st.outputs:result>
          float2 inputs:scale = ${this.buildVector2(texture.repeat)}
          float2 inputs:translation = ${this.buildVector2(texture.offset)}
          float2 outputs:result
      }
      def Shader "Texture_${texture.id}_${mapType}"
      {
          uniform token info:id = "UsdUVTexture"
          asset inputs:file = @textures/Texture_${id}.${isRGBA ? 'png' : 'jpg'}@
          float2 inputs:st.connect = </Materials/Material_${material.id}/Transform2d_${mapType}.outputs:result>
          token inputs:wrapS = "repeat"
          token inputs:wrapT = "repeat"
          float outputs:r
          float outputs:g
          float outputs:b
          float3 outputs:rgb
      }`
  }

  private buildColor(color: Color): string {
    return `(${color.r}, ${color.g}, ${color.b})`
  }

  private buildVector2(vector: Vector2): string {
    return `(${vector.x}, ${vector.y})`
  }
}

export { USDZExporter }
