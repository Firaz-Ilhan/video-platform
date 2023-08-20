import {useState} from 'react'

function useAnimation() {
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

  return {animationState, handleAnimation}
}

export {useAnimation}
