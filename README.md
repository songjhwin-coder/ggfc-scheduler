# GGFC V76 · GitHub Pages + Firebase · 초보자 설치 순서

프로그램 접속: GitHub Pages / 로그인·자료 저장: Firebase ggfc-scheduler
허용 계정: songjhwin@gmail.com

터미널, Node.js, Firebase CLI 설치가 필요 없는 방법입니다.
아직 GitHub 업로드와 Firebase 규칙 적용은 하지 않았습니다. 아래를 직접 진행하세요.
기존 V75의 Firebase Hosting 안내와 deploy 명령은 사용하지 않습니다.

## 1. 기존 자료 백업

현재 V74에서 ‘전체 백업 저장’을 눌러 JSON을 개인 폴더에 보관합니다.
이 JSON에는 개인정보와 로고가 들어 있으므로 공개 GitHub에 올리지 않습니다.

## 2. 무료 요금제 확인

Firebase Console → ggfc-scheduler 프로젝트 → 요금제/사용량 및 결제에서 Spark인지 확인합니다.
무료 사용을 원하면 Blaze로 업그레이드하거나 Cloud Billing 계정을 연결하지 않습니다.
이 프로그램은 Google 로그인과 (default) Cloud Firestore만 사용합니다. Cloud Storage, Cloud Functions, Firebase Hosting 설정은 필요 없습니다.
무료는 무제한이 아닙니다. 한도에 도달하면 저장/불러오기가 제한될 수 있습니다. 한도 초과를 이유로 결제 전환할 필요는 없습니다.
이미 Blaze라면 Spark인지 먼저 확인·조정하세요. 다른 Google Cloud 서비스를 쓰고 있다면 해당 서비스에 미치는 영향을 확인해야 합니다.
공식 요금 안내: https://firebase.google.com/pricing

## 3. Firebase 저장 보안 규칙 적용

1. Firebase Console에서 ggfc-scheduler를 선택합니다.
2. Build → Firestore Database → Rules(규칙)로 이동합니다.
3. 이번 ZIP의 firestore.rules 파일을 메모장으로 엽니다. 연결 프로그램을 묻는다면 메모장을 선택합니다.
4. 파일 내용 전체를 Ctrl+A, Ctrl+C로 복사합니다.
5. Firebase 규칙 편집기에서 기존 내용을 전체 선택하고 붙여넣습니다.
6. Publish(게시)를 누릅니다. 이것은 자료를 공개한다는 의미가 아니라 접근 제한 규칙을 적용한다는 의미입니다.

이 규칙은 본인의 Google 계정과 UID 경로만 허용합니다. 테스트 모드의 공개 허용 규칙을 사용하지 마세요.
이 프로젝트를 다른 앱에서도 쓰고 있다면 기존 규칙을 그대로 덮어쓰지 말고 먼저 병합해야 합니다.
데이터 문서나 컬렉션은 직접 만들 필요가 없습니다. 첫 온라인 저장 때 프로그램이 생성합니다.

## 4. GitHub 저장소 준비

GitHub에 로그인한 뒤 New repository를 선택합니다.
- Repository name: ggfc-scheduler
- Visibility: Public (GitHub Free에서 Pages를 사용하려면 공개 저장소가 필요합니다.)
- Add README: 켜기
- Create repository 클릭

이미 같은 이름의 Private 저장소가 있다면, 그 안에 비밀번호·백업·개인 자료가 없는지 먼저 확인하세요.
공개 전환을 피하고 싶으면 새로운 Public 저장소 ggfc-scheduler-web을 만들어도 됩니다. 이 경우 주소의 마지막 이름만 바뀝니다.
웹 코드에는 기본 선수 실명을 제거했습니다. 실제 자료는 Firebase에만 저장합니다. 접속 페이지와 소스 자체는 공개되며 로그인 없이도 코드와 연결 정보는 볼 수 있습니다.
Firebase 설정 코드의 apiKey는 웹 연결 정보입니다. 관리자 비밀 키를 올리는 것과 다릅니다. 데이터 보호는 3단계의 서버 규칙이 담당합니다.

## 5. 웹 파일 업로드

ZIP을 압축 해제하고 다음 세 파일만 선택합니다.

    index.html
    firebase-sync.mjs
    cloud-core.mjs

GitHub 저장소 → Code → Add file → Upload files → 위 세 파일을 끌어놓습니다.
Commit changes(변경 저장)로 main 브랜치에 저장합니다.
폴더째 끌어놓지 마세요. Code 화면 첫 파일 목록에 index.html이 바로 보여야 합니다.
firestore.rules와 이 안내서는 올리지 않아도 됩니다. 전체 백업 JSON, 서비스 계정 키와 계정 비밀번호는 올리지 마세요.

## 6. GitHub Pages 켜기

