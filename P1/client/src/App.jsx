import { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [sensores, setSensores] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    tipo: "",
    valor: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    const cargarSensores = async () => {
      setCargando(true);
      setError(null);
      try {
        const url = filtroTipo === "todos" 
          ? `${API_URL}/sensores` 
          : `${API_URL}/sensores/tipo/${filtroTipo}`;
          
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setSensores(data);
      } catch (err) {
        setError("No se pudieron cargar los sensores. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    };

    cargarSensores();
  }, [filtroTipo]);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const agregarSensor = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/sensores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });
      if (!response.ok) throw new Error("Error al guardar");
      const nuevoSensor = await response.json();
      setSensores([...sensores, nuevoSensor]);
      setFormulario({ nombre: "", tipo: "", valor: "" });
    } catch (err) {
      setError("No se pudo agregar el sensor. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setCargando(false);
    }
  };

  const eliminarSensor = async (id, nombre) => {
    if (!confirm(`¿Eliminar ${nombre}?`)) return;
    try {
      const response = await fetch(`${API_URL}/sensores/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar");
      setSensores(sensores.filter((s) => s._id !== id));
    } catch (err) {
      alert("Error al eliminar el sensor");
    }
  };

  return (
    <div className="contenedor">
      <header>
        <h1>📡 SensorFlow Dashboard</h1>
        <p className="subtitulo">Programación Reactiva con React + Node.js</p>
      </header>

      <form onSubmit={agregarSensor} className="formulario">
        <input
          name="nombre"
          placeholder="Nombre (ej. Sala)"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />
        <select
          name="tipo"
          value={formulario.tipo}
          onChange={manejarCambio}
          required
        >
          <option value="">Tipo...</option>
          <option value="Temperatura">🌡️ Temperatura</option>
          <option value="Humedad">💧 Humedad</option>
          <option value="Luz">☀️ Luz</option>
        </select>
        <input
          name="valor"
          type="number"
          placeholder="Valor"
          value={formulario.valor}
          onChange={manejarCambio}
          required
        />
        <button type="submit" disabled={cargando}>
          {cargando ? "Cargando..." : "➕ Agregar"}
        </button>
      </form>

      <div className="filtros">
        <label>Filtrar por tipo: </label>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="Temperatura">Temperatura</option>
          <option value="Humedad">Humedad</option>
          <option value="Luz">Luz</option>
        </select>
      </div>

      {error && <div className="error">⚠️ {error}</div>}
      {cargando && !sensores.length && (
        <div className="cargando">⏳ Cargando sensores...</div>
      )}

      <div className="grid-sensores">
        {sensores.map((sensor) => (
          <article key={sensor._id} className="tarjeta-sensor">
            <h3>{sensor.nombre}</h3>
            <p className="tipo">🏷️ {sensor.tipo}</p>
            <p className="valor">
              📊 {sensor.valor}{" "}
              {sensor.tipo === "Temperatura" ? "°C" : sensor.tipo === "Humedad" ? "%" : "lux"}
            </p>
            <button 
              onClick={() => eliminarSensor(sensor._id, sensor.nombre)} 
              className="btn-eliminar"
            >
              🗑️ Eliminar
            </button>
          </article>
        ))}
      </div>

      {sensores.length === 0 && !cargando && (
        <p className="vacio">
          {filtroTipo === "todos"
            ? "No hay sensores registrados. ¡Agrega uno!"
            : `No hay sensores de tipo "${filtroTipo}"`}
        </p>
      )}
    </div>
  );
}

export default App;