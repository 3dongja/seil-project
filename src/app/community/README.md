# Seil Project

> 소비자와 사업주를 연결하는 실시간 AI 요약 기반 채팅 플랫폼

## 🔗 배포 주소

**[https://seil.ai.kr](https://seil.ai.kr)**

## 🧠 주요 기능

### 🔍 1:1 AI 채팅 요약 시스템

* 사업주와 소비자 간의 실시간 채팅 기록을 기반으로 AI가 요약 생성
* GPT-3.5 기반 요약 생성 및 자동 저장
* 사용자 전화번호 기반 식별 및 중복 방지

### 📋 요약 제출 폼

* 카테고리별로 맞춤형 질문
* 연락처, 이메일, 주문번호 등 추가 정보 입력 가능
* 첨부파일 업로드 (최대 5MB)

### 📊 사업주 대시보드

* 실시간 문의 확인 및 요약 확인
* 링크 복사, QR 코드 표시, SNS 공유 (트위터, 페이스북, 카카오)
* 상담 가능 시간 설정 (오픈/종료 시간)
* 최근 문의 10건 요약, 전체 보기 연결

### 💬 커뮤니티 게시판

* 게시글 작성/수정/삭제
* 댓글 등록 및 실시간 업데이트
* 좋아요 기능
* Firebase `onSnapshot` 기반 실시간 데이터 반영

### 🔐 인증 및 보안

* Firebase Authentication 기반 사용자 인증
* 관리자(사업주) 계정 분리
* Firestore 규칙 기반 권한 설정

---

## 🏗️ 기술 스택

* **Next.js 15 (App Router 기반)**
* **TypeScript**
* **Tailwind CSS**
* **Firebase (Auth, Firestore, Storage)**
* **OpenAI GPT-3.5 API**
* **Vercel** 배포

---

## 🛠️ 프로젝트 구조 (일부)

```
src/
├── app/
│   ├── seller-dashboard/       # 사업주 대시보드
│   ├── chat-summary/           # 소비자 요약 제출 폼
│   ├── community/              # 커뮤니티 기능
│   └── api/                    # Firestore 리셋 등 서버 API
├── components/                 # 재사용 컴포넌트
├── lib/                        # Firebase 및 유틸 함수
└── hooks/                      # 커스텀 훅
```

---

## 👨‍💻 개발자

* **jin ([jinhyung1007@gmail.com](mailto:jinhyung1007@gmail.com))**
* GitHub: [3dongja/seil-project](https://github.com/3dongja/seil-project)

---

## 💡 향후 계획

* 소비자용 앱 출시 
* 사업주 맞춤 통계 시각화 기능 개발
* 채팅 요약 이력 저장 기능 강화
