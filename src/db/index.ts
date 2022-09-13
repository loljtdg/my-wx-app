import loki from "lokijs";
import { MyCustomAdapter } from "./Adapter";

export { saveDbFile, selectDbFile } from "./Adapter";

export const db = new loki("", {
  env: "BROWSER",
  adapter: new MyCustomAdapter(),
  autosave: true,
  autoload: true
});
