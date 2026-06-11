# 진짜 만세력 사주 계산기

생년월일시로 사주팔자 · 십성 · 지장간 · 12운성 · 신살 · 대운 · 오늘/올해의 운세 · 개운 정보(지역/색깔/음식)를 보여주는 만세력 웹사이트.

- **100% 정적 사이트** — 서버, DB, 빌드 과정 없음. `index.html` 파일 하나가 전부입니다.
- 절기(입춘·절입)는 태양 황경 천문 근사식으로 실제 시각까지 계산
- 음력 ↔ 양력 변환 지원 (1900~2100년, 윤달 포함)
- 진태양시 보정, 한국 역사 표준시(1908~1961 UTC+8:30) · 서머타임(1948~60, 1987~88) 자동 반영
- 자시 처리 옵션 (전통 / 야자시)

## 로컬 실행

`index.html` 더블클릭. 끝.

## 배포 (무료)

정적 파일 하나라 서버 비용이 **0원**입니다. 아래 중 하나를 선택:

### 방법 1 — Cloudflare Pages (추천: 한국에서 빠름, 무제한 무료)
1. https://pages.cloudflare.com 가입 (무료)
2. "Create a project" → "Direct Upload" → 이 폴더를 드래그 앤 드롭
3. 끝. `프로젝트명.pages.dev` 주소가 생깁니다.

### 방법 2 — GitHub Pages
```bash
gh repo create saju-calculator --public --source . --push
gh api repos/{owner}/saju-calculator/pages -X POST -f "source[branch]=master" -f "source[path]=/"
```
또는 GitHub 웹에서: 저장소 생성 → 푸시 → Settings → Pages → Branch: master 선택.
주소: `사용자명.github.io/saju-calculator`

### 방법 3 — Netlify Drop (가장 간단)
https://app.netlify.com/drop 에 폴더를 드래그 앤 드롭하면 즉시 배포.

### 커스텀 도메인 (선택)
위 세 서비스 모두 커스텀 도메인 + 무료 HTTPS 지원. 도메인 비용만 연 1~2만 원.

## 테스트

```bash
node test-core.js   # 핵심 계산 로직 검증 (일주 기준점, 절기, 음력 변환, 사주, 운세)
```

## 면책

운세·지역·색깔·음식 추천은 오행 상생상극 원리를 단순화한 참고용 콘텐츠입니다.
