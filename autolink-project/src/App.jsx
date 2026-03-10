
import { useState, useEffect, useRef, createContext, useContext } from "react";

const save = async (key, val) => { try { await window.storage.set(key, JSON.stringify(val)); } catch(e) {} };
const load = async (key, fallback = null) => { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; } catch(e) { return fallback; } };

const fmtBRL = v => "R$ " + Number(v).toLocaleString("pt-BR");
const fmtKm = v => Number(v).toLocaleString("pt-BR") + " km";
const fmtDate = s => new Date(s).toLocaleDateString("pt-BR");

// ─── API KEY ──────────────────────────────────────────────────────────────────
const getApiKey = () => {
  // Reads from Vite env var (set in Vercel as VITE_ANTHROPIC_KEY)
  try { return import.meta.env?.VITE_ANTHROPIC_KEY || ""; } catch { return ""; }
};

// ─── LANGUAGE CONTEXT ─────────────────────────────────────────────────────────
const LangContext = createContext({ lang:"pt", t: k=>k });

const TRANSLATIONS = {
  pt: {
    explore:"Explorar", matches:"Matches", guide:"Guia", map:"Mapa", profile:"Perfil",
    analyst:"Analista", filters:"Filtros", searchPlaceholder:"Buscar por modelo, marca, cor...",
    swipeRight:"CURTIR ♥", swipeLeft:"PASSAR ✗", noMoreCars:"SEM MAIS CARROS",
    noMoreCarsDesc:"Você viu todos os carros disponíveis. Volte mais tarde!",
    login:"Entrar", register:"Cadastrar", email:"E-mail", password:"Senha", name:"Nome",
    phone:"Telefone", enterApp:"ENTRAR NO APP", demoAccounts:"Contas demo:",
    myListings:"Meus Anúncios", myMatches:"Meus Matches", publish:"Publicar",
    active:"Ativo", paused:"Pausado", pause:"Pausar", activate:"Ativar", remove:"Remover",
    publishCar:"Publicar Carro", back:"← Voltar", save:"Salvar", cancel:"Cancelar",
    logout:"Sair da Conta", editProfile:"Editar Perfil", memberSince:"Membro desde",
    buyer:"Comprador", seller:"Vendedor", admin:"Administrador",
    chooseAnalyst:"SEUS ANALISTAS", buyWithConfidence:"COMPRE COM SEGURANÇA",
    buyWithConfidenceDesc:"Escolha um analista especializado para te acompanhar durante toda a compra.",
    generalSupport:"Chat de Suporte Geral", generalSupportDesc:"Dúvidas rápidas? Fale com nossa equipe agora",
    online:"● Online", available:"● Disponível", busy:"● Ocupado",
    whatsapp:"📱 WhatsApp", chatInApp:"💬 Chat no App",
    buyerGuide:"GUIA DO COMPRADOR", askAI:"🤖 Pergunte ao nosso especialista IA",
    askAIDesc:"Tire qualquer dúvida sobre compra de carros",
    askAIPlaceholder:"Ex: Como sei se o motor está bom?",
    askAILoading:"Consultando especialista...", all:"Todos",
    nearbyVehicles:"CARROS PRÓXIMOS", radius:"Raio:",
    gettingLocation:"Obtendo sua localização...",
    carsNearby:"carros em até", kmFromYou:"km de você",
    noCarsRadius:"Nenhum carro nesse raio. Aumente o filtro de distância!",
    talkToAnalyst:"Falar com Analista 🎯",
    noApiKey:"⚠️ API key não configurada. Configure VITE_ANTHROPIC_KEY no Vercel.",
    chatPlaceholder:"Pergunta para o analista...",
    typing:"digitando...",
    termsTitle:"TERMOS DE USO", myProfile:"MEU PERFIL",
  },
  en: {
    explore:"Explore", matches:"Matches", guide:"Guide", map:"Map", profile:"Profile",
    analyst:"Analyst", filters:"Filters", searchPlaceholder:"Search by model, brand, color...",
    swipeRight:"LIKE ♥", swipeLeft:"PASS ✗", noMoreCars:"NO MORE CARS",
    noMoreCarsDesc:"You've seen all available cars. Check back later!",
    login:"Sign In", register:"Sign Up", email:"Email", password:"Password", name:"Name",
    phone:"Phone", enterApp:"ENTER APP", demoAccounts:"Demo accounts:",
    myListings:"My Listings", myMatches:"My Matches", publish:"Publish",
    active:"Active", paused:"Paused", pause:"Pause", activate:"Activate", remove:"Remove",
    publishCar:"Publish Car", back:"← Back", save:"Save", cancel:"Cancel",
    logout:"Sign Out", editProfile:"Edit Profile", memberSince:"Member since",
    buyer:"Buyer", seller:"Seller", admin:"Administrator",
    chooseAnalyst:"YOUR ANALYSTS", buyWithConfidence:"BUY WITH CONFIDENCE",
    buyWithConfidenceDesc:"Choose a specialized analyst to guide you through the entire purchase.",
    generalSupport:"General Support Chat", generalSupportDesc:"Quick questions? Talk to our team now",
    online:"● Online", available:"● Available", busy:"● Busy",
    whatsapp:"📱 WhatsApp", chatInApp:"💬 Chat in App",
    buyerGuide:"BUYER'S GUIDE", askAI:"🤖 Ask our AI specialist",
    askAIDesc:"Ask anything about buying cars",
    askAIPlaceholder:"E.g.: How do I know if the engine is good?",
    askAILoading:"Consulting specialist...", all:"All",
    nearbyVehicles:"NEARBY CARS", radius:"Radius:",
    gettingLocation:"Getting your location...",
    carsNearby:"cars within", kmFromYou:"km from you",
    noCarsRadius:"No cars in this radius. Increase the distance filter!",
    talkToAnalyst:"Talk to Analyst 🎯",
    noApiKey:"⚠️ API key not configured. Set VITE_ANTHROPIC_KEY in Vercel.",
    chatPlaceholder:"Ask the analyst...",
    typing:"typing...",
    termsTitle:"TERMS OF USE", myProfile:"MY PROFILE",
  },
  es: {
    explore:"Explorar", matches:"Matches", guide:"Guía", map:"Mapa", profile:"Perfil",
    analyst:"Analista", filters:"Filtros", searchPlaceholder:"Buscar por modelo, marca, color...",
    swipeRight:"ME GUSTA ♥", swipeLeft:"PASAR ✗", noMoreCars:"SIN MÁS AUTOS",
    noMoreCarsDesc:"Ya viste todos los autos disponibles. ¡Vuelve más tarde!",
    login:"Iniciar sesión", register:"Registrarse", email:"Correo", password:"Contraseña", name:"Nombre",
    phone:"Teléfono", enterApp:"ENTRAR A LA APP", demoAccounts:"Cuentas demo:",
    myListings:"Mis Anuncios", myMatches:"Mis Matches", publish:"Publicar",
    active:"Activo", paused:"Pausado", pause:"Pausar", activate:"Activar", remove:"Eliminar",
    publishCar:"Publicar Auto", back:"← Volver", save:"Guardar", cancel:"Cancelar",
    logout:"Cerrar Sesión", editProfile:"Editar Perfil", memberSince:"Miembro desde",
    buyer:"Comprador", seller:"Vendedor", admin:"Administrador",
    chooseAnalyst:"TUS ANALISTAS", buyWithConfidence:"COMPRA CON SEGURIDAD",
    buyWithConfidenceDesc:"Elige un analista especializado para acompañarte en toda la compra.",
    generalSupport:"Chat de Soporte General", generalSupportDesc:"¿Dudas rápidas? Habla con nuestro equipo ahora",
    online:"● En línea", available:"● Disponible", busy:"● Ocupado",
    whatsapp:"📱 WhatsApp", chatInApp:"💬 Chat en App",
    buyerGuide:"GUÍA DEL COMPRADOR", askAI:"🤖 Pregunta a nuestro especialista IA",
    askAIDesc:"Resuelve cualquier duda sobre la compra de autos",
    askAIPlaceholder:"Ej: ¿Cómo sé si el motor está bien?",
    askAILoading:"Consultando especialista...", all:"Todos",
    nearbyVehicles:"AUTOS CERCANOS", radius:"Radio:",
    gettingLocation:"Obteniendo tu ubicación...",
    carsNearby:"autos a menos de", kmFromYou:"km de ti",
    noCarsRadius:"Sin autos en este radio. ¡Aumenta el filtro de distancia!",
    talkToAnalyst:"Hablar con Analista 🎯",
    noApiKey:"⚠️ API key no configurada. Configura VITE_ANTHROPIC_KEY en Vercel.",
    chatPlaceholder:"Pregunta al analista...",
    typing:"escribiendo...",
    termsTitle:"TÉRMINOS DE USO", myProfile:"MI PERFIL",
  }
};

// Language switcher component
function LangSwitcher() {
  const { lang, setLang } = useContext(LangContext);
  const flags = { pt:"🇧🇷", en:"🇺🇸", es:"🇪🇸" };
  return (
    <div style={{ display:"flex", gap:4 }}>
      {["pt","en","es"].map(l=>(
        <div key={l} onClick={()=>setLang(l)} style={{ padding:"4px 8px", borderRadius:6, cursor:"pointer", fontSize:"0.8rem", fontWeight:700, background: lang===l?"rgba(255,107,26,0.15)":"transparent", border:`1px solid ${lang===l?"rgba(255,107,26,0.4)":"rgba(255,255,255,0.08)"}`, color: lang===l?"#FF6B1A":"#666", transition:"all 0.15s" }}>
          {flags[l]}
        </div>
      ))}
    </div>
  );
}

const SEED_CARS = [
  { id:"c1", sellerId:"demo_seller", sellerName:"Ricardo Moura", model:"Honda Civic", year:2021, km:32000, price:118000, fuel:"Flex", color:"Preto", city:"São Paulo", desc:"Único dono, revisado em dia, IPVA 2025 pago. Carro em excelente estado.", emoji:"🚗", tag:"Seminovo", active:true, createdAt:"2025-01-01" },
  { id:"c2", sellerId:"demo_seller", sellerName:"Ricardo Moura", model:"Toyota Corolla", year:2022, km:18000, price:145000, fuel:"Flex", color:"Prata", city:"São Paulo", desc:"Impecável, com garantia de fábrica até 2026. Nunca batido.", emoji:"🚙", tag:"Popular", active:true, createdAt:"2025-01-02" },
  { id:"c3", sellerId:"demo_seller2", sellerName:"Fernanda Lima", model:"Jeep Compass", year:2020, km:55000, price:132000, fuel:"Diesel", color:"Branco", city:"São Paulo", desc:"4x4, teto solar panorâmico, multimídia 9 pol.", emoji:"🚐", tag:"SUV", active:true, createdAt:"2025-01-03" },
  { id:"c4", sellerId:"demo_seller2", sellerName:"Fernanda Lima", model:"VW Golf GTI", year:2023, km:8000, price:215000, fuel:"Gasolina", color:"Vermelho", city:"São Paulo", desc:"Esportivo, 0 a 100 em 6.2s, pacote performance.", emoji:"🏎️", tag:"Esportivo", active:true, createdAt:"2025-01-04" },
  { id:"c5", sellerId:"demo_seller3", sellerName:"Paulo Souza", model:"Chevrolet Onix", year:2022, km:41000, price:72000, fuel:"Flex", color:"Azul", city:"São Paulo", desc:"Econômico, ideal pra cidade, documentação ok.", emoji:"🚗", tag:"Popular", active:true, createdAt:"2025-01-05" },
  { id:"c6", sellerId:"demo_seller3", sellerName:"Paulo Souza", model:"BMW X1", year:2021, km:29000, price:298000, fuel:"Gasolina", color:"Cinza", city:"São Paulo", desc:"Premium, banco de couro, teto panorâmico, 4 pneus novos.", emoji:"🚘", tag:"Premium", active:true, createdAt:"2025-01-06" },
];

