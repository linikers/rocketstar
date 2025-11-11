import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// Cache the Mongoose connection
let cachedMongoose: typeof mongoose | null = null;

async function dbConnect() {
  if (cachedMongoose) {
    return cachedMongoose;
  }

  const opts = {
    bufferCommands: false, // Desabilita o buffering do Mongoose para melhor tratamento de erros
    // Adicione outras opções de conexão do Mongoose aqui, se necessário
    // useNewUrlParser: true, // Deprecated in Mongoose 6+
    // useUnifiedTopology: true, // Deprecated in Mongoose 6+
  };

  if (process.env.NODE_ENV === 'development') {
    // No modo de desenvolvimento, use uma variável global para que o valor seja preservado
    // entre as recargas de módulo causadas pelo HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof global & {
      _mongooseClientPromise?: Promise<typeof mongoose>;
    };

    if (!globalWithMongo._mongooseClientPromise) {
      globalWithMongo._mongooseClientPromise = mongoose.connect(uri, opts);
    }
    cachedMongoose = await globalWithMongo._mongooseClientPromise;
  } else {
    // No modo de produção, é melhor não usar uma variável global.
    cachedMongoose = await mongoose.connect(uri, opts);
  }

  return cachedMongoose;
}

export default dbConnect;
