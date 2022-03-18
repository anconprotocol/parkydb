import { DAGJsonService } from './dagjson';
import { DataAgentStore } from './store'

async function b()  {
  
  
  
  
  
  const test = new DataAgentStore();
  const payload = {
    foo: 11101,
    bar: 'Hello World!',
    links: ['https://github.com/anconprotocol/data-agent-library']
  }
  const dag = new DAGJsonService()
  const block = await dag.build(payload);
  const id = await test.put(block.cid, block);
  const res = await test.get(id, null)
  console.log(res);
}

b()
