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
        <div className=" box">
          <div className="title-placeholder"></div>{' '}
          <div className="loading-skeleton"></div>{' '}
          
        </div>
      ) : (
        <div className="box">
          <div className="title">
            <h2>{title}</h2>
          </div>
          {url && (
            <div className="video-wrapper">
              <video controls key={url}>
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      )}
      <div className="feedback">
        <button
          title="Click to like this video"
          className={`btn ${activeBtn === 'like' ? 'like-active' : ''}`}
          onClick={handleLikeClick}
          aria-label={`Like video. Current count: ${likeCount}`}>
          <FontAwesomeIcon
            icon={faThumbsUp}
            bounce={!animationState.likeAnimate}
          />
          {likeCount}
        </button>
        <button
          title="Click to dislike this video"
          className={`btn ${activeBtn === 'dislike' ? 'dislike-active' : ''}`}
          onClick={handleDislikeClick}
          aria-label={`Dislike video. Current count: ${dislikeCount}`}>
          <FontAwesomeIcon
            icon={faThumbsDown}
            bounce={!animationState.dislikeAnimate}
          />
          {dislikeCount}
        </button>
        <button
          title="Click to load the next video"
          className="btn"
          aria-label="Load the next video"
          onClick={refetch}>
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </button>
      </div>
    </div>
  )
}

export {Video}
