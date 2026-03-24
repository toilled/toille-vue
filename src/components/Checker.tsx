import { createSignal, onMount, createEffect } from "solid-js";

export default function Checker(props: any) {
  const [count, setCount] = createSignal(0);
  const [limitTime, setLimitTime] = createSignal("");
  const [soberTime, setSoberTime] = createSignal("");

  function updateTimes() {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
    } as const;
    const currentTime = new Date().getTime();
    if (count() === 0) {
      setLimitTime(new Date(currentTime).toLocaleTimeString([], options));
      setSoberTime(new Date(currentTime).toLocaleTimeString([], options));
    } else {
      setLimitTime(
        new Date(currentTime + count() * 60 * 60 * 1000).toLocaleTimeString([], options)
      );
      setSoberTime(
        new Date(currentTime + (count() + 1) * 60 * 60 * 1000).toLocaleTimeString([], options)
      );
    }
  }

  function add() {
    setCount(count() + 1);
  }

  function subtract() {
    if (count() > 0) {
      setCount(count() - 1);
    }
  }

  onMount(() => {
    updateTimes();
  });

  createEffect(() => {
    count();
    updateTimes();
  });

  return (
    <footer class="content-container" classList={props.classList}>
      <article class="marginless">
        <header>Alcohol Checker</header>
        <section class="grid">
          <button onClick={add} class="outline">Add</button>
          <button onClick={subtract} class="outline">Subtract</button>
        </section>
        <table class="marginless">
          <thead>
            <tr>
              <th>Units consumed</th>
              <th>Borderline time</th>
              <th>Safe time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{count()}</td>
              <td>{limitTime()}</td>
              <td>{soberTime()}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </footer>
  );
}
