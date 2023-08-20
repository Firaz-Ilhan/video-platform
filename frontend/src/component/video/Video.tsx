import {
  faArrowCircleRight,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {API, Auth} from 'aws-amplify'
import {SetStateAction, useEffect, useState} from 'react'
import './video.css'

const Video = () => {
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [activeBtn, setActiveBtn] = useState('none')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState<number>()

  async function callLambdaFunction() {
    try {
      const userSub = await getUserSub()
      console.log(userSub, 'userSub')
      const response = await API.get('fetchRandomVideo', '/', {
        queryStringParameters: {
          userId: userSub,
        },
      })

      console.log(response, 'response')

      const {title, url, videoKey, likes, dislikes} = response.body.videoInfo

      setTitle(title)
      setVideoId(videoKey)
      setUrl(url)
      setLikeCount(likes)
      setDislikeCount(dislikes)

      if (response.body.userVote) {
        setActiveBtn(response.body.userVote)
      } else {
        setActiveBtn('none')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const [animationState, setAnimationState] = useState({
    likeAnimate: true,
    dislikeAnimate: true,
  })

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

  const sendVote = async (action: string) => {
    const userSub = await getUserSub()

    try {
      const response = await API.post('fetchRandomVideo', '/', {
        body: {
          videoKey: videoId,
          action: action,
          userId: userSub,
        },
      })
      console.log(response)
    } catch (error) {
      console.log('Error updating vote:', error)
    }
  }

  const handleLikeClick = async () => {
    handleAnimation('likeAnimate')

    if (activeBtn === 'none') {
      setLikeCount((prevCount) => prevCount + 1)
      setActiveBtn('like')
      sendVote('like')
    } else if (activeBtn === 'like') {
      setLikeCount((prevCount) => prevCount - 1)
      setActiveBtn('none')
      sendVote('remove')
    } else if (activeBtn === 'dislike') {
      setLikeCount((prevCount) => prevCount + 1)
      setDislikeCount((prevCount) => prevCount - 1)
      setActiveBtn('like')
      sendVote('like')
    }
  }

  const handleDislikeClick = async () => {
    handleAnimation('dislikeAnimate')

    if (activeBtn === 'none') {
      setDislikeCount((prevCount) => prevCount + 1)
      setActiveBtn('dislike')
      sendVote('dislike')
    } else if (activeBtn === 'dislike') {
      setDislikeCount((prevCount) => prevCount - 1)
      setActiveBtn('none')
      sendVote('remove')
    } else if (activeBtn === 'like') {
      setDislikeCount((prevCount) => prevCount + 1)
      setLikeCount((prevCount) => prevCount - 1)
      setActiveBtn('dislike')
      sendVote('dislike')
    }
  }

  const loading = false

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
      console.log(userInfo, 'user info')
      return userInfo.attributes.sub
    } catch (error) {
      console.log('Error fetching user information:', error)
      return null
    }
  }

  useEffect(() => {
    checkUserAuthentication()
  }, [])

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
