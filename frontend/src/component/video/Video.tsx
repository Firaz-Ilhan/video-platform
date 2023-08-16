import {
  faArrowCircleRight,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {API, Auth} from 'aws-amplify'
import {useEffect, useState} from 'react'
import './video.css'
import {Storage} from 'aws-amplify'

const Video = () => {
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)

  const [activeBtn, setActiveBtn] = useState('none')

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  async function callLambdaFunction() {
    try {
      const response = await API.get('fetchRandomVideo', '/', {})
      console.log(response)
      const {title, url} = response.body
      setTitle(title)
      console.log(url)
      setUrl(url)
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

  const handleLikeClick = () => {
    handleAnimation('likeAnimate')

    if (activeBtn === 'none') {
      setLikeCount((prevCount) => prevCount + 1)
      setActiveBtn('like')
    } else if (activeBtn === 'like') {
      setLikeCount((prevCount) => prevCount - 1)
      setActiveBtn('none')
    } else if (activeBtn === 'dislike') {
      setLikeCount((prevCount) => prevCount + 1)
      setDislikeCount((prevCount) => prevCount - 1)
      setActiveBtn('like')
    }
  }

  const handleDislikeClick = () => {
    handleAnimation('dislikeAnimate')

    if (activeBtn === 'none') {
      setDislikeCount((prevCount) => prevCount + 1)
      setActiveBtn('dislike')
    } else if (activeBtn === 'dislike') {
      setDislikeCount((prevCount) => prevCount - 1)
      setActiveBtn('none')
    } else if (activeBtn === 'like') {
      setDislikeCount((prevCount) => prevCount + 1)
      setLikeCount((prevCount) => prevCount - 1)
      setActiveBtn('dislike')
    }
  }

  const handleNextVideoClick = () => {
    callLambdaFunction()
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
          onClick={handleNextVideoClick}>
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </button>
        <button title="call lambda function test" onClick={callLambdaFunction}>
          Call Lambda
        </button>
      </div>
    </div>
  )
}

export {Video}
