resource "aws_dynamodb_table" "video_metadata" {
  name           = "VideoMetadataTable"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "videoKey"

  attribute {
    name = "videoKey"
    type = "N"
  }

  tags = {
    Name = "VideoMetadataTable"
  }
}

resource "aws_dynamodb_table" "votes_table" {
  name           = "VotesTable"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "userId"
  range_key      = "videoKey"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "videoKey"
    type = "N"
  }

  tags = {
    Name = "VotesTable"
  }
}
