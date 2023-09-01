import {API, Storage} from 'aws-amplify'
import {useEffect, useState} from 'react'

type VideoData = {
  fetchedLikeCount: number
  fetchedDislikeCount: number
  activeBtn: 'none' | 'like' | 'dislike'
  videoId: number | undefined
  title: string
  url: string
  loading: boolean
  error: string | null
}

function useVideoData(userSub: string | null) {
  const [videoData, setVideoData] = useState<VideoData>({
    fetchedLikeCount: 0,
    fetchedDislikeCount: 0,
    activeBtn: 'none',
    videoId: undefined,
    title: '',
    url: '',
    loading: false,
    error: null,
  })

  const callLambdaFunction = async () => {
    setVideoData((prevData) => ({
      ...prevData,
      loading: true,
    }))

    if (!userSub) {
      setVideoData((prevData) => ({
        ...prevData,
        loading: false,
      }))
      return
    }

    try {
      const response = await API.get('video', '/', {
        queryStringParameters: {
          userId: userSub,
        },
      })

      const {title, url, videoKey, likes, dislikes} = response.body.videoInfo
      setVideoData({
        fetchedLikeCount: likes,
        fetchedDislikeCount: dislikes,
        activeBtn: response.body.userVote || 'none',
        videoId: videoKey,
        title,
        url: await getFile(url),
        loading: false,
        error: null,
      })
    } catch (error) {
      console.log(error)
      setVideoData((prevData: VideoData) => ({
        ...prevData,
        error: 'Failed to fetch video details.',
        loading: false,
      }))
    }
  }

  useEffect(() => {
    callLambdaFunction()
  }, [userSub])

  async function getFile(key: string) {
    try {
      const file = await Storage.get(key, {
        bucket: process.env.REACT_APP_AWS_VIDEO_S3_BUCKET,
        customPrefix: {
          public: '',
        },
      })
      return file
    } catch (error) {
      console.error(`Failed to fetch video URL: ${error}`)
      setVideoData((prevData: VideoData) => ({
        ...prevData,
        error: `Failed to fetch video URL: ${error}`,
      }))
      return ''
    }
  }

  return {...videoData, refetch: callLambdaFunction}
}

export {useVideoData}
