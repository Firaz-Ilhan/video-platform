import { uploadToS3 } from './uploadService';
import { Auth } from 'aws-amplify';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

jest.mock('aws-amplify');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/lib-storage');

const MockedAuth = Auth as jest.Mocked<typeof Auth>;
const MockedS3Client = S3Client as jest.MockedClass<typeof S3Client>;
const MockedUpload = Upload as jest.MockedClass<typeof Upload>;

describe('uploadToS3', () => {
  jest.resetAllMocks();

  it('should upload a file to S3', async () => {
    MockedAuth.currentCredentials.mockResolvedValue({} as any);
    MockedUpload.prototype.done = jest.fn().mockResolvedValue({});

    const mockFile = new File(["content"], "sample.mp4", {
      type: "video/mp4",
    });
    const videoTitle = "Sample Video";
    const progressUpdateFn = jest.fn();

    await uploadToS3(mockFile, videoTitle, progressUpdateFn);

    expect(MockedAuth.currentCredentials).toHaveBeenCalled();
    expect(MockedS3Client).toHaveBeenCalled();
    expect(MockedUpload).toHaveBeenCalled();
  });
});
