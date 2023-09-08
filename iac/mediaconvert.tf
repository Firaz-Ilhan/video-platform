resource "aws_media_convert_queue" "mediaconvert_queue" {
  name = "MediaConversionQueue"
}

resource "null_resource" "execute_script" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "bash ${path.module}/create_mediaconvert_template.sh"
    environment = {
      S3_BUCKET = "s3://${aws_s3_bucket.video_bucket.bucket}/"
    }
  }
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


