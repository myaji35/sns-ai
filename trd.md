기술 요구사항 명세서 (TRD): 지능형 콘텐츠 오케스트레이션 플랫폼 (ICOP)
문서 버전: 1.0 작성일: 2025년 11월 14일 기술 리더: (귀사 담당자명)

1. 시스템 아키텍처
1.1. 아키텍처 모델: 마이크로서비스 아키텍처 (MSA)
본 시스템은 모놀리식 구조가 아닌 마이크로서비스 아키텍처(MSA)를 채택합니다. 이는 기능(기획, 생성, 이미지, 배포)별 독립적인 개발, 배포, 확장을 용이하게 하여 SaaS 플랫폼의 안정성과 유지보수성을 극대화하기 위함입니다.

1.2. 주요 서비스 컴포넌트
API Gateway (예: NGINX, AWS API Gateway): 모든 외부 요청의 진입점. 인증, 라우팅, 속도 제한을 처리합니다.

User & Auth Service: 다중 테넌트(Multi-Tenant) 관리, 사용자 인증(JWT), 구독 플랜, 그리고 가장 중요하게는 암호화된 서드파티 OAuth 토큰(Google, Meta, X) 저장을 담당합니다.

Planning & Scheduling Service: Google Sheets API 와 통신하여 주기적으로 콘텐츠 계획을 읽어오고, Workflow Orchestrator에 작업을 등록(Schedule)합니다.   

Agent Workflow Service (The Core): 핵심 두뇌. CrewAI 와 LangGraph 를 실행하여 다중 LLM 콘텐츠 생성 및 SEO 최적화 워크플로우를 수행합니다.   

Image Generation Service: Agent Workflow Service의 요청(영문 프롬프트)을 받아 DALL-E 3 / FLUX API 를 호출하고, 결과 이미지를 클라우드 스토리지(S3)에 업로드 후 URL을 반환합니다.   

Social Syndication Service: 완성된 마크다운 콘텐츠와 이미지 URL을 받아 각 소셜 플랫폼 API(Meta, X) 로 전송하여 포스팅을 실행합니다.   

Workflow Orchestrator (Temporal): 이 모든 비동기, 장기 실행(long-running) 워크플로우의 신뢰성을 보장하는 '신경계'입니다.    

1.3. 기술 스택 (Tech Stack)
구분	기술	사유
프론트엔드 (SaaS 대시보드)	
Next.js 15 (React)    

SSR을 통한 빠른 로딩 속도 및 SaaS 대시보드 SEO 확보.
백엔드 (API & Services)	
FastAPI (Python)    

AI/ML 생태계(CrewAI, LangGraph)와의 완벽한 호환성 및 높은 비동기 API 성능.
메인 데이터베이스	
PostgreSQL 16    

관계형 데이터 및 다중 테넌트 아키텍처의 표준.
AI 확장 (Vector DB)	
pgvector    

별도 DB 없이 PostgreSQL 내에서 향후 'Brand Voice' 기능을 위한 텍스트 임베딩 저장.
메시지 큐	
RabbitMQ (or Kafka)    

MSA 간의 안정적인 비동기 통신 보장 (예: 기획 서비스 -> 에이전트 서비스).
워크플로우 엔진	
Temporal    

LLM API 실패, 서버 다운 시에도 '영속적 실행(Durable Execution)'을 보장하는 핵심.    

2. 핵심 모듈별 기술 구현 사양
2.1. Module 1: 기획 및 스케줄링
Google Sheets API :   

Read: Python 클라이언트를 사용하여 spreadsheets.values.get으로 특정 범위(예: ContentPlan!A2:E)의 값을 읽어옵니다.    

Write: spreadsheets.values.batchUpdate를 사용하여 생성된 하위 주제 목록과 상태/URL을 특정 셀에 다시 씁니다.    

하위 주제 생성 (BERTopic):

단순 LLM 프롬프트(예: "10개 줘")는 중복되고 품질 낮은 결과를 반환할 위험이 큽니다.

BERTopic  라이브러리를 활용합니다. 1) LLM으로 메인 주제를 확장(Expansion)하고, 2) BERTopic으로 의미론적 클러스터링을 수행한 뒤, 3) LLM을 representation_model로 지정하여  각 클러스터의 고품질 레이블(하위 주제)을 도출합니다.    

2.2. Module 2: Agentic Workflow (CrewAI + LangGraph)
하이브리드 아키텍처: 본 시스템은 CrewAI와 LangGraph를 결합하여 사용합니다.    

CrewAI (역할 정의): 직관적인 역할 기반 아키텍처 를 활용해 '전문가 에이전트'를 정의합니다.    

