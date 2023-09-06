import os
import json
import boto3
from decimal import Decimal

LIKE = "like"
DISLIKE = "dislike"
REMOVE = "remove"
ALLOWED_ACTIONS = [LIKE, DISLIKE, REMOVE]

class LazyResource:
    def __init__(self):
        self._resource = None

    def get(self):
        if not self._resource:
            self._resource = boto3.resource("dynamodb")
        return self._resource


DYNAMODB = LazyResource()


def get_votes_table():
    return DYNAMODB.get().Table(os.getenv("dynamodb_votes_table_name"))


def get_video_table():
    return DYNAMODB.get().Table(os.getenv("dynamodb_video_table_name"))


def process_vote(event, votes_table, video_table):
    video_key = event.get("videoKey")
    action = event.get("action")
    user_id = event.get("userId")

    if not video_key or not action or not user_id:
        return 400, "Required parameters missing"

    if action not in ALLOWED_ACTIONS:
        return 400, "Invalid vote action"

    user_vote = votes_table.get_item(
        Key={"userId": user_id, "videoKey": video_key}
    ).get("Item")

    if not user_vote:
        update_vote_count(action, video_key, video_table)
        record_user_vote(user_id, video_key, action, votes_table)
        return 200, "Vote registered successfully"
    elif user_vote["vote"] == action:
        return 200, "User has already voted with the same action for this video"
    elif action == REMOVE:
        update_vote_count(user_vote["vote"], video_key, video_table, decrement=True)
        remove_user_vote(user_id, video_key, votes_table)
        return 200, "Vote removed successfully"
    else:
        try:
            update_vote_count(user_vote["vote"], video_key, video_table, decrement=True)
            update_vote_count(action, video_key, video_table)
            record_user_vote(user_id, video_key, action, votes_table)
            return 200, "Vote updated successfully"
        except Exception as e:
            print.error(f"Error updating vote: {str(e)}")
            return 500, "Error updating vote"


def lambda_handler(event, context):
    return main(event, get_votes_table(), get_video_table())


def main(event, votes_table, video_table):
    try:
        status_code, message = process_vote(event, votes_table, video_table)
        return build_response(status_code, message)
    except Exception as e:
        print.error(f"Unhandled exception: {str(e)}")
        return build_response(500, str(e))


def build_response(status_code, message):
    return {
        "statusCode": status_code,
        "body": json.dumps({"message": message}),
    }


def update_vote_count(action, video_key, video_table, decrement=False):
    increment_field = (
        "likes" if action == LIKE else "dislikes" if action == DISLIKE else None
    )
    if not increment_field:
        raise ValueError("Invalid action")

    increment_value = Decimal(-1) if decrement else Decimal(1)

    video_table.update_item(
        Key={"videoKey": video_key},
        UpdateExpression=f"ADD {increment_field} :increment",
        ExpressionAttributeValues={":increment": increment_value},
        ConditionExpression=f"attribute_exists({increment_field})",
    )


def record_user_vote(user_id, video_key, action, votes_table):
    votes_table.put_item(
        Item={"userId": user_id, "videoKey": video_key, "vote": action}
    )


def remove_user_vote(user_id, video_key, votes_table):
    votes_table.delete_item(Key={"userId": user_id, "videoKey": video_key})
