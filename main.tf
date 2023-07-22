variable "aws_region" {
  default = "eu-central-1"
}

variable "access_key" {}
variable "secret_key" {}
variable "first_bucket_name" {}
variable "second_bucket_name" {}

provider "aws" {
  region     = var.aws_region
  access_key = var.access_key
  secret_key = var.secret_key
}

resource "aws_s3_bucket" "first_bucket" {
  bucket = var.first_bucket_name
  acl    = "private"
}

resource "aws_s3_bucket" "second_bucket" {
  bucket = var.second_bucket_name
  acl    = "private"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/serverless/media_conversion_lambda.py"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "media_conversion_lambda" {
  function_name    = "media_conversion_lambda"
  handler          = "media_conversion_lambda.lambda_handler"
  role             = aws_iam_role.lambda_exec.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.lambda_zip.output_path)
  runtime          = "python3.10"

  environment {
    variables = {
      JOB_TEMPLATE       = "mediaconvert-template"
      MEDIACONVERT_QUEUE = "arn:aws:mediaconvert:eu-west-1:777468512599:queues/Default"
      MEDIACONVERT_ROLE  = "arn:aws:iam::777468512599:role/mediaconvert-role"
      REGION_NAME        = var.aws_region
      S3_OUTPUT          = var.second_bucket_name
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

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

resource "aws_iam_role_policy_attachment" "lambda_exec_policy_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
