import { API } from 'aws-amplify';
import { handleVote } from './voteUtils'; 

jest.mock('aws-amplify');
const mockPost = API.post as jest.MockedFunction<typeof API.post>;

describe('handleVote', () => {
  beforeEach(() => {
    mockPost.mockClear();
  });

  it('calls API.post with correct arguments', async () => {
    const videoId = 123;
    const action = 'like';
    const userSub = 'user123';

    await handleVote(videoId, action, userSub);

    expect(API.post).toHaveBeenCalledTimes(1);
    expect(API.post).toHaveBeenCalledWith('video', '/', {
      body: {
        videoKey: videoId,
        action,
        userId: userSub,
      },
    });
  });

  it('throws an error when userSub is not provided', async () => {
    const videoId = 123;
    const action = 'like';

    await expect(handleVote(videoId, action, null)).rejects.toThrow('User sub not available');
  });
});
