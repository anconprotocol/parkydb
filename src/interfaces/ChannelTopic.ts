import { Observable } from "rxjs";

export interface ChannelTopic{
    close: () => void;
    onBlockReply$: Observable<any>
}