const SEED_USERS = [
  { id:"demo_buyer", name:"Comprador Demo", email:"comprador@demo.com", password:"123456", role:"buyer", phone:"(11) 99999-0001", createdAt:"2025-01-01" },
  { id:"demo_seller", name:"Ricardo Moura", email:"vendedor@demo.com", password:"123456", role:"seller", phone:"(11) 99999-0002", storeName:"Auto Moura", createdAt:"2025-01-01" },
  { id:"demo_seller2", name:"Fernanda Lima", email:"fernanda@demo.com", password:"123456", role:"seller", phone:"(11) 99999-0003", storeName:"Lima Veículos", createdAt:"2025-01-01" },
  { id:"demo_seller3", name:"Paulo Souza", email:"paulo@demo.com", password:"123456", role:"seller", phone:"(11) 99999-0004", storeName:"Souza Autos", createdAt:"2025-01-01" },
  { id:"admin_1", name:"Admin AutoLink", email:"admin@autolink.com.br", password:"admin123", role:"admin", phone:"(11) 99999-9999", createdAt:"2025-01-01" },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { height:"100vh", background:"#0A0A0A", color:"#F0EDE8", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", maxWidth:480, margin:"0 auto", position:"relative" },
  logoText: { fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", letterSpacing:3, background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  topBar: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 },
  btn: (v="primary") => ({ background: v==="primary" ? "linear-gradient(135deg,#FF2D2D,#FF6B1A)" : v==="ghost" ? "transparent" : "#1A1A1A", color: v==="ghost" ? "#888":"white", border: v==="ghost" ? "1px solid rgba(255,255,255,0.1)":"none", padding:"13px 24px", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"0.9rem", cursor:"pointer", letterSpacing:0.3, width:"100%", boxShadow: v==="primary"?"0 4px 20px rgba(255,45,45,0.25)":"none" }),
  card: (extra={}) => ({ background:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20, ...extra }),
  tag: (color="#FF6B1A") => ({ background: color+"22", color, border:`1px solid ${color}44`, padding:"3px 10px", borderRadius:100, fontSize:"0.72rem", fontWeight:700, letterSpacing:0.5 }),
  input: { width:"100%", background:"#1A1A1A", border:"1px solid rgba(255,255,255,0.08)", color:"#F0EDE8", padding:"13px 16px", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:"0.9rem", outline:"none", marginBottom:14 },
  label: { display:"block", fontSize:"0.72rem", fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"#666", marginBottom:6 },
  sectionTitle: { fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:2, marginBottom:16 },
  navBar: { display:"flex", borderTop:"1px solid rgba(255,255,255,0.07)", background:"#0A0A0A", flexShrink:0 },
  navItem: (active) => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 0", cursor:"pointer", borderTop: active?"2px solid #FF6B1A":"2px solid transparent", gap:3 }),
  scrollArea: { flex:1, overflowY:"auto", padding:"0 16px 80px" },
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  const bg = type==="match" ? "linear-gradient(135deg,#FF2D2D,#FF6B1A)" : type==="error" ? "#7f1d1d" : "#14532d";
  return <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", background:bg, color:"white", padding:"11px 22px", borderRadius:100, fontWeight:700, fontSize:"0.85rem", zIndex:9999, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,0.5)", animation:"toastIn 0.3s ease" }}>{msg}</div>;
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type="text", textarea=false }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={S.label}>{label}</label>}
      {textarea
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ ...S.input, resize:"vertical", minHeight:90, marginBottom:0 }} />
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ ...S.input, marginBottom:0 }} />
      }
    </div>
  );
}

// ─── SELECT ───────────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={S.label}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...S.input, marginBottom:0, appearance:"none" }}>
        {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name, size=36 }) {
  const initials = name?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";
  return <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:size*0.35, color:"white", flexShrink:0 }}>{initials}</div>;
}

// ─── ICON BUTTON ──────────────────────────────────────────────────────────────
function IconBtn({ icon, label, onClick, active=false, badge=0 }) {
  return (
    <div onClick={onClick} style={S.navItem(active)}>
      <div style={{ position:"relative" }}>
        <span style={{ fontSize:"1.3rem" }}>{icon}</span>
        {badge > 0 && <div style={{ position:"absolute", top:-4, right:-6, background:"#FF2D2D", color:"white", borderRadius:100, width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontWeight:900 }}>{badge}</div>}
      </div>
      <span style={{ fontSize:"0.65rem", color: active?"#FF6B1A":"#555", fontWeight:600, letterSpacing:0.5 }}>{label}</span>
    </div>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function SplashScreen({ onStart }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,45,45,0.1), transparent 70%)" }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"5rem", letterSpacing:4, background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>AUTO<br/>LINK</div>
      <div style={{ color:"#555", fontSize:"0.8rem", letterSpacing:2, textTransform:"uppercase", marginBottom:52 }}>São Paulo · Compra & Venda de Carros</div>
      <div style={{ fontSize:"6rem", marginBottom:36, display:"block", animation:"float 3s ease-in-out infinite" }}>🚗</div>
      <p style={{ color:"#666", textAlign:"center", lineHeight:1.8, marginBottom:52, maxWidth:280, fontSize:"0.9rem" }}>Deslize, conecte e feche negócio. O jeito mais inteligente de comprar e vender carros em SP.</p>
      <button onClick={onStart} style={{ ...S.btn("primary"), width:"auto", padding:"16px 52px", fontSize:"1rem" }}>Começar Agora →</button>
      <div style={{ marginTop:28, color:"#444", fontSize:"0.78rem" }}>🔒 Seguro · Verificado · São Paulo</div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}} @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ users, setUsers, setUser, onSuccess, showToast, setScreen }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", storeName:"" });
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  const login = () => {
    if (!form.email || !form.password) { showToast("Preencha e-mail e senha","error"); return; }
    const found = users.find(u => u.email===form.email && u.password===form.password);
    if (!found) { showToast("E-mail ou senha incorretos","error"); return; }
    setUser(found); onSuccess();
  };

  const register = () => {
    if (!form.name||!form.email||!form.password) { showToast("Preencha todos os campos","error"); return; }
    if (form.password.length < 6) { showToast("Senha deve ter mínimo 6 caracteres","error"); return; }
    if (users.find(u=>u.email===form.email)) { showToast("E-mail já cadastrado","error"); return; }
    const u = { id:"u"+Date.now(), ...form, role, createdAt:new Date().toISOString() };
    setUsers(prev=>[...prev,u]);
    setUser(u); onSuccess();
    showToast("Bem-vindo ao AutoLink! 🚗");
  };

  const roles = [{r:"buyer",icon:"🙋",label:"Comprador"},{r:"seller",icon:"🤝",label:"Vendedor"},{r:"admin",icon:"👁️",label:"Admin"}];

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"40px 24px 32px" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={S.logoText}>AUTOLINK</div>
        <div style={{ color:"#555", fontSize:"0.75rem", letterSpacing:2, textTransform:"uppercase" }}>São Paulo</div>
      </div>

      <div style={{ display:"flex", background:"#111", borderRadius:10, padding:4, marginBottom:24, gap:4 }}>
        {[{t:"login",l:"Entrar"},{t:"register",l:"Cadastrar"}].map(({t,l})=>(
          <div key={t} onClick={()=>setTab(t)} style={{ flex:1, textAlign:"center", padding:"10px", borderRadius:7, fontWeight:700, fontSize:"0.85rem", cursor:"pointer", background:tab===t?"#2A2A2A":"transparent", color:tab===t?"#F0EDE8":"#555", transition:"all 0.2s" }}>{l}</div>
        ))}
      </div>

      {tab==="register" && (
        <>
          <label style={S.label}>Eu sou...</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
            {roles.map(({r,icon,label})=>(
              <div key={r} onClick={()=>setRole(r)} style={{ background:"#111", border:`2px solid ${role===r?"#FF6B1A":"rgba(255,255,255,0.07)"}`, borderRadius:10, padding:"14px 8px", textAlign:"center", cursor:"pointer", transition:"all 0.2s", background:role===r?"rgba(255,107,26,0.06)":"#111" }}>
                <div style={{ fontSize:"1.6rem", marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:"0.72rem", fontWeight:700, color:role===r?"#FF6B1A":"#888" }}>{label}</div>
              </div>
            ))}
          </div>
          <Input label="Nome completo" value={form.name} onChange={v=>F("name",v)} placeholder="Carlos Silva" />
          {role==="seller" && <Input label="Nome da loja (opcional)" value={form.storeName} onChange={v=>F("storeName",v)} placeholder="Auto Silva" />}
          <Input label="Telefone" value={form.phone} onChange={v=>F("phone",v)} placeholder="(11) 99999-9999" type="tel" />
        </>
      )}
      <Input label="E-mail" value={form.email} onChange={v=>F("email",v)} placeholder="voce@email.com" type="email" />
      <Input label="Senha" value={form.password} onChange={v=>F("password",v)} placeholder="••••••••" type="password" />

      <button onClick={tab==="login"?login:register} style={S.btn("primary")}>{tab==="login"?"Entrar":"Criar Conta"}</button>

      <div onClick={()=>setTab(tab==="login"?"register":"login")} style={{ textAlign:"center", marginTop:14, color:"#555", fontSize:"0.82rem", cursor:"pointer" }}>
        {tab==="login"?"Não tem conta? Cadastre-se":"Já tem conta? Entrar"}
      </div>
      <div style={{ textAlign:"center", marginTop:20, fontSize:"0.75rem", color:"#444" }}>
        Ao continuar, você concorda com os{" "}
        <span onClick={()=>setScreen("terms")} style={{ color:"#FF6B1A", cursor:"pointer" }}>Termos de Uso</span>
      </div>

      <div style={{ marginTop:28, padding:16, background:"#111", borderRadius:10, fontSize:"0.78rem", color:"#555" }}>
        <div style={{ marginBottom:4, color:"#444", fontWeight:700, letterSpacing:1, fontSize:"0.7rem", textTransform:"uppercase" }}>Contas demo</div>
        <div>🙋 comprador@demo.com / 123456</div>
        <div>🤝 vendedor@demo.com / 123456</div>
        <div>👁️ admin@autolink.com.br / admin123</div>
      </div>
    </div>
  );
}

