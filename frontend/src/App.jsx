import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import "./App.css"

function App() {
  const [session, setSession] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [page, setPage] = useState("dashboard")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) cargarUsuario(session.user.id)
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) cargarUsuario(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const cargarUsuario = async (userId) => {
    const { data } = await supabase
      .from("usuarios")
      .select("nombre, rol")
      .eq("id", userId)
      .single()
    if (data) setUsuario(data)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError("Credenciales incorrectas")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUsuario(null)
    setPage("dashboard")
  }

  const rol = usuario?.rol || "cajero"

  const menuItems = [
    { id: "dashboard", label: "Dashboard", roles: ["admin", "cajero", "bodeguero"] },
    { id: "productos", label: "Productos", roles: ["admin", "bodeguero"] },
    { id: "inventario", label: "Inventario", roles: ["admin", "bodeguero"] },
    { id: "ventas", label: "Ventas", roles: ["admin", "cajero"] },
    { id: "facturacion", label: "Facturación", roles: ["admin", "cajero"] },
    { id: "reportes", label: "Reportes", roles: ["admin"] },
  ]

  if (cargando) return <div className="login-page"><p>Cargando...</p></div>

  if (!session) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Inicio de sesión</h2>
          <p>Sistema POS con Inventario y Facturación</p>
          <form onSubmit={handleLogin}>
            <label>Correo</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ingrese su contraseña" required />
            {error && <p style={{color: "red"}}>{error}</p>}
            <button className="primary login-btn" type="submit">Ingresar al sistema</button>
          </form>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    if (page === "dashboard") {
      return (
        <section>
          <h2>Dashboard</h2>
          <div className="cards">
            <div className="card"><h3>Ventas del día</h3><p>Q 1,850.00</p></div>
            <div className="card"><h3>Productos</h3><p>128 registrados</p></div>
            <div className="card"><h3>Stock bajo</h3><p>6 productos</p></div>
            <div className="card"><h3>Facturas</h3><p>24 emitidas</p></div>
          </div>
        </section>
      )
    }
    if (page === "productos") {
      return <PaginaProductos token={session?.access_token} />
    }
    if (page === "inventario") {
      return <PaginaInventario token={session?.access_token} />
    }
    if (page === "ventas") {
      return <PaginaVentas token={session?.access_token} />
    }
    if (page === "facturacion") {
      return <section><h2>Facturación</h2><p>Conectando con backend...</p></section>
    }
    if (page === "reportes") {
      return <section><h2>Reportes</h2><p>Solo disponible para Admin</p></section>
    }
  }

  function PaginaProductos({ token }) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/productos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setProductos(data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [token])

  if (cargando) return <section><h2>Productos</h2><p>Cargando...</p></section>

  return (
    <section>
      <h2>Productos</h2>
      <table>
        <thead>
          <tr><th>Código</th><th>Nombre</th><th>Stock</th><th>Precio</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.codigo || `PROD-${p.id?.slice(0,6)}`}</td>
              <td>{p.nombre}</td>
              <td>{p.stock}</td>
              <td>Q {p.precio_venta}</td>
              <td><span className={p.activo ? "badge ok" : "badge warning"}>{p.activo ? "Activo" : "Inactivo"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function PaginaInventario({ token }) {
  const [productos, setProductos] = useState([])
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/productos`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setProductos(Array.isArray(data) ? data : []))

    fetch(`${import.meta.env.VITE_API_URL}/api/productos/alertas`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setAlertas(Array.isArray(data) ? data : []))
  }, [token])

  const idsAlerta = new Set(alertas.map(p => p.id))

  return (
    <section>
      <h2>Control de Inventario</h2>
      {alertas.length > 0 && (
        <p style={{color: "red"}}>⚠️ {alertas.length} productos con stock bajo</p>
      )}
      <table>
        <thead>
          <tr><th>Producto</th><th>Stock actual</th><th>Stock mínimo</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.stock}</td>
              <td>{p.stock_minimo}</td>
              <td><span className={idsAlerta.has(p.id) ? "badge warning" : "badge ok"}>
                {idsAlerta.has(p.id) ? "Stock bajo" : "Disponible"}
              </span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function PaginaVentas({ token }) {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [items, setItems] = useState([])
  const [metodoPago, setMetodoPago] = useState("EFECTIVO")
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/productos`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setProductos(Array.isArray(data) ? data : []))
  }, [token])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && p.activo
  )

  const agregarItem = (producto) => {
    const existe = items.find(i => i.producto_id === producto.id)
    if (existe) {
      setItems(items.map(i => i.producto_id === producto.id ? {...i, cantidad: i.cantidad + 1} : i))
    } else {
      setItems([...items, { producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_venta, cantidad: 1 }])
    }
    setBusqueda("")
  }

  const subtotal = items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0)
  const iva = subtotal * 0.12
  const total = subtotal + iva

  const finalizarVenta = async () => {
    if (items.length === 0) return
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ventas`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(i => ({producto_id: i.producto_id, cantidad: i.cantidad, precio_unitario: i.precio_unitario})), metodo_pago: metodoPago, descuento_pct: 0 })
    })
  const data = await res.json()
  console.log('Respuesta venta:', data)
  if (data.venta) {
      setMensaje(`✅ Venta registrada #${data.venta.numero_venta}`)
      setItems([])
    } else {
      setMensaje("❌ Error al registrar venta")
    }
  }

  return (
    <section>
      <h2>Ventas</h2>
      <input placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      {busqueda && (
        <ul style={{border: "1px solid #ccc", padding: "8px", listStyle: "none"}}>
          {productosFiltrados.slice(0, 5).map(p => (
            <li key={p.id} style={{cursor: "pointer", padding: "4px"}} onClick={() => agregarItem(p)}>
              {p.nombre} — Q{p.precio_venta}
            </li>
          ))}
        </ul>
      )}
      <table>
        <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.producto_id}>
              <td>{i.nombre}</td>
              <td>Q{i.precio_unitario}</td>
              <td>{i.cantidad}</td>
              <td>Q{(i.precio_unitario * i.cantidad).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ticket">
        <p>Subtotal: Q{subtotal.toFixed(2)}</p>
        <p>IVA (12%): Q{iva.toFixed(2)}</p>
        <h3>Total: Q{total.toFixed(2)}</h3>
        <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
        <option value="EFECTIVO">Efectivo</option>
        <option value="TARJETA">Tarjeta</option>
        <option value="TRANSFERENCIA">Transferencia</option>
        </select>
        <button className="success" onClick={finalizarVenta}>Finalizar venta</button>
        {mensaje && <p>{mensaje}</p>}
      </div>
    </section>
  )
}

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>POS</h1>
        <p style={{fontSize: "12px", color: "#aaa"}}>{usuario?.nombre} ({rol})</p>
        {menuItems.filter(m => m.roles.includes(rol)).map(m => (
          <button key={m.id} className={page === m.id ? "active" : ""} onClick={() => setPage(m.id)}>
            {m.label}
          </button>
        ))}
        <button className="logout" onClick={handleLogout}>Cerrar sesión</button>
      </aside>
      <main className="content">
        <header><h2>Sistema POS con Inventario y Facturación</h2></header>
        {renderPage()}
      </main>
    </div>
  )
}

export default App