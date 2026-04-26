# CHON 팬덤 플랫폼 — 통합 기술 설계서

> **버전:** POC v0.1 · **작성일:** 2026-04-15 · **분류:** CHON CONFIDENTIAL  
> **목적:** 블록체인 DID 기반 팬덤 플랫폼 전체 기술 스펙 — Proof of Concept (요구사항 · FE · BE · AI 하네스)

---

## 목차

1. [프로젝트 개요 및 비즈니스 요구사항](#1-프로젝트-개요-및-비즈니스-요구사항)
2. [기능 요구사항 (Functional Requirements)](#2-기능-요구사항)
3. [비기능 요구사항 (Non-Functional Requirements)](#3-비기능-요구사항)
4. [시스템 아키텍처](#4-시스템-아키텍처)
5. [프론트엔드 개발 스펙](#5-프론트엔드-개발-스펙)
6. [백엔드 개발 스펙](#6-백엔드-개발-스펙)
7. [데이터베이스 스키마](#7-데이터베이스-스키마)
8. [AI 하네스 엔지니어링](#8-ai-하네스-엔지니어링)
9. [테스트 케이스 명세 (29개)](#9-테스트-케이스-명세)
10. [KPI 연동 매핑](#10-kpi-연동-매핑)
11. [개발 로드맵 및 마일스톤](#11-개발-로드맵-및-마일스톤)

---

## 1. 프로젝트 개요 및 비즈니스 요구사항

### 1.1 플랫폼 비전

```
CHON 팬덤 플랫폼

"레전드 아티스트와 진성팬이 평생 함께하는 여정"
— 블록체인 DID 기반 팬덤 생태계

RELATIONSHIP IS IDENTITY
```

### 1.2 현황 및 문제 정의

| 구분 | 현황 | 문제점 |
|---|---|---|
| 수익 구조 | 연간 매출 약 1,000억원 | 플랫폼 수수료 45% 유출 (약 45억원) |
| 팬 관리 | 150만 구독자 보유 | 진성팬(True Fan) 식별 불가 |
| 운영 비용 | 팬클럽 운영 인력 3명+ | 연간 5억원 수동 운영 비용 |
| 2차 시장 | 티켓 리셀 정가의 3배+ | 아티스트 로열티 수익 0원 |
| 데이터 주권 | 유튜브·인스타 분산 | 팬 데이터 외부 플랫폼 종속 |

### 1.3 비즈니스 목표

```
단기 (3개월 파일럿)
├── VIP 팬 1,500명 온보딩
├── 재방문율 80% 이상
└── 초대 전환율 30% 달성

중기 (1년)
├── 활성 팬 3만명 확보
├── 연간 순이익 +35억원 개선
│   ├── 수수료 절감: 45억 → 15억 (△30억)
│   ├── 운영 자동화: 5억 → 2억 (△3억)
│   └── 2차 시장 로열티: +2억
└── 팬덤 데이터 100% 자체 보유

장기 (3년)
├── 활성 팬 5.2만명
├── 예상 매출 520억원 (450% 성장)
└── IPO / M&A 가능 기업가치 1,000억원+
```

### 1.4 핵심 플랫폼 레이어

```
CHON 팬덤 플랫폼
│
├── Layer 1: 신원 인증    DID 기반 팬 인증 (18초 온보딩)
├── Layer 2: 등급 체계    Royal · Middle · Casual 3-Tier
├── Layer 3: 참여 엔진    XP · 랭킹 · 배지 · 촌수 네트워크
├── Layer 4: 커뮤니티     팬-스타 채팅 채널 (등급별 차등)
├── Layer 5: 커머스       굿즈 · 티켓 · 디지털 상품 판매
├── Layer 6: 데이터       Discovery → Analysis → Targeting
└── Layer 7: AI 어시스턴트 챗봇 · 모더레이션 · 추천 엔진
```

---

## 2. 기능 요구사항

### 2.1 사용자 인증 및 등급 관리

#### FR-AUTH-001 | DID 기반 회원가입

```
요구사항: 블록체인 DID를 활용한 18초 이내 회원가입 완료
우선순위: Critical

상세 흐름:
  Step 1 (5초)  앱 실행 → 약관 동의 → 기기 정보 수집 및 토큰 생성 요청
  Step 2 (10초) 본인 확인 → 통신사 또는 카드사 인증 → 신원 데이터 검증
  Step 3 (3초)  DID 지갑 생성 승인 → 블록체인 DID 발급 → 암호화 키 저장
  Step 4 (즉시) 추천인 입력 (선택) → 네트워크 촌수 자동 계산 → 초기 등급 부여
  Step 5 (즉시) 프로필 설정 완료 → 웰컴 배지 지급 → 홈 화면 로딩

수락 기준:
  - 전체 플로우 18초 이내 완료
  - 실명 정보 서버 미저장 (DID 암호화 처리)
  - 만 14세 이상 가입 허용, 만 18세 미만 보호자 동의 필수
  - 추천인 연결 시 촌수 자동 계산 및 등급 반영
```

#### FR-AUTH-002 | 팬 등급 체계

```
요구사항: 활동 기반 3단계 등급 시스템 운영
우선순위: High

등급 정의:
  ┌────────────┬──────────┬──────────────┬────────────┐
  │ 등급       │ 조건     │ 인원 목표    │ 매출 기여  │
  ├────────────┼──────────┼──────────────┼────────────┤
  │ Royal(1촌) │ 공연 5회+│ 500명        │ 40%        │
  │ Middle(2촌)│ 친구 초대│ 2,000명      │ 35%        │
  │ Casual(3촌)│ 가입 즉시│ 10,000명     │ 25%        │
  └────────────┴──────────┴──────────────┴────────────┘

촌수 계산 로직:
  - 1촌: 아티스트가 직접 초대한 팬 (Royal 등급)
  - 2촌: 1촌(Royal) 팬이 초대한 팬 (Middle 등급)
  - 3촌: 2촌(Middle) 팬이 초대한 팬 (Casual 등급)
```

#### FR-AUTH-003 | XP 및 레벨 시스템

```
요구사항: 활동 기반 경험치 적립 및 레벨업 시스템
우선순위: High

XP 적립 테이블:
  친구 초대       +100 XP  (초대받은 친구 가입 완료 시)
  콘서트 관람     +50 XP   (공식 앱 체크인 필수)
  음원 구매       +30 XP   (공식 플랫폼 구매 건당)
  SNS 공유        +10 XP   (1일 최대 3회)
  굿즈 구매       +20 XP   (공식 샵 구매 건당)
  채팅 활동       +5 XP    (1일 최대 10회)
  배지 획득       +15 XP   (이벤트 배지 달성 시)

레벨 구간:
  Casual Tier  Lv.1  ~ Lv.10
  Middle Tier  Lv.11 ~ Lv.50
  Royal Tier   Lv.51 ~

VIP 혜택 기준점:
  9,000점 이상 → 백스테이지 초대 자격
  8,000점 이상 → 콘서트 선예매권
```

---

### 2.2 팬-스타 채팅 채널

#### FR-CHAT-001 | 채팅 채널 등급별 권한

```
요구사항: 등급별 차등 채팅 권한 적용
우선순위: High

권한 매트릭스:
  ┌──────────────────┬──────────────┬──────────────┬───────────────┐
  │ 기능             │ Royal (1촌)  │ Middle (2촌) │ Casual (3촌)  │
  ├──────────────────┼──────────────┼──────────────┼───────────────┤
  │ 스타 DM 채널     │ ✅ 접근      │ ❌ 잠금      │ ❌ 잠금       │
  │ 일일 메시지 한도 │ 무제한       │ 50건/일      │ 10건/일       │
  │ 스타 답장 수신   │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
  │ 미디어 첨부      │ ✅ 가능      │ ✅ 가능      │ ❌ 텍스트만   │
  │ 라이브 채팅      │ 우선 입장    │ 일반 입장    │ 대기열 적용   │
  │ 채팅방 개설      │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
  │ 메시지 고정(핀)  │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
  │ 투표 생성        │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
  └──────────────────┴──────────────┴──────────────┴───────────────┘
```

#### FR-CHAT-002 | 채팅 모더레이션

```
요구사항: AI 기반 실시간 채팅 콘텐츠 모더레이션
우선순위: Critical

처리 정책:
  혐오/비하 발언    → 즉시 숨김 + 운영자 알림 + 24시간 채팅 제한
  개인정보 노출     → 즉시 삭제 + 계정 임시 정지 + 긴급 에스컬레이션
  암표/불법거래     → 숨김 + 운영자 검토 + 정책 위반 경고
  미확인 루머       → 보류(검토 대기) + 공식 채널 안내 메시지
  반복 어뷰징       → 누적 3회 시 7일 채팅 제한 → 30일 제한 → 영구 제한
```

#### FR-CHAT-003 | 스타 답장 및 알림

```
요구사항: Royal 팬 대상 스타 답장 기능
우선순위: Medium

동작:
  - 스타가 Royal 팬 DM에 답장 시 즉시 푸시 알림
  - 앱 내 DM 채널 → 스타 DM 탭에서 확인
  - 답장 수신 시 특별 배지 지급 (+15 XP)
  - 스타 답장 스크린샷 공유 시 워터마크 자동 삽입
```

---

### 2.3 굿즈 & 상품 판매

#### FR-SHOP-001 | 등급별 선구매 시스템

```
요구사항: 등급별 한정판 선구매 시간 차등 적용
우선순위: High

선구매 정책:
  Royal (1촌)  판매 D-48시간 전 오픈
  Middle (2촌) 판매 D-24시간 전 오픈
  Casual (3촌) 일반 판매일 오픈

할인 혜택:
  Royal  15% 멤버십 할인
  Middle 10% 멤버십 할인
  Casual  5% 멤버십 할인

무료 배송 기준:
  Royal  상시 무료
  Middle 5만원 이상 구매 시
  Casual 7만원 이상 구매 시
```

#### FR-SHOP-002 | 상품 카테고리

```
요구사항: 다양한 상품 카테고리 지원
우선순위: High

카테고리:
  photobook     공식 포토북 · 화보집
  album         정규앨범 · 싱글 · EP
  md_goods      MD 굿즈 (키링, 머그컵, 의류 등)
  signed        친필 사인 앨범 (Royal 자동 응모)
  bundle        번들 패키지 (등급별 구성 차등)
  digital       디지털 콘텐츠 (비하인드 영상, 포토팩)
  ticket        콘서트 티켓 · 팬미팅 응모권
```

#### FR-SHOP-003 | 결제 및 환불

```
요구사항: 안전한 결제 및 등급별 환불 정책
우선순위: High

결제 수단:
  - 신용카드 / 체크카드
  - 간편결제 (카카오페이, 네이버페이, 토스)
  - 해외 결제 (Stripe - 글로벌 팬 대상)

환불 정책:
  Royal  수령 후 14일 이내
  Middle 수령 후 7일 이내
  Casual 수령 후 7일 이내

환불 불가 항목:
  - 개봉된 한정판 포토카드 및 시리얼 상품
  - 다운로드 완료된 디지털 콘텐츠
  - 친필 사인 상품 (하자 있을 시 예외)
```

#### FR-SHOP-004 | 포인트 및 2차 시장

```
요구사항: CHON 포인트 시스템 및 공식 2차 거래 지원
우선순위: Medium

CHON 포인트:
  - 굿즈 구매 시 결제금액의 3% 포인트 적립
  - 다음 구매 시 포인트 사용 가능 (최대 20% 적용)
  - Royal 팬: 5% 적립, Middle: 4%, Casual: 3%

공식 2차 시장:
  - 티켓 리셀: 정가의 최대 130% 이내 제한
  - 거래 성사 시 아티스트 로열티 5% 자동 적립
  - DID 기반 본인 인증 거래자만 참여 가능
```

---

### 2.4 데이터 타겟팅 및 분석

#### FR-DATA-001 | 팬 스코어링

```
요구사항: 활동 기반 팬 스코어 자동 산출
우선순위: High

스코어링 기준:
  스트리밍 활동    30%
  커뮤니티 참여    25%
  구매 이력        25%
  추천인 활동      20%

VIP 혜택 기준:
  9,000점 이상 → 백스테이지 초대 자격
  8,000점 이상 → 콘서트 선예매권
  5,000점 이상 → 월간 독점 콘텐츠 접근
```

#### FR-DATA-002 | 타겟팅 파이프라인

```
요구사항: 팬 데이터 기반 정밀 타겟팅
우선순위: Medium

파이프라인:
  Discovery  유튜브/SNS 채널 데이터 연동 → 잠재 팬 식별
  Analysis   활동 점수화 → 세그먼트 분류
  Targeting  세그먼트별 맞춤 혜택 / 푸시 발송
  Measure    CVR 분석 → ROI / LTV 추적 → 전략 최적화
```

---

## 3. 비기능 요구사항

### 3.1 성능

```yaml
응답 시간:
  API 평균 응답:    200ms 이하
  페이지 로드:      2초 이하 (LCP)
  채팅 메시지 전송: 100ms 이하
  결제 처리:        3초 이하

처리량:
  동시 접속자:      10,000명
  채팅 메시지:      100,000건/분 (콘서트 라이브 시)
  결제 TPS:         500건/초
  API 요청:         50,000건/분

가용성:
  SLA 목표:         99.9% (월 다운타임 43분 이하)
  계획 점검:        매주 화요일 02:00~04:00 KST
```

### 3.2 보안

```yaml
인증/인가:
  - JWT + Refresh Token (Access: 1시간, Refresh: 30일)
  - DID 기반 분산 신원 인증
  - RBAC (Role-Based Access Control) 적용

데이터 보호:
  - 개인정보 AES-256 암호화
  - 블록체인 DID 비식별화
  - HTTPS/TLS 1.3 전용
  - 개인정보보호법 제36조 준수

보안 정책:
  - API Rate Limiting (IP당 1,000건/분)
  - SQL Injection / XSS 방어
  - CSRF 토큰 적용
  - 의심 거래 실시간 모니터링
```

### 3.3 확장성

```yaml
아키텍처:
  - 마이크로서비스 기반 (서비스별 독립 배포)
  - 컨테이너 오케스트레이션: Kubernetes
  - CDN: CloudFront (정적 자산, 미디어)
  - 메시지 큐: Kafka (이벤트 스트리밍)

스케일링:
  - 오토스케일링: CPU 70% 초과 시 자동 확장
  - DB 읽기: Read Replica 3개
  - 캐시: Redis Cluster
  - 검색: Elasticsearch
```

### 3.4 접근성

```yaml
지원 환경:
  모바일 앱:    iOS 15+ / Android 10+
  웹:           Chrome 100+ / Safari 15+ / Edge 100+
  반응형:       360px ~ 1920px 대응

다국어:
  기본:         한국어 (ko-KR)
  지원:         영어 (en-US), 일본어 (ja-JP)
  추후 확장:    중국어 (zh-CN), 태국어 (th-TH)
```

---

## 4. 시스템 아키텍처

### 4.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  iOS App  ·  Android App  ·  Web (Next.js)  ·  Admin Dashboard     │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS / WebSocket
┌─────────────────────────▼───────────────────────────────────────────┐
│                       API GATEWAY (Kong)                            │
│         Rate Limiting  ·  Auth  ·  Load Balancing  ·  Logging      │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────────┐
│AUTH  │ │CHAT  │ │SHOP  │ │DATA  │ │NOTIF │ │  AI SERVICE      │
│SVC   │ │SVC   │ │SVC   │ │SVC   │ │SVC   │ │  (Anthropic API) │
│:3001 │ │:3002 │ │:3003 │ │:3004 │ │:3005 │ │  :3006           │
└──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──────┬───────────┘
   │        │        │        │        │             │
   └────────┴────────┴────────┴────────┴─────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
      ┌──────────┐      ┌──────────┐      ┌──────────┐
      │PostgreSQL│      │  Redis   │      │  Kafka   │
      │(Primary) │      │ Cluster  │      │  Stream  │
      │+ Replica │      │ Cache    │      │  Queue   │
      └──────────┘      └──────────┘      └──────────┘
            │
      ┌──────────┐      ┌──────────┐
      │Blockchain│      │  S3 /    │
      │  Node    │      │CloudFront│
      │ (DID)    │      │  (CDN)   │
      └──────────┘      └──────────┘
```

### 4.2 기술 스택

```yaml
Frontend:
  Framework:      Next.js 14 (App Router)
  Language:       TypeScript 5
  Styling:        Tailwind CSS + shadcn/ui
  State:          Zustand + TanStack Query
  Realtime:       Socket.IO Client
  Mobile:         React Native (Expo)
  Testing:        Vitest + Playwright

Backend:
  Runtime:        Node.js 20 (LTS)
  Framework:      NestJS 10
  Language:       TypeScript 5
  ORM:            Prisma
  Validation:     Zod
  Testing:        Jest + Supertest

Infrastructure:
  Cloud:          AWS (Seoul ap-northeast-2)
  Container:      Docker + Kubernetes (EKS)
  CI/CD:          GitHub Actions
  Monitoring:     Datadog
  Log:            ELK Stack

AI:
  LLM:            Anthropic API (claude-sonnet-4-20250514)
  Harness:        자체 개발 (TypeScript)
  Embedding:      OpenAI text-embedding-3-small
  Vector DB:      Pinecone

Blockchain:
  DID Standard:   W3C DID Core Spec
  Patent:         KR 10-2022-0021536 (블록체인 기반 DID 시스템)
```

---

## 5. 프론트엔드 개발 스펙

### 5.1 프로젝트 구조

```
chon-frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/
│   │   │   ├── page.tsx          # 온보딩 시작
│   │   │   ├── did-auth/page.tsx # DID 인증 플로우
│   │   │   └── profile/page.tsx  # 프로필 설정
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── home/page.tsx         # 홈 대시보드
│   │   ├── chat/
│   │   │   ├── page.tsx          # 채팅 채널 목록
│   │   │   ├── [channelId]/      # 개별 채팅방
│   │   │   │   └── page.tsx
│   │   │   └── dm/page.tsx       # 스타 DM (Royal 전용)
│   │   ├── shop/
│   │   │   ├── page.tsx          # 굿즈 목록
│   │   │   ├── [productId]/      # 상품 상세
│   │   │   ├── cart/page.tsx     # 장바구니
│   │   │   └── orders/page.tsx   # 주문 내역
│   │   ├── ranking/page.tsx      # 주간 랭킹
│   │   ├── network/page.tsx      # 촌수 네트워크 맵
│   │   ├── profile/page.tsx      # 내 프로필 / 배지
│   │   └── layout.tsx
│   ├── api/                      # API Routes (BFF)
│   └── layout.tsx
│
├── components/
│   ├── auth/
│   │   ├── DIDAuthFlow.tsx       # DID 인증 5단계 컴포넌트
│   │   ├── TierBadge.tsx         # 등급 배지
│   │   └── XPProgressBar.tsx     # XP 진행 바
│   ├── chat/
│   │   ├── ChatChannel.tsx       # 채팅 채널 UI
│   │   ├── MessageBubble.tsx     # 메시지 버블
│   │   ├── TierGate.tsx          # 등급 제한 게이트
│   │   ├── MediaUpload.tsx       # 미디어 첨부 (Middle+)
│   │   └── StarReply.tsx         # 스타 답장 표시
│   ├── shop/
│   │   ├── ProductCard.tsx       # 상품 카드
│   │   ├── EarlyAccessBadge.tsx  # 선구매 배지
│   │   ├── CartDrawer.tsx        # 장바구니 드로어
│   │   ├── PaymentForm.tsx       # 결제 폼
│   │   └── OrderTracking.tsx     # 배송 추적
│   ├── gamification/
│   │   ├── RankingBoard.tsx      # 주간 랭킹 보드
│   │   ├── BadgeCollection.tsx   # 배지 컬렉션
│   │   └── NetworkMap.tsx        # 촌수 네트워크 시각화
│   └── ui/                       # 공통 UI 컴포넌트
│
├── hooks/
│   ├── useAuth.ts                # 인증 상태 훅
│   ├── useChat.ts                # 채팅 소켓 훅
│   ├── useShop.ts                # 상품/결제 훅
│   ├── useTier.ts                # 등급 권한 훅
│   └── useXP.ts                  # XP 상태 훅
│
├── stores/
│   ├── authStore.ts              # Zustand 인증 스토어
│   ├── chatStore.ts              # Zustand 채팅 스토어
│   └── shopStore.ts              # Zustand 쇼핑 스토어
│
└── lib/
    ├── api.ts                    # API 클라이언트 (axios)
    ├── socket.ts                 # Socket.IO 클라이언트
    ├── tier.ts                   # 등급 권한 유틸
    └── format.ts                 # 날짜/숫자 포맷 유틸
```

### 5.2 핵심 컴포넌트 명세

#### DIDAuthFlow — DID 인증 5단계 플로우

```typescript
// components/auth/DIDAuthFlow.tsx

interface DIDAuthStep {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  estimatedSeconds: number;
  status: "pending" | "processing" | "completed" | "error";
}

interface DIDAuthFlowProps {
  onComplete: (did: string, initialTier: FanTier) => void;
  onError: (error: DIDAuthError) => void;
  referralCode?: string;      // 추천인 코드 (선택)
}

// 사용 예시
<DIDAuthFlow
  referralCode={searchParams.get("ref") ?? undefined}
  onComplete={(did, tier) => router.push("/home")}
  onError={(err) => toast.error(err.message)}
/>
```

#### TierGate — 등급 제한 게이트

```typescript
// components/chat/TierGate.tsx

interface TierGateProps {
  requiredTier: FanTier;           // 요구 최소 등급
  currentTier: FanTier;            // 현재 사용자 등급
  feature: string;                 // 제한된 기능명
  children: React.ReactNode;       // 허용 시 렌더
  fallback?: React.ReactNode;      // 제한 시 렌더 (기본: 업그레이드 유도 UI)
}

// 사용 예시 — 스타 DM 채널
<TierGate requiredTier="Royal" currentTier={user.tier} feature="스타 DM">
  <StarDMChannel />
</TierGate>

// 사용 예시 — 미디어 첨부
<TierGate requiredTier="Middle" currentTier={user.tier} feature="미디어 첨부">
  <MediaUpload />
</TierGate>
```

#### NetworkMap — 촌수 네트워크 시각화

```typescript
// components/gamification/NetworkMap.tsx
// D3.js 기반 Force-Directed Graph

interface NetworkNode {
  id: string;
  label: string;
  tier: FanTier;
  chonDegree: 1 | 2 | 3;
  xp: number;
  isCurrentUser: boolean;
  isStar: boolean;
}

interface NetworkEdge {
  source: string;
  target: string;
  type: "referral" | "follow";
}

interface NetworkMapProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  centerNodeId: string;           // 아티스트 노드 ID
  onNodeClick?: (node: NetworkNode) => void;
}

// 색상 매핑
const TIER_COLORS: Record<FanTier, string> = {
  Royal:  "#7C6DFA",   // 퍼플
  Middle: "#38D4C0",   // 틸
  Casual: "#A09BBF",   // 그레이
};
```

#### ProductCard — 굿즈 상품 카드

```typescript
// components/shop/ProductCard.tsx

interface ProductCardProps {
  product: Product;
  currentTier: FanTier;
  onAddToCart: (productId: string) => void;
}

// 렌더링 로직
function ProductCard({ product, currentTier, onAddToCart }: ProductCardProps) {
  const earlyAccessTime = product.early_access[currentTier];
  const now = new Date();
  const isAccessible = new Date(earlyAccessTime) <= now;
  const discountRate = TIER_DISCOUNT[currentTier]; // 15% | 10% | 5%

  return (
    <div className="product-card">
      {product.is_limited && <EarlyAccessBadge tier={currentTier} accessTime={earlyAccessTime} />}
      <img src={product.thumbnail} alt={product.name} />
      <h3>{product.name}</h3>
      <div className="price">
        <span className="original">{product.price.toLocaleString()}원</span>
        <span className="discounted">
          {(product.price * (1 - discountRate / 100)).toLocaleString()}원
        </span>
        <span className="discount-badge">{discountRate}% 할인</span>
      </div>
      <button
        disabled={!isAccessible}
        onClick={() => onAddToCart(product.id)}
      >
        {isAccessible ? "장바구니 담기" : `${formatCountdown(earlyAccessTime)} 후 오픈`}
      </button>
    </div>
  );
}
```

### 5.3 상태 관리

```typescript
// stores/chatStore.ts (Zustand)

interface ChatStore {
  channels: ChatChannel[];
  activeChannelId: string | null;
  messages: Record<string, ChatMessage[]>;
  dailyMessageCount: number;
  isConnected: boolean;

  // Actions
  setActiveChannel: (channelId: string) => void;
  sendMessage: (content: string, media?: File) => Promise<void>;
  receiveMessage: (message: ChatMessage) => void;
  checkDailyLimit: () => boolean;
}

// stores/shopStore.ts (Zustand)

interface ShopStore {
  cart: CartItem[];
  totalAmount: number;
  appliedDiscount: number;

  // Actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  applyTierDiscount: (tier: FanTier) => void;
  checkout: () => Promise<PaymentResult>;
}
```

### 5.4 API 클라이언트

```typescript
// lib/api.ts

import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// JWT 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 시 토큰 갱신
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await refreshToken();
      return apiClient(err.config);
    }
    return Promise.reject(err);
  }
);

// API 함수 예시
export const chatAPI = {
  getChannels:    ()                    => apiClient.get("/chat/channels"),
  getMessages:    (channelId: string)   => apiClient.get(`/chat/${channelId}/messages`),
  sendMessage:    (channelId: string, body: SendMessageDTO) =>
                  apiClient.post(`/chat/${channelId}/messages`, body),
  reportMessage:  (messageId: string)   => apiClient.post(`/chat/messages/${messageId}/report`),
};

export const shopAPI = {
  getProducts:    (params?: ProductQueryDTO)     => apiClient.get("/shop/products", { params }),
  getProduct:     (productId: string)            => apiClient.get(`/shop/products/${productId}`),
  addToCart:      (body: AddToCartDTO)           => apiClient.post("/shop/cart", body),
  checkout:       (body: CheckoutDTO)            => apiClient.post("/shop/orders", body),
  getOrders:      ()                             => apiClient.get("/shop/orders"),
  trackOrder:     (orderId: string)              => apiClient.get(`/shop/orders/${orderId}/tracking`),
};
```

### 5.5 WebSocket 채팅 연결

```typescript
// lib/socket.ts

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initSocket(token: string): Socket {
  socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("소켓 연결됨"));
  socket.on("disconnect", () => console.log("소켓 연결 해제"));

  return socket;
}

export function joinChannel(channelId: string) {
  socket?.emit("join_channel", { channelId });
}

export function sendMessage(channelId: string, content: string, media?: string) {
  socket?.emit("send_message", { channelId, content, media });
}

export function onMessage(handler: (msg: ChatMessage) => void) {
  socket?.on("new_message", handler);
}

export function onStarReply(handler: (reply: StarReply) => void) {
  socket?.on("star_reply", handler);   // Royal 팬 전용 이벤트
}
```

### 5.6 페이지별 UI 요구사항

#### 홈 대시보드

```
Layout: 스크롤 가능한 피드 형식

섹션 구성:
  1. 팬 프로필 카드
     - 이름 / 등급(Royal · Middle · Casual) / 촌수
     - XP 진행 바 (현재 / 다음 등급까지)
     - 오늘 달성 액션 요약

  2. 공지사항 배너 (아티스트 공식 업데이트)

  3. 주간 랭킹 미리보기 (Top 3)

  4. 채팅 채널 빠른 접근 (최근 활동 채널)

  5. 한정판 상품 알림 (선구매 카운트다운)

  6. 내 배지 컬렉션 (최근 획득 3개)
```

#### 채팅 채널

```
Layout: 좌측 채널 목록 + 우측 메시지 영역

채널 목록:
  - 스타 DM     (Royal 전용 / 잠금 아이콘)
  - 로열 라운지 (Royal 전용)
  - 오픈 커뮤니티 (전체)
  - 라이브 채팅  (이벤트 시 활성)

메시지 영역:
  - 등급 배지 + 닉네임 + 타임스탬프
  - 텍스트 / 이미지 / 영상 (등급별 차등)
  - 스타 답장 특별 스타일 (골드 하이라이트)
  - 일일 메시지 한도 표시 바 (Middle: 50건 / Casual: 10건)

입력창:
  - 등급 미달 기능 버튼 잠금 + 툴팁 안내
  - 한도 초과 시 입력 비활성화 + 초기화 시간 표시
```

#### 굿즈 샵

```
Layout: 그리드 상품 목록 + 필터 사이드바

필터:
  - 카테고리 (포토북 / 앨범 / MD / 사인 / 번들 / 디지털)
  - 등급별 접근 가능 상품만 보기 토글
  - 선구매 가능 상품 필터

상품 카드:
  - 상품 이미지
  - 등급별 선구매 오픈 시간 카운트다운
  - 멤버십 할인율 배지
  - 재고 수량 (임박 시 강조)

결제 플로우:
  Step 1: 장바구니 확인
  Step 2: 배송지 입력
  Step 3: 결제 수단 선택 + 멤버십 할인 자동 적용
  Step 4: 최종 확인 + 결제 완료
  Step 5: 주문 완료 + XP 적립 알림
```

---

## 6. 백엔드 개발 스펙

### 6.1 프로젝트 구조

```
chon-backend/
├── src/
│   ├── auth/                     # 인증 서비스
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── did/
│   │   │   ├── did.service.ts    # DID 발급 / 검증
│   │   │   └── blockchain.ts     # 블록체인 연동
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── did.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── tier.guard.ts     # 등급별 접근 제어
│   │
│   ├── users/                    # 유저 관리
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── tier/
│   │   │   ├── tier.service.ts   # 등급 계산 / 업데이트
│   │   │   └── xp.service.ts     # XP 적립 / 조회
│   │   └── network/
│   │       └── network.service.ts # 촌수 계산
│   │
│   ├── chat/                     # 채팅 서비스
│   │   ├── chat.module.ts
│   │   ├── chat.gateway.ts       # WebSocket Gateway
│   │   ├── chat.service.ts
│   │   ├── channels/
│   │   │   ├── channel.service.ts
│   │   │   └── channel.policy.ts  # 등급별 권한 정책
│   │   └── moderation/
│   │       └── moderation.service.ts # AI 모더레이션
│   │
│   ├── shop/                     # 쇼핑 서비스
│   │   ├── shop.module.ts
│   │   ├── products/
│   │   │   ├── products.controller.ts
│   │   │   └── products.service.ts
│   │   ├── cart/
│   │   │   └── cart.service.ts
│   │   ├── orders/
│   │   │   ├── orders.controller.ts
│   │   │   └── orders.service.ts
│   │   ├── payment/
│   │   │   ├── payment.service.ts  # 결제 처리
│   │   │   └── stripe.service.ts   # Stripe 연동
│   │   └── tier-pricing/
│   │       └── tier-pricing.service.ts # 등급별 가격 정책
│   │
│   ├── data/                     # 데이터 분석
│   │   ├── scoring/
│   │   │   └── scoring.service.ts  # 팬 스코어링
│   │   └── targeting/
│   │       └── targeting.service.ts
│   │
│   ├── ai/                       # AI 서비스
│   │   ├── ai.module.ts
│   │   ├── assistant/
│   │   │   └── assistant.service.ts # AI 어시스턴트
│   │   ├── moderation/
│   │   │   └── moderation.service.ts
│   │   └── harness/
│   │       └── harness.service.ts   # 하네스 실행
│   │
│   ├── notifications/            # 알림 서비스
│   │   ├── push/
│   │   │   └── push.service.ts    # FCM / APNs
│   │   └── email/
│   │       └── email.service.ts
│   │
│   └── common/                   # 공통 모듈
│       ├── prisma/
│       │   └── prisma.service.ts
│       ├── redis/
│       │   └── redis.service.ts
│       ├── kafka/
│       │   └── kafka.service.ts
│       └── decorators/
│           └── tier.decorator.ts  # @RequireTier()
│
├── prisma/
│   └── schema.prisma
├── test/
└── docker-compose.yml
```

### 6.2 API 엔드포인트 명세

#### 인증 API

```
POST   /auth/register              DID 기반 회원가입
POST   /auth/login                 로그인 (DID 검증)
POST   /auth/refresh               토큰 갱신
POST   /auth/logout                로그아웃
POST   /auth/did/verify            DID 본인 확인
GET    /auth/me                    내 프로필 조회
PATCH  /auth/profile               프로필 수정
```

#### 유저 API

```
GET    /users/:id                  유저 정보 조회
GET    /users/:id/tier             등급 정보 조회
GET    /users/:id/xp               XP 및 레벨 조회
GET    /users/:id/network          촌수 네트워크 조회
GET    /users/:id/badges           배지 컬렉션 조회
POST   /users/referral             추천인 코드 입력
GET    /users/ranking/weekly       주간 랭킹 조회
```

#### 채팅 API

```
GET    /chat/channels              채팅 채널 목록
GET    /chat/channels/:id          채널 상세
GET    /chat/:channelId/messages   메시지 목록 (페이지네이션)
POST   /chat/:channelId/messages   메시지 전송 (REST fallback)
POST   /chat/messages/:id/report   메시지 신고
GET    /chat/dm                    스타 DM 조회 (Royal 전용)
GET    /chat/limits                일일 메시지 한도 조회
```

#### 굿즈 샵 API

```
GET    /shop/products              상품 목록 (등급별 필터 지원)
GET    /shop/products/:id          상품 상세
GET    /shop/products/:id/access   등급별 접근 시간 조회
POST   /shop/cart                  장바구니 추가
GET    /shop/cart                  장바구니 조회
DELETE /shop/cart/:itemId          장바구니 삭제
POST   /shop/orders                주문 생성 (결제 포함)
GET    /shop/orders                주문 목록
GET    /shop/orders/:id            주문 상세
GET    /shop/orders/:id/tracking   배송 추적
POST   /shop/orders/:id/refund     환불 신청
GET    /shop/market                공식 2차 시장 목록
POST   /shop/market                2차 시장 티켓 등록
```

#### AI 어시스턴트 API

```
POST   /ai/chat                    AI 챗봇 대화
POST   /ai/moderation              콘텐츠 모더레이션
POST   /ai/translate               다국어 번역
GET    /ai/harness/run             하네스 실행 (관리자)
GET    /ai/harness/report/:runId   하네스 리포트 조회
```

### 6.3 핵심 서비스 구현

#### 등급 권한 가드

```typescript
// auth/guards/tier.guard.ts

import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

const TIER_HIERARCHY: Record<FanTier, number> = {
  Casual: 1,
  Middle: 2,
  Royal:  3,
};

@Injectable()
export class TierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.get<FanTier>("required_tier", context.getHandler());
    if (!requiredTier) return true;

    const { user } = context.switchToHttp().getRequest();
    const userLevel    = TIER_HIERARCHY[user.tier];
    const requiredLevel = TIER_HIERARCHY[requiredTier];

    if (userLevel < requiredLevel) {
      throw new ForbiddenException({
        code: "TIER_INSUFFICIENT",
        message: `이 기능은 ${requiredTier} 등급 이상만 사용할 수 있어요.`,
        currentTier: user.tier,
        requiredTier,
        upgradeGuide: `/users/${user.id}/tier/upgrade`,
      });
    }
    return true;
  }
}

// 사용 예시 — 스타 DM 채널 컨트롤러
@Get("dm")
@RequireTier("Royal")
@UseGuards(TierGuard)
async getStarDM(@CurrentUser() user: User) {
  return this.chatService.getStarDM(user.id);
}
```

#### XP 서비스

```typescript
// users/tier/xp.service.ts

@Injectable()
export class XPService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private kafka: KafkaService,
  ) {}

  async earnXP(userId: string, activity: XPActivity): Promise<XPResult> {
    const xpAmount = XP_TABLE[activity.type];

    // 일일 한도 체크 (SNS 공유: 하루 3회, 채팅: 하루 10회)
    if (DAILY_LIMIT_ACTIVITIES.includes(activity.type)) {
      const todayCount = await this.getDailyCount(userId, activity.type);
      const limit = DAILY_LIMITS[activity.type];
      if (todayCount >= limit) {
        return { earned: 0, reason: "일일 한도 초과", totalXP: await this.getXP(userId) };
      }
    }

    // XP 적립 (트랜잭션)
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.userXP.upsert({
        where:  { userId },
        create: { userId, totalXP: xpAmount },
        update: { totalXP: { increment: xpAmount } },
      });

      await tx.xPLog.create({
        data: { userId, activity: activity.type, amount: xpAmount, refId: activity.refId },
      });

      return updated;
    });

    // 레벨업 체크
    const newTier = this.calculateTier(result.totalXP);
    const oldTier = await this.getUserTier(userId);
    if (newTier !== oldTier) {
      await this.kafka.emit("tier.upgraded", { userId, oldTier, newTier });
    }

    // Redis 캐시 갱신
    await this.redis.set(`xp:${userId}`, result.totalXP, 3600);

    return { earned: xpAmount, totalXP: result.totalXP, newTier };
  }

  private calculateTier(totalXP: number): FanTier {
    if (totalXP >= 9000) return "Royal";  // Lv.51+
    if (totalXP >= 1000) return "Middle"; // Lv.11-50
    return "Casual";                       // Lv.1-10
  }
}

