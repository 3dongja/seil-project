#!/bin/bash
# .env 파일에서 Firebase Functions Config로 자동 등록

# .env 파일 경로
ENV_FILE=".env"

# .env에서 변수 추출
PROJECT_ID=$(grep FB_PROJECT_ID $ENV_FILE | cut -d '=' -f2)
CLIENT_EMAIL=$(grep FB_CLIENT_EMAIL $ENV_FILE | cut -d '=' -f2)
PRIVATE_KEY=$(grep FB_PRIVATE_KEY $ENV_FILE | cut -d '=' -f2 | sed 's/\\/\\\\/g')

# Firebase Config에 설정
firebase functions:config:set \
  fb.project_id="$PROJECT_ID" \
  fb.client_email="$CLIENT_EMAIL" \
  fb.private_key="$PRIVATE_KEY"

# 완료 메시지
echo "✅ Firebase Functions config 등록 완료!"
