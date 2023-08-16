import os
import boto3
import random

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table_name = os.getenv('dynamodb_table_name')
    table = dynamodb.Table(table_name)

    try:
        total_videos = get_total_video_count(table)
        
        if total_videos == 0:
            return {
                'statusCode': 404,
                'body': 'No videos in the table.'
            }

        random_key = random.randint(1, total_videos)
        
        random_video = get_random_video(table, random_key)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': '*'
            },
            'body': random_video
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': f"Error occurred: {e}"
        }

def get_total_video_count(table):
    response = table.get_item(Key={'videoKey': -1})
    return response['Item']['videoCount']

def get_random_video(table, random_key):
    response = table.get_item(Key={'videoKey': random_key})
    return response['Item']