const XP_TABLE: Record<XPActivityType, number> = {
  referral:       100,
  concert:         50,
  purchase_music:  30,
  purchase_goods:  20,
  badge_earn:      15,
  sns_share:       10,
  chat:             5,
};
```

#### 채팅 WebSocket Gateway

```typescript
// chat/chat.gateway.ts

@WebSocketGateway({ namespace: "/chat", cors: { origin: "*" } })
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private chatService: ChatService,
    private channelPolicy: ChannelPolicyService,
    private moderationService: ModerationService,
    private xpService: XPService,
  ) {}

  async handleConnection(client: Socket) {
    const user = await this.validateToken(client.handshake.auth.token);
    client.data.user = user;
    await client.join(`user:${user.id}`);
    console.log(`연결: ${user.id} (${user.tier})`);
  }

  @SubscribeMessage("join_channel")
  async handleJoinChannel(client: Socket, { channelId }: { channelId: string }) {
    const user = client.data.user;
    const channel = await this.chatService.getChannel(channelId);

    // 등급 접근 권한 확인
    const canAccess = await this.channelPolicy.canAccess(user.tier, channel.minTier);
    if (!canAccess) {
      client.emit("error", {
        code: "TIER_INSUFFICIENT",
        message: `${channel.minTier} 등급 이상만 입장할 수 있어요.`,
      });
      return;
    }

    await client.join(`channel:${channelId}`);
    client.emit("joined", { channelId });
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(client: Socket, dto: SendMessageDTO) {
    const user = client.data.user;

    // 일일 메시지 한도 확인
    const limitCheck = await this.chatService.checkDailyLimit(user.id, user.tier);
    if (!limitCheck.allowed) {
      client.emit("error", {
        code: "DAILY_LIMIT_EXCEEDED",
        message: `오늘 메시지 한도(${limitCheck.limit}건)를 초과했어요. 내일 자정에 초기화돼요.`,
        resetAt: limitCheck.resetAt,
      });
      return;
    }

    // AI 모더레이션
    const modResult = await this.moderationService.check(dto.content);
    if (modResult.action !== "allow") {
      await this.moderationService.handleViolation(user.id, dto.content, modResult);
      client.emit("moderated", { action: modResult.action, reason: modResult.reason });
      return;
    }

    // 메시지 저장 및 브로드캐스트
    const message = await this.chatService.saveMessage(user.id, dto);
    this.server.to(`channel:${dto.channelId}`).emit("new_message", message);

    // XP 적립
    await this.xpService.earnXP(user.id, { type: "chat", refId: message.id });
  }
}

