const display = document.getElementById('app')
const form = document.getElementById('form')
const baseURL = ''

async function fetchData() {
  const response = await fetch(`${baseURL}/messages`)
  const messages = await response.json()

  console.log(messages)

  return messages
}



async function displayMessages() {
  const messages = await fetchData()

  messages.forEach((message) => {
    const div = document.createElement('div')
    const userName = document.createElement('p')
    const messageContent = document.createElement('p')

    userName.textContent = message.msg_name
    messageContent.textContent = message.content

    div.append(userName, messageContent)

    display.appendChild(div)
  })
}
displayMessages()


async function handleSubmit(event) {
  event.preventDefault()

  const formData = new FormData(form)
  const userInput = Object.fromEntries(formData)
  const userInputJSON = JSON.stringify(userInput)


  const response = await fetch(`${baseURL}/messages`, {
    headers: {
      "Content-Type" : "application/json"
    },
    method: "POST",
    body: userInputJSON
  })
  window.location.reload()
} 

form.addEventListener('submit', handleSubmit)