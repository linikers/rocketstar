const mongoose = require('mongoose');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rocketuser:r2r8x4r5@cluster0.vth613o.mongodb.net/rocketstarDB?appName=Cluster0';

async function seed() {
  console.log('🔌 Conectando ao MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('✅ Conectado!');

  const db = mongoose.connection.db;

  // 1. Criar coleção users com admin
  const usersCol = db.collection('users');
  const existingAdmin = await usersCol.findOne({ email: 'admin@rocketstar.com' });

  if (!existingAdmin) {
    // Senha com hash simples (SHA256) - em produção usar bcrypt
    const senhaHash = crypto.createHash('sha256').update('admin1234').digest('hex');

    await usersCol.insertOne({
      email: 'admin@rocketstar.com',
      nome: 'Administrador',
      senha: senhaHash,
      role: 'admin',
      ativo: true,
      criadoEm: new Date(),
    });
    console.log('✅ Admin criado: admin@rocketstar.com / admin1234');
  } else {
    console.log('ℹ️ Admin ja existe, pulando...');
  }

  // 2. Listar collections existentes
  const collections = await db.listCollections().toArray();
  console.log('\n📦 Collections no banco:');
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`   - ${col.name}: ${count} documentos`);
  }

  console.log('\n🎉 Seed concluido!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
