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
