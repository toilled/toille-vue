component Menu {
  connect Store exposing { pages }

  state soundOn : Bool = false

  fun toggleSound : Promise(Void) {
    `
    if (!window.audioInstance) {
      window.audioInstance = new window.CyberpunkAudio();
    }
    if (#{soundOn}) {
      window.audioInstance.pause();
    } else {
      window.audioInstance.play();
    }
    `
    next { soundOn: !soundOn }
  }

  fun startExploration : Promise(Void) {
    `if(window.startExplorationMode) window.startExplorationMode()`
  }

  fun startFlyingTour : Promise(Void) {
    `if(window.startFlyingTour) window.startFlyingTour()`
  }

  fun render : Html {
    <ul>
      for (page of pages) {
        if (!page.hidden) {
          <MenuItem page={page}/>
        }
      }
      <li class="icons-container">
        <div onClick={(e : Html.Event) { startExploration() }} class="icon-wrapper" title="Explore City">
          <img src="/person-icon.svg" alt="Explore City" class="icon" />
        </div>
        <div onClick={(e : Html.Event) { startFlyingTour() }} class="icon-wrapper" title="Fly Tour">
          <img src="/plane-icon.svg" alt="Fly Tour" class="icon" />
        </div>
        <div onClick={(e : Html.Event) { toggleSound() }} class="icon-wrapper" title="Toggle Sound">
          if (soundOn) {
            <img src="/sound-icon.svg" alt="Toggle sound" class="icon" />
          } else {
            <img src="/mute-icon.svg" alt="Toggle sound" class="icon" />
          }
        </div>
        // Weather Icon placeholder
        <div class="icon-wrapper">
          <img src="/assets/favicon.png" style="width:24px; opacity:0.5;" title="Weather (Not Implemented)" />
        </div>
      </li>
    </ul>
  }

  style icons-container {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    gap: 10px;
    padding: 10px;
  }

  style icon-wrapper {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  style icon {
    width: 24px;
    height: 24px;
    filter: invert(1);
  }
}
