component Main {
  connect Store exposing { currentPage, setPage }

  fun render : Html {
    <div id="content-wrapper">
      <nav>
        <Title/>
        <Menu/>
      </nav>
      <div class="router-view-container">
        <div class="page-content">
          <h1><{ currentPage.title }></h1>
          for (paragraph of currentPage.body) {
            <p dangerouslySetInnerHTML={`{__html: ${paragraph}}`} />
          }
        </div>
      </div>

      <CyberpunkCity/>
    </div>
  }
}

routes {
  / {
    Store.setPage("/")
  }

  /about {
    Store.setPage("/about")
  }

  /interests {
    Store.setPage("/interests")
  }

  /hidden {
    Store.setPage("/hidden")
  }

  * {
    Store.setPage("/404")
  }
}