// 채팅 일일 한도 정책
const DAILY_CHAT_LIMITS: Record<FanTier, number> = {
  Royal:  Infinity,
  Middle: 50,
  Casual: 10,
};
```

#### 굿즈 결제 서비스

```typescript
// shop/payment/payment.service.ts

@Injectable()
export class PaymentService {
  constructor(
    private stripe: StripeService,
    private prisma: PrismaService,
    private xpService: XPService,
    private notificationService: NotificationService,
  ) {}

  async processCheckout(userId: string, dto: CheckoutDTO): Promise<PaymentResult> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const items = await this.validateCartItems(dto.cartItems, user.tier);

    // 등급별 할인 적용
    const discountRate = TIER_DISCOUNT[user.tier];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.floor(subtotal * (discountRate / 100));
    const finalAmount = subtotal - discount;

    // 배송비 계산
    const shippingFee = this.calculateShipping(user.tier, finalAmount);
    const totalAmount = finalAmount + shippingFee;

    // Stripe 결제
    const paymentIntent = await this.stripe.createPaymentIntent({
      amount: totalAmount,
      currency: "krw",
      metadata: { userId, orderId: dto.orderId },
    });

    // 주문 생성
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: "pending",
        items: { create: items },
        subtotal, discount, shippingFee,
        totalAmount,
        paymentIntentId: paymentIntent.id,
      },
    });

    return {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      totalAmount,
      appliedDiscount: discount,
      estimatedDelivery: this.getEstimatedDelivery(),
    };
  }

  async handlePaymentSuccess(orderId: string): Promise<void> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data:  { status: "paid" },
      include: { user: true, items: true },
    });

    // XP 적립 (굿즈 구매)
    await this.xpService.earnXP(order.userId, { type: "purchase_goods", refId: orderId });

    // 결제 완료 푸시 알림
    await this.notificationService.sendPush(order.userId, {
      title:  "결제 완료!",
      body:   `${order.items[0].name} 외 ${order.items.length - 1}개 상품 결제가 완료됐어요 🎉`,
      data:   { type: "order", orderId },
    });
  }

  private calculateShipping(tier: FanTier, amount: number): number {
    if (tier === "Royal") return 0;                        // Royal: 상시 무료
    if (tier === "Middle" && amount >= 50000) return 0;   // Middle: 5만원 이상 무료
    if (tier === "Casual" && amount >= 70000) return 0;   // Casual: 7만원 이상 무료
    return 3000;                                           // 기본 배송비 3,000원
  }
}

