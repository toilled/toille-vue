component MenuItem {
  property page : Page

  fun render : Html {
    <li class="menu-item">
      <a href={page.link}>
        <{ page.name }>
      </a>
    </li>
  }

  style menu-item {
    margin: 10px 0;

    a {
      display: block;
      padding: 10px 20px;
      text-decoration: none;
      color: inherit;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        background: rgba(20, 30, 60, 0.6);
        box-shadow: 0 0 15px rgba(100, 149, 237, 0.5), 0 0 5px rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        border-color: rgba(100, 149, 237, 0.3);
      }

      &:active {
        background: rgba(40, 60, 100, 0.8);
        box-shadow: 0 0 25px rgba(100, 149, 237, 0.8), 0 0 10px rgba(255, 255, 255, 0.5);
        transform: translateY(1px) scale(0.98);
        border-color: rgba(100, 149, 237, 0.8);
      }
    }
  }
}
