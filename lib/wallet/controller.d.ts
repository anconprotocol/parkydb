import Dexie from 'dexie';
import { IKeyringController } from '../interfaces/IKeyringController';
interface AccountWallet {
    exportAccount(from: string): Promise<string>;
    getAccounts(): Promise<string>;
    addEd25519(keys: string[]): Promise<any>;
    addSecp256k1(keys: string[]): Promise<any>;
}
export declare class WalletController implements IKeyringController {
    keyringController: any;
    constructor();
    load(vaultStorage: Dexie | any): Promise<void>;
    addEd25519(keys: Array<string>): Promise<any>;
    addSecp256k1(keys: Array<string>): Promise<any>;
    get wallet(): AccountWallet;
    createVault(password: string, seed?: string): Promise<any>;
}
export {};
