import { DAGJsonService } from "./dagjson";
import { ParkyDB } from "./store";

async function bootstrap() {
  const db = new ParkyDB();

  const payload = {
    foo: 11101,
    bar: "Hello World!",
    links: ["https://github.com/anconprotocol/data-agent-library"],
  };

  const id = await db.putBlock(payload);
  const res = await db.get(id, null);
  console.log(res.schemas.jsonschema);
}

// https://graphql-compose.github.io/docs/plugins/plugin-json.html
// https://www.npmjs.com/package/graphql-to-mongodb

bootstrap();
