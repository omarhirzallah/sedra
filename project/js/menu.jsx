/* Sedra — customer menu screen */
const { STRINGS: S, TAGS: TAGMETA } = window.SEDRA;

const Header = ({ lang, setLang, settings, table, onAdmin }) => (
  <header style={{ position: "sticky", top: 0, zIndex: 40 }}>
    <div style={{
      background: "rgba(10,11,9,.82)", backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px" }}>
        <LogoMark size={42} logo={settings.logo} />
        <div style={{ flex: "1 1 auto", minWidth: 0, lineHeight: 1 }}>
          <div className="display" style={{ fontSize: 25, fontWeight: 600, letterSpacing: ".01em" }}>
            {t(settings.brand, lang)}
          </div>
          <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 2, fontWeight: 500 }}>
            {t(settings.tagline, lang)}
          </div>
        </div>
        {table != null && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1,
            padding: "6px 12px", borderRadius: 12, background: "var(--leaf-soft)",
            border: "1px solid rgba(64,145,108,.32)",
          }}>
            <span style={{ fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#8fd3b2" }}>{t(S.table, lang)}</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#fff", fontFamily: "var(--font-display)" }}>{localizeNum(table, lang)}</span>
          </div>
        )}
        <LangToggle lang={lang} setLang={setLang} />
        <button className="icon-btn" onClick={onAdmin} title="Owner" aria-label="Owner dashboard">
          <Icon name="lock" size={17} />
        </button>
      </div>
    </div>
  </header>
);

const CategoryNav = ({ menu, active, lang, onJump }) => {
  const railRef = useRef(null);
  useEffect(() => {
    const el = railRef.current?.querySelector(`[data-chip="${active}"]`);
    if (el) el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);
  return (
    <div style={{ position: "sticky", top: 65, zIndex: 30, background: "rgba(10,11,9,.82)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line-soft)" }}>
      <div ref={railRef} className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 18px", maxWidth: "var(--maxw)", margin: "0 auto" }}>
        {menu.map((cat) => {
          const on = active === cat.id;
          return (
            <button key={cat.id} data-chip={cat.id} onClick={() => onJump(cat.id)}
              style={{
                flex: "0 0 auto", padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                whiteSpace: "nowrap", transition: ".18s",
                border: "1px solid " + (on ? "rgba(197,162,83,.5)" : "var(--line)"),
                color: on ? "var(--gold-bright)" : "var(--muted)",
                background: on ? "rgba(197,162,83,.12)" : "transparent",
              }}>
              {t(cat.name, lang)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ItemRow = ({ item, lang, currency }) => {
  const out = !item.available;
  return (
    <div className={"item" + (out ? " out" : "")}>
      <Thumb photo={item.photo} />
      <div className="item-main">
        <div className="item-head">
          <span className="item-name">{t(item.name, lang)}</span>
          <span className="leader" />
          <span className="price">
            {out ? <span className="tag warn" style={{ verticalAlign: "middle" }}>{t(S.soldOut, lang)}</span>
              : <>{localizeNum(fmtPrice(item.price), lang)}<span className="cur">{t(currency, lang)}</span></>}
          </span>
        </div>
        {t(item.desc, lang) && <div className="item-desc">{t(item.desc, lang)}</div>}
        {item.tags.length > 0 && (
          <div className="item-tags">
            {item.tags.map((tg) => <TagBadge key={tg} id={tg} lang={lang} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const CategorySection = ({ cat, lang, currency, refCb }) => (
  <section ref={refCb} data-cat={cat.id} data-screen-label={cat.name.en} style={{ scrollMarginTop: 118, breakInside: "avoid", marginBottom: 30 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
      <h2 className="display gold" style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: ".01em" }}>
        {t(cat.name, lang)}
      </h2>
      <span style={{ fontSize: 12, color: "var(--faint)" }}>
        {localizeNum(cat.items.length, lang)} {t(S.itemsCount, lang)}
      </span>
    </div>
    <div style={{ height: 1, background: "linear-gradient(90deg, rgba(197,162,83,.4), transparent)", marginBottom: 6 }} />
    <div>
      {cat.items.map((it) => <ItemRow key={it.id} item={it} lang={lang} currency={currency} />)}
    </div>
  </section>
);

const MenuScreen = ({ menu, settings, lang, setLang, table, onAdmin }) => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(menu[0]?.id);
  const secRefs = useRef({});

  // filter
  const q = query.trim().toLowerCase();
  const filtered = menu
    .map((cat) => ({
      ...cat,
      items: q
        ? cat.items.filter((it) =>
            (it.name.en + " " + it.name.ar + " " + it.desc.en + " " + it.desc.ar).toLowerCase().includes(q))
        : cat.items,
    }))
    .filter((cat) => cat.items.length > 0);

  // scroll-spy
  useEffect(() => {
    if (q) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.dataset.cat);
      },
      { rootMargin: "-130px 0px -60% 0px", threshold: 0 }
    );
    Object.values(secRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [menu, q]);

  const jump = (id) => {
    const el = secRefs.current[id];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 116;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Header lang={lang} setLang={setLang} settings={settings} table={table} onAdmin={onAdmin} />

      <div className="wrap" style={{ paddingTop: 14, paddingBottom: 8 }}>
        <SearchBar value={query} onChange={setQuery} lang={lang} placeholder={t(S.search, lang)} />
      </div>

      {!q && <CategoryNav menu={menu} active={active} lang={lang} onJump={jump} />}

      <main className="wrap" style={{ paddingTop: 22, paddingBottom: 80 }}>
        <div className="menu-columns">
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: "60px 0", fontSize: 15 }}>
              {t(S.noResults, lang)}
            </div>
          ) : (
            filtered.map((cat) => (
              <CategorySection key={cat.id} cat={cat} lang={lang} currency={settings.currency}
                refCb={(el) => (secRefs.current[cat.id] = el)} />
            ))
          )}
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "0 18px 44px", color: "var(--faint)", fontSize: 12 }}>
        <div style={{ width: 30, height: 1, background: "var(--line)", margin: "0 auto 16px" }} />
        <div className="display" style={{ fontSize: 19, color: "var(--gold)", marginBottom: 4 }}>{t(settings.brand, lang)} · {settings.brand.ar}</div>
        {t(settings.tagline, lang)}
      </footer>
    </div>
  );
};

window.MenuScreen = MenuScreen;
