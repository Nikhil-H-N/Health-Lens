const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const auth = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = file.mimetype === 'image/jpeg' || 
                     file.mimetype === 'image/jpg' || 
                     file.mimetype === 'image/png' || 
                     file.mimetype === 'application/pdf';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG) and PDF are allowed!"));
    }
  },
});

// OCR endpoint - Extract text from uploaded image or PDF
router.post("/extract", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    let text = "";

    // Handle PDF files
    if (req.file.mimetype === 'application/pdf') {
      console.log("Processing PDF file...");
      
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text;
        console.log("PDF text extracted:", text.substring(0, 200));
        
        // Check if PDF has actual text content
        if (!text || text.trim().length < 50) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ 
            error: "This PDF appears to be a scanned image with no readable text.",
            suggestion: "Please convert your PDF to JPG or PNG format and upload again."
          });
        }
        
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        fs.unlinkSync(filePath);
        return res.status(400).json({ 
          error: "Failed to read PDF. Please try uploading as a JPG or PNG image instead."
        });
      }
      
      fs.unlinkSync(filePath);
      
    } else {
      // Handle image files with OCR
      console.log("Processing image file...");
      
      let processedImagePath = `./uploads/processed-${req.file.filename}`;
      await sharp(filePath)
        .resize(3000)
        .grayscale()
        .normalize()
        .sharpen()
        .toFile(processedImagePath);

      // Perform OCR
      const {
        data: { text: ocrText },
      } = await Tesseract.recognize(processedImagePath, "eng", {
        logger: (m) => console.log(m),
      });

      text = ocrText;

      // Clean up files
      fs.unlinkSync(filePath);
      if (fs.existsSync(processedImagePath)) {
        fs.unlinkSync(processedImagePath);
      }
    }

   console.log("Extracted Text Length:", text.length);

// Extract medical data patterns
const analysisResult = parseExtractedText(text);

// Convert object values to strings for frontend compatibility
const simplifiedData = {};
for (const [key, data] of Object.entries(analysisResult.extractedValues)) {
  simplifiedData[key] = `${data.value} ${data.unit} (${data.status})`;
}

res.json({
  success: true,
  rawText: text,
  extractedData: simplifiedData,
  healthWarnings: analysisResult.healthAnalysis.warnings,
  abnormalParameters: analysisResult.healthAnalysis.abnormalParameters,
  normalParameters: analysisResult.healthAnalysis.normalParameters,
  overallStatus: analysisResult.overallStatus,
  message: "Text extracted successfully",
  fileType: req.file.mimetype === 'application/pdf' ? 'PDF' : 'Image'
});


  } catch (err) {
    console.error("OCR Error:", err);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: "Failed to extract text from file" });
  }
});

