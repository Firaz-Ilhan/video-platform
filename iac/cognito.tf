variable "identity_pool_name" {
  type    = string
  default = "MyIdentityPool"
}

variable "allow_unauthenticated_identities" {
  type    = bool
  default = false
}

variable "developer_provider_name" {
  type    = string
  default = "dev"
}

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = var.identity_pool_name
  allow_unauthenticated_identities = var.allow_unauthenticated_identities

  cognito_identity_providers {
    client_id     = aws_cognito_user_pool_client.main.id
    provider_name = aws_cognito_user_pool.main.endpoint
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cognito_user_pool" "main" {
  name = "my_user_pool"

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name = "my_user_pool_client"


  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    "authenticated"   = aws_iam_role.cognito_authenticated_role.arn
    "unauthenticated" = aws_iam_role.cognito_unauthenticated_role.arn
  }
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

resource "aws_iam_policy" "cognito_authenticated_s3_policy" {
  name        = "CognitoAuthenticatedS3AccessPolicy"
  description = "Policy to allow certain S3 actions on video bucket for authenticated users"

  policy = <<-EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::${var.video_bucket_name}/*",
      "Effect": "Allow"
    },
    {
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::${var.video_bucket_name}/*",
      "Effect": "Allow"
    },
    {
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::${var.video_bucket_name}/*",
      "Effect": "Allow"
    },
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::${var.upload_bucket_name}/*"
    },
    {
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "*",
            "public/",
            "public/*",
            "protected/",
            "protected/*",
            "private/$${cognito-identity.amazonaws.com:sub}/",
            "private/$${cognito-identity.amazonaws.com:sub}/*"
          ]
        }
      },
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::${var.video_bucket_name}",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "cognito_authenticated_s3_attach" {
  role       = aws_iam_role.cognito_authenticated_role.name
  policy_arn = aws_iam_policy.cognito_authenticated_s3_policy.arn
}
