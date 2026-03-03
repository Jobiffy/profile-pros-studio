// Tech Template 4: Data Science
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem, HighlightProps } from "./sectionRenderer";

export const DataScience = ({ data, sectionOrder, changedFields, showChanges }: { data: ResumeData; sectionOrder?: SectionOrderItem[] } & HighlightProps) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? <p className="mb-4 text-center" style={{ color: '#444' }}>{data.summary}</p> : null,
    skills: () => (
      <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded" style={{ background: 'var(--resume-accent-light, #f0fdf4)' }}>
        {data.skills.map((s, i) => (
          <div key={i}>
            <p className="font-bold text-[9px] uppercase mb-1" style={{ color: 'var(--resume-accent, #059669)' }}>{s.category}</p>
            <div className="flex flex-wrap gap-1">
              {s.items.map((item, j) => (
                <span key={j} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--resume-accent-light, #dcfce7)' }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    experience: () => (
      <>
        <DH>Experience</DH>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-xs">{exp.title} <span style={{ color: 'var(--resume-accent, #059669)' }}>@ {exp.company}</span></h3>
              <span className="text-[10px]" style={{ color: '#999' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <ul className="mt-1 space-y-0.5">
              {exp.bullets.map((b, j) => (
                <li key={j} className="flex gap-1.5"><span style={{ color: 'var(--resume-accent, #059669)' }}>▪</span><span>{b}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </>
    ),
    education: () => (
      <>
        <DH>Education</DH>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold text-[10.5px]">{edu.degree}</p>
            <p className="text-[10px]" style={{ color: '#666' }}>{edu.school} · {edu.endDate}{edu.gpa && ` · GPA: ${edu.gpa}`}</p>
          </div>
        ))}
      </>
    ),
    projects: () => data.projects?.length ? (
      <>
        <DH>Key Projects</DH>
        {data.projects.map((p, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold text-[10.5px]">{p.name}</p>
            <p className="text-[9px]" style={{ color: 'var(--resume-accent, #059669)' }}>{p.tech}</p>
          </div>
        ))}
      </>
    ) : null,
    certifications: () => data.certifications?.length ? (
      <>
        <DH>Certifications</DH>
        {data.certifications.map((c, i) => <p key={i} className="mb-0.5">• {c}</p>)}
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <DH>Leadership</DH>
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold">{l.role} – {l.org}</p>
            <ul className="space-y-0.5">{l.bullets.map((b, j) => <li key={j} className="flex gap-1.5"><span style={{ color: 'var(--resume-accent, #059669)' }}>▪</span>{b}</li>)}</ul>
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <DH>{sec.title}</DH>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2">
            {item.subtitle && <p className="font-bold text-[10.5px]">{item.subtitle}</p>}
            {item.description && <p>{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="flex gap-1.5"><span style={{ color: 'var(--resume-accent, #059669)' }}>▪</span>{b}</li>)}
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="font-source p-8 text-[11px]" style={{ color: '#1a1a1a' }}>
      <div className="text-center mb-5 pb-4" style={{ borderBottom: `2px solid var(--resume-accent, #059669)` }}>
        <h1 className="text-xl font-bold">{data.header.name}</h1>
        <p className="text-[10px] mt-1" style={{ color: 'var(--resume-accent, #059669)' }}>{data.header.title}</p>
        <div className="flex justify-center gap-3 mt-2 text-[10px]" style={{ color: '#666' }}>
          {[data.header.email, data.header.phone, data.header.linkedin].filter(Boolean).map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
      {renderOrderedSections(sectionOrder, sectionMap, { changedFields, showChanges })}
    </div>
  );
};

const DH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold mb-2 mt-4 pb-1 flex items-center gap-2" style={{ borderBottom: '1px solid #d1d5db' }}>
    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--resume-accent, #059669)' }} />{children}
  </h2>
);
