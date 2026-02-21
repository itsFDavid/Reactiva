require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();

const corsOptions = {
  // origin: FRONTEND_URL,
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 peticiones por ventana
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.",
});

app.use("/api/", limiter);

app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error de conexión:", err));

const sensorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  tipo: {
    type: String,
    required: true,
    enum: ["Temperatura", "Humedad", "Luz"],
  },
  valor: { type: Number, default: 0 },
  fecha: { type: Date, default: Date.now },
});

const Sensor = mongoose.model("Sensor", sensorSchema);

app.get("/api/sensores", async (req, res) => {
  try {
    const sensores = await Sensor.find();
    res.json(sensores);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener sensores" });
  }
});

app.post("/api/sensores", async (req, res) => {
  try {
    const nuevoSensor = new Sensor(req.body);
    await nuevoSensor.save();
    res.status(201).json(nuevoSensor);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos", detalle: error.message });
  }
});

app.delete("/api/sensores/:id", async (req, res) => {
  try {
    const resultado = await Sensor.findByIdAndDelete(req.params.id);
    if (!resultado) return res.status(404).json({ mensaje: "No encontrado" });
    res.json({ mensaje: "Sensor eliminado correctamente", id: req.params.id });
  } catch (error) {
    res.status(400).json({ error: "ID no válido" });
  }
});

app.get("/api/sensores/tipo/:tipo", async (req, res) => {
  try {
    const filtrados = await Sensor.find({ tipo: req.params.tipo });
    res.json(filtrados);
  } catch (error) {
    res.status(500).json({ error: "Error al filtrar" });
  }
});

app.listen(PORT, () => {
  console.log(` Servidor API corriendo en http://localhost:${PORT}`);
  console.log(` Endpoints disponibles:`);
  console.log(` GET /api/sensores`);
  console.log(` POST /api/sensores`);
  console.log(` DELETE /api/sensores/:id`);
});
