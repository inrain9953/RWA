import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: { bodyParser: false },
};

/* ---------------- SAFE TEXT HELPER ---------------- */
const safeText = (value) => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value[0] || "";
  return String(value);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    /* ---------------- PARSE FORM DATA ---------------- */
    const form = formidable({ multiples: true });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const data = fields;

    /* ---------------- APPLICANT PDF ---------------- */
    const mainPath = path.join(process.cwd(), "public/template.pdf");
    const mainBytes = fs.readFileSync(mainPath);
    const mainDoc = await PDFDocument.load(mainBytes);
    const mainPage = mainDoc.getPages()[0];

    /* -------- Embed Image -------- */
    if (files.photo) {
      const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;

      const imageBytes = fs.readFileSync(photo.filepath);

      let embeddedImage;
      if (photo.mimetype === "image/png") {
        embeddedImage = await mainDoc.embedPng(imageBytes);
      } else {
        embeddedImage = await mainDoc.embedJpg(imageBytes);
      }

      // Resize (passport size)
      const PASSPORT_WIDTH = 95;
      const PASSPORT_HEIGHT = 120;
      const scaled = embeddedImage.scale(0.25);

      mainPage.drawImage(embeddedImage, {
        x: 430, // adjust horizontally
        y: 482, // adjust vertically
        width: PASSPORT_WIDTH,
        height: PASSPORT_HEIGHT,
      });
    }

    const fontSize = 10;

    const COL = { value: 225 };
    const ROW = {
      name: 345,
      father: 315,
      address: 285,
      mobile: 225,
      dob: 195,
      qualification: 165,
      occupation: 135,
      email: 105,
      blood: 75,
    };

    mainPage.drawText(safeText(data.name), {
      x: COL.value,
      y: ROW.name,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.fatherName), {
      x: COL.value,
      y: ROW.father,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.address), {
      x: COL.value,
      y: ROW.address,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.mobile), {
      x: COL.value,
      y: ROW.mobile,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.dob), {
      x: COL.value,
      y: ROW.dob,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.qualification), {
      x: COL.value,
      y: ROW.qualification,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.occupation), {
      x: COL.value,
      y: ROW.occupation,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.email), {
      x: COL.value,
      y: ROW.email,
      size: fontSize,
    });
    mainPage.drawText(safeText(data.bloodGroup), {
      x: COL.value,
      y: ROW.blood,
      size: fontSize,
    });

    /* ---------------- FAMILY PDF ---------------- */
    const familyPath = path.join(process.cwd(), "public/familyTemplate.pdf");
    const familyBytes = fs.readFileSync(familyPath);
    const familyDoc = await PDFDocument.load(familyBytes);
    const familyPage = familyDoc.getPages()[0];

    let familyMembers = [];
    if (data.family) {
      try {
        familyMembers = JSON.parse(data.family);
      } catch {
        familyMembers = [];
      }
    }

    const F_COL = {
      name: 90,
      dob: 220,
      relation: 305,
      occupation: 355,
      qualification: 425,
      bloodGroup: 495,
    };

    const F_START_Y = 715;
    const F_ROW_GAP = 20;

    familyMembers.forEach((m, i) => {
      const y = F_START_Y - i * F_ROW_GAP;
      if (y < 80) return;

      familyPage.drawText(safeText(m.name), {
        x: F_COL.name,
        y,
        size: fontSize,
      });
      familyPage.drawText(safeText(m.dob), { x: F_COL.dob, y, size: fontSize });
      familyPage.drawText(safeText(m.relation), {
        x: F_COL.relation,
        y,
        size: fontSize,
      });
      familyPage.drawText(safeText(m.occupation), {
        x: F_COL.occupation,
        y,
        size: fontSize,
      });
      familyPage.drawText(safeText(m.qualification), {
        x: F_COL.qualification,
        y,
        size: fontSize,
      });
      familyPage.drawText(safeText(m.bloodGroup), {
        x: F_COL.bloodGroup,
        y,
        size: fontSize,
      });
    });

    /* ---------------- MERGE PDFs ---------------- */
    const finalDoc = await PDFDocument.create();

    const [mainCopied] = await finalDoc.copyPages(mainDoc, [0]);
    finalDoc.addPage(mainCopied);

    const [familyCopied] = await finalDoc.copyPages(familyDoc, [0]);
    finalDoc.addPage(familyCopied);

    const finalBytes = await finalDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=membership.pdf");
    return res.status(200).send(Buffer.from(finalBytes));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "PDF generation failed" });
  }
}
