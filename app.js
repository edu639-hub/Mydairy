/**
 * ==========================================================================
 * 위드 알러지 세이프쿡 (With Allergy SafeCook) - 메인 자바스크립트
 * ==========================================================================
 * 
 * [핵심 기능 설명]
 * 1. 6대 알레르기(우유, 계란, 밀, 땅콩, 갑각류, 대두) 체크박스 실시간 연동
 * 2. 안전 최우선 자동 제외 필터링 엔진:
 *    - 사용자가 체크박스로 알러지 성분을 선택하면, 해당 성분이 포함된 레시피를 목록에서 즉시 자동 제외!
 * 3. 대중적이고 친숙한 10종 레시피 데이터셋 및 음식 1:1 맞춤 고화질 이미지 매칭
 * 4. 레시피 카드 내 재료 목록 렌더링 및 알러지 유발 성분 옆 경고 아이콘(⚠️) 표시
 * 5. recipes.json 비동기 로딩 및 고화질 이미지 안정적 렌더링 (이미지 폴백 지원)
 * 6. 실시간 키워드 검색, 카테고리 탭(전체/한식/양식), 조리시간/난이도 정렬
 * 7. 알러지 대체재료 꿀팁 및 단계별 조리법을 보여주는 상세 모달 팝업
 */

// --------------------------------------------------------------------------
// 1. 알레르기 메타데이터 및 기본 레시피 데이터 (Data Definitions)
// --------------------------------------------------------------------------

/**
 * 6대 핵심 알레르기 유발 성분 메타 정보
 */
const ALLERGY_METADATA = {
    'milk': { name: '우유', emoji: '🥛', badge: '유제품' },
    'egg': { name: '계란', emoji: '🥚', badge: '난류' },
    'wheat': { name: '밀', emoji: '🌾', badge: '글루텐' },
    'peanut': { name: '땅콩', emoji: '🥜', badge: '견과류' },
    'crustacean': { name: '갑각류', emoji: '🦐', badge: '새우/게' },
    'soy': { name: '대두', emoji: '🫘', badge: '콩/간장' }
};

/**
 * 대중적이고 친숙한 10종 한식/양식 기본 내장 레시피 데이터셋 (음식 1:1 맞춤 고화질 이미지)
 */
