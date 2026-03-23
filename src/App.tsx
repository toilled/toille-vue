import {
  createSignal,
  onMount,
  onCleanup,
  createMemo,
  createEffect,
  Show,
  lazy,
} from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import Title from "./components/Title";
import Menu from "./components/Menu";
import TypingText from "./components/TypingText";
import SplashScreen from "./components/SplashScreen";

const Checker = lazy(() => import("./components/Checker"));
const Activity = lazy(() => import("./components/Activity"));
const Suggestion = lazy(() => import("./components/Suggestion"));
import pages from "./configs/pages.json";
import titles from "./configs/titles.json";
import { Page } from "./interfaces/Page";

// @ts-expect-error Types missing for server context checking
const isServer = typeof window === "undefined";

const CyberpunkCity = lazy(() => {
  if (isServer) {
    return Promise.resolve({ default: () => null });
  }
  return import("./components/CyberpunkCity");
});

export default function App(props: any) {
  const [checker, setChecker] = createSignal(false);
  const [activity, setActivity] = createSignal(false);
  const [joke, setJoke] = createSignal(false);
  const [showHint, setShowHint] = createSignal(false);
  const [showSplash, setShowSplash] = createSignal(true);
  const [gameMode, setGameMode] = createSignal(false);
  const [isContentVisible, setIsContentVisible] = createSignal(true);
  const [isClient, setIsClient] = createSignal(false);

  const location = useLocation();
  const navigate = useNavigate();

  let cyberpunkCityRef: any;

  const visiblePages = createMemo(() => {
    return pages.filter((page: Page) => !page.hidden);
  });

  const toggleContent = () => setIsContentVisible((prev) => !prev);

  const startExploration = () => {
    if (cyberpunkCityRef?.startExplorationMode) {
      cyberpunkCityRef.startExplorationMode();
    }
  };

  const startFlyingTour = () => {
    if (cyberpunkCityRef?.startFlyingTour) {
      cyberpunkCityRef.startFlyingTour();
    }
  };

  const startDemoMode = () => {
    if (cyberpunkCityRef?.startDemoMode) {
      cyberpunkCityRef.startDemoMode();
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (gameMode()) return;

    if (e.key === "Escape") {
      const gameRoutes = ["/game", "/noughts-and-crosses", "/checker", "/ask"];
      if (gameRoutes.includes(location.pathname)) {
        navigate("/hidden");
      }
    }

    switch (e.key) {
      case "ArrowRight": {
        const currentIndex = visiblePages().findIndex(
          (page: Page) => page.link === location.pathname
        );
        if (currentIndex !== -1 && currentIndex < visiblePages().length - 1) {
          navigate(visiblePages()[currentIndex + 1].link);
        }
        break;
      }
      case "ArrowLeft": {
        const currentIndex = visiblePages().findIndex(
          (page: Page) => page.link === location.pathname
        );
        if (currentIndex > 0) {
          navigate(visiblePages()[currentIndex - 1].link);
        }
        break;
      }
    }
  };

  const noFootersShowing = createMemo(() => !activity() && !checker() && !joke());

  const toggleActivity = () => setActivity((prev) => !prev);
  const toggleJoke = () => setJoke((prev) => !prev);

  let splashTimeout: ReturnType<typeof setTimeout>;
  let hintTimeout1: ReturnType<typeof setTimeout>;
  let hintTimeout2: ReturnType<typeof setTimeout>;

  const handleContextMenu = (e: Event) => e.preventDefault();

  onMount(() => {
    setIsClient(true);
    splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 500);

    hintTimeout1 = setTimeout(() => {
      setShowHint(true);
    }, 2000);

    hintTimeout2 = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    let lastTouchTime = 0;
    document.body.addEventListener("touchstart", () => {
      lastTouchTime = Date.now();
      document.body.classList.remove("can-hover");
    }, { passive: true });

    document.body.addEventListener("mousemove", () => {
      if (Date.now() - lastTouchTime > 500) {
        document.body.classList.add("can-hover");
      }
    });

    window.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", handleContextMenu);
  });

  onCleanup(() => {
    clearTimeout(splashTimeout);
    clearTimeout(hintTimeout1);
    clearTimeout(hintTimeout2);
    if (!isServer) {
      window.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("contextmenu", handleContextMenu);
    }
  });

  createEffect(() => {
    const newPath = location.pathname;
    let pageTitle;

    switch (newPath) {
      case "/noughts-and-crosses":
        pageTitle = "Noughts and Crosses";
        break;
      case "/game":
        pageTitle = "Catch the Button!";
        break;
      case "/checker":
        pageTitle = "Checker";
        break;
      case "/ask":
        pageTitle = "Ask Me";
        break;
      default: {
        let routeName;
        if (newPath.length > 1) {
          routeName = newPath.slice(1);
        } else if (newPath === "/") {
          routeName = "home";
        }

        if (routeName) {
          let currentPage;
          if (routeName === "home") {
            currentPage = pages.find((page) => page.link === "/");
          } else {
            currentPage = pages.find(
              (page) => page.link.slice(1) === routeName
            );
          }
          pageTitle = currentPage ? currentPage.title : "404";
        } else {
          pageTitle = "404";
        }
        break;
      }
    }

    if (!isServer) {
      document.title = "Elliot > " + pageTitle;
    }
  });

  return (
    <>
      <div
        id="content-wrapper"
        classList={{
          "fade-out": gameMode(),
          "welcome-animation": !showSplash() && !gameMode(),
        }}
      >
        <nav>
          <Title
            title={titles.title}
            subtitle={titles.subtitle}
            activity={activity()}
            joke={joke()}
            onActivity={toggleActivity}
            onJoke={toggleJoke}
          />
          <Menu
            pages={visiblePages()}
            contentVisible={isContentVisible()}
            onExplore={startExploration}
            onFly={startFlyingTour}
            onDemo={startDemoMode}
            onToggleContent={toggleContent}
          />
        </nav>

        <Show when={isContentVisible()}>
          <div class="router-view-container">
            {props.children}
          </div>
        </Show>

        <Show when={noFootersShowing() && showHint() && isContentVisible()}>
          <footer
            onClick={() => setChecker(!checker())}
            class="content-container fade"
          >
            <TypingText text="The titles might be clickable..." />
          </footer>
        </Show>
      </div>

      <Show when={isClient()}>
        <CyberpunkCity
          showSplash={showSplash()}
          ref={cyberpunkCityRef}
          onGameStart={() => setGameMode(true)}
          onGameEnd={() => setGameMode(false)}
        />
      </Show>

      <Show when={checker()}>
        <Checker classList={{ "fade-out": gameMode() }} />
      </Show>

      <Show when={activity()}>
        <Activity classList={{ "fade-out": gameMode() }} />
      </Show>

      <Show when={joke()}>
        <Suggestion
          classList={{ "fade-out": gameMode() }}
          url="https://icanhazdadjoke.com/"
          valueName="joke"
          title="Have a laugh!"
        />
      </Show>

      <Show when={showSplash()}>
        <SplashScreen />
      </Show>
    </>
  );
}
