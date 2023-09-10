import {useState} from 'react'

function useAnimation() {
  const [animationState, setAnimationState] = useState({
    likeAnimate: true,
    dislikeAnimate: true,
  })

  const timeouts: Record<string, NodeJS.Timeout> = {}

  const handleAnimation = (key: string) => {
    setAnimationState((prevState) => ({
      ...prevState,
      [key]: false,
    }))

    if (timeouts[key]) {
      clearTimeout(timeouts[key])
    }

    timeouts[key] = setTimeout(() => {
      setAnimationState((prevState) => ({
        ...prevState,
        [key]: true,
      }))
    }, 1000)
  }

  return {animationState, handleAnimation}
}

export {useAnimation}
