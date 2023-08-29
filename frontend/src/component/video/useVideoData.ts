import {API, Storage} from 'aws-amplify'
import {useEffect, useState} from 'react'

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
      const response = await API.get('video', '/', {
        queryStringParameters: {
          userId: userSub,
        },
      })

      const {title, url, videoKey, likes, dislikes} = response.body.videoInfo
      setTitle(title)
      setVideoId(videoKey)
      const fileUrl = (await getFile(url)) || ''
      setUrl(fileUrl)

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

  async function getFile(key: string) {
    console.log('key', key)
    try {
      const file = await Storage.get(key, {
        bucket: process.env.REACT_APP_AWS_VIDEO_S3_BUCKET,
        customPrefix: {
          public: '',
        },
      })
      console.log(file, 'file')
      return file
    } catch (error) {
      console.error(`Failed to fetch video URL: ${error}`)
      setError(`Failed to fetch video URL: ${error}`)
    }
  }

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