const TIER_DISCOUNT: Record<FanTier, number> = {
  Royal:  15,
  Middle: 10,
  Casual: 5,
};
```

#### AI 어시스턴트 서비스

```typescript
// ai/assistant/assistant.service.ts

@Injectable()
export class AssistantService {
  private client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async chat(userId: string, input: string, context: FanContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);

    const response = await this.client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0.1,
      system:     systemPrompt,
      messages:   [{ role: "user", content: input }],
    });

    const text = response.content.find(b => b.type === "text")?.text ?? "";
    await this.logConversation(userId, input, text);
    return text;
  }

  private buildSystemPrompt(ctx: FanContext): string {
    return `
당신은 CHON 팬덤 커뮤니티 플랫폼의 AI 어시스턴트입니다.

[팬 컨텍스트]
- 등급: ${ctx.fan_tier} (${ctx.chon_degree}촌)
- 누적 XP: ${ctx.xp_total.toLocaleString()}점 / 다음 등급까지 ${ctx.xp_to_next.toLocaleString()}XP
- 공연 관람: ${ctx.concert_count}회 / 친구 초대: ${ctx.referral_count}명

[핵심 원칙]
- 공식 확인된 정보만 제공, 미확인 정보는 명확히 구분
- 비하·혐오·개인정보 요청 즉시 거부
- 팬 친화적이고 긍정적인 어조 유지
- 한국어 기본, 사용자 언어에 맞춰 응답

[플랫폼 핵심 정보]
- DID 인증: 18초 완료, 5단계, 개인정보 비노출
- 등급: Royal(공연 5회+) / Middle(친구 초대) / Casual(신규)
- XP: 친구초대+100 / 콘서트+50 / 음원+30 / SNS+10
- VIP 기준: 9,000점+ 백스테이지 / 8,000점+ 선예매권
- 공식 샵: 위버스샵, 케이팝마트
- 고객지원: support.chon.fans
    `.trim();
  }
}
```

### 6.4 이벤트 기반 아키텍처 (Kafka)

```typescript
// Kafka 토픽 정의

const KAFKA_TOPICS = {
  // 사용자 이벤트
  "user.registered":     "신규 회원가입 완료",
  "user.tier.upgraded":  "팬 등급 상승",
  "user.xp.earned":      "XP 적립",

  // 채팅 이벤트
  "chat.message.sent":   "메시지 전송",
  "chat.moderated":      "콘텐츠 모더레이션 처리",
  "chat.star.replied":   "스타 답장 발생",

  // 쇼핑 이벤트
  "shop.order.created":  "주문 생성",
  "shop.order.paid":     "결제 완료",
  "shop.order.shipped":  "배송 시작",
  "shop.refund.requested":"환불 신청",

  // AI 이벤트
  "ai.moderation.alert": "AI 모더레이션 경고",
  "ai.harness.completed":"하네스 실행 완료",
} as const;

