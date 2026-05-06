// Generic Template 5: Elegant Refined
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem, HighlightProps } from "./sectionRenderer";

export const ElegantRefined = ({ data, sectionOrder, changedFields, showChanges }: { data: ResumeData; sectionOrder?: SectionOrderItem[] } & HighlightProps) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? <p className="text-center italic mb-6 max-w-[90%] mx-auto leading-relaxed" style={{ color: '#555' }}>{data.summary}</p> : null,
    experience: () => (
      <>
        <EH>Experience</EH>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-5">
            <div className="flex justify-between items-baseline">
              <h3 className="font-playfair font-semibold text-xs">{exp.title}</h3>
              <span className="text-[10px] italic" style={{ color: 'var(--resume-accent, #d4af37)' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="text-[10px] italic mb-1.5" style={{ color: '#888' }}>{exp.company} · {exp.location}</p>
            <ul className="space-y-0.5">
              {exp.bullets.map((b, j) => (
                <li key={j} className="flex gap-2">
                  <span style={{ color: 'var(--resume-accent, #d4af37)' }}>-</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </>
    ),
    education: () => (
      <>
        <EH>Education</EH>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-3 flex justify-between">
            <div>
              <span className="font-playfair font-semibold">{edu.degree}</span>
              <span className="italic"> · {edu.school}</span>
              {edu.gpa && <span className="text-[10px] ml-2" style={{ color: 'var(--resume-accent, #d4af37)' }}>({edu.gpa})</span>}
            </div>
            <span className="text-[10px] italic" style={{ color: '#aaa' }}>{edu.endDate}</span>
          </div>
        ))}
      </>
    ),
    skills: () => (
      <>
        <EH>Skills & Expertise</EH>
        <div className="flex flex-wrap gap-2">
          {data.skills.flatMap(s => s.items).map((item, i) => (
            <span key={i} className="px-3 py-1 text-[10px]" style={{ border: `1px solid var(--resume-accent, #d4af37)`, color: '#555' }}>{item}</span>
          ))}
        </div>
      </>
    ),
    certifications: () => data.certifications?.length ? (
      <>
        <EH>Certifications</EH>
        <div className="flex flex-wrap gap-3">
          {data.certifications.map((c, i) => (
            <span key={i} className="text-[10px] italic" style={{ color: '#666' }}>✦ {c}</span>
          ))}
        </div>
      </>
    ) : null,
    projects: () => data.projects?.length ? (
      <>
        <EH>Projects</EH>
        {data.projects.map((p, i) => (
          <div key={i} className="mb-3">
            <p className="font-playfair font-semibold">{p.name}</p>
            {p.bullets.map((b, j) => <li key={j} className="flex gap-2"><span style={{ color: 'var(--resume-accent, #d4af37)' }}>-</span>{b}</li>)}
          </div>
        ))}
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <EH>Leadership</EH>
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-3">
            <p className="font-playfair font-semibold">{l.role} – {l.org}</p>
            {l.bullets.map((b, j) => <li key={j} className="flex gap-2"><span style={{ color: 'var(--resume-accent, #d4af37)' }}>-</span>{b}</li>)}
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <EH>{sec.title}</EH>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-3">
            {item.subtitle && <p className="font-playfair font-semibold">{item.subtitle}</p>}
            {item.description && <p className="italic">{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="flex gap-2"><span style={{ color: 'var(--resume-accent, #d4af37)' }}>-</span>{b}</li>)}
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="font-crimson p-9 text-[11px]" style={{ color: '#2c2c2c' }}>
      <div className="text-center mb-6 pb-5" style={{ borderBottom: `1px solid var(--resume-accent, #d4af37)` }}>
        <h1 className="font-playfair text-2xl font-semibold tracking-wide">{data.header.name}</h1>
        <p className="text-[10px] mt-1.5 tracking-widest uppercase" style={{ color: 'var(--resume-accent, #d4af37)' }}>{data.header.title}</p>
        <div className="flex justify-center gap-4 mt-2 text-[10px]" style={{ color: '#888' }}>
          <span>{data.header.email}</span>
          <span>✦</span>
          <span>{data.header.phone}</span>
          {data.header.linkedin && <><span>✦</span><span>{data.header.linkedin}</span></>}
        </div>
      </div>
      {renderOrderedSections(sectionOrder, sectionMap, { changedFields, showChanges })}
    </div>
  );
};

const EH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-playfair text-sm font-semibold mb-3 mt-6 text-center tracking-wider">
    <span className="px-4 relative">
      <span className="absolute left-0 top-1/2 w-full h-px" style={{ background: '#e5e5e5' }} />
      <span className="relative px-3" style={{ background: '#fff' }}>{children}</span>
    </span>
  </h2>
);
