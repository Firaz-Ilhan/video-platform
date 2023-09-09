import os
import unittest
from unittest import mock
from unittest.mock import MagicMock, patch, Mock

os.environ["dynamodb_video_table"] = "video"
os.environ["dynamodb_votes_table"] = "votes"

with patch("boto3.resource", return_value=MagicMock()):
    from video_rating_updater import lambda_handler


class TestLambdaFunction(unittest.TestCase):
    def setUp(self):
        self.mock_event = {
            "videoKey": "sampleVideoKey",
            "userId": "sampleUserId",
            "action": "like",
        }

        self.mock_votes_table = Mock()
        self.mock_video_table = Mock()

        self.vote_table_patch = patch(
            "video_rating_updater.votes_table", self.mock_votes_table
        )
        self.video_table_patch = patch(
            "video_rating_updater.video_table", self.mock_video_table
        )

        self.vote_table_patch.start()
        self.video_table_patch.start()

    def tearDown(self):
        self.vote_table_patch.stop()
        self.video_table_patch.stop()

    def test_invalid_vote_action(self):
        self.mock_event["action"] = "invalid_action"

        response = lambda_handler(self.mock_event, None)

        self.assertEqual(response["statusCode"], 400)
        self.assertIn("Invalid vote action", response["body"])

    def test_invalid_parameters(self):
        invalid_event = {
            "videoKey": "sampleVideoKey",
            # Missing userId and action
        }

        response = lambda_handler(invalid_event, None)

        self.assertEqual(response["statusCode"], 400)
        self.assertIn("Required parameters missing", response["body"])

    def test_vote_registration(self):
        self.mock_votes_table.get_item.return_value = {"Item": None}

        response = lambda_handler(self.mock_event, None)

        self.assertEqual(response["statusCode"], 200)
        self.assertIn("Vote registered successfully", response["body"])
        self.mock_votes_table.put_item.assert_called_once()
        self.mock_video_table.update_item.assert_called_once()

    def test_vote_update(self):
        self.mock_event["action"] = "dislike"
        self.mock_votes_table.get_item.return_value = {
            "Item": {
                "userId": "sampleUserId",
                "videoKey": "sampleVideoKey",
                "vote": "like",
            }
        }

        response = lambda_handler(self.mock_event, None)

        self.assertEqual(response["statusCode"], 200)
        self.assertIn("Vote updated successfully", response["body"])
        self.mock_video_table.update_item.assert_called()

    def test_vote_removal(self):
        self.mock_event["action"] = "remove"
        self.mock_votes_table.get_item.return_value = {
            "Item": {
                "userId": "sampleUserId",
                "videoKey": "sampleVideoKey",
                "vote": "like",
            }
        }

        response = lambda_handler(self.mock_event, None)

        self.assertEqual(response["statusCode"], 200)
        self.assertIn("Vote removed successfully", response["body"])
        self.mock_votes_table.delete_item.assert_called_once()

    def test_duplicate_vote(self):
        self.mock_votes_table.get_item.return_value = {
            "Item": {
                "userId": "sampleUserId",
                "videoKey": "sampleVideoKey",
                "vote": "like",
            }
        }

        response = lambda_handler(self.mock_event, None)

        self.assertEqual(response["statusCode"], 200)
        self.assertIn(
            "User has already voted with the same action for this video",
            response["body"],
        )


if __name__ == "__main__":
    unittest.main()
