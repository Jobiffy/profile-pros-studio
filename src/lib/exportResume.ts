import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "@/types/resume";

export async function exportToPDF(elementId: string, fileName = "resume.pdf") {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(fileName);
}

export async function exportToDOCX(data: ResumeData, fileName = "resume.docx") {
  const children: Paragraph[] = [];

  // Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.header.name, bold: true, size: 32, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: data.header.title, size: 22, color: "666666", font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: [data.header.email, data.header.phone, data.header.location, data.header.linkedin].filter(Boolean).join("  •  "), size: 18, color: "888888", font: "Calibri" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
    })
  );

  // Summary
  if (data.summary) {
    children.push(sectionHeading("PROFESSIONAL SUMMARY"));
    children.push(new Paragraph({
      children: [new TextRun({ text: data.summary, size: 20, font: "Calibri" })],
      spacing: { after: 200 },
    }));
  }

  // Experience
  if (data.experience.length > 0) {
    children.push(sectionHeading("EXPERIENCE"));
    for (const exp of data.experience) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: exp.title, bold: true, size: 21, font: "Calibri" }),
          new TextRun({ text: ` | ${exp.company}, ${exp.location}`, size: 20, color: "555555", font: "Calibri" }),
        ],
        spacing: { before: 120, after: 40 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${exp.startDate} – ${exp.endDate}`, size: 18, color: "888888", italics: true, font: "Calibri" })],
        spacing: { after: 60 },
      }));
      for (const bullet of exp.bullets) {
        children.push(new Paragraph({
          children: [new TextRun({ text: bullet, size: 20, font: "Calibri" })],
          bullet: { level: 0 },
          spacing: { after: 30 },
        }));
      }
    }
  }

  // Education
  if (data.education.length > 0) {
    children.push(sectionHeading("EDUCATION"));
    for (const edu of data.education) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: edu.degree, bold: true, size: 21, font: "Calibri" }),
          new TextRun({ text: ` – ${edu.school}, ${edu.location}`, size: 20, color: "555555", font: "Calibri" }),
          ...(edu.gpa ? [new TextRun({ text: ` (GPA: ${edu.gpa})`, size: 18, color: "888888", font: "Calibri" })] : []),
        ],
        spacing: { before: 80, after: 40 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${edu.startDate} – ${edu.endDate}`, size: 18, color: "888888", italics: true, font: "Calibri" })],
        spacing: { after: 80 },
      }));
    }
  }

  // Skills
  if (data.skills.length > 0) {
    children.push(sectionHeading("SKILLS"));
    for (const s of data.skills) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${s.category}: `, bold: true, size: 20, font: "Calibri" }),
          new TextRun({ text: s.items.join(", "), size: 20, font: "Calibri" }),
        ],
        spacing: { after: 40 },
      }));
    }
  }

  // Projects
  if (data.projects?.length) {
    children.push(sectionHeading("PROJECTS"));
    for (const p of data.projects) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: p.name, bold: true, size: 21, font: "Calibri" }),
          ...(p.tech ? [new TextRun({ text: ` (${p.tech})`, size: 18, color: "888888", font: "Calibri" })] : []),
        ],
        spacing: { before: 80, after: 40 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: p.description, size: 20, color: "555555", font: "Calibri" })],
        spacing: { after: 40 },
      }));
      for (const b of p.bullets) {
        children.push(new Paragraph({
          children: [new TextRun({ text: b, size: 20, font: "Calibri" })],
          bullet: { level: 0 },
          spacing: { after: 30 },
        }));
      }
    }
  }

  // Certifications
  if (data.certifications?.length) {
    children.push(sectionHeading("CERTIFICATIONS"));
    for (const c of data.certifications) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${c}`, size: 20, font: "Calibri" })],
        spacing: { after: 30 },
      }));
    }
  }

  // Leadership
  if (data.leadership?.length) {
    children.push(sectionHeading("LEADERSHIP"));
    for (const l of data.leadership) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${l.role}, ${l.org}`, bold: true, size: 21, font: "Calibri" }),
          new TextRun({ text: ` – ${l.date}`, size: 18, color: "888888", font: "Calibri" }),
        ],
        spacing: { before: 80, after: 40 },
      }));
      for (const b of l.bullets) {
        children.push(new Paragraph({
          children: [new TextRun({ text: b, size: 20, font: "Calibri" })],
          bullet: { level: 0 },
          spacing: { after: 30 },
        }));
      }
    }
  }

  // Custom sections
  if (data.customSections?.length) {
    for (const sec of data.customSections) {
      children.push(sectionHeading(sec.title.toUpperCase()));
      for (const item of sec.items) {
        if (item.subtitle) {
          children.push(new Paragraph({
            children: [new TextRun({ text: item.subtitle, bold: true, size: 21, font: "Calibri" })],
            spacing: { before: 80, after: 40 },
          }));
        }
        if (item.description) {
          children.push(new Paragraph({
            children: [new TextRun({ text: item.description, size: 20, font: "Calibri" })],
            spacing: { after: 40 },
          }));
        }
        for (const b of item.bullets || []) {
          children.push(new Paragraph({
            children: [new TextRun({ text: b, size: 20, font: "Calibri" })],
            bullet: { level: 0 },
            spacing: { after: 30 },
          }));
        }
      }
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: "Calibri", color: "333333" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
  });
}
