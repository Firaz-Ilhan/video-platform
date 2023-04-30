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

  const handleLikeClick = () => {
    if (activeBtn === 'none') {
      setLikeCount(likeCount + 1)
      setActiveBtn('like')
      return
    }

    if (activeBtn === 'like') {
      setLikeCount(likeCount - 1)
      setActiveBtn('none')
      return
    }

    if (activeBtn === 'dislike') {
      setLikeCount(likeCount + 1)
      setDislikeCount(dislikeCount - 1)
      setActiveBtn('like')
    }
  }

  const handleDisikeClick = () => {
    if (activeBtn === 'none') {
      setDislikeCount(dislikeCount + 1)
      setActiveBtn('dislike')
      return
    }

    if (activeBtn === 'dislike') {
      setDislikeCount(dislikeCount - 1)
      setActiveBtn('none')
      return
    }

    if (activeBtn === 'like') {
      setDislikeCount(dislikeCount + 1)
      setLikeCount(likeCount - 1)
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
          <FontAwesomeIcon icon={faThumbsUp} />
          {likeCount}
        </button>

        <button
          title="I dislike this video"
          className={`btn ${activeBtn === 'dislike' ? 'dislike-active' : ''}`}
          onClick={handleDisikeClick}
          aria-label="Dislike">
          <FontAwesomeIcon icon={faThumbsDown} />
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
