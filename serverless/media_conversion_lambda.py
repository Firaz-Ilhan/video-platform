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

        print(response)
    except Exception as e:
        print(f"Error occurred: {e}")
        raise e
