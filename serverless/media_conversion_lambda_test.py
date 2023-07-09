import unittest
from unittest.mock import patch, Mock
from botocore.exceptions import BotoCoreError
from media_conversion_lambda import lambda_handler


class TestLambdaHandler(unittest.TestCase):
    @patch("os.getenv")
    @patch("media_conversion_lambda.get_mediaconvert_client")
    @patch("media_conversion_lambda.get_s3_details")
    def test_lambda_handler_success(
        self,
        mock_get_s3_details,
        mock_get_mediaconvert_client,
        mock_get_env,
    ):
        event = {
            "Records": [
                {
                    "s3": {
                        "bucket": {"name": "test-bucket"},
                        "object": {"key": "test-key"},
                    }
                }
            ]
        }
        context = {}

        mock_get_env.side_effect = [
            "region",
            "role",
            "template",
            "queue",
            "s3_output",
        ]
        mock_mediaconvert = Mock()
        mock_mediaconvert.create_job.return_value = {"Job": {"Id": "12345"}}
        mock_get_mediaconvert_client.return_value = mock_mediaconvert
        mock_get_s3_details.return_value = ("test-bucket", "test-key")

        lambda_handler(event, context)

        mock_get_env.assert_any_call("REGION_NAME")
        mock_get_env.assert_any_call("MEDIACONVERT_ROLE")
        mock_get_env.assert_any_call("JOB_TEMPLATE")
        mock_get_env.assert_any_call("MEDIACONVERT_QUEUE")
        mock_get_env.assert_any_call("S3_OUTPUT")

        mock_get_mediaconvert_client.assert_called_once_with("region")
        mock_get_s3_details.assert_called_once_with(event)
        mock_mediaconvert.create_job.assert_called_once()

    @patch("os.getenv")
    def test_lambda_handler_exception(self, mock_get_env):
        event = {
            "Records": [
                {
                    "s3": {
                        "bucket": {"name": "test-bucket"},
                        "object": {"key": "test-key"},
                    }
                }
            ]
        }

        context = {}
        mock_get_env.side_effect = BotoCoreError

        with self.assertRaises(BotoCoreError):
            lambda_handler(event, context)

        mock_get_env.assert_any_call("REGION_NAME")


if __name__ == "__main__":
    unittest.main()
