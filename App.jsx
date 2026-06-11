import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

// ─── レスポンシブ ────────────────────────────────────────
function useMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

// ─── デザイントークン ────────────────────────────────────
const C = {
  bg:    "#F2F1EC",   // オフホワイト背景
  bg1:   "#FFFFFF",   // カード白
  bg2:   "#F8F7F3",   // 薄グレー面
  bg3:   "#EDECE7",   // ボーダー近い
  ink:   "#111111",   // 文字メイン
  ink2:  "#666666",   // サブ
  ink3:  "#AAAAAA",   // 薄
  line:  "rgba(0,0,0,0.07)",
  lineM: "rgba(0,0,0,0.12)",
  acc:   "#111111",   // アクセント=黒
  // ステータス
  red:   "#D94040", redBg:"rgba(217,64,64,0.08)",
  ora:   "#D97706", oraBg:"rgba(217,119,6,0.08)",
  yel:   "#B8960C", yelBg:"rgba(184,150,12,0.08)",
  grn:   "#1A8A4A", grnBg:"rgba(26,138,74,0.08)",
  blu:   "#2563EB", bluBg:"rgba(37,99,235,0.08)",
  pur:   "#7C3AED", purBg:"rgba(124,58,237,0.08)",
  r: { xs:4, sm:8, md:12, lg:16, xl:22, full:999 },
  f: { xs:10, sm:11, base:13, md:14, lg:17, xl:22, "2xl":30 },
};

// ─── データ ──────────────────────────────────────────────
const CATEGORIES = [
  { id:"all",       label:"すべて",    dot:"#111111" },
  { id:"summer",    label:"サマー",    dot:"#D97706" },
  { id:"autumn",    label:"秋冬",      dot:"#7C3AED" },
  { id:"winter",    label:"冬",        dot:"#2563EB" },
  { id:"spring",    label:"スプリング",dot:"#1A8A4A" },
  { id:"honsenkou", label:"本選考",    dot:"#D94040" },
];
const CAT_ST = {
  summer:    {color:"#92400E",bg:"#FEF3C7",border:"#FDE68A"},
  autumn:    {color:"#5B21B6",bg:"#EDE9FE",border:"#DDD6FE"},
  winter:    {color:"#1E40AF",bg:"#DBEAFE",border:"#BFDBFE"},
  spring:    {color:"#065F46",bg:"#D1FAE5",border:"#A7F3D0"},
  honsenkou: {color:"#9F1239",bg:"#FFE4E6",border:"#FECDD3"},
  event:     {color:"#2563EB",bg:"#DBEAFE",border:"#BFDBFE"},
};
const INDUSTRIES = ["IT・Web","コンサル","金融・銀行","メーカー","広告・メディア","商社","インフラ","その他"];
const EVENT_TYPES = [
  {id:"es",label:"ES提出",icon:"doc"},{id:"test",label:"WEBテスト",icon:"test"},
  {id:"gr",label:"GD・GW",icon:"group"},{id:"interview1",label:"1次面接",icon:"mic"},
  {id:"interview2",label:"2次面接",icon:"mic"},{id:"interview3",label:"3次面接",icon:"mic"},
  {id:"final",label:"最終面接",icon:"star"},{id:"offer",label:"内定",icon:"offer"},
  {id:"info",label:"会社説明会",icon:"bldg"},{id:"other",label:"その他",icon:"pin"},
];
const STATUSES = [
  {id:"planning", label:"準備中",  color:"#6B7280",bg:"#F3F4F6",border:"#D1D5DB"},
  {id:"applied",  label:"応募済み",color:C.blu,    bg:C.bluBg, border:"#BFDBFE"},
  {id:"ongoing",  label:"選考中",  color:C.ora,    bg:C.oraBg, border:"#FDE68A"},
  {id:"passed",   label:"通過",    color:C.grn,    bg:C.grnBg, border:"#BBF7D0"},
  {id:"offer",    label:"内定",    color:C.pur,    bg:C.purBg, border:"#DDD6FE"},
  {id:"rejected", label:"不合格",  color:C.red,    bg:C.redBg, border:"#FECACA"},
  {id:"withdrawn",label:"辞退",    color:C.ink3,   bg:C.bg2,   border:C.line},
];

const STATUS_COLORS = [
  {color:"#6B7280",bg:"#F3F4F6",border:"#D1D5DB"},
  {color:"#2563EB",bg:"rgba(37,99,235,0.08)",border:"#BFDBFE"},
  {color:"#D97706",bg:"rgba(217,119,6,0.08)",border:"#FDE68A"},
  {color:"#059669",bg:"rgba(5,150,105,0.08)",border:"#A7F3D0"},
  {color:"#7C3AED",bg:"rgba(124,58,237,0.08)",border:"#DDD6FE"},
  {color:"#DC2626",bg:"rgba(220,38,38,0.08)",border:"#FECACA"},
  {color:"#0891B2",bg:"rgba(8,145,178,0.08)",border:"#A5F3FC"},
  {color:"#BE185D",bg:"rgba(190,24,93,0.08)",border:"#FBCFE8"},
  {color:"#B45309",bg:"rgba(180,83,9,0.08)",border:"#FDE68A"},
  {color:"#15803D",bg:"rgba(21,128,61,0.08)",border:"#BBF7D0"},
];

const StatusesContext = React.createContext(null);
const StatusSetterContext = React.createContext(null);
function useStatuses(){ return React.useContext(StatusesContext)||STATUSES; }

const INITIAL = [
  {id:1,company:"サイバーエージェント",industry:"IT・Web",category:"summer",status:"ongoing",priority:true,deadline:"2026-06-10",notes:"技術課題あり。GitHubを整備しておくこと。",
    events:[{id:1,type:"es",label:"ES提出",date:"2026-06-10",done:false,mode:"online",notes:""},{id:2,type:"interview1",label:"1次面接",date:"2026-06-18",done:false,mode:"online",notes:"技術面接。アルゴリズム対策を。"},{id:3,type:"interview2",label:"2次面接",date:"2026-07-05",done:false,mode:"offline",notes:""}]},
  {id:2,company:"メルカリ",industry:"IT・Web",category:"honsenkou",status:"applied",priority:false,deadline:"2026-06-09",notes:"OB訪問済み。",
    events:[{id:1,type:"es",label:"ES提出",date:"2026-06-09",done:false,mode:"online",notes:""},{id:2,type:"test",label:"WEBテスト",date:"2026-06-20",done:false,mode:"online",notes:"SPI"}]},
  {id:3,company:"マッキンゼー",industry:"コンサル",category:"summer",status:"ongoing",priority:true,deadline:"2026-07-05",notes:"ケース面接の練習が必要。",
    events:[{id:1,type:"es",label:"ES提出",date:"2026-06-01",done:true,mode:"online",notes:""},{id:2,type:"interview1",label:"ケース面接",date:"2026-06-20",done:false,mode:"offline",notes:"東京オフィス"},{id:3,type:"final",label:"最終面接",date:"2026-07-01",done:false,mode:"offline",notes:""}]},
  {id:4,company:"Sony",industry:"メーカー",category:"honsenkou",status:"offer",priority:false,deadline:"2026-05-01",notes:"6月末までに承諾書提出。",
    events:[{id:1,type:"es",label:"ES提出",date:"2026-04-01",done:true,mode:"online",notes:""},{id:2,type:"final",label:"最終面接",date:"2026-05-15",done:true,mode:"offline",notes:""},{id:3,type:"offer",label:"内定",date:"2026-05-30",done:true,mode:"online",notes:""}]},
  {id:5,company:"電通",industry:"広告・メディア",category:"summer",status:"planning",priority:false,deadline:"2026-06-08",notes:"",
    events:[{id:1,type:"es",label:"ES提出",date:"2026-06-08",done:false,mode:"online",notes:""}]},
  {id:6,company:"三菱商事",industry:"商社",category:"honsenkou",status:"rejected",priority:false,deadline:"2026-03-31",notes:"フィードバック：業界研究を深める。",
    events:[{id:1,type:"es",label:"ES提出",date:"2026-03-01",done:true,mode:"online",notes:""},{id:2,type:"test",label:"玉手箱",date:"2026-03-15",done:true,mode:"online",notes:""}]},
  {id:7,company:"LINE",industry:"IT・Web",category:"winter",status:"ongoing",priority:false,deadline:"2026-06-12",notes:"",
    events:[{id:1,type:"es",label:"ES提出",date:"2025-12-15",done:true,mode:"online",notes:""},{id:2,type:"interview1",label:"1次面接",date:"2026-06-12",done:false,mode:"online",notes:""},{id:3,type:"interview2",label:"2次面接",date:"2026-06-25",done:false,mode:"online",notes:""}]},
];

const EVENT_KINDS=[
  {id:"setsumeikai",label:"会社説明会",   icon:"bldg", color:"#2563EB"},
  {id:"godo",       label:"合同説明会",   icon:"group",color:"#7C3AED"},
  {id:"fair",       label:"就活イベント", icon:"star", color:"#D97706"},
  {id:"ob",         label:"OB・OG訪問",  icon:"mic",  color:"#059669"},
  {id:"seminar",    label:"セミナー",     icon:"test", color:"#DC2626"},
  {id:"other",      label:"その他",       icon:"pin",  color:"#6B7280"},
];

const INITIAL_STANDALONE_EVENTS=[
  {id:101,kind:"godo",       name:"マイナビ就活フェア 2026春",     organizer:"マイナビ",             date:"2026-06-15",mode:"offline",location:"東京ビッグサイト",url:"",      notes:"スーツ着用。履歴書10部持参。",done:false},
  {id:102,kind:"setsumeikai",name:"DeNA会社説明会",                organizer:"DeNA",                 date:"2026-06-20",mode:"online", location:"",               url:"https://zoom.us/j/example",notes:"事前登録済み。",done:false},
  {id:103,kind:"ob",         name:"サイバーエージェント OB訪問",   organizer:"サイバーエージェント", date:"2026-06-22",mode:"offline",location:"渋谷オフィス",    url:"",      notes:"先輩社員Aさん。カジュアル可。",done:false},
];