저장소 → Settings → Pages로 이동합니다.
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)
- Save 클릭

잠시 기다렸다가 같은 화면의 Visit site를 누릅니다. 적용에는 수 분이 걸릴 수 있습니다.
예를 들어 GitHub 아이디가 myname이라면 다음 주소가 됩니다. myname은 본인 아이디로 바꿔야 합니다.

    https://myname.github.io/ggfc-scheduler/

GitHub 주소 github.com/myname/ggfc-scheduler는 코드 보관 화면입니다. 프로그램 사용 주소는 myname.github.io로 시작합니다.

## 7. GitHub 접속 도메인을 Firebase에 등록

Firebase Console → Authentication → Settings(설정) → Authorized domains(승인된 도메인) → Add domain(도메인 추가).

GitHub 아이디가 myname이면 아래 값만 입력합니다.

    myname.github.io

https:// 또는 /ggfc-scheduler/를 붙이지 않습니다.
firebaseConfig의 authDomain은 ggfc-scheduler.firebaseapp.com 그대로 둡니다.
Authentication → Sign-in method에서 Google이 사용 설정되어 있는지도 확인합니다.

## 8. 첫 로그인과 자료 이전

1. 6단계에서 생성된 실제 GitHub Pages 주소를 엽니다.
2. Google 로그인을 누릅니다. 팝업이 차단되면 해당 사이트의 팝업을 허용하세요.
3. songjhwin@gmail.com 계정을 선택합니다.
4. 첫 온라인 저장 전이라는 안내가 나오면 ‘전체 백업 불러오기’로 1단계 JSON을 불러옵니다.
5. 일정·명단·로고가 맞는지 확인합니다.
6. 상단 ‘온라인 저장’을 누르고 저장 완료를 기다립니다.
7. 다른 컴퓨터에서 같은 주소와 계정으로 로그인해 자료를 확인합니다.

이 컴퓨터에 임시 저장/결과 저장/기록지 설정 임시 저장은 브라우저에만 저장합니다. 다른 컴퓨터에 반영하려면 반드시 상단 온라인 저장을 누르세요.
온라인 불러오기는 현재 화면을 온라인 내용으로 바꿉니다. 편집 중인 자료를 보관하려면 먼저 전체 백업을 저장하세요.
자동 덮어쓰기를 막기 위해 다른 PC에서 먼저 저장한 경우 충돌 안내가 나옵니다. 현재 화면을 백업한 뒤 온라인 불러오기로 최신 자료를 확인하세요.
공용 컴퓨터에서는 작업 후 로그아웃하세요.

## 9. 업데이트 방법

나중에 수정본을 받으면 GitHub의 같은 위치에 웹 파일을 다시 업로드하고 Commit changes를 누르면 됩니다.
주소는 유지됩니다. GitHub Pages 적용 후 새로고침합니다.
Firebase 자료는 웹 파일 업데이트와 별개로 남습니다. 보안 규칙 변경이 있을 때만 별도로 규칙을 게시하세요.

## 자주 보이는 문제

| 상황 | 확인할 것 |
|---|---|
| 404 페이지 | index.html이 main의 최상위에 있는지, Pages의 main / root 설정과 Actions 빌드 결과 확인 |
| 연결 준비 중만 표시 | 세 웹 파일을 함께 올렸는지, 인터넷에서 www.gstatic.com 접속이 차단되지 않았는지 확인 |
| auth/unauthorized-domain | 승인된 도메인에 본인아이디.github.io 등록 |
| 로그인 팝업 차단 | 브라우저에서 해당 사이트의 팝업 허용 |
| 접근 거부 | 본인 계정인지, Firestore Rules를 게시했는지, (default) DB인지 확인 |
| 온라인 저장이 제한됨 | Firebase 콘솔의 사용량과 무료 한도 확인. 현재 화면의 전체 백업 보관 |
| 다른 PC에 최신 내용 없음 | 임시 저장이 아닌 상단 온라인 저장을 완료했는지 확인 |

## 무료 사용과 검증 범위

자료는 최대 원본 JSON 24MB이며 여러 작은 Firestore 문서로 나눠 저장합니다. 이전 저장 조각과 실패한 업로드 조각은 자동 삭제하지 않으므로 저장 횟수에 따라 저장 공간이 증가합니다. 이미지를 작게 등록하고 중요한 작업이 끝났을 때 온라인 저장하세요. Firebase 콘솔에서 사용량을 주기적으로 확인하고 전체 백업을 보관하세요.
서버 권한 규칙, 로그인과 두 PC 간 실제 동작은 사용자가 위 설정을 마친 뒤 확인해야 합니다. 실제 사이트가 생성되었다고 가정하지 마세요.

공식 문서:
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Firebase Google 로그인: https://firebase.google.com/docs/auth/web/google-signin
- Firebase 무료 요금제: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
