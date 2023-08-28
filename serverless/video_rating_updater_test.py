import unittest
from unittest.mock import patch, Mock
from video_rating_updater import lambda_handler

class TestLambdaFunction(unittest.TestCase):
    def setUp(self):
        self.mock_event = {"videoKey": 1, "action": "like", "userId": "test_user_id"}
        self.mock_votes_table = Mock()
        self.mock_get_patcher = patch("video_rating_updater.DYNAMODB.get")
        self.mock_get = self.mock_get_patcher.start()
        self.mock_get.return_value.Table.return_value = self.mock_votes_table

    def tearDown(self):
        self.mock_event = {"videoKey": 1, "action": "like", "userId": "test_user_id"}
        self.mock_get_patcher.stop()

    def test_vote_actions(self):
        test_cases = [
            {"action": "invalid_action", "return": {}, "status": 400, "message": "Invalid vote action"},
            {"action": None, "return": {}, "status": 400, "message": "Required parameters missing"},
            {"action": "remove", "return": {"Item": {"vote": "like"}}, "status": 200, "message": "Vote removed successfully"},
            {"action": "dislike", "return": {"Item": {"vote": "like"}}, "status": 200, "message": "Vote updated successfully"},
            {"action": "like", "return": {"Item": {"vote": "like"}}, "status": 200, "message": "User has already voted with the same action for this video"},
            {"action": "like", "return": {}, "status": 200, "message": "Vote registered successfully"}
        ]

        for tc in test_cases:
            with self.subTest(tc=tc):
                if tc["action"] is not None:
                    self.mock_event["action"] = tc["action"]
                else:
                    del self.mock_event["action"]
                
                self.mock_votes_table.get_item.return_value = tc["return"]
                response = lambda_handler(self.mock_event, None)

                self.assertEqual(response["statusCode"], tc["status"])
                self.assertIn(tc["message"], response["body"])


if __name__ == "__main__":
    unittest.main()
