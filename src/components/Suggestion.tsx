import { createSignal, onMount, createMemo, Show } from "solid-js";

interface SuggestionProps {
  url: string;
  valueName: string;
  title: string;
  classList?: any;
}

export default function Suggestion(props: SuggestionProps) {
  const [suggestion, setSuggestion] = createSignal<any>(null);
  const [loading, setLoading] = createSignal(false);
  const [hideHint, setHideHint] = createSignal(false);

  const hoverHintText = createMemo(() => "Click for a new " + props.valueName);

  async function fetchSuggestion() {
    setLoading(true);
    try {
      const response = await fetch(props.url, {
        headers: { Accept: "application/json" },
      });
      setSuggestion(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function newSuggestion() {
    fetchSuggestion();
    if (!hideHint()) {
      setHideHint(true);
    }
  }

  onMount(() => {
    fetchSuggestion();
  });

  return (
    <footer
      onClick={newSuggestion}
      style={{ cursor: loading() ? 'progress' : 'pointer' }}
      class="content-container"
      classList={props.classList}
    >
      <Show
        when={suggestion()}
        fallback={
          <article class="marginless">
            <header>
              <strong>{props.title}</strong>
            </header>
            <p class="marginless" aria-busy="true">{props.url} might be down.</p>
          </article>
        }
      >
        <article title={hoverHintText()} class="marginless">
          <header>
            <strong>{props.title}</strong>
          </header>
          <p class="marginless">{suggestion()[props.valueName]}</p>
        </article>
      </Show>

      <Show when={!hideHint()}>
        <article style={{ "padding-top": 0, "margin-top": 0, "margin-bottom": 0 }}>
          <footer style={{ "font-style": "oblique", "font-size": "0.8em", "margin-top": 0 }}>
            Click to update
          </footer>
        </article>
      </Show>
    </footer>
  );
}
