import {useState, useEffect} from 'react'
import {API} from 'aws-amplify'

function useVideoData(userSub: string | null) {
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [activeBtn, setActiveBtn] = useState('none')
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<number>()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const callLambdaFunction = async () => {
    setLoading(true)
    if (!userSub) {
      setLoading(false)
      return
    }
    try {
      const response = await API.get('fetchRandomVideo', '/', {
        queryStringParameters: {
          userId: userSub,
        },
      })

      const {title, url, videoKey, likes, dislikes} = response.body.videoInfo
      setTitle(title)
      setVideoId(videoKey)
      setUrl(url)
      setLikeCount(likes)
      setDislikeCount(dislikes)
      setActiveBtn(response.body.userVote || 'none')
    } catch (error) {
      console.log(error)
      setError('Failed to fetch video details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    callLambdaFunction()
  }, [userSub])

  return {
    likeCount,
    dislikeCount,
    activeBtn,
    videoId,
    title,
    url,
    loading,
    error,
    setLikeCount,
    setDislikeCount,
    setActiveBtn,
    refetch: callLambdaFunction,
  }
}

export {useVideoData}
