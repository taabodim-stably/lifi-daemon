
################
# Declaraction #
################
SHELL := /bin/sh
DOCKER_IMAGE_NAME:=lifidaemon
DOCKER_IMAGE_VERSION:=0.0.0

include .env.local


define print_title
	echo -e "\n>>>>> $(1) <<<<<<\n"
endef

#####################
# Environment setup #
#####################
init:
# 	@echo Add pre-commit hook
# 	@pre-commit install --install-hooks

	@echo Switching to yarn 3.x
	@yarn set version berry

#########################
# Remote SSH host utils #
#########################
remote.connect:
ifneq ($(and $(SSH_PATH),$(REMOTE_USER),$(REMOTE_HOST),$(REMOTE_WORKDIR)),)
	@ssh -t -i ${SSH_PATH} ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_WORKDIR}; bash -l"
else
	@echo You need to specify the information in .env.local
	@exit 1
endif

remote.upload:
ifdef path
	@echo Uploading ${path} to ${REMOTE_HOST}:${REMOTE_WORKDIR}
	@rsync -h -P -e "ssh -i ${SSH_PATH}" -a ${path} ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_WORKDIR}/${path}
else
	@echo You need to specify path argument
	@echo Example: make remote.upload path=./your_file.txt
	@exit 1
endif

#####################
# Template required #
#####################
install:
ifeq ($(ci),)
	@echo "Initializing the working environment";
	@make init;
else ifeq ($(ci),0)
	@echo "Initializing the working environment";
	@make init;
else ifeq ($(ci),1)
	@echo "Skipped initializing environment in CI mode";
else
	@echo "Invalid value for 'ci' argument";
	@exit 1;
endif
	@echo "Installing the dependencies";
	@yarn install;

lint:
	@echo Formating source code
	@yarn lint-fix
check:
	@echo Type checking
	@yarn lint
	@yarn typecheck
test:
	@echo Running unit test
	@yarn test:unit

########################
# Github Actions utils #
########################
github.actions.check:
	@echo Preparing act to run Github Actions locally
ifneq ($$(which act),)
	@echo Use existing act at $$(which act)
else
	@echo Installing act to run Github Actions locally
	@sudo curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
endif
	@echo Run Github Actions workflows, not using .gitignore to filter out files
	@act --directory=./

################
# Docker utils #
################
docker.run:
	@docker run \
		--name ${DOCKER_IMAGE_NAME} \
		--rm \
		-e ENV_CONFIG_PATH="$(env_config_path)" \
		${DOCKER_IMAGE_NAME}:latest-$(platform)

docker.run.beta.arm64: env_config_path=env/beta.toml
docker.run.beta.arm64: platform=arm64
docker.run.beta.arm64: docker.run

docker.compose.run:
	@docker-compose -f docker-compose.yml up -d

docker.login:
	@$(call print_title,Login to Docker Registry) && \
	(sudo docker login $(registry_host) -u $(registry_user) --password-stdin < $(registry_password_file))

docker.build.local:
	@$(call print_title,Build local docker image) && \
	export DOCKER_BUILDKIT=0 && \
	docker build \
		--platform $(platform) \
		--pull \
		-f ./Dockerfile \
		-t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}-$(platform) \
		-t ${DOCKER_IMAGE_NAME}:latest-$(platform) \
		. && \
	docker image prune -f --filter label=stage=builder

docker.build.local.arm64: platform=arm64
docker.build.local.arm64: docker.build.local

docker.build.local.amd64: platform=amd64
docker.build.local.amd64: docker.build.local

docker.build.multiarch.builder.remove:
	@sudo docker buildx rm multiarch-builder

docker.build.multiarch.builder.create:
	@sudo docker buildx create \
		--name multiarch-builder \
		--driver docker-container \
		--config /etc/buildkit/buildkitd.toml

