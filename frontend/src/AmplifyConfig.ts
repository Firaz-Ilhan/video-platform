import {Amplify} from 'aws-amplify'

Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_WEBCLIENT_ID,
    identityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID,
  },
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_AWS_S3_BUCKET,
      region: process.env.REACT_APP_AWS_REGION,
    },
    anotherBucket: {
      bucket: process.env.REACT_APP_AWS_VIDEO_S3_BUCKET,
      region: process.env.REACT_APP_AWS_REGION,
    }
  },
  API: {
    endpoints: [
      {
        name: 'fetchRandomVideo',
        endpoint: 'https://61cy373eyf.execute-api.eu-west-1.amazonaws.com/prod',
      },
    ],
  },
})
