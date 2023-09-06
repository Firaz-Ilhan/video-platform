resource "aws_dynamodb_table" "video_metadata" {
  name           = "VideoMetadata"
  billing_mode   = "PAY_PER_REQUEST"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "videoKey"

  attribute {
    name = "videoKey"
    type = "N"
  }

  tags = {
    Name = "VideoMetadata"
  }
}

resource "aws_dynamodb_table" "votes_table" {
  name           = "VotesTable"
  billing_mode   = "PAY_PER_REQUEST"
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