// ─── BUYER HOME (SWIPE) ────────────────────────────────────────────────────────
function BuyerHome({ cars, user, matches, setMatches, chats, setChats, showToast, setScreen, t }) {
  const { lang } = useContext(LangContext);
  if (!t) t = k => k;
  const [swipedIds, setSwipedIds] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({ tag:"Todos", kmRange:"todos", maxPrice:"", fuel:"Todos", yearMin:"", search:"" });
  const [pendingFilter, setPendingFilter] = useState({ tag:"Todos", kmRange:"todos", maxPrice:"", fuel:"Todos", yearMin:"", search:"" });
  const dragStart = useRef(null);

  const KM_RANGES = [
    { value:"todos", label:"Qualquer KM" },
    { value:"0-15000", label:"Até 15.000 km" },
    { value:"0-50000", label:"Até 50.000 km" },
    { value:"50000+", label:"Acima de 50.000 km" },
    { value:"15000-50000", label:"15.000 a 50.000 km" },
    { value:"0-100000", label:"Até 100.000 km" },
    { value:"100000+", label:"Acima de 100.000 km" },
  ];

  const kmMatch = (km, range) => {
    if (range === "todos") return true;
    if (range === "50000+") return km > 50000;
    if (range === "100000+") return km > 100000;
    const [min, max] = range.split("-").map(Number);
    return km >= min && km <= max;
  };

  const filtered = cars.filter(c => {
    if (!c.active) return false;
    if (swipedIds.includes(c.id)) return false;
    if (filter.tag !== "Todos" && c.tag !== filter.tag) return false;
    if (!kmMatch(c.km, filter.kmRange)) return false;
    if (filter.maxPrice && c.price > Number(filter.maxPrice)) return false;
    if (filter.fuel !== "Todos" && c.fuel !== filter.fuel) return false;
    if (filter.yearMin && c.year < Number(filter.yearMin)) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      const haystack = `${c.model} ${c.color} ${c.fuel} ${c.tag} ${c.city} ${c.sellerName} ${c.year}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const activeFilterCount = [
    filter.tag !== "Todos",
    filter.kmRange !== "todos",
    !!filter.maxPrice,
    filter.fuel !== "Todos",
    !!filter.yearMin,
    !!filter.search,
  ].filter(Boolean).length;

  const current = filtered[0];
  const next = filtered[1];
  const myMatches = matches.filter(m=>m.buyerId===user.id);
  const newMatchCount = myMatches.length;

  const swipe = (dir) => {
    if (!current) return;
    setFeedback(dir);
    setTimeout(() => {
      setFeedback(null);
      setSwipedIds(p=>[...p, current.id]);
      if (dir==="right") {
        const m = { id:"m"+Date.now(), carId:current.id, buyerId:user.id, sellerId:current.sellerId, sellerName:current.sellerName, buyerName:user.name, carModel:current.model, carEmoji:current.emoji, createdAt:new Date().toISOString() };
        setMatches(p=>[...p,m]);
        setChats(p=>({...p,[m.id]:[{ id:"sys1", from:"system", text:`Match criado! ${user.name} curtiu o ${current.model} 🚗`, createdAt:new Date().toISOString() }]}));
        showToast("❤️ É um Match!", "match");
      }
    }, 300);
  };

  const onDragStart = e => { dragStart.current = e.touches?.[0]?.clientX ?? e.clientX; };
  const onDragEnd = e => {
    if (dragStart.current===null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? e.clientX;
    if (Math.abs(endX-dragStart.current)>55) swipe(endX>dragStart.current?"right":"left");
    dragStart.current=null;
  };

  const applyFilters = () => { setFilter(pendingFilter); setSwipedIds([]); setShowFilters(false); showToast(`Filtros aplicados · ${filtered.length} carros`); };
  const clearFilters = () => { const def = { tag:"Todos", kmRange:"todos", maxPrice:"", fuel:"Todos", yearMin:"", search:"" }; setPendingFilter(def); setFilter(def); setSwipedIds([]); setShowFilters(false); showToast("Filtros removidos"); };
  const PF = (k,v) => setPendingFilter(f=>({...f,[k]:v}));

  const TAGS = ["Todos","Popular","Seminovo","SUV","Esportivo","Premium"];
  const tagColors = { Popular:"#00D46A", Seminovo:"#4A9EFF", SUV:"#FF6B1A", Esportivo:"#FF2D2D", Premium:"#A78BFA" };
  const cardBgs = ["linear-gradient(160deg,#0d0d1a,#1a1a3e)","linear-gradient(160deg,#1a0808,#3e1a1a)","linear-gradient(160deg,#0a1a0a,#1a3e1a)","linear-gradient(160deg,#1a1a0a,#3e3e1a)","linear-gradient(160deg,#0d1a1a,#1a3e3e)","linear-gradient(160deg,#1a0d1a,#3e1a3e)"];
  const getBg = id => cardBgs[Math.abs(id.split("").reduce((a,c)=>a+c.charCodeAt(0),0))%cardBgs.length];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* TOP */}
      <div style={S.topBar}>
        <div style={S.logoText}>AUTOLINK</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <LangSwitcher />
          <div onClick={()=>setScreen("analysts")} style={{ cursor:"pointer", background:"rgba(255,107,26,0.1)", border:"1px solid rgba(255,107,26,0.3)", borderRadius:8, padding:"6px 10px", display:"flex", alignItems:"center", gap:4, fontSize:"0.78rem", fontWeight:700, color:"#FF6B1A" }}>
            🎯 {t("analyst")}
          </div>
          <div onClick={()=>{ setPendingFilter(filter); setShowFilters(true); }} style={{ position:"relative", cursor:"pointer", background:"#1A1A1A", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 10px", display:"flex", alignItems:"center", gap:5, fontSize:"0.82rem", fontWeight:700 }}>
            <span>⚙️</span>
            {activeFilterCount > 0 && <div style={{ background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", color:"white", borderRadius:100, width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", fontWeight:900 }}>{activeFilterCount}</div>}
          </div>
          <div onClick={()=>setScreen("profile")} style={{ cursor:"pointer" }}><Avatar name={user.name} size={32} /></div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ padding:"10px 16px 0", flexShrink:0 }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:"1rem", pointerEvents:"none" }}>🔍</span>
          <input
            value={filter.search || ""}
            onChange={e => { setFilter(f=>({...f, search:e.target.value})); setSwipedIds([]); }}
            placeholder="Buscar por modelo, marca, cor..."
            style={{ ...S.input, marginBottom:0, paddingLeft:40, borderRadius:100, fontSize:"0.88rem", background:"#1A1A1A" }}
          />
          {filter.search && (
            <span onClick={()=>{ setFilter(f=>({...f,search:""})); setSwipedIds([]); }} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#555", cursor:"pointer", fontSize:"1rem" }}>✕</span>
          )}
        </div>
      </div>

      {/* FILTER TAGS */}
      <div style={{ display:"flex", gap:8, padding:"8px 16px", overflowX:"auto", flexShrink:0, scrollbarWidth:"none" }}>
        {TAGS.map(t=>(
          <div key={t} onClick={()=>{ setFilter(f=>({...f,tag:t})); setPendingFilter(f=>({...f,tag:t})); setSwipedIds([]); }} style={{ ...S.tag(filter.tag===t?(tagColors[t]||"#FF6B1A"):"#444"), cursor:"pointer", whiteSpace:"nowrap", padding:"5px 14px", transition:"all 0.2s" }}>{t}</div>
        ))}
      </div>

      {/* FILTER DRAWER */}
      {showFilters && (
        <div style={{ position:"absolute", inset:0, zIndex:100, display:"flex", flexDirection:"column" }}>
          <div onClick={()=>setShowFilters(false)} style={{ flex:1, background:"rgba(0,0,0,0.6)" }} />
          <div style={{ background:"#111", borderRadius:"20px 20px 0 0", padding:"24px 20px 32px", maxHeight:"80vh", overflowY:"auto", border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:2 }}>FILTRAR CARROS</div>
              <div onClick={()=>setShowFilters(false)} style={{ color:"#555", cursor:"pointer", fontSize:"1.2rem" }}>✕</div>
            </div>

            {/* KM RANGE */}
            <div style={{ marginBottom:20 }}>
              <label style={S.label}>📍 Quilometragem</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {KM_RANGES.map(({value,label})=>(
                  <div key={value} onClick={()=>PF("kmRange",value)} style={{ background: pendingFilter.kmRange===value ? "rgba(255,107,26,0.12)" : "#1A1A1A", border:`1.5px solid ${pendingFilter.kmRange===value?"#FF6B1A":"rgba(255,255,255,0.07)"}`, borderRadius:10, padding:"11px 12px", cursor:"pointer", fontSize:"0.82rem", fontWeight:600, color: pendingFilter.kmRange===value?"#FF6B1A":"#888", transition:"all 0.15s", textAlign:"center" }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* PRICE */}
            <div style={{ marginBottom:20 }}>
              <label style={S.label}>💰 Preço máximo (R$)</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
                {[{v:"",l:"Qualquer"},{v:"80000",l:"Até 80k"},{v:"150000",l:"Até 150k"},{v:"300000",l:"Até 300k"},{v:"500000",l:"Até 500k"},{v:"1000000",l:"Até 1M"}].map(({v,l})=>(
                  <div key={l} onClick={()=>PF("maxPrice",v)} style={{ background: pendingFilter.maxPrice===v ? "rgba(255,107,26,0.12)" : "#1A1A1A", border:`1.5px solid ${pendingFilter.maxPrice===v?"#FF6B1A":"rgba(255,255,255,0.07)"}`, borderRadius:10, padding:"10px 8px", cursor:"pointer", fontSize:"0.78rem", fontWeight:600, color: pendingFilter.maxPrice===v?"#FF6B1A":"#888", transition:"all 0.15s", textAlign:"center" }}>
                    {l}
                  </div>
                ))}
              </div>
              <input value={pendingFilter.maxPrice} onChange={e=>PF("maxPrice",e.target.value)} placeholder="Ou digite o valor..." type="number" style={{ ...S.input, marginBottom:0, fontSize:"0.88rem" }} />
            </div>

            {/* FUEL */}
            <div style={{ marginBottom:20 }}>
              <label style={S.label}>⛽ Combustível</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["Todos","Flex","Gasolina","Diesel","Elétrico","Híbrido"].map(f=>(
                  <div key={f} onClick={()=>PF("fuel",f)} style={{ background: pendingFilter.fuel===f ? "rgba(255,107,26,0.12)" : "#1A1A1A", border:`1.5px solid ${pendingFilter.fuel===f?"#FF6B1A":"rgba(255,255,255,0.07)"}`, borderRadius:100, padding:"8px 16px", cursor:"pointer", fontSize:"0.8rem", fontWeight:600, color: pendingFilter.fuel===f?"#FF6B1A":"#888", transition:"all 0.15s" }}>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* YEAR */}
            <div style={{ marginBottom:24 }}>
              <label style={S.label}>📅 Ano mínimo</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[{v:"",l:"Qualquer"},{v:"2020",l:"2020+"},{v:"2021",l:"2021+"},{v:"2022",l:"2022+"},{v:"2023",l:"2023+"},{v:"2024",l:"2024+"}].map(({v,l})=>(
                  <div key={l} onClick={()=>PF("yearMin",v)} style={{ background: pendingFilter.yearMin===v ? "rgba(255,107,26,0.12)" : "#1A1A1A", border:`1.5px solid ${pendingFilter.yearMin===v?"#FF6B1A":"rgba(255,255,255,0.07)"}`, borderRadius:100, padding:"8px 16px", cursor:"pointer", fontSize:"0.8rem", fontWeight:600, color: pendingFilter.yearMin===v?"#FF6B1A":"#888", transition:"all 0.15s" }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={applyFilters} style={S.btn("primary")}>Aplicar Filtros</button>
            <button onClick={clearFilters} style={{ ...S.btn("ghost"), marginTop:8 }}>Limpar Filtros</button>
          </div>
        </div>
      )}

      {/* CARD AREA */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"0 16px", overflow:"hidden", position:"relative" }}>
        {current ? (
          <>
            {/* Back card */}
            {next && (
              <div style={{ position:"absolute", top:12, left:32, right:32, bottom:60, borderRadius:20, background:next.photo?"#000":getBg(next.id), border:"1px solid rgba(255,255,255,0.06)", transform:"scale(0.96)", zIndex:1, overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                {next.photo ? <img src={next.photo} alt={next.model} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.6 }} /> : <div style={{ fontSize:"4rem" }}>{next.emoji}</div>}
              </div>
            )}

            {/* Main swipe card */}
            <div
              onMouseDown={onDragStart} onMouseUp={onDragEnd}
              onTouchStart={onDragStart} onTouchEnd={onDragEnd}
              style={{ position:"absolute", top:4, left:16, right:16, bottom:60, borderRadius:20, background:current.photo?"#000":getBg(current.id), border:"1px solid rgba(255,255,255,0.08)", zIndex:2, overflow:"hidden", cursor:"grab", userSelect:"none", boxShadow:"0 20px 60px rgba(0,0,0,0.5)", transition:"transform 0.1s",
                transform: feedback==="right"?"rotate(5deg) translateX(30px)":feedback==="left"?"rotate(-5deg) translateX(-30px)":"none",
                filter: feedback?"brightness(1.1)":"none"
              }}>
              {/* Like / Nope badge */}
              {feedback==="right" && <div style={{ position:"absolute", top:24, left:24, background:"#00D46A", color:"white", padding:"8px 18px", borderRadius:8, fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:2, border:"3px solid white", transform:"rotate(-10deg)", zIndex:10, boxShadow:"0 4px 20px rgba(0,212,106,0.4)" }}>CURTIR ♥</div>}
              {feedback==="left" && <div style={{ position:"absolute", top:24, right:24, background:"#FF2D2D", color:"white", padding:"8px 18px", borderRadius:8, fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:2, border:"3px solid white", transform:"rotate(10deg)", zIndex:10 }}>PASSAR ✗</div>}

              {/* Photo or emoji */}
              {current.photo
                ? <img src={current.photo} alt={current.model} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", position:"absolute", inset:0, fontSize:"7rem" }}>{current.emoji}</div>
              }

              {/* Info panel */}
              <div style={{ background:"linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)", padding:"24px 20px 20px", position:"absolute", bottom:0, left:0, right:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", letterSpacing:1, lineHeight:1 }}>{current.model}</div>
                    <div style={{ color:"#888", fontSize:"0.82rem", marginTop:2 }}>{current.year} · {fmtKm(current.km)} · {current.fuel}</div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", letterSpacing:1, background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", textAlign:"right" }}>{fmtBRL(current.price)}</div>
                </div>
                <p style={{ color:"#aaa", fontSize:"0.82rem", lineHeight:1.5, marginBottom:10 }}>{current.desc}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={S.tag(tagColors[current.tag]||"#FF6B1A")}>{current.tag}</span>
                  <span style={S.tag("#4A9EFF")}>{current.color}</span>
                  <span style={{ fontSize:"0.78rem", color:"#555", marginLeft:"auto" }}>📍 {current.city}</span>
                </div>
                <div style={{ marginTop:8, fontSize:"0.78rem", color:"#555" }}>Vendedor: {current.sellerName}</div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ position:"absolute", bottom:10, left:0, right:0, display:"flex", justifyContent:"center", gap:20, zIndex:10 }}>
              <button onClick={()=>swipe("left")} style={{ width:60, height:60, borderRadius:"50%", background:"#1A1A1A", border:"2px solid rgba(255,45,45,0.3)", fontSize:"1.5rem", cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>✕</button>
              <button onClick={()=>swipe("right")} style={{ width:60, height:60, borderRadius:"50%", background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", border:"none", fontSize:"1.5rem", cursor:"pointer", boxShadow:"0 4px 20px rgba(255,45,45,0.4)" }}>♥</button>
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, color:"#555" }}>
            <div style={{ fontSize:"4rem" }}>🚗</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:2, color:"#444" }}>SEM MAIS CARROS</div>
            <div style={{ fontSize:"0.85rem", textAlign:"center", maxWidth:220 }}>Você viu todos os carros disponíveis. Volte mais tarde!</div>
          </div>
        )}
      </div>

      {/* NAV */}
      <div style={S.navBar}>
        <IconBtn icon="🔥" label={t("explore")} active={true} />
        <IconBtn icon="❤️" label={t("matches")} badge={newMatchCount} onClick={()=>setScreen("matches")} />
        <IconBtn icon="📚" label={t("guide")} onClick={()=>setScreen("education")} />
        <IconBtn icon="🗺️" label={t("map")} onClick={()=>setScreen("map")} />
        <IconBtn icon="👤" label={t("profile")} onClick={()=>setScreen("profile")} />
      </div>
    </div>
  );
}

// ─── SELLER HOME ───────────────────────────────────────────────────────────────
function SellerHome({ user, cars, setCars, matches, showToast, setScreen }) {
  const myCars = cars.filter(c=>c.sellerId===user.id);
  const myMatches = matches.filter(m=>m.sellerId===user.id);
  const [navTab, setNavTab] = useState("cars");

  const toggleActive = (carId) => {
    setCars(prev=>prev.map(c=>c.id===carId?{...c,active:!c.active}:c));
    showToast("Anúncio atualizado");
  };

  const deleteCar = (carId) => {
    setCars(prev=>prev.filter(c=>c.id!==carId));
    showToast("Anúncio removido");
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div style={S.logoText}>AUTOLINK</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div onClick={()=>setScreen("upload")} style={{ background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", color:"white", border:"none", padding:"8px 16px", borderRadius:8, fontWeight:700, fontSize:"0.82rem", cursor:"pointer" }}>+ Anunciar</div>
          <div onClick={()=>setScreen("profile")} style={{ cursor:"pointer" }}><Avatar name={user.name} size={32} /></div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, padding:"12px 16px", flexShrink:0 }}>
        {[{n:myCars.length,l:"Anúncios",e:"🚗"},{n:myCars.filter(c=>c.active).length,l:"Ativos",e:"✅"},{n:myMatches.length,l:"Matches",e:"❤️"}].map(({n,l,e})=>(
          <div key={l} style={{ background:"#111", borderRadius:12, padding:"14px 10px", textAlign:"center", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize:"1.2rem" }}>{e}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:1 }}>{n}</div>
            <div style={{ fontSize:"0.7rem", color:"#555", fontWeight:600, letterSpacing:0.5 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:4, padding:"0 16px 12px", flexShrink:0 }}>
        {["cars","matches"].map(t=>(
          <div key={t} onClick={()=>setNavTab(t)} style={{ flex:1, textAlign:"center", padding:"8px", borderRadius:8, fontWeight:700, fontSize:"0.82rem", cursor:"pointer", background:navTab===t?"#1A1A1A":"transparent", color:navTab===t?"#F0EDE8":"#555", border:navTab===t?"1px solid rgba(255,255,255,0.1)":"1px solid transparent" }}>
            {t==="cars"?"Meus Anúncios":"Matches"}
          </div>
        ))}
      </div>

      <div style={S.scrollArea}>
        {navTab==="cars" && (
          myCars.length===0
            ? <div style={{ textAlign:"center", color:"#555", paddingTop:40 }}><div style={{ fontSize:"3rem", marginBottom:12 }}>🚗</div><div>Nenhum anúncio ainda</div><button onClick={()=>setScreen("upload")} style={{ ...S.btn("primary"), marginTop:16, width:"auto", padding:"12px 28px" }}>+ Publicar Carro</button></div>
            : myCars.map(c=>(
              <div key={c.id} style={{ ...S.card({ marginBottom:12 }), display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:56, height:56, borderRadius:10, overflow:"hidden", flexShrink:0, background:"#1A1A1A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>
                  {c.photo ? <img src={c.photo} alt={c.model} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : c.emoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ fontWeight:700, fontSize:"0.95rem" }}>{c.model} {c.year}</div>
                    <div style={{ ...S.tag(c.active?"#00D46A":"#555"), fontSize:"0.68rem" }}>{c.active?"Ativo":"Pausado"}</div>
                  </div>
                  <div style={{ color:"#888", fontSize:"0.8rem", marginTop:2 }}>{fmtBRL(c.price)} · {fmtKm(c.km)}</div>
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <button onClick={()=>toggleActive(c.id)} style={{ flex:1, background:"#1A1A1A", border:"1px solid rgba(255,255,255,0.08)", color:"#aaa", padding:"7px", borderRadius:6, fontSize:"0.75rem", fontWeight:700, cursor:"pointer" }}>{c.active?"Pausar":"Ativar"}</button>
                    <button onClick={()=>deleteCar(c.id)} style={{ background:"rgba(255,45,45,0.1)", border:"1px solid rgba(255,45,45,0.2)", color:"#FF6B6B", padding:"7px 12px", borderRadius:6, fontSize:"0.75rem", fontWeight:700, cursor:"pointer" }}>Remover</button>
                  </div>
                </div>
              </div>
            ))
        )}
        {navTab==="matches" && (
          myMatches.length===0
            ? <div style={{ textAlign:"center", color:"#555", paddingTop:40 }}><div style={{ fontSize:"3rem", marginBottom:12 }}>❤️</div><div>Nenhum match ainda</div></div>
            : myMatches.map(m=>(
              <div key={m.id} onClick={()=>setScreen("chat_"+m.id)} style={{ ...S.card({ marginBottom:12, cursor:"pointer", display:"flex", gap:12, alignItems:"center" }) }}>
                <div style={{ fontSize:"2rem" }}>{m.carEmoji||"🚗"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{m.carModel}</div>
                  <div style={{ color:"#888", fontSize:"0.8rem" }}>Comprador: {m.buyerName}</div>
                  <div style={{ color:"#555", fontSize:"0.75rem" }}>{fmtDate(m.createdAt)}</div>
                </div>
                <div style={{ color:"#FF6B1A", fontSize:"0.8rem" }}>Chat →</div>
              </div>
            ))
        )}
      </div>

      <div style={S.navBar}>
        <IconBtn icon="🚗" label="Anúncios" active={true} />
        <IconBtn icon="❤️" label="Matches" badge={myMatches.length} onClick={()=>setNavTab("matches")} />
        <IconBtn icon="➕" label="Publicar" onClick={()=>setScreen("upload")} />
        <IconBtn icon="👤" label="Perfil" onClick={()=>setScreen("profile")} />
      </div>
    </div>
  );
}

// ─── UPLOAD CAR ────────────────────────────────────────────────────────────────
function UploadScreen({ user, setCars, showToast, setScreen }) {
  const [form, setForm] = useState({ model:"", year:"2023", km:"", price:"", fuel:"Flex", color:"", city:"São Paulo", desc:"", tag:"Seminovo", emoji:"🚗" });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));
  const emojis = ["🚗","🚙","🏎️","🚐","🚘","🚕","🛻","🚌"];

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setUploading(true);
    Promise.all(files.map(file => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res(ev.target.result);
      reader.readAsDataURL(file);
    }))).then(results => {
      setPhotos(prev => [...prev, ...results].slice(0, 5));
      setUploading(false);
    });
  };

  const removePhoto = (idx) => setPhotos(p => p.filter((_,i)=>i!==idx));

  const submit = () => {
    if (!form.model||!form.price||!form.km) { showToast("Preencha modelo, preço e km","error"); return; }
    const car = {
      id:"c"+Date.now(), sellerId:user.id, sellerName:user.storeName||user.name,
      ...form, km:Number(form.km), price:Number(form.price), year:Number(form.year),
      photo: photos[0] || null, photos, active:true, createdAt:new Date().toISOString()
    };
    setCars(prev=>[...prev,car]);
    showToast("Carro publicado! 🚗");
    setScreen("home");
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setScreen("home")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:2 }}>PUBLICAR CARRO</div>
        <div style={{ width:48 }} />
      </div>
      <div style={S.scrollArea}>

        {/* PHOTO UPLOAD */}
        <div style={{ marginBottom:20 }}>
          <label style={S.label}>📸 Fotos do carro (até 5)</label>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:"none" }} />

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
            {/* Upload button */}
            <div onClick={()=>fileRef.current.click()} style={{ aspectRatio:"1", borderRadius:12, background:"#1A1A1A", border:"2px dashed rgba(255,107,26,0.3)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:6, transition:"all 0.2s" }}>
              {uploading ? <div style={{ fontSize:"1.5rem", animation:"spin 1s linear infinite" }}>⏳</div> : <>
                <div style={{ fontSize:"1.8rem" }}>📷</div>
                <div style={{ fontSize:"0.72rem", color:"#FF6B1A", fontWeight:700 }}>Adicionar foto</div>
              </>}
            </div>

            {/* Photo previews */}
            {photos.map((p,i)=>(
              <div key={i} style={{ aspectRatio:"1", borderRadius:12, overflow:"hidden", position:"relative", border: i===0?"2px solid #FF6B1A":"2px solid rgba(255,255,255,0.08)" }}>
                <img src={p} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                {i===0 && <div style={{ position:"absolute", top:4, left:4, background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", color:"white", fontSize:"0.6rem", fontWeight:900, padding:"2px 6px", borderRadius:4 }}>CAPA</div>}
                <div onClick={()=>removePhoto(i)} style={{ position:"absolute", top:4, right:4, background:"rgba(0,0,0,0.7)", color:"white", width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"0.7rem", fontWeight:900 }}>✕</div>
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <div style={{ marginTop:8, fontSize:"0.78rem", color:"#555", textAlign:"center" }}>
              A primeira foto será a capa do anúncio
            </div>
          )}
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={S.label}>Ícone (usado se não tiver foto)</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {emojis.map(e=>(
              <div key={e} onClick={()=>F("emoji",e)} style={{ width:44, height:44, borderRadius:10, background:"#1A1A1A", border:`2px solid ${form.emoji===e?"#FF6B1A":"rgba(255,255,255,0.07)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", cursor:"pointer" }}>{e}</div>
            ))}
          </div>
        </div>

        <Input label="Modelo do carro *" value={form.model} onChange={v=>F("model",v)} placeholder="Ex: Honda Civic, Toyota Corolla..." />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="Ano *" value={form.year} onChange={v=>F("year",v)} placeholder="2023" type="number" />
          <Input label="KM rodados *" value={form.km} onChange={v=>F("km",v)} placeholder="32000" type="number" />
        </div>
        <Input label="Preço (R$) *" value={form.price} onChange={v=>F("price",v)} placeholder="120000" type="number" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Select label="Combustível" value={form.fuel} onChange={v=>F("fuel",v)} options={["Flex","Gasolina","Diesel","Elétrico","Híbrido"]} />
          <Input label="Cor" value={form.color} onChange={v=>F("color",v)} placeholder="Preto" />
        </div>
        <Select label="Categoria" value={form.tag} onChange={v=>F("tag",v)} options={["Popular","Seminovo","SUV","Esportivo","Premium","Elétrico"]} />
        <Input label="Cidade" value={form.city} onChange={v=>F("city",v)} placeholder="São Paulo" />
        <Input label="Descrição" value={form.desc} onChange={v=>F("desc",v)} placeholder="Descreva o estado do carro, diferenciais, histórico..." textarea />

        <div style={{ background:"rgba(255,107,26,0.06)", border:"1px solid rgba(255,107,26,0.15)", borderRadius:10, padding:14, marginBottom:16, fontSize:"0.8rem", color:"#888" }}>
          💡 <strong style={{ color:"#FF6B1A" }}>Dica:</strong> Anúncios com fotos reais recebem 5x mais matches!
        </div>

        <button onClick={submit} style={S.btn("primary")}>Publicar Anúncio 🚗</button>
        <button onClick={()=>setScreen("home")} style={{ ...S.btn("ghost"), marginTop:8 }}>Cancelar</button>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ─── MATCHES ───────────────────────────────────────────────────────────────────
