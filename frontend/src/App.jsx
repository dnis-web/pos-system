import { useState } from "react"
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [page, setPage] = useState("dashboard")

  const products = [
    { id: 1, name: "Mouse inalámbrico", stock: 15, min: 5, price: 85 },
    { id: 2, name: "Teclado mecánico", stock: 8, min: 10, price: 250 },
    { id: 3, name: "Monitor 24 pulgadas", stock: 5, min: 5, price: 950 },
  ]

  const handleLogin = (e) => {
    e.preventDefault()
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Inicio de sesión</h2>
          <p>Sistema POS con Inventario y Facturación</p>

          <form onSubmit={handleLogin}>
            <label>Usuario</label>
            <input type="text" placeholder="Ingrese su usuario" required />

            <label>Contraseña</label>
            <input type="password" placeholder="Ingrese su contraseña" required />

            <button className="primary login-btn" type="submit">
              Ingresar al sistema
            </button>
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
      return (
        <section>
          <h2>Productos</h2>
          <button className="primary">Agregar producto</button>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>PROD-{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                  <td>Q {p.price}.00</td>
                  <td><button>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )
    }

    if (page === "inventario") {
      return (
        <section>
          <h2>Control de inventario</h2>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Stock actual</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>PROD-{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                  <td>{p.min}</td>
                  <td>
                    <span className={p.stock <= p.min ? "badge warning" : "badge ok"}>
                      {p.stock <= p.min ? "Stock bajo" : "Disponible"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )
    }

    if (page === "clientes") {
      return (
        <section>
          <h2>Clientes registrados</h2>
          <button className="primary">Agregar cliente</button>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>Juan Pérez</td><td>juan@gmail.com</td><td>5555-1234</td><td><button>Editar</button></td></tr>
              <tr><td>2</td><td>Ana López</td><td>ana@gmail.com</td><td>4444-5678</td><td><button>Editar</button></td></tr>
              <tr><td>3</td><td>Carlos Ruiz</td><td>carlos@gmail.com</td><td>3333-9876</td><td><button>Editar</button></td></tr>
            </tbody>
          </table>
        </section>
      )
    }

    if (page === "ventas") {
      return (
        <section>
          <h2>Ventas</h2>

          <div className="form">
            <input placeholder="Buscar producto" />
            <input placeholder="Cantidad" type="number" />
            <button className="primary">Agregar a venta</button>
          </div>

          <div className="ticket">
            <h3>Resumen de venta</h3>
            <p>Subtotal: Q 250.00</p>
            <p>IVA: Q 30.00</p>
            <h3>Total: Q 280.00</h3>
            <button className="success">Finalizar venta</button>
          </div>
        </section>
      )
    }

    if (page === "facturacion") {
      return (
        <section>
          <h2>Facturación electrónica</h2>

          <div className="ticket">
            <h3>Factura No. FAC-00024</h3>
            <p>Cliente: Juan Pérez</p>
            <p>NIT: CF</p>
            <p>Fecha: 07/05/2026</p>
            <p>Producto: Teclado mecánico</p>
            <h3>Total: Q 280.00</h3>
            <button className="primary">Generar factura</button>
          </div>
        </section>
      )
    }

    if (page === "reportes") {
      return (
        <section>
          <h2>Reportes</h2>

          <div className="cards">
            <div className="card"><h3>Ventas semanales</h3><p>Q 8,450.00</p></div>
            <div className="card"><h3>Producto más vendido</h3><p>Teclado</p></div>
            <div className="card"><h3>Clientes activos</h3><p>36</p></div>
            <div className="card"><h3>Ingresos mensuales</h3><p>Q 24,900.00</p></div>
          </div>
        </section>
      )
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>POS</h1>

        <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>Dashboard</button>
        <button className={page === "productos" ? "active" : ""} onClick={() => setPage("productos")}>Productos</button>
        <button className={page === "inventario" ? "active" : ""} onClick={() => setPage("inventario")}>Inventario</button>
        <button className={page === "clientes" ? "active" : ""} onClick={() => setPage("clientes")}>Clientes</button>
        <button className={page === "ventas" ? "active" : ""} onClick={() => setPage("ventas")}>Ventas</button>
        <button className={page === "facturacion" ? "active" : ""} onClick={() => setPage("facturacion")}>Facturación</button>
        <button className={page === "reportes" ? "active" : ""} onClick={() => setPage("reportes")}>Reportes</button>

        <button className="logout" onClick={() => setIsLoggedIn(false)}>Cerrar sesión</button>
      </aside>

      <main className="content">
        <header>
          <h2>Sistema POS con Inventario y Facturación</h2>
        </header>

        {renderPage()}
      </main>
    </div>
  )
}

export default App