// 이벤트 소비 예시 — 등급 상승 처리
@EventPattern("user.tier.upgraded")
async handleTierUpgrade(@Payload() event: TierUpgradeEvent) {
  await Promise.all([
    this.notificationService.sendTierUpgradePush(event.userId, event.newTier),
    this.badgeService.awardTierBadge(event.userId, event.newTier),
    this.chatService.unlockChannels(event.userId, event.newTier),
    this.shopService.updateDiscountRate(event.userId, event.newTier),
  ]);
}
```

---

## 7. 데이터베이스 스키마

### 7.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── 사용자 ────────────────────────────────────────────────────────────

model User {
  id              String    @id @default(cuid())
  did             String    @unique          // 블록체인 DID 주소
  nickname        String
  email           String?   @unique
  phone           String?
  birthYear       Int?
  tier            FanTier   @default(Casual)
  chonDegree      Int       @default(3)      // 1촌 | 2촌 | 3촌
  referredById    String?
  referredBy      User?     @relation("Referral", fields: [referredById], references: [id])
  referrals       User[]    @relation("Referral")
  isMinor         Boolean   @default(false)
  guardianConsent Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  xp              UserXP?
  xpLogs          XPLog[]
  badges          UserBadge[]
  messages        ChatMessage[]
  orders          Order[]
  cartItems       CartItem[]
  fanScore        FanScore?
  sessionTokens   SessionToken[]

  @@index([tier, chonDegree])
}

model UserXP {
  id        String    @id @default(cuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id])
  totalXP   Int       @default(0)
  level     Int       @default(1)
  updatedAt DateTime  @updatedAt

  @@index([totalXP])
}

model XPLog {
  id        String          @id @default(cuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id])
  activity  XPActivityType
  amount    Int
  refId     String?         // 참조 ID (주문 ID, 메시지 ID 등)
  createdAt DateTime        @default(now())

  @@index([userId, createdAt])
}

// ── 채팅 ─────────────────────────────────────────────────────────────

model ChatChannel {
  id          String    @id @default(cuid())
  name        String
  type        ChannelType
  minTier     FanTier   @default(Casual)    // 최소 접근 등급
  isLive      Boolean   @default(false)
  createdAt   DateTime  @default(now())

  messages    ChatMessage[]
}

model ChatMessage {
  id          String        @id @default(cuid())
  channelId   String
  channel     ChatChannel   @relation(fields: [channelId], references: [id])
  senderId    String
  sender      User          @relation(fields: [senderId], references: [id])
  content     String
  mediaUrl    String?
  isStarReply Boolean       @default(false)
  isPinned    Boolean       @default(false)
  status      MessageStatus @default(visible)
  moderatedAt DateTime?
  createdAt   DateTime      @default(now())

  @@index([channelId, createdAt])
}

// ── 쇼핑 ─────────────────────────────────────────────────────────────

model Product {
  id              String          @id @default(cuid())
  name            String
  description     String?
  category        ProductCategory
  price           Int             // 원화 기준
  isLimited       Boolean         @default(false)
  stockTotal      Int
  earlyAccessRoyal   DateTime?    // Royal 선구매 오픈 시간
  earlyAccessMiddle  DateTime?    // Middle 선구매 오픈 시간
  publicSaleAt       DateTime?    // 일반 판매 오픈 시간
  thumbnailUrl    String?
  createdAt       DateTime        @default(now())

  cartItems       CartItem[]
  orderItems      OrderItem[]
  stock           ProductStock[]
}

model ProductStock {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id])
  tier      FanTier
  quantity  Int

  @@unique([productId, tier])
}

model CartItem {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int     @default(1)

  @@unique([userId, productId])
}

model Order {
  id               String      @id @default(cuid())
  userId           String
  user             User        @relation(fields: [userId], references: [id])
  status           OrderStatus @default(pending)
  subtotal         Int
  discount         Int         @default(0)
  shippingFee      Int         @default(0)
  totalAmount      Int
  paymentIntentId  String?
  trackingNumber   String?
  deliveryAddress  Json
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  items            OrderItem[]
  refund           Refund?

  @@index([userId, status])
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Int
}

model Refund {
  id        String       @id @default(cuid())
  orderId   String       @unique
  order     Order        @relation(fields: [orderId], references: [id])
  reason    String
  amount    Int
  status    RefundStatus @default(requested)
  createdAt DateTime     @default(now())
}

// ── 배지 / 랭킹 ──────────────────────────────────────────────────────

model Badge {
  id          String    @id @default(cuid())
  name        String
  description String?
  imageUrl    String
  isLimited   Boolean   @default(false)
  expiredAt   DateTime?
  createdAt   DateTime  @default(now())

  userBadges  UserBadge[]
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  badgeId   String
  badge     Badge    @relation(fields: [badgeId], references: [id])
  earnedAt  DateTime @default(now())

  @@unique([userId, badgeId])
}

// ── 팬 스코어 ────────────────────────────────────────────────────────

model FanScore {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  streamingScore  Int      @default(0)
  communityScore  Int      @default(0)
  purchaseScore   Int      @default(0)
  referralScore   Int      @default(0)
  totalScore      Int      @default(0)
  updatedAt       DateTime @updatedAt

  @@index([totalScore])
}

// ── Enum ─────────────────────────────────────────────────────────────

enum FanTier       { Royal Middle Casual }
enum ChannelType   { star_dm royal_lounge open_community live_chat }
enum MessageStatus { visible hidden deleted pending_review }
enum ProductCategory { photobook album md_goods signed bundle digital ticket }
enum OrderStatus   { pending paid shipping delivered cancelled }
enum RefundStatus  { requested processing completed rejected }
enum XPActivityType {
  referral concert purchase_music purchase_goods badge_earn sns_share chat
}
```

---

## 8. AI 하네스 엔지니어링

### 8.1 하네스 아키텍처

```
┌──────────────────────────────────────────────────────────────────┐
│                    CHON AI HARNESS POC v0.1                      │
│                                                                   │
│  TestCase JSON ──→ [Stage 1] 케이스 로더 & 컨텍스트 주입          │
│                          │                                        │
│                          ▼                                        │
│                  [Stage 2] 전처리 & System Prompt 빌더            │
│                          │                                        │
│                          ▼                                        │
│               [Stage 3] Anthropic API 호출                        │
│                     (claude-sonnet-4-20250514)                    │
│                          │                                        │
│                          ▼                                        │
│         [Stage 4] Auto-Evaluator (LLM-as-Judge + Rule)           │
│                          │                                        │
│                          ▼                                        │
│       [Stage 5] 품질 집계 → 충족/부분충족/미충족 분류             │
│                          │                                        │
│                          ▼                                        │
│          [Stage 6] KPI 연동 영향도 분석                           │
│                          │                                        │
│                          ▼                                        │
│       [Stage 7] 리포트 생성 & 개선 케이스 등록                    │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 TypeScript 타입 정의

```typescript
// harness/types.ts

interface TestCase {
  id: string;
  category: CategoryCode;
  priority: "Critical" | "High" | "Medium";
  title: string;
  tags: string[];
  context: FanContext;
  input: string;
  expected_summary: string;
  criteria: EvalCriterion[];
  kpi_links: KPILink[];
  actual_output?: string;
  eval_result?: EvalResult;
}

interface FanContext {
  fan_tier: "Royal" | "Middle" | "Casual";
  chon_degree: 1 | 2 | 3;
  xp_total: number;
  xp_to_next: number;
  concert_count: number;
  referral_count: number;
  join_days: number;
  recent_activity: ActivityLog[];
}

interface EvalCriterion {
  id: string;
  name: string;
  eval_type: "llm_judge" | "rule_based";
  rule?: string;
  judge_prompt?: string;
}

interface EvalResult {
  criteria_evals: CriterionEval[];
  overall_quality: "충족" | "부분충족" | "미충족";
  improvement_suggestions: string[];
  judge_reasoning: string;
}

interface CriterionEval {
  criterion_id: string;
  quality: "충족" | "부분충족" | "미충족";
  reason: string;
  suggestion?: string;
}

type CategoryCode =
  | "DID_AUTH"       // A: DID 인증
  | "FAN_TIER"       // B: 팬 등급 & 네트워크
  | "GAMIFICATION"   // C: 게이미피케이션
  | "MODERATION"     // D: 콘텐츠 모더레이션
  | "DATA_TARGETING" // E: 데이터 타겟팅
  | "EVENT_GOODS"    // F: 이벤트 & 굿즈
  | "MULTILANG"      // G: 다국어 지원
  | "CHAT_CHANNEL"   // H: 팬-스타 채팅 채널
  | "SHOP";          // I: 굿즈 & 상품 판매
```

### 8.3 시스템 프롬프트 템플릿

```
[BASE_SYSTEM_PROMPT]

당신은 CHON 팬덤 커뮤니티 플랫폼의 AI 어시스턴트입니다.

## 절대 금지 사항
- 미확인 정보를 사실처럼 추측하여 전달
- 아티스트 사생활 정보(주소, 연락처) 언급
- 비공식 구매처 또는 암표 거래 안내
- 혐오·비하·차별적 표현 포함 응답

## 응답 원칙
- 확인된 정보: 자신감 있게 안내
- 미확인 정보: "공식 채널에서 확인해 주세요"
- 정책 위반 콘텐츠: 즉시 분류 및 처리 반환
- 응답 언어: 팬이 사용한 언어로 응답

## CHON 핵심 정보
- DID 인증: 18초 완료, 5단계, 개인정보 비노출
- 등급: Royal(공연 5회+/500명) · Middle(2,000명) · Casual(신규)
- XP: 친구초대+100 / 콘서트+50 / 음원+30 / SNS+10
- VIP 기준: 9,000점+ 백스테이지 / 8,000점+ 선예매권
- 채팅 한도: Royal 무제한 / Middle 50건/일 / Casual 10건/일
- 굿즈 할인: Royal 15% / Middle 10% / Casual 5%
- 공식 샵: 위버스샵, 케이팝마트
- 고객지원: support.chon.fans
```

### 8.4 LLM-as-Judge 평가 프롬프트

```
[JUDGE_SYSTEM_PROMPT]

당신은 AI 응답 품질 평가 전문가입니다.

평가 원칙:
1. 기준 항목 하나만 평가합니다
2. 증거 기반으로 판단합니다 (응답 내 실제 문장 근거 제시)
3. 개선 가능한 부분을 구체적으로 제안합니다
4. 분석 근거는 1-2문장으로 간결하게 작성합니다