let RECIPES_DATA = [
    {
        id: 1,
        title: "돼지고기 듬뿍 신김치찌개",
        category: "한식",
        time: 25,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80",
        imageDescription: "뚝배기에서 보글보글 끓고 있는 얼큰하고 진한 붉은 국물의 돼지고기 김치찌개",
        description: "잘 익은 신김치와 쫄깃한 돼지고기, 고소한 두부를 듬뿍 넣어 얼큰하고 진하게 끓여낸 국민 밥도둑 찌개입니다.",
        allergens: ["대두"],
        allergenIds: ["soy"],
        safeBadges: ["밀가루 FREE", "우유 FREE", "계란 FREE", "땅콩 FREE", "갑각류 FREE"],
        ingredients: [
            { name: "잘 익은 신김치", amount: "1/4포기 (300g)", isAllergen: false },
            { name: "돼지고기 목살", amount: "200g", isAllergen: false },
            { name: "부드러운 두부", amount: "1/2모 (150g)", isAllergen: true, allergenName: "대두" },
            { name: "대파", amount: "1/2대", isAllergen: false },
            { name: "양파", amount: "1/2개", isAllergen: false },
            { name: "고춧가루", amount: "1.5큰술", isAllergen: false },
            { name: "국간장 (또는 천일염)", amount: "1큰술", isAllergen: true, allergenName: "대두" },
            { name: "다진 마늘", amount: "1큰술", isAllergen: false }
        ],
        substitutes: "대두 알레르기가 있는 경우 두부 대신 쫄깃한 떡이나 감자를 넣고, 국간장 대신 천일염(소금)으로 간을 맞추면 대두 없이도 아주 시원하고 맛있습니다.",
        steps: [
            "냄비에 송송 썬 돼지고기와 신김치를 넣고 중불에서 3분간 달달 볶습니다.",
            "고기 겉면이 익으면 쌀뜨물 또는 물 600ml를 붓고 센 불에서 끓입니다.",
            "찌개가 끓어오르면 다진 마늘, 고춧가루, 양파를 넣고 중약불로 줄여 15분간 뭉근하게 끓입니다.",
            "두부와 대파를 올리고 국간장이나 소금으로 간을 맞춘 뒤 3분간 더 끓여 완성합니다."
        ]
    },
    {
        id: 2,
        title: "구수한 차돌박이 된장찌개",
        category: "한식",
        time: 20,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
        imageDescription: "뚝배기에 차돌박이와 애호박, 두부, 팽이버섯이 푸짐하게 담겨 끓고 있는 구수한 된장찌개",
        description: "고소한 차돌박이의 깊은 육즙과 구수한 재래식 된장, 신선한 애호박과 두부가 어우러진 든든한 찌개입니다.",
        allergens: ["대두"],
        allergenIds: ["soy"],
        safeBadges: ["밀가루 FREE", "우유 FREE", "계란 FREE", "땅콩 FREE", "갑각류 FREE"],
        ingredients: [
            { name: "소고기 차돌박이", amount: "120g", isAllergen: false },
            { name: "재래식 된장", amount: "2큰술", isAllergen: true, allergenName: "대두" },
            { name: "두부", amount: "1/2모", isAllergen: true, allergenName: "대두" },
            { name: "애호박", amount: "1/3개", isAllergen: false },
            { name: "팽이버섯", amount: "1/2봉", isAllergen: false },
            { name: "양파", amount: "1/2개", isAllergen: false },
            { name: "다진 마늘", amount: "0.5큰술", isAllergen: false }
        ],
        substitutes: "대두 알레르기가 있는 분은 쌀된장(쌀 누룩 발효장) 또는 맑은 소고기 무국 스타일로 끓여 천일염으로 간을 맞추시면 안전합니다.",
        steps: [
            "냄비에 차돌박이를 넣고 중불에서 볶아 고소한 기름을 냅니다.",
            "물 500ml를 붓고 된장 2큰술을 체에 걸러 곱게 풀어줍니다.",
            "한 입 크기로 썬 애호박, 양파, 다진 마늘을 넣고 7분간 끓입니다.",
            "두부와 팽이버섯, 대파를 넣고 3분간 더 끓여 구수하게 마무리합니다."
        ]
    },
    {
        id: 3,
        title: "달콤 짭조름 소불고기 볶음",
        category: "한식",
        time: 20,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
        imageDescription: "윤기 나는 특제 간장 양념에 얇게 썬 소고기와 아삭한 양파, 팽이버섯이 지글지글 볶아진 불고기",
        description: "야들야들한 소고기에 달콤 짭조름한 특제 간장 양념과 채소를 듬뿍 넣어 남녀노소 누구나 좋아하는 국민 반찬입니다.",
        allergens: ["대두"],
        allergenIds: ["soy"],
        safeBadges: ["밀가루 FREE", "우유 FREE", "계란 FREE", "땅콩 FREE", "갑각류 FREE"],
        ingredients: [
            { name: "소고기 불고기감", amount: "300g", isAllergen: false },
            { name: "양파", amount: "1/2개", isAllergen: false },
            { name: "대파", amount: "1대", isAllergen: false },
            { name: "팽이버섯", amount: "1/2봉", isAllergen: false },
            { name: "당근", amount: "1/4개", isAllergen: false },
            { name: "진간장", amount: "3큰술", isAllergen: true, allergenName: "대두" },
            { name: "설탕 (올리고당)", amount: "1.5큰술", isAllergen: false },
            { name: "참기름", amount: "1큰술", isAllergen: false }
        ],
        substitutes: "대두 알레르기가 있다면 간장 대신 코코넛 아미노스(Coconut Aminos)나 굴소스 대체 어간장으로 양념하면 감칠맛 넘치게 완성됩니다.",
        steps: [
            "볼에 진간장, 설탕, 다진 마늘, 참기름, 후추를 섞어 불고기 양념장을 만듭니다.",
            "소고기에 양념장을 골고루 버무려 10분간 재워둡니다.",
            "달군 팬에 기름을 살짝 두르고 양념한 소고기와 채 썬 양파, 당근을 센 불에서 볶습니다.",
            "고기가 익으면 팽이버섯과 대파를 넣고 센 불에서 1분간 빠르게 볶아 통깨를 뿌려 완성합니다."
        ]
    },
    {
        id: 4,
        title: "부드럽고 도톰한 야채 계란말이",
        category: "한식",
        time: 12,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
        imageDescription: "노란 달걀에 알록달록한 당근과 대파가 콕콕 박혀 도톰하고 예쁘게 말아 썰어낸 계란말이",
        description: "신선한 달걀에 당근과 대파를 송송 썰어 넣어 부드럽고 폭신하게 말아낸 한국인의 영원한 인기 도시락 반찬입니다.",
        allergens: ["계란"],
        allergenIds: ["egg"],
        safeBadges: ["밀가루 FREE", "우유 FREE", "대두 FREE", "땅콩 FREE", "갑각류 FREE"],
        ingredients: [
            { name: "신선한 달걀", amount: "4알", isAllergen: true, allergenName: "계란" },
            { name: "당근 (다짐)", amount: "2큰술", isAllergen: false },
            { name: "대파 (다짐)", amount: "2큰술", isAllergen: false },
            { name: "천일염", amount: "1/3작은술", isAllergen: false },
            { name: "식용유", amount: "1.5큰술", isAllergen: false }
        ],
        substitutes: "계란 알레르기가 있다면 단호박 퓨레에 쌀가루와 감자전분을 섞어 두툼하게 부쳐내면 계란 없이도 노란 빛깔의 고소한 전 요리가 됩니다.",
        steps: [
            "볼에 달걀 4알을 깨뜨려 넣고 소금을 넣은 뒤 멍울이 없도록 곱게 풀어줍니다.",
            "다진 당근과 대파를 달걀물에 넣고 골고루 섞습니다.",
            "팬에 기름을 얇게 두르고 약불로 예열한 뒤 달걀물의 1/3을 얇게 붓습니다.",
            "가장자리가 익기 시작하면 살살 말아 올리고, 빈 공간에 남은 달걀물을 나누어 부어가며 도톰하게 말아 한 김 식힌 후 썹니다."
        ]
    },
    {
        id: 5,
        title: "매콤달콤 쫄깃 쌀 떡볶이",
        category: "한식",
        time: 18,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
        imageDescription: "윤기 나는 빨간 양념 국물에 쫄깃한 떡과 어묵, 송송 썬 대파가 어우러진 매콤달콤 떡볶이",
        description: "100% 쌀떡의 쫄깃한 식감과 매콤달콤 감칠맛 나는 특제 양념이 쏙 배어든 대한민국 대표 국민 분식입니다.",
        allergens: ["대두", "밀"],
        allergenIds: ["soy", "wheat"],
        safeBadges: ["우유 FREE", "계란 FREE", "땅콩 FREE", "갑각류 FREE"],
        ingredients: [
            { name: "100% 쌀 떡볶이 떡", amount: "300g", isAllergen: false },
            { name: "사각 어묵", amount: "2장", isAllergen: true, allergenName: "밀가루/대두" },
            { name: "대파", amount: "1대", isAllergen: false },
            { name: "고추장", amount: "2큰술", isAllergen: true, allergenName: "대두" },
            { name: "고춧가루", amount: "1큰술", isAllergen: false },
            { name: "진간장", amount: "1큰술", isAllergen: true, allergenName: "대두" },
            { name: "설탕 / 올리고당", amount: "2큰술", isAllergen: false }
        ],
        substitutes: "밀/대두 알레르기가 있다면 어묵 대신 비엔나소시지나 삶은 메추리알을 넣고, 고추장 대신 고춧가루+소금+조청으로 깔끔한 글루텐프리 떡볶이를 만드실 수 있습니다.",
        steps: [
            "냄비에 물 400ml와 고추장, 고춧가루, 진간장, 설탕을 넣고 잘 풀어 끓입니다.",
            "국물이 끓어오르면 씻어둔 쌀떡과 먹기 좋게 썬 어묵을 넣습니다.",
            "중불에서 떡에 양념이 배어들고 국물이 걸쭉해질 때까지 6~8분간 저어가며 조립니다.",
            "큼직하게 썬 대파를 넣고 1분간 더 끓여 그릇에 담아냅니다."
        ]
    },
    {
        id: 6,
        title: "클래식 베이컨 크림 까르보나라",
        category: "양식",
        time: 18,
        difficulty: "보통",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
        imageDescription: "고소하고 크리미한 화이트 크림 소스에 스파게티면과 바삭한 베이컨이 풍성하게 어우러진 파스타",
        description: "고소한 생크림과 우유, 짭조름하고 바삭한 베이컨, 양송이버섯이 입안 가득 감기는 부드러운 인기 파스타입니다.",
        allergens: ["밀", "우유"],
        allergenIds: ["wheat", "milk"],
        safeBadges: ["계란 FREE", "땅콩 FREE", "갑각류 FREE", "대두 FREE"],
        ingredients: [
            { name: "스파게티 파스타면", amount: "100g", isAllergen: true, allergenName: "밀" },
            { name: "생크림", amount: "150ml", isAllergen: true, allergenName: "우유" },
            { name: "우유", amount: "50ml", isAllergen: true, allergenName: "우유" },
            { name: "베이컨", amount: "4줄 (60g)", isAllergen: false },
            { name: "양송이버섯", amount: "2개", isAllergen: false },
            { name: "다진 마늘", amount: "1큰술", isAllergen: false },
            { name: "파마산 치즈가루", amount: "1큰술", isAllergen: true, allergenName: "우유" }
        ],
        substitutes: "밀가루 알레르기엔 글루텐프리 현미 파스타면을, 유제품 알레르기엔 무가당 두유나 귀리(오트) 크림을 사용하면 고소함 그대로 즐길 수 있습니다.",
        steps: [
            "끓는 물에 소금 1큰술을 넣고 스파게티 면을 8분간 삶아 건져냅니다.",
            "팬에 올리브유를 살짝 두르고 다진 마늘과 썬 베이컨, 양송이버섯을 노릇하게 볶습니다.",
            "생크림과 우유를 붓고 끓어오르면 삶은 면과 파마산 치즈가루, 후추를 넣습니다.",
            "중불에서 소스가 면에 찰기 있게 코팅될 때까지 1~2분간 저어 완성합니다."
        ]
    },
    {
        id: 7,
        title: "토마토 미트소스 스파게티",
        category: "양식",
        time: 20,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
        imageDescription: "풍성한 다진 소고기와 상큼하고 진한 붉은 토마토 소스가 스파게티면에 듬뿍 얹어진 볼로네제 파스타",
        description: "신선한 완숙 토마토 소스에 고소한 다진 소고기와 양파를 뭉근하게 볶아내어 깊은 감칠맛을 자랑하는 클래식 파스타입니다.",
        allergens: ["밀", "우유"],
        allergenIds: ["wheat", "milk"],
        safeBadges: ["계란 FREE", "땅콩 FREE", "갑각류 FREE", "대두 FREE"],
        ingredients: [
            { name: "스파게티 파스타면", amount: "100g", isAllergen: true, allergenName: "밀" },
            { name: "다진 소고기", amount: "100g", isAllergen: false },
            { name: "토마토 스파게티 소스", amount: "200g", isAllergen: false },
            { name: "양파 (다짐)", amount: "1/2개", isAllergen: false },
            { name: "다진 마늘", amount: "1큰술", isAllergen: false },
            { name: "올리브유", amount: "2큰술", isAllergen: false },
            { name: "파마산 치즈가루", amount: "약간", isAllergen: true, allergenName: "우유" }
        ],
        substitutes: "밀가루 알레르기엔 옥수수나 쌀 파스타면을, 우유 알레르기엔 파마산 치즈 토핑을 생략하고 생 바질 잎으로 상큼함을 더해보세요.",
        steps: [
            "끓는 물에 소금을 넣고 스파게티 면을 알덴테(8분)로 삶습니다.",
            "달군 팬에 올리브유를 두르고 다진 마늘과 양파, 다진 소고기를 넣어 고기가 갈색이 될 때까지 볶습니다.",
            "토마토 스파게티 소스를 붓고 중약불에서 3분간 뭉근하게 끓여 고기 육즙과 어우러지게 합니다.",
            "삶은 파스타면을 넣고 소스와 함께 센 불에서 1분간 버무린 후 접시에 담아냅니다."
        ]
    },
    {
        id: 8,
        title: "모짜렐라 치즈 듬뿍 페퍼로니 피자",
        category: "양식",
        time: 15,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        imageDescription: "노릇하게 구워진 도우 위에 쭈욱 늘어나는 모짜렐라 치즈와 짭조름한 페퍼로니가 가득 올려진 피자",
        description: "바삭하고 쫄깃한 도우 위에 진한 토마토소스, 고소하게 쭉 늘어나는 모짜렐라 치즈와 페퍼로니를 얹은 홈메이드 피자입니다.",
        allergens: ["밀", "우유"],
        allergenIds: ["wheat", "milk"],
        safeBadges: ["계란 FREE", "땅콩 FREE", "갑각류 FREE", "대두 FREE"],
        ingredients: [
            { name: "피자 도우 (또는 또띠아)", amount: "1장", isAllergen: true, allergenName: "밀" },
            { name: "모짜렐라 피자치즈", amount: "120g", isAllergen: true, allergenName: "우유" },
            { name: "페퍼로니 햄", amount: "10장", isAllergen: false },
            { name: "토마토 피자 소스", amount: "3큰술", isAllergen: false },
            { name: "건 바질 가루", amount: "약간", isAllergen: false }
        ],
        substitutes: "밀가루 알레르기엔 라이스페이퍼를 겹치거나 감자채를 바닥에 깔아 도우로 쓰고, 유제품 알레르기엔 식물성 코코넛 비건 치즈를 추천합니다.",
        steps: [
            "도우 표면에 토마토소스를 숟가락으로 넓고 고르게 펴 바릅니다.",
            "모짜렐라 치즈를 도우 전체에 아낌없이 듬뿍 뿌려줍니다.",
            "페퍼로니 햄을 보기 좋게 올리고 허브 가루를 살짝 뿌립니다.",
            "190도로 예열된 에어프라이어나 오븐에서 치즈가 노릇하게 녹을 때까지 7~8분간 구워냅니다."
        ]
    },
    {
        id: 9,
        title: "육즙 가득 클래식 수제 치즈버거",
        category: "양식",
        time: 20,
        difficulty: "보통",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        imageDescription: "참깨 번 빵 사이에 두툼한 소고기 패티와 사르르 녹은 노란 체다치즈, 신선한 양상추와 토마토가 든 버거",
        description: "도톰한 100% 소고기 패티의 풍부한 육즙과 고소하게 녹아내린 체다치즈, 아삭한 양상추가 조화를 이루는 프리미엄 버거입니다.",
        allergens: ["밀", "우유", "계란"],
        allergenIds: ["wheat", "milk", "egg"],
        safeBadges: ["땅콩 FREE", "갑각류 FREE", "대두 FREE"],
        ingredients: [
            { name: "햄버거용 번 빵", amount: "1개", isAllergen: true, allergenName: "밀" },
            { name: "순소고기 수제 패티", amount: "1장 (150g)", isAllergen: false },
            { name: "체다 슬라이스 치즈", amount: "1장", isAllergen: true, allergenName: "우유" },
            { name: "신선한 양상추", amount: "2장", isAllergen: false },
            { name: "완숙 토마토 슬라이스", amount: "1장", isAllergen: false },
            { name: "버거 마요 소스", amount: "1.5큰술", isAllergen: true, allergenName: "계란" }
        ],
        substitutes: "밀가루/계란 알레르기가 있다면 쌀가루 빵과 아보카도/홀그레인 머스터드 소스를 사용하고, 치즈 대신 구운 양파로 풍미를 높일 수 있습니다.",
        steps: [
            "달군 팬에 버터 또는 기름을 살짝 두르고 소고기 패티를 앞뒤로 노릇하게 구워냅니다.",
            "패티가 거의 다 익었을 때 불을 줄이고 위에 체다치즈를 얹어 뚜껑을 덮고 30초간 살짝 녹입니다.",
            "번 빵 안쪽을 살짝 구운 뒤 소스를 펴 바릅니다.",
            "아래 빵 위에 양상추, 토마토, 치즈 패티, 피클을 순서대로 쌓고 윗 빵을 덮어 완성합니다."
        ]
    },
    {
        id: 10,
        title: "바삭 담백 허브 웨지 감자구이",
        category: "양식",
        time: 25,
        difficulty: "쉬움",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
        imageDescription: "노릇노릇하고 바삭하게 구워진 반달 모양의 웨지 감자에 향긋한 파슬리와 허브 소금이 솔솔 뿌려진 요리",
        description: "기름에 튀기지 않고 오븐에 구워 겉은 바삭하고 속은 포슬포슬한 남녀노소 최고의 14대 알러지 프리 웰빙 감자 스낵입니다.",
        allergens: [], // 6대 알레르기 완전 배제
        allergenIds: [],
        safeBadges: ["6대 알러지 FREE", "글루텐 FREE", "비건(Vegan)", "유제품 FREE", "계란 FREE"],
        ingredients: [
            { name: "신선한 감자", amount: "3개", isAllergen: false },
            { name: "엑스트라 버진 올리브유", amount: "2.5큰술", isAllergen: false },
            { name: "천일염 (허브 솔트)", amount: "1/2작은술", isAllergen: false },
            { name: "파슬리 가루", amount: "1/2작은술", isAllergen: false },
            { name: "통후추 가루", amount: "약간", isAllergen: false }
        ],
        substitutes: "14대 주요 알레르기 유발 물질이 일절 들어가지 않아 알레르기가 있는 아이들도 마음껏 안심하고 즐길 수 있는 최고의 간식입니다.",
        steps: [
            "감자는 껍질째 깨끗이 씻은 후 반달 모양의 웨지(8등분)로 썹니다.",
            "찬물에 10분간 담가 전분기를 빼준 뒤 키친타월로 물기를 완전히 닦아냅니다.",
            "볼에 감자와 올리브유, 허브 솔트, 파슬리 가루를 넣고 골고루 버무려 코팅합니다.",
            "190도로 예열된 에어프라이어 또는 오븐에 감자를 겹치지 않게 펼치고 20~25분간 바삭하게 구워냅니다."
        ]
    }
];

