
export async function getStories(params){
  console.log(params) // temp
  const response = await fetch(`/stories`)
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