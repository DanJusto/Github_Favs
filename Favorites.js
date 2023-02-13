export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`
        return fetch(endpoint).then(data => data.json()).then(data => ({
            login: data.login,
            name: data.name,
            public_repos: data.public_repos,
            followers: data.followers
        }))
    }
}

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login.toLowerCase() === username)
            if(userExists) {
                throw new Error('Usuário já favoritado')
            }

            const githuber = await GithubUser.search(username)
            if(githuber.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [githuber, ...this.entries]
            this.update()
            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filterEntries = this.entries.filter(entry => {
            if(entry.login !== user.login) {
                return true
            }
        })
        this.entries = filterEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value.toLowerCase())
        }
    }

    update() {
        this.removeAllTr()

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user a p').textContent = user.name
            row.querySelector('.user a span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar este githuber?')
                if(isOk) {
                    this.delete(user)
                }
            }
        
            this.tbody.append(row)
        })
    }

    createRow() {
        const tr = document.createElement('tr')
        const content = `
            <td class="user">
                <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
                <a href="https://github.com/maykbrito" target="_blank">
                    <p>Mayk Brito</p>
                    <span>/maykbrito</span>
                </a>
            </td>
            <td class="repositories">123</td>
            <td class="followers">1234</td>
            <td class="remove">
                <button>Remover</button>
            </td>
        `

        tr.innerHTML = content
        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        }) 
    }
}