// --------------------------------------------------------------------------
// 2. 전역 상태 관리 (Global State)
// --------------------------------------------------------------------------

const state = {
    selectedAllergens: new Set(), // 체크된 알러지 ID 목록 (예: Set {'milk', 'egg'})
    selectedCategory: 'all',     // 'all' | '한식' | '양식'
    searchKeyword: '',          // 검색창 입력 텍스트
    sortOrder: 'recommended'     // 'recommended' | 'time-asc' | 'difficulty-asc'
};

// 기본 대체 이미지 URL (이미지 로드 실패 시 사용)
const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

// --------------------------------------------------------------------------
// 3. DOM 요소 참조 (DOM Elements)
// --------------------------------------------------------------------------

// 체크박스 필터 관련 요소
const allergyCheckboxes = document.querySelectorAll('.allergy-checkbox');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const selectedSummaryBar = document.getElementById('selectedSummaryBar');
const selectedTagsList = document.getElementById('selectedTagsList');

// 검색창 관련 요소
const recipeSearchInput = document.getElementById('recipeSearchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// 카테고리 탭 & 정렬 요소
const categoryTabs = document.getElementById('categoryTabs');
const recipeSortSelect = document.getElementById('recipeSortSelect');
const recipeCountEl = document.getElementById('recipeCount');

// 레시피 카드 그리드 및 빈 상태 화면
const recipeGrid = document.getElementById('recipeGrid');
const emptyState = document.getElementById('emptyState');
const emptyResetBtn = document.getElementById('emptyResetBtn');

// 레시피 상세 모달 요소
const recipeDetailModal = document.getElementById('recipeDetailModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalContentBody = document.getElementById('modalContentBody');

// --------------------------------------------------------------------------
// 4. 애플리케이션 초기화 (App Initialization)
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    // 1) recipes.json 파일 비동기 로딩 시도
    await fetchRecipesJson();

    // 2) 레시피 목록 최초 화면 렌더링
    updateRecipeDisplay();

    // 3) 모든 사용자 인터랙션 이벤트 리스너 등록
    setupEventListeners();
});

