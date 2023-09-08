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
}

variable "secret_key" {
  description = "AWS Secret Key"
  type        = string
}

variable "upload_bucket_name" {
  type = string
}

variable "video_bucket_name" {
  type = string
}

provider "aws" {
  region     = var.aws_region
  access_key = var.access_key
  secret_key = var.secret_key
}

resource "aws_s3_bucket" "upload_bucket" {
  bucket = var.upload_bucket_name
  acl    = "private"
}

resource "aws_s3_bucket" "video_bucket" {
  bucket = var.video_bucket_name
  acl    = "private"
}

resource "aws_s3_bucket_policy" "upload_lambda_access_policy" {
  bucket = aws_s3_bucket.upload_bucket.id

  policy = <<POLICY
  {
    "Version": "2012-10-17",
    "Id": "PolicyForLambdaUploadAccess",
    "Statement": [
      {
        "Sid": "AllowLambdaAccessToUploads",
        "Effect": "Allow",
        "Principal": {
            "Service": "lambda.amazonaws.com"
        },
        "Action": "s3:*",
        "Resource": "arn:aws:s3:::${var.upload_bucket_name}/*"
      }
    ]
  }
  POLICY
}

resource "aws_s3_bucket_policy" "video_bucket_user_access_policy" {
  bucket = aws_s3_bucket.video_bucket.id

  policy = <<POLICY
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Sid": "ListUserSpecificObjects",
              "Effect": "Allow",
              "Principal": {
                  "AWS": "${aws_iam_role.cognito_authenticated_role.arn}"
              },
              "Action": "s3:*",
              "Resource": "arn:aws:s3:::${var.video_bucket_name}",
              "Condition": {
                  "StringLike": {
                      "s3:prefix": "cognito/WebApp/$${cognito-identity.amazonaws.com:sub}/*"
                  }
              }
          },
          {
              "Sid": "ReadWriteDeleteUserSpecificObjects",
              "Effect": "Allow",
              "Principal": {
                 "AWS": "${aws_iam_role.cognito_authenticated_role.arn}"
              },
              "Action": [
                  "s3:DeleteObject",
                  "s3:GetObject",
                  "s3:PutObject"
              ],
              "Resource": "arn:aws:s3:::${var.video_bucket_name}/cognito/WebApp/$${cognito-identity.amazonaws.com:sub}/*"
          },
          {
              "Effect": "Allow",
              "Principal": {
                  "AWS": "${aws_iam_role.cognito_authenticated_role.arn}"
              },
              "Action": "s3:GetObject",
              "Resource": "arn:aws:s3:::${var.video_bucket_name}/*"
          }
      ]
  }
  POLICY
}

resource "aws_iam_role" "mediaconvert_execution_role" {
  name = "MediaConvertExeRole"

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

resource "aws_iam_role_policy" "mediaconvert_s3_access_policy" {
  name = "MediaConvertS3AccessPolicy"
  role = aws_iam_role.mediaconvert_execution_role.id

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
          "${aws_s3_bucket.upload_bucket.arn}",
          "${aws_s3_bucket.upload_bucket.arn}/*",
          "${aws_s3_bucket.video_bucket.arn}",
          "${aws_s3_bucket.video_bucket.arn}/*"
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
  name = "MediaConversionQueue"
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

resource "aws_iam_role" "cognito_authenticated_role" {
  name               = "CognitoAuthenticatedRole"
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

resource "aws_iam_role" "cognito_unauthenticated_role" {
  name               = "CognitoUnauthenticatedRole"
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

resource "aws_iam_role_policy_attachment" "cognito_authenticated_policy_attach" {
  role       = aws_iam_role.cognito_authenticated_role.name
  policy_arn = aws_iam_policy.cognito_userpool_creation_policy.arn
}

resource "aws_iam_role_policy_attachment" "cognito_unauthenticated_policy_attach" {
  role       = aws_iam_role.cognito_unauthenticated_role.name
  policy_arn = aws_iam_policy.cognito_userpool_creation_policy.arn
}

resource "aws_iam_policy" "cognito_userpool_creation_policy" {
  name        = "CognitoUserPoolCreationPolicy"
  description = "Policy to allow cognito-idp:CreateUserPool"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "cognito-idp:CreateUserPool",
      "Resource": "*"
    }
  ]
}
EOF
}
