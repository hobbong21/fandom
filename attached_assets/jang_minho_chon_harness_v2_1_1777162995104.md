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
6. [테스트 케이스 전체 명세 (21개)](#6-테스트-케이스-전체-명세-21개)
7. [KPI 연동 매핑 및 리포트 스펙](#7-kpi-연동-매핑-및-리포트-스펙)
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
│                    기준항목별 PASS/FAIL 채점                       │
│                                │                                 │
│                                ▼                                 │
│  [Stage 5] Scorer ──→ 가중합산 → Threshold 비교 → Verdict        │
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
  threshold: number;             // PASS 판정 최저 점수 (0-100)
  kpi_links: KPILink[];          // 연동 KPI 목록

  // 실행 후 채워지는 필드
  actual_output?: string;
  eval_result?: EvalResult;
  verdict?: "PASS" | "FAIL" | "SKIP";
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
  weight: number;                // 합산 100이 되도록 설계
  eval_type: "llm_judge" | "rule_based" | "hybrid";
  rule?: string;                 // rule_based일 때 정규표현식 또는 키워드 목록
  judge_prompt?: string;         // llm_judge일 때 세부 판단 지시문
}

interface EvalResult {
  criteria_scores: CriterionScore[];
  weighted_total: number;        // 0-100
  verdict: "PASS" | "FAIL";
  failure_reasons: string[];
  improvement_suggestions: string[];
  judge_reasoning: string;       // LLM judge의 판단 근거
}

interface CriterionScore {
  criterion_id: string;
  score: 0 | 1;                  // PASS=1, FAIL=0 (binary)
  weighted_score: number;        // score * weight
  reason: string;
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
  | "MULTILANG";        // G: 다국어 지원

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

  thresholds: ThresholdConfig;
  retry_policy: RetryPolicy;
  output_dir: string;            // "./results"
}

interface ThresholdConfig {
  MODERATION: 95;
  LEGAL_COMPLIANCE: 90;
  USER_COMPLAINT: 90;
  GAMIFICATION_CONFUSION: 90;
  DID_AUTH: 85;
  GAMIFICATION: 85;
  DEFAULT: 80;
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
    passed: number;
    failed: number;
    skipped: number;
    pass_rate: number;           // 0-100
    avg_score: number;
  };

  category_breakdown: CategorySummary[];
  kpi_impact: KPIImpactSummary[];
  failed_cases: TestCase[];
  regression_candidates: string[]; // 회귀 등록된 TC ID 목록
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
    score: result.verdict === "PASS" ? 1 : 0,
    weighted_score: result.verdict === "PASS" ? criterion.weight : 0,
    reason: result.reason,
  };
}
```

### Stage 5 — 점수 집계 & 판정

```typescript
// harness/stage5_scorer.ts

export function computeVerdict(
  scores: CriterionScore[],
  threshold: number
): EvalResult {
  const weighted_total = scores.reduce((sum, s) => sum + s.weighted_score, 0);
  const verdict = weighted_total >= threshold ? "PASS" : "FAIL";

  const failure_reasons = scores
    .filter(s => s.score === 0)
    .map(s => `[${s.criterion_id}] ${s.reason}`);

  return {
    criteria_scores: scores,
    weighted_total: Math.round(weighted_total),
    verdict,
    failure_reasons,
    improvement_suggestions: generateSuggestions(scores),
    judge_reasoning: scores.map(s => s.reason).join(" | "),
  };
}

function generateSuggestions(scores: CriterionScore[]): string[] {
  return scores
    .filter(s => s.score === 0)
    .map(s => IMPROVEMENT_MAP[s.criterion_id] ?? "프롬프트 개선 필요");
}
```

### Stage 6 — KPI 연동 검증

```typescript
// harness/stage6_kpi_mapper.ts

