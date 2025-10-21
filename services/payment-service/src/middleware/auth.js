const jwt = require('jsonwebtoken');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_in_production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    
    req.user = user;
    next();
  });
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
const checkOwnership = (req, res, next) => {
  const { user_id } = req.params;
  
  if (req.user.id != user_id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  checkOwnership
};
