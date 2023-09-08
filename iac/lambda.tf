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
      S3_OUTPUT          = "s3://${var.video_bucket_name}/"
      DYNAMO_DB_TABLE    = aws_dynamodb_table.video_metadata.name
    }
  }
}

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

resource "aws_iam_policy" "lambda_s3_access_policy" {
  name        = "LambdaS3AccessPolicy"
  description = "Allows Lambda function to access S3 buckets."

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:HeadObject"
        ],
        Resource = [
          "${aws_s3_bucket.upload_bucket.arn}/*",
          "${aws_s3_bucket.video_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3_access_policy_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_s3_access_policy.arn
}

resource "aws_iam_policy" "lambda_dynamodb_access_policy" {
  name        = "LambdaDynamoDBAccessPolicy"
  description = "Allows Lambda function to access DynamoDB tables."

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ],
        Resource = "${aws_dynamodb_table.video_metadata.arn}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_access_policy_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_access_policy.arn
}



resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.upload_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.media_conversion_lambda_function.arn
    events              = ["s3:ObjectCreated:*"]
  }
}

resource "aws_lambda_permission" "s3_upload_invoke_lambda_permission" {
  statement_id  = "AllowUploadBucketInvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.media_conversion_lambda_function.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.upload_bucket.arn
}

resource "aws_iam_role" "lambda_execution_role" {
  name = "LambdaExecutionRole"

  assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_execution_basic_policy_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_permission" "s3_invoke_lambda_permission" {
  statement_id  = "AllowS3InvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.media_conversion_lambda_function.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.video_bucket.arn
}

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
  depends_on  = [
    aws_api_gateway_integration.api_get_root_lambda_integration,
    aws_api_gateway_integration.api_post_root_lambda_integration
  ]
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

resource "aws_api_gateway_method" "api_post_root_method" {
  rest_api_id   = aws_api_gateway_rest_api.media_operations_api.id
  resource_id   = aws_api_gateway_resource.api_root_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "api_post_root_lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.media_operations_api.id
  resource_id             = aws_api_gateway_resource.api_root_resource.id
  http_method             = aws_api_gateway_method.api_post_root_method.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.video_rating_updater_lambda_function.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_invoke_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.video_rating_updater_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_iam_policy" "mediaconvert_lambda_policy" {
  name        = "MediaConvertLambdaPolicy"
  description = "Policy to allow lambda to describe mediaconvert endpoints and other necessary actions"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "mediaconvert:DescribeEndpoints",
          "mediaconvert:CreateJob",
          "iam:PassRole"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_mediaconvert_policy_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.mediaconvert_lambda_policy.arn
}

resource "aws_iam_policy" "lambda_passrole_policy" {
  name        = "LambdaPassRolePolicyForMediaConvert"
  description = "Allows the Lambda to pass MediaConvertExeRole to MediaConvert"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "iam:PassRole"
        ],
        Resource = aws_iam_role.mediaconvert_execution_role.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_passrole_policy_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_passrole_policy.arn
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