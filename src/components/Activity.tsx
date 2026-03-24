import { createSignal, onMount, Show } from "solid-js";

export default function Activity(props: any) {
  const [activity, setActivity] = createSignal<any>(null);
  const [loading, setLoading] = createSignal(false);
  const [hideHint, setHideHint] = createSignal(false);

  async function fetchActivity() {
    setLoading(true);
    try {
      const response = await fetch("https://bored.api.lewagon.com/api/activity");
      setActivity(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function newSuggestion() {
    fetchActivity();
    if (!hideHint()) {
      setHideHint(true);
    }
  }

  onMount(() => {
    fetchActivity();
  });

  return (
    <footer
      onClick={newSuggestion}
      style={{ cursor: loading() ? 'progress' : 'pointer' }}
      class="content-container"
      classList={props.classList}
    >
      <Show
        when={activity()}
        fallback={
          <article class="marginless">
            <header>
              <strong>Try this activity</strong>
            </header>
            <p class="marginless" aria-busy="true">
              Loading from The Bored API.
            </p>
          </article>
        }
      >
        <article title="Click for a new suggestion" class="marginless">
          <header>
            <strong>
              Try this {activity().type} activity
            </strong>
            (The Bored API)
          </header>
          <p class="marginless">{activity().activity}</p>
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
