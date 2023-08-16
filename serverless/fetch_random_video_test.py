import unittest
from unittest.mock import patch, MagicMock
import fetch_random_video

class TestLambdaHandler(unittest.TestCase):

    def setUp(self):
        self.mock_dynamodb = MagicMock()
        self.mock_table = MagicMock()
        patch('fetch_random_video.boto3.resource', return_value=self.mock_dynamodb).start()
        self.mock_dynamodb.Table.return_value = self.mock_table
        patch('fetch_random_video.os.getenv', return_value="mock_table_name").start()

    def test_lambda_handler_no_videos(self):
        self.mock_table.get_item.return_value = {'Item': {'videoCount': 0}}

        response = fetch_random_video.lambda_handler(None, None)
        
        self.assertEqual(response['statusCode'], 404)
        self.assertEqual(response['body'], 'No videos in the table.')

    def test_lambda_handler_success(self):
        self.mock_table.get_item.side_effect = [{'Item': {'videoCount': 3}}, {'Item': {'title': 'random_video'}}]

        with patch('fetch_random_video.random.randint', return_value=2):
            response = fetch_random_video.lambda_handler(None, None)

        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(response['body']['title'], 'random_video')

    def test_lambda_handler_error(self):
        self.mock_table.get_item.side_effect = Exception("Mock exception")

        response = fetch_random_video.lambda_handler(None, None)

        self.assertEqual(response['statusCode'], 500)
        self.assertEqual(response['body'], "Error occurred: Mock exception")


if __name__ == "__main__":
    unittest.main()
