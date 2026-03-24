import { createSignal } from "solid-js";

interface TitleProps {
  title: string;
  subtitle: string;
  activity: boolean;
  joke: boolean;
  onActivity: () => void;
  onJoke: () => void;
}

export default function Title(props: TitleProps) {
  const [animatingTitle, setAnimatingTitle] = createSignal(false);
  const [animatingSubtitle, setAnimatingSubtitle] = createSignal(false);

  function triggerAnimation(setter: (val: boolean) => void, currentVal: boolean) {
    if (currentVal) return;
    setter(true);
    setTimeout(() => {
      setter(false);
    }, 1000);
  }

  function handleTitleClick() {
    props.onActivity();
    triggerAnimation(setAnimatingTitle, animatingTitle());
  }

  function handleSubtitleClick() {
    props.onJoke();
    triggerAnimation(setAnimatingSubtitle, animatingSubtitle());
  }

  return (
    <ul>
      <li>
        <hgroup>
          <h1
            class="title question"
            classList={{ "space-warp": animatingTitle() }}
            onMouseDown={handleTitleClick}
          >
            {props.title}
          </h1>
          <h2
            class="title question"
            classList={{ "space-warp": animatingSubtitle() }}
            onMouseDown={handleSubtitleClick}
          >
            {props.subtitle}
          </h2>
        </hgroup>
      </li>
      <style>{`
        .space-warp {
          animation: space-warp 1s ease-in-out;
        }

        @keyframes space-warp {
          0% {
            transform: scale(1);
            filter: hue-rotate(0deg);
          }
          25% {
            transform: scale(1.1) skewX(-10deg);
            filter: hue-rotate(90deg) drop-shadow(0 0 10px cyan);
          }
          50% {
            transform: scale(0.9) skewX(10deg);
            filter: hue-rotate(180deg) drop-shadow(0 0 10px magenta);
          }
          75% {
            transform: scale(1.05) skewX(-5deg);
            filter: hue-rotate(270deg) drop-shadow(0 0 10px cyan);
          }
          100% {
            transform: scale(1);
            filter: hue-rotate(360deg);
          }
        }
      `}</style>
    </ul>
  );
}