function MatchesScreen({ user, matches, cars, users, onOpenChat, setScreen }) {
  const myMatches = matches.filter(m => user.role==="buyer" ? m.buyerId===user.id : m.sellerId===user.id);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setScreen("home")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:2 }}>MATCHES</div>
        <div style={{ width:48 }} />
      </div>

      {myMatches.length===0 ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#555", gap:14 }}>
          <div style={{ fontSize:"4rem" }}>❤️</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:2, color:"#333" }}>NENHUM MATCH AINDA</div>
          <div style={{ fontSize:"0.85rem", textAlign:"center", maxWidth:220 }}>Continue explorando carros para encontrar seu match!</div>
          <button onClick={()=>setScreen("home")} style={{ ...S.btn("primary"), width:"auto", padding:"12px 28px", marginTop:8 }}>Explorar Carros</button>
        </div>
      ) : (
        <div style={S.scrollArea}>
          <div style={{ paddingTop:16 }}>
            {myMatches.map(m => {
              const car = cars.find(c=>c.id===m.carId);
              const otherName = user.role==="buyer" ? m.sellerName : m.buyerName;
              return (
                <div key={m.id} onClick={()=>{ onOpenChat && onOpenChat(m); setScreen("chat_"+m.id); }} style={{ ...S.card({ marginBottom:12, cursor:"pointer", display:"flex", gap:14, alignItems:"center" }) }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#1a0808,#3e1a1a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", flexShrink:0 }}>{m.carEmoji||car?.emoji||"🚗"}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:2 }}>{m.carModel||car?.model}</div>
                    <div style={{ color:"#888", fontSize:"0.8rem" }}>{user.role==="buyer"?"Vendedor":"Comprador"}: {otherName}</div>
                    {car && <div style={{ color:"#555", fontSize:"0.78rem", marginTop:2 }}>{fmtBRL(car.price)} · {fmtKm(car.km)}</div>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    <div style={S.tag("#00D46A")}>Match!</div>
                    <div style={{ color:"#FF6B1A", fontSize:"0.8rem", fontWeight:700 }}>Chat →</div>
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

// ─── CHAT ──────────────────────────────────────────────────────────────────────
function ChatScreen({ user, matchId, chats, setChats, matches, cars, users, setScreen }) {
  const [msg, setMsg] = useState("");
  const bottomRef = useRef(null);
  const match = matches.find(m=>m.id===matchId);
  const car = cars.find(c=>c.id===match?.carId);
  const messages = chats[matchId] || [];
  const otherName = user.role==="buyer" ? match?.sellerName : match?.buyerName;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = () => {
    if (!msg.trim()) return;
    const newMsg = { id:"msg"+Date.now(), from:user.id, fromName:user.name, text:msg.trim(), createdAt:new Date().toISOString() };
    setChats(prev=>({ ...prev, [matchId]: [...(prev[matchId]||[]), newMsg] }));
    setMsg("");
  };

  const presetMessages = ["Ainda está disponível?","Aceita visita para ver o carro?","Qual o menor valor?","Tem histórico de revisões?"];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* HEADER */}
      <div style={S.topBar}>
        <div onClick={()=>setScreen("matches")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{otherName}</div>
          <div style={{ color:"#555", fontSize:"0.75rem" }}>{car?.model} {car?.year}</div>
        </div>
        <div style={{ fontSize:"1.4rem" }}>{car?.emoji||"🚗"}</div>
      </div>

      {/* CAR MINI CARD */}
      {car && (
        <div style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 16px", background:"#111", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:"2rem" }}>{car.emoji}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{car.model} {car.year}</div>
            <div style={{ color:"#888", fontSize:"0.78rem" }}>{fmtBRL(car.price)} · {fmtKm(car.km)}</div>
          </div>
          <div style={{ marginLeft:"auto", ...S.tag("#00D46A") }}>Match ❤️</div>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:8 }}>
        {messages.map(m => {
          const isMe = m.from===user.id;
          const isSys = m.from==="system";
          if (isSys) return <div key={m.id} style={{ textAlign:"center", fontSize:"0.75rem", color:"#444", padding:"8px 16px", background:"#111", borderRadius:100, alignSelf:"center" }}>{m.text}</div>;
          return (
            <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems: isMe?"flex-end":"flex-start" }}>
              {!isMe && <div style={{ fontSize:"0.7rem", color:"#555", marginBottom:3, paddingLeft:4 }}>{m.fromName}</div>}
              <div style={{ background: isMe?"linear-gradient(135deg,#FF2D2D,#FF6B1A)":"#1A1A1A", color: isMe?"white":"#F0EDE8", padding:"10px 14px", borderRadius: isMe?"16px 16px 4px 16px":"16px 16px 16px 4px", maxWidth:"75%", fontSize:"0.88rem", lineHeight:1.5, border: isMe?"none":"1px solid rgba(255,255,255,0.07)" }}>
                {m.text}
              </div>
              <div style={{ fontSize:"0.65rem", color:"#444", marginTop:3, paddingLeft:4 }}>{new Date(m.createdAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* QUICK REPLIES */}
      <div style={{ display:"flex", gap:6, padding:"8px 16px", overflowX:"auto", scrollbarWidth:"none", flexShrink:0 }}>
        {presetMessages.map(p=>(
          <div key={p} onClick={()=>setMsg(p)} style={{ whiteSpace:"nowrap", background:"#1A1A1A", border:"1px solid rgba(255,255,255,0.08)", color:"#aaa", padding:"6px 12px", borderRadius:100, fontSize:"0.75rem", cursor:"pointer" }}>{p}</div>
        ))}
      </div>

      {/* INPUT */}
      <div style={{ display:"flex", gap:10, padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Digite uma mensagem..." style={{ ...S.input, flex:1, marginBottom:0, borderRadius:100, padding:"12px 18px" }} />
        <button onClick={send} style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", border:"none", color:"white", fontSize:"1.1rem", cursor:"pointer", flexShrink:0 }}>↑</button>
      </div>
    </div>
  );
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────────
function AdminScreen({ cars, setCars, users, matches, setScreen, showToast, logout }) {
  const [tab, setTab] = useState("cars");

  const suspendCar = (id) => { setCars(prev=>prev.map(c=>c.id===id?{...c,active:!c.active}:c)); showToast("Status atualizado"); };
  const deleteCar = (id) => { setCars(prev=>prev.filter(c=>c.id!==id)); showToast("Anúncio removido"); };

  const stats = [
    { n:cars.length, l:"Carros", e:"🚗" },
    { n:users.filter(u=>u.role==="buyer").length, l:"Compradores", e:"🙋" },
    { n:users.filter(u=>u.role==="seller").length, l:"Vendedores", e:"🤝" },
    { n:matches.length, l:"Matches", e:"❤️" },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div style={S.logoText}>ADMIN</div>
        <div onClick={logout} style={{ color:"#555", fontSize:"0.8rem", cursor:"pointer" }}>Sair</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:"12px 16px", flexShrink:0 }}>
        {stats.map(({n,l,e})=>(
          <div key={l} style={{ background:"#111", borderRadius:12, padding:"14px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:"1.5rem" }}>{e}</div>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", letterSpacing:1, lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:"0.7rem", color:"#555", fontWeight:600 }}>{l}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:4, padding:"0 16px 12px", flexShrink:0 }}>
        {["cars","users","matches"].map(t=>(
          <div key={t} onClick={()=>setTab(t)} style={{ flex:1, textAlign:"center", padding:"8px 4px", borderRadius:8, fontWeight:700, fontSize:"0.78rem", cursor:"pointer", background:tab===t?"#1A1A1A":"transparent", color:tab===t?"#FF6B1A":"#555", border:tab===t?"1px solid rgba(255,107,26,0.2)":"1px solid transparent" }}>
            {t==="cars"?"Carros":t==="users"?"Usuários":"Matches"}
          </div>
        ))}
      </div>

      <div style={S.scrollArea}>
        {tab==="cars" && cars.map(c=>(
          <div key={c.id} style={{ ...S.card({ marginBottom:10, display:"flex", gap:12, alignItems:"center" }) }}>
            <div style={{ fontSize:"1.8rem" }}>{c.emoji}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{c.model} {c.year}</div>
                <div style={{ ...S.tag(c.active?"#00D46A":"#555"), fontSize:"0.65rem" }}>{c.active?"Ativo":"Pausado"}</div>
              </div>
              <div style={{ color:"#888", fontSize:"0.75rem" }}>{fmtBRL(c.price)} · {c.sellerName}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>suspendCar(c.id)} style={{ background:"#1A1A1A", border:"1px solid rgba(255,255,255,0.08)", color:"#aaa", padding:"5px 8px", borderRadius:6, fontSize:"0.7rem", cursor:"pointer" }}>{c.active?"Pausar":"Ativar"}</button>
              <button onClick={()=>deleteCar(c.id)} style={{ background:"rgba(255,45,45,0.1)", border:"1px solid rgba(255,45,45,0.2)", color:"#FF6B6B", padding:"5px 8px", borderRadius:6, fontSize:"0.7rem", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        ))}

        {tab==="users" && users.map(u=>(
          <div key={u.id} style={{ ...S.card({ marginBottom:10, display:"flex", gap:12, alignItems:"center" }) }}>
            <Avatar name={u.name} size={40} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{u.name}</div>
              <div style={{ color:"#888", fontSize:"0.75rem" }}>{u.email}</div>
              <div style={{ color:"#555", fontSize:"0.75rem" }}>{u.phone}</div>
            </div>
            <div style={S.tag(u.role==="admin"?"#A78BFA":u.role==="seller"?"#FF6B1A":"#4A9EFF")}>{u.role}</div>
          </div>
        ))}

        {tab==="matches" && matches.map(m=>(
          <div key={m.id} style={{ ...S.card({ marginBottom:10 }) }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ fontSize:"1.8rem" }}>{m.carEmoji||"🚗"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{m.carModel}</div>
                <div style={{ color:"#888", fontSize:"0.75rem" }}>🙋 {m.buyerName} ↔ 🤝 {m.sellerName}</div>
                <div style={{ color:"#555", fontSize:"0.72rem" }}>{fmtDate(m.createdAt)}</div>
              </div>
              <div style={S.tag("#00D46A")}>❤️</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ───────────────────────────────────────────────────────────────────
function ProfileScreen({ user, setUser, setScreen, logout, showToast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:user.name, phone:user.phone||"", storeName:user.storeName||"" });
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  const save_ = () => {
    setUser({...user,...form});
    setEditing(false);
    showToast("Perfil atualizado!");
  };

  const roleLabel = { buyer:"Comprador", seller:"Vendedor", admin:"Administrador" };
  const roleIcon = { buyer:"🙋", seller:"🤝", admin:"👁️" };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setScreen("home")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:2 }}>MEU PERFIL</div>
        <div style={{ width:48 }} />
      </div>

      <div style={S.scrollArea}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 0 24px" }}>
          <Avatar name={user.name} size={80} />
          <div style={{ fontWeight:700, fontSize:"1.2rem", marginTop:14 }}>{user.name}</div>
          <div style={{ color:"#888", fontSize:"0.85rem", marginTop:4 }}>{user.email}</div>
          <div style={{ ...S.tag("#FF6B1A"), marginTop:10 }}>{roleIcon[user.role]} {roleLabel[user.role]}</div>
          {user.storeName && <div style={{ color:"#555", fontSize:"0.82rem", marginTop:6 }}>🏪 {user.storeName}</div>}
        </div>

        {!editing ? (
          <div style={S.card({ marginBottom:16 })}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontWeight:700 }}>Informações</div>
              <div onClick={()=>setEditing(true)} style={{ color:"#FF6B1A", fontSize:"0.85rem", cursor:"pointer", fontWeight:600 }}>Editar</div>
            </div>
            {[{l:"Nome",v:user.name},{l:"E-mail",v:user.email},{l:"Telefone",v:user.phone||"—"},{l:"Loja",v:user.storeName||"—"}].map(({l,v})=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color:"#555", fontSize:"0.85rem" }}>{l}</span>
                <span style={{ fontSize:"0.85rem" }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0" }}>
              <span style={{ color:"#555", fontSize:"0.85rem" }}>Membro desde</span>
              <span style={{ fontSize:"0.85rem" }}>{fmtDate(user.createdAt)}</span>
            </div>
          </div>
        ) : (
          <div style={S.card({ marginBottom:16 })}>
            <div style={{ fontWeight:700, marginBottom:16 }}>Editar Perfil</div>
            <Input label="Nome" value={form.name} onChange={v=>F("name",v)} placeholder="Seu nome" />
            <Input label="Telefone" value={form.phone} onChange={v=>F("phone",v)} placeholder="(11) 99999-9999" />
            {user.role==="seller" && <Input label="Nome da loja" value={form.storeName} onChange={v=>F("storeName",v)} placeholder="Auto Silva" />}
            <button onClick={save_} style={S.btn("primary")}>Salvar</button>
            <button onClick={()=>setEditing(false)} style={{ ...S.btn("ghost"), marginTop:8 }}>Cancelar</button>
          </div>
        )}

        <div style={S.card({ marginBottom:12 })}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Legal</div>
          <div onClick={()=>setScreen("terms")} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}>
            <span style={{ fontSize:"0.88rem" }}>📄 Termos de Uso</span>
            <span style={{ color:"#555" }}>→</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", cursor:"pointer" }}>
            <span style={{ fontSize:"0.88rem" }}>🔒 Política de Privacidade</span>
            <span style={{ color:"#555" }}>→</span>
          </div>
        </div>

        <button onClick={logout} style={{ ...S.btn("ghost"), marginBottom:8, color:"#FF6B6B", borderColor:"rgba(255,45,45,0.2)" }}>Sair da Conta</button>

        <div style={{ textAlign:"center", color:"#333", fontSize:"0.75rem", marginTop:8 }}>
          AutoLink v1.0 · MVP · São Paulo, Brasil
        </div>
      </div>
    </div>
  );
}

// ─── TERMS ─────────────────────────────────────────────────────────────────────
function TermsScreen({ setScreen }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setScreen("home")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:2 }}>TERMOS DE USO</div>
        <div style={{ width:48 }} />
      </div>
      <div style={{ ...S.scrollArea, paddingTop:24 }}>
        {[
          { title:"1. Sobre a AutoLink", text:"A AutoLink é uma plataforma de intermediação para compra e venda de veículos em São Paulo, Brasil. Não somos vendedores, concessionárias ou intermediários financeiros." },
          { title:"2. Cadastro", text:"Para usar a plataforma, você deve ter ao menos 18 anos, fornecer informações verdadeiras e manter seus dados atualizados. Cada usuário pode ter apenas uma conta." },
          { title:"3. Anúncios", text:"Vendedores são responsáveis pela veracidade das informações publicadas. Anúncios falsos, enganosos ou ilegais serão removidos e o usuário poderá ser banido." },
          { title:"4. Matches e Contato", text:"Quando um match é realizado, ambas as partes recebem a possibilidade de iniciar uma conversa. A AutoLink não é responsável pelo resultado das negociações." },
          { title:"5. Pagamentos", text:"A AutoLink cobra uma comissão sobre negócios concluídos. Lojas e concessionárias pagam uma assinatura mensal para manter anúncios ativos. Detalhes na página de planos." },
          { title:"6. Privacidade", text:"Seus dados são protegidos conforme a LGPD (Lei Geral de Proteção de Dados). Não vendemos seus dados a terceiros. Usamos suas informações apenas para melhorar a experiência na plataforma." },
          { title:"7. Limitação de Responsabilidade", text:"A AutoLink não garante a qualidade dos veículos anunciados. Recomendamos que compradores realizem vistoria presencial antes de fechar qualquer negócio." },
          { title:"8. Alterações", text:"Estes termos podem ser atualizados. Usuários serão notificados sobre mudanças significativas. O uso continuado da plataforma implica na aceitação dos novos termos." },
          { title:"9. Contato", text:"Em caso de dúvidas, problemas ou denúncias, entre em contato pelo e-mail oi@autolink.com.br ou pelo formulário em nosso site." },
        ].map(({title,text})=>(
          <div key={title} style={{ marginBottom:24 }}>
            <div style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:8, color:"#FF6B1A" }}>{title}</div>
            <div style={{ fontSize:"0.85rem", color:"#888", lineHeight:1.7 }}>{text}</div>
          </div>
        ))}
        <div style={{ marginTop:16, padding:16, background:"#111", borderRadius:10, fontSize:"0.78rem", color:"#555", textAlign:"center" }}>
          Última atualização: Janeiro de 2026<br/>AutoLink · São Paulo, Brasil · CNPJ 00.000.000/0001-00
        </div>
      </div>
    </div>
  );
}

// ─── ANALYSTS DATA ─────────────────────────────────────────────────────────────
const ANALYSTS = [
  { id:"an1", name:"Carlos Mendes", cpf:"123.456.789-01", specialty:"Carros usados & avaliação de preço", experience:"8 anos", rating:4.9, reviews:312, whatsapp:"5511991110001", email:"carlos@autolink.com.br", avatar:"CM", bio:"Especialista em avaliação de veículos seminovos e usados. Ajuda compradores a identificar o preço justo e evitar armadilhas comuns no mercado.", available:true },
  { id:"an2", name:"Fernanda Castro", cpf:"234.567.890-12", specialty:"SUVs, importados & documentação", experience:"6 anos", rating:4.8, reviews:198, whatsapp:"5511991110002", email:"fernanda@autolink.com.br", avatar:"FC", bio:"Especialista em SUVs e carros importados. Conhece a fundo as regras de documentação e transferência de veículos no Brasil.", available:true },
  { id:"an3", name:"Rafael Oliveira", cpf:"345.678.901-23", specialty:"Carros populares & financiamento", experience:"10 anos", rating:5.0, reviews:487, whatsapp:"5511991110003", email:"rafael@autolink.com.br", avatar:"RO", bio:"O mais experiente da equipe. Especialista em carros populares e opções de financiamento. Ajuda compradores a encontrar o melhor custo-benefício.", available:false },
  { id:"an4", name:"Juliana Neves", cpf:"456.789.012-34", specialty:"Elétricos, híbridos & tecnologia", experience:"4 anos", rating:4.7, reviews:124, whatsapp:"5511991110004", email:"juliana@autolink.com.br", avatar:"JN", bio:"Especialista no crescente mercado de veículos elétricos e híbridos. Ideal para quem quer migrar para mobilidade sustentável.", available:true },
];

// ─── ANALYST CHAT BOX ──────────────────────────────────────────────────────────
function AnalystChatBox({ analyst, onClose }) {
  const [msgs, setMsgs] = useState([
    { from:"analyst", text:`Olá! Sou ${analyst.name.split(" ")[0]}, especialista em ${analyst.specialty}. Como posso te ajudar hoje? 😊`, time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const quickReplies = ["O preço está justo?","Como verificar o histórico?","Quais documentos preciso?","Vale a pena comprar?"];

  const sendMsg = async (text) => {
    if (!text.trim()) return;
    const apiKey = getApiKey();
    const userMsg = { from:"user", text, time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) };
    setMsgs(p=>[...p, userMsg]);
    setInput("");
    setTyping(true);

    if (!apiKey) {
      setTimeout(()=>{
        setMsgs(p=>[...p, { from:"analyst", text:"⚠️ API key não configurada. Peça ao administrador para adicionar VITE_ANTHROPIC_KEY nas variáveis de ambiente do Vercel.", time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) }]);
        setTyping(false);
      }, 600);
      return;
    }

    // AI-powered analyst response via Claude API
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "x-api-key": apiKey, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Você é ${analyst.name}, analista automotivo especializado em ${analyst.specialty} com ${analyst.experience} de experiência. Você trabalha para a AutoLink, marketplace de carros de São Paulo. Responda de forma amigável, direta e útil em português brasileiro. Seja conciso (máx 3 frases). Use emojis ocasionalmente. Foque em ajudar o usuário a tomar boas decisões na compra de carros.`,
          messages:[...msgs.map(m=>({ role: m.from==="user"?"user":"assistant", content: m.text })), { role:"user", content: text }]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Desculpe, tente novamente em instantes.";
      setMsgs(p=>[...p, { from:"analyst", text:reply, time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) }]);
    } catch {
      setMsgs(p=>[...p, { from:"analyst", text:"Desculpe, estou com instabilidade no momento. Tente me contatar pelo WhatsApp!", time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) }]);
    }
    setTyping(false);
  };

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, typing]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ background:"#111", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.9rem", color:"white" }}>{analyst.avatar}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:"0.95rem" }}>{analyst.name}</div>
          <div style={{ fontSize:"0.75rem", color:"#00D46A" }}>● Online agora</div>
        </div>
        <div onClick={onClose} style={{ color:"#888", cursor:"pointer", fontSize:"1.3rem", padding:4 }}>✕</div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent: m.from==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"80%", background: m.from==="user"?"linear-gradient(135deg,#FF2D2D,#FF6B1A)":"#1A1A1A", color:"white", padding:"10px 14px", borderRadius: m.from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", fontSize:"0.88rem", lineHeight:1.5 }}>
              {m.text}
              <div style={{ fontSize:"0.68rem", opacity:0.6, marginTop:4, textAlign: m.from==="user"?"right":"left" }}>{m.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ background:"#1A1A1A", padding:"10px 16px", borderRadius:"16px 16px 16px 4px", fontSize:"0.88rem", color:"#888" }}>digitando...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{ padding:"8px 16px", display:"flex", gap:8, overflowX:"auto" }}>
        {quickReplies.map(q=>(
          <div key={q} onClick={()=>sendMsg(q)} style={{ background:"#1A1A1A", border:"1px solid rgba(255,107,26,0.3)", color:"#FF6B1A", padding:"6px 12px", borderRadius:100, fontSize:"0.75rem", whiteSpace:"nowrap", cursor:"pointer", fontWeight:600 }}>{q}</div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", gap:10, background:"#0A0A0A" }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg(input)} placeholder="Pergunta para o analista..." style={{ ...S.input, marginBottom:0, flex:1 }} />
        <button onClick={()=>sendMsg(input)} style={{ background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", border:"none", color:"white", width:44, height:44, borderRadius:10, cursor:"pointer", fontSize:"1.1rem", flexShrink:0 }}>↑</button>
      </div>
    </div>
  );
}

// ─── ANALYSTS SCREEN ────────────────────────────────────────────────────────────
function AnalystsScreen({ setScreen }) {
  const [activeChat, setActiveChat] = useState(null);
  const [supportChat, setSupportChat] = useState(false);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setScreen("home")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:2 }}>SEUS ANALISTAS</div>
        <div style={{ width:48 }} />
      </div>

      <div style={S.scrollArea}>
        {/* Header card */}
        <div style={{ background:"linear-gradient(135deg,rgba(255,45,45,0.1),rgba(255,107,26,0.05))", border:"1px solid rgba(255,107,26,0.2)", borderRadius:16, padding:20, marginBottom:20, marginTop:16 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:1, marginBottom:8 }}>🎯 COMPRE COM SEGURANÇA</div>
          <div style={{ fontSize:"0.85rem", color:"#aaa", lineHeight:1.6 }}>Escolha um analista especializado para te acompanhar durante toda a compra. Tire dúvidas, avalie preços e negocie com confiança.</div>
        </div>

        {/* Support chat button */}
        <div onClick={()=>setSupportChat(true)} style={{ ...S.card({ marginBottom:20, cursor:"pointer", display:"flex", alignItems:"center", gap:14 }), background:"rgba(0,212,106,0.05)", border:"1px solid rgba(0,212,106,0.2)" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(0,212,106,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem" }}>💬</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:"0.95rem", color:"#00D46A" }}>Chat de Suporte Geral</div>
            <div style={{ fontSize:"0.8rem", color:"#888", marginTop:2 }}>Dúvidas rápidas? Fale com nossa equipe agora</div>
          </div>
          <div style={{ color:"#00D46A", fontSize:"0.8rem" }}>● Online</div>
        </div>

        <div style={{ ...S.sectionTitle, fontSize:"1rem", color:"#888", marginBottom:16 }}>ESCOLHA SEU ANALISTA</div>

        {ANALYSTS.map(an=>(
          <div key={an.id} style={S.card({ marginBottom:16 })}>
            <div style={{ display:"flex", gap:14, marginBottom:14 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"1.1rem", color:"white", flexShrink:0 }}>{an.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ fontWeight:700, fontSize:"0.95rem" }}>{an.name}</div>
                  <div style={{ ...S.tag(an.available?"#00D46A":"#555"), fontSize:"0.65rem" }}>{an.available?"● Disponível":"● Ocupado"}</div>
                </div>
                <div style={{ fontSize:"0.78rem", color:"#FF6B1A", marginTop:2, fontWeight:600 }}>{an.specialty}</div>
                <div style={{ display:"flex", gap:8, marginTop:4, alignItems:"center" }}>
                  <span style={{ fontSize:"0.78rem", color:"#aaa" }}>⭐ {an.rating}</span>
                  <span style={{ fontSize:"0.72rem", color:"#555" }}>({an.reviews} avaliações)</span>
                  <span style={{ fontSize:"0.72rem", color:"#555" }}>· {an.experience}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize:"0.8rem", color:"#888", lineHeight:1.6, marginBottom:12 }}>{an.bio}</div>

            <div style={{ background:"#0A0A0A", borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
              <div style={{ fontSize:"0.72rem", color:"#555", marginBottom:4 }}>CPF: {an.cpf}</div>
              <div style={{ fontSize:"0.72rem", color:"#555" }}>✉️ {an.email}</div>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>window.open(`https://wa.me/${an.whatsapp}`,"_blank")} style={{ flex:1, background:"rgba(0,212,106,0.1)", border:"1px solid rgba(0,212,106,0.3)", color:"#00D46A", padding:"10px", borderRadius:8, fontSize:"0.8rem", fontWeight:700, cursor:"pointer" }}>📱 WhatsApp</button>
              <button onClick={()=>setActiveChat(an)} style={{ flex:1, background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", border:"none", color:"white", padding:"10px", borderRadius:8, fontSize:"0.8rem", fontWeight:700, cursor:"pointer" }}>💬 Chat no App</button>
            </div>
          </div>
        ))}
      </div>

      {activeChat && <AnalystChatBox analyst={activeChat} onClose={()=>setActiveChat(null)} />}
      {supportChat && <AnalystChatBox analyst={{ id:"support", name:"Suporte AutoLink", specialty:"dúvidas gerais sobre compra e venda de carros", avatar:"AL", whatsapp:"5511991110000", email:"oi@autolink.com.br" }} onClose={()=>setSupportChat(false)} />}
    </div>
  );
}

// ─── EDUCATION SCREEN ───────────────────────────────────────────────────────────
const EDU_ARTICLES = [
  { id:"e1", icon:"🔍", title:"O que observar ao comprar um carro usado", category:"Compra", time:"5 min", content:[
    { heading:"Verifique a carroceria", text:"Procure por amassados, riscos, diferenças na pintura e gaps irregulares entre as peças. Isso pode indicar batidas ou reparos mal feitos." },
    { heading:"Teste o motor em frio", text:"Peça para ver o carro com o motor frio. Um motor que 'fuma' ao ligar, faz barulhos estranhos ou demora para pegar pode ter problemas sérios." },
    { heading:"Verifique os pneus", text:"Pneus gastos irregularmente indicam problemas no alinhamento ou na suspensão. Troca de 4 pneus pode custar R$1.500 a R$3.000." },
    { heading:"Faça um test-drive", text:"Teste em diferentes velocidades. Preste atenção em vibrações, ruídos, se o carro puxa para um lado e se os freios respondem bem." },
    { heading:"Cheque a documentação", text:"Verifique se o IPVA está pago, se há multas, se o carro não está alienado ou com financiamento em aberto. Use o site do Detran-SP." },
  ]},
  { id:"e2", icon:"💰", title:"Como saber se o preço está justo", category:"Preço", time:"4 min", content:[
    { heading:"Use a tabela FIPE", text:"A Tabela FIPE é a referência oficial para preços de veículos no Brasil. Acesse fipe.org.br e pesquise o modelo para ver o valor de mercado." },
    { heading:"Compare com o mercado", text:"Pesquise em sites como OLX, Webmotors e Mercado Livre. Se o preço estiver muito abaixo da média, pode ser sinal de problema." },
    { heading:"Considere o estado do veículo", text:"Um carro revisado, com histórico de manutenção e único dono pode valer até 15% mais que a FIPE. Mau estado justifica desconto." },
    { heading:"Considere os custos futuros", text:"Calcule quanto vai gastar em manutenção, IPVA, seguro e possíveis reparos. Um carro mais barato pode sair mais caro no longo prazo." },
  ]},
  { id:"e3", icon:"⚠️", title:"Problemas comuns a verificar", category:"Atenção", time:"6 min", content:[
    { heading:"Verifique o óleo do motor", text:"Óleo com cor de café com leite (misturado com água) indica problema na junta do cabeçote — reparo caro, entre R$2.000 e R$6.000." },
    { heading:"Cheque o histórico de batidas", text:"Use o serviço de laudo veicular. Por R$50-150 você descobre se o carro já foi batido, roubado ou tem restrições." },
    { heading:"Teste o ar-condicionado", text:"Conserto de A/C pode custar R$800 a R$3.000. Teste se esfria bem e se não há barulho ao ligar." },
    { heading:"Observe a suspensão", text:"Passe por lombadas devagar. Barulhos de 'baque' ou 'rangido' indicam amortecedores ou buchas desgastados." },
    { heading:"Verifique os freios", text:"Teste numa frenagem firme. O carro não deve puxar para nenhum lado. Barulho de metal indica pastilhas gastas." },
  ]},
  { id:"e4", icon:"📋", title:"Documentação e transferência no Brasil", category:"Burocracia", time:"5 min", content:[
    { heading:"Documentos necessários", text:"Comprador: RG, CPF e comprovante de residência. Vendedor: documento do veículo (CRLV), RG e CPF." },
    { heading:"O que verificar antes de comprar", text:"Verifique no site do Detran-SP: IPVA em dia, multas, se o carro está em débito, alienado ou com restrição judicial." },
    { heading:"Como fazer a transferência", text:"Assine o DUT (Documento Único de Transferência) no campo do comprador. O comprador tem 30 dias para transferir no Detran." },
    { heading:"Custos da transferência", text:"A transferência custa em média R$300-500 em São Paulo, incluindo taxa do Detran e o laudo do despachante." },
    { heading:"Cuidado com a venda informal", text:"Nunca compre um carro 'no papel'. Sem a transferência, multas e impostos do novo proprietário vêm no CPF do antigo dono." },
  ]},
  { id:"e5", icon:"🔧", title:"Noções básicas de manutenção", category:"Manutenção", time:"4 min", content:[
    { heading:"Troca de óleo", text:"A cada 5.000 a 10.000 km (depende do motor). Custo: R$150-400. Negligenciar é a causa número 1 de motores queimados." },
    { heading:"Revisão de freios", text:"A cada 20.000 km ou quando ouvir barulho. Pastilhas custam R$100-300 o jogo. Disco R$200-500 por par." },
    { heading:"Pneus e alinhamento", text:"Calibre os pneus mensalmente. Faça alinhamento e balanceamento a cada 10.000 km (R$80-150). Pneus duram mais e o carro anda melhor." },
    { heading:"Filtros", text:"Filtro de ar (R$30-80) e filtro de combustível (R$40-100) devem ser trocados a cada 15.000-30.000 km. Simples e baratos, fazem grande diferença." },
    { heading:"Revisão preventiva", text:"Uma vez por ano faça uma revisão completa. Custa R$300-800 mas pode prevenir problemas de R$3.000+." },
  ]},
];

function EducationScreen({ setScreen }) {
  const [activeArticle, setActiveArticle] = useState(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const categories = ["Todos", "Compra", "Preço", "Atenção", "Burocracia", "Manutenção"];
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = activeCategory === "Todos" ? EDU_ARTICLES : EDU_ARTICLES.filter(a=>a.category===activeCategory);

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    const apiKey = getApiKey();
    setAiLoading(true);
    setAiAnswer("");
    if (!apiKey) {
      setTimeout(()=>{ setAiAnswer("⚠️ API key não configurada. Configure VITE_ANTHROPIC_KEY no Vercel para ativar esta função."); setAiLoading(false); }, 400);
      return;
    }
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "x-api-key": apiKey, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:"Você é um especialista em carros brasileiro. Responda perguntas sobre compra, venda, manutenção e documentação de veículos de forma clara, direta e amigável para iniciantes. Use linguagem simples, exemplos práticos e mencione valores em R$ quando relevante. Máximo 4 parágrafos curtos.",
          messages:[{ role:"user", content: aiQuestion }]
        })
      });
      const data = await response.json();
      setAiAnswer(data.content?.[0]?.text || "Não consegui responder. Tente de novo!");
    } catch {
      setAiAnswer("Erro de conexão. Tente novamente.");
    }
    setAiLoading(false);
  };

  if (activeArticle) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setActiveArticle(null)} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", letterSpacing:1 }}>{activeArticle.icon} {activeArticle.category.toUpperCase()}</div>
        <div style={{ width:48 }} />
      </div>
      <div style={S.scrollArea}>
        <div style={{ paddingTop:20 }}>
          <div style={{ ...S.tag(categoryColor(activeArticle.category)), marginBottom:12 }}>{activeArticle.category} · {activeArticle.time} de leitura</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:1, lineHeight:1.2, marginBottom:24 }}>{activeArticle.title}</div>
          {activeArticle.content.map((section,i)=>(
            <div key={i} style={{ marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:"0.95rem", color:"#FF6B1A", marginBottom:8 }}>{section.heading}</div>
              <div style={{ fontSize:"0.88rem", color:"#aaa", lineHeight:1.7 }}>{section.text}</div>
            </div>
          ))}
          <div style={{ marginTop:24, padding:16, background:"rgba(255,107,26,0.06)", border:"1px solid rgba(255,107,26,0.15)", borderRadius:12, fontSize:"0.82rem", color:"#888", lineHeight:1.6 }}>
            💡 <strong style={{ color:"#FF6B1A" }}>Dúvida?</strong> Converse com um dos nossos analistas especializados para uma orientação personalizada.
          </div>
          <button onClick={()=>setScreen("analysts")} style={{ ...S.btn("primary"), marginTop:16 }}>Falar com Analista</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setScreen("home")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:2 }}>GUIA DO COMPRADOR</div>
        <div style={{ width:48 }} />
      </div>

      <div style={S.scrollArea}>
        {/* AI Ask box */}
        <div style={{ marginTop:16, marginBottom:20, background:"linear-gradient(135deg,rgba(255,45,45,0.08),rgba(255,107,26,0.04))", border:"1px solid rgba(255,107,26,0.2)", borderRadius:16, padding:16 }}>
          <div style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:8 }}>🤖 Pergunte ao nosso especialista IA</div>
          <div style={{ fontSize:"0.8rem", color:"#888", marginBottom:12 }}>Tire qualquer dúvida sobre compra de carros</div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI()} placeholder="Ex: Como sei se o motor está bom?" style={{ ...S.input, marginBottom:0, flex:1, fontSize:"0.85rem" }} />
            <button onClick={askAI} style={{ background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", border:"none", color:"white", width:44, height:44, borderRadius:8, cursor:"pointer", flexShrink:0 }}>↑</button>
          </div>
          {aiLoading && <div style={{ marginTop:10, color:"#888", fontSize:"0.82rem" }}>Consultando especialista...</div>}
          {aiAnswer && (
            <div style={{ marginTop:12, background:"#111", borderRadius:10, padding:14, fontSize:"0.84rem", color:"#ccc", lineHeight:1.7, borderLeft:"3px solid #FF6B1A" }}>{aiAnswer}</div>
          )}
        </div>

        {/* Categories */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:20, paddingBottom:4 }}>
          {categories.map(c=>(
            <div key={c} onClick={()=>setActiveCategory(c)} style={{ background: activeCategory===c?"rgba(255,107,26,0.15)":"#1A1A1A", border:`1.5px solid ${activeCategory===c?"#FF6B1A":"rgba(255,255,255,0.07)"}`, color: activeCategory===c?"#FF6B1A":"#888", padding:"7px 14px", borderRadius:100, fontSize:"0.78rem", fontWeight:700, whiteSpace:"nowrap", cursor:"pointer" }}>{c}</div>
          ))}
        </div>

        {/* Articles */}
        {filtered.map(article=>(
          <div key={article.id} onClick={()=>setActiveArticle(article)} style={{ ...S.card({ marginBottom:12, cursor:"pointer", display:"flex", gap:14, alignItems:"center" }) }}>
            <div style={{ fontSize:"2rem", flexShrink:0 }}>{article.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:4 }}>{article.title}</div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ ...S.tag(categoryColor(article.category)), fontSize:"0.65rem" }}>{article.category}</div>
                <span style={{ fontSize:"0.75rem", color:"#555" }}>⏱ {article.time}</span>
              </div>
            </div>
            <div style={{ color:"#555" }}>→</div>
          </div>
        ))}

        <div style={{ marginTop:8, padding:16, background:"#111", borderRadius:12, textAlign:"center" }}>
          <div style={{ fontSize:"0.85rem", color:"#888", marginBottom:12 }}>Precisa de ajuda personalizada?</div>
          <button onClick={()=>setScreen("analysts")} style={{ ...S.btn("primary"), width:"auto", padding:"10px 24px" }}>Falar com Analista 🎯</button>
        </div>
      </div>
    </div>
  );
}

