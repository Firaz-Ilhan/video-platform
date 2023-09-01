import {renderHook, waitFor} from '@testing-library/react'
import {API, Storage} from 'aws-amplify'
import {useVideoData} from './useVideoData'

jest.mock('aws-amplify')

describe('useVideoData', () => {
  beforeEach(() => {
    ;(API.get as jest.Mock).mockReset()
    ;(Storage.get as jest.Mock).mockReset()
  })

  it('fetches video data and updates states when userSub is provided', async () => {
    const mockVideoInfo = {
      title: 'Sample Video',
      url: 'sample/url',
      videoKey: 1,
      likes: 100,
      dislikes: 50,
    }

    ;(API.get as jest.Mock).mockResolvedValueOnce({
      body: {
        videoInfo: mockVideoInfo,
        userVote: 'like',
      },
    })
    ;(Storage.get as jest.Mock).mockResolvedValueOnce('full-video-url')

    const {result} = renderHook(() => useVideoData('user123'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.fetchedLikeCount).toBe(100)
    })
    await waitFor(() => {
      expect(result.current.fetchedDislikeCount).toBe(50)
    })
    await waitFor(() => {
      expect(result.current.activeBtn).toBe('like')
    })
    await waitFor(() => {
      expect(result.current.title).toBe('Sample Video')
    })
    await waitFor(() => {
      expect(result.current.url).toBe('full-video-url')
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('does not fetch data if userSub is null', () => {
    renderHook(() => useVideoData(null))
    expect(API.get).not.toHaveBeenCalled()
  })
})
