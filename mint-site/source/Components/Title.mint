component Title {
  connect Store exposing { title, subtitle, toggleActivity, toggleJoke }

  state animatingTitle : Bool = false
  state animatingSubtitle : Bool = false

  fun handleTitleClick : Promise(Void) {
    toggleActivity()
    next { animatingTitle: true }
    // Timer.timeout expects 1 arg (duration) and returns a promise.
    await Timer.timeout(1000)
    next { animatingTitle: false }
  }

  fun handleSubtitleClick : Promise(Void) {
    toggleJoke()
    next { animatingSubtitle: true }
    await Timer.timeout(1000)
    next { animatingSubtitle: false }
  }

  fun render : Html {
    <ul>
      <li>
        <hgroup>
          <h1
            class="title question"
            onClick={(e : Html.Event) { handleTitleClick() }}
            style={
              if (animatingTitle) {
                "animation: space-warp 1s ease-in-out;"
              } else {
                ""
              }
            }>
            <{ title }>
          </h1>
          <h2
            class="title question"
            onClick={(e : Html.Event) { handleSubtitleClick() }}
            style={
              if (animatingSubtitle) {
                "animation: space-warp 1s ease-in-out;"
              } else {
                ""
              }
            }>
            <{ subtitle }>
          </h2>
        </hgroup>
      </li>
    </ul>
  }
}
