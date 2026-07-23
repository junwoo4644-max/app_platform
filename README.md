# app_platform

내가 만든 앱들을 모아 보여주는 포털 + 개별 앱들.

## 구조

```
app_platform/
├── portal/                  새로 만든 메인 페이지 (Next.js). 로그인 + 앱스토어 목록 + 관리자 페이지
├── leaf_area/                로컬 다운로드용으로 별도 패키징 예정 (서버1에는 안 올림, 아래 참고)
├── lot platform/             별도 서버에 독립 배포되는 앱 (변경 없음)
├── nginx/nginx.conf          서버 1의 진입점 (portal로 라우팅)
└── docker-compose.yml        서버 1 전체 스택 (portal + nginx)
```

포털은 "앱 목록"을 코드가 아니라 DB(SQLite)에 저장합니다. 그래서 새 앱을 추가할 때
포털 자체를 다시 빌드/배포할 필요 없이 `/admin`에서 이름·설명·썸네일·URL만 등록하면 됩니다.

## 서버 구성

- **서버 1**: `portal`만 (이 저장소의 `docker-compose.yml` 하나로 배포)
- **서버 2**: `lot_platform` (기존 `lot platform/docker-compose.prod.yml`로 독립 배포, 변경 없음)

두 서버는 서로 다른 머신이라 직접 연결되지 않습니다. 포털은 그냥 lot_platform의 공개 URL
(예: `http://<서버2 IP>:3000`)을 앱 등록 URL로 저장해두고, 클릭하면 그 주소로 이동시킬 뿐입니다.

### leaf_area는 왜 서버1에 없나요

leaf_area는 torch/opencv/easyocr을 쓰는 무거운 이미지 분석 앱인데, 서버1이 오라클 Always Free의
아주 작은 사양(RAM 1GB 미만)이라 처리 중 메모리가 부족해서 스왑으로 밀려 심하게 느려지는 문제가
있었습니다. 그래서 서버에 상시 띄우는 대신, **사용자가 다운로드해서 자기 컴퓨터 자원으로 돌리는
방식**으로 따로 패키징할 예정입니다 (진행 상황은 `leaf_area/` 참고). 포털의 앱 카드는 준비되면
그 다운로드 링크로 연결됩니다.

## 서버 1 배포

```bash
cp .env.example .env
# .env를 열어 NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, NEXTAUTH_URL(서버 IP)을 채운다

docker compose build
docker compose up -d
```

- 포털: `http://<서버1 IP>/` (80번 포트, nginx가 portal 컨테이너로 프록시)

최초 기동 시 `.env`의 `ADMIN_EMAIL`/`ADMIN_PASSWORD`로 로그인 가능한 관리자 계정이 자동 생성됩니다.
lot_platform은 `/admin`에서 `http://<서버2 IP>:3000`을 URL로 등록하면 포털 목록에 나타납니다.

## 나중에 새 앱을 추가하는 방법 (서버 1에 함께 둘 경우)

1. 새 앱을 `app_platform/<new-app>/`에 도커화해서 넣는다 (leaf_area가 하던 것처럼 Dockerfile 보유, 단 서버1은 RAM이 작으니 무거운 앱은 배포 전에 사양부터 확인).
2. `docker-compose.yml`에 서비스 블록 추가 (호스트 포트는 노출하지 않음, 템플릿 주석 참고).
3. `nginx/nginx.conf`에 새 `listen <포트>` 서버 블록 추가 (템플릿 주석 참고), `docker compose up -d --build` 재기동.
4. 포털 `/admin`에서 이름/설명/썸네일/URL(`http://<서버1 IP>:<포트>`)로 등록.

서버 2(또는 완전히 다른 서버)에 새 앱을 올릴 경우 1~3번은 그 서버의 배포 파이프라인에서 처리하고,
포털에서는 4번만 하면 됩니다 — 포털 코드는 어느 쪽이든 손댈 필요가 없습니다.

## 도메인을 나중에 연결하면

- `nginx/nginx.conf`의 `listen <포트>`들을 `server_name <서브도메인>;`으로 바꾸고 80/443으로 통일, certbot으로 TLS 추가.
- 포털 `/admin`에서 각 앱의 URL을 새 도메인으로 갱신.
- 앱 코드는 그대로 둡니다.

## 로컬 개발 (portal만)

```bash
cd portal
cp .env.example .env
npm install
npx prisma db push
npm run seed      # ADMIN_EMAIL/ADMIN_PASSWORD로 관리자 계정 생성
npm run dev
```
