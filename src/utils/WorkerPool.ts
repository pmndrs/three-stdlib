/**
 * @author Deepkolos / https://github.com/deepkolos
 */

export class WorkerPool {
  public pool: number
  public queue: {
    resolve: (value: void | PromiseLike<void>) => void
    msg: any
    transfer: Transferable[]
  }[]
  public workers: Worker[]
  public workersResolve: ((value: void | PromiseLike<void>) => void)[]
  public workerStatus: number

  constructor(pool = 4) {
    this.pool = pool
    this.queue = []
    this.workers = []
    this.workersResolve = []
    this.workerStatus = 0
  }

  private _initWorker(workerId: number): void {
    if (!this.workers[workerId]) {
      const worker = this.workerCreator()
      worker.addEventListener('message', this._onMessage.bind(this, workerId))
      this.workers[workerId] = worker
    }
  }

  private workerCreator(): Worker {
    throw new Error('Method not implemented.')
  }

  private _getIdleWorker(): number {
    for (let i = 0; i < this.pool; i++) if (!(this.workerStatus & (1 << i))) return i

    return -1
  }

  private _onMessage(workerId: number, msg: any): void {
    const resolve = this.workersResolve[workerId]
    resolve && resolve(msg)

    if (this.queue.length) {
      const { resolve, msg, transfer } = this.queue.shift()!
      this.workersResolve[workerId] = resolve
      this.workers[workerId].postMessage(msg, transfer)
    } else {
      this.workerStatus ^= 1 << workerId
    }
  }

  public setWorkerCreator(workerCreator: () => Worker): void {
    this.workerCreator = workerCreator
  }

  public setWorkerLimit(pool: number): void {
    this.pool = pool
  }

  public postMessage(msg: any, transfer: Transferable[]): Promise<void> {
    return new Promise((resolve) => {
      const workerId = this._getIdleWorker()

      if (workerId !== -1) {
        this._initWorker(workerId)
        this.workerStatus |= 1 << workerId
        this.workersResolve[workerId] = resolve
        this.workers[workerId].postMessage(msg, transfer)
      } else {
        this.queue.push({ resolve, msg, transfer })
      }
    })
  }

  public dispose(): void {
    this.workers.forEach((worker) => worker.terminate())
    this.workersResolve.length = 0
    this.workers.length = 0
    this.queue.length = 0
    this.workerStatus = 0
  }
}
