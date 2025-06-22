import { Rating } from "@prisma/client"
import Prisma from "./db"

/** Creates a new rating in the database */
export async function createNewRating(actualScore: number, fromUserId: string, storyId: string): Promise<Rating> {
  let updatedEntryBody : any = {actual_score: actualScore, user_id: fromUserId, to_story_id: storyId}

  // get users score
  let multiplier = await getUserRating(fromUserId)

  // get the relevant story
  const story = await Prisma.story.findUnique({
    where: { id: storyId},
  })
  if(!story){
    throw new Error('Error story not found')
  }
  if(story.user_id == fromUserId){
    throw Error('Invalid review, you cannot self review!')
  }

  updatedEntryBody["created_at"] = new Date()
  updatedEntryBody.rating_power = multiplier

  // store the new rating with its power based off the user who gave it.
  try {
    const createdRatingData = await Prisma.rating.create({ data: updatedEntryBody as Rating })
    return createdRatingData
  } catch {
    throw Error("Error creating rating")
  }
}

/** Update a rating */
export async function updateRating(newRating: number, ratingId: string, fromUserId: string): Promise<Rating> {
  try {
    const rating = await Prisma.rating.update({
      data: {
        actual_score: newRating,
        rating_power: await getUserRating(fromUserId)
      },
      where: { id: ratingId },
    })
    return rating
  } catch {
    throw new Error("Error updating" )
  }
}

/** Delete a rating */
export async function deleteRating(id:string): Promise<string> {
  try {
    const storyId = (await Prisma.rating.findUnique({ where: { id: id } }))!.to_story_id
    await Prisma.rating.delete({ where: { id: id } })
    return storyId
  } catch {
    throw new Error("Error updating" )
  }
}

/** Once a rating has been made/updated/changed we need to change ths tories overall rating */
export async function propagateRatingToStory(rating: Rating, updateToRating = false) {
  const story = await Prisma.story.findUnique({
    where: { id: rating.to_story_id},
  })

  if(!story) throw new Error(`Story with id: ${rating.to_story_id}, not found`)
    
  const ratingCount = await Prisma.rating.count({
    where: { to_story_id: rating.to_story_id}
  })

  var newRating
  if(ratingCount < 1) {
    // No ratings case
    newRating = null
  } else if(ratingCount < 2) {
    // 1 rating case
    newRating = rating.actual_score / 5
  } else if(story.rating && !updateToRating) { 
    // > 1 rating case to save time - maybe we remove
    newRating = calculateRating(story.rating, ratingCount, rating.actual_score, rating.rating_power)
  } else {
    // Final case/ if a rating has been deleted/ changed
    newRating = await calculateRatingFromScratch(rating.to_story_id)
  }

  try{
    const updatedStoryRating = await Prisma.story.update(
    {
      data: { rating: newRating },
      where: { id: story?.id },
    })
    return updatedStoryRating
  } catch(e) {
    throw new Error(`Error updating story: ${e}` )
  }
}

/** If we don't have details about a specific rating we have to do this i.e. in delete case
 * In future may just move ot using htis everywhere for simplicity
 */
export async function updateStoryBlind(storyId: string){
  try{
    const updatedStoryRating = await Prisma.story.update(
    {
      data: { rating: await calculateRatingFromScratch(storyId) },
      where: { id: storyId },
    })
    return updatedStoryRating
  } catch(e) {
    throw new Error(`Error updating story: ${e}` )
  }
}

/** Update user ratings - these are simpler / average of a users stories ratings */
export async function propagateRatingToUser(userId: string) {
   // Now we update the story then the users rating
  const user = await Prisma.user.findUnique({
    where: { id: userId},
  })

  if(!user) throw new Error(`User with id: ${userId}, not found`)
    
  const ratedStories = await Prisma.story.findMany({
    where: { 
      user_id: userId,
      rating: {
        not: null
      }
     }
  })

  var average = null
  if(ratedStories.length != 0) {
     average = ratedStories.reduce((total, next) => total + next.rating!, 0) / ratedStories.length
  }

  try{
    const updatedUserRating = await Prisma.user.update(
    {
      data: { rating: average },
      where: { id: userId },
    })
    return updatedUserRating
  } catch (e) {
    throw new Error(`Error updating story: ${e}, userid: ${userId}` )
  }
}
// -- Helper functions

/** Maths for a single rating adding step */
function calculateRating(storyRating: number, ratingCount: number, newRating: number, newRatingPower: number): number{
    const ratingWithVolume = storyRating * (ratingCount - 1)
    const newRatingDisparity = (newRating / 5) - storyRating
    return (ratingWithVolume + newRatingDisparity * newRatingPower ) / (ratingCount - 1)
}

/** Build up a users rating from the existing ratings */
async function calculateRatingFromScratch(toStoryId: string){
  var newRating = null
  const allRatings = await Prisma.rating.findMany({
    where: { to_story_id: toStoryId}
  })
  if(allRatings.length < 1) return null

  newRating = allRatings[0].actual_score / 5
  for(var i = 1; i < allRatings.length; i++){
    newRating = calculateRating(newRating, i + 1, allRatings[i].actual_score, allRatings[i].rating_power)
  }
  return newRating
}

/** Check if a rating for user/story combo exists */
export async function checkIfRatingExists(userId: string, storyId: string){
   return(!!(await Prisma.rating.findFirst(
    {
      where: {
        user_id: userId,
        to_story_id: storyId
      }
    }
  )))
}

/** Fetch a users rating score */
async function getUserRating(userId: string): Promise<number> {
  const from_user = await Prisma.user.findUnique({
    where: { id: userId},
  })
  // if not found user global average
  var multiplier
  if (from_user && from_user.rating) {
    multiplier =  from_user.rating
  }else{
    multiplier = ((await Prisma.rating.aggregate({
      _avg: {
        actual_score: true,
      },
    }))._avg.actual_score ?? 2.5) / 5
  }
  return multiplier
}