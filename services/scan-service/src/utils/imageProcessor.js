const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Redimensionne et optimise une image
 * @param {String} inputPath - Chemin de l'image source
 * @param {String} outputPath - Chemin de l'image de sortie
 * @param {Object} options - Options de redimensionnement
 * @returns {Promise<Object>} - Informations sur l'image traitée
 */
async function resizeAndOptimizeImage(inputPath, outputPath, options = {}) {
  try {
    const {
      width = 1200,
      height = null,
      quality = 85,
      format = 'jpeg'
    } = options;

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Redimensionner l'image
    let resized = image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });

    // Appliquer le format et la qualité
    if (format === 'jpeg') {
      resized = resized.jpeg({ quality });
    } else if (format === 'png') {
      resized = resized.png({ quality });
    } else if (format === 'webp') {
      resized = resized.webp({ quality });
    }

    // Sauvegarder l'image
    await resized.toFile(outputPath);

    // Obtenir les informations du fichier de sortie
    const stats = fs.statSync(outputPath);

    return {
      success: true,
      originalSize: metadata.size,
      newSize: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      outputPath
    };
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    throw error;
  }
}

/**
 * Crée une miniature d'une image
 * @param {String} inputPath - Chemin de l'image source
 * @param {String} outputPath - Chemin de la miniature
 * @param {Number} size - Taille de la miniature (défaut: 200px)
 * @returns {Promise<Object>} - Informations sur la miniature
 */
async function createThumbnail(inputPath, outputPath, size = 200) {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);

    return {
      success: true,
      thumbnailPath: outputPath,
      size: stats.size
    };
  } catch (error) {
    console.error('Erreur lors de la création de la miniature:', error);
    throw error;
  }
}

/**
 * Améliore la qualité d'une image pour l'OCR
 * @param {String} inputPath - Chemin de l'image source
 * @param {String} outputPath - Chemin de l'image améliorée
 * @returns {Promise<String>} - Chemin de l'image améliorée
 */
async function enhanceForOCR(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .greyscale() // Convertir en niveaux de gris
      .normalize() // Normaliser les niveaux
      .sharpen() // Augmenter la netteté
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Erreur lors de l\'amélioration de l\'image pour OCR:', error);
    throw error;
  }
}

/**
 * Vérifie la qualité d'une image
 * @param {String} imagePath - Chemin de l'image
 * @returns {Promise<Object>} - Informations sur la qualité
 */
async function checkImageQuality(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await sharp(imagePath).stats();

    // Critères de qualité
    const isHighResolution = metadata.width >= 800 && metadata.height >= 600;
    const isSharp = stats.sharpness > 0.5; // Valeur approximative
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      isHighResolution,
      quality: isHighResolution && isSharp ? 'good' : 'poor',
      recommendations: []
    };
  } catch (error) {
    console.error('Erreur lors de la vérification de la qualité:', error);
    throw error;
  }
}

module.exports = {
  resizeAndOptimizeImage,
  createThumbnail,
  enhanceForOCR,
  checkImageQuality
};