ResearcherAgent: 웹 검색 수행.

WriterAgent_GPT, WriterAgent_Claude, WriterAgent_Gemini: 3개 LLM 병렬 실행.

SEOAgent: 메타데이터 및 키워드 생성.    

VisualDirectorAgent: 텍스트를 분석 하고, 이미지 프롬프트를 생성한 뒤 영어로 번역.   

MarkdownFormatterAgent: 최종 텍스트와 S3 이미지 URL 목록을 받아 최종 마크다운 파일 조립.

LangGraph (흐름 제어): CrewAI 에이전트들을 노드(Node)로 등록하고, 상태 기계(State Machine) 를 통해 이들의 복잡한 흐름을 제어합니다.   

병렬 실행 (Parallelization): 3개의 WriterAgent를 병렬로 실행합니다.

조건부 엣지 (Conditional Edges): 사용자의 설정('Compare' vs 'Merge')에 따라 EditorAgent를 호출할지 MergerAgent를 호출할지 분기합니다.    

상태 관리 (State): 모든 중간 산출물(초안 3개, SEO 데이터, 이미지 URL 목록)은 LangGraph의 State 객체를 통해 노드 간에 전달됩니다.    

2.3. Module 3: 이미지 생성
API 선정:

권장: DALL-E 3 (OpenAI API) 및 FLUX (fal.ai API ).   

FLUX는 Midjourney v6보다 벤치마크가 우수하며 , 안정적인 Pay-per-use API를 제공합니다.    

제외:

Midjourney: 공식 API가 없어 서드파티 API 사용 시 ToS 위반 및 서비스 중단 리스크가 치명적입니다.    

Stable Diffusion: SaaS 매출 1백만 달러 초과 시 불투명한 'Enterprise' 라이선스 계약이 필요하여 재무적 리스크가 큽니다.    

프롬프트: VisualDirectorAgent가 생성한 영문 프롬프트를 API에 전달합니다.

이미지 처리 (필수): Instagram API는 JPEG만 지원합니다.  Image Generation Service는 DALL-E 3 등에서 반환된 PNG/WEBP 이미지를 Python의 Pillow 라이브러리를 사용해 고품질 JPEG로 변환한 후 S3에 저장해야 합니다.   

2.4. Module 4: 소셜 미디어 배포 API
Facebook 페이지: Pages API (POST /{page-id}/feed 또는 photos).    

X (Twitter): X API v2 (POST /2/tweets).  OAuth 2.0 인증  및 유료 플랜의 월별 게시 한도(무료 500개 ) 관리가 필요합니다.   

Threads: Threads API (POST /me/threads).  텍스트(500자), 이미지, 비디오, 캐러셀(최대 20개 )을 지원하며 일일 250개 의 명확한 한도를 가집니다.   

Instagram (주요 장애물): Instagram Graph API.

치명적 한계 1: JPEG 이미지만 지원합니다.  (Module 3에서 해결)   

치명적 한계 2: 스토리(Story) 및 릴스(Reels) API 포스팅을 지원하지 않습니다. (피드 게시물만 가능)    

한계 3: 24시간당 100개 의 API 게시 제한이 있습니다.   

한계 4: 비디오 게시는 'Resumable Upload' 라는 별도의 복잡한 프로토콜을 사용해야 하므로 MVP(최소 기능 제품)에서는 제외하고 이미지 포스팅에 집중할 것을 권장합니다.   

3. 데이터베이스 및 다중 테넌트(Multi-Tenancy)
  
테넌시 모델: Row-Level Security (RLS)를 적용한 단일 데이터베이스 모델을 채택합니다. 모든 테이블에 tenant_id 컬럼을 추가하고, PostgreSQL의 RLS 정책을 통해 애플리케이션 레벨의 실수와 관계없이 데이터베이스 단에서 테넌트 간 데이터 접근을 원천 차단합니다.

주요 스키마 (예시):

tenants (tenant_id, company_name, subscription_plan)

users (user_id, tenant_id (FK), email, password_hash)

api_credentials (credential_id, tenant_id (FK), user_id (FK), platform_name, encrypted_access_token, encrypted_refresh_token, expires_at)

content_pipelines (pipeline_id, tenant_id (FK), google_sheet_id, schedule_cron)

generated_articles (article_id, tenant_id (FK), pipeline_id (FK), sub_topic, status, final_markdown_s3_url, thumbnail_url)

보안: api_credentials 테이블의 모든 토큰은 반드시 애플리케이션 비밀 키를 사용하여 양방향 암호화(예: AES-256-GCM)되어 저장되어야 합니다.