// Enhanced helper function to parse medical report text and analyze health
function parseExtractedText(text) {
  const data = {};
  const healthAnalysis = {
    warnings: [],
    normalParameters: [],
    abnormalParameters: []
  };

  const medicalParameters = {
    Hemoglobin: {
      pattern: /(?:HEMOGLOBIN|HB|HGB|Hemoglobin)\s*(?:\(.*?\))?\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [12.0, 17.5] },
      unit: "g/dL",
      warnings: {
        low: "Low hemoglobin (Anemia) - Fatigue, weakness. Eat iron-rich foods.",
        high: "High hemoglobin - May indicate dehydration or lung disease."
      }
    },
    RBC: {
      pattern: /(?:RBC|RED BLOOD CELL|Red Blood Cell)\s*(?:\(.*?\))?\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [4.2, 6.1] },
      unit: "million/mcL",
      warnings: {
        low: "Low RBC - May indicate anemia or blood loss.",
        high: "High RBC - May indicate dehydration or heart disease."
      }
    },
    WBC: {
      pattern: /(?:WBC|WHITE BLOOD CELL|White Blood Cell|Total WBC Count)\s*(?:\(.*?\))?\s*[:\s]+([0-9,]+)/i,
      normalRange: { general: [4.0, 11.0] },
      unit: "thousand/mcL",
      warnings: {
        low: "Low WBC - Weakened immune system, infection risk.",
        high: "High WBC - May indicate infection or inflammation."
      }
    },
    Neutrophils: {
      pattern: /(?:Neutrophils)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [40, 75] },
      unit: "%",
      warnings: {
        low: "Low neutrophils - Increased infection risk.",
        high: "High neutrophils - May indicate bacterial infection or stress."
      }
    },
    Lymphocytes: {
      pattern: /(?:Lymphocytes)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [20, 45] },
      unit: "%",
      warnings: {
        low: "Low lymphocytes - May indicate immune deficiency.",
        high: "High lymphocytes - May indicate viral infection or immune response."
      }
    },
    Monocytes: {
      pattern: /(?:Monocytes)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [2, 10] },
      unit: "%",
      warnings: {
        low: "Low monocytes - Generally not concerning.",
        high: "High monocytes - May indicate chronic infection or inflammation."
      }
    },
    Eosinophils: {
      pattern: /(?:Eosinophils)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [1, 6] },
      unit: "%",
      warnings: {
        low: "Low eosinophils - Generally not concerning.",
        high: "High eosinophils - May indicate allergies or parasitic infection."
      }
    },
    Platelets: {
      pattern: /(?:PLATELET|PLT|Platelets)\s*[:\s]+([0-9,]+)/i,
      normalRange: { general: [150, 400] },
      unit: "thousand/mcL",
      warnings: {
        low: "Low platelets - Increased bleeding risk.",
        high: "High platelets - Increased clotting risk."
      }
    },
    Glucose: {
      pattern: /(?:GLUCOSE|SUGAR|FBS|Glucose|Blood Sugar)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [70, 100] },
      unit: "mg/dL",
      warnings: {
        low: "Low blood sugar - Dizziness risk. Eat regularly.",
        high: "High blood sugar - Diabetes risk. Reduce sugar, exercise."
      }
    },
    Cholesterol: {
      pattern: /(?:CHOLESTEROL|CHOL|Cholesterol)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [0, 200] },
      unit: "mg/dL",
      warnings: {
        low: "Low cholesterol - Generally good.",
        high: "High cholesterol - Heart disease risk. Diet changes needed."
      }
    },
    SGPT: {
      pattern: /(?:SGPT|ALT|Alanine)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [7, 56] },
      unit: "U/L",
      warnings: {
        low: "Low SGPT - Not concerning.",
        high: "High SGPT - Possible liver damage. Avoid alcohol."
      }
    },
    Creatinine: {
      pattern: /(?:CREATININE|CREAT|Creatinine)\s*[:\s]+([0-9.]+)/i,
      normalRange: { general: [0.6, 1.3] },
      unit: "mg/dL",
      warnings: {
        low: "Low creatinine - May indicate low muscle mass.",
        high: "High creatinine - Reduced kidney function. Stay hydrated."
      }
    }
  };

  for (const [paramName, config] of Object.entries(medicalParameters)) {
    const match = text.match(config.pattern);
    
    if (match && match[1]) {
      const value = match[1].trim();
      const numericValue = parseFloat(value.replace(/,/g, ''));
      
      data[paramName] = {
        value: value,
        unit: config.unit
      };

      if (!isNaN(numericValue) && config.normalRange.general) {
        const [min, max] = config.normalRange.general;
        let status = "Normal";
        
        if (numericValue < min) {
          status = "Low";
          healthAnalysis.warnings.push(`⚠️ ${paramName}: ${config.warnings.low}`);
          healthAnalysis.abnormalParameters.push(paramName);
        } else if (numericValue > max) {
          status = "High";
          healthAnalysis.warnings.push(`⚠️ ${paramName}: ${config.warnings.high}`);
          healthAnalysis.abnormalParameters.push(paramName);
        } else {
          healthAnalysis.normalParameters.push(paramName);
        }
        
        data[paramName].status = status;
        data[paramName].normalRange = `${min}-${max} ${config.unit}`;
      }
    }
  }

  return {
    extractedValues: data,
    healthAnalysis: healthAnalysis,
    overallStatus: healthAnalysis.warnings.length === 0 ? 
      "All parameters within normal range ✅" : 
      `${healthAnalysis.warnings.length} parameter(s) need attention ⚠️`
  };
}

module.exports = router;