반드시 아래 JSON 형식으로만 응답합니다:
{
  "quality": "충족" | "부분충족" | "미충족",
  "confidence": 0.0-1.0,
  "reason": "분석 근거 (1-2문장)",
  "evidence": "응답에서 발췌한 근거 문장 (없으면 null)",
  "suggestion": "개선 제안 (없으면 null)"
}
```

### 8.5 프로젝트 구조

```
chon-ai-harness/
├── src/
│   ├── types.ts
│   ├── config.ts
│   ├── stage1_loader.ts        # 케이스 로더 & 컨텍스트 주입
│   ├── stage2_preprocessor.ts  # 전처리 & 프롬프트 빌더
│   ├── stage3_inference.ts     # Anthropic API 호출
│   ├── stage4_evaluator.ts     # LLM-as-Judge + Rule-Based
│   ├── stage5_scorer.ts        # 품질 집계
│   ├── stage6_kpi_mapper.ts    # KPI 연동
│   ├── stage7_reporter.ts      # 리포트 생성
│   └── index.ts                # 파이프라인 오케스트레이터
│
├── test-cases/
│   ├── A_did_auth.json
│   ├── B_fan_tier.json
│   ├── C_gamification.json
│   ├── D_moderation.json
│   ├── E_data_targeting.json
│   ├── F_event_goods.json
│   ├── G_multilang.json
│   ├── H_chat_channel.json
│   └── I_shop.json
│
├── prompts/
│   ├── base_system.txt
│   ├── category/
│   └── judge/
│
├── results/
└── .github/workflows/harness.yml
```

---

## 9. 테스트 케이스 명세

> **카테고리 개요**

| 코드 | 카테고리 | 커버 범위 | 케이스 수 |
|---|---|---|---|
| A | DID 인증 | 신규 가입, 오류 대응, 기존 팬클럽 비교, 미성년자 정책 | 4개 |
| B | 팬 등급 & 네트워크 | 등급 조건, 촌수 네트워크, 추천인, 백스테이지 초대 | 4개 |
| C | 게이미피케이션 | XP 적립, 랭킹 초기화, 배지 수집, 레벨업 오류 | 4개 |
| D | 콘텐츠 모더레이션 | 악성 댓글, 개인정보 유출, 암표 거래, 허위 루머 | 4개 |
| E | 데이터 타겟팅 | 팬 스코어링, 혜택 차등, 데이터 삭제 | 3개 |
| F | 이벤트 & 굿즈 | 파일럿 VIP 초대, 공식 굿즈 구매 안내 | 2개 |
| G | 다국어 지원 | 한→영, 한→일 번역 및 팬덤 용어 처리 | 2개 |
| H | 팬-스타 채팅 채널 | 등급별 채널 접근, 메시지 한도, 스타 답장, 어뷰징 신고 | 4개 |
| I | 굿즈 & 상품 판매 | 선구매 제한, 포토카드 선택, 배송 지연, 환불 정책 | 4개 |

---

### 카테고리 A — DID 인증

#### TC-A01 | DID 신규 가입 온보딩 안내

```yaml
id: TC-A01
category: DID_AUTH
priority: Critical
tags: [DID, 온보딩, 신규가입, 개인정보]
fan_preset: casual_new
```

**입력**
```
앱에서 DID 인증하려는데 어떻게 해요? 개인정보 유출 걱정돼요
```

**기대 출력 요약**
5단계 인증 여정 안내(18초) + 개인정보 비노출 원리(블록체인 비식별화) + 심리적 안심 메시지 + 공식 앱 다운로드 경로

**예시 이상적 응답**
```
CHON 앱의 DID 인증은 단 18초면 완료돼요! 개인정보 걱정 없이 안전하게 진행하실 수 있어요 🔐

📋 5단계 인증 과정
1️⃣ 가입 신청 및 약관 동의 (5초)
2️⃣ 본인 확인 — 통신사 또는 카드사 인증 (10초)
3️⃣ DID 지갑 자동 생성 (3초)
4️⃣ 추천인 입력 — 선택사항
5️⃣ 프로필 설정 완료

🛡️ 개인정보는 블록체인에 암호화된 DID 형태로 저장되며,
이름·주민번호 등 실명 정보는 서버에 저장되지 않아요.

CHON 공식 앱: chon.fans/download
```

**KPI 연동:** `KPI_ONBOARDING` — 온보딩 이탈률 5% 이하 목표 직결

---

#### TC-A02 | DID 인증 오류 상황 대응

```yaml
id: TC-A02
category: DID_AUTH
priority: Critical
tags: [DID, 오류대응, 트러블슈팅]
fan_preset: casual_new
```

**입력**
```
DID 지갑 생성 중 오류가 떴어요. 블록체인 주소 발급이 안 됩니다
```

**기대 출력 요약**
단계별 재시도 안내 → 기기 환경 확인 요청 → 고객지원 에스컬레이션. 원인 추측 절대 금지.

**예시 이상적 응답**
```
불편을 드려 죄송해요! 몇 가지 방법으로 해결해 보세요.

🔄 재시도 단계
1. 앱을 완전히 종료 후 재실행
2. 네트워크 연결 상태 확인 (Wi-Fi 전환 권장)
3. 앱 버전 최신 여부 확인 (설정 → 앱 업데이트)
4. 기기 재시작 후 다시 시도

그래도 해결이 안 된다면 고객지원으로 연락해 주세요.
📧 support.chon.fans | 평일 10:00~18:00
```

**KPI 연동:** `KPI_ONBOARDING` — 온보딩 완료율 100% 지향

---

#### TC-A03 | DID vs 기존 팬클럽 비교 질문

```yaml
id: TC-A03
category: DID_AUTH
priority: High
tags: [DID, 비교분석, 차별화]
fan_preset: casual_new
```

**입력**
```
기존 다음 카페 팬클럽이랑 뭐가 달라요? 굳이 CHON 앱을 써야 해요?
```

**기대 출력 요약**
수치 기반 명확한 비교(18초 vs 5분+, 이탈률 5% vs 45%) + CHON 고유 기능(상호 인증, 네트워크 시각화, 데이터 소유권) + 비강압적 어조

**KPI 연동:** `KPI_ONBOARDING` — 온보딩 전환율 제고

---

#### TC-A04 | 미성년자 DID 인증 문의

```yaml
id: TC-A04
category: DID_AUTH
priority: Critical
tags: [DID, 미성년자, 법적컴플라이언스, 보호자동의]
fan_preset: casual_new
```

**입력**
```
저 17살인데 CHON 앱 가입되나요? 부모님 동의가 꼭 필요한가요?
```

**기대 출력 요약**
만 14세 이상 가입 가능(법정 요건) + 만 18세 미만 보호자 동의 필수 안내 + 온라인 동의 절차 3단계 설명 + 개인정보 비노출 재강조

**예시 이상적 응답**
```
CHON은 만 14세 이상이라면 가입하실 수 있어요!

다만 만 18세 미만(미성년자)은 보호자 동의가 필요합니다. 어렵지 않아요 😊

📋 보호자 동의 절차 (3단계)
1. 가입 화면에서 "미성년자입니다" 선택
2. 보호자 휴대폰 번호 입력
3. 보호자에게 인증 문자(SMS) 발송 → 동의 완료

✅ 개인정보는 블록체인 DID로 암호화 저장되며, 실명 정보는 서버에 보관되지 않아요.

