import Dexie from 'dexie';
import { IKeyringController } from '../interfaces/IKeyringController';
export declare class WalletController implements IKeyringController {
    private keyringController?;
    constructor(keyringController?: any);
    load(vaultStorage: Dexie | any): Promise<void>;
    addEd25519(keys: Array<string>): Promise<any>;
    addSecp256k1(keys: Array<string>): Promise<any>;
    getWallet(): any;
    createVault(password: string, seed?: string): Promise<any>;
}
