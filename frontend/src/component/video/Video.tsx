import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faArrowCircleRight,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons'
import {useUserSub} from './useUserSub'
import {useVideoData} from './useVideoData'
import {useAnimation} from './useAnimation'
import {handleVote} from './voteUtils'
import './video.css'

const Video = () => {
  const {userSub} = useUserSub()

  const {
    likeCount,
    dislikeCount,
    activeBtn,
    videoId,
    title,
    url,
    loading,
    setLikeCount,
    setDislikeCount,
    setActiveBtn,
    refetch,
  } = useVideoData(userSub)

  const {animationState, handleAnimation} = useAnimation()

  const handleLikeClick = async () => {
    handleAnimation('likeAnimate')
    if (activeBtn === 'none') {
      setLikeCount((prev) => prev + 1)
      setActiveBtn('like')
      await handleVote(videoId!, 'like', userSub)
    } else if (activeBtn === 'like') {
      setLikeCount((prev) => prev - 1)
      setActiveBtn('none')
      await handleVote(videoId!, 'remove', userSub)
    } else if (activeBtn === 'dislike') {
      setLikeCount((prev) => prev + 1)
      setDislikeCount((prev) => prev - 1)
      setActiveBtn('like')
      await handleVote(videoId!, 'remove', userSub)
      await handleVote(videoId!, 'like', userSub)
    }
  }

  const handleDislikeClick = async () => {
    handleAnimation('dislikeAnimate')
    if (activeBtn === 'none') {
      setDislikeCount((prev) => prev + 1)
      setActiveBtn('dislike')
      await handleVote(videoId!, 'dislike', userSub)
    } else if (activeBtn === 'dislike') {
      setDislikeCount((prev) => prev - 1)
      setActiveBtn('none')
      await handleVote(videoId!, 'remove', userSub)
    } else if (activeBtn === 'like') {
      setDislikeCount((prev) => prev + 1)
      setLikeCount((prev) => prev - 1)
      setActiveBtn('dislike')
      await handleVote(videoId!, 'remove', userSub)
      await handleVote(videoId!, 'dislike', userSub)
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
          onClick={refetch} 
        >
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </button>
      </div>
    </div>
  )
}

export {Video}
