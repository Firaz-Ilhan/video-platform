import unittest
from unittest.mock import patch, Mock
import media_conversion_lambda


class TestLambdaHandler(unittest.TestCase):
    @patch("media_conversion_lambda.boto3.client")
    def test_get_mediaconvert_client(self, mock_client):
        mock_mediaconvert = Mock()
        mock_mediaconvert.describe_endpoints.return_value = {
            "Endpoints": [{"Url": "some_url"}]
        }
        mock_client.return_value = mock_mediaconvert

        media_conversion_lambda.get_mediaconvert_client("us-west-1")
        mock_mediaconvert.describe_endpoints.assert_called_once()
        mock_client.assert_called_with("mediaconvert", endpoint_url="some_url")

    def test_get_s3_details(self):
        event = {
            "Records": [
                {"s3": {"bucket": {"name": "mybucket"}, "object": {"key": "mykey"}}}
            ]
        }
        bucket, key = media_conversion_lambda.get_s3_details(event)
        self.assertEqual(bucket, "mybucket")
        self.assertEqual(key, "mykey")

    @patch("media_conversion_lambda.get_environment_variable")
    @patch("media_conversion_lambda.get_mediaconvert_client")
    @patch("media_conversion_lambda.get_s3_details")
    @patch("media_conversion_lambda.create_job")
    @patch("media_conversion_lambda.get_s3_metadata")
    @patch("media_conversion_lambda.store_in_dynamodb")
    def test_lambda_handler(
        self, mock_store, mock_metadata, mock_job, mock_details, mock_client, mock_env
    ):
        mock_env.return_value = "return_value"
        mock_details.return_value = ("bucket", "key")
        mock_metadata.return_value = {"video-title": "Test Title"}

        event = {
            "Records": [
                {"s3": {"bucket": {"name": "bucket"}, "object": {"key": "key"}}}
            ]
        }
        context = {}
        media_conversion_lambda.lambda_handler(event, context)

        mock_env.assert_called()
        mock_client.assert_called()
        mock_details.assert_called()
        mock_job.assert_called()
        mock_metadata.assert_called()
        mock_store.assert_called_with("return_value", "key", "Test Title")


if __name__ == "__main__":
    unittest.main()
