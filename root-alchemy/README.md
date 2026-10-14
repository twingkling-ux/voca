# Root Alchemy — Firebase 계정 버전

학생은 이메일 주소와 비밀번호로 회원가입/로그인합니다. 계정은 Firebase Authentication, 어휘·도감·경험치·3/7일 복습 기록은 Cloud Firestore에서 관리합니다. 학생은 이메일 확인 없이 학습할 수 있습니다. 교사 권한은 이메일 소유 확인과 관리자 승인 후 부여합니다.

- `/`: 어근 블록 합성, 빈칸 문맥 인증, 단어 도감, 재도전 퀘스트
- `/admin`: 교사만 어휘 등록·수정·게시, JSON 단어장 업로드, 학생별 학습 현황 조회
- 점수는 Vercel API가 Firestore 트랜잭션으로 계산합니다. 정답 제출 재시도와 동시 복습에 대한 중복 보상을 막습니다.
- Firebase Admin SDK가 토큰 서명·프로젝트·만료·계정 비활성화/취소 여부를 확인합니다.
- `teacher: true` 사용자 클레임과 `email_verified: true`가 함께 있어야 관리 API를 사용할 수 있습니다. 이메일 주소 입력만으로 교사가 되지 않습니다.
- Firestore 클라이언트 접근은 모두 차단합니다. 학생은 API에서 검증한 UID의 기록만 읽거나 변경할 수 있습니다.

## Firebase 설정

1. Firebase 프로젝트에 Web 앱을 등록합니다.
2. Authentication → Sign-in method에서 **Email/Password**를 켭니다. 이메일 링크 로그인이 아닙니다.
3. Firestore **Standard edition / Native mode** 데이터베이스를 생성합니다. 위치는 설정 시 결정합니다.
4. Firebase CLI로 이 폴더에서 `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`를 실행하여 `firebase/firestore.rules`를 게시합니다. 같은 Firebase 프로젝트에 다른 앱이 있으면 전용 프로젝트를 사용하세요. 이 규칙은 데이터베이스 전체의 클라이언트 접근을 차단합니다.
5. Firebase의 Web 앱 설정값과 Admin 서비스 계정 정보를 Vercel 환경 변수에 설정합니다. 실제 키는 GitHub·채팅에 올리지 않습니다.

| 환경 변수 | 사용 위치 |
|---|---|
| `FIREBASE_PROJECT_ID` | Web 앱 및 Admin SDK |
| `FIREBASE_API_KEY` | 공개 Web 설정 |
| `FIREBASE_AUTH_DOMAIN` | 공개 Web 설정 |
| `FIREBASE_APP_ID` | 공개 Web 설정 |
| `FIREBASE_CLIENT_EMAIL` | 서버 전용 서비스 계정 |
| `FIREBASE_PRIVATE_KEY` | 서버 전용 서비스 계정 개인 키. 줄바꿈 또는 `\\n` 표기 지원 |

권장: API 키의 API 제한은 Firebase Authentication에 필요한 API를 포함하도록 설정하고, 서버 서비스 계정에는 이 프로젝트의 Auth/Firestore 작업에 필요한 권한만 부여합니다.

## 교사 계정 등록

`twingkling@gmail.com`으로 먼저 회원가입합니다. `/admin`에서 **교사 이메일 확인 링크 받기**를 누르고 Firebase가 보낸 이메일에서 소유 확인을 완료합니다. 관리자용 환경에서 다음을 실행합니다. 실행에는 이 프로젝트의 Admin 서비스 계정 권한이 필요합니다.

```sh
npm install
node --env-file=.env scripts/grant-teacher.mjs --email twingkling@gmail.com
```

교사는 다시 로그인하거나 `/admin`의 권한 새로고침을 누릅니다. 교사 클레임은 브라우저에서 직접 부여할 수 없습니다.

## Vercel 배포

이 코드는 `voca` 저장소의 기존 앱과 분리한 `root-alchemy/` 폴더에 저장됩니다.

- GitHub 저장소: `twingkling-ux/voca`
- 작업 브랜치: `root-alchemy-firebase`
- Vercel Root Directory: `root-alchemy`
- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js: 22 이상

`api/app.js`는 Node 함수로 제공됩니다. 기존 `voca` 프로젝트의 루트/프로덕션 브랜치는 확인 없이 바꾸지 않습니다. Firebase 환경 변수가 없는 배포는 설정 안내를 표시하며 가짜 로그인으로 대체하지 않습니다.

## 개발과 검증

```sh
npm install
npm test
npm run build
node --env-file=.env scripts/dev.mjs
```

학생 게임과 교사 관리 화면은 Vercel API를 통해서만 데이터를 처리합니다. Firebase 공개 SDK는 Google의 버전 고정 CDN에서 가져옵니다. 비밀번호는 Firebase SDK가 Firebase로 직접 보내며 앱 데이터베이스에 저장하지 않습니다.

현재 자동 검사는 점수 계산, 중복 보상 방지, 복습 일정, 토큰 검증 호출, 학생 관리 API 차단, 다른 학생 기록 접근 차단, 입력 검증을 확인합니다. 실제 이메일 회원가입·Firestore 저장·Firebase Security Rules 검증은 연결된 Firebase 프로젝트 또는 에뮬레이터로 추가 확인해야 합니다.

## 기존 데이터

이 버전은 기존 Supabase/브라우저 기록을 삭제하거나 자동 이전하지 않습니다. 이전 앱에 저장된 사용자·학습 기록이 있다면 원본을 확인한 후 Firebase UID와 계정 이메일을 연결하는 별도 이전 작업이 필요합니다. 기존 비밀번호를 읽거나 복사하지 않습니다.
