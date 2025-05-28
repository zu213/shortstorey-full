
export async function getStories(params){
    const response = await fetch(`/story/${params}`)
    if(!response.ok) throw new Error('nope nope')
    const json = await response.json()
    return json
}