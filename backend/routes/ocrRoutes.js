const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const auth = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const pdfPoppler = require("pdf-poppler");

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
    const reportType = req.body.reportType; // "Blood" or "Urine"

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    let text = "";

    // Handle PDF files
    // Handle PDF files
    if (req.file.mimetype === 'application/pdf') {
      console.log("Processing PDF file...");

      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text || "";

        console.log("PDF text extracted (length):", text.length);

        // 🟡 CASE 1: Text-based PDF → use directly
        if (text.trim().length > 50) {
          console.log("Text-based PDF detected");
        }
        // 🔴 CASE 2: Scanned PDF → OCR fallback
        else {
          console.log("Scanned PDF detected → running OCR fallback");

          console.log("Scanned PDF detected → converting via Poppler");

          const outputDir = "./uploads/pdf-images";
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
          }

          const prefix = `pdf_${Date.now()}`;

          await pdfPoppler.convert(filePath, {
            format: "png",
            out_dir: outputDir,
            out_prefix: prefix,
            page: 1 // first page only (for now)
          });

          const imagePath = `${outputDir}/${prefix}-1.png`;

          const {
            data: { text: ocrText }
          } = await Tesseract.recognize(imagePath, "eng", {
            logger: m => console.log(m)
          });

          text = ocrText;

          // cleanup
          fs.unlinkSync(imagePath);

          text = ocrText;

          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }

      } catch (pdfError) {
        console.error("PDF parsing/OCR error:", pdfError);
        fs.unlinkSync(filePath);
        return res.status(400).json({
          error: "Failed to process PDF file"
        });
      }

      fs.unlinkSync(filePath);

    } else {
      // Handle image files with OCR (UNCHANGED)
      console.log("Processing image file...");

      let processedImagePath = `./uploads/processed-${req.file.filename}`;
      await sharp(filePath)
        .resize(3000)
        .grayscale()
        .normalize()
        .sharpen()
        .toFile(processedImagePath);

      const {
        data: { text: ocrText },
      } = await Tesseract.recognize(processedImagePath, "eng", {
        logger: (m) => console.log(m),
      });

      text = ocrText;

      fs.unlinkSync(filePath);
      if (fs.existsSync(processedImagePath)) {
        fs.unlinkSync(processedImagePath);
      }
    }

    console.log("Extracted Text Length:", text.length);
    // ⚠️ PDF OCR quality check
    if (req.file.mimetype === "application/pdf" && text.length < 400) {
      console.warn("Low-quality PDF OCR detected");

      return res.json({
        success: true,
        warning:
          "Some values could not be read from this PDF. For best accuracy, please upload a clear IMAGE of the report.",
        rawText: text,
        extractedData: {},
        healthWarnings: [],
        abnormalParameters: [],
        normalParameters: [],
        overallStatus: "Partial data extracted ⚠️",
        fileType: "PDF"
      });
    }


    // Extract medical data patterns
    let analysisResult;

    const cleanedText = cleanOcrText(text);

    if (reportType === "Urine") {
      analysisResult = parseUrineReport(cleanedText);
    } else {
      analysisResult = parseExtractedText(cleanedText);
    }

    // Convert object values to strings for frontend compatibility
    const simplifiedData = {};
    for (const [key, data] of Object.entries(analysisResult.extractedValues)) {
      simplifiedData[key] = `${data.value} ${data.unit} (${data.status})`;
    }
    const fileUrl = `/uploads/${path.basename(filePath)}`;
    res.json({
      success: true,
      fileUrl,
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
      pattern: /Hemoglobin\s+([0-9.]+)/i,
      normalRange: { general: [12.0, 17.5] },
      unit: "g/dL",
      warnings: {
        low: "Low hemoglobin (Anemia) - Fatigue, weakness. Eat iron-rich foods.",
        high: "High hemoglobin - May indicate dehydration or lung disease."
      }
    },

    RBC: {
      pattern: /RBC.*?\s([0-9.]+)/i,
      normalRange: { general: [4.2, 6.1] },
      unit: "million/mcL",
      warnings: {
        low: "Low RBC - May indicate anemia or blood loss.",
        high: "High RBC - May indicate dehydration or heart disease."
      }
    },

    WBC: {
      pattern: /(?:WBC|TOTAL COUNT).*?\s([0-9.]+)/i,
      normalRange: { general: [4.0, 11.0] },
      unit: "thousand/mcL",
      warnings: {
        low: "Low WBC - Weakened immune system, infection risk.",
        high: "High WBC - May indicate infection or inflammation."
      }
    },

    Neutrophils: {
      pattern: /Neutrophils.*?\s([0-9.]+)\s*%/i,
      normalRange: { general: [40, 75] },
      unit: "%",
      warnings: {
        low: "Low neutrophils - Increased infection risk.",
        high: "High neutrophils - May indicate bacterial infection or stress."
      }
    },

    Lymphocytes: {
      pattern: /Lymphocytes.*?\s([0-9.]+)\s*%/i,
      normalRange: { general: [20, 45] },
      unit: "%",
      warnings: {
        low: "Low lymphocytes - May indicate immune deficiency.",
        high: "High lymphocytes - May indicate viral infection or immune response."
      }
    },

    Monocytes: {
      pattern: /Monocytes.*?\s([0-9.]+)\s*%/i,
      normalRange: { general: [2, 10] },
      unit: "%",
      warnings: {
        low: "Low monocytes - Generally not concerning.",
        high: "High monocytes - May indicate chronic infection or inflammation."
      }
    },

    Eosinophils: {
      pattern: /Eosinophils.*?\s([0-9.]+)\s*%/i,
      normalRange: { general: [1, 6] },
      unit: "%",
      warnings: {
        low: "Low eosinophils - Generally not concerning.",
        high: "High eosinophils - May indicate allergies or parasitic infection."
      }
    },

    Platelets: {
      pattern: /Platelet.*?\s([0-9,]+)/i,
      normalRange: { general: [150, 400] },
      unit: "thousand/mcL",
      warnings: {
        low: "Low platelets - Increased bleeding risk.",
        high: "High platelets - Increased clotting risk."
      }
    }
  };


  for (const [paramName, config] of Object.entries(medicalParameters)) {
    const match = text.match(config.pattern);

    if (match && match[1]) {
      const rawValue = match[1].trim();
      let numericValue = parseFloat(rawValue.replace(/,/g, ''));
      // 🛡 OCR SAFETY: skip invalid values like "." or empty
      if (isNaN(numericValue)) {
        continue; // skip this parameter safely
      }
      let displayValue = rawValue;

      // 🔧 OCR FIX for % values (e.g., 810 → 8.10)
      if (config.unit === "%" && numericValue > 100) {
        numericValue = numericValue / 100;
        displayValue = numericValue.toFixed(2);
      }

      data[paramName] = {
        value: displayValue,   // ✅ fixed value shown in UI
        unit: config.unit
      };

      if (!isNaN(numericValue) && config.normalRange.general) {
        const [min, max] = config.normalRange.general;
        let status = "Normal";

        let severity = "Normal";

        if (numericValue < min) {
          status = "Low";

          const deviation = ((min - numericValue) / min) * 100;
          severity = deviation > 20 ? "Severe" : "Mild";

          if (severity === "Severe") {
            healthAnalysis.warnings.push(`⚠️ ${paramName}: ${config.warnings.low}`);
          }

          healthAnalysis.abnormalParameters.push(paramName);
        }
        else if (numericValue > max) {
          status = "High";

          const deviation = ((numericValue - max) / max) * 100;
          severity = deviation > 20 ? "Severe" : "Mild";

          if (severity === "Severe") {
            healthAnalysis.warnings.push(`⚠️ ${paramName}: ${config.warnings.high}`);
          }

          healthAnalysis.abnormalParameters.push(paramName);
        }
        else {
          healthAnalysis.normalParameters.push(paramName);
        }
        data[paramName].severity = severity;
        data[paramName].status = status;
        data[paramName].normalRange = `${min}-${max} ${config.unit}`;
      }
    }
  }
  const abnormalCount = healthAnalysis.abnormalParameters.length;

  const overallStatus =
    abnormalCount === 0
      ? "All parameters within normal range ✅"
      : `${abnormalCount} parameter(s) outside normal range ⚠️`;

  return {
    extractedValues: data,
    healthAnalysis: healthAnalysis,
    overallStatus: overallStatus
  };

}

