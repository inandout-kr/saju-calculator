// 핵심 계산 로직 검증 스크립트 (index.html의 CORE 블록 추출 실행)
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const m=html.match(/\/\*CORE-START\*\/([\s\S]*?)\/\*CORE-END\*\//);
if(!m){console.error('CORE block not found');process.exit(1);}
eval(m[1]+';Object.assign(globalThis,{LUNAR_INFO,day60FromYMD,ipchunUtc,lunarToSolar,solarToLunar,calcSaju,name60,combine60,tenGod,twelveStage,calcSinsal,calcFortune,isYukhap,fortuneDay,fortuneYearGen});');

let pass=0,fail=0;
function eq(name,got,want){
  const ok=JSON.stringify(got)===JSON.stringify(want);
  ok?pass++:fail++;
  console.log(`${ok?'PASS':'FAIL'} ${name}: got=${JSON.stringify(got)}${ok?'':' want='+JSON.stringify(want)}`);
}

// 1. 음력 테이블 길이
eq('LUNAR_INFO length',LUNAR_INFO.length,201);

// 2. 일주: 2000-01-01 = 무오(54), 1900-01-01 = 갑술(10), 1949-10-01 = 갑자(0)
eq('day60 2000-01-01',day60FromYMD(2000,1,1),54);
eq('day60 1900-01-01',day60FromYMD(1900,1,1),10);
eq('day60 1949-10-01',day60FromYMD(1949,10,1),0);

// 3. 절기: 입춘 날짜 (KST 기준 2월 3~5일)
for(const y of [1990,2000,2024,2026]){
  const t=new Date(ipchunUtc(y)+9*3600000);
  eq(`입춘 ${y} 월/일범위`,[t.getUTCMonth()+1,t.getUTCDate()>=3&&t.getUTCDate()<=5],[2,true]);
}

// 4. 음력→양력 (설날 검증: 1990 설=1/27, 2000 설=2/5, 2024 설=2/10)
eq('설날 1990',lunarToSolar(1990,1,1,false),{y:1990,m:1,d:27});
eq('설날 2000',lunarToSolar(2000,1,1,false),{y:2000,m:2,d:5});
eq('설날 2024',lunarToSolar(2024,1,1,false),{y:2024,m:2,d:10});

// 5. 양력↔음력 왕복 (1901~2099 사이 무작위 고정 날짜들)
let rt=true;
for(let y=1901;y<2100;y+=7){
  const lun=solarToLunar(y,6,15);
  if(!lun){rt=false;console.log('  roundtrip null at',y);break;}
  const back=lunarToSolar(lun.y,lun.m,lun.d,lun.leap);
  if(back.error||back.y!==y||back.m!==6||back.d!==15){rt=false;console.log('  roundtrip mismatch at',y,lun,back);break;}
}
eq('음양력 왕복 변환',rt,true);

// 6. 사주: 1990-01-01 12:00 남 → 기사년 병자월 병인일 갑오시
const r=calcSaju({y:1990,m:1,d:1,hh:12,mi:0,gender:'M',solarCorr:true,histTz:true,jasi:'next'});
eq('1990-01-01 연주',name60(combine60(r.pillars.year[0],r.pillars.year[1])),'기사');
eq('1990-01-01 월주',name60(combine60(r.pillars.month[0],r.pillars.month[1])),'병자');
eq('1990-01-01 일주',name60(combine60(r.pillars.day[0],r.pillars.day[1])),'병인');
eq('1990-01-01 시주',name60(combine60(r.pillars.hour[0],r.pillars.hour[1])),'갑오');

// 7. 입춘 전후 연주 전환: 2000-02-03 → 기묘년, 2000-02-05 → 경진년
const a=calcSaju({y:2000,m:2,d:3,hh:12,mi:0,gender:'M',solarCorr:false,histTz:true,jasi:'next'});
const b=calcSaju({y:2000,m:2,d:5,hh:12,mi:0,gender:'M',solarCorr:false,histTz:true,jasi:'next'});
eq('입춘 전 연주(2000-02-03)',name60(combine60(a.pillars.year[0],a.pillars.year[1])),'기묘');
eq('입춘 후 연주(2000-02-05)',name60(combine60(b.pillars.year[0],b.pillars.year[1])),'경진');

// 8. 시주 규칙: 갑/기일 자시=갑자 (1990-01-01은 병인일 → 무자시 시작, 12시=갑오 위에서 확인됨)
//    자시 경계: 23:50 출생, jasi='next' → 일주 +1
const c1=calcSaju({y:1990,m:1,d:1,hh:23,mi:50,gender:'M',solarCorr:false,histTz:true,jasi:'next'});
eq('23시 이후 일주 이월',name60(combine60(c1.pillars.day[0],c1.pillars.day[1])),'정묘');
const c2=calcSaju({y:1990,m:1,d:1,hh:23,mi:50,gender:'M',solarCorr:false,histTz:true,jasi:'yaja'});
eq('야자시 일주 유지',name60(combine60(c2.pillars.day[0],c2.pillars.day[1])),'병인');

// 9. 대운 방향: 기사년(음간 기) 남자 → 역행, 여자 → 순행
eq('대운 방향(음년 남)',r.daeun.forward,false);
const rf=calcSaju({y:1990,m:1,d:1,hh:12,mi:0,gender:'F',solarCorr:true,histTz:true,jasi:'next'});
eq('대운 방향(음년 여)',rf.daeun.forward,true);
eq('대운수 범위',r.daeun.num>=1&&r.daeun.num<=10,true);

// 10. 십신/12운성 기본
eq('십신 갑→갑',tenGod(0,0),'비견');
eq('십신 갑→을',tenGod(0,1),'겁재');
eq('십신 갑→병',tenGod(0,2),'식신');
eq('십신 갑→신(금)',tenGod(0,7),'정관');
eq('십신 갑→계',tenGod(0,9),'정인');
eq('12운성 갑-해',twelveStage(0,11),'장생');
eq('12운성 갑-묘',twelveStage(0,3),'제왕');
eq('12운성 을-오',twelveStage(1,6),'장생');

// 11. 운세: 1990-01-01 남 (기사 병자 병인 갑오 → 화4 목2 토1 수1 금0, 화일간 신강)
//     용신=금(가장 부족한 식재관), 기신=화(과다 비겁)
const NOW=Date.UTC(2026,5,11,3,0); // 2026-06-12 12:00 KST
const f1=calcFortune(r,NOW);
eq('신강 판단',f1.strong,true);
eq('용신(금)',f1.luckyEl,3);
eq('기신(화)',f1.avoidEl,1);
const f2=calcFortune(r,NOW);
eq('운세 결정론성',JSON.stringify(f1)===JSON.stringify(f2),true);
eq('점수 범위',f1.today.score>=8&&f1.today.score<=98&&f1.year.score>=8&&f1.year.score<=98,true);
eq('올해 세운(2026 병오)',name60(f1.year.p60),'병오');
eq('지역 형식(국내 시 단위)',/(시|광역시)$/.test(f1.region.good.kr)&&/(시|광역시)$/.test(f1.region.bad.kr),true);
eq('운/피해야 할 오행 분리',f1.luckyEl!==f1.avoidEl,true);
eq('색·음식 존재',!!(f1.color.good&&f1.color.bad&&f1.food.good&&f1.food.bad),true);
eq('육합 자-축',isYukhap(0,1),true);
eq('육합 오-미',isYukhap(6,7),true);
eq('육합 자-인 아님',isYukhap(0,2),false);
// 시간 모름이어도 운세 계산 가능
const rn=calcSaju({y:1990,m:1,d:1,hh:null,mi:null,gender:'M',solarCorr:true,histTz:true,jasi:'next'});
const fn=calcFortune(rn,NOW);
eq('시간모름 운세 계산',!!(fn.today&&fn.year&&fn.region.good.kr),true);

// 12. 상세 운세 문단 구조: 오늘 5문단, 올해 7문단, undefined/빈 문자열 없음
eq('오늘 문단 수',f1.today.paras.length,5);
eq('올해 문단 수',f1.year.paras.length,7);
const clean=ps=>ps.every(p=>typeof p[0]==='string'&&typeof p[1]==='string'&&p[1].length>30&&!p[1].includes('undefined'));
eq('오늘 문단 내용 정상',clean(f1.today.paras),true);
eq('올해 문단 내용 정상',clean(f1.year.paras),true);
// 60갑자 일진 × 임의 사주 전수 검사 (테이블 누락 키 탐지)
let allOk=true;
for(let t60=0;t60<60;t60++){
  const fd=fortuneDay(r.pillars.day[0],r.pillars.day[1],t60,f1.luckyEl,f1.avoidEl,t60);
  const fy=fortuneYearGen(r.pillars.day[0],r.pillars.day[1],t60,2026,f1.luckyEl,f1.avoidEl,r,t60);
  if(!clean(fd.paras)||!clean(fy.paras)||fd.score<8||fd.score>98||fy.score<8||fy.score>98){allOk=false;console.log('  문제 일진:',t60,name60(t60));break;}
}
eq('60갑자 전수 운세 생성',allOk,true);
// 다른 일간(10종)으로도 전수 확인
let allOk2=true;
for(let ds=0;ds<10;ds++){
  for(let t60=0;t60<60;t60+=7){
    const fd=fortuneDay(ds,4,t60,0,1,t60);
    if(!clean(fd.paras)){allOk2=false;console.log('  문제 일간:',ds,'일진:',t60);break;}
  }
}
eq('일간 10종 운세 생성',allOk2,true);

console.log(`\n결과: ${pass} pass / ${fail} fail`);
process.exit(fail?1:0);
