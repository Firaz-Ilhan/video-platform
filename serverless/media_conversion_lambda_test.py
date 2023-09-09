import os
import unittest
from unittest.mock import patch, MagicMock

os.environ["REGION_NAME"] = "mock_region"
os.environ["MEDIACONVERT_ROLE"] = "mock_role"
os.environ["JOB_TEMPLATE"] = "mock_template"
os.environ["MEDIACONVERT_QUEUE"] = "mock_queue"
os.environ["S3_OUTPUT"] = "s3://mock-output-bucket"
os.environ["DYNAMO_DB_TABLE"] = "mock_table"

with patch("boto3.resource", return_value=MagicMock()):
    from media_conversion_lambda import (
        get_mediaconvert_client,
        get_s3_details,
        lambda_handler,
    )


class TestLambdaHandler(unittest.TestCase):
    def setUp(self):
        self.env_patcher = patch.dict(
            "os.environ",
            {
                "REGION_NAME": "mock-region",
                "MEDIACONVERT_ROLE": "mock-role",
                "JOB_TEMPLATE": "mock-template",
                "MEDIACONVERT_QUEUE": "mock-queue",
                "S3_OUTPUT": "mock-output",
                "DYNAMO_DB_TABLE": "mock-table",
            },
        )
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()

    @patch("media_conversion_lambda.boto3.client")
    def test_get_mediaconvert_client(self, mock_client):
        mock_mediaconvert = MagicMock()
        mock_mediaconvert.describe_endpoints.return_value = {
            "Endpoints": [{"Url": "mock-url"}]
        }
        mock_client.return_value = mock_mediaconvert

        client = get_mediaconvert_client("mock-region")
        mock_mediaconvert.describe_endpoints.assert_called_once()
        mock_client.assert_called_with("mediaconvert", endpoint_url="mock-url")

    def test_get_s3_details(self):
        mock_event = {
            "Records": [
                {
                    "s3": {
                        "bucket": {"name": "mock-bucket"},
                        "object": {"key": "mock-key"},
                    }
                }
            ]
        }
        bucket, key = get_s3_details(mock_event)
        self.assertEqual(bucket, "mock-bucket")
        self.assertEqual(key, "mock-key")

    @patch("media_conversion_lambda.boto3.client")
    @patch("media_conversion_lambda.get_mediaconvert_client")
    @patch("media_conversion_lambda.get_s3_details")
    @patch("media_conversion_lambda.create_job")
    @patch("media_conversion_lambda.get_s3_metadata")
    @patch("media_conversion_lambda.store_in_dynamodb")
    def test_lambda_handler(
        self,
        mock_store,
        mock_get_metadata,
        mock_create_job,
        mock_get_details,
        mock_get_client,
        mock_client,
    ):
        mock_event = {}
        mock_context = {}

        mock_get_details.return_value = ("mock-bucket", "mock-key")
        mock_get_metadata.return_value = {"video-title": "mock-title"}
        mock_create_job.return_value = {"Job": {"Id": "mock-id"}}

        lambda_handler(mock_event, mock_context)

        mock_get_client.assert_called_once()
        mock_get_details.assert_called_once_with(mock_event)
        mock_create_job.assert_called_once()
        mock_get_metadata.assert_called_once_with("mock-bucket", "mock-key")
        mock_store.assert_called_once_with(
            "mock-output-bucket", "mock-key", "mock-title"
        )


if __name__ == "__main__":
    unittest.main()
