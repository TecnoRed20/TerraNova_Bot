import mongoose from 'mongoose';
import eLog from './eLog';
const URI = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@${process.env.DATABASE_IP}/${process.env.DATABASE_CLUSTER}`;

// Conectar a la base de datos MongoDB
export default async function connectDB() {
  try {
    eLog("Conectando...")
    //eLog(URI)
    await mongoose.connect(URI);
    eLog('¡Conexión exitosa a MongoDB!');
  } catch (error) {
    eLog('Error de conexión a MongoDB: ', error);
    process.exit(1);
  }
}
