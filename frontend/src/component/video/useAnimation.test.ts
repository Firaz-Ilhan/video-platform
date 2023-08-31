import {act, renderHook} from '@testing-library/react'
import {useAnimation} from './useAnimation'

describe('useAnimation', () => {
  jest.useFakeTimers()

  it('should initialize with both animations set to true', () => {
    const {result} = renderHook(() => useAnimation())

    expect(result.current.animationState.likeAnimate).toBe(true)
    expect(result.current.animationState.dislikeAnimate).toBe(true)
  })

  it('should set likeAnimate to false when handleAnimation is called with "likeAnimate"', () => {
    const {result} = renderHook(() => useAnimation())

    act(() => {
      result.current.handleAnimation('likeAnimate')
    })

    expect(result.current.animationState.likeAnimate).toBe(false)
    expect(result.current.animationState.dislikeAnimate).toBe(true)
  })

  it('should reset likeAnimate to true after 1 second when handleAnimation is called with "likeAnimate"', () => {
    const {result} = renderHook(() => useAnimation())

    act(() => {
      result.current.handleAnimation('likeAnimate')
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.animationState.likeAnimate).toBe(true)
  })

  it('should set dislikeAnimate to false when handleAnimation is called with "dislikeAnimate"', () => {
    const {result} = renderHook(() => useAnimation())

    act(() => {
      result.current.handleAnimation('dislikeAnimate')
    })

    expect(result.current.animationState.dislikeAnimate).toBe(false)
    expect(result.current.animationState.likeAnimate).toBe(true)
  })

  it('should reset dislikeAnimate to true after 1 second when handleAnimation is called with "dislikeAnimate"', () => {
    const {result} = renderHook(() => useAnimation())

    act(() => {
      result.current.handleAnimation('dislikeAnimate')
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.animationState.dislikeAnimate).toBe(true)
  })

  it('should clear the timeout for likeAnimate if handleAnimation is called twice in succession', () => {
    const {result} = renderHook(() => useAnimation())

    act(() => {
      result.current.handleAnimation('likeAnimate')
      jest.advanceTimersByTime(500)
      result.current.handleAnimation('likeAnimate')
      jest.advanceTimersByTime(500)
    })

    expect(result.current.animationState.likeAnimate).toBe(false)

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current.animationState.likeAnimate).toBe(true)
  })
})
