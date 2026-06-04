/* Sedra — root app: state, persistence, routing, RTL */
import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_MENU, DEFAULT_SETTINGS } from './data/menu.js'
import { MenuScreen } from './components/Menu.jsx'
import { AdminDashboard, AdminLogin } from './components/Admin.jsx'
import { Toast } from './components/ui.jsx'

const LS_KEY = "sedra_menu_v1"
let toastTimer

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p.menu && p.settings) return p
    }
  } catch (_) {}
  return null
}

export default function App() {
  const saved = loadState()
  const [menu, setMenu] = useState(saved?.menu || DEFAULT_MENU)
  const [settings, setSettings] = useState(saved?.settings || DEFAULT_SETTINGS)
  const [lang, setLang] = useState(() => {
    const u = new URLSearchParams(location.search).get("lang")
    return u === "ar" ? "ar" : (saved?.lang || "en")
  })
  const [route, setRoute] = useState(() => (location.hash.replace("#", "") === "admin" ? "admin" : "menu"))
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("sedra_auth") === "1")
  const [toastMsg, setToastMsg] = useState(null)

  const table = (() => {
    const v = new URLSearchParams(location.search).get("table")
    return v && /^\d+$/.test(v) ? v : null
  })()

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ menu, settings, lang })) } catch (_) {}
  }, [menu, settings, lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  useEffect(() => {
    const onHash = () => setRoute(location.hash.replace("#", "") === "admin" ? "admin" : "menu")
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const go = (r) => { location.hash = r === "admin" ? "admin" : ""; setRoute(r); window.scrollTo(0, 0) }

  const toast = useCallback((msg) => {
    setToastMsg(msg || (lang === "ar" ? "تم الحفظ" : "Saved"))
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToastMsg(null), 1600)
  }, [lang])

  const resetAll = () => { setMenu(JSON.parse(JSON.stringify(DEFAULT_MENU))); setSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS))); toast(lang === "ar" ? "تمت الاستعادة" : "Reset") }

  const authAndGo = () => { sessionStorage.setItem("sedra_auth", "1"); setAuthed(true) }

  let view
  if (route === "admin") {
    view = authed
      ? <AdminDashboard menu={menu} setMenu={setMenu} settings={settings} setSettings={setSettings}
          lang={lang} setLang={setLang} onExit={() => go("menu")} onReset={resetAll} toast={toast} />
      : <AdminLogin lang={lang} setLang={setLang} settings={settings} onAuth={authAndGo} onExit={() => go("menu")} />
  } else {
    view = <MenuScreen menu={menu} settings={settings} lang={lang} setLang={setLang} table={table} onAdmin={() => go("admin")} />
  }

  return (
    <div key={route}>
      {view}
      {toastMsg && <Toast msg={toastMsg} />}
    </div>
  )
}
