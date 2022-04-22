import Dexie from 'dexie';
import { IKeyringController } from '../parkydb-interfaces/interfaces/IKeyringController';
export declare class WalletController implements IKeyringController {
    keyringController?: any;
    constructor(keyringController?: any);
    load(vaultStorage: Dexie | any): Promise<void>;
    createVault(password: string, seed?: string): Promise<any>;
}
