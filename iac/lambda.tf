data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../serverless/media_conversion_lambda.py"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "media_conversion_lambda" {
  function_name    = "media_conversion_lambda"
  handler          = "media_conversion_lambda.lambda_handler"
  role             = aws_iam_role.lambda_exec.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.lambda_zip.output_path)
  runtime          = "python3.11"

  environment {
    variables = {
      JOB_TEMPLATE       = "mediaconvert-template"
      MEDIACONVERT_QUEUE = aws_media_convert_queue.mediaconvert_queue.arn
      MEDIACONVERT_ROLE  = aws_iam_role.mediaconvert_role.arn
      REGION_NAME        = var.aws_region
      S3_OUTPUT          = var.second_bucket_name
    }
  }

  // aws mediaconvert isn't supported by terraform yet
  // needs aws cli installed and configured
  provisioner "local-exec" {
    // Alternatively, the script can be run in the aws cloud shell
    command = "bash ${path.module}/create_mediaconvert_template.sh"
    environment = {
      S3_BUCKET = "s3://${aws_s3_bucket.second_bucket.bucket}/"
    }
  }
}

data "archive_file" "fetch_random_video_zip" {
  type        = "zip"
  source_file = "${path.module}/../serverless/fetch_random_video.py"
  output_path = "${path.module}/fetch_random_video.zip"
}

resource "aws_lambda_function" "fetch_random_video_lambda" {
  function_name    = "fetch_random_video_lambda"
  handler          = "fetch_random_video.lambda_handler"
  role             = aws_iam_role.lambda_exec.arn
  filename         = data.archive_file.fetch_random_video_zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.fetch_random_video_zip.output_path)
  runtime          = "python3.11"

  environment {
    variables = {
      dynamodb_table_name = aws_dynamodb_table.video_metadata.name
    }
  }
}


data "archive_file" "video_rating_updater_zip" {
  type        = "zip"
  source_file = "${path.module}/../serverless/video_rating_updater.py"
  output_path = "${path.module}/video_rating_updater.zip"
}

resource "aws_lambda_function" "video_rating_updater_lambda" {
  function_name    = "video_rating_updater_lambda"
  handler          = "video_rating_updater.lambda_handler"
  role             = aws_iam_role.lambda_exec.arn
  filename         = data.archive_file.video_rating_updater_zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.video_rating_updater_zip.output_path)
  runtime          = "python3.11"

  environment {
    variables = {
      dynamodb_votes_table_name = aws_dynamodb_table.votes_table.name,
      dynamodb_video_table_name = aws_dynamodb_table.video_metadata.name
    }
  }
}
