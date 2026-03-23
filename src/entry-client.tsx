import { render } from "solid-js/web";
import { createApp } from "./main";

const AppRouter = createApp();

render(() => <AppRouter />, document.getElementById("app") as HTMLElement);
