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
    // Image trên GitHub Container Registry — path BẮT BUỘC lowercase
    IMAGE       = 'ghcr.io/pinnguyen9x/learn-nextjs'
    IMAGE_TAG   = "${env.BUILD_NUMBER}"
    VPS_HOST    = 'pin@149.28.18.204'
    DEPLOY_DIR  = '/opt/learn-nextjs'
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
            -t $IMAGE:$IMAGE_TAG \
            -t $IMAGE:latest .
        '''
      }
    }

    stage('Push to ghcr') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_PAT')]) {
          sh '''
            echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
            docker push $IMAGE:$IMAGE_TAG
            docker push $IMAGE:latest
            docker logout ghcr.io
          '''
        }
        // Push xong -> xóa image app trên Mac (cả latest), không đụng image khác
        sh '''
          docker images $IMAGE --format '{{.Repository}}:{{.Tag}}' \
            | xargs -r docker rmi -f || true
        '''
      }
    }

    stage('Deploy') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_PAT')]) {
          sshagent(credentials: ['vps-ssh']) {
            sh '''
              ssh -o StrictHostKeyChecking=no $VPS_HOST "mkdir -p $DEPLOY_DIR"
              scp -o StrictHostKeyChecking=no docker-compose.yml $VPS_HOST:$DEPLOY_DIR/docker-compose.yml

              ssh -o StrictHostKeyChecking=no $VPS_HOST "\
                echo '$GHCR_PAT' | docker login ghcr.io -u '$GHCR_USER' --password-stdin; \
                docker network create webnet 2>/dev/null || true; \
                export IMAGE=$IMAGE:$IMAGE_TAG; export API_URL='$API_URL'; \
                cd $DEPLOY_DIR && \
                docker compose pull && \
                docker compose up -d --remove-orphans && \
                docker image prune -af"
            '''
          }
        }
      }
    }
  }

  post {
    success { echo "✅ Deploy thành công build #${IMAGE_TAG} -> https://nipit.pro" }
    failure { echo "❌ Build/deploy thất bại — xem log stage lỗi phía trên" }
  }
}
