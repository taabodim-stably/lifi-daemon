source .env.local

image_tag=$1

if [ -z "$image_tag" ]; then
  echo "Please enter the image version/tag"
  exit 1
fi

# Run the bot
sudo docker run \
  -d \
  -v `pwd`/secrets/test.json:/secrets/test.json:ro \
  -e MY_ENV="temp_value" \
  -p 50000:50000 \
  --name $PROJECT_NAME \
  --memory 2G \
  --memory-reservation 500M \
  --restart unless-stopped \
  $PROJECT_NAME:$image_tag
