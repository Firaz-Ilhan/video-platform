import os
import json
import boto3
from decimal import Decimal
from aws_lambda_powertools.utilities.validation.exceptions import SchemaValidationError
from aws_lambda_powertools.utilities.validation import validate

dynamodb = boto3.resource("dynamodb")

video_table = dynamodb.Table(os.getenv("dynamodb_video_table"))
votes_table = dynamodb.Table(os.getenv("dynamodb_votes_table"))

LIKE = "like"
DISLIKE = "dislike"
REMOVE = "remove"
ALLOWED_ACTIONS = [LIKE, DISLIKE, REMOVE]

schema = {
    "type": "object",
    "properties": {
        "videoKey": {"type": "integer", "minimum": 1},
        "action": {"type": "string", "enum": ALLOWED_ACTIONS},
        "userId": {"type": "string", "minLength": 1, "maxLength": 255},
    },
    "required": ["videoKey", "action", "userId"],
}

def process_vote(event, votes_table, video_table):
    video_key = event.get("videoKey")
    action = event.get("action")
    user_id = event.get("userId")

    try:
        validate(event=event, schema=schema)
    except SchemaValidationError as e:
        return 400, str(e)

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
            print(f"Error updating vote: {str(e)}")
            return 500, "Error updating vote"


def lambda_handler(event, context):
    return main(event, votes_table, video_table)


def main(event, votes_table, video_table):
    try:
        status_code, message = process_vote(event, votes_table, video_table)
        return build_response(status_code, message)
    except Exception as e:
        print(f"Unhandled exception: {str(e)}")
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
