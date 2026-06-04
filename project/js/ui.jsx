/* Sedra — shared UI primitives */
const { useState, useEffect, useRef, useCallback } = React;
const { STRINGS, TAGS } = window.SEDRA;

// ---- helpers ----
const t = (obj, lang) => (obj && (obj[lang] ?? obj.en)) || "";
const fmtPrice = (n) => Number(n || 0).toFixed(2);
const arDigits = (str) =>
  String(str).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const localizeNum = (str, lang) => (lang === "ar" ? arDigits(str) : String(str));

// downscale an uploaded image to keep localStorage small, return dataURL (jpeg)
function fileToThumb(file, max = 460, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        const scale = Math.min(1, max / Math.max(w, h));
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- icons (simple shapes only) ----
const Icon = ({ name, size = 18, stroke = 1.6 }) => {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
  };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></>,
    close: <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
    up: <polyline points="6 14 12 8 18 14" />,
    down: <polyline points="6 10 12 16 18 10" />,
    gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 .3 1.9z" /></>,
    lock: <><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    chevron: <polyline points="9 6 15 12 9 18" />,
  };
  return <svg {...p}>{paths[name]}</svg>;
};

// ---- Sedra logo mark (simple composed shapes — abstract lote tree) ----
const LogoMark = ({ size = 46, logo = null }) => {
  if (logo) {
    return <div className="mark" style={{ width: size, height: size }}><img src={logo} alt="" /></div>;
  }
  return (
    <div className="mark" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="22" cy="24" r="11" fill="#2d6a4f" opacity=".95" />
        <circle cx="38" cy="22" r="12.5" fill="#40916C" opacity=".92" />
        <circle cx="33" cy="32" r="11" fill="#1B4332" opacity=".95" />
        <circle cx="44" cy="33" r="8" fill="#40916C" opacity=".85" />
        <circle cx="20" cy="33" r="7.5" fill="#2d6a4f" opacity=".9" />
        <line x1="32" y1="34" x2="32" y2="52" stroke="#C5A253" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="32" y1="44" x2="26" y2="39" stroke="#C5A253" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="32" y1="46" x2="39" y2="41" stroke="#C5A253" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// ---- thumbnail with placeholder ----
const Thumb = ({ photo, size = 58 }) => (
  <div className="thumb" style={size !== 58 ? { width: size, height: size } : null}>
    {photo ? (
      <img src={photo} alt="" />
    ) : (
      <div className="ph">
        <svg width="26" height="26" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="26" cy="26" r="9" fill="#40916C" opacity=".55" />
          <circle cx="38" cy="24" r="10" fill="#40916C" opacity=".4" />
          <circle cx="33" cy="33" r="9" fill="#1B4332" opacity=".6" />
          <line x1="32" y1="34" x2="32" y2="50" stroke="#C5A253" strokeWidth="2" strokeLinecap="round" opacity=".7" />
        </svg>
      </div>
    )}
  </div>
);

// ---- tag badge ----
const TagBadge = ({ id, lang }) => {
  const meta = TAGS[id];
  if (!meta) return null;
  return <span className={"tag " + meta.kind}>{t(meta.label, lang)}</span>;
};

// ---- language toggle (segmented EN / AR) ----
const LangToggle = ({ lang, setLang }) => (
  <div style={{
    display: "flex", alignItems: "center", borderRadius: 999, padding: 3,
    background: "rgba(0,0,0,.35)", border: "1px solid var(--line)", gap: 2,
  }}>
    {[["en", "EN"], ["ar", "ع"]].map(([code, label]) => {
      const on = lang === code;
      return (
        <button key={code} onClick={() => setLang(code)}
          aria-pressed={on}
          style={{
            borderRadius: 999, padding: "5px 13px", fontSize: 13, fontWeight: 600,
            letterSpacing: ".04em", transition: ".18s",
            color: on ? "#241c08" : "var(--muted)",
            background: on ? "linear-gradient(180deg,var(--gold-bright),var(--gold))" : "transparent",
            fontFamily: code === "ar" ? '"Tajawal", sans-serif' : "inherit",
          }}>
          {label}
        </button>
      );
    })}
  </div>
);

// ---- search input ----
const SearchBar = ({ value, onChange, lang, placeholder }) => (
  <div style={{ position: "relative", flex: "1 1 auto" }}>
    <span style={{ position: "absolute", insetInlineStart: 13, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }}>
      <Icon name="search" size={17} />
    </span>
    <input
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ paddingInlineStart: 40, paddingInlineEnd: value ? 38 : 12, borderRadius: 12, height: 44 }}
    />
    {value && (
      <button onClick={() => onChange("")} className="icon-btn"
        style={{ position: "absolute", insetInlineEnd: 4, top: "50%", transform: "translateY(-50%)", width: 30, height: 30 }}>
        <Icon name="close" size={15} />
      </button>
    )}
  </div>
);

// ---- toast ----
const Toast = ({ msg }) => (
  <div style={{
    position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
    background: "var(--leaf)", color: "#fff", padding: "10px 18px", borderRadius: 999,
    fontSize: 13.5, fontWeight: 500, zIndex: 90, boxShadow: "var(--shadow)",
    display: "flex", alignItems: "center", gap: 8, animation: "fade .25s ease both",
  }}>
    <Icon name="check" size={15} /> {msg}
  </div>
);

Object.assign(window, {
  t, fmtPrice, arDigits, localizeNum, fileToThumb,
  Icon, LogoMark, Thumb, TagBadge, LangToggle, SearchBar, Toast,
});
