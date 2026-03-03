// Generic Template 4: Minimalist Type
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem, HighlightProps } from "./sectionRenderer";

export const MinimalistType = ({ data, sectionOrder, changedFields, showChanges }: { data: ResumeData; sectionOrder?: SectionOrderItem[] } & HighlightProps) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? <p className="mb-10 leading-relaxed max-w-[85%]" style={{ color: '#777' }}>{data.summary}</p> : null,
    experience: () => (
      <>
        <MinH>Experience</MinH>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-6 grid grid-cols-[120px_1fr] gap-4">
            <div className="text-[10px]" style={{ color: '#bbb' }}>
              <p>{exp.startDate}</p>
              <p>{exp.endDate}</p>
            </div>
            <div>
              <h3 className="font-medium">{exp.title}</h3>
              <p className="text-[10px] mb-1.5" style={{ color: '#999' }}>{exp.company}</p>
              {exp.bullets.map((b, j) => <p key={j} className="mb-0.5" style={{ color: '#555' }}>{b}</p>)}
            </div>
          </div>
        ))}
      </>
    ),
    education: () => (
      <>
        <MinH>Education</MinH>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-3 grid grid-cols-[120px_1fr] gap-4">
            <span className="text-[10px]" style={{ color: '#bbb' }}>{edu.endDate}</span>
            <div>
              <p className="font-medium">{edu.degree}</p>
              <p className="text-[10px]" style={{ color: '#999' }}>{edu.school}{edu.gpa && ` · ${edu.gpa}`}</p>
            </div>
          </div>
        ))}
      </>
    ),
    skills: () => (
      <>
        <MinH>Skills</MinH>
        <p style={{ color: '#777' }}>{data.skills.flatMap(s => s.items).join("  ·  ")}</p>
      </>
    ),
    projects: () => data.projects?.length ? (
      <>
        <MinH>Projects</MinH>
        {data.projects.map((p, i) => (
          <div key={i} className="mb-3 grid grid-cols-[120px_1fr] gap-4">
            <span className="text-[10px]" style={{ color: '#bbb' }}>{p.tech || ''}</span>
            <div>
              <p className="font-medium">{p.name}</p>
              {p.bullets.map((b, j) => <p key={j} className="mb-0.5" style={{ color: '#555' }}>{b}</p>)}
            </div>
          </div>
        ))}
      </>
    ) : null,
    certifications: () => data.certifications?.length ? (
      <>
        <MinH>Certifications</MinH>
        {data.certifications.map((c, i) => <p key={i} className="mb-0.5" style={{ color: '#555' }}>• {c}</p>)}
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <MinH>Leadership</MinH>
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-3 grid grid-cols-[120px_1fr] gap-4">
            <span className="text-[10px]" style={{ color: '#bbb' }}>{l.date}</span>
            <div>
              <p className="font-medium">{l.role} – {l.org}</p>
              {l.bullets.map((b, j) => <p key={j} className="mb-0.5" style={{ color: '#555' }}>{b}</p>)}
            </div>
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <MinH>{sec.title}</MinH>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-3 grid grid-cols-[120px_1fr] gap-4">
            <span className="text-[10px]" style={{ color: '#bbb' }}>{item.subtitle || ''}</span>
            <div>
              {item.description && <p className="font-medium">{item.description}</p>}
              {item.bullets?.map((b, k) => <p key={k} className="mb-0.5" style={{ color: '#555' }}>{b}</p>)}
            </div>
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="p-12 text-[11px] font-light" style={{ color: '#333', fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-10">
        <h1 className="text-3xl font-extralight tracking-tight">{data.header.name}</h1>
        <div className="w-8 h-px mt-3 mb-2" style={{ background: 'var(--resume-accent, #333)' }} />
        <div className="flex gap-6 text-[10px]" style={{ color: '#aaa' }}>
          <span>{data.header.email}</span>
          <span>{data.header.phone}</span>
          {data.header.linkedin && <span>{data.header.linkedin}</span>}
        </div>
      </div>
      {renderOrderedSections(sectionOrder, sectionMap, { changedFields, showChanges })}
    </div>
  );
};

const MinH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[9px] uppercase tracking-[0.3em] mb-4 mt-8" style={{ color: 'var(--resume-accent, #bbb)' }}>{children}</h2>
);
