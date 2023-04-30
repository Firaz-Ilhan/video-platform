import {
  faThumbsUp,
  faThumbsDown,
  faArrowCircleRight,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useState} from 'react'
import './video.css'

const Video = () => {
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)

  const [activeBtn, setActiveBtn] = useState('none')

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

  return (
    <div className="container">
      <div className="card box">
        <h2>video titel</h2>
        <video controls>
          <source
            src={
              'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4'
            }
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="feedback">
        <button
          title="I like this video"
          className={`btn ${activeBtn === 'like' ? 'like-active' : ''} toolto`}
          onClick={handleLikeClick}
          aria-label="Like">
          <FontAwesomeIcon
            icon={faThumbsUp}
            beat={!animationState.likeAnimate}
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
            beat={!animationState.dislikeAnimate}
          />
          {dislikeCount}
        </button>

        <button
          title="Show me the next video"
          className="btn"
          aria-label="Next Video">
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </button>
      </div>
    </div>
  )
}

export {Video}
