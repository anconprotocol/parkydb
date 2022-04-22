import Dexie from "dexie";
export interface IKeyringController {
    load(vaultStorage: Dexie | any): Promise<any>;
}