# Reference:
# 	- https://www.docker.com/blog/faster-multi-platform-builds-dockerfile-cross-compilation-guide/
# 	- https://github.com/docker/buildx/blob/master/docs/guides/custom-registry-config.md
docker.build.multiarch: registry_host=pi-nas.local:5000
docker.build.multiarch: registry_user=admin
docker.build.multiarch: registry_password_file=./secrets/registry_password.txt
docker.build.multiarch: docker.login
	@$(call print_title,Build multi-architecture docker image) && \
	export DOCKER_BUILDKIT=0 && \
	sudo docker buildx build \
		--platform linux/arm64,linux/amd64 \
		--builder multiarch-builder \
		--push \
		-f ./Dockerfile \
		-t $(registry_host)/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION} \
		-t $(registry_host)/${DOCKER_IMAGE_NAME}:latest \
		. && \
	docker image prune -f --filter label=stage=builder && \
	docker rm -f buildx_buildkit_multiarch-builder0

##################
# ECS deployment #
##################

docker.ecr.login:
	@aws ecr get-login-password --region $(aws_region) | docker login --username AWS --password-stdin $(ecr)

docker.build.service.lifidaemon:
	@export DOCKER_BUILDKIT=0 && \
	docker build \
		--pull \
		--platform $(platform) \
		--build-arg ENV_CONFIG_PATH=$(config_file) \
		-f ./Dockerfile \
		-t stably/${DOCKER_IMAGE_NAME}:latest \
		.
	# docker image prune -f --filter label=stage=builder

docker.buildanddeploy.lifidaemon.beta: platform=amd64
docker.buildanddeploy.lifidaemon.beta: config_file=env/beta.toml
docker.buildanddeploy.lifidaemon.beta: aws_region=us-west-2
docker.buildanddeploy.lifidaemon.beta: ecr=475910951137.dkr.ecr.us-west-2.amazonaws.com
docker.buildanddeploy.lifidaemon.beta: docker.ecr.login
docker.buildanddeploy.lifidaemon.beta: docker.build.service.lifidaemon
	@docker tag stably/${DOCKER_IMAGE_NAME}:latest $(ecr)/stably/${DOCKER_IMAGE_NAME}:latest
	@docker push $(ecr)/stably/${DOCKER_IMAGE_NAME}:latest
	@mkdir -p ./ecs-logs
	@echo "Update ECS service"
	@aws ecs update-service \
		--region $(aws_region) \
		--cluster StablyPrimeInternal \
		--service lifidaemon \
		--force-new-deployment \
		--no-cli-pager > ./ecs-logs/backend-beta.log
	@echo "See deployment log at ./ecs-logs/backend-beta.log"

docker.buildanddeploy.lifidaemon.prod: platform=amd64
docker.buildanddeploy.lifidaemon.prod: config_file=env/prod.toml
docker.buildanddeploy.lifidaemon.prod: aws_region=us-west-2
docker.buildanddeploy.lifidaemon.prod: ecr=808011740389.dkr.ecr.us-west-2.amazonaws.com
docker.buildanddeploy.lifidaemon.prod: docker.ecr.login
docker.buildanddeploy.lifidaemon.prod: docker.build.service.lifidaemon
	@docker tag stably/${DOCKER_IMAGE_NAME}:latest $(ecr)/stably/${DOCKER_IMAGE_NAME}:latest
	@docker push $(ecr)/stably/${DOCKER_IMAGE_NAME}:latest
	@mkdir -p ./ecs-logs
	@echo "Update ECS service"
	@aws ecs update-service \
		--region $(aws_region) \
		--cluster StablyPrimeInternal \
		--service lifidaemon \
		--force-new-deployment \
		--no-cli-pager > ./ecs-logs/backend-prod.log
	@echo "See deployment log at ./ecs-logs/backend-prod.log"

docker.buildandrun.lifidaemon: platform=amd64
docker.buildandrun.lifidaemon: config_file=env/beta.toml
docker.buildandrun.lifidaemon: docker.build.service.lifidaemon
	@docker run \
		-d \
		-p 5000:5000 \
		--name lifidaemon \
		stably/${DOCKER_IMAGE_NAME}:latest
