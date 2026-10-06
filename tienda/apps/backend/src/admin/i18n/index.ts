// El panel elige el idioma leyendo la cookie o el localStorage "lng" y, si no hay nada,
// usa inglés. Este archivo se carga antes de esa elección, así que aquí dejamos el
// español como idioma por defecto.
//
// Se aplica una sola vez por navegador (marca "andina-idioma"): si después alguien
// cambia el idioma en Configuración → Perfil, se respeta su elección.
const MARCA = "andina-idioma"

try {
  if (typeof window !== "undefined" && !window.localStorage.getItem(MARCA)) {
    window.localStorage.setItem("lng", "es")
    document.cookie = "lng=es; path=/; max-age=31536000; SameSite=Lax"
    window.localStorage.setItem(MARCA, "1")
  }
} catch {
  // Sin acceso al almacenamiento (modo privado estricto): el panel usará su idioma por defecto.
}

// Textos propios del panel (se combinan con las traducciones de Medusa).
export default {
  es: {
    translation: {
      login: {
        title: "Panel de Tienda Andina",
        hint: "Inicia sesión para administrar productos, pedidos y reclamos",
      },
      invite: {
        title: "Bienvenido al panel de Tienda Andina",
      },
    },
  },
}
