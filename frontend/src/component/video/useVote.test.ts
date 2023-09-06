import {renderHook, act} from '@testing-library/react'
import {useVote} from './useVote'
import {handleVote} from './voteUtils'

jest.mock('./voteUtils')

describe('useVote', () => {
  beforeEach(() => {
    ;(handleVote as jest.Mock).mockClear()
  })

  it('initializes with given counts and active button state', () => {
    const {result} = renderHook(() => useVote(5, 3, 'none', 123, 'user123'))

    expect(result.current.likeCount).toBe(5)
    expect(result.current.dislikeCount).toBe(3)
    expect(result.current.activeBtn).toBe('none')
  })

  it('increases like count and sets activeBtn when "like" action is dispatched from a "none" state', async () => {
    const {result} = renderHook(() => useVote(5, 3, 'none', 123, 'user123'))

    await act(async () => {
      await result.current.vote('like')
    })

    expect(result.current.likeCount).toBe(6)
    expect(result.current.activeBtn).toBe('like')
    expect(handleVote).toHaveBeenCalledWith(123, 'like', 'user123')
  })

  it('increases dislike count and sets activeBtn when "dislike" action is dispatched from a "none" state', async () => {
    const {result} = renderHook(() => useVote(5, 3, 'none', 123, 'user123'))

    await act(async () => {
      await result.current.vote('dislike')
    })

    expect(result.current.dislikeCount).toBe(4)
    expect(result.current.activeBtn).toBe('dislike')
    expect(handleVote).toHaveBeenCalledWith(123, 'dislike', 'user123')
  })

  it('should reset when initial values change', () => {
    const {result, rerender} = renderHook(
      (props: {
        initialLikeCount: number
        initialDislikeCount: number
        initialActiveBtn: 'none' | 'like' | 'dislike'
      }) =>
        useVote(
          props.initialLikeCount,
          props.initialDislikeCount,
          props.initialActiveBtn,
          123,
          'user123'
        ),
      {
        initialProps: {
          initialLikeCount: 5,
          initialDislikeCount: 3,
          initialActiveBtn: 'none',
        },
      }
    )

    rerender({
      initialLikeCount: 7,
      initialDislikeCount: 5,
      initialActiveBtn: 'like',
    })

    expect(result.current.likeCount).toBe(7)
    expect(result.current.dislikeCount).toBe(5)
    expect(result.current.activeBtn).toBe('like')
  })

  it('decreases like count and sets activeBtn to "none" when "like" action is dispatched from a "like" state', async () => {
    const {result} = renderHook(() => useVote(5, 3, 'like', 123, 'user123'))

    await act(async () => {
      await result.current.vote('like')
    })

    expect(result.current.likeCount).toBe(4)
    expect(result.current.activeBtn).toBe('none')
    expect(handleVote).toHaveBeenCalledWith(123, 'remove', 'user123')
  })

  it('transitions from "like" to "dislike" when "dislike" action is dispatched from a "like" state', async () => {
    const {result} = renderHook(() => useVote(5, 3, 'like', 123, 'user123'))

    await act(async () => {
      await result.current.vote('dislike')
    })

    expect(result.current.likeCount).toBe(4)
    expect(result.current.dislikeCount).toBe(4)
    expect(result.current.activeBtn).toBe('dislike')
    expect(handleVote).toHaveBeenCalledWith(123, 'remove', 'user123')
    expect(handleVote).toHaveBeenCalledWith(123, 'dislike', 'user123')
  })

  it('decreases dislike count and sets activeBtn to "none" when "dislike" action is dispatched from a "dislike" state', async () => {
    const {result} = renderHook(() => useVote(5, 3, 'dislike', 123, 'user123'))

    await act(async () => {
      await result.current.vote('dislike')
    })

    expect(result.current.dislikeCount).toBe(2)
    expect(result.current.activeBtn).toBe('none')
    expect(handleVote).toHaveBeenCalledWith(123, 'remove', 'user123')
  })

  it('transitions from "dislike" to "like" when "like" action is dispatched from a "dislike" state', async () => {
    const {result} = renderHook(() => useVote(5, 3, 'dislike', 123, 'user123'))

    await act(async () => {
      await result.current.vote('like')
    })

    expect(result.current.dislikeCount).toBe(2)
    expect(result.current.likeCount).toBe(6)
    expect(result.current.activeBtn).toBe('like')
    expect(handleVote).toHaveBeenCalledWith(123, 'remove', 'user123')
    expect(handleVote).toHaveBeenCalledWith(123, 'like', 'user123')
  })
})
