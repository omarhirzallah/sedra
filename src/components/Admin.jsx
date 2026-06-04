/* Sedra — owner admin dashboard */
import { useState, useRef } from 'react'
import { STRINGS as AS, TAGS as ATAGS } from '../data/menu.js'
import { t, fmtPrice, fileToThumb, Icon, LogoMark, Thumb, TagBadge, LangToggle } from './ui.jsx'

const uid = (p) => p + "-" + Math.random().toString(36).slice(2, 8)

const Modal = ({ title, onClose, children, footer }) => (
  <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div style={{ position: "sticky", top: 0, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)", zIndex: 2 }}>
        <h3 className="display gold" style={{ margin: 0, fontSize: 23, fontWeight: 600 }}>{title}</h3>
        <button className="icon-btn" onClick={onClose}><Icon name="close" size={18} /></button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
      {footer && (
        <div style={{ position: "sticky", bottom: 0, background: "var(--bg-2)", display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 20px", borderTop: "1px solid var(--line)" }}>
          {footer}
        </div>
      )}
    </div>
  </div>
)

const PhotoField = ({ photo, onChange, lang }) => {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try { onChange(await fileToThumb(file)) } catch (_) {}
    setBusy(false)
    e.target.value = ""
  }
  return (
    <div className="field">
      <label>{t(AS.photo, lang)}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="thumb" style={{ width: 64, height: 64 }}>
          {photo ? <img src={photo} alt="" /> : <div className="ph" style={{ display: "grid", placeItems: "center" }}><Icon name="image" size={22} /></div>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
        <button className="btn btn-ghost btn-sm" onClick={() => inputRef.current.click()}>
          {busy ? <Icon name="gear" size={15} /> : <Icon name="image" size={15} />} {t(AS.upload, lang)}
        </button>
        {photo && <button className="btn btn-danger btn-sm" onClick={() => onChange(null)}>{t(AS.remove, lang)}</button>}
      </div>
    </div>
  )
}

const ItemEditor = ({ item, lang, onSave, onClose }) => {
  const [d, setD] = useState(() => JSON.parse(JSON.stringify(item)))
  const set = (path, val) => setD((prev) => {
    const n = { ...prev }
    if (path.includes(".")) { const [a, b] = path.split("."); n[a] = { ...n[a], [b]: val } }
    else n[path] = val
    return n
  })
  const toggleTag = (tg) => setD((p) => ({ ...p, tags: p.tags.includes(tg) ? p.tags.filter((x) => x !== tg) : [...p.tags, tg] }))
  const valid = d.name.en.trim() || d.name.ar.trim()

  return (
    <Modal title={item.__isNew ? t(AS.newItem, lang) : t(AS.editItem, lang)} onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t(AS.cancel, lang)}</button>
        <button className="btn btn-gold" disabled={!valid} style={{ opacity: valid ? 1 : .5 }} onClick={() => onSave(d)}>{t(AS.save, lang)}</button>
      </>}>
      <div className="admin-grid">
        <div className="row2">
          <div className="field"><label>{t(AS.nameEn, lang)}</label><input className="input" dir="ltr" value={d.name.en} onChange={(e) => set("name.en", e.target.value)} /></div>
          <div className="field"><label>{t(AS.nameAr, lang)}</label><input className="input" dir="rtl" style={{ fontFamily: '"Tajawal",sans-serif' }} value={d.name.ar} onChange={(e) => set("name.ar", e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>{t(AS.descEn, lang)}</label><textarea className="input" dir="ltr" value={d.desc.en} onChange={(e) => set("desc.en", e.target.value)} /></div>
          <div className="field"><label>{t(AS.descAr, lang)}</label><textarea className="input" dir="rtl" style={{ fontFamily: '"Tajawal",sans-serif' }} value={d.desc.ar} onChange={(e) => set("desc.ar", e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>{t(AS.price, lang)}</label><input className="input" type="number" step="0.5" min="0" value={d.price} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} /></div>
          <div className="field">
            <label>{t(AS.available, lang)}</label>
            <button onClick={() => set("available", !d.available)} style={{ display: "flex", alignItems: "center", gap: 10, height: 42 }}>
              <span className={"switch" + (d.available ? " on" : "")} />
              <span style={{ fontSize: 13.5, color: d.available ? "#8fd3b2" : "var(--muted)" }}>{d.available ? t(AS.available, lang) : t(AS.soldOut, lang)}</span>
            </button>
          </div>
        </div>
        <div className="field">
          <label>{t(AS.tagsLabel, lang)}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.keys(ATAGS).map((tg) => (
              <button key={tg} className={"tag-pick" + (d.tags.includes(tg) ? " on" : "")} onClick={() => toggleTag(tg)}>
                {d.tags.includes(tg) && <Icon name="check" size={13} />}{t(ATAGS[tg].label, lang)}
              </button>
            ))}
          </div>
        </div>
        <PhotoField photo={d.photo} onChange={(p) => set("photo", p)} lang={lang} />
      </div>
    </Modal>
  )
}

const CategoryEditor = ({ cat, lang, onSave, onClose }) => {
  const [d, setD] = useState(() => ({ en: cat.name.en, ar: cat.name.ar }))
  const valid = d.en.trim() || d.ar.trim()
  return (
    <Modal title={cat.__isNew ? t(AS.newCategory, lang) : t(AS.editCategory, lang)} onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t(AS.cancel, lang)}</button>
        <button className="btn btn-gold" disabled={!valid} style={{ opacity: valid ? 1 : .5 }} onClick={() => onSave(d)}>{t(AS.save, lang)}</button>
      </>}>
      <div className="row2">
        <div className="field"><label>{t(AS.nameEn, lang)}</label><input className="input" dir="ltr" autoFocus value={d.en} onChange={(e) => setD({ ...d, en: e.target.value })} /></div>
        <div className="field"><label>{t(AS.nameAr, lang)}</label><input className="input" dir="rtl" style={{ fontFamily: '"Tajawal",sans-serif' }} value={d.ar} onChange={(e) => setD({ ...d, ar: e.target.value })} /></div>
      </div>
    </Modal>
  )
}

const SettingsModal = ({ settings, lang, onSave, onClose, onReset }) => {
  const [d, setD] = useState(() => JSON.parse(JSON.stringify(settings)))
  const setF = (a, b, v) => setD((p) => ({ ...p, [a]: { ...p[a], [b]: v } }))
  const logoRef = useRef(null)
  const pickLogo = async (e) => { const f = e.target.files?.[0]; if (f) { const logo = await fileToThumb(f, 256, .85); setD((p) => ({ ...p, logo })) } e.target.value = "" }
  return (
    <Modal title={t(AS.settings, lang)} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>{t(AS.cancel, lang)}</button><button className="btn btn-gold" onClick={() => onSave(d)}>{t(AS.save, lang)}</button></>}>
      <div className="admin-grid">
        <div className="row2">
          <div className="field"><label>{t(AS.brandName, lang)} (EN)</label><input className="input" dir="ltr" value={d.brand.en} onChange={(e) => setF("brand", "en", e.target.value)} /></div>
          <div className="field"><label>{t(AS.brandName, lang)} (ع)</label><input className="input" dir="rtl" style={{ fontFamily: '"Tajawal",sans-serif' }} value={d.brand.ar} onChange={(e) => setF("brand", "ar", e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>{t(AS.tagline, lang)} (EN)</label><input className="input" dir="ltr" value={d.tagline.en} onChange={(e) => setF("tagline", "en", e.target.value)} /></div>
          <div className="field"><label>{t(AS.tagline, lang)} (ع)</label><input className="input" dir="rtl" style={{ fontFamily: '"Tajawal",sans-serif' }} value={d.tagline.ar} onChange={(e) => setF("tagline", "ar", e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>{t(AS.currencyEn, lang)}</label><input className="input" dir="ltr" value={d.currency.en} onChange={(e) => setF("currency", "en", e.target.value)} /></div>
          <div className="field"><label>{t(AS.currencyAr, lang)}</label><input className="input" dir="rtl" style={{ fontFamily: '"Tajawal",sans-serif' }} value={d.currency.ar} onChange={(e) => setF("currency", "ar", e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Logo</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={56} logo={d.logo} />
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={pickLogo} />
            <button className="btn btn-ghost btn-sm" onClick={() => logoRef.current.click()}><Icon name="image" size={15} /> {t(AS.upload, lang)}</button>
            {d.logo && <button className="btn btn-danger btn-sm" onClick={() => setD((p) => ({ ...p, logo: null }))}>{t(AS.remove, lang)}</button>}
          </div>
        </div>
        <hr className="divider" />
        <button className="btn btn-danger" onClick={onReset}><Icon name="trash" size={15} /> {t(AS.reset, lang)}</button>
      </div>
    </Modal>
  )
}

const AdminItemLine = ({ item, lang, currency, onEdit, onDelete, onToggle, onMove, isFirst, isLast }) => (
  <div className="item" style={{ alignItems: "center", padding: "10px 0" }}>
    <Thumb photo={item.photo} size={46} />
    <div className="item-main" style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{item.name.en || "—"}</span>
        <span style={{ fontSize: 14.5, color: "var(--muted)", fontFamily: '"Tajawal",sans-serif' }} dir="rtl">{item.name.ar || "—"}</span>
        {!item.available && <span className="tag warn">{t(AS.soldOut, lang)}</span>}
        {item.tags.map((tg) => <TagBadge key={tg} id={tg} lang={lang} />)}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--gold)", marginTop: 3, fontVariantNumeric: "tabular-nums" }}>{fmtPrice(item.price)} {currency.en}</div>
    </div>
    <div className="item-actions" style={{ display: "flex", alignItems: "center", gap: 2, flex: "0 0 auto" }}>
      <button className="icon-btn" disabled={isFirst} style={{ opacity: isFirst ? .3 : 1 }} onClick={() => onMove(-1)} title={t(AS.moveUp, lang)}><Icon name="up" size={16} /></button>
      <button className="icon-btn" disabled={isLast} style={{ opacity: isLast ? .3 : 1 }} onClick={() => onMove(1)} title={t(AS.moveDown, lang)}><Icon name="down" size={16} /></button>
      <button onClick={onToggle} title={t(AS.available, lang)} className="icon-btn" style={{ width: 48 }}><span className={"switch" + (item.available ? " on" : "")} /></button>
      <button className="icon-btn" onClick={onEdit}><Icon name="edit" size={16} /></button>
      <button className="icon-btn" style={{ color: "#e79a7f" }} onClick={onDelete}><Icon name="trash" size={16} /></button>
    </div>
  </div>
)

export const AdminDashboard = ({ menu, setMenu, settings, setSettings, lang, setLang, onExit, onReset, toast }) => {
  const [editItem, setEditItem] = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const update = (fn) => setMenu((prev) => fn(JSON.parse(JSON.stringify(prev))))

  const moveCat = (idx, dir) => update((m) => { const j = idx + dir; if (j < 0 || j >= m.length) return m; [m[idx], m[j]] = [m[j], m[idx]]; return m })
  const deleteCat = (idx) => { if (confirm(t(AS.deleteConfirm, lang))) update((m) => { m.splice(idx, 1); return m }) }
  const saveCat = (data) => {
    if (editCat.__isNew) {
      update((m) => [...m, { id: uid("cat"), name: { en: data.en, ar: data.ar }, items: [] }])
    } else {
      update((m) => { const c = m.find((x) => x.id === editCat.id); c.name = { en: data.en, ar: data.ar }; return m })
    }
    setEditCat(null); toast()
  }

  const moveItem = (catId, idx, dir) => update((m) => { const c = m.find((x) => x.id === catId); const j = idx + dir; if (j < 0 || j >= c.items.length) return m; [c.items[idx], c.items[j]] = [c.items[j], c.items[idx]]; return m })
  const toggleItem = (catId, id) => update((m) => { const it = m.find((x) => x.id === catId).items.find((x) => x.id === id); it.available = !it.available; return m })
  const deleteItem = (catId, id) => { if (confirm(t(AS.deleteConfirm, lang))) update((m) => { const c = m.find((x) => x.id === catId); c.items = c.items.filter((x) => x.id !== id); return m }) }
  const saveItem = (data) => {
    const { catId } = editItem
    update((m) => {
      const c = m.find((x) => x.id === catId)
      if (data.__isNew) { const { __isNew, ...rest } = data; c.items.push({ ...rest, id: uid("it") }) }
      else { const i = c.items.findIndex((x) => x.id === data.id); c.items[i] = data }
      return m
    })
    setEditItem(null); toast()
  }

  const newItem = (catId) => setEditItem({ catId, item: { __isNew: true, id: "new", name: { en: "", ar: "" }, desc: { en: "", ar: "" }, price: 2.0, tags: [], available: true, photo: null } })

  return (
    <div>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,11,9,.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap admin-header-inner">
          <LogoMark size={38} logo={settings.logo} />
          <div style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden" }}>
            <div className="display" style={{ fontSize: 21, fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t(AS.adminTitle, lang)}</div>
            <div style={{ fontSize: 11, color: "var(--leaf)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t(AS.liveNote, lang)}</div>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
          <button className="icon-btn" onClick={() => setShowSettings(true)} title={t(AS.settings, lang)}><Icon name="gear" size={18} /></button>
          <button className="btn btn-ghost btn-sm" onClick={onExit}><Icon name="back" size={15} /> {t(AS.viewMenu, lang)}</button>
        </div>
      </header>

      <main className="wrap" style={{ paddingTop: 22, paddingBottom: 90 }}>
        <div className="admin-grid">
          {menu.map((cat, ci) => (
            <section key={cat.id} className="card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <h3 className="display gold" style={{ margin: 0, fontSize: 23, fontWeight: 600 }}>{cat.name.en}</h3>
                  <span style={{ fontSize: 14, color: "var(--muted)", fontFamily: '"Tajawal",sans-serif' }} dir="rtl">{cat.name.ar}</span>
                </div>
                <button className="icon-btn" disabled={ci === 0} style={{ opacity: ci === 0 ? .3 : 1 }} onClick={() => moveCat(ci, -1)}><Icon name="up" size={16} /></button>
                <button className="icon-btn" disabled={ci === menu.length - 1} style={{ opacity: ci === menu.length - 1 ? .3 : 1 }} onClick={() => moveCat(ci, 1)}><Icon name="down" size={16} /></button>
                <button className="icon-btn" onClick={() => setEditCat({ ...cat })}><Icon name="edit" size={16} /></button>
                <button className="icon-btn" style={{ color: "#e79a7f" }} onClick={() => deleteCat(ci)}><Icon name="trash" size={16} /></button>
              </div>
              <hr className="divider" />
              {cat.items.length === 0 && <div style={{ color: "var(--faint)", fontSize: 13, padding: "12px 0" }}>{t(AS.empty, lang)}</div>}
              {cat.items.map((it, ii) => (
                <AdminItemLine key={it.id} item={it} lang={lang} currency={settings.currency}
                  isFirst={ii === 0} isLast={ii === cat.items.length - 1}
                  onMove={(dir) => moveItem(cat.id, ii, dir)}
                  onToggle={() => toggleItem(cat.id, it.id)}
                  onEdit={() => setEditItem({ catId: cat.id, item: it })}
                  onDelete={() => deleteItem(cat.id, it.id)} />
              ))}
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => newItem(cat.id)}><Icon name="plus" size={15} /> {t(AS.addItem, lang)}</button>
            </section>
          ))}
          <button className="btn btn-gold" style={{ justifySelf: "start" }} onClick={() => setEditCat({ __isNew: true, name: { en: "", ar: "" } })}><Icon name="plus" size={16} /> {t(AS.addCategory, lang)}</button>
        </div>
      </main>

      {editItem && <ItemEditor item={editItem.item} lang={lang} onClose={() => setEditItem(null)} onSave={saveItem} />}
      {editCat && <CategoryEditor cat={editCat} lang={lang} onClose={() => setEditCat(null)} onSave={saveCat} />}
      {showSettings && <SettingsModal settings={settings} lang={lang} onClose={() => setShowSettings(false)} onSave={(d) => { setSettings(d); setShowSettings(false); toast() }} onReset={() => { if (confirm(t(AS.resetConfirm, lang))) { onReset(); setShowSettings(false) } }} />}
    </div>
  )
}

export const AdminLogin = ({ lang, setLang, settings, onAuth, onExit }) => {
  const [pw, setPw] = useState("")
  const [err, setErr] = useState(false)
  const submit = (e) => { e.preventDefault(); if (pw === settings.adminPassword) onAuth(); else setErr(true) }
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card fade-in" style={{ width: "100%", maxWidth: 380, padding: 32, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><LogoMark size={66} logo={settings.logo} /></div>
        <h2 className="display" style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 600 }}>{t(settings.brand, lang)}</h2>
        <p style={{ margin: "0 0 24px", color: "var(--gold)", fontSize: 13, letterSpacing: ".06em" }}>{t(AS.adminTitle, lang)}</p>
        <form onSubmit={submit} className="admin-grid" style={{ gap: 12 }}>
          <div className="field" style={{ textAlign: "start" }}>
            <label>{t(AS.password, lang)}</label>
            <input className="input" type="password" autoFocus value={pw} onChange={(e) => { setPw(e.target.value); setErr(false) }} placeholder="••••••" />
          </div>
          {err && <div style={{ color: "#e79a7f", fontSize: 13 }}>{t(AS.wrongPass, lang)}</div>}
          <button className="btn btn-gold" type="submit"><Icon name="lock" size={15} /> {t(AS.login, lang)}</button>
          <button className="btn btn-ghost" type="button" onClick={onExit}>{t(AS.viewMenu, lang)}</button>
        </form>
        <p style={{ marginTop: 18, fontSize: 11.5, color: "var(--faint)" }}>Demo password: <span className="gold">{settings.adminPassword}</span></p>
      </div>
    </div>
  )
}
