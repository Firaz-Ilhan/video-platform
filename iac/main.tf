terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.9.0"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "access_key" {
  description = "AWS Access Key"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "AWS Secret Key"
  type        = string
  sensitive   = true
}

variable "first_bucket_name" {
  type = string
}

variable "second_bucket_name" {
  type = string
}

variable "user_arn" {
  type = string
}

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

resource "aws_s3_bucket_policy" "first_bucket_policy" {
  bucket = aws_s3_bucket.first_bucket.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "Policy1683915863869",
  "Statement": [
    {
      "Sid": "Stmt1683915859261",
      "Effect": "Allow",
      "Principal": {
          "Service": "lambda.amazonaws.com"
      },
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::${var.first_bucket_name}/*"
    }
  ]
}
POLICY
}

resource "aws_s3_bucket_policy" "second_bucket_policy" {
  bucket = aws_s3_bucket.second_bucket.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "Policy1683915863869",
  "Statement": [
    {
      "Sid": "Stmt1683915859261",
      "Effect": "Allow",
      "Principal": {
          "Service": "lambda.amazonaws.com"
      },
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::${var.second_bucket_name}/*"
    }
  ]
}
POLICY
}

resource "aws_iam_role" "mediaconvert_role" {
  name = "mediaconvert_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "mediaconvert.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "mediaconvert_role_policy" {
  name = "mediaconvert_role_policy"
  role = aws_iam_role.mediaconvert_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "${aws_s3_bucket.first_bucket.arn}",
        "${aws_s3_bucket.first_bucket.arn}/*",
        "${aws_s3_bucket.second_bucket.arn}",
        "${aws_s3_bucket.second_bucket.arn}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "mediaconvert:*"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_media_convert_queue" "mediaconvert_queue" {
  name = "queue"
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

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.first_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.media_conversion_lambda.arn
    events              = ["s3:ObjectCreated:*"]
  }
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.media_conversion_lambda.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.first_bucket.arn
}

resource "aws_iam_role" "authenticated" {
  name               = "cognito_authenticated"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role" "unauthenticated" {
  name               = "cognito_unauthenticated"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


resource "aws_iam_role_policy_attachment" "cognito_authenticated" {
  role       = aws_iam_role.authenticated.name
  policy_arn = aws_iam_policy.cognito_create_userpool_policy.arn
}

resource "aws_iam_role_policy_attachment" "cognito_unauthenticated" {
  role       = aws_iam_role.unauthenticated.name
  policy_arn = aws_iam_policy.cognito_create_userpool_policy.arn
}


resource "aws_iam_policy" "cognito_create_userpool_policy" {
  name        = "cognito_create_userpool_policy"
  description = "Policy to allow cognito-idp:CreateUserPool"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}