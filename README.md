# 마이링크 (MyLink)

마이링크는 개발자와 크리에이터가 깃허브, 포트폴리오, 블로그, 유튜브 등 흩어져 있는 다양한 활동 링크를 하나의 깔끔한 웹페이지(`mylink.com/닉네임`)로 모아서 공유할 수 있는 통합 링크 서비스입니다.

## 🌟 주요 특징 (Core Features)
- **심플하고 직관적인 UI/UX**: 복잡한 설정이나 테마 선택 없이, 트렌디하고 모던한 단일 디자인을 제공합니다.
- **인라인 에디팅 (Inline Editing)**: 대시보드에서 링크와 텍스트를 클릭하면 즉시 수정할 수 있는 편리한 인라인 에디팅 기능을 지원합니다.
- **고유 URL 주소**: `mylink.com/닉네임` 형태의 직관적이고 고유한 나만의 URL을 가질 수 있습니다.
- **구글 소셜 로그인**: 구글 소셜 로그인 단독 지원으로 빠르고 간편한 인증 프로세스를 제공합니다. (가입 시 Gmail ID 기반으로 닉네임 자동 생성)
- **자동 파비콘 수집**: 외부 링크 등록 시 Google Favicon API를 활용하여 링크 목적지의 아이콘이 자동으로 렌더링됩니다.
- **SEO 및 메타 데이터 최적화**: 카카오톡이나 슬랙 등에 링크 공유 시 프로필 사진과 유저네임이 OpenGraph 썸네일과 타이틀로 자동 노출되도록 최적화되어 있습니다.

## 🛠 기술 스택 (Tech Stack)
- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI)
- **Backend/DB & Auth**: Firebase (Authentication, Firestore)
- **Icons**: Hugeicons
- **Fonts**: Geist, Geist Mono

## 📂 프로젝트 구조 (Directory Structure)
- `@app/`: 라우팅 및 레이아웃 정의 (Next.js App Router 구조)
- `@components/`: 공유 UI 컴포넌트 (`@components/ui/`에 Shadcn UI 위치)
- `@hooks/`: Firebase 연동 및 상태 관리를 위한 커스텀 React Hooks
- `@lib/`: 유틸리티 함수 및 Firebase 설정 파일
- `@public/`: 정적 에셋 및 정적 파일
- `@docs/`: PRD, 데이터베이스 스키마, 와이어프레임 등 기획/설계 문서

## 🚀 시작하기 (Getting Started)

### 1. 환경 변수 설정
Firebase 연동을 위한 환경 변수 파일(`.env.local`) 구성이 필요합니다. (상세 내용은 사내/개인 보안 설정 참고)

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행 (Turbopack)
```bash
npm run dev
```

### 4. 코드 품질 관리 및 빌드
```bash
npm run lint      # ESLint 검사
npm run format    # Prettier 포맷팅
npm run typecheck # TypeScript 타입 검사
npm run build     # 프로덕션 빌드
```

## 📝 참고 문서
기획 및 설계와 관련된 자세한 문서는 아래 링크에서 확인할 수 있습니다.
- [제품 요구사항 정의서 (PRD)](./docs/PRD.md)
- [데이터베이스 스키마](./docs/DB_SCHEMA.md)
- [와이어프레임](./docs/WIREFRAME.md)
- [유저 시나리오](./docs/USER_SCENARIO.md)