문의: support.chon.fans
```

**KPI 연동:** `KPI_LEGAL` — 법적 컴플라이언스 100% 준수

---

### 카테고리 B — 팬 등급 & 네트워크

#### TC-B01 | 로열층(VIP) 전환 조건 문의

```yaml
id: TC-B01
category: FAN_TIER
priority: High
tags: [등급, 로열층, VIP, 전환조건]
fan_preset: middle_active
```

**입력**
```
로열층(VIP)이 되려면 정확히 뭘 얼마나 해야 해요? 저는 콘서트 3번 갔어요
```

**기대 출력 요약**
로열층 조건(공연 5회+, 상위 500명) + 현재 상태(3회) 대비 갭 → 남은 조건 + 달성 방법(친구 초대 XP)

**KPI 연동:** `KPI_LTV` — 로열층 500명 달성 → 매출 40% 기여

---

#### TC-B02 | 촌수 네트워크 시각화 이해 질문

```yaml
id: TC-B02
category: FAN_TIER
priority: High
tags: [촌수, 네트워크, 시각화, 관계도]
fan_preset: middle_active
```

**입력**
```
나와 아티스트는 몇 촌이라는 게 무슨 뜻이에요? 어떻게 계산돼요?
```

**기대 출력 요약**
촌수 = 추천인 연결 경로 수 + 1촌(직접 연결=로열) · 2촌(로열이 초대=미들) · 3촌(미들이 초대=캐주얼) + 앱 내 네트워크 맵 시각화 기능 안내

**KPI 연동:** `KPI_VIRAL` — 팬 확장 속도 5배 가속

---

#### TC-B03 | 추천인 입력 누락 후 재설정 요청

```yaml
id: TC-B03
category: FAN_TIER
priority: Medium
tags: [추천인, 촌수, 수정요청]
fan_preset: casual_new
```

**입력**
```
가입할 때 추천인을 안 넣었는데 나중에 수정 가능한가요? 제 친구가 이미 로열층이에요
```

**기대 출력 요약**
추천인 수정 정책 정확 안내 + 수정 가능 여부 명확화 + 고객지원 연결 + 등급 영향 설명

**KPI 연동:** `KPI_VIRAL` — Viral Factor 3.2x (추천인 연결 활성화)

---

#### TC-B04 | 백스테이지 초대 조건 문의

```yaml
id: TC-B04
category: FAN_TIER
priority: High
tags: [백스테이지, 혜택, 로열층, VIP]
fan_preset: royal_veteran
```

**입력**
```
백스테이지 초대는 어떻게 받아요? 무조건 로열층이면 되나요?
```

**기대 출력 요약**
로열층 조건 + 추가 선발 기준(추첨/선착순) + 신청 방법 + 미확인 정보 추측 금지

**KPI 연동:** `KPI_LTV` — 로열층 락인(Lock-in) 효과 강화

---

### 카테고리 C — 게이미피케이션

#### TC-C01 | XP 적립 규칙 및 최적 전략 질문

```yaml
id: TC-C01
category: GAMIFICATION
priority: High
tags: [XP, 적립, 친구초대, 전략]
fan_preset: middle_active
```

**입력**
```
친구 초대하면 XP가 얼마나 쌓여요? 콘서트 가는 것보다 이게 더 이득인가요?
```

**XP 정책 참조**

| 활동 | XP | 비고 |
|---|---|---|
| 친구 초대 | +100 | 초대받은 친구 가입 완료 시 |
| 콘서트 관람 | +50 | 공식 앱 체크인 필수 |
| 음원 구매 | +30 | 공식 플랫폼 구매 건당 |
| SNS 공유 | +10 | 1일 최대 3회 |

**KPI 연동:** `KPI_VIRAL` — Viral Factor 3.2x 달성

---

#### TC-C02 | 랭킹 초기화 vs XP 영구 보존 구분

```yaml
id: TC-C02
category: GAMIFICATION
priority: Critical
tags: [랭킹, XP, 초기화, 정책혼동]
fan_preset: middle_active
```

**입력**
```
주간 랭킹이 매주 월요일 0시에 초기화된다고 했는데, 제가 쌓은 XP는 사라지나요?
```

**핵심 정책**
```
주간 랭킹 점수: 매주 월요일 0시 초기화 (경쟁 지표)
누적 XP 레벨:  영구 보존, 절대 삭제되지 않음 (자산)
```

**KPI 연동:** `KPI_RETENTION` — Retention Rate 85% 달성

---

#### TC-C03 | 한정판 배지 수집 및 과거 이벤트 배지 문의

```yaml
id: TC-C03
category: GAMIFICATION
priority: Medium
tags: [배지, 한정판, 이벤트, 컬렉션]
fan_preset: middle_active
```

**입력**
```
COLLECTION에 있는 배지는 어떻게 얻어요? 이미 지난 이벤트 배지는 구할 수 없나요?
```

**기대 출력 요약**
배지 획득 방법 + 기간 한정 배지 재발급 불가 정책 + 현재 획득 가능 배지 안내

**KPI 연동:** `KPI_CVR` — Conversion Rate 3x (배지 → 굿즈 구매)

---

#### TC-C04 | 레벨업 미처리 오류 대응

```yaml
id: TC-C04
category: GAMIFICATION
priority: High
tags: [레벨업, 오류, 트러블슈팅]
fan_preset: middle_active
```

**입력**
```
XP가 4,000 넘었는데 레벨이 안 올라요. 앱 오류인가요?
```

**기대 출력 요약**
레벨업 조건 재확인 + 재시도 단계 안내 + 고객지원 에스컬레이션 + 추측 없는 답변

**KPI 연동:** `KPI_RETENTION` — Daily Time 12min 유지

---

### 카테고리 D — 콘텐츠 모더레이션

> ⚠️ **Critical 카테고리**: 오탐(False Positive)·미탐(False Negative) 모두 즉시 프롬프트 개선 대상으로 등록.

#### TC-D01 | 악성 비하 댓글 감지 및 자동 필터링

```yaml
id: TC-D01
category: MODERATION
priority: Critical
tags: [비하, 혐오, 댓글, 자동필터]
fan_preset: middle_active
```

**입력**
```
[CONTENT_TYPE: comment]
'이 멤버 탈퇴해라 진짜 민폐임 ㅋㅋ 팬들 다 떠남'
```

**기대 출력 형식 (JSON)**
```json
{
  "action": "hide",
  "category": "hate_speech",
  "severity": "high",
  "confidence": 0.94,
  "notification": { "admin_alert": true, "user_warning": true },
  "reason": "아티스트 또는 팬덤 구성원을 직접적으로 비하하는 표현 포함",
  "guideline_ref": "Section 3.1 - 비하/혐오 표현 금지"
}
```

**모니터링 포인트:** C3(오탐) 미충족 시 즉시 프롬프트 개선 및 재검토

**KPI 연동:** `KPI_MODERATION` — 커뮤니티 이탈률 5% 이하 유지

---

#### TC-D02 | 아티스트 개인정보(주소) 유출 게시물 감지

```yaml
id: TC-D02
category: MODERATION
priority: Critical
tags: [개인정보, 주소유출, 아티스트보호, 즉시처리]
fan_preset: middle_active
```

**입력**
```
[CONTENT_TYPE: post]
'아티스트 집 주소 알아냈어요 공유할게요 ㄷㄷ'
```

**기대 출력 형식 (JSON)**
```json
{
  "action": "delete",
  "category": "privacy_violation",
  "severity": "critical",
  "confidence": 0.99,
  "notification": {
    "admin_alert": true,
    "user_warning": true,
    "emergency_escalation": true
  },
  "account_action": "suspend_temporary",
  "reason": "아티스트 개인 주소 공유 시도 — 즉각적 안전 위협",
  "guideline_ref": "Section 5.1 - 개인정보 침해 및 스토킹 방지"
}
```

**KPI 연동:** `KPI_LEGAL` — 아티스트 안전 보호 및 법적 리스크 예방

---

#### TC-D03 | 비공식 암표 거래 시도 감지

```yaml
id: TC-D03
category: MODERATION
priority: Critical
tags: [암표, 2차거래, 비공식거래, 수익보호]
fan_preset: middle_active
```

**입력**
```
[CONTENT_TYPE: dm]
'콘서트 티켓 2배 가격에 팔아요. 직거래 가능합니다'
```

> **개선 포인트:** C4(친절한 정책 안내 메시지) 프롬프트에 보완 필요.

**KPI 연동:** `KPI_SHOP_CVR` — 2차 시장 로열티 수익 +2억원 구조 보호

---

#### TC-D04 | 미확인 루머 및 허위 정보 게시물 감지

```yaml
id: TC-D04
category: MODERATION
priority: Critical
tags: [루머, 허위정보, 커뮤니티혼란]
fan_preset: middle_active
```

**입력**
```
[CONTENT_TYPE: post]
'아티스트 활동 중단 확정됐대요 소속사에서 발표 예정이래요 (출처 미상)'
```

**기대 출력 형식 (JSON)**
```json
{
  "action": "pending_review",
  "category": "rumor",
  "severity": "medium",
  "confidence": 0.88,
  "notification": { "admin_alert": true },
  "reason": "미확인 출처의 아티스트 활동 관련 루머",
  "guideline_ref": "Section 6.2 - 허위정보 및 루머 처리"
}
```

**KPI 연동:** `KPI_MODERATION` — 팬덤 신뢰도 유지 및 집단 이탈 방지

---

### 카테고리 E — 데이터 타겟팅

#### TC-E01 | 팬 스코어링 조회 및 VIP 갭 분석

```yaml
id: TC-E01
category: DATA_TARGETING
priority: High
tags: [스코어링, VIP갭, LTV, 타겟팅]
fan_preset: middle_active
```

**입력**
```
제 팬 점수가 얼마인지 알고 싶어요. VIP 전환하려면 얼마나 더 필요해요?
```

**컨텍스트 (middle_active 기준)**
```
현재 팬 스코어: 3,450점 / VIP 기준: 9,000점 / 부족: 5,550점
달성 시나리오: 친구 30명 초대(+3,000) + 콘서트 5회(+250) + 음원 25회(+750) = 4,000 XP
```

**KPI 연동:** `KPI_CVR` — 구매 전환율 45% · LTV Increase 5.4x

---

#### TC-E02 | 세그먼트 차등 혜택 공정성 이의 제기

```yaml
id: TC-E02
category: DATA_TARGETING
priority: Critical
tags: [차등혜택, 공정성, 불만대응, 이탈방지]
fan_preset: middle_active
```

**입력**
```
왜 저한테는 백스테이지 초대가 안 오고 친구한테는 왔어요? 불공평하지 않나요?
```

**기대 출력 요약**
스코어 기반 차등 시스템 설명 + 공정성 근거(9,000점↑ 백스테이지, 8,000점↑ 선예매) + 개선 방법

**KPI 연동:** `KPI_RETENTION` — 이탈률 5% 이하 방어

---

#### TC-E03 | 개인 활동 데이터 삭제 요청

```yaml
id: TC-E03
category: DATA_TARGETING
priority: Critical
tags: [개인정보, 데이터삭제, 블록체인]
fan_preset: royal_veteran
```

**입력**
```
제 활동 데이터 모두 삭제하고 싶어요. DID 지갑도 없애고 싶어요
```

**핵심 정책**
```
개인정보보호법 제36조: 정보주체 삭제 요구 권리
블록체인 특성: 트랜잭션 이력 불변(Immutable) — 완전 삭제 불가
처리 방식: 개인식별 정보(이름·연락처) 분리 삭제 가능, DID 주소는 익명화 처리
```

**KPI 연동:** `KPI_LEGAL` — 법적 컴플라이언스 · 데이터 소유권 신뢰

---

### 카테고리 F — 이벤트 & 굿즈

#### TC-F01 | 파일럿 VIP 초대장 수락 안내

```yaml
id: TC-F01
category: EVENT_GOODS
priority: High
tags: [VIP초대, 파일럿, 온보딩]
fan_preset: royal_veteran
```

**입력**
```
초대장 받았는데 이게 뭔가요? 어떻게 수락해요?
```

**기대 출력 요약**
파일럿 VIP 초대 의미(상위 1% 선발) + 수락 절차 + 혜택(친필 메시지, 로열층 배지) + 마감일 안내

**KPI 연동:** `KPI_ONBOARDING` — 파일럿 1개월차 VIP 1,500명 모집

---

#### TC-F02 | 공식 굿즈 구매 및 비공식 사이트 경고

```yaml
id: TC-F02
category: EVENT_GOODS
priority: Medium
tags: [굿즈, 공식구매처, 사기경고]
fan_preset: casual_new
```

**입력**
```
공식 포토북 어디서 살 수 있어요? 해외 배송 되나요? 비공식 사이트도 있던데
```

**기대 출력 요약**
공식 구매처(위버스샵·케이팝마트) + 해외 배송 가능 여부 + 비공식 사이트 사기 경고

**KPI 연동:** `KPI_SHOP_CVR` — 공식 채널 GMV 증가

---

### 카테고리 G — 다국어 지원

#### TC-G01 | 영어권 팬의 한국어 공지 번역

```yaml
id: TC-G01
category: MULTILANG
priority: Medium
tags: [번역, 영어, 팬덤용어, 다국어]
fan_preset: casual_new
```

**입력**
```
Can you translate this? '컴백 쇼케이스 일정이 변경되었습니다. 위버스에서 확인해 주세요.'
```

**기대 출력 요약**
자연스러운 영어 번역 + 팬덤 용어 보존(Showcase, Weverse) + 원문 병기

**KPI 연동:** `KPI_GLOBAL` — 글로벌 팬덤 CAGR 7.3% 대응

---

#### TC-G02 | 일본어 팬의 콘서트 일정 및 티켓 문의

```yaml
id: TC-G02
category: MULTILANG
priority: Medium
tags: [번역, 일본어, 콘서트, 티켓]
fan_preset: casual_new
```

**입력**
```
アーティストの 次のコンサートはいつですか？チケットはどこで買えますか？
```

**기대 출력 요약**
일본어 경어체 답변 + 공식 구매처 안내 + 미확정 일정 추측 금지 + 한국어 원문 선택적 병기

**KPI 연동:** `KPI_GLOBAL` — 일본 팬덤 시장 진출

---

### 카테고리 H — 팬-스타 채팅 채널

#### 채널 등급별 권한 정책

```
┌──────────────────┬──────────────┬──────────────┬───────────────┐
│ 기능             │ Royal (1촌)  │ Middle (2촌) │ Casual (3촌)  │
├──────────────────┼──────────────┼──────────────┼───────────────┤
│ 스타 DM 채널     │ ✅ 접근      │ ❌ 잠금      │ ❌ 잠금       │
│ 일일 메시지 한도 │ 무제한       │ 50건/일      │ 10건/일       │
│ 스타 답장 수신   │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
│ 미디어 첨부      │ ✅ 가능      │ ✅ 가능      │ ❌ 텍스트만   │
│ 라이브 채팅      │ 우선 입장    │ 일반 입장    │ 대기열 적용   │
│ 채팅방 개설      │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
│ 메시지 고정(핀)  │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
│ 투표 생성        │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
└──────────────────┴──────────────┴──────────────┴───────────────┘
```

#### TC-H01 | Casual 팬의 스타 DM 채널 접근 시도

```yaml
id: TC-H01
category: CHAT_CHANNEL
priority: Critical
tags: [채팅, DM채널, 등급제한, Casual]
fan_preset: casual_new
```

**입력**
```
아티스트 님한테 직접 메시지 보내고 싶어요. DM 채널 어디 있어요?
```

**기대 출력 요약**
Casual 등급 스타 DM 접근 불가 명확 안내 → Royal 등급 필요 설명 → 등급 상승 방법 유도 → 대안 채널(공개 커뮤니티) 안내

**KPI 연동:** `KPI_LTV` — 등급 업그레이드 동기 부여

---

#### TC-H02 | Middle 팬의 일일 메시지 한도 초과 안내

```yaml
id: TC-H02
category: CHAT_CHANNEL
priority: High
tags: [채팅, 메시지한도, Middle, 등급제한]
fan_preset: middle_active
```

**입력**
```
메시지를 보내려는데 "오늘 전송 한도 초과"라고 나와요. 유료 결제하면 더 보낼 수 있나요?
```

**기대 출력 요약**
Middle 등급 일일 50건 한도 설명 → 내일 자정 초기화 안내 → Royal 업그레이드 시 무제한 → 유료 연장 불가 명확히 안내

**KPI 연동:** `KPI_CHAT_ENGAGE` — 채팅 참여율 유지

---

#### TC-H03 | Royal 팬의 스타 답장 알림 미수신

```yaml
id: TC-H03
category: CHAT_CHANNEL
priority: High
tags: [채팅, 스타답장, Royal, DM]
fan_preset: royal_veteran
```

**입력**
```
아티스트 님이 제 DM에 답장을 해주셨는데 알림이 안 와요. 어디서 확인하나요?
```

**기대 출력 요약**
Royal 답장 수신 자격 확인 → DM 채널 내 확인 위치 → 알림 설정 점검 단계 → 고객지원 연결

**KPI 연동:** `KPI_RETENTION` — Royal 팬 특별 경험 품질

---

#### TC-H04 | 채팅 내 욕설 및 어뷰징 신고

```yaml
id: TC-H04
category: CHAT_CHANNEL
priority: Critical
tags: [채팅, 모더레이션, 신고, 어뷰징]
fan_preset: middle_active
```

**입력**
```
[채팅 신고] 사용자 "troll_user_99"가 채팅방에서 욕설과 타 팬 비하 발언을 반복하고 있어요
```

**기대 출력 형식 (JSON)**
```json
{
  "action": "mute_temp",
  "target_user": "troll_user_99",
  "duration_hours": 24,
  "category": "hate_speech_chat",
  "severity": "high",
  "confidence": 0.96,
  "notification": {
    "admin_alert": true,
    "reporter_protected": true,
    "result_notify": true
  },
  "reporter_message": "신고가 접수되었습니다. 처리 결과를 알림으로 안내해 드릴게요.",
  "guideline_ref": "Section 4.2 - 채팅 채널 커뮤니티 수칙"
}
```

**KPI 연동:** `KPI_MODERATION` — 채팅 채널 안전한 환경 유지

---

### 카테고리 I — 굿즈 & 상품 판매

#### 굿즈 샵 등급별 혜택 정책

```
┌──────────────────┬──────────────┬──────────────┬───────────────┐
│ 기능             │ Royal (1촌)  │ Middle (2촌) │ Casual (3촌)  │
├──────────────────┼──────────────┼──────────────┼───────────────┤
│ 한정판 선구매    │ D-48시간 전  │ D-24시간 전  │ 일반 판매일   │
│ 멤버십 할인      │ 15%          │ 10%          │ 5%            │
│ 포토카드 선택    │ 직접 선택    │ 랜덤 지급    │ 랜덤 지급     │
│ 친필 사인 응모   │ 자동 응모    │ 별도 응모    │ 응모 불가     │
│ 무료 배송        │ 상시 무료    │ 5만원 이상   │ 7만원 이상    │
│ 교환/환불 기간   │ 14일         │ 7일          │ 7일           │
│ 번들 패키지 구매 │ ✅ 전체      │ ✅ 일부      │ ❌ 불가       │
└──────────────────┴──────────────┴──────────────┴───────────────┘
```

#### TC-I01 | Casual 팬의 한정판 선구매 접근 시도

```yaml
id: TC-I01
category: SHOP
priority: High
tags: [굿즈, 한정판, 선구매, 등급제한, Casual]
fan_preset: casual_new
```

**입력**
```
한정판 포토북 사전 예약하고 싶어요. 근데 구매 버튼이 비활성화돼 있어요
```

**기대 출력 요약**
Casual 등급 선구매 대기 안내 → 등급별 선구매 시간 차이 설명 → 일반 판매일 카운트다운 → 5% 할인 자동 적용 확인 → 등급 업그레이드 유도

**KPI 연동:** `KPI_SHOP_CVR` — 등급별 선구매 전환율 향상

---

#### TC-I02 | Royal 팬의 포토카드 선택 구매

```yaml
id: TC-I02
category: SHOP
priority: Medium
tags: [굿즈, 포토카드, Royal, 선택구매]
fan_preset: royal_veteran
```

**입력**
```
포토카드 랜덤팩 말고 원하는 카드로 골라서 살 수 있어요? 저 로열 회원인데요
```

**기대 출력 요약**
Royal 등급 포토카드 선택 구매 가능 확인 → 선택 구매 경로 안내 → 15% 할인 자동 적용 → 재고 현황 안내

**KPI 연동:** `KPI_SHOP_CVR` — Royal 팬 전환율 극대화

---

#### TC-I03 | 주문 배송 조회 및 지연 문의

```yaml
id: TC-I03
category: SHOP
priority: High
tags: [굿즈, 배송조회, 지연, 트러블슈팅]
fan_preset: middle_active
```

**입력**
```
주문한 지 10일 됐는데 아직 배송 중이에요. 운송장 번호로 조회해도 멈춰 있어요. 어떻게 해요?
```

**기대 출력 요약**
주문 상태 확인 → 배송사 직접 조회 안내 → 지연 사유 추측 금지 → 고객지원 에스컬레이션 → 환불/재발송 옵션 안내

**KPI 연동:** `KPI_RETENTION` — 구매 경험 만족도 유지

---

#### TC-I04 | 굿즈 환불 정책 및 등급별 차이 문의

```yaml
id: TC-I04
category: SHOP
priority: Medium
tags: [굿즈, 환불, 등급별정책, 교환]
fan_preset: casual_new
```

**입력**
```
굿즈 환불이 되나요? 언제까지 가능해요? 로열 회원이랑 차이가 있다고 들었어요
```

**기대 출력 요약**
등급별 환불 기간 명확 안내(Royal 14일 / Middle·Casual 7일) + 환불 불가 항목 + 환불 신청 경로

**KPI 연동:** `KPI_SHOP_CVR` — 구매 신뢰도 확보

---

## 10. KPI 연동 매핑

| PPT KPI | KPI ID | 연동 TC | 비즈니스 목표 | 비고 |
|---|---|---|---|---|
| 온보딩 이탈률 5%↓ | `KPI_ONBOARDING` | A01, A02, A03 | 이탈률 ≤ 5% | DID 온보딩 경험 직결 |
| 재방문율 80%+ | `KPI_RETENTION` | C01~C04, H03, I03 | 재방문율 ≥ 80% | 게이미피케이션 + 채팅 |
| 초대 전환율 30% | `KPI_REFERRAL` | C01, B03, F01 | 전환율 ≥ 30% | 바이럴 확산 핵심 |
| 구매 전환율 45% | `KPI_CVR` | C03, E01, I01~I04 | CVR ≥ 45% | 굿즈 + 배지 연계 |
| 모더레이션 신뢰도 | `KPI_MODERATION` | D01~D04, H04 | 커뮤니티 안전 유지 | 채팅 채널 포함 |
| LTV 5배 | `KPI_LTV` | B01, B04, E01, E02 | LTV × 5 | 등급 전환율 연동 |
| 팬 확장 5배 | `KPI_VIRAL` | B02, B03, C01 | 확장 속도 × 5 | 추천인 시스템 |
| 법적 컴플라이언스 | `KPI_LEGAL` | A04, D02, E03 | 위반 0건 | 개인정보보호법 |
| 글로벌 대응 | `KPI_GLOBAL` | G01, G02 | 다국어 품질 유지 | CAGR 7.3% 대응 |
| 채팅 채널 참여율 | `KPI_CHAT_ENGAGE` | H01~H04 | 등급별 참여율 향상 | DM·라이브 활성화 |
| 굿즈 구매 전환율 | `KPI_SHOP_CVR` | I01~I04, D03 | 등급별 전환율 향상 | 선구매 혜택 활용 |

---

## 11. 개발 로드맵 및 마일스톤

### 11.1 전체 타임라인

```
Phase 0: 기반 구축 (4주)
  Week 1-2  프로젝트 셋업, CI/CD, 인프라 구성
  Week 3-4  DID 인증 백엔드 + DB 스키마 구현

