resource "aws_s3_bucket" "upload_bucket" {
  bucket = var.upload_bucket_name
  acl    = "private"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }
}

resource "aws_s3_bucket" "video_bucket" {
  bucket = var.video_bucket_name
  acl    = "private"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = []
  }
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