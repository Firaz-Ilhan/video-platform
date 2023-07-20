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