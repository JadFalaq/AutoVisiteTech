from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import base64
import json
from datetime import datetime

app = FastAPI(title="Parser Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ParseRequest(BaseModel):
    file_data: str
    file_type: Optional[str] = "carte_grise"

class ParseResponse(BaseModel):
    success: bool
    data: dict
    message: str

@app.get("/health")
async def health():
    return {
        "status": "OK",
        "service": "parser-service",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/parser")
async def parser_info():
    return {
        "message": "Parser service is running",
        "version": "1.0.0",
        "supported_documents": ["carte_grise", "permis_conduire", "facture"]
    }

@app.post("/api/parser/carte-grise", response_model=ParseResponse)
async def parse_carte_grise(request: ParseRequest):
    """
    Parse a carte grise (vehicle registration) document
    Simulates OCR and data extraction
    """
    try:
        # Simulate parsing logic
        # In production, use OCR libraries like Tesseract, Google Vision API, etc.
        
        parsed_data = {
            "immatriculation": f"AB-{str(hash(request.file_data))[:3]}-CD",
            "marque": "Renault",
            "modele": "Clio",
            "annee": 2020,
            "couleur": "Gris",
            "numero_serie": f"VF1{str(hash(request.file_data))[:10]}",
            "date_premiere_immatriculation": "2020-05-15",
            "puissance_fiscale": 5,
            "energie": "Essence",
            "proprietaire": {
                "nom": "DUPONT",
                "prenom": "Jean",
                "adresse": "123 Rue de Paris, 75001 Paris"
            }
        }
        
        return ParseResponse(
            success=True,
            data=parsed_data,
            message="Carte grise analysée avec succès"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du parsing: {str(e)}")

@app.post("/api/parser/permis-conduire")
async def parse_permis_conduire(request: ParseRequest):
    """
    Parse a permis de conduire (driver's license) document
    """
    try:
        parsed_data = {
            "numero_permis": f"PER{str(hash(request.file_data))[:10]}",
            "nom": "MARTIN",
            "prenom": "Sophie",
            "date_naissance": "1990-03-15",
            "lieu_naissance": "Paris",
            "date_delivrance": "2010-06-20",
            "date_expiration": "2030-06-20",
            "categories": ["B", "A1"],
            "points": 12
        }
        
        return {
            "success": True,
            "data": parsed_data,
            "message": "Permis de conduire analysé avec succès"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du parsing: {str(e)}")

@app.post("/api/parser/upload")
async def upload_and_parse(file: UploadFile = File(...)):
    """
    Upload a file and parse it
    """
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Simulate parsing based on file type
        if file.content_type and "image" in file.content_type:
            # Simulate OCR processing
            parsed_data = {
                "file_name": file.filename,
                "file_size": file_size,
                "file_type": file.content_type,
                "extracted_text": "Simulated OCR text extraction",
                "confidence": 0.95
            }
        else:
            parsed_data = {
                "file_name": file.filename,
                "file_size": file_size,
                "file_type": file.content_type,
                "message": "File uploaded successfully"
            }
        
        return {
            "success": True,
            "data": parsed_data,
            "message": "Fichier analysé avec succès"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

@app.post("/api/parser/extract-text")
async def extract_text(request: ParseRequest):
    """
    Extract text from an image using OCR
    """
    try:
        # Simulate OCR text extraction
        extracted_text = """
        CERTIFICAT D'IMMATRICULATION
        Numéro: AB-123-CD
        Marque: RENAULT
        Modèle: CLIO
        Année: 2020
        """
        
        return {
            "success": True,
            "data": {
                "text": extracted_text.strip(),
                "confidence": 0.92,
                "language": "fr"
            },
            "message": "Texte extrait avec succès"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'extraction: {str(e)}")

@app.get("/api/parser/stats")
async def get_stats():
    """
    Get parser service statistics
    """
    return {
        "total_parsed": 1234,
        "success_rate": 0.96,
        "average_processing_time": "2.3s",
        "supported_formats": ["jpg", "png", "pdf"],
        "uptime": "99.9%"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
