export type ProductType = "album" | "goods";
export type ProductBadge = "신상품" | "한정판" | "인기" | "품절임박";

export interface Product {
  id: string;
  fandomId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  type: ProductType;
  badge?: ProductBadge;
  emoji: string;
  stock: number;
}

export const PRODUCTS: Product[] = [
  { id: "s1-1", fandomId: "1", name: "The Winning (정규 6집)", description: "아이유 정규 6집 앨범 CD + 포토북 포함", price: 19800, type: "album", badge: "인기", emoji: "💿", stock: 500 },
  { id: "s1-2", fandomId: "1", name: "LILAC (정규 5집)", description: "아이유 정규 5집 한정판 패키지", price: 17800, originalPrice: 21000, type: "album", emoji: "💿", stock: 200 },
  { id: "s1-3", fandomId: "1", name: "유아이나라 공식 응원봉", description: "IU 공식 야광 응원봉 2025 버전", price: 35000, type: "goods", badge: "신상품", emoji: "🪄", stock: 300 },
  { id: "s1-4", fandomId: "1", name: "IU 포토카드 세트 (24종)", description: "공식 포토카드 풀세트 24장", price: 12000, type: "goods", badge: "인기", emoji: "📸", stock: 150 },
  { id: "s1-5", fandomId: "1", name: "유아이나라 공식 에코백", description: "아이유 로고 자수 캔버스 에코백", price: 22000, type: "goods", emoji: "👜", stock: 120 },

  { id: "s2-1", fandomId: "2", name: "소란 (정규 3집)", description: "잔나비 정규 3집 디지팩 에디션", price: 16500, type: "album", badge: "인기", emoji: "💿", stock: 400 },
  { id: "s2-2", fandomId: "2", name: "BEST SUMMER EVER", description: "잔나비 미니 2집 한정 LP 에디션", price: 29800, originalPrice: 35000, type: "album", badge: "한정판", emoji: "🎵", stock: 80 },
  { id: "s2-3", fandomId: "2", name: "잔나비 밴드 굿즈 키트", description: "티셔츠 + 스티커팩 + 피크 세트", price: 28000, type: "goods", badge: "신상품", emoji: "🎸", stock: 200 },
  { id: "s2-4", fandomId: "2", name: "잔나비 캔버스 포스터 세트", description: "공연 포스터 4종 세트 A3 사이즈", price: 15000, type: "goods", emoji: "🖼️", stock: 300 },

  { id: "s3-1", fandomId: "3", name: "IM HERO (정규 1집)", description: "임영웅 정규 1집 프리미엄 에디션", price: 21000, type: "album", badge: "인기", emoji: "💿", stock: 1000 },
  { id: "s3-2", fandomId: "3", name: "영웅시대 공식 응원봉", description: "임영웅 공식 인증 응원봉 시즌 2", price: 45000, type: "goods", badge: "신상품", emoji: "🪄", stock: 500 },
  { id: "s3-3", fandomId: "3", name: "임영웅 포토북 2025", description: "콘서트 비하인드 포토북 A4 규격", price: 39000, type: "goods", badge: "한정판", emoji: "📖", stock: 200 },
  { id: "s3-4", fandomId: "3", name: "영웅시대 공식 머플러", description: "팬클럽 공식 응원 머플러 블루 컬러", price: 25000, type: "goods", emoji: "🧣", stock: 350 },
  { id: "s3-5", fandomId: "3", name: "임영웅 달력 2026", description: "임영웅 공식 2026년 12개월 달력", price: 18000, type: "goods", badge: "신상품", emoji: "📅", stock: 600 },

  { id: "s4-1", fandomId: "4", name: "GREY AREA (정규 9집)", description: "넬 정규 9집 디럭스 에디션", price: 18800, type: "album", badge: "신상품", emoji: "💿", stock: 300 },
  { id: "s4-2", fandomId: "4", name: "LOST AND FOUND (정규 8집)", description: "넬 정규 8집 리이슈 LP 에디션", price: 35000, originalPrice: 42000, type: "album", badge: "한정판", emoji: "🎵", stock: 100 },
  { id: "s4-3", fandomId: "4", name: "넬 밴드 집업 후드티", description: "NELL 로고 프린트 집업 후드티", price: 58000, type: "goods", emoji: "👕", stock: 150 },
  { id: "s4-4", fandomId: "4", name: "회색지대 빈티지 스티커 세트", description: "아날로그 감성 스티커 30종 세트", price: 8000, type: "goods", badge: "인기", emoji: "🏷️", stock: 800 },

  { id: "s5-1", fandomId: "5", name: "TOP OF THE WORLD (정규 3집)", description: "송가인 정규 3집 스페셜 패키지", price: 19800, type: "album", badge: "인기", emoji: "💿", stock: 600 },
  { id: "s5-2", fandomId: "5", name: "나를 돌아봐 (정규 2집)", description: "송가인 정규 2집 팬 사인 에디션", price: 21000, originalPrice: 25000, type: "album", badge: "한정판", emoji: "💿", stock: 100 },
  { id: "s5-3", fandomId: "5", name: "가인나라 공식 응원봉", description: "송가인 공식 응원봉 핑크 버전", price: 38000, type: "goods", badge: "신상품", emoji: "🪄", stock: 400 },
  { id: "s5-4", fandomId: "5", name: "송가인 포토카드 세트 (20종)", description: "공연 현장 포토 카드 20장", price: 12000, type: "goods", emoji: "📸", stock: 250 },

  { id: "s6-1", fandomId: "6", name: "10.0 (정규 10집)", description: "10cm 정규 10집 기념 한정판", price: 19800, badge: "한정판", type: "album", emoji: "💿", stock: 200 },
  { id: "s6-2", fandomId: "6", name: "봄이 좋냐 (싱글)", description: "10cm 신보 봄이 좋냐 디지팩", price: 9800, type: "album", badge: "신상품", emoji: "🎵", stock: 500 },
  { id: "s6-3", fandomId: "6", name: "10cm 어쿠스틱 피크 세트", description: "권정열 애용 피크 디자인 5종", price: 9000, type: "goods", badge: "인기", emoji: "🎸", stock: 600 },
  { id: "s6-4", fandomId: "6", name: "봄의 온도 공연 포스터", description: "2025 단독 공연 공식 포스터 A2", price: 14000, type: "goods", emoji: "🖼️", stock: 300 },

  { id: "s7-1", fandomId: "7", name: "SCENE (정규 3집)", description: "장민호 정규 3집 한정판 패키지", price: 20000, type: "album", badge: "인기", emoji: "💿", stock: 500 },
  { id: "s7-2", fandomId: "7", name: "Miracle (정규 2집)", description: "장민호 정규 2집 팬미팅 에디션", price: 18000, originalPrice: 22000, type: "album", emoji: "💿", stock: 180 },
  { id: "s7-3", fandomId: "7", name: "민호나라 공식 응원봉", description: "장민호 공식 응원봉 오렌지 버전", price: 42000, type: "goods", badge: "신상품", emoji: "🪄", stock: 400 },
  { id: "s7-4", fandomId: "7", name: "장민호 포토북 SCENE", description: "SCENE 투어 공식 포토북", price: 35000, type: "goods", badge: "한정판", emoji: "📖", stock: 150 },
  { id: "s7-5", fandomId: "7", name: "민호나라 응원 타올", description: "팬클럽 공식 응원 타올 2025", price: 15000, type: "goods", emoji: "🧣", stock: 500 },
];
