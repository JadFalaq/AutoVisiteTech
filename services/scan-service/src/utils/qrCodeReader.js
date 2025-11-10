const Jimp = require('jimp');
const jsQR = require('jsqr');

/**
 * Lit et décode un QR code depuis une image
 * @param {String} imagePath - Chemin vers l'image
 * @returns {Promise<Object>} - Données décodées du QR code
 */
async function readQRCodeFromImage(imagePath) {
  try {
    // Charger l'image avec Jimp
    const image = await Jimp.read(imagePath);
    
    // Convertir en format compatible avec jsQR
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };

    // Décoder le QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (!code) {
      throw new Error('Aucun QR code détecté dans l\'image');
    }

    // Tenter de parser les données JSON
    let decodedData;
    try {
      decodedData = JSON.parse(code.data);
    } catch (e) {
      // Si ce n'est pas du JSON, retourner le texte brut
      decodedData = { rawData: code.data };
    }

    return {
      success: true,
      data: decodedData,
      rawData: code.data,
      location: code.location
    };
  } catch (error) {
    console.error('Erreur lors de la lecture du QR code:', error);
    throw error;
  }
}

/**
 * Lit un QR code depuis un buffer d'image
 * @param {Buffer} imageBuffer - Buffer de l'image
 * @returns {Promise<Object>} - Données décodées
 */
async function readQRCodeFromBuffer(imageBuffer) {
  try {
    const image = await Jimp.read(imageBuffer);
    
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };

    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (!code) {
      throw new Error('Aucun QR code détecté');
    }

    let decodedData;
    try {
      decodedData = JSON.parse(code.data);
    } catch (e) {
      decodedData = { rawData: code.data };
    }

    return {
      success: true,
      data: decodedData,
      rawData: code.data
    };
  } catch (error) {
    console.error('Erreur lors de la lecture du QR code:', error);
    throw error;
  }
}

module.exports = {
  readQRCodeFromImage,
  readQRCodeFromBuffer
};
