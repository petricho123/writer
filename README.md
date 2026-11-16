# Paper Desk

맥북에서 쓰는 오프라인 타자기 메모장. 작성한 글은 브라우저의 로컬 저장 공간에만 보관됩니다.

## GitHub Pages 배포

1. GitHub에 `paper-desk` 저장소를 만들고 ZIP을 푼 폴더의 **내용 전체**를 `main`에 올립니다. 숨김 폴더 `.github`도 필요합니다.
2. 저장소 **Settings → Pages → Source**에서 **GitHub Actions**를 선택합니다.
3. **Actions → Deploy Paper Desk → Run workflow**를 실행합니다. 이후 main에 푸시하면 다시 배포됩니다.
4. 배포 작업이 출력하는 Pages 주소를 Safari에서 열고, 지원되는 macOS에서는 **파일 → Dock에 추가**를 선택합니다. Chrome에서는 주소창의 설치 버튼을 사용할 수 있습니다.

처음에는 인터넷에 연결된 상태로 열어 주세요. 이후 같은 브라우저나 설치한 앱에서 오프라인으로 글을 쓸 수 있습니다. Safari 탭과 Dock 앱 등 서로 다른 저장 공간 사이에는 메모가 자동으로 복사되지 않습니다. 브라우저에서 해당 사이트의 데이터를 지우면 메모도 삭제됩니다.
