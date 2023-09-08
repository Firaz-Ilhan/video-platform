data "archive_file" "media_conversion_lambda_package" {
  type        = "zip"
  source_file = "${path.module}/../serverless/media_conversion_lambda.py"
  output_path = "${path.module}/media_conversion_lambda.zip"
}

resource "aws_lambda_function" "media_conversion_lambda_function" {
  function_name    = "media_conversion_lambda"
  handler          = "media_conversion_lambda.lambda_handler"
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = data.archive_file.media_conversion_lambda_package.output_path
  source_code_hash = filebase64sha256(data.archive_file.media_conversion_lambda_package.output_path)
  runtime          = "python3.10"

  environment {
    variables = {
      JOB_TEMPLATE       = "mediaconvert-template"
      MEDIACONVERT_QUEUE = aws_media_convert_queue.mediaconvert_queue.arn
      MEDIACONVERT_ROLE  = aws_iam_role.mediaconvert_execution_role.arn
      REGION_NAME        = var.aws_region
      S3_OUTPUT          = var.video_bucket_name
    }
  }

  provisioner "local-exec" {
    command = "bash ${path.module}/create_mediaconvert_template.sh"
    environment = {
      S3_BUCKET = "s3://${aws_s3_bucket.video_bucket.bucket}/"
    }
  }
}

# Lambda for Fetching Random Video
data "archive_file" "fetch_random_video_lambda_package" {
  type        = "zip"
  source_file = "${path.module}/../serverless/fetch_random_video.py"
  output_path = "${path.module}/fetch_random_video.zip"
}

resource "aws_lambda_function" "fetch_random_video_lambda_function" {
  function_name    = "fetch_random_video_lambda"
  handler          = "fetch_random_video.lambda_handler"
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = data.archive_file.fetch_random_video_lambda_package.output_path
  source_code_hash = filebase64sha256(data.archive_file.fetch_random_video_lambda_package.output_path)
  runtime          = "python3.10"

  environment {
    variables = {
      dynamodb_table_name = aws_dynamodb_table.video_metadata.name
    }
  }
}

# Lambda for Video Rating Update
data "archive_file" "video_rating_updater_lambda_package" {
  type        = "zip"
  source_file = "${path.module}/../serverless/video_rating_updater.py"
  output_path = "${path.module}/video_rating_updater.zip"
}

resource "aws_lambda_function" "video_rating_updater_lambda_function" {
  function_name    = "video_rating_updater_lambda"
  handler          = "video_rating_updater.lambda_handler"
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = data.archive_file.video_rating_updater_lambda_package.output_path
  source_code_hash = filebase64sha256(data.archive_file.video_rating_updater_lambda_package.output_path)
  runtime          = "python3.10"

  environment {
    variables = {
      dynamodb_votes_table_name = aws_dynamodb_table.votes_table.name,
      dynamodb_video_table_name = aws_dynamodb_table.video_metadata.name
    }
  }
}

# API Gateway configuration for Media Operations
resource "aws_api_gateway_rest_api" "media_operations_api" {
  name        = "MediaOperationsAPI"
  description = "API Gateway for Media Operations"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "api_root_resource" {
  rest_api_id = aws_api_gateway_rest_api.media_operations_api.id
  parent_id   = aws_api_gateway_rest_api.media_operations_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "api_get_root_method" {
  rest_api_id   = aws_api_gateway_rest_api.media_operations_api.id
  resource_id   = aws_api_gateway_resource.api_root_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "api_get_root_lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.media_operations_api.id
  resource_id             = aws_api_gateway_resource.api_root_resource.id
  http_method             = aws_api_gateway_method.api_get_root_method.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.fetch_random_video_lambda_function.invoke_arn
}

resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on  = [aws_api_gateway_integration.api_get_root_lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.media_operations_api.id
  stage_name  = "prod"
}

resource "aws_api_gateway_method" "api_options_root_method" {
  rest_api_id   = aws_api_gateway_rest_api.media_operations_api.id
  resource_id   = aws_api_gateway_resource.api_root_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "api_options_root_lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.media_operations_api.id
  resource_id             = aws_api_gateway_resource.api_root_resource.id
  http_method             = aws_api_gateway_method.api_options_root_method.http_method
  integration_http_method = "POST"
  type                    = "MOCK"
}

resource "aws_api_gateway_method_response" "api_options_200_response" {
  rest_api_id = aws_api_gateway_rest_api.media_operations_api.id
  resource_id = aws_api_gateway_resource.api_root_resource.id
  http_method = aws_api_gateway_method.api_options_root_method.http_method
  status_code      = "200"
  
  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

output "api_endpoint_url" {
  value = "https://${aws_api_gateway_rest_api.media_operations_api.id}.execute-api.${var.aws_region}.amazonaws.com/prod/"
}