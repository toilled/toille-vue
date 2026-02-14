record Page {
  name : String,
  link : String,
  title : String,
  body : Array(String),
  hidden : Bool
}

store Store {
  state currentPage : Page = Page("Home", "/", "Home", ["Loading..."], false)
  state pages : Array(Page) = [
    Page("Home", "/", "Home", [
      "This website serves as a home page for testing various ideas developed using Vue JS. The content presented here may undergo periodic changes as I continue to experiment with different concepts and functionalities.",
      "I have recently embarked on a new chapter in my career, joining RM as a Software Engineer.  I am enthusiastic about this opportunity to further develop my skills and contribute to the company's success. I am eager to collaborate with the talented team at RM and embrace the challenges that lie ahead.  I believe this role will provide me with a platform for significant professional growth, and I am excited to see what the future holds."
    ], false),
    Page("About", "/about", "About Me", [
      "I am a BSc (Hons) graduate who has been confident working with computers in some way for most of my life.",
      "With 14 years of experience in software and web development, I have primarily focused on PHP, while also utilizing JavaScript on various occasions. My expertise encompasses a comprehensive understanding of version control systems, particularly Git, and proficiency in managing MySQL databases.",
      "Throughout my career, I have gained experience with multiple frameworks and libraries, notably:<ul><li>Laravel and Symfony for PHP, which enhances the development of robust applications.</li><li>React, SolidJS and VueJS for JavaScript, allowing for the creation of dynamic user interfaces.</li></ul>",
      "This diverse skill set positions me well for contributing to complex projects in the software development landscape."
    ], false),
    Page("Interests", "/interests", "My Interests", [
      "In addition to my professional commitments, I engage in developing new coding ideas as a hobby during my spare time. This pursuit not only allows me to explore innovative concepts but also enables me to stay informed about emerging programming languages and technologies.",
      "Furthermore, I maintain an active interest in music. I play several musical instruments, with the guitar being my primary focus. My passion for music has led me to create original compositions, some of which I have shared on <a href=\"https://www.youtube.com/@toilled\" class=\"contrast\" target=\"_blank\">YouTube</a>. This platform serves as a means for me to express my creativity and connect with others who share similar interests.",
      "Through these hobbies, I continue to enhance my skills and broaden my horizons in both technology and the arts."
    ], false),
    Page("Hidden", "/hidden", "Hidden", [
      "This page is a little secret! It's not included in the main navigation menu, but it's here for you to explore. On this page, you'll find links to a few extra things I've built. These are small projects and games that I've created for fun. Feel free to check them out and see what you think!",
      "<ul><li><a href=\"/checker\">Checker</li><li><a href=\"/game\">Game</li><li><a href=\"/noughts-and-crosses\">Noughts and Crosses</li><li><a href=\"/ask\">Ask Me</li></ul>"
    ], true)
  ]

  state title : String = "Elliot Dickerson"
  state subtitle : String = "A site to test things"

  state activityOpen : Bool = false
  state jokeOpen : Bool = false

  fun setPage (path : String) : Promise(Void) {
    let page = pages |> Array.find((p : Page) { p.link == path })

    let nextCurrentPage =
      case (page) {
        Maybe::Just(p) => p
        Maybe::Nothing => Page("404", "/404", "Not Found", ["Page not found."], false)
      }

    next { currentPage: nextCurrentPage }
  }

  fun toggleActivity : Promise(Void) {
    next { activityOpen: !activityOpen }
  }

  fun toggleJoke : Promise(Void) {
    next { jokeOpen: !jokeOpen }
  }
}