function categoryColor(cat) {
  const colors = { Compra:"#4A9EFF", Preço:"#00D46A", Atenção:"#FF6B6B", Burocracia:"#A855F7", Manutenção:"#FF6B1A" };
  return colors[cat] || "#FF6B1A";
}

// ─── MAP SCREEN ─────────────────────────────────────────────────────────────────
function MapScreen({ cars, setScreen }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [distFilter, setDistFilter] = useState(50);
  const [loading, setLoading] = useState(true);

  // São Paulo neighborhood coords for seed cars
  const carCoords = {
    c1: { lat:-23.5614, lng:-46.6560 }, // Pinheiros
    c2: { lat:-23.5489, lng:-46.6388 }, // Vila Madalena
    c3: { lat:-23.5878, lng:-46.6576 }, // Moema
    c4: { lat:-23.5629, lng:-46.6544 }, // Itaim Bibi
    c5: { lat:-23.5205, lng:-46.6333 }, // Santana
    c6: { lat:-23.5962, lng:-46.6842 }, // Santo André
  };

  useEffect(()=>{
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos=>{ setUserLocation({ lat:pos.coords.latitude, lng:pos.coords.longitude }); setLoading(false); },
        ()=>{ setUserLocation({ lat:-23.5505, lng:-46.6333 }); setLocationError(true); setLoading(false); },
        { timeout:5000 }
      );
    } else {
      setUserLocation({ lat:-23.5505, lng:-46.6333 }); setLoading(false);
    }
  },[]);

  const getDistance = (lat1,lng1,lat2,lng2) => {
    const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  };

  const activeCars = cars.filter(c=>c.active);
  const carsWithDist = activeCars.map(c=>{
    const coords = carCoords[c.id] || { lat:-23.5505+((Math.random()-0.5)*0.1), lng:-46.6333+((Math.random()-0.5)*0.1) };
    const dist = userLocation ? getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng) : 0;
    return { ...c, coords, dist };
  }).filter(c=>c.dist<=distFilter).sort((a,b)=>a.dist-b.dist);

  // Build Google Maps embed URL with markers
  const buildMapUrl = () => {
    if (!userLocation) return "";
    const base = `https://www.google.com/maps/embed/v1/search?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFmBWY&q=carros+à+venda+São+Paulo&center=${userLocation.lat},${userLocation.lng}&zoom=12`;
    return base;
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={S.topBar}>
        <div onClick={()=>setScreen("home")} style={{ cursor:"pointer", color:"#888", fontSize:"0.85rem" }}>← Voltar</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:2 }}>CARROS PRÓXIMOS</div>
        <div style={{ width:48 }} />
      </div>

      {/* Distance filter */}
      <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:"0.78rem", color:"#888", whiteSpace:"nowrap" }}>Raio:</span>
          {[5,10,20,50].map(d=>(
            <div key={d} onClick={()=>setDistFilter(d)} style={{ background: distFilter===d?"rgba(255,107,26,0.15)":"#1A1A1A", border:`1.5px solid ${distFilter===d?"#FF6B1A":"rgba(255,255,255,0.07)"}`, color: distFilter===d?"#FF6B1A":"#888", padding:"5px 12px", borderRadius:100, fontSize:"0.75rem", fontWeight:700, cursor:"pointer" }}>{d} km</div>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#555" }}>
          <div style={{ fontSize:"2rem" }}>📍</div>
          <div style={{ fontSize:"0.85rem" }}>Obtendo sua localização...</div>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Visual map simulation */}
          <div style={{ height:220, background:"#0F1923", position:"relative", overflow:"hidden", flexShrink:0 }}>
            {/* Grid lines */}
            {[...Array(8)].map((_,i)=>(
              <div key={i} style={{ position:"absolute", left:0, right:0, top:`${i*14}%`, height:1, background:"rgba(255,255,255,0.04)" }} />
            ))}
            {[...Array(8)].map((_,i)=>(
              <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${i*14}%`, width:1, background:"rgba(255,255,255,0.04)" }} />
            ))}

            {/* Roads simulation */}
            <div style={{ position:"absolute", top:"45%", left:0, right:0, height:3, background:"rgba(255,255,255,0.08)" }} />
            <div style={{ position:"absolute", top:0, bottom:0, left:"40%", width:3, background:"rgba(255,255,255,0.08)" }} />
            <div style={{ position:"absolute", top:"70%", left:0, right:0, height:2, background:"rgba(255,255,255,0.05)", transform:"rotate(-5deg)" }} />

            {/* User location */}
            <div style={{ position:"absolute", top:"50%", left:"45%", transform:"translate(-50%,-50%)", zIndex:10 }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:"#4A9EFF", border:"3px solid white", boxShadow:"0 0 0 6px rgba(74,158,255,0.2)" }} />
            </div>

            {/* Car markers */}
            {carsWithDist.map((c,i)=>{
              const positions = [{top:"25%",left:"60%"},{top:"65%",left:"25%"},{top:"30%",left:"25%"},{top:"70%",left:"65%"},{top:"20%",left:"75%"},{top:"75%",left:"80%"}];
              const pos = positions[i % positions.length];
              return (
                <div key={c.id} onClick={()=>setSelectedCar(c)} style={{ position:"absolute", ...pos, transform:"translate(-50%,-50%)", zIndex:5, cursor:"pointer" }}>
                  <div style={{ background: selectedCar?.id===c.id?"#FF6B1A":"#FF2D2D", color:"white", padding:"3px 8px", borderRadius:100, fontSize:"0.65rem", fontWeight:700, whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(0,0,0,0.5)", border: selectedCar?.id===c.id?"2px solid white":"2px solid transparent" }}>
                    {c.emoji} {fmtBRL(c.price).replace("R$ ","")}
                  </div>
                </div>
              );
            })}

            {/* Map legend */}
            <div style={{ position:"absolute", bottom:8, left:8, fontSize:"0.7rem", color:"#555", background:"rgba(0,0,0,0.7)", padding:"4px 8px", borderRadius:6 }}>
              📍 Você &nbsp; 🔴 Carros
            </div>
            {locationError && <div style={{ position:"absolute", top:8, right:8, background:"rgba(255,107,26,0.9)", color:"white", fontSize:"0.7rem", padding:"4px 8px", borderRadius:6 }}>📍 Usando São Paulo</div>}
          </div>

          {/* Selected car detail */}
          {selectedCar && (
            <div onClick={()=>setScreen("home")} style={{ background:"linear-gradient(135deg,rgba(255,45,45,0.1),rgba(255,107,26,0.05))", border:"1px solid rgba(255,107,26,0.2)", margin:"12px 16px 0", borderRadius:12, padding:14, cursor:"pointer", display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ fontSize:"2rem" }}>{selectedCar.photo ? <img src={selectedCar.photo} alt="" style={{ width:48, height:48, borderRadius:8, objectFit:"cover" }} /> : selectedCar.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{selectedCar.model} {selectedCar.year}</div>
                <div style={{ fontSize:"0.78rem", color:"#888" }}>{fmtBRL(selectedCar.price)} · {selectedCar.dist.toFixed(1)} km de você</div>
              </div>
              <div style={{ color:"#FF6B1A", fontSize:"0.8rem", fontWeight:700 }}>Ver →</div>
            </div>
          )}

          {/* Cars list */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
            <div style={{ fontSize:"0.78rem", color:"#555", marginBottom:12 }}>{carsWithDist.length} carros em até {distFilter} km de você</div>
            {carsWithDist.length === 0 ? (
              <div style={{ textAlign:"center", color:"#555", paddingTop:32 }}>
                <div style={{ fontSize:"3rem", marginBottom:12 }}>🗺️</div>
                <div>Nenhum carro nesse raio. Aumente o filtro de distância!</div>
              </div>
            ) : (
              carsWithDist.map(c=>(
                <div key={c.id} onClick={()=>setSelectedCar(selectedCar?.id===c.id?null:c)} style={{ ...S.card({ marginBottom:10, cursor:"pointer", display:"flex", gap:12, alignItems:"center" }), border: selectedCar?.id===c.id?"1px solid rgba(255,107,26,0.4)":"1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ width:48, height:48, borderRadius:10, overflow:"hidden", background:"#1A1A1A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>
                    {c.photo ? <img src={c.photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : c.emoji}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{c.model} {c.year}</div>
                    <div style={{ fontSize:"0.78rem", color:"#888" }}>{fmtBRL(c.price)} · {fmtKm(c.km)}</div>
                    <div style={{ fontSize:"0.72rem", color:"#FF6B1A", marginTop:2 }}>📍 {c.dist.toFixed(1)} km · {c.city}</div>
                  </div>
                  <div style={{ ...S.tag(c.dist<5?"#00D46A":c.dist<20?"#FF6B1A":"#555"), fontSize:"0.65rem" }}>{c.dist.toFixed(1)} km</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [chats, setChats] = useState({});
  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeChatMatchId, setActiveChatMatchId] = useState(null);
  const [lang, setLang] = useState("pt");
  const t = k => TRANSLATIONS[lang]?.[k] || TRANSLATIONS.pt[k] || k;

  useEffect(() => {
    (async () => {
      const [sc, su, sm, sch, suser] = await Promise.all([
        load("al_cars"), load("al_users"), load("al_matches"), load("al_chats"), load("al_current_user")
      ]);
      setCars(sc?.length ? sc : SEED_CARS);
      setUsers(su?.length ? su : SEED_USERS);
      setMatches(sm || []);
      setChats(sch || {});
      if (suser?.id) { setUser(suser); setScreen("home"); }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) save("al_cars", cars); }, [cars, loaded]);
  useEffect(() => { if (loaded) save("al_users", users); }, [users, loaded]);
  useEffect(() => { if (loaded) save("al_matches", matches); }, [matches, loaded]);
  useEffect(() => { if (loaded) save("al_chats", chats); }, [chats, loaded]);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2800);
  };

  const handleSetUser = (u) => { setUser(u); save("al_current_user", u); };

  const logout = () => { setUser(null); save("al_current_user", null); setScreen("auth"); showToast("Até logo! 👋"); };

  const handleScreen = (s) => {
    if (s.startsWith("chat_")) { setActiveChatMatchId(s.replace("chat_","")); setScreen("chat"); }
    else setScreen(s);
  };

  if (!loaded) return (
    <div style={{ ...S.app, alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"3rem", letterSpacing:3, background:"linear-gradient(135deg,#FF2D2D,#FF6B1A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AUTOLINK</div>
      <div style={{ color:"#333", fontSize:"0.8rem", marginTop:8 }}>carregando...</div>
    </div>
  );

  const commonProps = { user, setUser:handleSetUser, cars, setCars, users, setUsers, matches, setMatches, chats, setChats, showToast, setScreen:handleScreen, logout, t, lang };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {screen==="splash" && <SplashScreen onStart={()=>setScreen("auth")} />}
      {screen==="auth" && <AuthScreen {...commonProps} onSuccess={()=>setScreen("home")} />}
      {screen==="home" && user?.role==="buyer" && <BuyerHome {...commonProps} />}
      {screen==="home" && user?.role==="seller" && <SellerHome {...commonProps} />}
      {screen==="home" && user?.role==="admin" && <AdminScreen {...commonProps} />}
      {screen==="matches" && <MatchesScreen {...commonProps} onOpenChat={m=>setActiveChatMatchId(m.id)} />}
      {screen==="chat" && <ChatScreen {...commonProps} matchId={activeChatMatchId} />}
      {screen==="upload" && <UploadScreen {...commonProps} />}
      {screen==="terms" && <TermsScreen setScreen={handleScreen} t={t} />}
      {screen==="profile" && <ProfileScreen {...commonProps} />}
      {screen==="analysts" && <AnalystsScreen setScreen={handleScreen} t={t} />}
      {screen==="education" && <EducationScreen setScreen={handleScreen} t={t} />}
      {screen==="map" && <MapScreen cars={cars} setScreen={handleScreen} t={t} />}
    </div>
    </LangContext.Provider>
  );
}
