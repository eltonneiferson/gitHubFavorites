import { apiGitHub } from "./apiGitHub.js";

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
        this.noneFavorite()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem
        ('@github-favorites:')) || []
    }

    save() {
       localStorage.setItem('@github-favorites:', JSON.stringify(this.entries)) 
    }

    noneFavorite() {
        if (this.entries.length == 0) {
          this.removeFavorite()
          const emptyRow = document.createElement('tr')
          emptyRow.innerHTML = `
            <td class="noneFavorites" colspan="4">
                <div class="empty"><img src="imgs/big-star.svg" alt="Estrela grande"><h1>Nenhum favorito encontrado</h1></div>
            </td>
          `

          this.tbody.append(emptyRow)
        }
      }

    async add(username) {
        try {
            
            const userExists = this.entries.find(entry => entry.login === username)
            const userName = this.root.querySelector('.search input').value

            if(userExists) {
                throw new Error(`O usuário ${userName} já está no seus favoritos!`)
            }
            
            const user = await apiGitHub.search(username)
            
            if(user.login === undefined) {
                throw new Error(`O usuário ${userName} não foi encontrado ou não existe!`)
            }

            this.entries =[user, ...this.entries]
            this.update()
            this.save()
            this.root.querySelector('.search input').value = ''

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.update()
        this.onadd()
    }
    
    onadd() {
        const addButton = this.root.querySelector('.search button')
        
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            
            this.add(value)
        }
    }
    
    update() {
        if (this.entries.length != 0) {
            this.removeFavorite()
        }
        this.entries.forEach( user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            
            row.querySelector('.remove').onclick = () => {
                const ok = confirm(`Tem certeza que deseja remover ${user.login} do seus favoritos?`)
                
                if(ok) {
                    this.delete(user)
                }
                
                this.noneFavorite()
            }

            this.tbody.append(row)
        })
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td class="user">
                <img src="" alt="">
                <a href="" target="_blank">
                <p></p>
                <span></span>
                </a>
            </td>
            
            <td class="repositories"></td>
            
            <td class="followers"></td>

            <td><button class="remove">Remover</button></td>
        `
        return tr
    }

    removeFavorite() {
        this.tbody = this.root.querySelector('table tbody')
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        })
    }
}