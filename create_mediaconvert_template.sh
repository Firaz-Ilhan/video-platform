#!/bin/bash

# enter the S3 bucket name like "s3://my-bucket-name/"
s3_bucket="${S3_BUCKET}"

payload='
{
  "Name": "my_template",
  "Settings": {
    "TimecodeConfig": {
      "Source": "ZEROBASED"
    },
    "OutputGroups": [
      {
        "Name": "File Group",
        "Outputs": [
          {
            "ContainerSettings": {
              "Container": "MP4",
              "Mp4Settings": {}
            },
            "VideoDescription": {
              "CodecSettings": {
                "Codec": "H_264",
                "H264Settings": {
                  "ParNumerator": 16,
                  "MaxBitrate": 250000,
                  "ParDenominator": 9,
                  "RateControlMode": "QVBR",
                  "SceneChangeDetect": "TRANSITION_DETECTION",
                  "ParControl": "SPECIFIED"
                }
              }
            },
            "AudioDescriptions": [
              {
                "AudioSourceName": "Audio Selector 1",
                "CodecSettings": {
                  "Codec": "AAC",
                  "AacSettings": {
                    "Bitrate": 96000,
                    "CodingMode": "CODING_MODE_2_0",
                    "SampleRate": 48000
                  }
                }
              }
            ]
          }
        ],
        "OutputGroupSettings": {
          "Type": "FILE_GROUP_SETTINGS",
          "FileGroupSettings": {
            "Destination": "s3_bucket_placeholder"
          }
        }
      }
    ],
    "Inputs": [
      {
        "AudioSelectors": {
          "Audio Selector 1": {
            "DefaultSelection": "DEFAULT"
          }
        },
        "VideoSelector": {},
        "TimecodeSource": "ZEROBASED"
      }
    ]
  },
  "AccelerationSettings": {
    "Mode": "DISABLED"
  },
  "StatusUpdateInterval": "SECONDS_60",
  "Priority": 0,
  "HopDestinations": []
}'

# replace the placeholder with the S3 bucket name
payload=$(echo "${payload}" | sed "s|s3_bucket_placeholder|${S3_BUCKET}|g")

# create the template file
echo "${payload}" >template.json

# get the endpoint for the MediaConvert service of the specific region
endpoint_url=$(aws mediaconvert describe-endpoints --query 'Endpoints[0].Url' --output text)

# create the template
aws mediaconvert create-job-template --endpoint-url ${endpoint_url} --cli-input-json file://template.json

# delete the template file
rm template.json