// ─── ユーティリティ ──────────────────────────────────────
const today = new Date().toISOString().slice(0,10);
const fmtS = d => { if(!d)return"—"; const dt=new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; };
const fmtM = d => { if(!d)return"—"; const dt=new Date(d); const w=["日","月","火","水","木","金","土"]; return `${dt.getMonth()+1}/${dt.getDate()}(${w[dt.getDay()]})`; };
const fmtL = d => { if(!d)return"—"; const dt=new Date(d); return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")}`; };
const du = d => { if(!d)return null; return Math.ceil((new Date(d)-new Date(today))/86400000); };
const makeUrg = (r,y) => d => { const n=du(d); if(n===null)return 0; if(n<=0)return 3; if(n<=r)return 2; if(n<=y)return 1; return 0; };
const defUrg = makeUrg(3,7);
const uColor = u => u===3?C.red:u===2?C.ora:u===1?C.yel:"transparent";
const uBg    = u => u===3?C.redBg:u===2?C.oraBg:u===1?C.yelBg:"transparent";
const catInfo = id => CATEGORIES.find(c=>c.id===id)||CATEGORIES[0];
const stInfo  = (id, statuses=STATUSES) => statuses.find(s=>s.id===id)||statuses[0]||STATUSES[0];
const evtInfo = id => EVENT_TYPES.find(e=>e.id===id)||EVENT_TYPES[EVENT_TYPES.length-1];

// ─── アイコン ────────────────────────────────────────────
const Ic = ({name,size=14,color="currentColor",style:sx}) => {
  const s = {width:size,height:size,display:"inline-block",flexShrink:0,verticalAlign:"middle",...sx};
  const v = "0 0 16 16";
  const icons = {
    doc:   <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><rect x="2.5" y="1" width="9" height="13" rx="1.5"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="7.5" x2="9" y2="7.5"/><line x1="5" y1="10" x2="7.5" y2="10"/></svg>,
    test:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><line x1="4" y1="5.5" x2="8" y2="5.5"/><line x1="4" y1="8" x2="10.5" y2="8"/><line x1="4" y1="10.5" x2="7" y2="10.5"/></svg>,
    group: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><circle cx="5.5" cy="5.5" r="2.2"/><circle cx="10.5" cy="5.5" r="2.2"/><path d="M1.5 13c0-2.2 1.8-4 4-4h1M14.5 13c0-2.2-1.8-4-4-4h-1"/></svg>,
    mic:   <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><rect x="5.5" y="1" width="5" height="8" rx="2.5"/><path d="M3 8a5 5 0 0010 0"/><line x1="8" y1="13" x2="8" y2="15.5"/><line x1="5.5" y1="15.5" x2="10.5" y2="15.5"/></svg>,
    star:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><polygon points="8,1 10,6 15,6 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6 6,6"/></svg>,
    offer: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/><path d="M2 4l6 5 6-5"/></svg>,
    bldg:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><rect x="2" y="2" width="12" height="13"/><line x1="5" y1="15" x2="5" y2="8"/><line x1="8" y1="15" x2="8" y2="8"/><line x1="11" y1="15" x2="11" y2="8"/><line x1="2" y1="6" x2="14" y2="6"/></svg>,
    pin:   <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><circle cx="8" cy="6.5" r="3"/><path d="M8 9.5V15"/></svg>,
    plus:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.7"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>,
    close: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.7"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>,
    check: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="2.2"><polyline points="2,8 6,12 14,4"/></svg>,
    edit:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><path d="M10.5 2.5l3 3L5 14H2v-3L10.5 2.5z"/></svg>,
    trash: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><line x1="2" y1="4" x2="14" y2="4"/><path d="M5 4V2h6v2"/><rect x="3" y="4" width="10" height="11" rx="1"/></svg>,
    search:<svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><circle cx="6.5" cy="6.5" r="4"/><line x1="9.5" y1="9.5" x2="14" y2="14"/></svg>,
    starF: <svg style={s} viewBox={v} fill={color}><polygon points="8,2 9.6,6.4 14.4,6.4 10.5,9.2 11.9,13.6 8,10.9 4.1,13.6 5.5,9.2 1.6,6.4 6.4,6.4"/></svg>,
    bell:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><path d="M8 1.5a5 5 0 015 5v3l1.5 2.5H1.5L3 9.5v-3a5 5 0 015-5z"/><path d="M6 13a2 2 0 004 0"/></svg>,
    warn:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"><path d="M8 2L14.5 14H1.5L8 2z"/><line x1="8" y1="7" x2="8" y2="10"/><circle cx="8" cy="12" r="0.6" fill={color}/></svg>,
    clock: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><circle cx="8" cy="8" r="6"/><polyline points="8,4.5 8,8 10.5,10"/></svg>,
    calend:<svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><rect x="1.5" y="3" width="13" height="12" rx="1.5"/><line x1="1.5" y1="7" x2="14.5" y2="7"/><line x1="5" y1="1.5" x2="5" y2="4.5"/><line x1="11" y1="1.5" x2="11" y2="4.5"/></svg>,
    list:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></svg>,
    board: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><rect x="1.5" y="1.5" width="5.5" height="13" rx="1"/><rect x="9" y="1.5" width="5.5" height="8" rx="1"/><rect x="9" y="11.5" width="5.5" height="3" rx="1"/></svg>,
    gear:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>,
    link:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1"/><path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1"/></svg>,
    mail:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><rect x="1" y="3.5" width="14" height="10" rx="1.5"/><path d="M1 4.5l7 5.5 7-5.5"/></svg>,
    home:  <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.4"><path d="M1.5 7L8 1.5 14.5 7V14.5H10V10H6v4.5H1.5z"/></svg>,
    chevR: <svg style={s} viewBox={v} fill="none" stroke={color} strokeWidth="1.6"><polyline points="5,3 11,8 5,13"/></svg>,
  };
  return icons[name]||null;
};

// ─── 共通 UI ─────────────────────────────────────────────
const chip = (color, bg, border, children, extra={}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:C.f.xs,fontWeight:600,padding:"2px 8px",borderRadius:C.r.full,background:bg,color,border:`1px solid ${border}`,whiteSpace:"nowrap",lineHeight:1.7,...extra}}>{children}</span>
);
const CatChip = ({cat}) => { const cs=CAT_ST[cat]; if(!cs)return null; return chip(cs.color,cs.bg,cs.border,catInfo(cat).label); };
const StatusChip = ({status}) => { const s=stInfo(status); return chip(s.color,s.bg,s.border,<><span style={{width:5,height:5,borderRadius:"50%",background:s.color,display:"inline-block",flexShrink:0}}/>{s.label}</>); };
const ModeChip = ({mode}) => chip(mode==="online"?"#3730A3":"#9A3412",mode==="online"?"#EEF2FF":"#FFF7ED",mode==="online"?"#C7D2FE":"#FED7AA",mode==="online"?"オンライン":"対面",{fontSize:9});
function DaysChip({date,done,urg=defUrg}){
  if(done)return null; const u=urg(date); if(!u)return null;
  const n=du(date); const col=uColor(u);
  return chip(col,uBg(u),col+"40",<><Ic name="warn" size={9} color={col}/>{n<=0?"期限切れ":n===0?"今日！":`あと${n}日`}</>,{fontSize:9});
}
function CircleCheck({done,onToggle,size=24}){
  return(<button onClick={onToggle} style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${done?"#1A8A4A":C.line}`,background:done?"#1A8A4A":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,transition:"all 0.15s"}}>
    {done&&<Ic name="check" size={Math.round(size*0.5)} color="#fff"/>}
  </button>);
}

const iSt = {
  width:"100%", padding:"10px 13px",
  border:`1.5px solid ${C.line}`,
  borderRadius:C.r.md,
  fontSize:C.f.base, outline:"none",
  background:C.bg1, color:C.ink,
  boxSizing:"border-box", fontFamily:"inherit",
  transition:"border-color 0.15s",
};
const iStFocus = {...iSt, borderColor:C.ink};

// フォーカス時に border を黒にする helper
function StyledInput(props){
  const [focus,setFocus]=useState(false);
  return <input {...props} style={{...iSt,...(focus?{borderColor:C.ink}:{}), ...props.style}} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>;
}
function StyledSelect(props){
  const [focus,setFocus]=useState(false);
  return <select {...props} style={{...iSt,...(focus?{borderColor:C.ink}:{}), ...props.style}} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>;
}
function StyledTextarea(props){
  const [focus,setFocus]=useState(false);
  return <textarea {...props} style={{...iSt,...(focus?{borderColor:C.ink}:{}), resize:"vertical", ...props.style}} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>;
}

const btn = (extra={}) => ({
  padding:"10px 20px", borderRadius:C.r.full,
  border:`1.5px solid ${C.line}`,
  background:C.bg1, cursor:"pointer",
  fontSize:C.f.base, color:C.ink2,
  fontFamily:"inherit",
  display:"inline-flex", alignItems:"center", gap:6,
  fontWeight:500, transition:"all 0.15s", whiteSpace:"nowrap",
  ...extra
});
const btnPri = btn({background:C.ink,color:"#fff",border:"none",fontWeight:600});
const btnDng = btn({color:C.red,borderColor:"rgba(217,64,64,0.3)"});

function Field({label,hint,children}){
  return(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:6}}>
        <label style={{display:"block",fontSize:C.f.xs,fontWeight:600,color:C.ink2,letterSpacing:0.3}}>{label}</label>
        {hint&&<span style={{fontSize:9,color:C.ink3}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Sheet({children,onClose,width=500,isMobile}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(2px)"}} onClick={onClose}>
      <div style={{
        background:C.bg1,
        borderRadius:isMobile?`${C.r.xl}px ${C.r.xl}px 0 0`:`${C.r.xl}px`,
        padding:0,
        width:isMobile?"100%":width,
        maxHeight:isMobile?"92vh":"88vh",
        display:"flex",
        flexDirection:"column",
        boxShadow:"0 8px 48px rgba(0,0,0,0.14)",
        overflow:"hidden",
      }} onClick={e=>e.stopPropagation()}>
        {/* ドラッグバー（スマホ） */}
        {isMobile&&<div style={{padding:"12px 0 4px",display:"flex",justifyContent:"center",flexShrink:0}}>
          <div style={{width:36,height:4,borderRadius:2,background:C.line}}/>
        </div>}
        <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px 20px 32px":"28px 32px"}}>
          {children}
        </div>
      </div>
    </div>
  );
}

function FormDivider({label}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"20px 0 16px"}}>
      <div style={{flex:1,height:1,background:C.line}}/>
      <span style={{fontSize:C.f.xs,color:C.ink3,fontWeight:600,letterSpacing:0.5}}>{label}</span>
      <div style={{flex:1,height:1,background:C.line}}/>
    </div>
  );
}

function FormRow({children}){
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{children}</div>;
}

// ─── 通知 ────────────────────────────────────────────────
function buildNotifs(companies,urg=defUrg){
  const out=[]; const seen=new Set();
  companies.forEach(c=>{
    if(c.deadline&&!["rejected","withdrawn","offer"].includes(c.status)){
      const u=urg(c.deadline); if(u>0){const id=`d-${c.id}`;if(!seen.has(id)){seen.add(id);out.push({id,companyId:c.id,level:u,company:c.company,body:`ES締切 ${fmtM(c.deadline)}`,date:c.deadline,daysLeft:du(c.deadline),icon:"calend"})}}
    }
    c.events.forEach(e=>{ if(!e.done&&e.date){const u=urg(e.date);if(u>0){const id=`e-${c.id}-${e.id}`;if(!seen.has(id)){seen.add(id);out.push({id,companyId:c.id,level:u,company:c.company,body:`${e.label} ${fmtM(e.date)}`,date:e.date,daysLeft:du(e.date),icon:evtInfo(e.type).icon})}}}});
  });
  return out.sort((a,b)=>b.level-a.level||a.date.localeCompare(b.date)).slice(0,20);
}

function NotifBell({companies,onSelect,redDays=3,yellowDays=7,isMobile}){
  const [open,setOpen]=useState(false);
  const [read,setRead]=useState(new Set());
  const ref=useRef();
  const urg=useMemo(()=>makeUrg(redDays,yellowDays),[redDays,yellowDays]);
  const notifs=useMemo(()=>buildNotifs(companies,urg),[companies,urg]);
  const unread=notifs.filter(n=>!read.has(n.id)).length;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[]);
  const lc=l=>l===3?C.red:l===2?C.ora:C.yel;
  return(<div ref={ref} style={{position:"relative"}}>
    <button onClick={()=>setOpen(o=>!o)} style={{...btn(),padding:"8px",borderRadius:C.r.full,minWidth:40,justifyContent:"center",position:"relative"}}>
      <Ic name="bell" size={18} color={unread>0?C.red:C.ink2}/>
      {unread>0&&<span style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:C.red,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.bg1}`}}>{unread>9?"9+":unread}</span>}
    </button>
    {open&&(<div style={{position:"absolute",right:0,top:"calc(100% + 8px)",width:isMobile?320:340,background:C.bg1,border:`1px solid ${C.line}`,borderRadius:C.r.lg,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",zIndex:400,overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.line}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:C.f.md,fontWeight:700}}>通知</span>{unread>0&&chip(C.red,C.redBg,"rgba(217,64,64,0.3)",`${unread}件未読`)}</div>
        {unread>0&&<button onClick={()=>setRead(new Set(notifs.map(n=>n.id)))} style={{fontSize:C.f.xs,color:C.ink3,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>すべて既読</button>}
      </div>
      <div style={{maxHeight:340,overflowY:"auto"}}>
        {notifs.length===0?<div style={{padding:"32px 0",textAlign:"center",color:C.ink3,fontSize:C.f.sm}}>期限の近い予定はありません</div>
        :notifs.map(n=>{const isR=read.has(n.id);const lcolor=lc(n.level);return(
          <div key={n.id} onClick={()=>{onSelect(n.companyId);setRead(p=>new Set([...p,n.id]));setOpen(false)}}
            style={{display:"flex",alignItems:"flex-start",gap:10,padding:"11px 16px",borderBottom:`1px solid ${C.line}`,cursor:"pointer",background:isR?C.bg1:uBg(n.level),transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.bg2} onMouseLeave={e=>e.currentTarget.style.background=isR?C.bg1:uBg(n.level)}>
            <div style={{width:32,height:32,borderRadius:"50%",background:uBg(n.level),border:`1px solid ${lcolor}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ic name={n.icon} size={14} color={lcolor}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:C.f.base,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.company}</span>{!isR&&<span style={{width:6,height:6,borderRadius:"50%",background:lcolor,flexShrink:0}}/>}</div>
              <div style={{fontSize:C.f.xs,color:C.ink2,marginBottom:4}}>{n.body}</div>
              {chip(lcolor,uBg(n.level),lcolor+"40",n.daysLeft<=0?"期限切れ":n.daysLeft===0?"今日！":`あと${n.daysLeft}日`,{fontSize:9})}
            </div>
          </div>
        )})}
      </div>
      <div style={{padding:"10px 16px",borderTop:`1px solid ${C.line}`,display:"flex",gap:5,alignItems:"center"}}><Ic name="clock" size={11} color={C.ink3}/><span style={{fontSize:C.f.xs,color:C.ink3}}>期限内のイベントを表示</span></div>
    </div>)}
  </div>);
}

// ─── サマリーカード ──────────────────────────────────────
function SummaryCards({stats,onCardTap,isMobile}){
  const cards = [
    {key:"total",  label:"総エントリー",val:stats.total,  sub:"TOTAL",  action:{view:"board",cat:"all",status:null},   accent:C.ink},
    {key:"ongoing",label:"選考中",      val:stats.ongoing,sub:"ONGOING",action:{view:"board",cat:"all",status:"ongoing"},accent:C.ora},
    {key:"offer",  label:"内定",        val:stats.offer,  sub:"OFFER",  action:{view:"board",cat:"all",status:"offer"},  accent:C.pur},
    {key:"summer", label:"サマー",      val:stats.summer, sub:"SUMMER", action:{view:"board",cat:"summer",status:null},  accent:"#92400E"},
    {key:"final",  label:"本選考",      val:stats.final,  sub:"FINAL",  action:{view:"board",cat:"honsenkou",status:null},accent:C.red},
    {key:"urgent", label:"要確認",      val:stats.urgent, sub:"ALERT",  action:{view:"timeline",cat:"all",status:null},  accent:C.red, warn:true},
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(3,1fr)":"repeat(6,1fr)",gap:isMobile?8:10,marginBottom:isMobile?16:20}}>
      {cards.map(card=>(
        <button key={card.key} onClick={()=>onCardTap(card.action)}
          style={{background:C.bg1,border:`1.5px solid ${card.warn&&card.val>0?"rgba(217,64,64,0.3)":C.line}`,borderRadius:C.r.lg,padding:isMobile?"12px 8px":"16px 18px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s",WebkitTapHighlightColor:"transparent"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ink;e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=card.warn&&card.val>0?"rgba(217,64,64,0.3)":C.line;e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
          <div style={{fontSize:isMobile?C.f.xs:C.f.sm,color:C.ink2,fontWeight:600,marginBottom:isMobile?4:6,letterSpacing:0.2,textAlign:isMobile?"center":"left"}}>{card.label}</div>
          <div style={{fontSize:isMobile?C.f.xl:C.f["2xl"],fontWeight:800,color:card.accent,lineHeight:1,marginBottom:isMobile?4:6,textAlign:isMobile?"center":"left"}}>{card.val}</div>
          <div style={{fontSize:8,color:C.ink3,letterSpacing:1.5,textAlign:isMobile?"center":"left",display:isMobile?"none":"block"}}>{card.sub}</div>
          {card.warn&&card.val>0&&!isMobile&&<Ic name="warn" size={13} color={C.red} style={{position:"absolute",top:14,right:14,opacity:0.6}}/>}
        </button>
      ))}
    </div>
  );
}

// ─── ボードビュー ────────────────────────────────────────
function BoardView({companies,onSelect,urg=defUrg,statusFilter,isMobile}){
  const statuses=useStatuses();
  const filtered = statusFilter ? companies.filter(c=>c.status===statusFilter) : companies;
  return(<div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginLeft:isMobile?-16:0,paddingLeft:isMobile?16:0}}>
    <div style={{display:"grid",gridTemplateColumns:`repeat(${statuses.length}, ${isMobile?"160px":"180px"}) 48px`,gap:10,minWidth:"max-content",paddingRight:isMobile?16:0,alignItems:"start"}}>
      {statuses.map(st=>{
        const cols=filtered.filter(c=>c.status===st.id);
        return(<div key={st.id}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:st.color,display:"inline-block"}}/><span style={{fontSize:C.f.sm,fontWeight:700,color:st.color,whiteSpace:"nowrap"}}>{st.label}</span></div>
            <span style={{fontSize:C.f.xs,fontWeight:700,color:st.color,background:st.bg,border:`1px solid ${st.border}`,padding:"1px 7px",borderRadius:C.r.full}}>{cols.length}</span>
          </div>
          <div style={{height:2,background:st.color+"25",borderRadius:2,marginBottom:10}}/>
          {cols.length===0?<div style={{padding:"24px 0",textAlign:"center",color:C.ink3,fontSize:C.f.sm}}>—</div>
          :cols.map(c=>{
            const next=c.events.filter(e=>!e.done&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
            const et=next?evtInfo(next.type):null;
            const u=urg(c.deadline), ue=next?urg(next.date):0, maxU=Math.max(u,ue);
            const catCs=CAT_ST[c.category];
            const n=du(c.deadline);
            const deadlineText=n===null?null:n<0?"期限切れ":n===0?"今日締切":n<=7?`あと${n}日`:null;
            return(
              <div key={c.id} onClick={()=>onSelect(c)}
                style={{background:C.bg1,borderRadius:C.r.md,borderTop:`3px solid ${catCs?.color||"#E5E7EB"}`,border:`1px solid ${C.line}`,padding:"12px 13px",marginBottom:8,cursor:"pointer",transition:"box-shadow 0.15s",WebkitTapHighlightColor:"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.07)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow=""}>
                {/* 企業名 + 優先マーク */}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6,marginBottom:3}}>
                  <span style={{fontSize:C.f.base,fontWeight:700,color:C.ink,lineHeight:1.35,flex:1}}>{c.company}</span>
                  {c.priority&&<Ic name="starF" size={12} color="#D97706" style={{flexShrink:0,marginTop:2}}/>}
                </div>
                {/* 業界 */}
                <div style={{fontSize:C.f.xs,color:C.ink3,marginBottom:deadlineText||next?10:0}}>{c.industry}</div>
                {/* 締切（期限切れ・7日以内のみ表示） */}
                {deadlineText&&(
                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:next?6:0}}>
                    <Ic name="calend" size={10} color={maxU>=2?uColor(maxU):C.ink3}/>
                    <span style={{fontSize:C.f.xs,fontWeight:maxU>=2?700:400,color:maxU>=2?uColor(maxU):C.ink3}}>
                      {fmtS(c.deadline)} · {deadlineText}
                    </span>
                  </div>
                )}
                {/* 次のイベント */}
                {next&&(
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <Ic name={et.icon} size={10} color={C.ink3}/>
                    <span style={{fontSize:C.f.xs,color:C.ink2,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {fmtS(next.date)} {next.label}
                    </span>
                    <span style={{fontSize:9,color:next.mode==="online"?"#4338CA":"#C2410C",fontWeight:500,whiteSpace:"nowrap"}}>
                      {next.mode==="online"?"●":"●"} {next.mode==="online"?"オンライン":"対面"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>);
      })}
      {/* ＋ステータス追加列 */}
      <div style={{paddingTop:2}}>
        <AddStatusButton/>
      </div>
    </div>
  </div>);
}

// ─── タイムライン ────────────────────────────────────────
function TimelineView({allEvents,activeCategory,onSelectCompany,onToggle,urg=defUrg,isMobile}){
  const filt=useMemo(()=>{
    const cats=activeCategory==="all"?allEvents:allEvents.filter(e=>e.category===activeCategory);
    return{up:cats.filter(e=>!e.done&&e.date>=today),past:cats.filter(e=>e.done||e.date<today).reverse()};
  },[allEvents,activeCategory]);
  const byMonth=evts=>{const g={};evts.forEach(e=>{const k=e.date.slice(0,7);if(!g[k])g[k]=[];g[k].push(e)});return Object.entries(g)};
  const mNames={"01":"1月","02":"2月","03":"3月","04":"4月","05":"5月","06":"6月","07":"7月","08":"8月","09":"9月","10":"10月","11":"11月","12":"12月"};
  const TLCol=({title,count,groups,accent,muted})=>(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.line}`}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:accent}}/>
        <span style={{fontSize:C.f.md,fontWeight:700,whiteSpace:"nowrap"}}>{title}</span>
        <span style={{marginLeft:"auto",fontSize:C.f.xs,color:C.ink3,background:C.bg2,padding:"1px 8px",borderRadius:C.r.full}}>{count}件</span>
      </div>
      {count===0?<div style={{textAlign:"center",padding:"32px 0",color:C.ink3,fontSize:C.f.sm}}>予定なし</div>
      :groups.map(([month,evts])=>(
        <div key={month} style={{marginBottom:18}}>
          <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,letterSpacing:0.8,marginBottom:8}}>{month.slice(0,4)}年 {mNames[month.slice(5)]}</div>
          {evts.map(e=>{
            const et=evtInfo(e.type),u=!muted?urg(e.date):0;
            return(<div key={`${e.companyId}-${e.id}`} onClick={()=>onSelectCompany(e.companyId)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:C.r.md,marginBottom:4,cursor:"pointer",background:muted?C.bg2:(u>0?uBg(u):C.bg1),border:`1px solid ${u>0?uColor(u)+"40":C.line}`,opacity:muted?0.6:1,transition:"background 0.1s"}}
              onMouseEnter={ev=>{if(!muted)ev.currentTarget.style.background=C.bg2}} onMouseLeave={ev=>{if(!muted)ev.currentTarget.style.background=muted?C.bg2:(u>0?uBg(u):C.bg1)}}>
              <div style={{width:32,height:32,borderRadius:C.r.sm,background:u>0?uBg(u):C.bg2,border:`1px solid ${u>0?uColor(u)+"30":C.line}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ic name={et.icon} size={14} color={u>0?uColor(u):C.ink2}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:C.f.base,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.company}</span>
                  <CatChip cat={e.category}/>
                </div>
                <div style={{fontSize:C.f.xs,color:C.ink2}}>{e.label}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>{u>=2&&<Ic name="warn" size={11} color={uColor(u)}/>}<span style={{fontSize:C.f.sm,fontWeight:600,color:u>0?uColor(u):C.ink,whiteSpace:"nowrap"}}>{fmtM(e.date)}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><ModeChip mode={e.mode}/><CircleCheck done={e.done} size={20} onToggle={ev=>{ev.stopPropagation();onToggle(e.companyId,e.id)}}/></div>
              </div>
            </div>);
          })}
        </div>
      ))}
    </div>
  );
  return(<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?20:28}}>
    <TLCol title="今後の予定" count={filt.up.length} groups={byMonth(filt.up)} accent={C.grn}/>
    <TLCol title="過去のイベント" count={filt.past.length} groups={byMonth(filt.past)} accent={C.ink3} muted/>
  </div>);
}


// ─── 説明会・就活イベントビュー ──────────────────────────
function EventsView({events,onToggle,onDelete,onAdd,urg=defUrg,isMobile}){
  const [filter,setFilter]=useState("all");
  const filtered=filter==="all"?events:events.filter(e=>e.kind===filter);
  const upcoming=filtered.filter(e=>!e.done&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const past=filtered.filter(e=>e.done||e.date<today).sort((a,b)=>b.date.localeCompare(a.date));

  return(
    <div>
      {/* ヘッダー */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:C.f.lg,fontWeight:800,margin:0,letterSpacing:-0.3}}>説明会・就活イベント</h2>
          <p style={{fontSize:C.f.xs,color:C.ink3,margin:"3px 0 0"}}>選考とは別の説明会・合同説明会・OB訪問を管理</p>
        </div>
        <button onClick={onAdd} style={{...btnPri,borderRadius:C.r.full,padding:"8px 16px"}}>
          <Ic name="plus" size={13} color="#fff"/>{!isMobile&&"イベントを追加"}
        </button>
      </div>

      {/* 種別フィルター */}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"nowrap",overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
        {[{id:"all",label:"すべて",color:C.ink},...EVENT_KINDS].map(k=>{
          const active=filter===k.id;
          return(<button key={k.id} onClick={()=>setFilter(k.id)}
            style={{padding:"5px 14px",borderRadius:C.r.full,border:`1.5px solid ${active?k.color:C.line}`,background:active?k.color+"18":"transparent",color:active?k.color:C.ink3,cursor:"pointer",fontSize:C.f.xs,fontWeight:active?700:500,fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s"}}>
            {k.label}
          </button>);
        })}
      </div>

      {/* 今後のイベント */}
      {upcoming.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.grn,display:"inline-block"}}/>今後のイベント（{upcoming.length}件）
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {upcoming.map(e=><EventCard key={e.id} event={e} onToggle={onToggle} onDelete={onDelete} urg={urg}/>)}
          </div>
        </div>
      )}

      {/* 過去のイベント */}
      {past.length>0&&(
        <div>
          <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.ink3,display:"inline-block"}}/>過去のイベント（{past.length}件）
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,opacity:0.65}}>
            {past.map(e=><EventCard key={e.id} event={e} onToggle={onToggle} onDelete={onDelete} urg={urg} muted/>)}
          </div>
        </div>
      )}

      {upcoming.length===0&&past.length===0&&(
        <div style={{textAlign:"center",padding:"64px 0",color:C.ink3}}>
          <div style={{fontSize:32,marginBottom:12}}>📅</div>
          <div style={{fontSize:C.f.md,fontWeight:600,marginBottom:6}}>イベントがありません</div>
          <div style={{fontSize:C.f.sm,marginBottom:20}}>説明会・合同説明会・OB訪問などを追加できます</div>
          <button onClick={onAdd} style={{...btnPri,borderRadius:C.r.full,padding:"10px 20px"}}>
            <Ic name="plus" size={14} color="#fff"/>最初のイベントを追加
          </button>
        </div>
      )}
    </div>
  );
}

function EventCard({event:e,onToggle,onDelete,urg=defUrg,muted}){
  const kind=EVENT_KINDS.find(k=>k.id===e.kind)||EVENT_KINDS[EVENT_KINDS.length-1];
  const u=!e.done?urg(e.date):0;
  return(
    <div style={{background:C.bg1,border:`1.5px solid ${u>=2?uColor(u)+"50":C.line}`,borderLeft:`3px solid ${e.done?"#E5E7EB":kind.color}`,borderRadius:C.r.md,padding:"13px 16px",transition:"box-shadow 0.15s"}}
      onMouseEnter={ev=>ev.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"}
      onMouseLeave={ev=>ev.currentTarget.style.boxShadow=""}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        {/* アイコン */}
        <div style={{width:36,height:36,borderRadius:C.r.sm,background:e.done?"#F3F4F6":kind.color+"18",border:`1px solid ${e.done?"#E5E7EB":kind.color+"30"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ic name={kind.icon} size={17} color={e.done?C.ink3:kind.color}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          {/* 種別 + タイトル */}
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontSize:9,fontWeight:700,color:e.done?C.ink3:kind.color,background:e.done?"#F3F4F6":kind.color+"12",padding:"2px 7px",borderRadius:C.r.full,border:`1px solid ${e.done?"#E5E7EB":kind.color+"25"}`}}>{kind.label}</span>
            {u>0&&<DaysChip date={e.date} done={e.done} urg={urg}/>}
          </div>
          <div style={{fontSize:C.f.md,fontWeight:700,color:e.done?C.ink3:C.ink,textDecoration:e.done?"line-through":"none",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div>
          {e.organizer&&<div style={{fontSize:C.f.xs,color:C.ink2,marginBottom:6}}>{e.organizer}</div>}
          {/* 日時・場所 */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:e.notes||e.url?8:0}}>
            <span style={{fontSize:C.f.xs,fontWeight:600,color:u>0&&!e.done?uColor(u):C.ink2,whiteSpace:"nowrap"}}>{fmtM(e.date)}</span>
            <ModeChip mode={e.mode}/>
            {e.mode==="offline"&&e.location&&<span style={{fontSize:C.f.xs,color:C.ink3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>📍{e.location}</span>}
            {e.mode==="online"&&e.url&&<a href={e.url} target="_blank" rel="noopener noreferrer" onClick={ev=>ev.stopPropagation()} style={{fontSize:C.f.xs,color:C.blu,display:"inline-flex",alignItems:"center",gap:3,textDecoration:"none"}}><Ic name="link" size={10} color={C.blu}/>リンク</a>}
          </div>
          {e.notes&&<div style={{fontSize:C.f.xs,color:C.ink2,background:C.bg2,borderRadius:C.r.xs,padding:"5px 8px",lineHeight:1.5}}>{e.notes}</div>}
        </div>
        {/* 操作 */}
        <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0,alignItems:"flex-end"}}>
          <CircleCheck done={e.done} size={24} onToggle={()=>onToggle(e.id)}/>
          <button onClick={()=>onDelete(e.id)} style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex",opacity:0.5}}
            onMouseEnter={ev=>ev.currentTarget.style.opacity="1"} onMouseLeave={ev=>ev.currentTarget.style.opacity="0.5"}>
            <Ic name="trash" size={14} color={C.red}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 一覧ビュー ──────────────────────────────────────────
function ListView({companies,onSelect,onDelete,urg=defUrg,isMobile}){
  if(isMobile) return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {companies.length===0?<div style={{padding:"48px 0",textAlign:"center",color:C.ink3}}>企業がありません</div>
      :companies.map(c=>{
        const next=c.events.filter(e=>!e.done&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
        const u=Math.max(urg(c.deadline),next?urg(next.date):0);
        return(<div key={c.id} style={{background:C.bg1,border:`1.5px solid ${u>0?uColor(u)+"50":C.line}`,borderRadius:C.r.lg,overflow:"hidden"}}>
          <div onClick={()=>onSelect(c)} style={{padding:"14px 16px",cursor:"pointer"}} >
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>{u>=2&&<Ic name="warn" size={13} color={uColor(u)}/>}{c.priority&&<Ic name="starF" size={12} color="#D97706"/>}<span style={{fontSize:C.f.md,fontWeight:700}}>{c.company}</span></div>
                <div style={{fontSize:C.f.xs,color:C.ink3}}>{c.industry}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                <StatusChip status={c.status}/>
                <CatChip cat={c.category}/>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:C.f.xs,color:C.ink2}}>締切 {fmtS(c.deadline)}</span>
                <DaysChip date={c.deadline} done={false} urg={urg}/>
              </div>
              {next&&<span style={{fontSize:C.f.xs,color:C.ink2,display:"flex",alignItems:"center",gap:4}}><Ic name={evtInfo(next.type).icon} size={11} color={C.ink3}/>{fmtS(next.date)}</span>}
            </div>
          </div>
          <div style={{borderTop:`1px solid ${C.line}`,display:"flex"}}>
            <button onClick={()=>onSelect(c)} style={{flex:1,padding:"10px",background:"none",border:"none",cursor:"pointer",fontSize:C.f.sm,color:C.ink2,fontFamily:"inherit",fontWeight:600}}>詳細を見る</button>
            <div style={{width:1,background:C.line}}/>
            <button onClick={()=>onDelete(c.id)} style={{padding:"10px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic name="trash" size={15} color={C.red}/></button>
          </div>
        </div>);
      })}
    </div>
  );
  const widths=["22%","14%","10%","11%","13%","22%","8%"];
  return(<div style={{background:C.bg1,border:`1.5px solid ${C.line}`,borderRadius:C.r.lg,overflow:"hidden"}}>
    <div style={{display:"grid",gridTemplateColumns:widths.join(" "),padding:"10px 18px",background:C.bg2,borderBottom:`1px solid ${C.line}`}}>
      {["企業名","業界","種別","締切","ステータス","次のイベント",""].map(h=><span key={h} style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.6,whiteSpace:"nowrap"}}>{h}</span>)}
    </div>
    {companies.length===0?<div style={{padding:"48px 0",textAlign:"center",color:C.ink3}}>企業がありません</div>
    :companies.map((c,i)=>{
      const next=c.events.filter(e=>!e.done&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0]; const et=next?evtInfo(next.type):null;
      const u=Math.max(urg(c.deadline),next?urg(next.date):0);
      return(<div key={c.id} style={{display:"grid",gridTemplateColumns:widths.join(" "),padding:"11px 18px",borderBottom:`1px solid ${C.line}`,alignItems:"center",background:i%2===0?C.bg1:C.bg2,cursor:"pointer",transition:"background 0.1s"}}
        onMouseEnter={e=>e.currentTarget.style.background="#EFEEE8"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.bg1:C.bg2}>
        <span style={{display:"flex",alignItems:"center",gap:5,fontWeight:700}}>
          {u>=2&&<Ic name="warn" size={12} color={uColor(u)}/>}{c.priority&&<Ic name="starF" size={11} color="#D97706"/>}
          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:C.f.base}}>{c.company}</span>
        </span>
        <span style={{fontSize:C.f.xs,color:C.ink2}}>{c.industry}</span>
        <CatChip cat={c.category}/>
        <div style={{display:"flex",flexDirection:"column",gap:2}}><span style={{fontSize:C.f.sm,fontWeight:600,whiteSpace:"nowrap"}}>{fmtS(c.deadline)}</span><DaysChip date={c.deadline} done={false} urg={urg}/></div>
        <StatusChip status={c.status}/>
        <span style={{fontSize:C.f.xs,color:C.ink2}}>{next?<span style={{display:"flex",alignItems:"center",gap:4}}><Ic name={et.icon} size={11} color={C.ink3}/>{fmtS(next.date)}<ModeChip mode={next.mode}/></span>:"—"}</span>
        <span style={{display:"flex",gap:5}}>
          <button onClick={()=>onSelect(c)} style={{...btn(),padding:"4px 10px",fontSize:C.f.xs}}>詳細</button>
          <button onClick={()=>onDelete(c.id)} style={{...btnDng,padding:"4px 8px",fontSize:C.f.xs}}><Ic name="trash" size={12} color={C.red}/></button>
        </span>
      </div>);
    })}
  </div>);
}


// ─── ステータス追加ボタン ────────────────────────────────
function AddStatusButton(){
  const statuses=useStatuses();
  const ctx=React.useContext(StatusesContext);
  // Context から setCustomStatuses を取得するには App 側で渡す必要がある
  // → App の StatusesContext.Provider に value としてセッターも渡す方式に変更
  const {addStatus}=React.useContext(StatusSetterContext)||{};
  const [open,setOpen]=useState(false);
  const [label,setLabel]=useState("");
  const [colorIdx,setColorIdx]=useState(0);
  const ref=useRef();

  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const save=()=>{
    if(!label.trim()||!addStatus) return;
    const col=STATUS_COLORS[colorIdx];
    const id="custom_"+Date.now();
    addStatus({id,label:label.trim(),...col});
    setLabel(""); setOpen(false);
  };

  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{...btn(),padding:"3px 9px",borderRadius:C.r.full,fontSize:C.f.xs,display:"inline-flex",alignItems:"center",gap:4}}>
        <Ic name="plus" size={11} color={C.ink2}/>追加
      </button>
      {open&&(
        <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",width:220,background:C.bg1,border:`1px solid ${C.line}`,borderRadius:C.r.lg,padding:"12px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:50}}>
          <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,marginBottom:8,textTransform:"uppercase",letterSpacing:0.8}}>ステータスを追加</div>
          <input
            autoFocus value={label} onChange={e=>setLabel(e.target.value)}
            placeholder="例：書類提出済み"
            style={{...iSt,fontSize:C.f.xs,padding:"6px 9px",marginBottom:10}}
            onKeyDown={e=>e.key==="Enter"&&save()}
          />
          <div style={{fontSize:9,color:C.ink3,marginBottom:6,fontWeight:600}}>カラー</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
            {STATUS_COLORS.map((c,i)=>(
              <button key={i} onClick={()=>setColorIdx(i)} style={{width:20,height:20,borderRadius:"50%",background:c.color,border:`2px solid ${colorIdx===i?"#111":"transparent"}`,cursor:"pointer",outline:"none",padding:0,boxShadow:colorIdx===i?"0 0 0 2px #fff, 0 0 0 3px #111":""}}/>
            ))}
          </div>
          {label.trim()&&(
            <div style={{marginBottom:10}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:C.f.xs,fontWeight:600,padding:"3px 10px",borderRadius:C.r.full,background:STATUS_COLORS[colorIdx].bg,color:STATUS_COLORS[colorIdx].color,border:`1px solid ${STATUS_COLORS[colorIdx].border}`}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:STATUS_COLORS[colorIdx].color,display:"inline-block"}}/>
                {label}
              </span>
            </div>
          )}
          <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
            <button onClick={()=>setOpen(false)} style={{...btn(),padding:"4px 10px",fontSize:C.f.xs}}>キャンセル</button>
            <button onClick={save} disabled={!label.trim()} style={{...btnPri,padding:"4px 12px",fontSize:C.f.xs,opacity:label.trim()?1:0.4,cursor:label.trim()?"pointer":"not-allowed"}}>追加</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 詳細パネル ──────────────────────────────────────────
function DetailPanel({company:c,onClose,onUpdate,onDelete,onToggleEvent,onDeleteEvent,urg=defUrg,isMobile}){
  const [editing,setEditing]=useState(false);
  const [showEF,setShowEF]=useState(false);
  const [form,setForm]=useState({company:c.company,industry:c.industry,category:c.category,status:c.status,deadline:c.deadline,notes:c.notes,priority:c.priority});
  const [ef,setEf]=useState({type:"es",label:"",date:"",mode:"online",notes:""});
  const [nid,setNid]=useState(9000);
  const sorted=[...c.events].sort((a,b)=>a.date.localeCompare(b.date));
  const done=c.events.filter(e=>e.done).length,pct=c.events.length>0?Math.round(done/c.events.length*100):0;
  const du2=urg(c.deadline);
  const save=()=>{onUpdate(form);setEditing(false)};
  const addEvt=()=>{if(!ef.date)return;const et=evtInfo(ef.type);const ne={id:nid,type:ef.type,label:ef.label||et.label,date:ef.date,done:false,mode:ef.mode,notes:ef.notes};setNid(n=>n+1);onUpdate({events:[...c.events,ne].sort((a,b)=>a.date.localeCompare(b.date))});setShowEF(false);setEf({type:"es",label:"",date:"",mode:"online",notes:""})};

  const panelStyle = isMobile
    ? {position:"fixed",bottom:0,left:0,right:0,top:0,background:C.bg1,zIndex:150,display:"flex",flexDirection:"column"}
    : {position:"fixed",right:0,top:0,bottom:0,width:420,background:C.bg1,borderLeft:`1.5px solid ${C.line}`,zIndex:150,display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,0.1)"};

  return(<div style={panelStyle}>
    <div style={{padding:isMobile?"16px 16px 12px":"18px 22px",borderBottom:`1px solid ${C.line}`,flexShrink:0,background:du2>0?uBg(du2):"transparent"}}>
      {isMobile&&<div style={{width:36,height:4,borderRadius:2,background:C.line,margin:"0 auto 14px"}}/>}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
        <div style={{flex:1,paddingRight:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
            {c.priority&&<Ic name="starF" size={14} color="#D97706"/>}
            {du2>=2&&<Ic name="warn" size={14} color={uColor(du2)}/>}
            <span style={{fontSize:isMobile?C.f.lg:C.f.xl,fontWeight:800,color:C.ink,letterSpacing:-0.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontSize:C.f.xs,color:C.ink3}}>{c.industry}</span><span style={{color:C.line}}>·</span><CatChip cat={c.category}/><StatusChip status={c.status}/></div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={()=>setEditing(!editing)} style={{...btn(),padding:"6px 11px",fontSize:C.f.xs,background:editing?C.ink:"transparent",color:editing?"#fff":C.ink2}}>{editing?"キャンセル":<><Ic name="edit" size={12} color={C.ink2}/>編集</>}</button>
          <button onClick={onClose} style={{...btn(),padding:"6px 9px"}}><Ic name="close" size={14} color={C.ink2}/></button>
        </div>
      </div>
      {!editing&&c.deadline&&<div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:C.f.xs,color:C.ink2}}>締切 {fmtL(c.deadline)}</span>
        <DaysChip date={c.deadline} done={false} urg={urg}/>
      </div>}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"18px 22px"}}>
      {editing?(<>
        <Field label="企業名"><input value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} style={iSt}/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="業界"><select value={form.industry} onChange={e=>setForm(p=>({...p,industry:e.target.value}))} style={iSt}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></Field>
          <Field label="種別"><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={iSt}>{CATEGORIES.filter(c=>c.id!=="all").map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></Field>
          <Field label="ステータス"><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={iSt}>{useStatuses().map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
          <Field label="ES締切"><input type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} style={iSt}/></Field>
        </div>
        <Field label="メモ"><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={3} style={{...iSt,resize:"vertical"}}/></Field>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:C.f.base,cursor:"pointer",marginBottom:20,color:C.ink2}}><input type="checkbox" checked={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.checked}))}/>優先企業としてマーク</label>
        <div style={{display:"flex",gap:8}}><button onClick={save} style={btnPri}>保存</button><button onClick={onDelete} style={btnDng}><Ic name="trash" size={13} color={C.red}/>削除</button></div>
      </>):(<>
        {c.events.length>0&&<div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:C.f.xs,color:C.ink3,marginBottom:6,fontWeight:600}}>
            <span>選考進捗</span><span>{done} / {c.events.length}件 · {pct}%</span>
          </div>
          <div style={{height:4,background:C.bg3,borderRadius:C.r.full,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:pct===100?C.grn:C.ink,borderRadius:C.r.full,transition:"width 0.4s"}}/>
          </div>
        </div>}
        {c.notes&&<div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:C.r.md,padding:"10px 13px",fontSize:C.f.sm,color:"#92400E",lineHeight:1.7,marginBottom:20}}>{c.notes}</div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8}}>選考フロー</span>
          <button onClick={()=>setShowEF(!showEF)} style={{...btn(),padding:"5px 12px",fontSize:C.f.xs}}><Ic name="plus" size={12} color={C.ink2}/>追加</button>
        </div>
        {showEF&&<div style={{background:C.bg2,border:`1px solid ${C.line}`,borderRadius:C.r.lg,padding:"13px 14px",marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <Field label="種類"><select value={ef.type} onChange={e=>{const et=evtInfo(e.target.value);setEf(p=>({...p,type:e.target.value,label:et.label}))}} style={{...iSt,fontSize:C.f.xs}}>{EVENT_TYPES.map(et=><option key={et.id} value={et.id}>{et.label}</option>)}</select></Field>
            <Field label="日付"><input type="date" value={ef.date} onChange={e=>setEf(p=>({...p,date:e.target.value}))} style={{...iSt,fontSize:C.f.xs}}/></Field>
            <Field label="ラベル（任意）"><input value={ef.label} onChange={e=>setEf(p=>({...p,label:e.target.value}))} placeholder="カスタム名" style={{...iSt,fontSize:C.f.xs}}/></Field>
            <Field label="形式"><select value={ef.mode} onChange={e=>setEf(p=>({...p,mode:e.target.value}))} style={{...iSt,fontSize:C.f.xs}}><option value="online">オンライン</option><option value="offline">対面</option></select></Field>
          </div>
          <Field label="メモ"><input value={ef.notes} onChange={e=>setEf(p=>({...p,notes:e.target.value}))} placeholder="場所・URLなど" style={{...iSt,fontSize:C.f.xs}}/></Field>
          <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}><button onClick={()=>setShowEF(false)} style={{...btn(),padding:"5px 10px",fontSize:C.f.xs}}>キャンセル</button><button onClick={addEvt} style={{...btnPri,padding:"5px 12px",fontSize:C.f.xs}}>追加</button></div>
        </div>}
        {sorted.length===0?<div style={{textAlign:"center",padding:"24px 0",color:C.ink3,fontSize:C.f.sm}}>イベントなし</div>
        :<div>{sorted.map((e,i)=>{
          const et=evtInfo(e.type),u=!e.done?urg(e.date):0;
          return(<div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8,position:"relative"}}>
            {i<sorted.length-1&&<div style={{position:"absolute",left:12,top:26,width:1,height:"calc(100% + 8px - 8px)",background:C.line}}/>}
            <CircleCheck done={e.done} size={24} onToggle={()=>onToggleEvent(e.id)}/>
            <div style={{flex:1,background:u>0?uBg(u):C.bg2,border:`1px solid ${u>0?uColor(u)+"40":C.line}`,borderRadius:C.r.md,padding:"10px 12px",opacity:e.done?0.5:1}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:22,height:22,borderRadius:C.r.xs,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic name={et.icon} size={12} color={u>0?uColor(u):C.ink2}/></div>
                  <span style={{fontSize:C.f.base,fontWeight:700,textDecoration:e.done?"line-through":"none",color:e.done?C.ink3:C.ink}}>{e.label}</span>
                  {u>=2&&<Ic name="warn" size={12} color={uColor(u)}/>}
                </div>
                <button onClick={()=>onDeleteEvent(e.id)} style={{border:"none",background:"none",cursor:"pointer",display:"flex",padding:2}}><Ic name="close" size={11} color={C.ink3}/></button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:C.f.xs,fontWeight:600,color:u>0?uColor(u):C.ink2,whiteSpace:"nowrap"}}>{fmtM(e.date)}</span>
                <ModeChip mode={e.mode}/><DaysChip date={e.date} done={e.done} urg={urg}/>
              </div>
              {e.notes&&<div style={{marginTop:5,fontSize:C.f.xs,color:C.ink2}}>{e.notes.startsWith("http")?<a href={e.notes} target="_blank" rel="noopener noreferrer" style={{color:C.blu,display:"inline-flex",alignItems:"center",gap:3,textDecoration:"none"}}><Ic name="link" size={10} color={C.blu}/>{e.notes}</a>:e.notes}</div>}
            </div>
          </div>);
        })}</div>}
        <div style={{marginTop:22,paddingTop:16,borderTop:`1px solid ${C.line}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8}}>ステータスを変更</span>
            <AddStatusButton/>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {useStatuses().map(s=><button key={s.id} onClick={()=>onUpdate({status:s.id})} style={{padding:"6px 13px",borderRadius:C.r.full,border:`1.5px solid ${c.status===s.id?s.border:C.line}`,background:c.status===s.id?s.bg:"transparent",color:c.status===s.id?s.color:C.ink3,cursor:"pointer",fontSize:C.f.xs,fontWeight:600,fontFamily:"inherit",transition:"all 0.12s",whiteSpace:"nowrap"}}>{s.label}</button>)}
          </div>
        </div>
      </>)}
    </div>
  </div>);
}


// ─── カレンダービュー ─────────────────────────────────────
function CalendarView({allEvents,onSelectCompany,urg=defUrg,isMobile}){
  const now=new Date();
  const [year,setYear]=useState(now.getFullYear());
  const [month,setMonth]=useState(now.getMonth());
  const [popEvt,setPopEvt]=useState(null); // {evt, rect}

  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1);setPopEvt(null)};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1);setPopEvt(null)};
  const goToday=()=>{setYear(now.getFullYear());setMonth(now.getMonth());setPopEvt(null)};

  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  const dayStr=d=>d?`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`:"";

  const eventsByDay=useMemo(()=>{
    const map={};
    allEvents.forEach(e=>{if(e.date){if(!map[e.date])map[e.date]=[];map[e.date].push(e)}});
    return map;
  },[allEvents]);

  const weeks=["日","月","火","水","木","金","土"];
  const wColors=[C.red,"inherit","inherit","inherit","inherit","inherit","#2563EB"];
  const cellH=isMobile?72:96;

  const evtColor=e=>{
    const u=urg(e.date);
    if(e.done) return{bg:"#E5E7EB",text:"#9CA3AF",dot:"#9CA3AF"};
    if(u>=2) return{bg:uBg(u),text:uColor(u),dot:uColor(u)};
    if(u===1) return{bg:uBg(u),text:uColor(u),dot:uColor(u)};
    const cs=CAT_ST[e.category];
    return cs?{bg:cs.bg,text:cs.color,dot:cs.color}:{bg:C.bg3,text:C.ink2,dot:C.ink3};
  };

  return(
    <div style={{background:C.bg1,border:`1px solid ${C.line}`,borderRadius:C.r.lg,overflow:"hidden",position:"relative"}}>
      {/* ヘッダー */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:`1px solid ${C.line}`}}>
        <button onClick={goToday} style={{...btn(),padding:"5px 12px",borderRadius:C.r.full,fontSize:C.f.xs,fontWeight:600}}>今日</button>
        <div style={{display:"flex",gap:4}}>
          <button onClick={prevMonth} style={{...btn(),padding:"6px 10px",borderRadius:C.r.full,fontWeight:700}}>‹</button>
          <button onClick={nextMonth} style={{...btn(),padding:"6px 10px",borderRadius:C.r.full,fontWeight:700}}>›</button>
        </div>
        <span style={{fontSize:C.f.lg,fontWeight:700,letterSpacing:-0.3}}>{year}年{month+1}月</span>
      </div>

      {/* 曜日ヘッダー */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:`1px solid ${C.line}`,background:C.bg2}}>
        {weeks.map((w,i)=>(
          <div key={w} style={{padding:"7px 0",textAlign:"center",fontSize:C.f.xs,fontWeight:700,color:wColors[i]}}>{w}</div>
        ))}
      </div>

      {/* グリッド */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
        {cells.map((d,i)=>{
          const ds=d?dayStr(d):"";
          const evts=d?(eventsByDay[ds]||[]):[];
          const isToday=ds===today;
          const dow=i%7;
          const maxShow=isMobile?1:3;
          const over=evts.length>maxShow;
          return(
            <div key={i} style={{minHeight:cellH,borderRight:`1px solid ${C.line}`,borderBottom:`1px solid ${C.line}`,padding:"4px 3px 3px",background:isToday?"#FFFBF0":"transparent",verticalAlign:"top",position:"relative"}}>
              {d&&<>
                {/* 日付番号 */}
                <div style={{marginBottom:3,paddingLeft:2}}>
                  <span style={{fontSize:C.f.sm,fontWeight:isToday?800:400,width:22,height:22,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",background:isToday?C.ink:"transparent",color:isToday?"#fff":dow===0?C.red:dow===6?"#2563EB":C.ink}}>{d}</span>
                </div>
                {/* インラインイベント */}
                {evts.slice(0,maxShow).map((e,ei)=>{
                  const col=evtColor(e);
                  const et=evtInfo(e.type);
                  return(
                    <div key={ei} onClick={ev=>{ev.stopPropagation();setPopEvt(p=>p?.id===`${d}-${ei}`?null:{id:`${d}-${ei}`,evt:e,top:ev.currentTarget.getBoundingClientRect().bottom,left:ev.currentTarget.getBoundingClientRect().left})}}
                      style={{display:"flex",alignItems:"center",gap:3,padding:"2px 5px",marginBottom:2,borderRadius:C.r.xs,background:col.bg,cursor:"pointer",overflow:"hidden",transition:"opacity 0.1s"}}
                      onMouseEnter={ev=>ev.currentTarget.style.opacity="0.75"} onMouseLeave={ev=>ev.currentTarget.style.opacity="1"}>
                      <span style={{width:4,height:4,borderRadius:"50%",background:col.dot,flexShrink:0}}/>
                      {!isMobile&&<span style={{fontSize:9,fontWeight:600,color:col.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{e.company}</span>}
                      {isMobile&&<span style={{fontSize:8,fontWeight:600,color:col.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,lineHeight:"1.2"}}>{e.company.slice(0,4)}</span>}
                    </div>
                  );
                })}
                {over&&<div style={{fontSize:8,color:C.ink3,paddingLeft:5,cursor:"pointer"}} onClick={ev=>{ev.stopPropagation();setPopEvt({id:`more-${d}`,evt:null,all:evts,top:ev.currentTarget.getBoundingClientRect().bottom,left:ev.currentTarget.getBoundingClientRect().left})}}>+{evts.length-maxShow}件</div>}
              </>}
            </div>
          );
        })}
      </div>

      {/* イベントポップアップ */}
      {popEvt&&(
        <div style={{position:"fixed",inset:0,zIndex:300}} onClick={()=>setPopEvt(null)}>
          <div style={{position:"absolute",top:Math.min(popEvt.top+4,window.innerHeight-280),left:Math.min(Math.max(popEvt.left,8),window.innerWidth-260),width:248,background:C.bg1,border:`1px solid ${C.line}`,borderRadius:C.r.lg,boxShadow:"0 8px 32px rgba(0,0,0,0.14)",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            {(popEvt.all||[popEvt.evt]).filter(Boolean).map((e,i)=>{
              const col=evtColor(e),et=evtInfo(e.type),u=!e.done?urg(e.date):0;
              return(
                <div key={i} onClick={()=>{onSelectCompany(e.companyId);setPopEvt(null)}}
                  style={{display:"flex",alignItems:"flex-start",gap:10,padding:"11px 14px",borderBottom:i<(popEvt.all||[popEvt.evt]).length-1?`1px solid ${C.line}`:"none",cursor:"pointer"}}
                  onMouseEnter={ev=>ev.currentTarget.style.background=C.bg2} onMouseLeave={ev=>ev.currentTarget.style.background=""}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:col.dot,flexShrink:0,marginTop:5}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:C.f.sm,fontWeight:700,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.company}</div>
                    <div style={{fontSize:C.f.xs,color:C.ink2,marginBottom:4}}>{e.label}</div>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:9,fontWeight:600,color:u>0?uColor(u):C.ink3,whiteSpace:"nowrap"}}>{fmtM(e.date)}</span>
                      <ModeChip mode={e.mode}/>
                      {u>0&&<DaysChip date={e.date} done={e.done} urg={urg}/>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── サイドバーナビ ──────────────────────────────────────
function Sidebar({activeView,onNav,onClose,onShowAdd,onShowAddEvent,onShowEmail,onShowThr,isMobile,companies,stats,onCardTap,standaloneEvents=[],customCards=[],onAddCard,onRemoveCard}){
  const [addingCard,setAddingCard]=useState(false);
  const [newCard,setNewCard]=useState({label:"",view:"board",color:C.ink});
  const NAV=[
    {id:"board",    label:"ボード",      icon:"board",  desc:"選考状況をカンバンで"},
    {id:"timeline", label:"スケジュール", icon:"calend", desc:"期限・面接を時系列で"},
    {id:"list",     label:"一覧",        icon:"list",   desc:"企業リストを一覧表示"},
    {id:"events",   label:"説明会・イベント", icon:"bldg",  desc:"説明会・就活イベント管理"},
  ];
  const TOOLS=[
    {id:"add",   label:"企業を追加",   icon:"plus",  action:onShowAdd},
    {id:"addev", label:"イベントを追加", icon:"calend",action:onShowAddEvent||onShowAdd},
    {id:"email", label:"メール取込",   icon:"mail",  action:onShowEmail},
    {id:"thr",   label:"アラート設定", icon:"gear",  action:onShowThr},
  ];
  return(
    <>
      {/* オーバーレイ */}
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",zIndex:90}}/>
      {/* パネル */}
      <div style={{position:"fixed",left:0,top:0,bottom:0,width:isMobile?280:260,background:C.bg1,zIndex:100,display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.10)",animation:"slideInLeft 0.22s ease"}}>
        <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>

        {/* ロゴ */}
        <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${C.line}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:C.r.sm,background:C.ink,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic name="calend" size={16} color="#fff"/></div>
            <div><div style={{fontSize:15,fontWeight:800,letterSpacing:-0.5}}>就活トラッカー</div><div style={{fontSize:9,color:C.ink3,letterSpacing:1.5}}>2026</div></div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"none",cursor:"pointer",padding:4}}><Ic name="close" size={16} color={C.ink3}/></button>
        </div>

        {/* ステータスカード - タップでフィルター遷移 */}
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.line}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8}}>状況</div>
            <button onClick={()=>setAddingCard(a=>!a)}
              style={{width:22,height:22,borderRadius:"50%",border:`1.5px solid ${addingCard?C.ink:C.line}`,background:addingCard?C.ink:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,transition:"all 0.15s"}}>
              <Ic name="plus" size={11} color={addingCard?"#fff":C.ink3}/>
            </button>
          </div>

          {/* カード追加フォーム */}
          {addingCard&&(
            <div style={{background:C.bg,border:`1px solid ${C.line}`,borderRadius:C.r.md,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:C.ink3,marginBottom:8}}>カードを追加</div>
              <div style={{marginBottom:6}}>
                <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:3}}>ラベル</label>
                <input value={newCard.label} onChange={e=>setNewCard(p=>({...p,label:e.target.value}))} placeholder="例：ES提出済み" style={{width:"100%",padding:"5px 8px",border:`1px solid ${C.line}`,borderRadius:C.r.sm,fontSize:C.f.xs,outline:"none",background:C.bg1,color:C.ink,boxSizing:"border-box",fontFamily:"inherit"}}/>
              </div>
              <div style={{marginBottom:6}}>
                <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:3}}>ジャンプ先</label>
                <select value={newCard.view} onChange={e=>setNewCard(p=>({...p,view:e.target.value}))} style={{width:"100%",padding:"5px 8px",border:`1px solid ${C.line}`,borderRadius:C.r.sm,fontSize:C.f.xs,outline:"none",background:C.bg1,color:C.ink,boxSizing:"border-box",fontFamily:"inherit"}}>
                  <option value="board">ボード</option>
                  <option value="timeline">スケジュール</option>
                  <option value="list">一覧</option>
                  <option value="events">イベント</option>
                </select>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>カラー</label>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {["#111111","#2563EB","#D97706","#059669","#7C3AED","#DC2626","#0891B2","#BE185D"].map(col=>(
                    <button key={col} onClick={()=>setNewCard(p=>({...p,color:col}))} style={{width:20,height:20,borderRadius:"50%",background:col,border:`2.5px solid ${newCard.color===col?"#111":"transparent"}`,cursor:"pointer",padding:0,boxShadow:newCard.color===col?"0 0 0 1px #fff,0 0 0 2.5px #111":""}}/>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
                <button onClick={()=>setAddingCard(false)} style={{padding:"4px 9px",borderRadius:C.r.full,border:`1px solid ${C.line}`,background:"transparent",cursor:"pointer",fontSize:9,fontFamily:"inherit",color:C.ink2}}>キャンセル</button>
                <button onClick={()=>{if(newCard.label.trim()){onAddCard&&onAddCard({...newCard});setNewCard({label:"",view:"board",color:C.ink});setAddingCard(false)}}} disabled={!newCard.label.trim()} style={{padding:"4px 9px",borderRadius:C.r.full,border:"none",background:C.ink,color:"#fff",cursor:newCard.label.trim()?"pointer":"not-allowed",fontSize:9,fontFamily:"inherit",opacity:newCard.label.trim()?1:0.4,fontWeight:600}}>追加</button>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[
              {v:stats.total,  l:"総エントリー",c:C.ink,  action:{view:"board",cat:"all",status:null}},
              {v:stats.ongoing,l:"選考中",      c:C.ora,  action:{view:"board",cat:"all",status:"ongoing"}},
              {v:stats.offer,  l:"内定",        c:C.pur,  action:{view:"board",cat:"all",status:"offer"}},
              {v:stats.summer, l:"サマー",      c:"#92400E",action:{view:"board",cat:"summer",status:null}},
              {v:stats.final,  l:"本選考",      c:C.red,  action:{view:"board",cat:"honsenkou",status:null}},
              {v:stats.urgent, l:"要確認",      c:stats.urgent>0?C.red:C.ink3,action:{view:"timeline",cat:"all",status:null},warn:stats.urgent>0},
              {v:standaloneEvents.filter(e=>!e.done).length,l:"イベント予定",c:"#2563EB",action:{view:"events",cat:"all",status:null}},
              ...(customCards||[]),
            ].map((s,i)=>(
              <div key={s.l+i} style={{position:"relative"}}>
                <button onClick={()=>{onCardTap&&onCardTap(s.action||{view:s.view,cat:"all",status:null});onClose()}}
                  style={{width:"100%",padding:"10px 10px",borderRadius:C.r.md,border:`1px solid ${s.warn?"rgba(217,64,64,0.35)":C.line}`,background:s.warn?C.redBg:C.bg2,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.12s",WebkitTapHighlightColor:"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <div style={{fontSize:22,fontWeight:800,color:s.c||s.color||C.ink,lineHeight:1,marginBottom:4}}>{typeof s.v==="number"?s.v:""}</div>
                  <div style={{fontSize:10,color:C.ink3,fontWeight:500,wordBreak:"keep-all"}}>{s.l}</div>
                </button>
                {s.custom&&<button onClick={()=>onRemoveCard&&onRemoveCard(i-7)} style={{position:"absolute",top:3,right:3,border:"none",background:"none",cursor:"pointer",opacity:0,padding:2,transition:"opacity 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.parentElement.querySelector("button").style.opacity="0.7"}}
                  onMouseLeave={e=>{e.currentTarget.style.opacity="0";e.currentTarget.parentElement.querySelector("button").style.opacity="1"}}>
                  <Ic name="close" size={9} color={C.ink3}/>
                </button>}
              </div>
            ))}
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"10px 10px"}}>
          {/* メインナビ */}
          <div style={{marginBottom:6}}>
            <div style={{fontSize:10,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,padding:"6px 10px"}}>メニュー</div>
            {NAV.map(n=>{
              const active=activeView===n.id;
              return(<button key={n.id} onClick={()=>{onNav(n.id);onClose()}}
                style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"10px 12px",borderRadius:C.r.md,border:"none",background:active?C.bg2:"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 0.12s",WebkitTapHighlightColor:"transparent",marginBottom:2}}>
                <div style={{width:32,height:32,borderRadius:C.r.sm,background:active?C.ink:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.12s"}}>
                  <Ic name={n.icon} size={15} color={active?"#fff":C.ink2}/>
                </div>
                <div>
                  <div style={{fontSize:C.f.base,fontWeight:active?700:500,color:active?C.ink:C.ink}}>{n.label}</div>
                  <div style={{fontSize:C.f.xs,color:C.ink3,marginTop:1}}>{n.desc}</div>
                </div>
              </button>);
            })}
          </div>

          <div style={{height:1,background:C.line,margin:"8px 0"}}/>

          {/* ツール */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,padding:"6px 10px"}}>操作</div>
            {TOOLS.map(t=>(
              <button key={t.id} onClick={()=>{t.action();onClose()}}
                style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"10px 12px",borderRadius:C.r.md,border:"none",background:"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 0.12s",WebkitTapHighlightColor:"transparent",marginBottom:2}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:32,height:32,borderRadius:C.r.sm,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Ic name={t.icon} size={15} color={C.ink2}/>
                </div>
                <span style={{fontSize:C.f.base,fontWeight:500,color:C.ink}}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div style={{padding:"14px 16px",borderTop:`1px solid ${C.line}`,fontSize:C.f.xs,color:C.ink3,textAlign:"center"}}>
          就活トラッカー 2026
        </div>
      </div>
    </>
  );
}

// ─── フィルターバー ─────────────────────────────────────
function FilterBar({activeCat,filterInd,statusFilter,companies,onChangeCat,onChangeInd,onClearStatus,onChangeStatus,isMobile,filteredCount=0}){
  const [open,setOpen]=useState(false);
  const activeCatInfo = catInfo(activeCat);
  const activeCatSt   = CAT_ST[activeCat];
  const activeIndLabel = filterInd==="all"?"全業界":filterInd;
  const hasFilter = activeCat!=="all"||filterInd!=="all"||statusFilter;
  const filterCount = (activeCat!=="all"?1:0)+(filterInd!=="all"?1:0)+(statusFilter?1:0);

  const clearAll = () => { onChangeCat("all"); onChangeInd("all"); onClearStatus(); setOpen(false); };

  return(<>
    {/* フィルターボタン行 */}
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <button onClick={()=>setOpen(true)}
        style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:C.r.full,border:`1.5px solid ${hasFilter?C.ink:C.line}`,background:hasFilter?C.ink:"transparent",color:hasFilter?"#fff":C.ink2,cursor:"pointer",fontFamily:"inherit",fontSize:C.f.sm,fontWeight:600,transition:"all 0.15s",WebkitTapHighlightColor:"transparent"}}>
        {/* フィルターアイコン */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/>
        </svg>
        絞り込み
        {filterCount>0&&<span style={{width:18,height:18,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800}}>{filterCount}</span>}
      </button>

      {/* 現在のフィルタータグ */}
      {activeCat!=="all"&&(
        <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:C.r.full,background:activeCatSt?.bg||C.bg2,border:`1px solid ${activeCatSt?.border||C.line}`,fontSize:C.f.xs,fontWeight:600,color:activeCatSt?.color||C.ink}}>
          {activeCatInfo.label}
          <button onClick={()=>onChangeCat("all")} style={{border:"none",background:"none",cursor:"pointer",display:"flex",padding:0,color:"inherit",opacity:0.7}}><Ic name="close" size={10} color="currentColor"/></button>
        </span>
      )}
      {filterInd!=="all"&&(
        <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:C.r.full,background:C.bg2,border:`1px solid ${C.line}`,fontSize:C.f.xs,fontWeight:600,color:C.ink2}}>
          {filterInd}
          <button onClick={()=>onChangeInd("all")} style={{border:"none",background:"none",cursor:"pointer",display:"flex",padding:0,opacity:0.7}}><Ic name="close" size={10} color={C.ink2}/></button>
        </span>
      )}
      {statusFilter&&(
        <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:C.f.xs}}>
          <StatusChip status={statusFilter}/>
          <button onClick={onClearStatus} style={{border:"none",background:"none",cursor:"pointer",display:"flex",padding:0}}><Ic name="close" size={11} color={C.ink3}/></button>
        </span>
      )}
    </div>

    {/* フィルタースライドシート */}
    {open&&<div style={{position:"fixed",inset:0,zIndex:200}} onClick={()=>setOpen(false)}>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:isMobile?"85%":320,background:C.bg1,boxShadow:"-4px 0 32px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column",animation:"slideInRight 0.22s ease"}} onClick={e=>e.stopPropagation()}>
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* シートヘッダー */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:`1px solid ${C.line}`,flexShrink:0}}>
          <span style={{fontSize:C.f.lg,fontWeight:800}}>絞り込み</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {hasFilter&&<button onClick={clearAll} style={{fontSize:C.f.xs,color:C.red,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>リセット</button>}
            <button onClick={()=>setOpen(false)} style={{...btn(),padding:"7px",borderRadius:C.r.full}}><Ic name="close" size={15} color={C.ink2}/></button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"0"}}>
          {/* 種別 */}
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.line}`}}>
            <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>種別</div>
            {CATEGORIES.map(c=>{
              const active=activeCat===c.id;
              const cs=CAT_ST[c.id];
              const cnt=c.id==="all"?companies.length:companies.filter(x=>x.category===c.id).length;
              return(<button key={c.id} onClick={()=>onChangeCat(c.id)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"10px 12px",borderRadius:C.r.md,border:"none",background:active?(cs?.bg||C.bg2):"transparent",cursor:"pointer",fontFamily:"inherit",transition:"all 0.1s",WebkitTapHighlightColor:"transparent",marginBottom:2}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:9,height:9,borderRadius:"50%",background:cs?.color||C.ink,display:"inline-block",flexShrink:0,boxShadow:active?`0 0 0 2px ${cs?.color||C.ink}30`:""}}/>
                  <span style={{fontSize:C.f.base,fontWeight:active?700:400,color:active?(cs?.color||C.ink):C.ink}}>{c.label}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:C.f.xs,color:active?(cs?.color||C.ink):C.ink3,fontWeight:active?700:400,background:active?(cs?.bg||C.bg3):C.bg3,padding:"1px 8px",borderRadius:C.r.full}}>{cnt}</span>
                  {active&&<Ic name="check" size={13} color={cs?.color||C.ink}/>}
                </div>
              </button>);
            })}
          </div>

          {/* ステータス */}
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.line}`}}>
            <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>ステータス</div>
            {[{id:null,label:"すべて"},...useStatuses()].map(s=>{
              const active=statusFilter===s.id;
              const cnt=s.id===null?companies.length:companies.filter(c=>c.status===s.id).length;
              return(<button key={s.id||"all"} onClick={()=>onClearStatus&&(s.id===null?onClearStatus():(onChangeStatus?onChangeStatus(s.id):onClearStatus()))}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 12px",borderRadius:C.r.md,border:"none",background:active?C.bg2:"transparent",cursor:"pointer",fontFamily:"inherit",transition:"background 0.1s",WebkitTapHighlightColor:"transparent",marginBottom:2}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {s.color&&<span style={{width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block"}}/>}
                  <span style={{fontSize:C.f.base,fontWeight:active?700:400,color:active?C.ink:C.ink2}}>{s.label}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:C.f.xs,color:C.ink3,background:C.bg3,padding:"1px 7px",borderRadius:C.r.full}}>{cnt}</span>
                  {active&&<Ic name="check" size={13} color={C.ink}/>}
                </div>
              </button>);
            })}
          </div>

          {/* 業界 */}
          <div style={{padding:"14px 20px"}}>
            <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>業界</div>
            {["all",...INDUSTRIES].map(ind=>{
              const active=filterInd===ind;
              const label=ind==="all"?"すべての業界":ind;
              const cnt=ind==="all"?companies.length:companies.filter(c=>c.industry===ind).length;
              return(<button key={ind} onClick={()=>onChangeInd(ind)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 12px",borderRadius:C.r.md,border:"none",background:active?C.bg2:"transparent",cursor:"pointer",fontFamily:"inherit",transition:"background 0.1s",WebkitTapHighlightColor:"transparent",marginBottom:2}}>
                <span style={{fontSize:C.f.base,fontWeight:active?700:400,color:active?C.ink:C.ink2}}>{label}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:C.f.xs,color:C.ink3,background:C.bg3,padding:"1px 7px",borderRadius:C.r.full}}>{cnt}</span>
                  {active&&<Ic name="check" size={13} color={C.ink}/>}
                </div>
              </button>);
            })}
          </div>
        </div>

        {/* 適用ボタン */}
        <div style={{padding:"16px 20px",borderTop:`1px solid ${C.line}`,flexShrink:0}}>
          <button onClick={()=>setOpen(false)} style={{...btnPri,width:"100%",justifyContent:"center",padding:"12px"}}>
            適用する（{filteredCount}社）
          </button>
        </div>
      </div>
    </div>}
  </>);
}

// ─── アラート設定 ─────────────────────────────────────────
function ThresholdSheet({redDays,yellowDays,onChange,onClose,isMobile}){
  const [r,setR]=useState(String(redDays));
  const [y,setY]=useState(String(yellowDays));
  const rv=Math.max(1,parseInt(r)||1),yv=Math.max(rv+1,parseInt(y)||rv+1);
  const save=()=>{onChange(rv,yv);onClose()};
  return(<Sheet onClose={onClose} width={380} isMobile={isMobile}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
      <div><div style={{fontSize:C.f.lg,fontWeight:800,marginBottom:3}}>期限アラート設定</div><div style={{fontSize:C.f.xs,color:C.ink3}}>何日前から色をつけるか設定します</div></div>
      <button onClick={onClose} style={{...btn(),padding:"7px"}}><Ic name="close" size={15} color={C.ink2}/></button>
    </div>
    {[{label:"赤色アラート",val:r,set:setR,color:C.red,min:1,max:30,bg:C.redBg,border:"rgba(217,64,64,0.2)"},{label:"黄色アラート",val:y,set:setY,color:C.yel,min:rv+1,max:60,bg:C.yelBg,border:"rgba(184,150,12,0.2)"}].map((item,i)=>(
      <div key={i} style={{background:item.bg,border:`1.5px solid ${item.border}`,borderRadius:C.r.lg,padding:"14px 16px",marginBottom:12}}>
        <div style={{fontSize:C.f.base,fontWeight:700,color:item.color,marginBottom:10,display:"flex",alignItems:"center",gap:7}}><div style={{width:9,height:9,borderRadius:"50%",background:item.color}}/>{item.label}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:C.f.sm,color:C.ink2,whiteSpace:"nowrap"}}>締切まで</span><input type="number" min={item.min} max={item.max} value={item.val} onChange={e=>item.set(e.target.value)} style={{...iSt,width:72,textAlign:"center",fontWeight:700,fontSize:C.f.lg,color:item.color}}/><span style={{fontSize:C.f.sm,color:C.ink2,whiteSpace:"nowrap"}}>日以内</span></div>
      </div>
    ))}
    <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:10}}><button onClick={onClose} style={btn()}>キャンセル</button><button onClick={save} style={btnPri}>保存する</button></div>
  </Sheet>);
}


// ─── プレビュー・編集コンポーネント ───────────────────────
function PreviewEdit({parsed,onBack,onImport}){
  const [form,setForm]=useState({
    company:  parsed.company||"",
    industry: parsed.industry||"IT・Web",
    category: parsed.category||"other",
    status:   parsed.status||"applied",
    deadline: parsed.deadline||"",
    notes:    parsed.notes||"",
  });
  const [events,setEvents]=useState(
    (parsed.events||[]).map((e,i)=>({
      _id:i, type:e.type||"other", label:e.label||"",
      date:e.date||"", mode:e.mode||"online",
      notes:[e.notes,e.zoomUrl].filter(Boolean).join(" ")||"",
    }))
  );
  const [addingEvt,setAddingEvt]=useState(false);
  const [newEvt,setNewEvt]=useState({type:"es",label:"",date:"",mode:"online",notes:""});

  const updateEvt=(id,patch)=>setEvents(p=>p.map(e=>e._id===id?{...e,...patch}:e));
  const removeEvt=id=>setEvents(p=>p.filter(e=>e._id!==id));
  const addEvt=()=>{
    setEvents(p=>[...p,{_id:Date.now(),type:newEvt.type,label:newEvt.label||evtInfo(newEvt.type).label,date:newEvt.date,mode:newEvt.mode,notes:newEvt.notes}]);
    setNewEvt({type:"es",label:"",date:"",mode:"online",notes:""});
    setAddingEvt(false);
  };

  const handleImport=()=>{
    onImport({...form,events:events.map(e=>({type:e.type,label:e.label,date:e.date,mode:e.mode,notes:e.notes,zoomUrl:""}))});
  };

  const sInp={...iSt,fontSize:C.f.xs,padding:"6px 9px"};

  return(<>
    {/* 成功バナー */}
    <div style={{background:C.grnBg,border:"1px solid rgba(26,138,74,0.25)",borderRadius:C.r.md,padding:"9px 13px",marginBottom:16,display:"flex",alignItems:"center",gap:8,fontSize:C.f.xs,color:C.grn,fontWeight:600}}>
      <Ic name="check" size={13} color={C.grn}/>解析完了！内容を確認・修正してから取込んでください
    </div>

    {/* ── 企業情報（編集可） ── */}
    <div style={{background:C.bg2,border:`1px solid ${C.line}`,borderRadius:C.r.lg,padding:"14px 16px",marginBottom:14}}>
      <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8,marginBottom:12}}>企業情報</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div>
          <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>企業名</label>
          <input value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} style={sInp} placeholder="企業名"/>
        </div>
        <div>
          <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>業界</label>
          <select value={form.industry} onChange={e=>setForm(p=>({...p,industry:e.target.value}))} style={sInp}>
            {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>種別</label>
          <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={sInp}>
            {CATEGORIES.filter(c=>c.id!=="all").map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>ステータス</label>
          <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={sInp}>
            {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>ES締切</label>
          <input type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} style={sInp}/>
        </div>
      </div>
      <div>
        <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>メモ</label>
        <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2} style={{...sInp,resize:"vertical",width:"100%",boxSizing:"border-box"}}/>
      </div>
    </div>

    {/* ── イベント（編集可） ── */}
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:C.f.xs,fontWeight:700,color:C.ink3,textTransform:"uppercase",letterSpacing:0.8}}>
          イベント（{events.length}件）
        </div>
        <button onClick={()=>setAddingEvt(a=>!a)} style={{...btn(),padding:"3px 10px",fontSize:C.f.xs,borderRadius:C.r.full}}>
          <Ic name="plus" size={11} color={C.ink2}/>追加
        </button>
      </div>

      {/* 新規イベント追加フォーム */}
      {addingEvt&&(
        <div style={{background:C.bg2,border:`1px solid ${C.line}`,borderRadius:C.r.md,padding:"10px 12px",marginBottom:8}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>種類</label>
              <select value={newEvt.type} onChange={e=>{const et=evtInfo(e.target.value);setNewEvt(p=>({...p,type:e.target.value,label:et.label}))}} style={sInp}>
                {EVENT_TYPES.map(et=><option key={et.id} value={et.id}>{et.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>日付</label>
              <input type="date" value={newEvt.date} onChange={e=>setNewEvt(p=>({...p,date:e.target.value}))} style={sInp}/>
            </div>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>ラベル</label>
              <input value={newEvt.label} onChange={e=>setNewEvt(p=>({...p,label:e.target.value}))} placeholder="カスタム名" style={sInp}/>
            </div>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:4}}>形式</label>
              <select value={newEvt.mode} onChange={e=>setNewEvt(p=>({...p,mode:e.target.value}))} style={sInp}>
                <option value="online">オンライン</option>
                <option value="offline">対面</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
            <button onClick={()=>setAddingEvt(false)} style={{...btn(),padding:"4px 10px",fontSize:C.f.xs}}>キャンセル</button>
            <button onClick={addEvt} style={{...btnPri,padding:"4px 12px",fontSize:C.f.xs}}>追加</button>
          </div>
        </div>
      )}

      {/* イベントカードリスト（各行インライン編集） */}
      {events.length===0&&!addingEvt&&(
        <div style={{textAlign:"center",padding:"16px 0",color:C.ink3,fontSize:C.f.sm}}>イベントなし</div>
      )}
      {events.map((e)=>(
        <div key={e._id} style={{background:C.bg1,border:`1px solid ${C.line}`,borderRadius:C.r.md,padding:"10px 12px",marginBottom:6}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:3}}>種類</label>
              <select value={e.type} onChange={ev=>updateEvt(e._id,{type:ev.target.value,label:evtInfo(ev.target.value).label})} style={sInp}>
                {EVENT_TYPES.map(et=><option key={et.id} value={et.id}>{et.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:3}}>ラベル</label>
              <input value={e.label} onChange={ev=>updateEvt(e._id,{label:ev.target.value})} style={sInp} placeholder="イベント名"/>
            </div>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:3}}>日付</label>
              <input type="date" value={e.date} onChange={ev=>updateEvt(e._id,{date:ev.target.value})} style={sInp}/>
            </div>
            <div>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:3}}>形式</label>
              <select value={e.mode} onChange={ev=>updateEvt(e._id,{mode:ev.target.value})} style={sInp}>
                <option value="online">オンライン</option>
                <option value="offline">対面</option>
              </select>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:9,color:C.ink3,fontWeight:700,letterSpacing:0.5,display:"block",marginBottom:3}}>メモ・URL</label>
              <input value={e.notes} onChange={ev=>updateEvt(e._id,{notes:ev.target.value})} placeholder="場所・ZoomURL など" style={{...sInp,width:"100%",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button onClick={()=>removeEvt(e._id)} style={{...btn(),padding:"3px 8px",fontSize:C.f.xs,color:C.red,borderColor:"rgba(217,64,64,0.3)"}}>
              <Ic name="trash" size={11} color={C.red}/>削除
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* フッター */}
    <div style={{display:"flex",gap:8,justifyContent:"space-between",paddingTop:4}}>
      <button onClick={onBack} style={btn()}>← 貼り直す</button>
      <button onClick={handleImport} style={btnPri}>
        <Ic name="check" size={13} color="#fff"/>この内容で取込む
      </button>
    </div>
  </>);
}

// ─── メール取込 ──────────────────────────────────────────
const PARSE_PROMPT=`あなたは就活メール解析AIです。メール本文からJSONを抽出してください。
フィールド: company, industry(IT・Web/コンサル/金融・銀行/メーカー/広告・メディア/商社/インフラ/その他), category(summer/autumn/winter/spring/honsenkou/other), status(planning/applied/ongoing/passed/offer/rejected/withdrawn), deadline(YYYY-MM-DD or null), notes(重要メモ), events([{type(es/test/gr/interview1/interview2/interview3/final/offer/info/other),label,date(YYYY-MM-DD or null),mode(online/offline),notes,zoomUrl}])
今日:${new Date().toISOString().slice(0,10)}。純粋なJSONのみ。`;

async function parseEmail(text){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`${PARSE_PROMPT}\n\n---\n${text}`}]})});
  const data=await res.json();
  return JSON.parse((data.content?.map(c=>c.text||"").join("")||"").replace(/```json|```/g,"").trim());
}

function EmailSheet({onClose,onImport,isMobile}){
  const [step,setStep]=useState("paste");
  const [text,setText]=useState("");
  const [parsed,setParsed]=useState(null);
  const [err,setErr]=useState("");
  const analyze=async()=>{if(!text.trim())return;setStep("loading");setErr("");try{const r=await parseEmail(text);setParsed(r);setStep("preview")}catch{setErr("解析に失敗しました。もう一度お試しください。");setStep("paste")}};
  const si=step==="paste"?0:step==="loading"?1:2;
  return(<Sheet onClose={onClose} width={520} isMobile={isMobile}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><div style={{fontSize:C.f.lg,fontWeight:800,marginBottom:3}}>メールから取込</div><div style={{fontSize:C.f.xs,color:C.ink3}}>企業メールをペーストして自動解析します</div></div>
      <button onClick={onClose} style={{...btn(),padding:"7px"}}><Ic name="close" size={15} color={C.ink2}/></button>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:22}}>
      {[["1","ペースト"],["2","AI解析"],["3","確認"]].map(([num,label],i)=>{
        const active=i<=si,current=i===si;
        return(<div key={num} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:22,height:22,borderRadius:"50%",background:active?C.ink:C.bg3,color:active?"#fff":C.ink3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:C.f.xs,fontWeight:700,flexShrink:0}}>{num}</div><span style={{fontSize:C.f.xs,fontWeight:current?700:400,color:current?C.ink:C.ink3,whiteSpace:"nowrap"}}>{label}</span></div>
          {i<2&&<div style={{flex:1,height:1.5,background:active&&!current?C.ink:C.line,margin:"0 10px"}}/>}
        </div>);
      })}
    </div>
    {step==="paste"&&(<>
      <div style={{position:"relative",marginBottom:14}}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={"メール本文をここにペーストしてください。\n\n例）\n■日時：2026年7月1日（水）14:00〜\n■形式：オンライン（Zoom）\n■URL：https://zoom.us/j/xxxxx\n■締切：2026年6月25日"} style={{...iSt,height:190,resize:"vertical",lineHeight:1.7,fontSize:C.f.sm}}/>{text&&<button onClick={()=>setText("")} style={{position:"absolute",top:10,right:10,border:"none",background:C.bg2,borderRadius:C.r.full,cursor:"pointer",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic name="close" size={10} color={C.ink2}/></button>}</div>
      {err&&<div style={{background:C.redBg,border:"1px solid rgba(217,64,64,0.25)",borderRadius:C.r.md,padding:"10px 12px",fontSize:C.f.xs,color:C.red,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Ic name="warn" size={12} color={C.red}/>{err}</div>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={onClose} style={btn()}>キャンセル</button><button onClick={analyze} disabled={!text.trim()} style={{...btnPri,opacity:text.trim()?1:0.4,cursor:text.trim()?"pointer":"not-allowed"}}>AIで解析する →</button></div>
    </>)}
    {step==="loading"&&<div style={{textAlign:"center",padding:"44px 0"}}>
      <div style={{width:44,height:44,borderRadius:"50%",border:`3px solid ${C.bg3}`,borderTopColor:C.ink,margin:"0 auto 16px",animation:"spin 0.8s linear infinite"}}/>
      <div style={{fontSize:C.f.md,fontWeight:600,marginBottom:6}}>解析中...</div>
      <div style={{fontSize:C.f.xs,color:C.ink3}}>企業情報・日程・URLを自動抽出しています</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>}
    {step==="preview"&&parsed&&<PreviewEdit parsed={parsed} onBack={()=>setStep("paste")} onImport={data=>{onImport(data);onClose()}}/>}
  </Sheet>);
}

// ─── メインアプリ ─────────────────────────────────────────
export default function App(){
  const isMobile = useMobile();
  const [companies,setCompanies]=useState(INITIAL);
  const [activeCat,setActiveCat]=useState("all");
  const [activeView,setActiveView]=useState("board");
  const [statusFilter,setStatusFilter]=useState(null);
  const [selected,setSelected]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [showEmail,setShowEmail]=useState(false);
  const [showThr,setShowThr]=useState(false);
  const [showFilter,setShowFilter]=useState(false);
  const [showSidebar,setShowSidebar]=useState(false);
  const [showAddEvent,setShowAddEvent]=useState(false);
  const [scheduleMode,setScheduleMode]=useState("timeline"); // timeline | calendar
  const [filterInd,setFilterInd]=useState("all");
  const [search,setSearch]=useState(false);
  const [searchQ,setSearchQ]=useState("");
  const [af,setAf]=useState({company:"",industry:"IT・Web",category:"summer",status:"planning",deadline:"",notes:"",priority:false});
  const [nextId,setNextId]=useState(200);
  const [redDays,setRedDays]=useState(3);
  const [yellowDays,setYellowDays]=useState(7);
  const [customStatuses,setCustomStatuses]=useState([]);
  const allStatuses=useMemo(()=>[...STATUSES,...customStatuses],[customStatuses]);
  const [customCards,setCustomCards]=useState([]);
  const addCustomCard=card=>setCustomCards(p=>[...p,{...card,custom:true}]);
  const removeCustomCard=idx=>setCustomCards(p=>p.filter((_,i)=>i!==idx));
  const [standaloneEvents,setStandaloneEvents]=useState(INITIAL_STANDALONE_EVENTS);
  const [evForm,setEvForm]=useState({kind:"setsumeikai",name:"",organizer:"",date:"",mode:"online",location:"",url:"",notes:""});
  const urg=useMemo(()=>makeUrg(redDays,yellowDays),[redDays,yellowDays]);

  const filtered=useMemo(()=>companies.filter(c=>{
    if(activeCat!=="all"&&c.category!==activeCat)return false;
    if(filterInd!=="all"&&c.industry!==filterInd)return false;
    if(statusFilter&&c.status!==statusFilter)return false;
    if(searchQ&&!c.company.toLowerCase().includes(searchQ.toLowerCase()))return false;
    return true;
  }),[companies,activeCat,filterInd,statusFilter,searchQ]);

  const allEvents=useMemo(()=>{
    const ev=[];
    companies.forEach(c=>c.events.forEach(e=>{if(e.date)ev.push({...e,companyId:c.id,company:c.company,category:c.category,isCompanyEvt:true})}));
    standaloneEvents.forEach(e=>ev.push({id:`se-${e.id}`,type:e.kind,label:e.name,date:e.date,done:e.done,mode:e.mode,notes:e.notes,company:e.organizer||e.name,category:"event",isStandalone:true,standaloneId:e.id,url:e.url,location:e.location}));
    return ev.sort((a,b)=>a.date.localeCompare(b.date));
  },[companies,standaloneEvents]);

  const stats=useMemo(()=>({
    total:companies.length,offer:companies.filter(c=>c.status==="offer").length,
    ongoing:companies.filter(c=>c.status==="ongoing").length,
    summer:companies.filter(c=>c.category==="summer").length,
    final:companies.filter(c=>c.category==="honsenkou").length,
    urgent:companies.filter(c=>!["rejected","withdrawn","offer"].includes(c.status)&&urg(c.deadline)>0).length+companies.reduce((a,c)=>a+c.events.filter(e=>!e.done&&urg(e.date)>0).length,0),
  }),[companies,urg]);

  const updComp=(id,patch)=>{setCompanies(p=>p.map(c=>c.id===id?{...c,...patch}:c));setSelected(p=>p&&p.id===id?{...p,...patch}:p)};
  const delComp=id=>{setCompanies(p=>p.filter(c=>c.id!==id));setSelected(null)};
  const togEvt=(cid,eid)=>{setCompanies(p=>p.map(c=>c.id===cid?{...c,events:c.events.map(e=>e.id===eid?{...e,done:!e.done}:e)}:c));setSelected(p=>p&&p.id===cid?{...p,events:p.events.map(e=>e.id===eid?{...e,done:!e.done}:e)}:p)};
  const delEvt=eid=>{if(!selected)return;const up={...selected,events:selected.events.filter(e=>e.id!==eid)};setCompanies(p=>p.map(c=>c.id===selected.id?up:c));setSelected(up)};
  const saveNew=()=>{if(!af.company.trim())return;setCompanies(p=>[...p,{id:nextId,...af,events:[]}]);setNextId(n=>n+1);setShowAdd(false);setAf({company:"",industry:"IT・Web",category:"summer",status:"planning",deadline:"",notes:"",priority:false})};
  const importEmail=parsed=>{const id=nextId;setNextId(n=>n+100);setCompanies(p=>[...p,{id,company:parsed.company||"（未取得）",industry:parsed.industry||"その他",category:parsed.category||"other",status:parsed.status||"applied",priority:false,deadline:parsed.deadline||"",notes:parsed.notes||"",events:(parsed.events||[]).map((e,i)=>({id:id+i+1,type:e.type||"other",label:e.label||"イベント",date:e.date||"",done:false,mode:e.mode||"online",notes:[e.notes,e.zoomUrl].filter(Boolean).join(" | ")||""}))}])};
  const saveNewEvent=()=>{if(!evForm.name.trim()||!evForm.date)return;setStandaloneEvents(p=>[...p,{id:nextId,...evForm}]);setNextId(n=>n+1);setShowAddEvent(false);setEvForm({kind:"setsumeikai",name:"",organizer:"",date:"",mode:"online",location:"",url:"",notes:""})};
  const toggleStandaloneEvent=id=>setStandaloneEvents(p=>p.map(e=>e.id===id?{...e,done:!e.done}:e));
  const deleteStandaloneEvent=id=>setStandaloneEvents(p=>p.filter(e=>e.id!==id));

  const onCardTap = useCallback(({view,cat,status})=>{
    setActiveView(view);
    if(cat) setActiveCat(cat);
    setStatusFilter(status||null);
  },[]);

  const VIEWS=[{id:"board",label:"ボード",icon:"board"},{id:"timeline",label:"スケジュール",icon:"calend"},{id:"list",label:"一覧",icon:"list"},{id:"events",label:"イベント",icon:"bldg"}];
  const pad = isMobile ? "0 16px" : "0 28px";
  const maxW = 1320;

  return(<StatusesContext.Provider value={allStatuses}><StatusSetterContext.Provider value={{addStatus:s=>setCustomStatuses(p=>[...p,s])}}>
  <div style={{fontFamily:"'Hiragino Sans','Yu Gothic UI',sans-serif",background:C.bg,minHeight:"100vh",color:C.ink,writingMode:"horizontal-tb",paddingBottom:isMobile?80:0}}>
    <style>{`*{box-sizing:border-box} input[type=date]::-webkit-calendar-picker-indicator{opacity:0.5} select option{background:#fff;color:#111}`}</style>

    {/* ヘッダー */}
    <header style={{background:C.bg1,borderBottom:`1px solid ${C.line}`,padding:`0 ${isMobile?16:28}px`,position:"sticky",top:0,zIndex:50}}>
      <div style={{maxWidth:maxW,margin:"0 auto",display:"flex",alignItems:"center",gap:isMobile?10:20,height:isMobile?52:56}}>
        {/* ハンバーガー */}
        <button onClick={()=>setShowSidebar(true)} style={{...btn(),padding:"8px",borderRadius:C.r.sm,minWidth:40,justifyContent:"center",flexShrink:0,background:"transparent",border:"none"}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.ink} strokeWidth="1.7" strokeLinecap="round">
            <line x1="2" y1="4.5" x2="16" y2="4.5"/><line x1="2" y1="9" x2="16" y2="9"/><line x1="2" y1="13.5" x2="16" y2="13.5"/>
          </svg>
        </button>
        {/* ロゴ */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:28,height:28,borderRadius:C.r.sm,background:C.ink,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic name="calend" size={15} color="#fff"/></div>
          <div style={{display:isMobile?"none":"block"}}><div style={{fontSize:14,fontWeight:800,letterSpacing:-0.5,lineHeight:1}}>就活トラッカー</div><div style={{fontSize:9,color:C.ink3,letterSpacing:1.5}}>2026</div></div>
        </div>

        <div style={{flex:1}}/>

        {/* 検索 */}
        {search&&<div style={{position:"relative",flexShrink:0}}>
          <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Ic name="search" size={13} color={C.ink3}/></div>
          <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} onBlur={()=>{if(!searchQ)setSearch(false)}} placeholder="企業名で検索..." style={{...iSt,paddingLeft:32,width:isMobile?140:170,borderRadius:C.r.full,padding:"7px 12px 7px 30px"}}/>
        </div>}
        {!search&&<button onClick={()=>setSearch(true)} style={{...btn(),padding:"8px",borderRadius:C.r.full,minWidth:40,justifyContent:"center"}}><Ic name="search" size={17} color={C.ink2}/></button>}

        <NotifBell companies={companies} onSelect={id=>setSelected(companies.find(c=>c.id===id))} redDays={redDays} yellowDays={yellowDays} isMobile={isMobile}/>

        {/* 企業追加ボタン（共通） */}
        <button onClick={()=>setShowAdd(true)} style={{...btnPri,borderRadius:C.r.full,padding:isMobile?"7px 12px":"7px 18px"}}>
          <Ic name="plus" size={13} color="#fff"/>
          {!isMobile&&"企業を追加"}
        </button>
      </div>
    </header>

    {/* メインコンテンツ */}
    <div style={{maxWidth:maxW,margin:"0 auto",padding:isMobile?"16px 16px 0":"24px 28px"}}>
      {/* フィルターバー */}
      <FilterBar
        activeCat={activeCat} filterInd={filterInd} statusFilter={statusFilter}
        companies={companies}
        onChangeCat={c=>{setActiveCat(c);setStatusFilter(null)}}
        onChangeInd={setFilterInd}
        onClearStatus={()=>setStatusFilter(null)}
        onChangeStatus={s=>setStatusFilter(s)}
        isMobile={isMobile}
        filteredCount={filtered.length}
      />

      {activeView==="board"    &&<BoardView    companies={filtered} onSelect={setSelected} urg={urg} statusFilter={statusFilter} isMobile={isMobile}/>}
      {activeView==="timeline" &&<>
        {/* スケジュール切替トグル */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",marginBottom:14}}>
          <div style={{display:"inline-flex",background:C.bg2,borderRadius:C.r.full,padding:3,gap:2}}>
            {[{id:"timeline",label:"タイムライン",icon:"list"},{id:"calendar",label:"カレンダー",icon:"calend"}].map(m=>(
              <button key={m.id} onClick={()=>setScheduleMode(m.id)} style={{padding:"5px 14px",borderRadius:C.r.full,border:"none",cursor:"pointer",fontSize:C.f.xs,fontWeight:600,background:scheduleMode===m.id?C.bg1:"transparent",color:scheduleMode===m.id?C.ink:C.ink3,boxShadow:scheduleMode===m.id?"0 1px 4px rgba(0,0,0,0.08)":"none",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:5,transition:"all 0.15s",whiteSpace:"nowrap"}}>
                <Ic name={m.icon} size={12} color={scheduleMode===m.id?C.ink:C.ink3}/>{m.label}
              </button>
            ))}
          </div>
        </div>
        {scheduleMode==="timeline"&&<TimelineView allEvents={allEvents} activeCategory={activeCat} onSelectCompany={id=>setSelected(companies.find(c=>c.id===id))} onToggle={togEvt} urg={urg} isMobile={isMobile}/>}
        {scheduleMode==="calendar"&&<CalendarView allEvents={allEvents} onSelectCompany={id=>setSelected(companies.find(c=>c.id===id))} urg={urg} isMobile={isMobile}/>}
      </>}
      {activeView==="list"     &&<ListView     companies={filtered} onSelect={setSelected} onDelete={delComp} urg={urg} isMobile={isMobile}/>}
      {activeView==="events"    &&<EventsView   events={standaloneEvents} onToggle={toggleStandaloneEvent} onDelete={deleteStandaloneEvent} onAdd={()=>setShowAddEvent(true)} urg={urg} isMobile={isMobile}/>}
    </div>

    {/* スマホ: ボトムナビ */}
    {isMobile&&<nav style={{position:"fixed",bottom:0,left:0,right:0,background:C.bg1,borderTop:`1px solid ${C.line}`,display:"flex",zIndex:60,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
      <button onClick={()=>setShowSidebar(true)} style={{flex:1,padding:"10px 0 8px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke={C.ink3} strokeWidth="1.7" strokeLinecap="round"><line x1="2" y1="4.5" x2="16" y2="4.5"/><line x1="2" y1="9" x2="16" y2="9"/><line x1="2" y1="13.5" x2="16" y2="13.5"/></svg>
        <span style={{fontSize:9,fontWeight:500,color:C.ink3}}>メニュー</span>
      </button>
      {VIEWS.map(v=><button key={v.id} onClick={()=>setActiveView(v.id)} style={{flex:1,padding:"10px 0 8px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>
        <Ic name={v.icon} size={20} color={activeView===v.id?C.ink:C.ink3}/>
        <span style={{fontSize:9,fontWeight:activeView===v.id?700:500,color:activeView===v.id?C.ink:C.ink3}}>{v.label}</span>
      </button>)}
    </nav>}

    {/* サイドバー */}
    {showSidebar&&<Sidebar activeView={activeView} onNav={setActiveView} onClose={()=>setShowSidebar(false)} onShowAdd={()=>setShowAdd(true)} onShowAddEvent={()=>setShowAddEvent(true)} onShowEmail={()=>setShowEmail(true)} onShowThr={()=>setShowThr(true)} isMobile={isMobile} companies={companies} stats={stats} onCardTap={onCardTap} standaloneEvents={standaloneEvents} customCards={customCards} onAddCard={addCustomCard} onRemoveCard={removeCustomCard}/>}

    {/* 詳細パネル */}
    {selected&&<DetailPanel company={selected} onClose={()=>setSelected(null)} onUpdate={patch=>updComp(selected.id,patch)} onDelete={()=>delComp(selected.id)} onToggleEvent={eid=>togEvt(selected.id,eid)} onDeleteEvent={delEvt} urg={urg} isMobile={isMobile}/>}

    {/* モーダル群 */}
    {showAddEvent&&<Sheet onClose={()=>setShowAddEvent(false)} isMobile={isMobile}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div><div style={{fontSize:C.f.lg,fontWeight:800,letterSpacing:-0.5,marginBottom:2}}>イベントを追加</div><div style={{fontSize:C.f.xs,color:C.ink3}}>説明会・就活イベントを登録します</div></div>
        <button onClick={()=>setShowAddEvent(false)} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${C.line}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic name="close" size={14} color={C.ink3}/></button>
      </div>
      <Field label="種別">
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {EVENT_KINDS.map(k=>(
            <button key={k.id} onClick={()=>setEvForm(p=>({...p,kind:k.id}))} style={{padding:"7px 14px",borderRadius:C.r.full,border:`1.5px solid ${evForm.kind===k.id?k.color:C.line}`,background:evForm.kind===k.id?k.color+"15":"transparent",color:evForm.kind===k.id?k.color:C.ink2,cursor:"pointer",fontSize:C.f.xs,fontWeight:evForm.kind===k.id?700:500,fontFamily:"inherit",transition:"all 0.12s"}}>{k.label}</button>
          ))}
        </div>
      </Field>
      <FormDivider label="基本情報"/>
      <Field label="イベント名" hint="必須"><StyledInput value={evForm.name} onChange={e=>setEvForm(p=>({...p,name:e.target.value}))} placeholder="例：マイナビ就活フェア 2026春"/></Field>
      <Field label="主催・企業名" hint="任意"><StyledInput value={evForm.organizer} onChange={e=>setEvForm(p=>({...p,organizer:e.target.value}))} placeholder="例：マイナビ、○○株式会社"/></Field>
      <FormRow>
        <Field label="日付" hint="必須"><StyledInput type="date" value={evForm.date} onChange={e=>setEvForm(p=>({...p,date:e.target.value}))}/></Field>
        <Field label="形式">
          <StyledSelect value={evForm.mode} onChange={e=>setEvForm(p=>({...p,mode:e.target.value}))}>
            <option value="online">オンライン</option><option value="offline">対面</option>
          </StyledSelect>
        </Field>
      </FormRow>
      {evForm.mode==="offline"&&<Field label="会場・場所"><StyledInput value={evForm.location} onChange={e=>setEvForm(p=>({...p,location:e.target.value}))} placeholder="例：東京ビッグサイト、渋谷オフィス"/></Field>}
      {evForm.mode==="online"&&<Field label="URL・Zoom リンク"><StyledInput value={evForm.url} onChange={e=>setEvForm(p=>({...p,url:e.target.value}))} placeholder="https://..."/></Field>}
      <Field label="メモ" hint="任意"><StyledTextarea value={evForm.notes} onChange={e=>setEvForm(p=>({...p,notes:e.target.value}))} rows={3} placeholder="持ち物・服装・事前準備など..."/></Field>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={()=>setShowAddEvent(false)} style={btn()}>キャンセル</button>
        <button onClick={saveNewEvent} disabled={!evForm.name.trim()||!evForm.date} style={{...btnPri,opacity:evForm.name.trim()&&evForm.date?1:0.45,cursor:evForm.name.trim()&&evForm.date?"pointer":"not-allowed"}}>
          <Ic name="plus" size={13} color="#fff"/>登録する
        </button>
      </div>
    </Sheet>}

    {showThr&&<ThresholdSheet redDays={redDays} yellowDays={yellowDays} onChange={(r,y)=>{setRedDays(r);setYellowDays(y)}} onClose={()=>setShowThr(false)} isMobile={isMobile}/>}
    {showEmail&&<EmailSheet onClose={()=>setShowEmail(false)} onImport={importEmail} isMobile={isMobile}/>}
    {showAdd&&<Sheet onClose={()=>setShowAdd(false)} isMobile={isMobile}>
      {/* ヘッダー */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontSize:C.f.lg,fontWeight:800,letterSpacing:-0.5,marginBottom:2}}>企業を追加</div>
          <div style={{fontSize:C.f.xs,color:C.ink3}}>選考中の企業を登録します</div>
        </div>
        <button onClick={()=>setShowAdd(false)} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${C.line}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ic name="close" size={14} color={C.ink3}/>
        </button>
      </div>

      {/* 基本情報 */}
      <Field label="企業名" hint="必須">
        <StyledInput value={af.company} onChange={e=>setAf(p=>({...p,company:e.target.value}))} placeholder="例：サイバーエージェント"/>
      </Field>

      <FormRow>
        <Field label="業界">
          <StyledSelect value={af.industry} onChange={e=>setAf(p=>({...p,industry:e.target.value}))}>
            {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
          </StyledSelect>
        </Field>
        <Field label="種別">
          <StyledSelect value={af.category} onChange={e=>setAf(p=>({...p,category:e.target.value}))}>
            {CATEGORIES.filter(c=>c.id!=="all").map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </StyledSelect>
        </Field>
      </FormRow>

      <FormDivider label="選考情報"/>

      <FormRow>
        <Field label="ステータス">
          <StyledSelect value={af.status} onChange={e=>setAf(p=>({...p,status:e.target.value}))}>
            {useStatuses().map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </StyledSelect>
        </Field>
        <Field label="ES締切">
          <StyledInput type="date" value={af.deadline} onChange={e=>setAf(p=>({...p,deadline:e.target.value}))}/>
        </Field>
      </FormRow>

      <Field label="メモ" hint="任意">
        <StyledTextarea value={af.notes} onChange={e=>setAf(p=>({...p,notes:e.target.value}))} rows={3} placeholder="OB訪問メモ、対策メモなど..."/>
      </Field>

      {/* 優先マーク */}
      <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:28,padding:"12px 14px",borderRadius:C.r.md,border:`1px solid ${af.priority?C.ink:C.line}`,background:af.priority?C.bg2:"transparent",transition:"all 0.15s"}}>
        <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${af.priority?C.ink:C.line}`,background:af.priority?C.ink:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
          {af.priority&&<Ic name="check" size={11} color="#fff"/>}
        </div>
        <input type="checkbox" checked={af.priority} onChange={e=>setAf(p=>({...p,priority:e.target.checked}))} style={{display:"none"}}/>
        <div>
          <div style={{fontSize:C.f.base,fontWeight:500,color:C.ink}}>優先企業としてマーク</div>
          <div style={{fontSize:C.f.xs,color:C.ink3,marginTop:2}}>ボードカードに★が表示されます</div>
        </div>
      </label>

      {/* ボタン */}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={()=>setShowAdd(false)} style={btn()}>キャンセル</button>
        <button onClick={saveNew} disabled={!af.company.trim()} style={{...btnPri,opacity:af.company.trim()?1:0.45,cursor:af.company.trim()?"pointer":"not-allowed"}}>
          <Ic name="plus" size={13} color="#fff"/>企業を登録
        </button>
      </div>
    </Sheet>}
  </div></StatusSetterContext.Provider></StatusesContext.Provider>);
}
