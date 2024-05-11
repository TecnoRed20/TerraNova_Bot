const mongoose = require('mongoose');

// Conectar a la base de datos MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('¡Conexión exitosa a MongoDB!');
    // Continúa con tu código aquí
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
    // Puedes manejar el error o tomar acciones apropiadas en caso de falla en la conexión
  }
}

connectToDatabase();