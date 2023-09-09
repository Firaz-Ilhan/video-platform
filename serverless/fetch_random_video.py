import os
import boto3
import random

dynamodb = boto3.resource("dynamodb")
video_table = dynamodb.Table(os.getenv("dynamodb_video_table"))
votes_table = dynamodb.Table(os.getenv("dynamodb_votes_table"))


def lambda_handler(event, context):
    """
    AWS Lambda handler function to retrieve a random video and its corresponding vote for a given user.
    :param event: Dictionary containing input data. Must include "userId".
    :return: HTTP status and body with video information or error message.
    """
    try:
        total_videos = get_total_video_count(video_table)

        if total_videos == 0:
            return {"statusCode": 404, "body": "No videos in the table."}

        random_key = random.randint(1, total_videos)
        random_video = get_random_video(video_table, random_key)
        user_id = event.get("userId")

        if not user_id:
            return {"statusCode": 400, "body": "userId parameter is required"}

        user_vote = get_user_vote_for_video(votes_table, user_id, random_key)
        video_data = {"videoInfo": random_video, "userVote": user_vote}

        return {"statusCode": 200, "body": video_data}

    except Exception as e:
        print(f"Error: {e}")
        return {"statusCode": 500, "body": f"Error occurred: {e}"}


def get_total_video_count(table):
    response = table.get_item(Key={"videoKey": -1})
    return response["Item"]["videoCount"]


def get_random_video(table, random_key):
    response = table.get_item(Key={"videoKey": random_key})
    return response["Item"]


def get_user_vote_for_video(table, user_id, video_key):
    response = table.get_item(Key={"userId": user_id, "videoKey": video_key})
    if "Item" in response:
        return response["Item"]["vote"]
    return None