Phase 1: MVP (8주)
  Week 5-6  회원가입 / DID 인증 플로우 FE+BE
  Week 7-8  등급 시스템 + XP 엔진
  Week 9-10 채팅 채널 (등급별 권한 적용)
  Week 11-12 굿즈 샵 (상품 조회 + 결제)

Phase 2: 파일럿 (4주)
  Week 13   AI 어시스턴트 + 모더레이션 연동
  Week 14   하네스 엔지니어링 + 품질 검증
  Week 15   VIP 1,500명 초대 오픈
  Week 16   피드백 수집 + 개선

Phase 3: 전국 오픈 (4주)
  Week 17-18 성능 최적화 + 부하 테스트
  Week 19   보안 감사 + 취약점 점검
  Week 20   5,000명 신규 오픈
```

### 11.2 팀 구성

```yaml
Frontend (3명):
  - FE Lead: Next.js 아키텍처, 공통 컴포넌트
  - FE Dev:  채팅 UI, 굿즈 샵
  - Mobile:  React Native (iOS/Android)

Backend (3명):
  - BE Lead: NestJS 아키텍처, API 설계
  - BE Dev:  Auth/DID, 결제 서비스
  - BE Dev:  채팅 WebSocket, 데이터 분석

AI/MLOps (1명):
  - AI:      하네스 엔지니어링, 모더레이션, 챗봇

DevOps (1명):
  - Infra:   AWS EKS, CI/CD, 모니터링

Design (1명):
  - UI/UX:   디자인 시스템, 컴포넌트 가이드
```

### 11.3 CI/CD 파이프라인

```yaml
# .github/workflows/main.yml

name: CHON Platform CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run lint

  harness:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Run AI Harness
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npm run harness -- --output ./results
      - name: Check quality
        run: |
          NOT_MET=$(cat ./results/latest.json | jq '.summary.not_met')
          TOTAL=$(cat ./results/latest.json | jq '.summary.total')
          echo "전체 ${TOTAL}건 / 미충족 ${NOT_MET}건"
          cat ./results/latest.json | jq '[.improvement_targets[].id]'
      - uses: actions/upload-artifact@v4
        with:
          name: harness-report
          path: ./results/

  deploy:
    needs: [test, harness]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Build Docker image
        run: docker build -t chon-api:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
          docker push $ECR_URI/chon-api:${{ github.sha }}
      - name: Deploy to EKS
        run: |
          kubectl set image deployment/chon-api chon-api=$ECR_URI/chon-api:${{ github.sha }}
          kubectl rollout status deployment/chon-api
      - name: Post to Slack
        if: always()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_MESSAGE: "배포 완료: ${{ job.status }} | ${{ github.sha }}"
```

---

> **RELATIONSHIP IS IDENTITY**  
> 본 문서는 CHON 팬덤 플랫폼의 전체 기술 설계 스펙입니다 (POC).  
> 요구사항 · 프론트엔드 · 백엔드 · AI 하네스 · 데이터베이스가 하나의 문서로 통합됩니다.
>
> `CHON CONFIDENTIAL · POC v0.1 · 2026-04-15`
