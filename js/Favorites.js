import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  checkUserLength() {
    if (this.entries.length === 0) {
      document.querySelector(".empty-state").style.display = ""
    } else {
      document.querySelector(".empty-state").style.display = "none"
    }
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites")) || []
  }

  saveFavorite() {
    localStorage.setItem("@github-favorites", JSON.stringify(this.entries))
  }

  async addFavorite(username) {
    const userExists = this.entries.find(entry => entry.login === username)
    if (userExists) return alert("User already exists on your favorites list")
    try {
      const user = await GithubUser.search(username)
      if (!user.login) return alert("User not found")

      this.entries = [user, ...this.entries]
      this.render()
      this.saveFavorite()
    } catch (error) {
      alert(error.message)
    }
  }

  remove(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
    this.entries = filteredEntries
    this.render()
    this.saveFavorite()
    this.checkUserLength()
  }
}

export class viewFavorites extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector("tbody")
    this.render()
    this.onAddFavorite()
  }

  onAddFavorite() {
    const addButton = this.root.querySelector(".search button")
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input")
      this.addFavorite(value)
    }
  }

  render() {
    this.removeAllFavorites()

    this.entries.forEach((user) => {
      const tr = this.createRow()
      tr.querySelector(".user img").src = `https://github.com/${user.login}.png`
      tr.querySelector(".user img").alt = `Image of ${user.name}`
      tr.querySelector(".user p").textContent = user.name
      tr.querySelector(".user span").textContent = `/${user.login}`
      tr.querySelector(".repositories").textContent = user.public_repos
      tr.querySelector("a").href = user.login
      tr.querySelector(".followers").textContent = user.followers
      tr.querySelector(".btn-remove").addEventListener("click", () => {
        const isOk = confirm(`Do you really want to remove ${user.login} from your favorites?`)

        if (isOk) {
          this.remove(user)
          alert(`${user.login} was removed from your favorites`)
        }
      })
      this.tbody.appendChild(tr)
      this.checkUserLength()
    })
  }

  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/gustavohdab.png" />
      <a href="https://github.com/gustavohdab" target="_blank">
        <p>Gustavo</p>
        <span> /gustavohdab </span>
      </a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">1234</td>
    <td>
      <button class="btn-remove">Remove</button>
    </td>
    `
    return tr
  }

  removeAllFavorites() {
    const tbody = this.root.querySelector("tbody")
    tbody.querySelectorAll("tr").forEach((tr) => tr.remove())
  }
}