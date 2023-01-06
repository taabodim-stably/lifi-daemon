source .env.local

# $1 is the repo version (latest, 1.0, 1.1,...)
image_tag=$1

if [ -z "$image_tag" ]; then
  echo "Please enter the image version/tag"
  exit 1
fi

sudo docker build -f Dockerfile -t $PROJECT_NAME:$image_tag .