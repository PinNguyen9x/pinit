pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    // Jenkins (launchd) có PATH tối giản, không thấy /usr/local/bin nơi có docker
    PATH        = "/usr/local/bin:/opt/homebrew/bin:$PATH"
    IMAGE_NAME  = 'learn-nextjs'
    IMAGE_TAG   = "${env.BUILD_NUMBER}"
    // VPS đích: user@ip
    VPS_HOST    = 'pin@149.28.18.204'
    // Thư mục deploy trên VPS
    DEPLOY_DIR  = '/opt/learn-nextjs'
    // Secret text credential trong Jenkins: URL backend production
    API_URL     = credentials('app-api-url')
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build image (amd64)') {
      steps {
        // VPS là x86_64, Mac là arm64 -> BẮT BUỘC build --platform linux/amd64
        sh '''
          docker build \
            --platform linux/amd64 \
            --build-arg API_URL=$API_URL \
            -t $IMAGE_NAME:$IMAGE_TAG \
            -t $IMAGE_NAME:latest .
        '''
      }
    }

    stage('Ship image to VPS') {
      steps {
        sshagent(credentials: ['vps-ssh']) {
          sh '''
            # Nén image và stream qua SSH (không cần Docker registry)
            docker save $IMAGE_NAME:$IMAGE_TAG | gzip | \
              ssh -o StrictHostKeyChecking=no $VPS_HOST "gunzip | docker load"
          '''
        }
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: ['vps-ssh']) {
          sh '''
            ssh -o StrictHostKeyChecking=no $VPS_HOST "mkdir -p $DEPLOY_DIR"
            scp -o StrictHostKeyChecking=no docker-compose.yml $VPS_HOST:$DEPLOY_DIR/docker-compose.yml

            ssh -o StrictHostKeyChecking=no $VPS_HOST "\
              cd $DEPLOY_DIR && \
              IMAGE=$IMAGE_NAME:$IMAGE_TAG API_URL='$API_URL' \
              docker compose up -d --remove-orphans && \
              docker image prune -f"
          '''
        }
      }
    }
  }

  post {
    success { echo "✅ Deploy thành công build #${IMAGE_TAG} -> http://149.28.18.204" }
    failure { echo "❌ Build/deploy thất bại — xem log stage lỗi phía trên" }
  }
}
