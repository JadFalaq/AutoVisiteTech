const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'auth_db',
  user: process.env.DB_USER || 'auth_user',
  password: process.env.DB_PASSWORD || 'auth_password',
});

async function listUsers() {
  try {
    console.log('📋 Liste des utilisateurs dans la base de données:\n');
    
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        nom, 
        prenom, 
        telephone, 
        role, 
        created_at,
        LEFT(password, 20) || '...' as password_hash
      FROM users 
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données.\n');
    } else {
      console.log(`✅ ${result.rows.length} utilisateur(s) trouvé(s):\n`);
      
      result.rows.forEach((user, index) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`👤 Utilisateur #${index + 1}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`ID:           ${user.id}`);
        console.log(`Email:        ${user.email}`);
        console.log(`Nom:          ${user.nom || 'N/A'}`);
        console.log(`Prénom:       ${user.prenom || 'N/A'}`);
        console.log(`Téléphone:    ${user.telephone || 'N/A'}`);
        console.log(`Rôle:         ${user.role}`);
        console.log(`Créé le:      ${new Date(user.created_at).toLocaleString('fr-FR')}`);
        console.log(`Password:     ${user.password_hash} (hashé)`);
        console.log('');
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

listUsers();
