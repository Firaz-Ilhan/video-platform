import {API} from 'aws-amplify'

export async function handleVote(
  videoId: number,
  action: string,
  userSub: string | null
) {
  if (!userSub) {
    throw new Error('User sub not available')
  }
  await API.post('fetchRandomVideo', '/', {
    body: {
      videoKey: videoId,
      action,
      userId: userSub,
    },
  })
}