function cleanOcrText(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;

      // Remove very long lines (usually explanations)
      if (line.length > 80) return false;

      // Remove paragraph-like lines
      if (line.split(" ").length > 15) return false;

      return true;
    })
    .join("\n");
}


function parseUrineReport(text) {
  const data = {};
  const healthAnalysis = {
    warnings: [],
    normalParameters: [],
    abnormalParameters: []
  };

  const urineParameters = {
    Color: {
      pattern: /(?:COLOR|Colour)\s*[:\s]+([A-Za-z]+)/i,
      normal: ["Yellow", "Straw", "Light Yellow", "Pale", "Yellowish", "Pale Yellow"],
      warning: "Abnormal urine color may indicate dehydration or infection."
    },
    Appearance: {
      pattern: /(?:APPEARANCE|Clarity)\s*[:\s]+([A-Za-z]+)/i,
      normal: ["Clear"],
      warning: "Cloudy urine may indicate infection."
    },
    pH: {
      pattern: /(?:pH)\s*[:\s]+([0-9.]+)/i,
      normalRange: [4.5, 8.0],
      warning: "Abnormal urine pH may indicate kidney or metabolic issues."
    },
    Protein: {
      pattern: /(?:PROTEIN|ALBUMIN)\s*[:\s]+([A-Za-z+]+)/i,
      normal: ["Negative", "Nil", "Absent"], // ✅ Absent is NORMAL
      abnormal: ["Trace", "+", "++", "+++", "Positive", "Elevated"],
      warning: "Protein in urine may indicate kidney problems."
    },
    Sugar: {
      pattern: /(?:GLUCOSE|SUGAR)\s*[:\s]+([A-Za-z+]+)/i,
      normal: ["Negative", "Nil", "Absent"], // ✅ ADD Absent
      warning: "Sugar in urine may indicate diabetes."
    }
  };

  for (const [param, config] of Object.entries(urineParameters)) {
    const match = text.match(config.pattern);

    if (match && match[1]) {
      const value = match[1].trim();
      data[param] = {
        value: value,
        unit: "",
        status: "Unknown"
      };

      if (config.normalRange) {
        let num = parseFloat(value);
        let displayValue = value;

        // 🔧 OCR FIX: pH like "55" → "5.5"
        if (param === "pH" && num > 14) {
          displayValue =
            value.length === 2
              ? `${value[0]}.${value[1]}`
              : `${value[0]}.${value.slice(1)}`;

          num = parseFloat(displayValue);
        }

        data[param].value = displayValue;

        if (isNaN(num)) {
          data[param].status = "Unknown";
          return;
        }

        if (num < config.normalRange[0] || num > config.normalRange[1]) {
          data[param].status = "Abnormal";
          healthAnalysis.warnings.push(`⚠️ ${param}: ${config.warning}`);
          healthAnalysis.abnormalParameters.push(param);
        } else {
          data[param].status = "Normal";
          healthAnalysis.normalParameters.push(param);
        }
      }

      else if (config.normal) {
        const val = value.toLowerCase();

        const isNormal = config.normal
          .map(v => v.toLowerCase())
          .includes(val);

        const isAbnormal = config.abnormal
          ? config.abnormal.map(v => v.toLowerCase()).includes(val)
          : false;

        if (isAbnormal) {
          data[param].status = "Abnormal";
          healthAnalysis.warnings.push(`⚠️ ${param}: ${config.warning}`);
          healthAnalysis.abnormalParameters.push(param);
        } else if (isNormal) {
          data[param].status = "Normal";
          healthAnalysis.normalParameters.push(param);
        } else {
          data[param].status = "Unknown"; // OCR unclear → do NOT assume abnormal
        }
      }

    }
  }

  return {
    extractedValues: data,
    healthAnalysis,
    overallStatus:
      healthAnalysis.warnings.length === 0
        ? "Urine report normal ✅"
        : `${healthAnalysis.warnings.length} abnormal finding(s) ⚠️`
  };
}


module.exports = router;
