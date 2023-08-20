import uuid
import boto3
import os

def get_environment_variable(var_name):
    try:
        return os.getenv(var_name)
    except KeyError:
        print(f"Environment variable '{var_name}' not set.")
        return None


def get_mediaconvert_client(region_name):
    mediaconvert = boto3.client("mediaconvert", region_name=region_name)
    endpoints = mediaconvert.describe_endpoints()
    mediaconvert_endpoint = endpoints["Endpoints"][0]["Url"]
    return boto3.client("mediaconvert", endpoint_url=mediaconvert_endpoint)


def get_s3_details(event):
    record = event["Records"][0]["s3"]
    bucket = record["bucket"]["name"]
    key = record["object"]["key"]
    return bucket, key


def create_job(mediaconvert, role, job_template, queue, s3_output, bucket, key):
    file_input = f"s3://{bucket}/{key}"
    output_key = f"output/{key}"
    response = mediaconvert.create_job(
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
    return response

def get_next_video_id(table):
    response = table.update_item(
        Key={'videoKey': -1},
        UpdateExpression="ADD videoCount :increment",
        ExpressionAttributeValues={':increment': 1},
        ReturnValues="UPDATED_NEW"
    )
    return int(response['Attributes']['videoCount'])

def store_in_dynamodb(bucket: str, key: str, title: str):
    """Store video metadata and URL in DynamoDB"""
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('test')
    bucket_name = bucket.replace("s3://", "").rstrip("/")
    video_url = f"https://{bucket_name}.s3.eu-west-1.amazonaws.com/{key}"

    video_id = get_next_video_id(table)
    print(type(video_id))
    table.put_item(
        Item={
            'videoKey': video_id,
            'title': title,
            'url': video_url,
            'likes': 0,
            'dislikes': 0,
        }
    )

def get_s3_metadata(bucket: str, key: str) -> dict:
    """Retrieve metadata for an object from S3"""
    s3 = boto3.client('s3')
    response = s3.head_object(Bucket=bucket, Key=key)
    return response.get('Metadata', {})

def lambda_handler(event, context):
    try:
        region_name = get_environment_variable("REGION_NAME")
        mediaconvert_role = get_environment_variable("MEDIACONVERT_ROLE")
        job_template = get_environment_variable("JOB_TEMPLATE")
        mediaconvert_queue = get_environment_variable("MEDIACONVERT_QUEUE")
        s3_output = get_environment_variable("S3_OUTPUT")

        mediaconvert = get_mediaconvert_client(region_name)
        bucket, key = get_s3_details(event)

        response = create_job(
            mediaconvert,
            mediaconvert_role,
            job_template,
            mediaconvert_queue,
            s3_output,
            bucket,
            key,
        )

        metadata = get_s3_metadata(bucket, key)
        
        video_title = metadata.get('video-title', 'Unknown Title')
        
        output_bucket = s3_output.split('://')[-1]
        store_in_dynamodb(output_bucket, key, video_title)

        print(response)
    except Exception as e:
        print(f"Error occurred: {e}")
        raise e
