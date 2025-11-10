const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Extrait le texte d'une image avec OCR
 * @param {String} imagePath - Chemin de l'image
 * @param {String} lang - Langue (défaut: 'fra' pour français)
 * @returns {Promise<Object>} - Texte extrait et confiance
 */
async function extractTextFromImage(imagePath, lang = 'fra') {
  try {
    const result = await Tesseract.recognize(imagePath, lang, {
      logger: info => console.log(info)
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words,
      lines: result.data.lines
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte:', error);
    throw error;
  }
}

/**
 * Extrait les informations d'une carte grise française
 * @param {String} imagePath - Chemin de l'image de la carte grise
 * @returns {Promise<Object>} - Données extraites de la carte grise
 */
async function extractCarteGriseData(imagePath) {
  try {
    // Extraire le texte de l'image
    const ocrResult = await extractTextFromImage(imagePath, 'fra');
    const text = ocrResult.text;

    // Patterns pour extraire les informations
    const patterns = {
      // Numéro d'immatriculation (format AA-123-BB ou 1234 AB 12)
      immatriculation: /([A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}|\d{3,4}\s?[A-Z]{2}\s?\d{2})/i,
      
      // Marque (ligne commençant par D.1)
      marque: /D\.1[:\s]*([A-Z\s]+)/i,
      
      // Modèle (ligne commençant par D.2)
      modele: /D\.2[:\s]*([A-Z0-9\s\-]+)/i,
      
      // Type (ligne commençant par D.3)
      type: /D\.3[:\s]*([A-Z0-9\s\-]+)/i,
      
      // Numéro de série/VIN (ligne commençant par E)
      vin: /E[:\s]*([A-Z0-9]{17})/i,
      
      // Date de première immatriculation (ligne commençant par B)
      dateImmatriculation: /B[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/,
      
      // Nom du titulaire (ligne commençant par C.1)
      titulaire: /C\.1[:\s]*([A-Z\s]+)/i,
      
      // Puissance fiscale (ligne commençant par P.6)
      puissanceFiscale: /P\.6[:\s]*(\d+)/,
      
      // Energie (ligne commençant par P.3)
      energie: /P\.3[:\s]*(ESSENCE|DIESEL|ELECTRIQUE|HYBRIDE)/i,
      
      // Nombre de places (ligne commençant par S.1)
      places: /S\.1[:\s]*(\d+)/
    };

    // Extraire les données
    const extractedData = {
      immatriculation: extractPattern(text, patterns.immatriculation),
      marque: extractPattern(text, patterns.marque),
      modele: extractPattern(text, patterns.modele),
      type: extractPattern(text, patterns.type),
      vin: extractPattern(text, patterns.vin),
      dateImmatriculation: extractPattern(text, patterns.dateImmatriculation),
      titulaire: extractPattern(text, patterns.titulaire),
      puissanceFiscale: extractPattern(text, patterns.puissanceFiscale),
      energie: extractPattern(text, patterns.energie),
      places: extractPattern(text, patterns.places),
      rawText: text,
      confidence: ocrResult.confidence
    };

    // Nettoyer les données
    Object.keys(extractedData).forEach(key => {
      if (typeof extractedData[key] === 'string') {
        extractedData[key] = extractedData[key].trim();
      }
    });

    return {
      success: true,
      data: extractedData,
      confidence: ocrResult.confidence,
      message: ocrResult.confidence > 70 
        ? 'Extraction réussie avec bonne confiance' 
        : 'Extraction réussie mais confiance faible - vérification recommandée'
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction des données de carte grise:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Fonction utilitaire pour extraire un pattern
 * @param {String} text - Texte source
 * @param {RegExp} pattern - Pattern regex
 * @returns {String|null} - Valeur extraite ou null
 */
function extractPattern(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : null;
}

/**
 * Extrait les informations d'un procès-verbal de contrôle technique
 * @param {String} imagePath - Chemin de l'image du PV
 * @returns {Promise<Object>} - Données extraites du PV
 */
async function extractPVData(imagePath) {
  try {
    const ocrResult = await extractTextFromImage(imagePath, 'fra');
    const text = ocrResult.text;

    const patterns = {
      numeroPV: /N°\s*PV[:\s]*([A-Z0-9\-]+)/i,
      dateControle: /Date[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/,
      immatriculation: /Immatriculation[:\s]*([A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2})/i,
      resultat: /(FAVORABLE|DÉFAVORABLE|CONTRE-VISITE)/i,
      kilometrage: /Kilométrage[:\s]*(\d+)/i
    };

    const extractedData = {
      numeroPV: extractPattern(text, patterns.numeroPV),
      dateControle: extractPattern(text, patterns.dateControle),
      immatriculation: extractPattern(text, patterns.immatriculation),
      resultat: extractPattern(text, patterns.resultat),
      kilometrage: extractPattern(text, patterns.kilometrage),
      rawText: text,
      confidence: ocrResult.confidence
    };

    return {
      success: true,
      data: extractedData,
      confidence: ocrResult.confidence
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction des données du PV:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

module.exports = {
  extractTextFromImage,
  extractCarteGriseData,
  extractPVData
};
