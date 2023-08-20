import {
  faArrowCircleRight,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {API, Auth} from 'aws-amplify'
import {useEffect, useState} from 'react'
import './video.css'

const Video = () => {
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [activeBtn, setActiveBtn] = useState('none')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState<number>()
  const [loading, setLoading] = useState(false)
  const [animationState, setAnimationState] = useState({
    likeAnimate: true,
    dislikeAnimate: true,
  })

  async function callLambdaFunction() {
    setLoading(true)
    try {
      const userSub = await getUserSub()
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
    } finally {
      setLoading(false)
    }
  }

  const handleAnimation = (key: string) => {
    setAnimationState((prevState) => ({
      ...prevState,
      [key]: false,
    }))
    setTimeout(() => {
      setAnimationState((prevState) => ({
        ...prevState,
        [key]: true,
      }))
    }, 1000)
  }

  const handleVote = async (action: string) => {
    const userSub = await getUserSub()
    try {
      await API.post('fetchRandomVideo', '/', {
        body: {
          videoKey: videoId,
          action,
          userId: userSub,
        },
      })
    } catch (error) {
      console.log('Error updating vote:', error)
    }
  }

  const handleLikeClick = async () => {
    handleAnimation('likeAnimate')
    if (activeBtn === 'none') {
      setLikeCount((prev) => prev + 1)
      setActiveBtn('like')
      await handleVote('like')
    } else if (activeBtn === 'like') {
      setLikeCount((prev) => prev - 1)
      setActiveBtn('none')
      await handleVote('remove')
    } else if (activeBtn === 'dislike') {
      setLikeCount((prev) => prev + 1)
      setDislikeCount((prev) => prev - 1)
      setActiveBtn('like')
      await handleVote('remove')
      await handleVote('like')
    }
  }

  const handleDislikeClick = async () => {
    handleAnimation('dislikeAnimate')
    if (activeBtn === 'none') {
      setDislikeCount((prev) => prev + 1)
      setActiveBtn('dislike')
      await handleVote('dislike')
    } else if (activeBtn === 'dislike') {
      setDislikeCount((prev) => prev - 1)
      setActiveBtn('none')
      await handleVote('remove')
    } else if (activeBtn === 'like') {
      setDislikeCount((prev) => prev + 1)
      setLikeCount((prev) => prev - 1)
      setActiveBtn('dislike')
      await handleVote('remove')
      await handleVote('dislike')
    }
  }

  useEffect(() => {
    checkUserAuthentication()
    callLambdaFunction()
  }, [])

  async function checkUserAuthentication() {
    try {
      const session = await Auth.currentSession()
      if (session && session.isValid()) {
        console.log('User is authenticated')
      } else {
        console.log('User is not authenticated')
      }
    } catch (error) {
      console.log('Error getting user session:', error)
    }
  }

  async function getUserSub() {
    try {
      const userInfo = await Auth.currentAuthenticatedUser()
      return userInfo.attributes.sub
    } catch (error) {
      console.log('Error fetching user information:', error)
      return null
    }
  }

  return (
    <div className="container">
      {loading ? (
        <div className="loading-skeleton card box"></div>
      ) : (
        <div className="card box">
          <h2>{title}</h2>
          {url && (
            <video controls key={url}>
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
      <div className="feedback">
        <button
          title="I like this video"
          className={`btn ${activeBtn === 'like' ? 'like-active' : ''}`}
          onClick={handleLikeClick}
          aria-label="Like">
          <FontAwesomeIcon
            icon={faThumbsUp}
            bounce={!animationState.likeAnimate}
          />
          {likeCount}
        </button>
        <button
          title="I dislike this video"
          className={`btn ${activeBtn === 'dislike' ? 'dislike-active' : ''}`}
          onClick={handleDislikeClick}
          aria-label="Dislike">
          <FontAwesomeIcon
            icon={faThumbsDown}
            bounce={!animationState.dislikeAnimate}
          />
          {dislikeCount}
        </button>
        <button
          title="Show me the next video"
          className="btn"
          aria-label="Next Video"
          onClick={callLambdaFunction}>
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </button>
      </div>
    </div>
  )
}

export {Video}
