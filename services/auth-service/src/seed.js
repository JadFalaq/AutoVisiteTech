const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'auth-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'auth_db',
  user: process.env.DB_USER || 'auth_user',
  password: process.env.DB_PASSWORD || 'auth_password',
});

async function seed() {
  try {
    console.log('🌱 Démarrage du seed...');

    // Créer la table users si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Table users créée');

    // Hasher les mots de passe
    const clientPassword = await bcrypt.hash('client123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const testPassword = await bcrypt.hash('test123', 10);

    // Insérer les comptes de test
    const users = [
      {
        email: 'client@test.com',
        password: clientPassword,
        nom: 'Alami',
        prenom: 'Mohammed',
        telephone: '0612345678',
        role: 'client'
      },
      {
        email: 'admin@autovisitetech.com',
        password: adminPassword,
        nom: 'Bennani',
        prenom: 'Fatima',
        telephone: '0698765432',
        role: 'admin'
      },
      {
        email: 'test1@gmail.com',
        password: testPassword,
        nom: 'Idrissi',
        prenom: 'Karim',
        telephone: '0656789012',
        role: 'client'
      },
      {
        email: 'test2@gmail.com',
        password: testPassword,
        nom: 'Tazi',
        prenom: 'Amina',
        telephone: '0645678901',
        role: 'client'
      }
    ];

    for (const user of users) {
      try {
        await pool.query(
          `INSERT INTO users (email, password, nom, prenom, telephone, role) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO NOTHING`,
          [user.email, user.password, user.nom, user.prenom, user.telephone, user.role]
        );
        console.log(`✅ Utilisateur créé: ${user.email} (${user.role})`);
      } catch (error) {
        console.log(`⚠️  Utilisateur existe déjà: ${user.email}`);
      }
    }

    console.log('\n🎉 Seed terminé avec succès !');
    console.log('\n📋 Comptes disponibles:');
    console.log('👤 Client: client@test.com / client123');
    console.log('👨‍💼 Admin: admin@autovisitetech.com / admin123');
    console.log('🧪 Test1: test1@gmail.com / test123');
    console.log('🧪 Test2: test2@gmail.com / test123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seed();
