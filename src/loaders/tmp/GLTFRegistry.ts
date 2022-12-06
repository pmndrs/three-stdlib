/* GLTFREGISTRY */

export class GLTFRegistry {
  objects: { [T: string]: any } = {}

  constructor() {}

  get(key: string): any {
    return this.objects[key]
  }

  add(key: string, object: any): void {
    this.objects[key] = object
  }

  remove(key: string): void {
    delete this.objects[key]
  }

  removeAll(): void {
    this.objects = {}
  }
}
