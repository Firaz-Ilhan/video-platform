import { render, screen } from '@testing-library/react'
import { API, Storage } from 'aws-amplify'
import { useNavigate } from 'react-router-dom'
import { useAuthCheck } from '../../hooks/useAuthCheck'
import { Video } from './Video'
import { useAnimation } from './useAnimation'
import { useUserSub } from './useUserSub'
import { useVideoData } from './useVideoData'
import { useVote } from './useVote'

jest.mock('./useUserSub', () => ({useUserSub: jest.fn()}))
jest.mock('../../hooks/useAuthCheck', () => ({useAuthCheck: jest.fn()}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))
jest.mock('./useVideoData', () => ({useVideoData: jest.fn()}))
jest.mock('aws-amplify', () => ({
  API: {get: jest.fn()},
  Storage: {get: jest.fn()},
}))
jest.mock('./useVote', () => ({useVote: jest.fn()}))
jest.mock('./useAnimation', () => ({useAnimation: jest.fn()}))

const apiGetMock = API.get as jest.Mock
const storageGetMock = Storage.get as jest.Mock
const useVideoDataMock = useVideoData as jest.Mock
const useUserSubMock = useUserSub as jest.Mock
const useAuthCheckMock = useAuthCheck as jest.Mock
const useNavigateMock = useNavigate as jest.Mock
const useAnimationMock = useAnimation as jest.Mock
const useVoteMock = useVote as jest.Mock

describe('<Video />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  // Common mocks for all tests
  beforeEach(() => {
    useAnimationMock.mockReturnValue({
      animationState: {
        likeAnimate: false,
        dislikeAnimate: false,
      },
      handleAnimation: jest.fn(),
    })

    useVoteMock.mockReturnValue({
      vote: jest.fn(),
      likeCount: 0,
      dislikeCount: 0,
      activeBtn: 'none',
    })

    useUserSubMock.mockReturnValue({
      userSub: null,
      error: null,
      isLoading: false,
    })

    useVideoDataMock.mockReturnValue({
      fetchedLikeCount: 0,
      fetchedDislikeCount: 0,
      activeBtn: 'none',
      videoId: undefined,
      title: '',
      url: '',
      loading: false,
      error: null,
      refetch: jest.fn(),
    })
  })

  it('redirects to login when authentication check fails', () => {
    const mockNavigateFn = jest.fn()
    useNavigateMock.mockReturnValue(mockNavigateFn)
    useAuthCheckMock.mockImplementation(() => mockNavigateFn('/login'))
    useUserSubMock.mockReturnValue({
      ...useUserSubMock(),
      error: 'Failed to fetch user info.',
    })
    render(<Video />)
    expect(mockNavigateFn).toHaveBeenCalledWith('/login')
  })

  it('displays video details correctly', () => {
    useUserSubMock.mockReturnValue({...useUserSubMock(), userSub: '12345'})
    useVoteMock.mockReturnValue({
      ...useVoteMock(),
      likeCount: 10,
      dislikeCount: 2,
      activeBtn: 'like',
    })

    apiGetMock.mockResolvedValueOnce({
      body: {
        videoInfo: {
          title: 'Sample Video',
          url: 'sampleURL',
          videoKey: 1,
          likes: 10,
          dislikes: 2,
        },
        userVote: 'like',
      },
    })
    storageGetMock.mockResolvedValueOnce('finalURL')
    useVideoDataMock.mockReturnValue({
      ...useVideoDataMock(),
      fetchedLikeCount: 10,
      fetchedDislikeCount: 2,
      activeBtn: 'like',
      videoId: 1,
      title: 'Sample Video',
      url: 'finalURL',
    })

    render(<Video />)
    expect(screen.getByText('Sample Video')).toBeInTheDocument()
  })
})