const KPI_DEFINITIONS: Record<string, KPIDef> = {
  KPI_ONBOARDING:   { name: "온보딩 이탈률", target: "≤ 5%",  alert_threshold: 0.85 },
  KPI_RETENTION:    { name: "재방문율",       target: "≥ 80%", alert_threshold: 0.85 },
  KPI_REFERRAL:     { name: "초대 전환율",    target: "≥ 30%", alert_threshold: 0.85 },
  KPI_CVR:          { name: "구매 전환율",    target: "≥ 45%", alert_threshold: 0.85 },
  KPI_MODERATION:   { name: "모더레이션 신뢰도", target: "≥ 95%", alert_threshold: 0.95 },
  KPI_LTV:          { name: "LTV 증가",       target: "5×",    alert_threshold: 0.85 },
  KPI_VIRAL:        { name: "팬 확장 속도",   target: "5×",    alert_threshold: 0.80 },
  KPI_LEGAL:        { name: "법적 컴플라이언스", target: "100%", alert_threshold: 1.0 },
  KPI_GLOBAL:       { name: "글로벌 대응",    target: "≥ 80%", alert_threshold: 0.80 },
};

export function computeKPIImpact(
  results: TestCase[],
  kpiDefinitions = KPI_DEFINITIONS
): KPIImpactSummary[] {
  return Object.entries(kpiDefinitions).map(([kpiId, def]) => {
    const linkedCases = results.filter(tc =>
      tc.kpi_links.some(l => l.kpi_id === kpiId)
    );
    const passRate = linkedCases.length > 0
      ? linkedCases.filter(tc => tc.verdict === "PASS").length / linkedCases.length
      : null;

    const at_risk = passRate !== null && passRate < def.alert_threshold;
    return { kpi_id: kpiId, kpi_name: def.name, target: def.target,
             pass_rate: passRate, at_risk, linked_case_ids: linkedCases.map(tc => tc.id) };
  });
}
```

### Stage 7 — 리포트 생성 & 회귀 등록

```typescript
// harness/stage7_reporter.ts

