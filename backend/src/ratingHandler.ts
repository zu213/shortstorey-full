import { Rating } from "@prisma/client";
import Prisma from "./db";

// WILL NEED OVERHAUL IN FUTURE

export async function checkIfRatingExists(userId: string, storyId: string){
   let dupeCount = await Prisma.rating.count(
    {
      where: {
        user_id: userId,
        to_story_id: storyId
      }
    }
  )
  if(dupeCount > 0){
    return true
  }
  return false
}

export async function getUserRating(userId: string): Promise<number> {
  const from_user = await Prisma.user.findUnique({
    where: { id: userId},
  });
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

export async function createNewRating(actualScore: number, fromUserId: string, storyId: string): Promise<Rating> {
  let updatedEntryBody : any = {actual_score: actualScore, user_id: fromUserId, to_story_id: storyId};

  // get users score
  let multiplier = await getUserRating(fromUserId)

  // get the relevant story
  const story = await Prisma.story.findUnique({
    where: { id: storyId},
  });
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
    const createdRatingData = await Prisma.rating.create({ data: updatedEntryBody as Rating });
    return createdRatingData;
  } catch {
    throw Error("Error creating rating")
  }
}

export async function updateRating(newRating: number, ratingId: string, fromUserId: string): Promise<Rating> {
  try {
    const rating = await Prisma.rating.update({
      data: {
        actual_score: newRating,
        rating_power: await getUserRating(fromUserId)
      },
      where: { id: ratingId },
    });
    return rating
  } catch {
    throw new Error("Error updating" );
  }
}

export async function deleteRating(id:string): Promise<string> {
  try {
    const storyId = (await Prisma.rating.findUnique({ where: { id: id } }))!.to_story_id
    await Prisma.rating.delete({ where: { id: id } });
    return storyId
  } catch {
    throw new Error("Error updating" );
  }
}

export async function propagateRatingToStory(rating: Rating, updateToRating = false) {
   // Now we update the story then the users rating
  const story = await Prisma.story.findUnique({
    where: { id: rating.to_story_id},
  });

  if(!story) throw new Error(`Story with id: ${rating.to_story_id}, not found`)
    
  const ratingCount = await Prisma.rating.count({
    where: { to_story_id: rating.to_story_id}
  });

  var newRating
  if(ratingCount < 2) {
    // if first rating, early return
    newRating = rating.actual_score / 5
  } else if(story.rating) {
    var tempRating = story.rating
    if(updateToRating){
      // rating is being modified instead
      newRating = await calculateRatingFromScratch(rating.to_story_id)
    } else {
      newRating = calculateRating(tempRating, ratingCount, rating.actual_score, rating.rating_power)
    }
  } else {
    // shouldn't reach here but if mroe than one rating and rating not updated work out from scratch
    console.log('Working out rating from scratch')
    newRating = await calculateRatingFromScratch(rating.to_story_id)
  }

  try{
    const updatedStoryRating = await Prisma.story.update(
    {
      data: { rating: newRating },
      where: { id: story?.id },
    });
    return updatedStoryRating;
  } catch {
    throw new Error("Error updating story" );
  }
}

export async function updateStoryBlind(storyId: string){
  try{
    const updatedStoryRating = await Prisma.story.update(
    {
      data: { rating: await calculateRatingFromScratch(storyId) },
      where: { id: storyId },
    });
    console.log('test')
    return updatedStoryRating;
  } catch {
    throw new Error("Error updating story" );
  }
}

export async function propagateRatingToUser(userId: string) {
   // Now we update the story then the users rating
  const user = await Prisma.user.findUnique({
    where: { id: userId},
  });

  if(!user) throw new Error(`User with id: ${userId}, not found`)
    
  const ratedStories = await Prisma.story.findMany({
    where: { 
      user_id: userId,
      rating: {
        not: null
      }
     }
  })

  if(ratedStories.length == 0) throw new Error(`No stories with any rating belong to user ${userId}`)

  const average = ratedStories.reduce((total, next) => total + next.rating!, 0) / ratedStories.length

  try{
    const updatedUserRating = await Prisma.user.update(
    {
      data: { rating: average },
      where: { id: userId },
    });
    return updatedUserRating;
  } catch {
    throw new Error("Error updating story" );
  }
}

function calculateRating(storyRating: number, ratingCount: number, newRating: number, newRatingPower: number): number{
    const ratingWithVolume = storyRating * (ratingCount - 1)
    const newRatingDisparity = (newRating / 5) - storyRating
    return (ratingWithVolume + newRatingDisparity * newRatingPower ) / (ratingCount - 1)
}

async function calculateRatingFromScratch(toStoryId: string){
  var newRating
  const allRatings = await Prisma.rating.findMany({
    where: { to_story_id: toStoryId}
  });
  newRating = allRatings[0].actual_score / 5
  for(var i = 1; i < allRatings.length; i++){
    newRating = calculateRating(newRating, i + 1, allRatings[i].actual_score, allRatings[i].rating_power)
  }
  return newRating
}