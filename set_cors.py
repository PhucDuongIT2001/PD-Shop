import boto3

s3 = boto3.client(
    's3',
    aws_access_key_id='YOUR_AWS_ACCESS_KEY_ID',
    aws_secret_access_key='YOUR_AWS_SECRET_ACCESS_KEY',
    region_name='ap-southeast-1'
)

cors_configuration = {
    'CORSRules': [{
        'AllowedHeaders': ['*'],
        'AllowedMethods': ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
        'AllowedOrigins': ['*'],
        'ExposeHeaders': []
    }]
}

s3.put_bucket_cors(Bucket='pdshop-images-pdshop', CORSConfiguration=cors_configuration)
print("CORS configured successfully!")
