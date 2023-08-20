import boto3
import json
from decimal import Decimal

LIKE = "like"
DISLIKE = "dislike"
REMOVE = "remove"
ALLOWED_ACTIONS = [LIKE, DISLIKE, REMOVE]

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("test")
votes_table = dynamodb.Table("VotesTable")


def lambda_handler(event, context):
    video_key = event.get("videoKey")
    action = event.get("action")
    user_id = event.get("userId")

    if action not in ALLOWED_ACTIONS:
        return build_response(400, "Invalid vote action")

    try:
        user_vote = votes_table.get_item(
            Key={"userId": user_id, "videoKey": video_key}
        ).get("Item")

        if not user_vote:
            update_vote_count(action, video_key)
            record_user_vote(user_id, video_key, action)
            message = "Vote registered successfully"
        else:
            prev_vote = user_vote["vote"]
            if action == REMOVE:
                update_vote_count(prev_vote, video_key, decrement=True)
                remove_user_vote(user_id, video_key)
                message = "Vote removed successfully"
            elif prev_vote != action:
                delta = 2 if prev_vote != action and action != REMOVE else 1
                update_vote_count(action, video_key, delta=delta)
                record_user_vote(user_id, video_key, action)
                message = "Vote updated successfully"
            else:
                message = "User has already voted with the same action for this video"

        return build_response(200, message)

    except Exception as e:
        return build_response(500, str(e))


def build_response(status_code, message):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        "body": json.dumps({"message": message}),
    }


def reverse_vote(vote):
    return DISLIKE if vote == LIKE else LIKE


def update_vote_count(action, video_key, decrement=False, delta=1):
    increment_field = (
        "likes" if action == LIKE else "dislikes" if action == DISLIKE else None
    )
    if not increment_field:
        raise ValueError("Invalid action")

    increment_value = (Decimal(-1) if decrement else Decimal(1)) * delta

    table.update_item(
        Key={"videoKey": video_key},
        UpdateExpression=f"ADD {increment_field} :increment",
        ExpressionAttributeValues={":increment": increment_value},
        ConditionExpression=f"attribute_exists({increment_field})",
    )


def record_user_vote(user_id, video_key, action):
    votes_table.put_item(
        Item={"userId": user_id, "videoKey": video_key, "vote": action}
    )


def remove_user_vote(user_id, video_key):
    votes_table.delete_item(Key={"userId": user_id, "videoKey": video_key})
