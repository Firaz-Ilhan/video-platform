import {useState, useCallback, useEffect} from 'react'
import {handleVote} from './voteUtils'

export const useVote = (
  initialLikeCount: number,
  initialDislikeCount: number,
  initialActiveBtn: 'none' | 'like' | 'dislike',
  videoId: number | undefined,
  userSub: string | null
) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount)
  const [activeBtn, setActiveBtn] = useState(initialActiveBtn)

  const vote = useCallback(
    async (action: 'like' | 'dislike') => {
      switch (activeBtn) {
        case 'none':
          if (action === 'like') {
            setLikeCount((prev: number) => prev + 1)
            setActiveBtn('like')
          } else if (action === 'dislike') {
            setDislikeCount((prev: number) => prev + 1)
            setActiveBtn('dislike')
          }
          await handleVote(videoId!, action, userSub)
          break

        case 'like':
          setLikeCount((prev: number) => prev - 1)
          if (action === 'like') {
            setActiveBtn('none')
            await handleVote(videoId!, 'remove', userSub)
          } else if (action === 'dislike') {
            setDislikeCount((prev: number) => prev + 1)
            setActiveBtn('dislike')
            await handleVote(videoId!, 'remove', userSub)
            await handleVote(videoId!, 'dislike', userSub)
          }
          break

        case 'dislike':
          setDislikeCount((prev: number) => prev - 1)
          if (action === 'dislike') {
            setActiveBtn('none')
            await handleVote(videoId!, 'remove', userSub)
          } else if (action === 'like') {
            setLikeCount((prev: number) => prev + 1)
            setActiveBtn('like')
            await handleVote(videoId!, 'remove', userSub)
            await handleVote(videoId!, 'like', userSub)
          }
          break

        default:
          console.error('Unknown active button state')
      }
    },
    [activeBtn, videoId, userSub]
  )

  useEffect(() => {
    setLikeCount(initialLikeCount)
    setDislikeCount(initialDislikeCount)
    setActiveBtn(initialActiveBtn)
  }, [initialLikeCount, initialDislikeCount, initialActiveBtn])

  return {
    likeCount,
    setLikeCount,
    dislikeCount,
    setDislikeCount,
    activeBtn,
    setActiveBtn,
    vote,
  }
}
