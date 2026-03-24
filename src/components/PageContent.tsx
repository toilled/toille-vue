import { createSignal, createMemo, Show, For } from "solid-js";
import { useParams, useLocation } from "@solidjs/router";
import pages from "../configs/pages.json";
import Paragraph from "./Paragraph";
import { Page } from "../interfaces/Page";

interface PageContentProps {
  name?: string;
}

export default function PageContent(props: PageContentProps) {
  const [showHint, setShowHint] = createSignal(false);
  const params = useParams();
  const location = useLocation();

  const page = createMemo(() => {
    // Determine the name based on props or params
    const routeName = props.name || params.name;

    if (routeName) {
      if (routeName === "home") {
        return pages.find((p: Page) => p.link === "/");
      }
      return pages.find((p: Page) => p.link.slice(1) === routeName);
    }

    if (location.pathname !== "/") {
      return null;
    }

    return pages[0];
  });

  function handleMouseDown() {
    showHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 500);
  }

  return (
    <main>
      <section>
        <article class="marginless">
          <header>
            <h2 class="title" onMouseDown={handleMouseDown}>
              <Show
                when={page()}
                fallback={<>404 - Page not found</>}
              >
                <Show when={page()?.icon}>
                  <span class="page-icon">{page()?.icon} </span>
                </Show>
                {page()?.title}
                <Show when={showHint()}>
                  <span
                    class="fade-enter-active"
                    style={{
                      "font-weight": "100",
                      "font-style": "italic",
                      "font-size": "0.6em",
                      "vertical-align": "middle",
                    }}
                  >
                    - Nothing here
                  </span>
                </Show>
              </Show>
            </h2>
          </header>
          <Show
            when={page()}
            fallback={
              <Paragraph
                paragraph={`The page <strong>${params.name || props.name}</strong> does not exist!`}
                last={true}
              />
            }
          >
            <For each={page()?.body}>
              {(paragraph, index) => (
                <Paragraph
                  paragraph={paragraph}
                  last={index() + 1 === page()?.body.length}
                />
              )}
            </For>
          </Show>
        </article>
      </section>
    </main>
  );
}
