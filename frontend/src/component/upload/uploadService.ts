import {S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'
import {XhrHttpHandler} from '@aws-sdk/xhr-http-handler'
import {Auth} from 'aws-amplify'

const xhrHandler = new XhrHttpHandler({})

let s3ClientInstance: S3Client | null = null

const AWS_REGION = process.env.REACT_APP_AWS_REGION
const AWS_S3_BUCKET = process.env.REACT_APP_AWS_S3_BUCKET

async function getS3Client() {
  if (!s3ClientInstance) {
    const currentCredentials = await Auth.currentCredentials()
    s3ClientInstance = new S3Client({
      region: AWS_REGION,
      credentials: Auth.essentialCredentials(currentCredentials),
      requestHandler: xhrHandler,
    })
  }
  return s3ClientInstance
}

export const uploadToS3 = async (
  file: File,
  videoTitle: string,
  onProgressUpdate: (progress: number) => void
) => {
  const s3Client = await getS3Client()

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: AWS_S3_BUCKET || '',
      Key: file.name,
      Body: file,
      ContentType: file.type,
      Metadata: {
        'video-title': videoTitle,
      },
    },
  })

  let lastUpdated = 0
  const minUpdateIntervalInMS = 200

  upload.on('httpUploadProgress', (progress) => {
    const currentTime = Date.now()
    if (
      progress.loaded &&
      progress.total &&
      currentTime - lastUpdated > minUpdateIntervalInMS
    ) {
      onProgressUpdate(Math.round((progress.loaded / progress.total) * 100))
      lastUpdated = currentTime
    }
  })

  return upload.done()
}
