# SHOUT! : Vercel 배포 및 무료 데이터베이스(PostgreSQL) 연동 가이드 🚀

본 프로젝트를 Vercel에 배포하여 실제 서비스로 운영하기 위해서는, 기존의 로컬 저장 파일(`dev.db`) 대신 크라우드 상에서 동작하는 **PostgreSQL**이 필요합니다.

현재 시장에서 가장 추천하는 **완전 무료(Free Tier)** 데이터베이스 호스팅 사이트 두 곳과 Vercel 연동 방법을 안내합니다.

---

## 🏆 추천 무료 데이터베이스 호스팅 사이트

### 1. Neon (가장 추천 🌟)

- **특징:** Serverless Postgres 시스템으로 Vercel과 궁합이 가장 좋습니다. 사용하지 않을 때는 규모를 0으로 줄여 과금이 발생하지 않는 아키텍처를 가집니다.
- **장점:** 속도가 매우 빠르고, Vercel 대시보드 내에서 "Marketplace" 통합 버튼 한 번으로 손쉽게 연동이 가능합니다.
- **주소:** [https://neon.tech/](https://neon.tech/)

### 2. Supabase

- **특징:** 오픈소스 Firebase 대안으로 불리며, 백엔드 서비스 전반(DB, Auth, Storage)을 제공합니다.
- **장점:** 넉넉한 500MB의 무료 데이터베이스 용량을 영구적으로 제공하며 대시보드 UI가 몹시 직관적입니다.
- **주소:** [https://supabase.com/](https://supabase.com/)

---

## 🛠️ Step 1. 무료 데이터베이스 생성하기 (Neon 기준)

가장 연동이 쉽고 깔끔한 **Neon**을 기준으로 설명합니다. (Supabase도 방식은 99% 동일합니다)

1. **회원가입 및 프로젝트 생성:**
   - [Neon.tech](https://neon.tech/) 에 접속하여 GitHub 계정 등으로 로그인합니다.
   - `Create a Project` 버튼을 누르고 프로젝트 이름(예: `shout-db`)과 지역(Region: 가까운 아시아 지역 추천, 예: Singapore)을 선택합니다.
   - Postgres 버전을 선택(권장 옵션)하고 생성을 완료합니다.

2. **DATABASE_URL(연결 문자열) 복사:**
   - Dashboard 메인에 보면 `Connection Details` 항목이 있습니다.
   - 포맷을 `Prisma` 로 선택하면 `postgres://...` 로 시작하는 아주 긴 텍스트가 나옵니다.
   - 해당 텍스트를 복사해둡니다. (이것이 우주 유일의 여권같은 DB 연결 주소입니다).

---

## 🛠️ Step 2. Vercel 배포 및 연동하기

이제 복사한 DB 주소를 들고 Vercel로 이동합니다.

1. **Vercel 프로젝트 생성:**
   - [Vercel Dashboard](https://vercel.com/dashboard) 로그인 후 위쪽의 `Add New... ➔ Project` 클릭.
   - GitHub에 올려둔 `MakeASound` (게임 레포지토리)를 **Import** 합니다.

2. **환경 변수(Environment Variables) 세팅 (★ 핵심):**
   - Import를 누르면 나오는 설정 창에서 **Environment Variables** 탭을 클릭해 엽니다.
   - 다음의 세 가지 값을 반드시! 입력해야 합니다.

   | KEY               | VALUE                                                 | 비고                                               |
   | :---------------- | :---------------------------------------------------- | :------------------------------------------------- |
   | `DATABASE_URL`    | 방금 Neon에서 복사한 `postgres://...` 주소            | 큰따옴표("") 없이 주소만 입력                      |
   | `NEXTAUTH_SECRET` | 임의의 복잡한 문자열 (예: `my-super-secret-key-1234`) | 세션/토큰 암호화 보안키                            |
   | `NEXTAUTH_URL`    | `https://내-프로젝트.vercel.app`                      | 추후 배포될 사이트 주소를 미리 예측해 적습니다. 🚨 |

3. **Deploy (배포 시작):**
   - 변수 입력을 다 마쳤다면 하단의 파란색 **Deploy** 버튼을 누릅니다.
   - (에러가 나더라도 침착하게 다음 단계를 밟습니다.)

---

## 🛠️ Step 3. Prisma 스키마 연동 (배포 후 필수 체크)

만약 배포 중 "Prisma" 관련 오류나 "Table not found" 에러가 났다면, 클라우드 DB(Neon)가 아직 비어있어 테이블이 없기 때문입니다.

Vercel은 배포될 때 테이블을 자동으로 만들어주지 않으므로, 다음 조치가 필요합니다:

**방법 A: Github Action/Vercel Build Command 수정**
Vercel 프로젝트 화면 ➔ Settings ➔ General ➔ **Build & Development Settings** 에서 `Build Command`를 오버라이드하여 다음으로 변경하고 재배포.

```bash
npx prisma generate && npx prisma db push && next build
```

**방법 B: 로컬에서 수동으로 밀어넣기 (추천!)**
여러분의 컴퓨터 `MakeASound` 서버 터미널에서 로컬 테스트를 마쳤다면 다음과 같이 강제 푸시합니다.

1. 내 컴퓨터의 `.env` (또는 `.env.local`) 파일의 `DATABASE_URL` 값을 잠깐 Neon의 URL로 변경합니다.
2. 터미널(VSCode)에서 `npx prisma db push`를 입력합니다.
3. 내 컴퓨터에서 클라우드 DB로 접속하여 User 등의 테이블 껍데기를 생성해 줍니다.
4. 이후 Vercel에서 재배포를 누르면 접속이 성공적으로 이루어집니다.

---

### 🎉 성공하셨습니다!

이제 여러분의 Next.js Vercel 서버가 Neon(또는 Supabase) 데이터베이스를 실시간으로 참조하여, 전 세계 어느 유저가 붙더라도 회원가입과 튜토리얼 진행사항이 안전하게 클라우드에 영구 저장됩니다.
