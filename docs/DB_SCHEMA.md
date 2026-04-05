# 마이링크 (MyLink) 데이터베이스 모델링 (Firestore)

본 문서는 마이링크 서비스의 Firebase Firestore(NoSQL) 데이터베이스 모델링 구조를 정의합니다.

## 1. 컬렉션 구조 개요
Firestore의 특징(NoSQL)과 데이터 조회의 효율성, **데이터의 특정 사용자 종속성**을 고려하여 전체 유저 데이터와 하위 데이터(링크)를 계층화시킨 구조로 설계합니다.

- `users` : 사용자 기본 정보(유저네임, 한 줄 소개 등) 및 메타데이터를 저장하는 최상위 컬렉션입니다.
  - ↳ `links` (Subcollection) : 특정 `users` 문서 경로의 하위에 위치하며, 해당 사용자가 생성한 개별 개인 링크 목록 데이터들만 보관합니다.
- `nicknames` : 고유 URL로 사용되는 닉네임의 중복 검사와 무결성 보장을 위해 별도로 운영되는 식별용 최상위 보조 컬렉션입니다.

---

## 2. 컬렉션 상세 설계

### 2.1 `users` 컬렉션 (최상위)
사용자의 프로필 및 계정 메타데이터를 저장합니다.
- **경로**: `/users/{uid}`
- **Document ID**: `uid` (Firebase Auth에서 발급한 고유 식별자)

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `email` | `string` | 구글 연동 이메일 |
| `nickname` | `string` | 유저 페이지 고유 URL 경로 매핑 텍스트 (가입 시 구글 이메일 앞자리로 자동 발급됨, 변경 가능) |
| `username` | `string` | 프로필 화면에 실제 텍스트로 렌더링될 유저네임(표시 이름) (예: `홍길동`) |
| `bio` | `string` | 프로필 한 줄 소개글 텍스트 |
| `avatarUrl` | `string` | 구글 계정에서 가져온 프로필 이미지 URL |
| `createdAt` | `timestamp` | 가입(계정 생성) 시간 |
| `updatedAt` | `timestamp` | 프로필 최근 수정 시간 |

### 2.2 `users/{uid}/links` 서브 컬렉션(Subcollection)
해당 유저에게 완전히 소유된 링크 데이터들을 보관합니다. 데이터 종속성을 띄어 다른 사용자의 데이터와 섞일 우려가 없으며, 가장 직관적이고 안전한 권한 통제(Security Rules)를 적용할 수 있습니다. 
- **경로**: `/users/{uid}/links/{linkId}`
- **Document ID**: `자동 생성 ID` 

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `title` | `string` | 항목에 표시될 링크 제목 텍스트 |
| `url` | `string` | 목적지 URL 주소 (대상 파비콘 렌더링용 Google API에도 활용됨) |
| `createdAt` | `timestamp` | 링크 생성 시간 (대시보드 및 뷰어 정렬 기준) |
| `updatedAt` | `timestamp` | 마지막 인라인 수정 시간 |

### 2.3 `nicknames` 컬렉션 (URL 중복 방지 시스템)
Firestore는 RDBMS처럼 특정 필드 기준 'Unique' 제약을 자체적으로 걸 수 없습니다. 따라서 고유 URL 역할을 하는 닉네임의 무결성(겹침 방지)을 보증하기 위해 보조 컬렉션을 운영합니다.
- **경로**: `/nicknames/{nickname}`
- **Document ID**: `nickname` 텍스트 값 자체 (예: `dev_john`)

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `uid` | `string` | 해당 닉네임(URL)을 현재 점유하고 있는 사용자의 UID |
| `createdAt` | `timestamp` | 해당 닉네임 최초 할당 및 변경 시간 |

> **동작 방식**: 
> 사용자가 닉네임(URL)을 자동 설정하거나 변경하려 할 때, `nicknames` 컬렉션에 해당 텍스트를 ID로 가지는 문서가 이미 있는지 먼저 찔러서(Get) 확인합니다. 문서가 존재하지 않는다면(사용 가능) `nicknames` 문서를 생성함과 동시에 `users`의 닉네임 필드를 업데이트하는 트랜잭션 동기화 처리를 수행합니다.

---

## 3. 주요 데이터 호출 (Query) 시나리오

1. **퍼블릭 프로필 페이지 접근 시 (`mylink.com/[nickname]`)**
   - **Step 1**: `/nicknames/[nickname]` 경로의 문서를 조회하여 대상의 `uid`를 획득합니다.
   - **Step 2**: 획득한 `uid`로 `/users/{uid}` 경로 문서를 읽어들여 유저네임, Bio, 아바타 이미지를 상단에 렌더링합니다.
   - **Step 3**: 같은 `uid` 구조를 공유하는 서브 컬렉션 경로(`/users/{uid}/links`)를 통째로 읽어와 `createdAt` 기준 오름차순(또는 내림차순)으로 리스트를 렌더링합니다. (남의 데이터가 섞일 위험 원천 차단)

2. **관리자 대시보드 수정 시**
   - 로그인된 본인의 Firebase Auth `uid`를 기준으로, 자신의 프로필 문서(`/users/{uid}`)와 자신의 서브 컬렉션 링크 구조(`/users/{uid}/links`) 내에 자유롭고 안전하게 CRUD 동작을 수행합니다.