export function generateReport(results: TestCase[], config: HarnessConfig): HarnessReport {
  const passed = results.filter(tc => tc.verdict === "PASS").length;
  const failed = results.filter(tc => tc.verdict === "FAIL").length;

  return {
    run_id: `run_${new Date().toISOString().slice(0,10).replace(/-/g,"")}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    config,
    summary: {
      total: results.length,
      passed, failed,
      skipped: results.length - passed - failed,
      pass_rate: Math.round((passed / results.length) * 100),
      avg_score: Math.round(
        results.reduce((s, tc) => s + (tc.eval_result?.weighted_total ?? 0), 0) / results.length
      ),
    },
    category_breakdown: computeCategoryBreakdown(results),
    kpi_impact: computeKPIImpact(results),
    failed_cases: results.filter(tc => tc.verdict === "FAIL"),
    regression_candidates: results
      .filter(tc => tc.verdict === "FAIL" && tc.priority === "Critical")
      .map(tc => tc.id),
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
  2단계(10초): 생체 인증 또는 본인 확인 → 신원 데이터 검증
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
3. 부분 점수는 없습니다 (PASS 또는 FAIL만 판정)
4. 판정 근거는 1-2문장으로 간결하게 작성합니다

반드시 아래 JSON 형식으로만 응답합니다:
```json
{
  "verdict": "PASS" | "FAIL",
  "confidence": 0.0-1.0,
  "reason": "판정 근거 (1-2문장)",
  "evidence": "응답에서 발췌한 근거 문장 (없으면 null)"
}
```
````

### 5.2 기준별 Judge 프롬프트 예시

```
[TC-A01 / C1 / 정보 정확성 Judge Prompt]

다음 AI 응답이 DID 인증 5단계 여정을 정확하게 안내했는지 평가하세요.

평가 기준:
- PASS 조건: 아래 5단계 중 최소 4단계의 핵심 내용이 포함되어야 함
  1단계: 가입 신청 / 약관 동의
  2단계: 생체 인증 또는 본인 확인
  3단계: DID 지갑 생성
  4단계: 추천인 입력 (선택)
  5단계: 프로필 설정 완료
- PASS 조건: 18초 소요 시간이 언급되어야 함
- FAIL 조건: 단계 순서가 틀리거나 잘못된 정보가 포함된 경우

사용자 입력: {{user_input}}
AI 응답: {{actual_output}}
```

```
[TC-D01 / C2 / 오탐 방지 Judge Prompt]

다음 AI 응답이 콘텐츠를 과도하게 또는 부족하게 필터링했는지 평가하세요.

평가 기준:
- PASS 조건: 아래를 모두 만족해야 함
  (a) 명백한 비하/혐오 표현을 정확히 분류함
  (b) 분류 신뢰도가 0.90 이상으로 표시됨
  (c) 유사하지만 정상적인 비판 의견을 혐오로 분류하지 않음
- FAIL 조건: 신뢰도 0.90 미만이거나, 명백한 혐오를 허용(allow)으로 처리한 경우

입력 콘텐츠: {{user_input}}
AI 응답 (JSON): {{actual_output}}
```

---

## 6. 테스트 케이스 전체 명세 (21개)

> **표기 규칙**
> - `✓` PASS 판정 기준 충족 / `✗` PASS 판정 기준 미충족
> - `[LLM]` LLM-as-Judge 평가 / `[RULE]` 규칙 기반 평가 / `[HYB]` 하이브리드 평가
> - 각 케이스는 `FAN_PRESETS.middle_active` 컨텍스트를 기본 적용

---

### 카테고리 A — DID 인증 (임계값: 85~90점)

---

#### TC-A01 | DID 신규 가입 온보딩 안내

```yaml
id: TC-A01
category: DID_AUTH
priority: Critical
tags: [DID, 온보딩, 신규가입, 개인정보]
fan_preset: casual_new
threshold: 85
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
2️⃣ 생체 인증 또는 본인 확인 (10초)
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

**현재 판정:** `FAIL` (C4 미충족, 가중 총점 80점 / 임계값 85점)

---

#### TC-A02 | DID 인증 오류 상황 대응

```yaml
id: TC-A02
category: DID_AUTH
priority: Critical
tags: [DID, 오류대응, 트러블슈팅]
fan_preset: casual_new
threshold: 85
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

**현재 판정:** `PASS` (가중 총점 100점 / 임계값 85점)

---

#### TC-A03 | DID vs 기존 팬클럽 비교 질문

```yaml
id: TC-A03
category: DID_AUTH
priority: High
tags: [DID, 비교분석, 차별화]
fan_preset: casual_new
threshold: 80
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

**현재 판정:** `PASS` (가중 총점 85점 / 임계값 80점)

---

#### TC-A04 | 미성년자 DID 인증 문의

```yaml
id: TC-A04
category: DID_AUTH
priority: Critical
tags: [DID, 미성년자, 법적컴플라이언스, 생체인증]
fan_preset: casual_new
threshold: 90
```

**입력**
```
저 17살인데 DID 인증 되나요? 생체 인증이 뭔가요?
```

**기대 출력 요약**
만 14세 이상 가입 가능(법정 요건) + 만 18세 미만 보호자 동의 필수 + 생체 인증 개념(지문/얼굴 인식) 쉬운 설명 + 개인정보 비노출 재강조

**예시 이상적 응답**
```
CHON은 만 14세 이상이라면 가입하실 수 있어요!

다만 만 18세 미만(미성년자)인 경우에는 보호자 동의가 필요합니다.
📋 보호자 동의 절차
1. 가입 화면에서 "미성년자입니다" 선택
2. 보호자 휴대폰 번호 입력
3. 보호자 인증 문자(SMS) 수신 및 동의

📱 생체 인증이란?
스마트폰에 저장된 지문이나 얼굴 정보로 본인임을 확인하는 방법이에요. 생체 정보는 기기 내부에만 저장되며 외부 서버로 전송되지 않아요.

궁금한 점은 support.chon.fans 에서 도움받으실 수 있어요 😊
```

**현재 판정:** `FAIL` (C3 미충족, 가중 총점 80점 / 임계값 90점)

---

### 카테고리 B — 팬 등급 & 네트워크 (임계값: 80점)

---

#### TC-B01 | 로열층(VIP) 전환 조건 문의

```yaml
id: TC-B01
category: FAN_TIER
priority: High
tags: [등급, 로열층, VIP, 전환조건]
fan_preset: middle_active
threshold: 80
```

**입력**
```
로열층(VIP)이 되려면 정확히 뭘 얼마나 해야 해요? 저는 콘서트 3번 갔어요
```

**기대 출력 요약**
로열층 조건(공연 5회+, 상위 500명) + 현재 상태(3회) 대비 갭 → 남은 조건 2가지 + 추가 달성 방법(친구 초대 XP 등)

**현재 판정:** `PASS` (가중 총점 85점 / 임계값 80점)

---

#### TC-B02 | 촌수 네트워크 시각화 이해 질문

```yaml
id: TC-B02
category: FAN_TIER
priority: High
tags: [촌수, 네트워크, 시각화, 관계도]
fan_preset: middle_active
threshold: 80
```

**입력**
```
나와 장민호는 몇 촌이라는 게 무슨 뜻이에요? 어떻게 계산돼요?
```

**기대 출력 요약**
촌수 = 추천인 연결 경로 수 + 1촌(직접 연결=로열) · 2촌(로열이 초대=미들) · 3촌(미들이 초대=캐주얼) + 앱 내 네트워크 맵 시각화 기능 안내

**현재 판정:** `PASS` (가중 총점 100점 / 임계값 80점)

---

#### TC-B03 | 추천인 입력 누락 후 재설정 요청

```yaml
id: TC-B03
category: FAN_TIER
priority: Medium
tags: [추천인, 촌수, 수정요청]
fan_preset: casual_new
threshold: 80
```

**입력**
```
가입할 때 추천인을 안 넣었는데 나중에 수정 가능한가요? 제 친구가 이미 로열층이에요
```

**현재 판정:** `PASS` (가중 총점 80점 / 임계값 80점)

---

#### TC-B04 | 백스테이지 초대 조건 문의

```yaml
id: TC-B04
category: FAN_TIER
priority: High
tags: [백스테이지, 혜택, 로열층, VIP]
fan_preset: royal_veteran
threshold: 80
```

**입력**
```
백스테이지 초대는 어떻게 받아요? 무조건 로열층이면 되나요?
```

**현재 판정:** `PASS` (가중 총점 90점 / 임계값 80점)

---

### 카테고리 C — 게이미피케이션 (임계값: 85~90점)

---

#### TC-C01 | XP 적립 규칙 및 최적 전략 질문

```yaml
id: TC-C01
category: GAMIFICATION
priority: High
tags: [XP, 적립, 친구초대, 전략]
fan_preset: middle_active
threshold: 85
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

**현재 판정:** `PASS` (가중 총점 90점 / 임계값 85점)

---

#### TC-C02 | 랭킹 초기화 vs XP 영구 보존 구분

```yaml
id: TC-C02
category: GAMIFICATION
priority: Critical
tags: [랭킹, XP, 초기화, 정책혼동]
fan_preset: middle_active
threshold: 90
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

**현재 판정:** `PASS` (가중 총점 100점 / 임계값 90점)

---

#### TC-C03 | 한정판 배지 수집 및 과거 이벤트 배지 문의

```yaml
id: TC-C03
category: GAMIFICATION
priority: Medium
tags: [배지, 한정판, 이벤트, 컬렉션]
fan_preset: middle_active
threshold: 85
```

**입력**
```
COLLECTION에 있는 배지는 어떻게 얻어요? 이미 지난 이벤트 배지는 구할 수 없나요?
```

**현재 판정:** `PASS` (가중 총점 85점 / 임계값 85점)

---

#### TC-C04 | 레벨업 미처리 오류 대응

```yaml
id: TC-C04
category: GAMIFICATION
priority: High
tags: [레벨업, 오류, 트러블슈팅]
fan_preset: middle_active
threshold: 85
```

**입력**
```
XP가 4,000 넘었는데 레벨이 안 올라요. 앱 오류인가요?
```

**현재 판정:** `PASS` (가중 총점 100점 / 임계값 85점)

---

### 카테고리 D — 콘텐츠 모더레이션 (임계값: 95점)

> ⚠️ **Critical 카테고리**: 모든 케이스 임계값 95점. 오탐(False Positive) 및 미탐(False Negative) 모두 즉시 회귀 등록.

---

#### TC-D01 | 악성 비하 댓글 감지 및 자동 필터링

```yaml
id: TC-D01
category: MODERATION
priority: Critical
tags: [비하, 혐오, 댓글, 자동필터]
fan_preset: middle_active
threshold: 95
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

**회귀 등록 조건:** C3(오탐) FAIL 시 즉시 Critical 회귀 케이스로 등록

**현재 판정:** `PASS` (가중 총점 100점 / 임계값 95점)

---

#### TC-D02 | 아티스트 개인정보(주소) 유출 게시물 감지

```yaml
id: TC-D02
category: MODERATION
priority: Critical
tags: [개인정보, 주소유출, 아티스트보호, 즉시처리]
fan_preset: middle_active
threshold: 95
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

**현재 판정:** `FAIL` (C4 미충족, 가중 총점 90점 / 임계값 95점)

---

#### TC-D03 | 비공식 암표 거래 시도 감지

```yaml
id: TC-D03
category: MODERATION
priority: Critical
tags: [암표, 2차거래, 비공식거래, 수익보호]
fan_preset: middle_active
threshold: 95
```

**입력**
```
[CONTENT_TYPE: dm]
'콘서트 티켓 2배 가격에 팔아요. 직거래 가능합니다'
```

**현재 판정:** `PASS` (가중 총점 90점 / 임계값 95점 → `FAIL` 재판정 필요)

> **⚠️ 주의:** 90점 달성이나 임계값 95점 미충족으로 실질적으로는 FAIL. C4 개선 필요.

---

#### TC-D04 | 미확인 루머 및 허위 정보 게시물 감지

```yaml
id: TC-D04
category: MODERATION
priority: Critical
tags: [루머, 허위정보, 커뮤니티혼란]
fan_preset: middle_active
threshold: 95
```

**입력**
```
[CONTENT_TYPE: post]
'장민호 활동 중단 확정됐대요 소속사에서 발표 예정이래요 (출처 미상)'
```

**현재 판정:** `PASS` (가중 총점 95점 / 임계값 95점)

---

### 카테고리 E — 데이터 타겟팅 & 분석 (임계값: 90점)

---

#### TC-E01 | 팬 스코어링 조회 및 VIP 갭 분석

```yaml
id: TC-E01
category: DATA_TARGETING
priority: High
tags: [스코어링, VIP갭, LTV, 타겟팅]
fan_preset: middle_active   # xp_total: 3450, xp_to_next: 550
threshold: 90
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

**현재 판정:** `PASS` (가중 총점 90점 / 임계값 90점)

---

#### TC-E02 | 세그먼트 차등 혜택 공정성 이의 제기

```yaml
id: TC-E02
category: DATA_TARGETING
priority: Critical
tags: [차등혜택, 공정성, 불만대응, 이탈방지]
fan_preset: middle_active
threshold: 90
```

**입력**
```
왜 저한테는 백스테이지 초대가 안 오고 친구한테는 왔어요? 불공평하지 않나요?
```

**현재 판정:** `PASS` (가중 총점 90점 / 임계값 90점)

---

#### TC-E03 | 개인 활동 데이터 삭제 요청 (개인정보 주권)

```yaml
id: TC-E03
category: DATA_TARGETING
priority: Critical
tags: [개인정보, 데이터삭제, GDPR, 블록체인]
fan_preset: royal_veteran
threshold: 90
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

**현재 판정:** `PASS` (가중 총점 90점 / 임계값 90점)

---

### 카테고리 F — 이벤트 & 굿즈 (임계값: 80점)

---

#### TC-F01 | 파일럿 VIP 초대장 수락 안내

```yaml
id: TC-F01
category: EVENT_GOODS
priority: High
tags: [VIP초대, 파일럿, 온보딩]
fan_preset: royal_veteran
threshold: 80
```

**입력**
```
초대장 받았는데 이게 뭔가요? 어떻게 수락해요?
```

**현재 판정:** `PASS` (가중 총점 85점 / 임계값 80점)

---

#### TC-F02 | 공식 굿즈 구매 및 비공식 사이트 경고

```yaml
id: TC-F02
category: EVENT_GOODS
priority: Medium
tags: [굿즈, 공식구매처, 사기경고]
fan_preset: casual_new
threshold: 80
```

**입력**
```
공식 포토북 어디서 살 수 있어요? 해외 배송 되나요? 비공식 사이트도 있던데
```

**현재 판정:** `PASS` (가중 총점 80점 / 임계값 80점)

---

### 카테고리 G — 다국어 지원 (임계값: 80점)

---

#### TC-G01 | 영어권 팬의 한국어 공지 번역

```yaml
id: TC-G01
category: MULTILANG
priority: Medium
tags: [번역, 영어, 팬덤용어, 다국어]
fan_preset: casual_new
threshold: 80
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

**현재 판정:** `PASS` (가중 총점 100점 / 임계값 80점)

---

#### TC-G02 | 일본어 팬의 콘서트 일정 및 티켓 문의

```yaml
id: TC-G02
category: MULTILANG
priority: Medium
tags: [번역, 일본어, 콘서트, 티켓]
fan_preset: casual_new
threshold: 80
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

**현재 판정:** `PASS` (가중 총점 90점 / 임계값 80점)

---

## 7. KPI 연동 매핑 및 리포트 스펙

### 7.1 KPI-하네스 연동 매핑

| PPT KPI | KPI ID | 연동 TC | 통과율 목표 | AT RISK 기준 |
|---|---|---|---|---|
| 온보딩 이탈률 5%↓ | `KPI_ONBOARDING` | A01, A02, A03 | ≥ 90% | < 85% |
| 재방문율 80%+ | `KPI_RETENTION` | C01, C02, C03, C04 | ≥ 85% | < 80% |
| 초대 전환율 30% | `KPI_REFERRAL` | C01, F01 | ≥ 85% | < 80% |
| 구매 전환율 45% | `KPI_CVR` | C03, E01 | ≥ 85% | < 80% |
| 모더레이션 신뢰도 | `KPI_MODERATION` | D01, D02, D03, D04 | ≥ 95% | < 90% |
| LTV 5배 | `KPI_LTV` | B01, E01, E02 | ≥ 85% | < 80% |
| 팬 확장 5배 | `KPI_VIRAL` | C01, B02 | ≥ 80% | < 75% |
| 법적 컴플라이언스 | `KPI_LEGAL` | A04, E03 | 100% | < 100% |
| 글로벌 대응 | `KPI_GLOBAL` | G01, G02 | ≥ 80% | < 75% |

### 7.2 리포트 출력 형식 (Markdown)

```markdown
# CHON AI 하네스 리포트

**Run ID:** run_20260220_001  
**실행 시각:** 2026-02-20T14:30:00+09:00  
**모델:** claude-sonnet-4-20250514

## 종합 요약

| 항목 | 수치 |
|---|---|
| 전체 케이스 | 21개 |
| PASS | 17개 (81%) |
| FAIL | 4개 (19%) |
| 평균 점수 | 88.5점 |

## 카테고리별 현황

| 카테고리 | PASS | FAIL | 통과율 | 목표 통과율 |
|---|---|---|---|---|
| A: DID 인증 | 2/4 | 2/4 | 50% | ⚠️ 90%+ |
| B: 팬 등급 | 4/4 | 0/4 | 100% | ✅ 80%+ |
| C: 게이미피케이션 | 4/4 | 0/4 | 100% | ✅ 85%+ |
| D: 모더레이션 | 3/4 | 1/4 | 75% | ⚠️ 95%+ |
| E: 데이터 타겟팅 | 3/3 | 0/3 | 100% | ✅ 90%+ |
| F: 이벤트/굿즈 | 2/2 | 0/2 | 100% | ✅ 80%+ |
| G: 다국어 | 2/2 | 0/2 | 100% | ✅ 80%+ |

## KPI 영향도

| KPI | 목표 | 현재 통과율 | 상태 |
|---|---|---|---|
| 온보딩 이탈률 5%↓ | ≥90% | 50% | 🔴 AT RISK |
| 모더레이션 신뢰도 | ≥95% | 75% | 🔴 AT RISK |
| 재방문율 80%+ | ≥85% | 100% | 🟢 OK |
| 법적 컴플라이언스 | 100% | 50% | 🔴 AT RISK |

## FAIL 케이스 상세

### TC-A01 (DID 신규 가입 온보딩)
- **점수:** 80점 / 임계값 85점
- **실패 기준:** C4 — 공식 채널 링크 미포함
- **개선 방안:** 시스템 프롬프트에 chon.fans/download 링크 응답 필수화
- **회귀 등록:** ✅ (Critical)

## 회귀 등록 케이스
- TC-A01, TC-A04, TC-D02
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
  ✓ A 카테고리 통과율 ≥ 90%
  ✓ A04 (법적 컴플라이언스) 100% 달성
  ✓ 온보딩 이탈률 시뮬레이션 ≤ 5%
액션: FAIL 케이스 → 48시간 내 프롬프트 개선 → 재실행

2개월차 — 게이미피케이션 & 락인 검증
────────────────────────────────────
집중 카테고리: C (게이미피케이션) + D (모더레이션)
실행 케이스: TC-C01~C04, TC-D01~D04
성공 기준:
  ✓ C 카테고리 통과율 ≥ 85%
  ✓ D 카테고리 통과율 ≥ 95% (Critical)
  ✓ 오탐(False Positive) 0건
  ✓ C02 (랭킹/XP 혼동) 90점 이상
액션: D 카테고리 FAIL → 24시간 내 긴급 프롬프트 수정

3개월차 — 전체 통합 검증 & 종합 리포트
────────────────────────────────────
실행 케이스: TC-E01~E03, TC-F01~F02, TC-G01~G02 + 전체 21개 재실행
성공 기준:
  ✓ 전체 통과율 ≥ 85%
  ✓ KPI AT RISK 항목 0건
  ✓ Critical 회귀 케이스 해소 100%
  ✓ 3개월 누적 평균 점수 ≥ 88점
전국 오픈 조건: 위 4가지 모두 달성 시 신규 5,000명 오픈 진행
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

      - name: Check pass rate
        run: |
          PASS_RATE=$(cat ./results/latest.json | jq '.summary.pass_rate')
          if [ "$PASS_RATE" -lt 85 ]; then
            echo "❌ 전체 통과율 ${PASS_RATE}% — 기준 85% 미달"
            exit 1
          fi
          echo "✅ 전체 통과율 ${PASS_RATE}%"

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
