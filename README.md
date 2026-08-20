# 🥗 위드 알러지 세이프쿡 (With Allergy SafeCook)

> **"누구나 걱정 없이, 안전하고 맛있는 한 끼를 요리할 수 있도록!"**  
> 음식 알레르기 유발 성분을 자동으로 제외해 주는 스마트 맞춤형 레시피 검색 웹 애플리케이션입니다.

---

## ✨ 주요 기능 (Key Features)

1. **🛡️ 6대 핵심 알레르기 자동 제외 필터링**
   - **우유, 계란, 밀, 땅콩, 갑각류, 대두** 중 피하고 싶은 알레르기 항목을 체크하면, 해당 성분이 포함된 요리를 실시간으로 자동 제외합니다.
   - 중복 선택 및 다중 필터링을 완벽하게 지원합니다.

2. **⚠️ 직관적인 재료 목록 & 알러지 경고 아이콘**
   - 레시피 카드 겉면에서 요리에 들어가는 주요 식재료 목록을 바로 확인할 수 있습니다.
   - 알레르기 유발 가능 성분 옆에는 **선명한 경고 아이콘(`⚠️`)과 주의 뱃지**가 함께 표시되어 한눈에 식별할 수 있습니다.

3. **🍲 대중적이고 친숙한 10종 레시피 데이터**
   - **국민 한식 5종**: 김치찌개, 차돌 된장찌개, 소불고기 볶음, 야채 계란말이, 쌀 떡볶이
   - **인기 양식 5종**: 크림 까르보나라, 토마토 미트스파게티, 페퍼로니 피자, 수제 치즈버거, 허브 웨지감자
   - 각 요리에 1:1로 매칭된 고화질 음식 사진 제공

4. **💡 알러지 대체재료 꿀팁 & 상세 조리법 모달**
   - 카드를 클릭하면 알레르기 환자를 위한 **안전한 대체 식재료(글루텐프리 면, 식물성 치즈, 코코넛 아미노스 등)** 꿀팁과 단계별 조리법을 상세히 안내합니다.

5. **📱 모바일 & 데스크톱 반응형 디자인**
   - 스마트폰, 태블릿, PC 등 모든 기기 화면에 최적화된 민트/틸(Mint & Teal) 컬러의 모던 UI/UX를 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: HTML5, CSS3 (Modern CSS Grid & Flexbox, CSS Variables), Vanilla JavaScript (ES6+)
- **Icons**: Font Awesome 6.5
- **Fonts**: Google Fonts (Pretendard / Noto Sans KR)
- **Deployment**: Vercel & GitHub

---

## 📂 프로젝트 구조 (Project Structure)

```text
with-allergy-safecook/
├── .gitignore        # Git 업로드 제외 설정 파일
├── README.md          # 프로젝트 안내 문서
├── vercel.json        # Vercel 배포 및 캐시 설정 파일
├── index.html         # 메인 웹 페이지 마크업
├── style.css          # 디자인 및 반응형 스타일시트
├── app.js             # 실시간 알러지 필터링 & 인터랙션 로직
└── recipes.json       # 10종 레시피 원본 데이터셋
```

---

## 🚀 로컬 실행 방법 (Getting Started)

별도의 라이브러리 설치 없이 브라우저에서 바로 실행하거나, 로컬 웹 서버로 열 수 있습니다.

```bash
# 파이썬으로 로컬 서버 실행 시
python -m http.server 5500

# 브라우저 접속
http://localhost:5500
```

---

## 🌐 Vercel 배포 가이드 (Deployment)

1. 본 레포지토리를 GitHub에 Push합니다.
2. [Vercel](https://vercel.com)에 로그인한 뒤 **Import Project**를 클릭합니다.
3. 빌드 설정 변경 없이 **Deploy** 버튼을 누르면 약 10초 내에 배포가 완료됩니다.

---

## 📄 라이선스 (License)

This project is licensed under the MIT License - see the LICENSE file for details.
