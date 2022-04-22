import { Subject } from 'rxjs'
import { BlockValue } from '../parkydb-interfaces/interfaces/Blockvalue'

export interface IPublisher {
  publish(block: BlockValue): Promise<any>
}
export class Hooks {
  // @ts-ignore
  router: Subject<any>;

  constructor() {}

  attachRouter(router: Subject<any>): any {
    this.router = router
    return (pk: string, obj: BlockValue, tx: any) => {
      this.router.next(obj)
    }
  }
}
