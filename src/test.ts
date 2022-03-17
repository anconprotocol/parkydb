import { DAGJsonService } from './dagjson';
import { DataAgentStore } from './store'

async function b()  {
  
  
  
  
  
  const test = new DataAgentStore();
  const payload = {
    foo: 1,
    bar: 'Hello',
    links: ['https://github.com/anconprotocol/data-agent-library']
  }
  const dag = new DAGJsonService()
  const block = await dag.build(payload);
  const res = await test.put(block.cid, block);
}

b()
