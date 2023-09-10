import {
  faArrowCircleRight,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons'
import {useAuthCheck} from '../../hooks/useAuthCheck'
import {FeedbackButton} from './FeedbackButton'
import {useAnimation} from './useAnimation'
import {useUserSub} from './useUserSub'
import {useVideoData} from './useVideoData'
import {useVote} from './useVote'
import './video.css'

const Video = () => {
  const {userSub} = useUserSub()
  useAuthCheck()

  const {
    fetchedLikeCount,
    fetchedDislikeCount,
    activeBtn,
    videoId,
    title,
    url,
    loading,
    refetch,
  } = useVideoData(userSub)

  const {animationState, handleAnimation} = useAnimation()

  const {
    vote,
    likeCount,
    dislikeCount,
    activeBtn: btn,
  } = useVote(
    fetchedLikeCount,
    fetchedDislikeCount,
    activeBtn,
    videoId,
    userSub
  )

  const handleLikeClick = async () => {
    handleAnimation('likeAnimate')
    await vote('like')
  }

  const handleDislikeClick = async () => {
    handleAnimation('dislikeAnimate')
    await vote('dislike')
  }

  return (
    <div className="container">
      {loading ? (
        <div className="box dashed">
          <div className="loading-skeleton"></div>{' '}
          <div className="title-placeholder"></div>{' '}
        </div>
      ) : (
        <div className="box dashed">
          {url && (
            <div className="video-wrapper">
              <video controls key={url}>
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div className="title">
            <h2>{title}</h2>
          </div>
        </div>
      )}
      <div className="feedback dashed">
        <FeedbackButton
          title="Click to like this video"
          className={btn === 'like' ? 'like-active' : ''}
          icon={faThumbsUp}
          count={likeCount}
          ariaLabel={`Like video. Current count: ${likeCount}`}
          onClick={handleLikeClick}
          animationState={!animationState.likeAnimate}
        />
        <FeedbackButton
          title="Click to dislike this video"
          className={btn === 'dislike' ? 'dislike-active' : ''}
          icon={faThumbsDown}
          count={dislikeCount}
          ariaLabel={`Dislike video. Current count: ${dislikeCount}`}
          onClick={handleDislikeClick}
          animationState={!animationState.dislikeAnimate}
        />
        <FeedbackButton
          title="Click to load the next video"
          className="btn"
          icon={faArrowCircleRight}
          onClick={refetch}
          ariaLabel="Load the next video"
          animationState={false}
        />
      </div>
    </div>
  )
}

export {Video}
