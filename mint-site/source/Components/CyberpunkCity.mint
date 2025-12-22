component CyberpunkCity {
  state score : Number = 0
  state timeLeft : Number = 0
  state distToTarget : Number = 0
  state isGameMode : Bool = false
  state isDrivingMode : Bool = false
  state isExplorationMode : Bool = false
  state isFlyingTour : Bool = false

  fun componentDidMount : Promise(Void) {
    `
    // Ensure script is loaded or called.
    // We expect "window.initCyberpunkCity" to be defined.
    if (window.initCyberpunkCity) {
      window.initCyberpunkCity((state) => {
        // Update Mint state
        // We can't update state directly from here easily without calling a method on this component instance.
        // But "this" is available in Mint JS blocks?
        // Actually, Mint's JS block captures "this" which refers to the component instance?
        // Let's assume we can call "this.updateFromJS(state)"
        #{updateFromJS}(state)
      }, (eventName) => {
        // Handle events
        if (eventName === 'game-start') {
           #{onGameStart}()
        } else if (eventName === 'game-end') {
           #{onGameEnd}()
        }
      })
    }
    `
  }

  fun componentWillUnmount : Promise(Void) {
    `
    if (window.cleanupCyberpunkCity) {
      window.cleanupCyberpunkCity()
    }
    `
  }

  fun updateFromJS(state : Object) {
    next {
      score: `state.score || 0`,
      timeLeft: `state.timeLeft || 0`,
      distToTarget: `state.distToTarget || 0`,
      isGameMode: `state.isGameMode || false`,
      isDrivingMode: `state.isDrivingMode || false`,
      isExplorationMode: `state.isExplorationMode || false`,
      isFlyingTour: `state.isFlyingTour || false`
    }
  }

  fun onGameStart {
    // Notify parent? Mint components are isolated.
    // We can emit event to window or store in global state.
    // For now, local state handles visibility.
    next { isGameMode: true }
  }

  fun onGameEnd {
    next { isGameMode: false }
  }

  fun exitGameMode {
    `
    // We need to call exitGameMode in JS
    // The JS exposed it? No, it's local.
    // We should expose it on window.
    if (window.exitGameMode) window.exitGameMode()
    `
  }

  fun startExplorationMode {
    `if (window.startExplorationMode) window.startExplorationMode()`
  }

  fun startFlyingTour {
    `if (window.startFlyingTour) window.startFlyingTour()`
  }

  fun render : Html {
    <div>
      <div id="cyberpunk-city" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;"></div>

      if (score > 0) {
        <div id="score-counter" style="position: fixed; bottom: 20px; right: 20px; color: #00ffcc; font-family: monospace; font-size: 24px; font-weight: bold; z-index: 10; text-shadow: 0 0 10px #00ffcc; pointer-events: none;">
          <{ "SCORE: " + Number.toString(score) }>
        </div>
      }

      if (isDrivingMode) {
        <div id="timer-counter" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); color: #ff00cc; font-family: monospace; font-size: 32px; font-weight: bold; z-index: 10; text-shadow: 0 0 10px #ff00cc; pointer-events: none;">
          <{ "TIME: " + Number.toString(Math.ceil(timeLeft)) }>
        </div>
        <div id="dist-counter" style="position: fixed; top: 60px; left: 50%; transform: translateX(-50%); color: #ffff00; font-family: monospace; font-size: 24px; font-weight: bold; z-index: 10; text-shadow: 0 0 10px #ffff00; pointer-events: none;">
          <{ "DIST: " + Number.toString(Math.ceil(distToTarget)) + "m" }>
        </div>
      }

      if (isGameMode || isDrivingMode || isExplorationMode || isFlyingTour) {
        <button
          id="return-button"
          onClick={(e : Html.Event) { exitGameMode() }}
          style="position: fixed; bottom: 20px; left: 20px; background: rgba(0, 0, 0, 0.7); color: #ff00cc; border: 1px solid #ff00cc; padding: 10px 20px; font-family: monospace; font-size: 18px; font-weight: bold; cursor: pointer; z-index: 10; text-shadow: 0 0 5px #ff00cc; box-shadow: 0 0 10px #ff00cc;">
          "RETURN"
        </button>
      }

      // Mobile controls would go here, replicating the Vue template logic
      // For brevity, assuming desktop for now or porting later
    </div>
  }
}
