
export async function getStories(params){
  console.log(params) // temp
  const response = await fetch(`/stories${`?${params}` ?? ''}`)
  if(!response.ok) throw new Error('nope nope')
  const json = await response.json()
  return json
}

export async function getStory(id){
  const response = await fetch(`/stories/${id}`)
  if(!response.ok) throw new Error('nope nope')
  const json = await response.json()
  return json
}

export async function getUser(id){
  const response = await fetch(`/user/${id}`)
  if(!response.ok) throw new Error('nope nope')
  const json = await response.json()
  return json
}

export async function attemptLogin(username, password){

  console.log('test')
  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "name": username, "passGuess": password })
  })

  if(!response.ok) throw new Error('nope nope')
  const json = await response.json()
  return json
}