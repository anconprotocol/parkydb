import { Observable } from 'rxjs';
import { BlockValue } from './Blockvalue';
export interface PubsubTopic {
    close: () => void;
    publish: (block: BlockValue) => Promise<any>;
    onBlockReply$: Observable<any>;
}
