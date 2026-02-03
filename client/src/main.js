const display = document.getElementById('app')
const form = document.getElementById('form')
const baseURL = 'http://localhost:1000'

async function fetchData() {
  const response = await fetch(`${baseURL}/leaderboard`)
  const messages = await response.json()

  console.log(messages)

  return messages
}

async function displayLeaderboard() {
  const messages = await fetchData()

  messages.forEach((message) => {
    const div = document.createElement('div')
    const userName = document.createElement('p')
    const messageContent = document.createElement('p')

    userName.textContent = leaderboard.username
    messageContent.textContent = leaderboard.score

    div.append(userName, messageContent)

    display.appendChild(div)
  })
}
displayLeaderboard()


async function handleSubmit(event) {
  event.preventDefault()

  const formData = new FormData(form)
  const userInput = Object.fromEntries(formData)
  const userInputJSON = JSON.stringify(userInput)


  const response = await fetch(`${baseURL}/leaderboard`, {
    headers: {
      "Content-Type" : "application/json"
    },
    method: "POST",
    body: userInputJSON
  })
  window.location.reload()
} 

form.addEventListener('submit', handleSubmit)