/**
 * recipes.json 파일을 fetch하여 데이터셋 동기화
 */
async function fetchRecipesJson() {
    try {
        const response = await fetch('recipes.json');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                RECIPES_DATA = data;
                console.log(`[위드 알러지 세이프쿡] recipes.json 로드 성공 (${data.length}개 레시피)`);
            }
        }
    } catch (err) {
        console.info('[위드 알러지 세이프쿡] 로컬 내장 레시피 데이터셋으로 구동합니다.');
    }
}

/**
 * 전체 이벤트 리스너 바인딩
 */
function setupEventListeners() {
    // 1. 체크박스 change 이벤트 바인딩 (우유, 계란, 밀, 땅콩, 갑각류, 대두)
    allergyCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const allergenId = e.target.value;
            if (e.target.checked) {
                // 체크됨 -> 제외 대상 알러지에 추가
                state.selectedAllergens.add(allergenId);
            } else {
                // 체크 해제됨 -> 제외 대상 알러지에서 삭제
                state.selectedAllergens.delete(allergenId);
            }

            // 상단 요약 바 갱신
            updateSelectedSummaryBar();

            // 레시피 목록 자동 재필터링 실행
            updateRecipeDisplay();
        });
    });

    // 2. 필터 전체 초기화 버튼
    resetFilterBtn.addEventListener('click', resetAllFilters);
    emptyResetBtn.addEventListener('click', resetAllFilters);

    // 3. 키워드 검색창 입력 이벤트
    recipeSearchInput.addEventListener('input', (e) => {
        state.searchKeyword = e.target.value.trim().toLowerCase();
        clearSearchBtn.style.display = state.searchKeyword.length > 0 ? 'flex' : 'none';
        updateRecipeDisplay();
    });

    // 4. 검색창 X(지우기) 버튼
    clearSearchBtn.addEventListener('click', () => {
        recipeSearchInput.value = '';
        state.searchKeyword = '';
        clearSearchBtn.style.display = 'none';
        updateRecipeDisplay();
        recipeSearchInput.focus();
    });

    // 5. 카테고리 탭 클릭 이벤트 (이벤트 위임)
    categoryTabs.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.tab-btn');
        if (!targetBtn) return;

        categoryTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        targetBtn.classList.add('active');

        state.selectedCategory = targetBtn.dataset.category;
        updateRecipeDisplay();
    });

    // 6. 정렬 셀렉트 박스 변경 이벤트
    recipeSortSelect.addEventListener('change', (e) => {
        state.sortOrder = e.target.value;
        updateRecipeDisplay();
    });

    // 7. 모달 닫기 이벤트들
    closeModalBtn.addEventListener('click', closeModal);

    recipeDetailModal.addEventListener('click', (e) => {
        if (e.target === recipeDetailModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && recipeDetailModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// --------------------------------------------------------------------------
// 5. 알러지 체크박스 요약 바 & 리셋 제어 로직
// --------------------------------------------------------------------------

/**
 * 선택된 알레르기 요약 바를 화면에 업데이트
 */
function updateSelectedSummaryBar() {
    if (state.selectedAllergens.size === 0) {
        selectedSummaryBar.style.display = 'none';
        selectedTagsList.innerHTML = '';
        return;
    }

    selectedSummaryBar.style.display = 'flex';
    selectedTagsList.innerHTML = '';

    state.selectedAllergens.forEach(allergenId => {
        const meta = ALLERGY_METADATA[allergenId] || { name: allergenId, emoji: '⚠️' };
        
        const badge = document.createElement('span');
        badge.className = 'badge-excluded';
        badge.innerHTML = `
            ${meta.emoji} ${meta.name} 제외
            <i class="fa-solid fa-xmark" title="${meta.name} 제외 해제"></i>
        `;

        // 요약 바의 X 버튼 클릭 시 해당 체크박스만 단독 해제
        badge.querySelector('i').addEventListener('click', () => {
            const targetCheckbox = document.getElementById(`allergy-${allergenId}`);
            if (targetCheckbox) {
                targetCheckbox.checked = false;
                targetCheckbox.dispatchEvent(new Event('change'));
            }
        });

        selectedTagsList.appendChild(badge);
    });
}

/**
 * 모든 체크박스 및 검색 필터 초기화
 */
function resetAllFilters() {
    // 1) 체크박스 상태 모두 해제
    allergyCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // 2) Set 비우기
    state.selectedAllergens.clear();

    // 3) 요약 바 숨기기
    updateSelectedSummaryBar();

    // 4) 검색창 초기화
    if (state.searchKeyword) {
        recipeSearchInput.value = '';
        state.searchKeyword = '';
        clearSearchBtn.style.display = 'none';
    }

    // 5) 화면 재필터링 및 갱신
    updateRecipeDisplay();
}

// --------------------------------------------------------------------------
// 6. 핵심 알러지 필터링 & 카드 렌더링 엔진 (Core Filtering & Card Rendering)
// --------------------------------------------------------------------------

/**
 * [핵심 필터링 로직]
 * 사용자가 선택한 알러지 성분이 포함된 레시피를 자동으로 목록에서 제외합니다.
 */
function updateRecipeDisplay() {
    // 1) 알러지 제외 필터링 (가장 핵심적인 안전 검사)
    let filtered = RECIPES_DATA.filter(recipe => {
        const recipeAllergens = recipe.allergenIds || [];

        // 레시피의 알러지 성분 중 사용자가 체크한 '제외 알러지 목록'에 포함된 것이 하나라도 있는지 확인
        const hasExcludedAllergen = recipeAllergens.some(allergenId => 
            state.selectedAllergens.has(allergenId)
        );

        // 제외 대상 알러지가 포함되어 있지 않은 안전한 레시피만 통과(true)
        return !hasExcludedAllergen;
    });

    // 2) 카테고리 필터링 (전체 / 한식 / 양식)
    if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(recipe => recipe.category === state.selectedCategory);
    }

    // 3) 키워드 검색 필터링 (제목, 재료, 이미지 설명, 상세 설명)
    if (state.searchKeyword) {
        filtered = filtered.filter(recipe => {
            const matchTitle = recipe.title.toLowerCase().includes(state.searchKeyword);
            const matchDesc = recipe.description ? recipe.description.toLowerCase().includes(state.searchKeyword) : false;
            const matchImgDesc = recipe.imageDescription ? recipe.imageDescription.toLowerCase().includes(state.searchKeyword) : false;
            const matchIngredient = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(state.searchKeyword));
            return matchTitle || matchDesc || matchImgDesc || matchIngredient;
        });
    }

    // 4) 정렬 적용 (추천순 / 조리시간순 / 난이도순)
    filtered = sortRecipes(filtered, state.sortOrder);

    // 5) 화면에 안전한 레시피 개수 업데이트
    recipeCountEl.textContent = filtered.length;

    // 6) 레시피 카드 목록 DOM 렌더링
    renderRecipeGrid(filtered);
}

/**
 * 레시피 정렬 함수
 */
function sortRecipes(recipes, sortOrder) {
    const list = [...recipes];

    switch (sortOrder) {
        case 'time-asc':
            return list.sort((a, b) => a.time - b.time); // 시간 빠른순
        case 'difficulty-asc':
            const diffMap = { '쉬움': 1, '보통': 2, '어려움': 3 };
            return list.sort((a, b) => (diffMap[a.difficulty] || 1) - (diffMap[b.difficulty] || 1));
        case 'recommended':
        default:
            return list.sort((a, b) => a.id - b.id); // 추천 기본순
    }
}

/**
 * [레시피 카드 렌더링 함수]
 * 각 카드에 이미지, 레시피 이름, 주요 재료 목록, 그리고 알러지 유발 가능 성분 옆에 경고 아이콘(⚠️)을 표시합니다.
 */
function renderRecipeGrid(recipes) {
    recipeGrid.innerHTML = '';

    // 결과가 0개일 때 빈 상태(Empty State) 화면 표시
    if (recipes.length === 0) {
        recipeGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    recipeGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    recipes.forEach(recipe => {
        const card = document.createElement('article');
        card.className = 'recipe-card';
        card.tabIndex = 0; // 키보드 접근성

        // 1) 안심 프리 뱃지 HTML 생성
        const badgesHtml = (recipe.safeBadges || []).map(badge => `
            <span class="badge-free">
                <i class="fa-solid fa-check"></i> ${badge}
            </span>
        `).join('');

        // 2) 카드 내 재료 목록 칩 HTML 생성 (알러지 성분 옆에 작은 경고 아이콘 ⚠️ 부착)
        const ingredientsChipsHtml = recipe.ingredients.map(ing => {
            if (ing.isAllergen) {
                // 알러지 유발 가능 성분인 경우 -> 경고 아이콘 및 강조 스타일 적용
                return `
                    <span class="ingredient-chip has-allergen" title="알러지 주의: ${ing.allergenName || '알러지 유발 가능'}">
                        <i class="fa-solid fa-triangle-exclamation warning-icon"></i>
                        <span>${ing.name}</span>
                        <span class="allergen-tag">${ing.allergenName || '주의'}</span>
                    </span>
                `;
            } else {
                // 일반 안전 식재료
                return `
                    <span class="ingredient-chip">
                        <span>${ing.name}</span>
                    </span>
                `;
            }
        }).join('');

        // 3) 카드 전체 템플릿 마크업 조립 (onerror 대체 이미지 방어 로직 포함)
        card.innerHTML = `
            <div class="card-image-wrap">
                <img src="${recipe.image}" 
                     alt="${recipe.imageDescription || recipe.title}" 
                     class="card-image" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${FALLBACK_IMAGE_URL}';">
                <span class="card-category-badge">${recipe.category}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${recipe.title}</h3>
                <p class="card-desc">${recipe.description}</p>
                
                <div class="card-meta">
                    <span class="meta-item">
                        <i class="fa-regular fa-clock"></i> ${recipe.time}분
                    </span>
                    <span class="meta-item">
                        <i class="fa-solid fa-signal"></i> 난이도 ${recipe.difficulty}
                    </span>
                </div>

                <!-- 재료 목록 및 알러지 경고 아이콘 표시 영역 -->
                <div class="card-ingredients-wrap">
                    <div class="card-ingredients-title">
                        <span class="title-text"><i class="fa-solid fa-basket-shopping"></i> 재료 목록</span>
                        <span class="allergy-hint"><i class="fa-solid fa-triangle-exclamation"></i> 알러지 성분 주의</span>
                    </div>
                    <div class="card-ingredients-chips">
                        ${ingredientsChipsHtml}
                    </div>
                </div>

                <div class="card-safe-badges">
                    ${badgesHtml}
                </div>

                <button type="button" class="btn-view-recipe">
                    <span>상세 레시피 & 대체재료 꿀팁</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        // 마우스 클릭 및 엔터 키 입력 시 상세 모달 오픈
        card.addEventListener('click', () => openRecipeDetailModal(recipe));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                openRecipeDetailModal(recipe);
            }
        });

        recipeGrid.appendChild(card);
    });
}

// --------------------------------------------------------------------------
// 7. 레시피 상세 모달 제어 (Modal Popup Controller)
// --------------------------------------------------------------------------

/**
 * 특정 레시피의 세부 정보를 모달에 주입하고 팝업을 활성화
 */
function openRecipeDetailModal(recipe) {
    // 재료 목록 HTML 생성 (알레르기 유발 식재료는 빨간색 경고 표시)
    const ingredientsHtml = recipe.ingredients.map(ing => `
        <li>
            <span>${ing.name} ${ing.isAllergen ? `<small style="color:var(--danger-color); font-weight:700;">(⚠️ ${ing.allergenName})</small>` : ''}</span>
            <strong>${ing.amount}</strong>
        </li>
    `).join('');

    // 조리 순서 HTML 생성
    const stepsHtml = recipe.steps.map(step => `
        <li>${step}</li>
    `).join('');

    // 안심 뱃지 HTML
    const badgesHtml = (recipe.safeBadges || []).map(badge => `
        <span class="badge-free"><i class="fa-solid fa-shield-check"></i> ${badge}</span>
    `).join('');

    // 포함된 알레르기 유발 성분 태그 HTML
    const allergenTagsHtml = recipe.allergens && recipe.allergens.length > 0 
        ? recipe.allergens.map(a => `<span style="background-color: var(--danger-light); color: var(--danger-text); border: 1px solid var(--danger-border); padding: 3px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 700;">⚠️ ${a}</span>`).join(' ')
        : `<span style="background-color: var(--primary-100); color: var(--primary-800); padding: 3px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 700;">✅ 주요 알레르기 무첨가</span>`;

    modalContentBody.innerHTML = `
        <img src="${recipe.image}" 
             alt="${recipe.imageDescription || recipe.title}" 
             class="modal-hero-img"
             onerror="this.onerror=null; this.src='${FALLBACK_IMAGE_URL}';">
        <div class="modal-inner">
            <div class="modal-header-info">
                <span class="modal-category">${recipe.category}</span>
                <h2 class="modal-title">${recipe.title}</h2>
                <div class="modal-meta-row">
                    <span><i class="fa-regular fa-clock"></i> 조리 시간: <strong>${recipe.time}분</strong></span>
                    <span><i class="fa-solid fa-signal"></i> 난이도: <strong>${recipe.difficulty}</strong></span>
                </div>
            </div>

            <!-- 포함된 알러지 유발 성분 및 안심 뱃지 정보 -->
            <div class="modal-allergy-notice">
                <div style="margin-bottom: 8px;">
                    <strong>포함된 알레르기 성분:</strong> ${allergenTagsHtml}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <i class="fa-solid fa-circle-check" style="color: var(--primary-600);"></i>
                    <strong>안심 포인트:</strong>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${badgesHtml}
                </div>
            </div>

            <!-- 대체 재료 꿀팁 -->
            <div class="tip-box">
                <div style="font-weight: 700; margin-bottom: 4px;">
                    <i class="fa-solid fa-lightbulb"></i> 알러지 대체재료 꿀팁:
                </div>
                <div>${recipe.substitutes}</div>
            </div>

            <!-- 준비 재료 목록 -->
            <h3 class="modal-section-title">
                <i class="fa-solid fa-basket-shopping"></i> 준비 재료
            </h3>
            <ul class="ingredients-list">
                ${ingredientsHtml}
            </ul>

            <!-- 단계별 조리 순서 -->
            <h3 class="modal-section-title">
                <i class="fa-solid fa-kitchen-set"></i> 조리 순서
            </h3>
            <ol class="steps-list">
                ${stepsHtml}
            </ol>
        </div>
    `;

    // 모달 활성화 및 배경 스크롤 차단
    recipeDetailModal.classList.add('active');
    recipeDetailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

/**
 * 모달 창 닫기
 */
function closeModal() {
    recipeDetailModal.classList.remove('active');
    recipeDetailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}
