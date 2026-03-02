// Tech Template 3: Engineering Grid
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem } from "./sectionRenderer";

export const EngineeringGrid = ({ data, sectionOrder }: { data: ResumeData; sectionOrder?: SectionOrderItem[] }) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? <p className="mb-5 text-[10.5px]" style={{ color: '#444' }}>{data.summary}</p> : null,
    experience: () => (
      <>
        <GH>EXPERIENCE</GH>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between">
              <h3 className="font-bold text-[11px]">{exp.title}</h3>
              <span className="text-[9px] font-mono" style={{ color: 'var(--resume-accent, #2563eb)' }}>{exp.startDate}–{exp.endDate}</span>
            </div>
            <p className="text-[10px] mb-1" style={{ color: '#888' }}>{exp.company} | {exp.location}</p>
            <ul className="space-y-0.5 list-disc ml-4">{exp.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </>
    ),
    education: () => (
      <>
        <GH>EDUCATION</GH>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold text-[10px]">{edu.degree}</p>
            <p className="text-[9px]" style={{ color: '#888' }}>{edu.school} · {edu.endDate}</p>
            {edu.gpa && <p className="text-[9px]" style={{ color: 'var(--resume-accent, #2563eb)' }}>GPA: {edu.gpa}</p>}
          </div>
        ))}
      </>
    ),
    skills: () => (
      <>
        <GH>TECHNICAL SKILLS</GH>
        {data.skills.map((s, i) => (
          <div key={i} className="mb-3">
            <p className="font-bold text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--resume-accent, #2563eb)' }}>{s.category}</p>
            <div className="flex flex-wrap gap-1">
              {s.items.map((item, j) => (
                <span key={j} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--resume-accent-light, #eff4ff)' }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </>
    ),
    projects: () => data.projects?.length ? (
      <>
        <GH>PROJECTS</GH>
        {data.projects.map((p, i) => (
          <div key={i} className="mb-3">
            <p className="font-bold text-[10.5px]">{p.name}{p.tech && <span className="font-normal text-[10px]" style={{ color: 'var(--resume-accent, #2563eb)' }}> [{p.tech}]</span>}</p>
            <ul className="list-disc ml-4">{p.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </>
    ) : null,
    certifications: () => data.certifications?.length ? (
      <>
        <GH>CERTIFICATIONS</GH>
        {data.certifications.map((c, i) => <p key={i} className="text-[10px] mb-0.5">✓ {c}</p>)}
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <GH>LEADERSHIP</GH>
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold">{l.role} – {l.org}</p>
            <ul className="list-disc ml-4">{l.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <GH>{sec.title.toUpperCase()}</GH>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2">
            {item.subtitle && <p className="font-bold text-[10.5px]">{item.subtitle}</p>}
            {item.description && <p>{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="list-disc ml-4">{b}</li>)}
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="font-dm p-8 text-[11px]" style={{ color: '#1a1a1a' }}>
      <div className="grid grid-cols-[1fr_auto] gap-4 mb-5 pb-4" style={{ borderBottom: `3px solid var(--resume-accent, #2563eb)` }}>
        <div>
          <h1 className="text-xl font-bold">{data.header.name}</h1>
          <p className="text-[10px] mt-0.5" style={{ color: '#666' }}>{data.header.title}</p>
        </div>
        <div className="text-right text-[10px]" style={{ color: '#555' }}>
          <p>{data.header.email}</p>
          <p>{data.header.phone}</p>
          {data.header.linkedin && <p>{data.header.linkedin}</p>}
        </div>
      </div>
      {renderOrderedSections(sectionOrder, sectionMap)}
    </div>
  );
};

const GH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 mt-3 pb-1" style={{ borderBottom: `2px solid var(--resume-accent, #2563eb)` }}>{children}</h2>
);
