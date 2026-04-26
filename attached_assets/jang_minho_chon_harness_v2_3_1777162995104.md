# 장민호 × CHON 팬덤 AI 하네스 엔지니어링 설계서

> **버전:** v2.0 · **작성일:** 2026-02-20 · **분류:** CHON CONFIDENTIAL  
> **목적:** 블록체인 DID 기반 팬덤 플랫폼 AI 품질 검증 체계 (바이브 코딩 구현 스펙)

---

## 목차

1. [시스템 아키텍처 개요](#1-시스템-아키텍처-개요)
2. [데이터 스키마 정의](#2-데이터-스키마-정의)
3. [하네스 파이프라인 구현 (7단계)](#3-하네스-파이프라인-구현-7단계)
4. [시스템 프롬프트 템플릿](#4-시스템-프롬프트-템플릿)
5. [LLM-as-Judge 평가 프롬프트](#5-llm-as-judge-평가-프롬프트)
6. [테스트 케이스 전체 명세 (29개)](#6-테스트-케이스-전체-명세-29개)
7. [KPI 연동 매핑 및 리포트 스펙](#7-kpi-연동-매핑-및-리포트-스펙)
  - 추가 카테고리: H (채팅 채널), I (굿즈 판매)
8. [파일럿 실행 계획 및 성공 기준](#8-파일럿-실행-계획-및-성공-기준)

---

## 1. 시스템 아키텍처 개요

### 1.1 플랫폼 컨텍스트 (PPT 분석 기반)

```
장민호 × CHON 팬덤 플랫폼
│
├── 신원 레이어      DID 기반 팬 인증 (18초 온보딩, 이탈률 5%↓)
├── 등급 레이어      Royal(500명/40%) · Middle(2,000명/35%) · Casual(10,000명/25%)
├── 참여 레이어      XP 시스템 · 랭킹 · 배지 · 촌수 네트워크 시각화
├── 데이터 레이어    Discovery → Analysis → Targeting → Measure
└── 수익 레이어      수수료 15%(절감 30억) · 2차 시장 로열티 +2억
```

### 1.2 하네스 엔지니어링 전체 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHON AI HARNESS v2.0                        │
│                                                                  │
│  TestCase JSON                                                   │
│       │                                                          │
│       ▼                                                          │
│  [Stage 1] 케이스 로더 ──→ 컨텍스트 주입기                        │
│       │                        │                                 │
│       │              팬 등급 / XP / 촌수 / 활동이력               │
│       │                        │                                 │
│       ▼                        ▼                                 │
│  [Stage 2] 전처리기 ──→ System Prompt 빌더                        │
│                                │                                 │
│                    카테고리별 프롬프트 분기                         │
│                                │                                 │
│                                ▼                                 │
│  [Stage 3] Anthropic API 호출 (claude-sonnet-4-20250514)         │
│                                │                                 │
│                         실제 AI 응답                              │
│                                │                                 │
│                                ▼                                 │
│  [Stage 4] Auto-Evaluator ──→ LLM-as-Judge + Rule-Based         │
│                                │                                 │
│                    기준항목별 품질 분석 및 개선 도출                │
│                                │                                 │
│                                ▼                                 │
│  [Stage 5] Scorer ──→ 품질 집계 → 충족/부분충족/미충족 분류       │
│                                │                                 │
│                                ▼                                 │
│  [Stage 6] KPI Mapper ──→ 비즈니스 KPI 영향도 계산               │
│                                │                                 │
│                                ▼                                 │
│  [Stage 7] Reporter ──→ 리포트 생성 → 실패 케이스 회귀 등록       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 기술 스택

```yaml
runtime: Node.js 20+ / Python 3.11+
ai_provider: Anthropic API (claude-sonnet-4-20250514)
evaluation: LLM-as-Judge + Rule-Based hybrid
storage: JSON flat-file (MVP) → PostgreSQL (프로덕션)
reporting: Markdown / JSON / HTML
test_runner: CLI (npm run harness) / GitHub Actions CI
```

---

## 2. 데이터 스키마 정의

### 2.1 TestCase 스키마

```typescript
interface TestCase {
  id: string;                    // "TC-A01"
  category: CategoryCode;        // "DID_AUTH" | "FAN_TIER" | ...
  priority: Priority;            // "Critical" | "High" | "Medium"
  title: string;
  tags: string[];                // ["DID", "온보딩", "법적컴플라이언스"]

  context: FanContext;           // 팬 컨텍스트 (동적 주입)
  input: string;                 // 사용자 입력 메시지
  expected_summary: string;      // 기대 출력 요약

  criteria: EvalCriterion[];     // 평가 기준 목록
  kpi_links: KPILink[];          // 연동 KPI 목록

  // 실행 후 채워지는 필드
  actual_output?: string;
  eval_result?: EvalResult;
}

interface FanContext {
  fan_tier: "Royal" | "Middle" | "Casual";
  chon_degree: 1 | 2 | 3;       // 아티스트와의 촌수
  xp_total: number;              // 누적 XP
  xp_to_next: number;            // 다음 등급까지 필요 XP
  concert_count: number;         // 공연 관람 횟수
  referral_count: number;        // 추천인 초대 수
  join_days: number;             // 가입 후 경과일
  recent_activity: ActivityLog[];
}

interface ActivityLog {
  type: "concert" | "streaming" | "sns_share" | "referral" | "badge_earn";
  xp_earned: number;
  timestamp: string;             // ISO 8601
}

interface EvalCriterion {
  id: string;                    // "C1", "C2", ...
  name: string;
  eval_type: "llm_judge" | "rule_based";
  rule?: string;                 // rule_based일 때 정규표현식
  judge_prompt?: string;         // llm_judge일 때 세부 판단 지시문
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

interface KPILink {
  kpi_id: string;                // "KPI_RETENTION" | "KPI_LTV" | ...
  kpi_name: string;
  impact_direction: "positive" | "negative";
  impact_description: string;
}

type CategoryCode =
  | "DID_AUTH"          // A: DID 인증
  | "FAN_TIER"          // B: 팬 등급 & 네트워크
  | "GAMIFICATION"      // C: 게이미피케이션
  | "MODERATION"        // D: 콘텐츠 모더레이션
  | "DATA_TARGETING"    // E: 데이터 타겟팅
  | "EVENT_GOODS"       // F: 이벤트 & 굿즈
  | "MULTILANG"         // G: 다국어 지원
  | "CHAT_CHANNEL"      // H: 팬-스타 채팅 채널
  | "SHOP";             // I: 굿즈 & 상품 판매

type Priority = "Critical" | "High" | "Medium";
```

### 2.2 HarnessConfig 스키마

```typescript
interface HarnessConfig {
  version: string;               // "2.0.0"
  model: string;                 // "claude-sonnet-4-20250514"
  max_tokens: number;            // 1024
  temperature: number;           // 0.1 (일관성 위해 낮게 설정)

  judge_model: string;           // "claude-sonnet-4-20250514"
  judge_temperature: number;     // 0.0

  retry_policy: RetryPolicy;
  output_dir: string;            // "./results"
}

interface RetryPolicy {
  max_retries: 3;
  backoff_ms: 1000;
  retry_on: ["rate_limit", "timeout", "api_error"];
}
```

### 2.3 HarnessReport 스키마

```typescript
interface HarnessReport {
  run_id: string;                // "run_20260220_001"
  timestamp: string;
  config: HarnessConfig;

  summary: {
    total: number;
    fully_met: number;           // 충족 케이스 수
    partial: number;             // 부분충족 케이스 수
    not_met: number;             // 미충족 케이스 수
  };

  category_breakdown: CategorySummary[];
  kpi_impact: KPIImpactSummary[];
  improvement_targets: TestCase[]; // 개선 필요 케이스
}
```

---

## 3. 하네스 파이프라인 구현 (7단계)

### Stage 1 — 테스트 케이스 로더 & 컨텍스트 주입

```typescript
// harness/stage1_loader.ts

import { TestCase, FanContext } from "./types";

export function loadTestCases(path: string): TestCase[] {
  const raw = JSON.parse(fs.readFileSync(path, "utf-8"));
  return raw.map(validateAndEnrich);
}

export function injectContext(tc: TestCase, fan: FanContext): string {
  return `
[팬 컨텍스트]
- 등급: ${fan.fan_tier} (${fan.chon_degree}촌)
- 누적 XP: ${fan.xp_total.toLocaleString()}점
- 다음 등급까지: ${fan.xp_to_next.toLocaleString()}XP 필요
- 공연 관람: ${fan.concert_count}회
- 친구 초대: ${fan.referral_count}명
- 가입 후: ${fan.join_days}일 경과
- 최근 활동: ${fan.recent_activity.slice(-3).map(a => a.type).join(", ")}

[사용자 입력]
${tc.input}
  `.trim();
}

// 기본 팬 컨텍스트 프리셋
export const FAN_PRESETS: Record<string, FanContext> = {
  royal_veteran: {
    fan_tier: "Royal", chon_degree: 1, xp_total: 12500, xp_to_next: 0,
    concert_count: 8, referral_count: 15, join_days: 730,
    recent_activity: [
      { type: "concert", xp_earned: 50, timestamp: "2026-02-18T19:00:00Z" },
      { type: "referral", xp_earned: 100, timestamp: "2026-02-15T10:00:00Z" },
    ],
  },
  middle_active: {
    fan_tier: "Middle", chon_degree: 2, xp_total: 3450, xp_to_next: 550,
    concert_count: 3, referral_count: 4, join_days: 180,
    recent_activity: [
      { type: "streaming", xp_earned: 30, timestamp: "2026-02-19T08:00:00Z" },
    ],
  },
  casual_new: {
    fan_tier: "Casual", chon_degree: 3, xp_total: 280, xp_to_next: 3720,
    concert_count: 0, referral_count: 0, join_days: 7,
    recent_activity: [],
  },
};
```

### Stage 2 — 입력 전처리 & 시스템 프롬프트 빌더

```typescript
// harness/stage2_preprocessor.ts

const FANDOM_GLOSSARY: Record<string, string> = {
  "스밍": "스트리밍(음원 스트리밍 집중 응원)",
  "총공": "총공격(팬덤 전체 동시 스트리밍)",
  "직캠": "직접 촬영한 팬캠 영상",
  "컴백": "신보 발매 또는 방송 활동 재개",
  "뮤뱅": "KBS 뮤직뱅크",
  "인기가요": "SBS 인기가요",
  "위버스": "Weverse (공식 팬 커뮤니티 앱)",
  "팬싸": "팬 사인회",
};

export function preprocessInput(raw: string): string {
  let processed = raw.trim();
  // 비속어 마스킹 (모더레이션 케이스 정규화)
  processed = processed.replace(/[ㅅㅂ]{2,}/g, "[비속어]");
  return processed;
}

export function buildSystemPrompt(category: CategoryCode, context: string): string {
  const base = BASE_SYSTEM_PROMPT;
  const categoryAddendum = CATEGORY_PROMPTS[category];
  return `${base}\n\n${categoryAddendum}\n\n${context}`;
}
```

### Stage 3 — Anthropic API 호출

```typescript
// harness/stage3_inference.ts

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runInference(
  systemPrompt: string,
  userInput: string,
  config: HarnessConfig
): Promise<string> {
  const response = await client.messages.create({
    model: config.model,                // "claude-sonnet-4-20250514"
    max_tokens: config.max_tokens,      // 1024
    temperature: config.temperature,    // 0.1
    system: systemPrompt,
    messages: [{ role: "user", content: userInput }],
  });

  const textContent = response.content.find(b => b.type === "text");
  if (!textContent) throw new Error("No text content in response");
  return textContent.text;
}
```

### Stage 4 — 자동 평가기 (Hybrid)

```typescript
// harness/stage4_evaluator.ts

export async function evaluateCriteria(
  tc: TestCase,
  actual_output: string
): Promise<CriterionScore[]> {
  const scores: CriterionScore[] = [];

  for (const criterion of tc.criteria) {
    if (criterion.eval_type === "rule_based") {
      scores.push(evaluateByRule(criterion, actual_output));
    } else if (criterion.eval_type === "llm_judge") {
      scores.push(await evaluateByLLM(criterion, tc, actual_output));
    } else {
      // hybrid: rule_based 먼저, 통과 시 llm_judge로 확인
      const ruleScore = evaluateByRule(criterion, actual_output);
      if (ruleScore.score === 0) {
        scores.push(ruleScore);
      } else {
        scores.push(await evaluateByLLM(criterion, tc, actual_output));
      }
    }
  }
  return scores;
}

// Rule-Based 평가 (정규표현식 기반)
function evaluateByRule(
  criterion: EvalCriterion,
  output: string
): CriterionScore {
  if (!criterion.rule) throw new Error("rule 필드 없음");
  const regex = new RegExp(criterion.rule, "i");
  const pass = regex.test(output);
  return {
    criterion_id: criterion.id,
    score: pass ? 1 : 0,
    weighted_score: pass ? criterion.weight : 0,
    reason: pass ? "규칙 패턴 매칭 성공" : "규칙 패턴 미매칭",
  };
}

// LLM-as-Judge 평가
async function evaluateByLLM(
  criterion: EvalCriterion,
  tc: TestCase,
  actual_output: string
): Promise<CriterionScore> {
  const judgePrompt = buildJudgePrompt(criterion, tc, actual_output);
  const judgeResponse = await client.messages.create({
    model: config.judge_model,
    max_tokens: 512,
    temperature: 0.0,
    messages: [{ role: "user", content: judgePrompt }],
  });

  const result = parseJudgeResponse(judgeResponse.content[0].text);
  return {
    criterion_id: criterion.id,
    quality: result.quality,
    reason: result.reason,
    suggestion: result.suggestion ?? null,
  };
}
```

### Stage 5 — 품질 집계 & 개선 도출

```typescript
// harness/stage5_scorer.ts

export function computeQuality(evals: CriterionEval[]): EvalResult {
  const counts = { 충족: 0, 부분충족: 0, 미충족: 0 };
  evals.forEach(e => counts[e.quality]++);

  const overall_quality: EvalResult["overall_quality"] =
    counts.미충족 > 0 ? "미충족" :
    counts.부분충족 > 0 ? "부분충족" : "충족";

  const improvement_suggestions = evals
    .filter(e => e.quality !== "충족" && e.suggestion)
    .map(e => `[${e.criterion_id}] ${e.suggestion}`);

  return {
    criteria_evals: evals,
    overall_quality,
    improvement_suggestions,
    judge_reasoning: evals.map(e => e.reason).join(" | "),
  };
}
```

### Stage 6 — KPI 연동 검증

```typescript
// harness/stage6_kpi_mapper.ts

const KPI_DEFINITIONS: Record<string, KPIDef> = {
  KPI_ONBOARDING:   { name: "온보딩 이탈률", target: "≤ 5%" },
  KPI_RETENTION:    { name: "재방문율",       target: "≥ 80%" },
  KPI_REFERRAL:     { name: "초대 전환율",    target: "≥ 30%" },
  KPI_CVR:          { name: "구매 전환율",    target: "≥ 45%" },
  KPI_MODERATION:   { name: "모더레이션 신뢰도", target: "≥ 95%" },
  KPI_LTV:          { name: "LTV 증가",       target: "5×" },
  KPI_VIRAL:        { name: "팬 확장 속도",   target: "5×" },
  KPI_LEGAL:        { name: "법적 컴플라이언스", target: "100%" },
  KPI_GLOBAL:       { name: "글로벌 대응",    target: "≥ 80%" },
};

export function computeKPIImpact(
  results: TestCase[],
  kpiDefinitions = KPI_DEFINITIONS
): KPIImpactSummary[] {
  return Object.entries(kpiDefinitions).map(([kpiId, def]) => {
    const linkedCases = results.filter(tc =>
      tc.kpi_links.some(l => l.kpi_id === kpiId)
    );
    const metRate = linkedCases.length > 0
      ? linkedCases.filter(tc => tc.eval_result?.overall_quality === "충족").length / linkedCases.length
      : null;

    return {
      kpi_id: kpiId,
      kpi_name: def.name,
      target: def.target,
      met_rate: metRate,
      linked_case_ids: linkedCases.map(tc => tc.id),
    };
  });
}
```

### Stage 7 — 리포트 생성 & 회귀 등록

```typescript
// harness/stage7_reporter.ts

export function generateReport(results: TestCase[], config: HarnessConfig): HarnessReport {
  const fully_met = results.filter(tc => tc.eval_result?.overall_quality === "충족").length;
  const partial   = results.filter(tc => tc.eval_result?.overall_quality === "부분충족").length;
  const not_met   = results.filter(tc => tc.eval_result?.overall_quality === "미충족").length;

  return {
    run_id: `run_${new Date().toISOString().slice(0,10).replace(/-/g,"")}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    config,
    summary: { total: results.length, fully_met, partial, not_met },
    category_breakdown: computeCategoryBreakdown(results),
    kpi_impact: computeKPIImpact(results),
    improvement_targets: results.filter(
      tc => tc.eval_result?.overall_quality !== "충족"
    ),
  };
}

export function saveReport(report: HarnessReport, outputDir: string): void {
  const path = `${outputDir}/report_${report.run_id}.json`;
  fs.writeFileSync(path, JSON.stringify(report, null, 2));
  console.log(`📋 Report saved: ${path}`);
}
```

---

## 4. 시스템 프롬프트 템플릿

### 4.1 베이스 시스템 프롬프트

```
[BASE_SYSTEM_PROMPT]

당신은 장민호 팬덤 커뮤니티 플랫폼 "CHON"의 AI 어시스턴트입니다.

## 핵심 역할
- 팬들의 질문에 정확하고 친절하게 답변합니다
- 공식 확인된 정보만 제공하며, 미확인 정보는 명확히 구분합니다
- CHON 플랫폼의 DID 인증, 등급 시스템, 게이미피케이션 정책을 정확히 안내합니다

## 절대 금지 사항
- 미확인 정보를 사실처럼 추측하여 전달하는 행위
- 아티스트의 사생활 정보(주소, 연락처 등)를 언급하는 행위
- 비공식 구매처 또는 암표 거래를 안내하거나 묵인하는 행위
- 혐오, 비하, 차별적 표현을 포함하는 응답 생성

## 응답 원칙
- 확인된 정보: 자신감 있게 안내
- 미확인 정보: "공식 채널에서 확인해 주세요"로 안내
- 정책 위반 콘텐츠: 즉시 분류 및 처리 결과 반환
- 응답 언어: 팬이 사용한 언어로 응답 (한국어/영어/일본어)

## CHON 플랫폼 핵심 정보
- DID 인증: 18초 완료, 5단계 프로세스, 개인정보 비노출 원칙
- 팬 등급: Royal(공연 5회+, 500명), Middle(2,000명), Casual(신규)
- XP 시스템: 친구초대(+100), 콘서트(+50), 음원구매(+30), SNS공유(+10)
- VIP 혜택 임계값: 9,000점 이상(백스테이지), 8,000점 이상(선예매권)
- 공식 구매처: 위버스샵, 케이팝마트
- 고객지원: support.chon.fans
```

### 4.2 카테고리별 어덴덤 프롬프트

```
[DID_AUTH_ADDENDUM]
## DID 인증 전문 모드
- 5단계 인증 플로우를 정확히 숙지하세요:
  1단계(5초): 가입 신청 및 약관 동의 → 기기 정보 수집
  2단계(10초): 본인 확인 (통신사 또는 카드사 인증) → 신원 데이터 검증
  3단계(3초): DID 지갑 생성 승인 → 블록체인 DID 발급
  4단계(즉시): 추천인 입력(선택) → 네트워크 촌수 계산
  5단계(즉시): 프로필 설정 완료 → 웰컴 배지 지급
- 개인정보 비노출 원칙: 블록체인 DID는 실명 정보를 저장하지 않음
- 기존 팬클럽 대비: 18초 vs 5분+, 이탈률 5% vs 45%

[GAMIFICATION_ADDENDUM]
## 게이미피케이션 전문 모드
- XP는 영구 누적되며 삭제되지 않습니다
- 주간 랭킹 점수는 매주 월요일 0시 초기화 (XP 레벨은 유지)
- 레벨 구간: Casual(Lv.1-10), Middle(Lv.11-50), Royal(Lv.51+)
- 배지는 희소성 기반 한정판으로, 기간 만료 후 재발급 없음

[MODERATION_ADDENDUM]
## 콘텐츠 모더레이션 모드
응답 형식 (JSON):
{
  "action": "hide" | "delete" | "pending_review" | "allow",
  "category": "hate_speech" | "privacy_violation" | "scalping" | "rumor" | "clean",
  "severity": "critical" | "high" | "medium" | "low",
  "confidence": 0.0-1.0,
  "notification": { "admin_alert": boolean, "user_warning": boolean },
  "reason": "분류 근거",
  "guideline_ref": "정책 조항 번호"
}

[DATA_TARGETING_ADDENDUM]
## 데이터 타겟팅 전문 모드
- 팬 스코어링 기준: 활동 점수 기반 누적 산출
- VIP 임계값: 9,000점+ → 백스테이지 초대
- Active 임계값: 8,000점+ → 선예매권
- 개인정보 삭제 요청 시: 블록체인 기록은 완전 삭제 불가, 개인식별 정보만 분리 처리 가능
- 관련 법령: 개인정보보호법 제36조(개인정보의 정정·삭제)

[MULTILANG_ADDENDUM]
## 다국어 지원 모드
- 번역 시 팬덤 고유 용어는 원어 유지: Comeback, Showcase, Weverse, Fancafe
- 원문과 번역문을 함께 제공 (형식: "번역: ... | 원문: ...")
- 일본어 번역 시 경어(です・ます) 사용
- 미확인 일정은 번역하더라도 "未確認 / 공식 채널 확인 필요" 명기
```

---

## 5. LLM-as-Judge 평가 프롬프트

### 5.1 표준 Judge 프롬프트 템플릿

````
[JUDGE_SYSTEM_PROMPT]

당신은 AI 응답 품질 평가 전문가입니다.
팬덤 플랫폼 AI 어시스턴트의 응답을 주어진 기준에 따라 엄격하고 공정하게 평가합니다.

평가 원칙:
1. 기준 항목 하나만 평가합니다 (다른 항목은 무시)
2. 증거 기반으로 판단합니다 (응답 내 실제 문장을 근거로 제시)
3. 개선 가능한 부분을 구체적으로 제안합니다
4. 분석 근거는 1-2문장으로 간결하게 작성합니다

반드시 아래 JSON 형식으로만 응답합니다:
```json
{
  "quality": "충족" | "부분충족" | "미충족",
  "confidence": 0.0-1.0,
  "reason": "분석 근거 (1-2문장)",
  "evidence": "응답에서 발췌한 근거 문장 (없으면 null)",
  "suggestion": "개선 제안 (없으면 null)"
}
```
````

### 5.2 기준별 Judge 프롬프트 예시

```
[TC-A01 / C1 / 정보 정확성 Judge Prompt]

다음 AI 응답이 DID 인증 5단계 여정을 정확하게 안내했는지 평가하세요.

검증 포인트:
- 5단계 여정 중 언급된 단계 수 및 정확성 확인
  1단계: 가입 신청 / 약관 동의
  2단계: 본인 확인 (통신사/카드사 인증)
  3단계: DID 지갑 생성
  4단계: 추천인 입력 (선택)
  5단계: 프로필 설정 완료
- 18초 소요 시간 언급 여부
- 잘못된 정보 또는 단계 순서 오류 여부

사용자 입력: {{user_input}}
AI 응답: {{actual_output}}
```

```
[TC-D01 / C2 / 오탐 방지 Judge Prompt]

다음 AI 응답이 콘텐츠를 과도하게 또는 부족하게 필터링했는지 평가하세요.

검증 포인트:
- 비하/혐오 표현 분류 정확성 및 신뢰도 수준
- 유사하지만 정상적인 비판 의견과의 구별 능력
- 오탐(False Positive) 발생 여부

입력 콘텐츠: {{user_input}}
AI 응답 (JSON): {{actual_output}}
```

---

## 6. 테스트 케이스 전체 명세 (29개)

---

### 카테고리 A — DID 인증

---

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

🛡️ 개인정보는 블록체인에 암호화된 DID 형태로 저장되며, 이름·주민번호 등 실명 정보는 서버에 저장되지 않아요.

CHON 공식 앱: chon.fans/download
```

**KPI 연동**
```yaml
kpi_links:
  - kpi_id: KPI_ONBOARDING
    impact_direction: positive
    impact_description: "온보딩 이탈률 5% 이하 달성을 위한 첫 접점 품질"
```

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
단계별 재시도 안내 → 기기 환경 확인 요청 → 자가 해결 불가 시 고객지원 에스컬레이션. 원인 추측 절대 금지.

**예시 이상적 응답**
```
불편을 드려 죄송해요! 몇 가지 방법으로 해결해 보세요.

🔄 재시도 단계
1. 앱을 완전히 종료 후 재실행
2. 네트워크 연결 상태 확인 (Wi-Fi 전환 권장)
3. 앱 버전 최신 여부 확인 (설정 → 앱 업데이트)
4. 기기 재시작 후 다시 시도

위 방법으로도 해결되지 않으면 고객지원으로 연락해 주세요.
📧 support.chon.fans | 운영시간: 평일 10:00-18:00
```

**KPI 연동**
```yaml
kpi_links:
  - kpi_id: KPI_ONBOARDING
    impact_direction: positive
    impact_description: "오류 대응 품질 → 온보딩 완료율 직결"
```

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

**예시 이상적 응답**
```
기존 팬카페와 CHON의 가장 큰 차이를 정리해 드릴게요!

📊 가입 경험 비교
               기존 팬카페   |   CHON
가입 시간       5분 이상     |   18초
이탈률          45%         |   5%
인증 방식       수동 승인    |   블록체인 상호 인증
데이터 소유     플랫폼 소유  |   팬 본인 소유

✨ CHON만의 특별한 기능
• 장민호와 나 사이의 촌수 시각화 ("나는 1촌!")
• XP 기반 레벨업 및 보상 시스템
• 팬 네트워크 맵 (12,500개 연결 노드)

물론 기존 팬카페도 좋은 공간이에요! CHON은 더 깊은 관계를 원하는 분들을 위한 선택지입니다 :)
```

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

---

### 카테고리 B — 팬 등급 & 네트워크

---

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
로열층 조건(공연 5회+, 상위 500명) + 현재 상태(3회) 대비 갭 → 남은 조건 2가지 + 추가 달성 방법(친구 초대 XP 등)

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
나와 장민호는 몇 촌이라는 게 무슨 뜻이에요? 어떻게 계산돼요?
```

**기대 출력 요약**
촌수 = 추천인 연결 경로 수 + 1촌(직접 연결=로열) · 2촌(로열이 초대=미들) · 3촌(미들이 초대=캐주얼) + 앱 내 네트워크 맵 시각화 기능 안내

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

---

### 카테고리 C — 게이미피케이션

---

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

**XP 정책 참조 테이블**

| 활동 | XP | 비고 |
|---|---|---|
| 친구 초대 | +100 XP | 초대받은 친구 가입 완료 시 지급 |
| 콘서트 관람 | +50 XP | 공식 앱 체크인 필수 |
| 음원 구매 | +30 XP | 공식 플랫폼 구매 건당 |
| SNS 공유 | +10 XP | 1일 최대 3회 |

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

**핵심 정책 (응답에 반드시 반영)**
```
주간 랭킹 점수: 매주 월요일 0시 초기화 (경쟁 지표)
누적 XP 레벨:  영구 보존, 절대 삭제되지 않음 (자산)
```

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

---

### 카테고리 D — 콘텐츠 모더레이션

> ⚠️ **Critical 카테고리**: 오탐(False Positive)·미탐(False Negative) 모두 즉시 프롬프트 개선 대상으로 등록.

---

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
  "notification": {
    "admin_alert": true,
    "user_warning": true
  },
  "reason": "아티스트 또는 팬덤 구성원을 직접적으로 비하하는 표현 포함",
  "guideline_ref": "Section 3.1 - 비하/혐오 표현 금지"
}
```

**모니터링 포인트:** C3(오탐) 미충족 시 즉시 프롬프트 개선 및 재검토

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
'장민호 집 주소 알아냈어요 공유할게요 ㄷㄷ'
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
'장민호 활동 중단 확정됐대요 소속사에서 발표 예정이래요 (출처 미상)'
```

---

### 카테고리 E — 데이터 타겟팅 & 분석

---

#### TC-E01 | 팬 스코어링 조회 및 VIP 갭 분석

```yaml
id: TC-E01
category: DATA_TARGETING
priority: High
tags: [스코어링, VIP갭, LTV, 타겟팅]
fan_preset: middle_active   # xp_total: 3450, xp_to_next: 550
```

**입력**
```
제 팬 점수가 얼마인지 알고 싶어요. VIP 전환하려면 얼마나 더 필요해요?
```

**컨텍스트 주입 예시 (middle_active 기준)**
```
현재 팬 스코어: 3,450점
VIP 임계값: 9,000점
갭: 5,550점 부족
달성 예상 시나리오:
  - 친구 초대 위주: 55.5회 초대 (55,500XP ÷ 100)
  - 콘서트 위주: 111회 관람 (비현실적)
  - 혼합 전략: 친구 30명 초대 + 콘서트 5회 + 음원 25회 = 4,550 XP
```

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

---

#### TC-E03 | 개인 활동 데이터 삭제 요청 (개인정보 주권)

```yaml
id: TC-E03
category: DATA_TARGETING
priority: Critical
tags: [개인정보, 데이터삭제, GDPR, 블록체인]
fan_preset: royal_veteran
```

**입력**
```
제 활동 데이터 모두 삭제하고 싶어요. DID 지갑도 없애고 싶어요
```

**핵심 정책 참조**
```
개인정보보호법 제36조: 정보주체는 개인정보 삭제를 요구할 수 있음
블록체인 특성: 트랜잭션 이력은 불변(Immutable) — 완전 삭제 불가
처리 방식: 개인식별 정보(이름·연락처)는 분리 삭제 가능
          DID 지갑 주소 자체는 블록체인에 영구 기록됨 (익명화 처리)
```

---

### 카테고리 F — 이벤트 & 굿즈

---

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

---

### 카테고리 G — 다국어 지원

---

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

**기대 이상적 출력**
```
Translation: "The comeback showcase schedule has been changed. Please check Weverse for details."

원문: 컴백 쇼케이스 일정이 변경되었습니다. 위버스에서 확인해 주세요.

📝 Note: "Comeback" refers to a new album release or return to broadcast activities.
         "Weverse" is the official fan community platform.
```

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
장민호の 次のコンサートはいつですか？チケットはどこで買えますか？
```

**기대 이상적 출력**
```
장민호さんの次のコンサートについてですが、現時点では公式発表はございません。
最新情報は公式チャンネルでご確認ください。

チケットの購入は、公式サイト(chon.fans)またはWeverse Shopをご利用ください。
非公式サイトでのご購入はトラブルの原因となることがありますので、ご注意ください。

📌 원문 안내: 현재 다음 콘서트 일정은 공식 발표되지 않았습니다.
```

---

### 카테고리 H — 팬-스타 채팅 채널

> 회원 등급(Royal · Middle · Casual)에 따라 채널 접근 권한, 메시지 전송 횟수, 스타 답장 수신 자격이 차등 적용됩니다.

#### 채널 등급별 권한 정책

```
┌─────────────────────────────────────────────────────────────────┐
│              CHON 채팅 채널 등급별 권한 매트릭스                   │
├──────────────────┬──────────────┬──────────────┬───────────────┤
│ 기능             │ Royal (1촌)  │ Middle (2촌) │ Casual (3촌)  │
├──────────────────┼──────────────┼──────────────┼───────────────┤
│ 채널 입장        │ 전체 채널    │ 공개 채널    │ 공개 채널     │
│ 스타 DM 채널     │ ✅ 접근 가능 │ ❌ 잠금      │ ❌ 잠금       │
│ 일일 메시지 한도 │ 무제한       │ 50건/일      │ 10건/일       │
│ 스타 답장 수신   │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
│ 미디어 첨부      │ ✅ 가능      │ ✅ 가능      │ ❌ 텍스트만   │
│ 라이브 채팅 참여 │ 우선 입장    │ 일반 입장    │ 대기열 적용   │
│ 채팅 방 개설     │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
│ 메시지 고정(핀)  │ ✅ 가능      │ ❌ 불가      │ ❌ 불가       │
└──────────────────┴──────────────┴──────────────┴───────────────┘
```

#### 채팅 채널 스키마

```typescript
interface ChatChannelContext extends FanContext {
  channel_type: "star_dm" | "royal_lounge" | "open_community" | "live_chat";
  daily_msg_count: number;       // 오늘 전송한 메시지 수
  daily_msg_limit: number;       // 등급별 일일 한도
  has_star_reply: boolean;       // 스타 답장 수신 자격
  live_queue_position?: number;  // 라이브 채팅 대기 순서
}

interface ChatMessage {
  sender_id: string;
  tier: "Royal" | "Middle" | "Casual" | "Star";
  content: string;
  media_attached: boolean;
  timestamp: string;
  is_pinned: boolean;
}

// 채팅 제한 정책 상수
const CHAT_POLICY = {
  Royal:  { daily_limit: Infinity, dm_access: true,  media: true,  live_priority: 1 },
  Middle: { daily_limit: 50,       dm_access: false, media: true,  live_priority: 2 },
  Casual: { daily_limit: 10,       dm_access: false, media: false, live_priority: 3 },
};
```

---

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
장민호 님한테 직접 메시지 보내고 싶어요. DM 채널 어디 있어요?
```

**기대 출력 요약**
Casual 등급은 스타 DM 채널 접근 불가 명확 안내 → 접근 가능 등급(Royal) 설명 → 등급 상승 방법 유도 → 대안 채널(공개 커뮤니티) 안내. 거부감 없는 어조 유지.

**예시 이상적 응답**
```
장민호 님과의 직접 DM 채널은 Royal 등급(1촌) 팬에게만 개방돼요! 🌙

현재 등급: Casual (3촌)
DM 접근 등급: Royal (1촌) 이상

✨ Royal 등급으로 올라가려면?
• 콘서트 5회 이상 관람
• 친구 초대 XP 적립으로 빠르게 레벨업!
  (친구 1명 초대 = +100 XP — 가장 빠른 방법)

지금 당장은 공개 커뮤니티 채널에서 응원 메시지를 남겨보세요 💬
채팅 채널 → [오픈 커뮤니티] 탭에서 확인하실 수 있어요.
```

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
메시지를 보내려는데 "오늘 전송 한도 초과"라고 나와요. 왜 이래요? 유료 결제하면 더 보낼 수 있나요?
```

**기대 출력 요약**
Middle 등급 일일 50건 한도 설명 → 내일 자정 초기화 안내 → Royal 업그레이드 시 무제한 전환 안내 → 유료 결제 연장 여부 정확 안내(없으면 없다고)

**예시 이상적 응답**
```
Middle 등급은 하루 50건의 메시지를 보낼 수 있어요.
오늘 한도를 모두 사용하셨네요! 내일 자정(00:00)에 자동으로 초기화돼요 🔄

💡 한도 없이 메시지를 보내고 싶다면?
Royal 등급으로 올라가시면 메시지 한도가 무제한으로 전환돼요.

❌ 유료 결제로 한도 연장: 현재 지원하지 않습니다.
등급 업그레이드만이 한도를 늘리는 방법이에요.

Royal 달성 방법: 공연 5회+ 또는 XP 9,000점 이상
현재 XP: 3,450점 (남은 XP: 5,550점)
```

---

#### TC-H03 | Royal 팬의 스타 답장 수신 확인

```yaml
id: TC-H03
category: CHAT_CHANNEL
priority: High
tags: [채팅, 스타답장, Royal, DM]
fan_preset: royal_veteran
```

**입력**
```
장민호 님이 제 DM에 답장을 해주셨는데 알림이 안 와요. 어디서 확인하나요?
```

**기대 출력 요약**
Royal 팬 스타 답장 수신 자격 확인 → 알림 설정 경로 안내 → DM 채널 내 답장 확인 위치 → 알림 미수신 시 설정 점검 단계 제공

**예시 이상적 응답**
```
Royal 등급이시라 장민호 님의 답장을 받으실 수 있어요! 정말 특별한 순간이네요 🌙

📬 답장 확인 방법
1. 채팅 채널 → [스타 DM] 탭 진입
2. 우측 상단 알림 벨(🔔) 확인
3. 대화 목록에서 장민호 님 채팅방 선택

🔔 알림이 안 오는 경우 체크
• 앱 알림 권한 설정 확인 (기기 설정 → CHON → 알림 허용)
• 앱 내 알림 설정 → DM 답장 알림 ON 여부 확인
• 앱 최신 버전 여부 확인

그래도 안 된다면 support.chon.fans 로 문의해 주세요!
```

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

**기대 출력 요약**
신고 접수 확인 → 자동 임시 채팅 제한(뮤트) 적용 → 운영자 검토 대기열 등록 → 신고자 보호 조치 안내 → 처리 결과 알림 예정 안내

**예시 이상적 응답**
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
  "reporter_message": "신고가 접수되었습니다. 해당 사용자는 검토 완료 전까지 채팅이 제한됩니다. 처리 결과를 알림으로 안내해 드릴게요.",
  "guideline_ref": "Section 4.2 - 채팅 채널 커뮤니티 수칙"
}
```

---

### 카테고리 I — 굿즈 & 상품 판매

> 등급별 선구매 우선권, 한정판 선점, 멤버십 할인 혜택이 차등 적용됩니다.

#### 굿즈 판매 등급별 혜택 정책

```
┌─────────────────────────────────────────────────────────────────┐
│              CHON 굿즈 샵 등급별 혜택 매트릭스                    │
├──────────────────┬──────────────┬──────────────┬───────────────┤
│ 기능             │ Royal (1촌)  │ Middle (2촌) │ Casual (3촌)  │
├──────────────────┼──────────────┼──────────────┼───────────────┤
│ 한정판 선구매    │ D-48시간 전  │ D-24시간 전  │ 일반 판매일   │
│ 멤버십 할인      │ 15%          │ 10%          │ 5%            │
│ 포토카드 랜덤팩  │ 선택 가능    │ 랜덤 지급    │ 랜덤 지급     │
│ 친필 사인 응모   │ 자동 응모    │ 별도 응모    │ 응모 불가     │
│ 무료 배송        │ 상시 무료    │ 5만원 이상   │ 7만원 이상    │
│ 교환/환불 기간   │ 14일         │ 7일          │ 7일           │
│ 번들 패키지 구매 │ ✅ 전체      │ ✅ 일부      │ ❌ 불가       │
└──────────────────┴──────────────┴──────────────┴───────────────┘
```

#### 굿즈 샵 스키마

```typescript
interface ShopContext extends FanContext {
  cart_items: CartItem[];
  order_history: Order[];
  membership_discount: number;    // 등급별 할인율 (%)
  early_access_hours: number;     // 한정판 선구매 시간 (시간)
}

interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  is_limited: boolean;
  stock_remaining: number;
}

interface Order {
  order_id: string;
  status: "pending" | "paid" | "shipping" | "delivered" | "cancelled" | "refund_requested";
  total_amount: number;
  tracking_number?: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  category: "photobook" | "album" | "md_goods" | "signed" | "bundle" | "digital";
  price: number;
  is_limited: boolean;
  early_access: {
    Royal: string;   // ISO timestamp
    Middle: string;
    Casual: string;
  };
  stock: Record<string, number>;  // 등급별 재고
}

// 결제 처리 응답
interface PaymentResult {
  order_id: string;
  status: "success" | "failed" | "pending";
  payment_method: string;
  applied_discount: number;       // 실제 적용된 할인율
  final_amount: number;
  estimated_delivery: string;
}
```

---

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
Casual 등급 한정판 선구매 불가 → 일반 판매일 안내 → 등급별 선구매 시간 차이 설명(D-48h Royal / D-24h Middle / 일반일 Casual) → 5% 할인 적용 확인 → 등급 업그레이드 유도

**예시 이상적 응답**
```
한정판 포토북의 선구매 기간 중이에요! 등급에 따라 구매 시작 시각이 달라져요.

📅 등급별 구매 시작 시각
• Royal (1촌): 판매 D-48시간 전 (지금 구매 가능!)
• Middle (2촌): 판매 D-24시간 전
• Casual (3촌): 2026-03-10 10:00 (일반 판매일)

현재 등급 Casual이라 일반 판매일에 구매하실 수 있어요.
✅ 5% 멤버십 할인은 자동 적용됩니다!

⏰ 일반 판매까지 남은 시간: 47시간 22분
알림 받기: [판매 알림 설정] 버튼을 눌러두시면 판매 시작 시 바로 알려드려요.

빠르게 구매하고 싶다면? → Middle 등급 달성 시 D-24시간 선구매 가능해요.
```

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
Royal 등급 포토카드 선택 구매 가능 확인 → 선택 구매 경로 안내 → 15% 할인 자동 적용 확인 → 재고 현황 안내

**예시 이상적 응답**
```
Royal 등급이라 포토카드를 원하는 것으로 직접 선택하실 수 있어요! 🎉

🛒 선택 구매 경로
CHON 샵 → 포토카드 → [멤버별 선택 구매] 탭

💳 Royal 혜택 자동 적용
• 15% 멤버십 할인
• 무료 배송 (상시)
• 교환/환불 14일 이내 가능

📦 현재 재고 현황 (Royal 전용)
• 봄 화보 ver.A: 잔여 23장
• 봄 화보 ver.B: 잔여 8장 ⚠️ 품절 임박
• 콘서트 비하인드: 잔여 41장

원하는 버전을 선택하신 후 장바구니에 담아주세요!
```

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
주문 상태 확인 → 배송사 직접 조회 경로 안내 → 지연 사유 추측 없이 안내 → 고객지원 에스컬레이션 경로 제공 → 환불/재발송 옵션 안내

**예시 이상적 응답**
```
불편을 드려 정말 죄송해요. 10일 배송 지연은 정상 범위를 초과한 상황이에요.

📦 지금 당장 확인해 보세요
1. CHON 앱 → 마이페이지 → 주문 내역 → 해당 주문 클릭
2. 운송장 번호 확인 후 택배사 앱에서 직접 조회
   (CJ대한통운 / 한진 / 롯데 등)

🚨 배송 추적이 멈춰 있다면 — 고객지원으로 연락해 주세요
📧 support.chon.fans | 평일 10:00~18:00
문의 시 주문번호와 운송장 번호를 함께 알려주시면 빠르게 처리해 드려요.

처리 옵션 (확인 후 안내드려요):
• 재발송 처리
• 전액 환불 (Middle 등급 환불 기간: 수령 후 7일)
```

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
등급별 환불 기간 명확 안내(Royal 14일 / Middle·Casual 7일) → 환불 불가 항목(개봉 한정판, 디지털 상품) → 환불 신청 경로 → 정책 오해 없는 명확한 답변

**예시 이상적 응답**
```
네, 환불 가능해요! 등급별로 환불 가능 기간이 달라요.

📋 등급별 환불 기간
• Royal: 수령 후 14일 이내
• Middle / Casual: 수령 후 7일 이내
  (현재 등급: Casual → 수령 후 7일 이내 가능)

❌ 환불 불가 항목
• 개봉된 한정판 포토카드 및 시리얼 상품
• 디지털 콘텐츠 (다운로드 완료 상품)
• 친필 사인 상품 (단, 하자 있을 시 가능)

📦 환불 신청 방법
CHON 앱 → 마이페이지 → 주문 내역 → [환불 신청] 버튼
또는 support.chon.fans 에서 주문번호 지참 후 문의

💡 Royal 등급 업그레이드 시 환불 기간이 14일로 늘어나요!
```

---

## 7. KPI 연동 매핑 및 리포트 스펙

### 7.1 KPI-하네스 연동 매핑

| PPT KPI | KPI ID | 연동 TC | 비즈니스 목표 | 비고 |
|---|---|---|---|---|
| 온보딩 이탈률 5%↓ | `KPI_ONBOARDING` | A01, A02, A03 | 이탈률 ≤ 5% | DID 온보딩 경험 직결 |
| 재방문율 80%+ | `KPI_RETENTION` | C01, C02, C03, C04 | 재방문율 ≥ 80% | 게이미피케이션 몰입도 |
| 초대 전환율 30% | `KPI_REFERRAL` | C01, F01 | 전환율 ≥ 30% | 바이럴 확산 핵심 |
| 구매 전환율 45% | `KPI_CVR` | C03, E01, I01~I04 | CVR ≥ 45% | 굿즈 + 배지 연계 |
| 모더레이션 신뢰도 | `KPI_MODERATION` | D01~D04, H04 | 커뮤니티 안전 유지 | 채팅 채널 포함 |
| LTV 5배 | `KPI_LTV` | B01, E01, E02 | LTV × 5 | 등급 전환율 연동 |
| 팬 확장 5배 | `KPI_VIRAL` | C01, B02 | 확장 속도 × 5 | 추천인 시스템 |
| 법적 컴플라이언스 | `KPI_LEGAL` | A04, E03 | 위반 0건 | 개인정보보호법 |
| 글로벌 대응 | `KPI_GLOBAL` | G01, G02 | 다국어 품질 유지 | CAGR 7.3% 대응 |
| 채팅 채널 참여율 | `KPI_CHAT_ENGAGE` | H01~H04 | 등급별 참여율 향상 | DM·라이브 활성화 |
| 굿즈 구매 전환율 | `KPI_SHOP_CVR` | I01~I04 | 등급별 전환율 향상 | 선구매 혜택 활용 |

### 7.2 리포트 출력 형식 (Markdown)

```markdown
# CHON AI 하네스 리포트

**Run ID:** run_20260220_001  
**실행 시각:** 2026-02-20T14:30:00+09:00  
**모델:** claude-sonnet-4-20250514

## 종합 요약

| 항목 | 수치 |
|---|---|
| 전체 케이스 | 29개 |
| 충족 | 22개 |
| 부분 충족 | 5개 |
| 미충족 | 2개 |

## 카테고리별 현황

| 카테고리 | 충족 | 부분충족 | 미충족 |
|---|---|---|---|
| A: DID 인증 | 2 | 1 | 1 |
| B: 팬 등급 | 4 | 0 | 0 |
| C: 게이미피케이션 | 4 | 0 | 0 |
| D: 모더레이션 | 3 | 1 | 0 |
| E: 데이터 타겟팅 | 3 | 0 | 0 |
| F: 이벤트/굿즈 | 2 | 0 | 0 |
| G: 다국어 | 2 | 0 | 0 |
| H: 채팅 채널 | 4 | 0 | 0 |
| I: 굿즈 판매 | 4 | 0 | 0 |

## KPI 연동 현황

| KPI | 목표 | 연동 케이스 | 비고 |
|---|---|---|---|
| 온보딩 이탈률 5%↓ | ≤ 5% | A01, A02, A03 | A01 부분 개선 필요 |
| 모더레이션 신뢰도 | 커뮤니티 안전 유지 | D01~D04 | D02 개선 필요 |
| 재방문율 80%+ | ≥ 80% | C01~C04 | 전 항목 충족 |
| 법적 컴플라이언스 | 위반 0건 | A04, E03 | A04 개선 필요 |

## 개선 필요 케이스

### TC-A01 (DID 신규 가입 온보딩)
- **미충족 항목:** C4 — 공식 채널 링크 미포함
- **개선 방향:** 시스템 프롬프트에 chon.fans/download 링크 응답 포함 지시

### TC-A04 (미성년자 DID 인증)
- **미충족 항목:** C3 — 온라인 동의 절차 안내 미흡
- **개선 방향:** 보호자 동의 3단계 절차를 프롬프트에 명시적으로 포함
```

---

## 8. 파일럿 실행 계획 및 성공 기준

### 8.1 월별 실행 계획

```
1개월차 — VIP 1,500명 온보딩 검증
────────────────────────────────────
집중 카테고리: A (DID 인증) + B (팬 등급)
실행 케이스: TC-A01~A04, TC-B01~B04
성공 기준:
  ✓ A 카테고리 전 케이스 품질 검토 완료
  ✓ A04 (법적 컴플라이언스) 미충족 항목 0건
  ✓ 온보딩 응답 품질 개선 필요 항목 식별 및 반영
액션: 미충족·부분충족 케이스 → 48시간 내 프롬프트 개선 → 재검토

2개월차 — 게이미피케이션 & 락인 검증
────────────────────────────────────
집중 카테고리: C (게이미피케이션) + D (모더레이션)
실행 케이스: TC-C01~C04, TC-D01~D04
성공 기준:
  ✓ C 카테고리 전 케이스 품질 검토 완료
  ✓ D 카테고리 (모더레이션) 미충족 항목 0건 목표
  ✓ 오탐(False Positive) 0건
  ✓ C02 (랭킹/XP 혼동) 응답 명확성 확인
액션: D 카테고리 미충족 → 24시간 내 긴급 프롬프트 수정

3개월차 — 전체 통합 검증 & 종합 리포트
────────────────────────────────────
실행 케이스: TC-E01~E03, TC-F01~F02, TC-G01~G02 + 전체 21개 재실행
성공 기준:
  ✓ 전체 케이스 품질 검토 — 미충족 케이스 개선 반영
  ✓ KPI 연동 케이스 개선 필요 항목 전수 해소
  ✓ 우선순위 Critical 케이스 미충족 항목 0건
  ✓ 전체 카테고리 충족 비율 지속 개선 확인
전국 오픈 조건: 위 4가지 확인 완료 후 팀 리뷰 → 신규 5,000명 오픈 진행
```

### 8.2 CI/CD 통합 스펙

```yaml
# .github/workflows/harness.yml

name: CHON AI Harness

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 9 * * 1'   # 매주 월요일 09:00 KST 정기 실행

jobs:
  harness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run harness
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npm run harness -- --output ./results

      - name: Check quality
        run: |
          NOT_MET=$(cat ./results/latest.json | jq '.summary.not_met')
          TOTAL=$(cat ./results/latest.json | jq '.summary.total')
          echo "전체 ${TOTAL}건 / 미충족 ${NOT_MET}건"
          cat ./results/latest.json | jq '[.improvement_targets[].id]'

      - name: Post report to Slack
        if: always()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_MESSAGE: "CHON 하네스 결과: ${{ job.status }}"

      - name: Upload report artifact
        uses: actions/upload-artifact@v4
        with:
          name: harness-report
          path: ./results/
```

### 8.3 프로젝트 디렉토리 구조

```
chon-ai-harness/
├── src/
│   ├── types.ts                 # 전체 TypeScript 타입 정의
│   ├── config.ts                # HarnessConfig 로더
│   ├── stage1_loader.ts         # 케이스 로더 & 컨텍스트 주입
│   ├── stage2_preprocessor.ts  # 입력 전처리 & 프롬프트 빌더
│   ├── stage3_inference.ts      # Anthropic API 호출
│   ├── stage4_evaluator.ts      # LLM-as-Judge + Rule-Based 평가
│   ├── stage5_scorer.ts         # 점수 집계 & Verdict 판정
│   ├── stage6_kpi_mapper.ts     # KPI 연동 영향도 계산
│   ├── stage7_reporter.ts       # 리포트 생성 & 회귀 등록
│   └── index.ts                 # 파이프라인 오케스트레이터
│
├── test-cases/
│   ├── A_did_auth.json          # TC-A01~A04
│   ├── B_fan_tier.json          # TC-B01~B04
│   ├── C_gamification.json      # TC-C01~C04
│   ├── D_moderation.json        # TC-D01~D04
│   ├── E_data_targeting.json    # TC-E01~E03
│   ├── F_event_goods.json       # TC-F01~F02
│   └── G_multilang.json         # TC-G01~G02
│
├── prompts/
│   ├── base_system.txt          # 베이스 시스템 프롬프트
│   ├── category/
│   │   ├── did_auth.txt
│   │   ├── gamification.txt
│   │   ├── moderation.txt
│   │   ├── data_targeting.txt
│   │   └── multilang.txt
│   └── judge/
│       ├── judge_system.txt     # LLM Judge 시스템 프롬프트
│       └── criteria_templates/  # 기준별 Judge 프롬프트
│
├── results/                     # 실행 결과 (gitignore)
├── harness.config.json          # 설정 파일
├── package.json
└── README.md
```

---

> **RELATIONSHIP IS IDENTITY**  
> 본 문서는 CHON 팬덤 플랫폼의 AI 품질 기준을 정의하는 바이브 코딩 스펙입니다.  
> 모든 테스트 케이스와 파이프라인 설계는 장민호 × CHON 비즈니스 KPI와 직결됩니다.  
>
> `CHON CONFIDENTIAL · v2.0 · 2026-02-20`
