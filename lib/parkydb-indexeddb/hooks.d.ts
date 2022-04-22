import { Subject } from 'rxjs';
import { BlockValue } from '../parkydb-interfaces/interfaces/Blockvalue';
export interface IPublisher {
    publish(block: BlockValue): Promise<any>;
}
export declare class Hooks {
    router: Subject<any>;
    constructor();
    attachRouter(router: Subject<any>): any;
}
