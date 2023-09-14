import boto3
import os

region_name = os.getenv("REGION_NAME")
mediaconvert_role = os.getenv("MEDIACONVERT_ROLE")
job_template = os.getenv("JOB_TEMPLATE")
mediaconvert_queue = os.getenv("MEDIACONVERT_QUEUE")
s3_output = os.getenv("S3_OUTPUT")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.getenv("DYNAMO_DB_TABLE"))


def get_mediaconvert_client(region_name):
    """
    Initializes and returns a MediaConvert client using a specific endpoint.
    AWS MediaConvert requires the use of a service-specific endpoint, 
    which varies by account and region. 
    This function retrieves that endpoint and uses it to create the client.
    """
    mediaconvert = boto3.client("mediaconvert", region_name=region_name)
    endpoints = mediaconvert.describe_endpoints()
    mediaconvert_endpoint = endpoints["Endpoints"][0]["Url"]
    return boto3.client("mediaconvert", endpoint_url=mediaconvert_endpoint)


def get_s3_details(event):
    """
    Parses the event triggered by an S3 action and returns the bucket name and file key.
    """
    record = event["Records"][0]["s3"]
    bucket = record["bucket"]["name"]
    key = record["object"]["key"]
    return bucket, key


def create_job(mediaconvert, role, job_template, queue, s3_output, bucket, key):
    """
    Constructs and dispatches a MediaConvert job.

    This job is responsible for converting media files using settings 
    provided via AWS MediaConvert templates and other parameters. 
    This function prepares the job settings and submits them for processing.
    """
    file_input = f"s3://{bucket}/{key}"
    output_key = f"output/{key}"
    return mediaconvert.create_job(
        Role=role,
        JobTemplate=job_template,
        Queue=queue,
        UserMetadata={"input": key, "output": output_key},
        Settings={
            "Inputs": [{"FileInput": file_input}],
            "OutputGroups": [
                {
                    "Name": "File Group",
                    "OutputGroupSettings": {
                        "Type": "FILE_GROUP_SETTINGS",
                        "FileGroupSettings": {"Destination": s3_output},
                    },
                    "Outputs": [],
                }
            ],
        },
    )


def get_next_video_id(table):
    """
    increments the video counter in DynamoDB and returns the next available ID.
    """
    response = table.update_item(
        Key={"videoKey": -1},
        UpdateExpression="ADD videoCount :increment",
        ExpressionAttributeValues={":increment": 1},
        ReturnValues="UPDATED_NEW",
    )
    return int(response["Attributes"]["videoCount"])


def store_in_dynamodb(bucket: str, key: str, title: str):
    """
    Inserts video metadata into the DynamoDB table.

    The function first fetches the next unique video ID and then
    creates a new record with the video's metadata.
    """
    video_id = get_next_video_id(table)
    table.put_item(
        Item={
            "videoKey": video_id,
            "title": title,
            "url": key,
            "likes": 0,
            "dislikes": 0,
        }
    )


def get_s3_metadata(bucket: str, key: str) -> dict:
    """
    Fetches and returns metadata associated with a specific S3 object.

    Metadata often contains additional information about a file,
    such as its title or the application used to create it.
    """
    s3 = boto3.client("s3")
    response = s3.head_object(Bucket=bucket, Key=key)
    return response.get("Metadata", {})


def lambda_handler(event, context):
    try:
        mediaconvert = get_mediaconvert_client(region_name)
        bucket, key = get_s3_details(event)

        create_job(
            mediaconvert,
            mediaconvert_role,
            job_template,
            mediaconvert_queue,
            s3_output,
            bucket,
            key,
        )

        metadata = get_s3_metadata(bucket, key)
        video_title = metadata.get("video-title", "Unknown Title")
        output_bucket = s3_output.split("://")[-1]
        store_in_dynamodb(output_bucket, key, video_title)

    except Exception as e:
        print(f"Error occurred: {e}")
        raise e
