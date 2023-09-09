import os
import unittest
from unittest.mock import patch, MagicMock

os.environ["dynamodb_video_table"] = "videos"
os.environ["dynamodb_votes_table"] = "votes"

with patch("boto3.resource", return_value=MagicMock()):
    import fetch_random_video


class TestLambdaHandler(unittest.TestCase):
    def setUp(self):
        self.mock_video_table = MagicMock()
        self.mock_votes_table = MagicMock()

        self.patch_video_table = patch(
            "fetch_random_video.video_table", self.mock_video_table
        )
        self.patch_votes_table = patch(
            "fetch_random_video.votes_table", self.mock_votes_table
        )

        self.patch_video_table.start()
        self.patch_votes_table.start()

        self.addCleanup(self.patch_video_table.stop)
        self.addCleanup(self.patch_votes_table.stop)

    def test_lambda_handler_no_videos(self):
        self.mock_video_table.get_item.return_value = {"Item": {"videoCount": 0}}

        response = fetch_random_video.lambda_handler({}, None)

        self.assertEqual(response["statusCode"], 404)
        self.assertEqual(response["body"], "No videos in the table.")

    def test_lambda_handler_success(self):
        self.mock_video_table.get_item.side_effect = [
            {"Item": {"videoCount": 3}},
            {"Item": {"title": "random_video"}},
        ]
        self.mock_votes_table.get_item.return_value = {"Item": {"vote": "like"}}

        with patch("fetch_random_video.random.randint", return_value=2):
            response = fetch_random_video.lambda_handler({"userId": "testUser"}, None)

        self.assertEqual(response["statusCode"], 200)
        self.assertEqual(response["body"]["videoInfo"]["title"], "random_video")
        self.assertEqual(response["body"]["userVote"], "like")

    def test_lambda_handler_error(self):
        self.mock_video_table.get_item.side_effect = Exception("Mock exception")

        response = fetch_random_video.lambda_handler({}, None)

        self.assertEqual(response["statusCode"], 500)
        self.assertEqual(response["body"], "Error occurred: Mock exception")


if __name__ == "__main__":
    unittest.main()
