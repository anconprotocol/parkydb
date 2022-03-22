import Dexie from 'dexie'

export class Hooks {
  static createHook(db: Dexie | any) {
    return async (pk: string, obj: any, tx: any) => {}
  }
}
