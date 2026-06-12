/* ─────────────────────────────────────────────────────────────
   사이트 설정 — 발급받은 ID를 따옴표 안에 채우면 해당 기능이 자동으로 켜집니다.
   비어 있으면 그 기능은 조용히 꺼진 상태로 유지됩니다 (에러 없음).
   ───────────────────────────────────────────────────────────── */
window.SITE_CONFIG = {
  // Google Analytics 4 측정 ID — analytics.google.com → 관리 → 데이터 스트림 (형식: G-XXXXXXXXXX)
  ga4: 'G-H2PR89HM3K',
  // 카카오 AdFit 광고단위 ID — adfit.kakao.com (형식: DAN-XXXXXXXXXXXX, 320x100 단위 권장)
  adfit: '',
  // Google AdSense 클라이언트 ID — adsense.google.com (형식: ca-pub-XXXXXXXXXXXXXXXX)
  adsense: '',
  // Kakao developers JavaScript 키 — developers.kakao.com (카카오톡 공유 버튼용)
  kakaoJsKey: '',
  // 쿠팡 파트너스 태그 — partners.coupang.com (형식: AF1234567)
  coupangTag: ''
};

(function () {
  var C = window.SITE_CONFIG;

  // ── Google Analytics 4 ──
  if (C.ga4) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.ga4;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', C.ga4);
  }

  // ── Google AdSense (자동 광고) ──
  if (C.adsense) {
    var as = document.createElement('script');
    as.async = true;
    as.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + C.adsense;
    as.crossOrigin = 'anonymous';
    document.head.appendChild(as);
  }

  // ── 카카오 AdFit: .ad-slot 컨테이너에 배너 삽입 ──
  function mountAdfit() {
    if (!C.adfit) return;
    var slots = document.querySelectorAll('.ad-slot');
    if (!slots.length) return;
    slots.forEach(function (el) {
      var ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', C.adfit);
      ins.setAttribute('data-ad-width', '320');
      ins.setAttribute('data-ad-height', '100');
      el.appendChild(ins);
    });
    var ks = document.createElement('script');
    ks.async = true;
    ks.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    document.body.appendChild(ks);
  }

  // ── Kakao SDK (카카오톡 공유) ──
  function mountKakao() {
    if (!C.kakaoJsKey) return;
    var s = document.createElement('script');
    s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = function () {
      if (window.Kakao && !Kakao.isInitialized()) Kakao.init(C.kakaoJsKey);
    };
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mountAdfit(); mountKakao(); });
  } else { mountAdfit(); mountKakao(); }
})();
