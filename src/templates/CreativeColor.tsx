// Generic Template 2: Creative Color
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem } from "./sectionRenderer";

export const CreativeColor = ({ data, sectionOrder }: { data: ResumeData; sectionOrder?: SectionOrderItem[] }) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? <p className="mb-5 text-[10.5px] leading-relaxed p-3 rounded-lg" style={{ background: 'var(--resume-accent-light, #fff7ed)' }}>{data.summary}</p> : null,
    experience: () => (
      <>
        <CH>Experience</CH>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4 ml-3 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #f97316)` }}>
            <div className="flex justify-between">
              <h3 className="font-bold text-xs font-space">{exp.title}</h3>
              <span className="text-[9px]" style={{ color: '#aaa' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="text-[10px] mb-1" style={{ color: '#888' }}>{exp.company}</p>
            <ul className="space-y-0.5">{exp.bullets.map((b, j) => <li key={j}>• {b}</li>)}</ul>
          </div>
        ))}
      </>
    ),
    education: () => (
      <>
        <CH>Education</CH>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold text-[10.5px] font-space">{edu.degree}</p>
            <p className="text-[10px]" style={{ color: '#888' }}>{edu.school} · {edu.endDate}</p>
          </div>
        ))}
      </>
    ),
    skills: () => (
      <>
        <CH>Skills</CH>
        <div className="flex flex-wrap gap-1">
          {data.skills.flatMap(s => s.items).map((item, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: 'var(--resume-accent-light, #fff7ed)', color: 'var(--resume-accent-dark, #ea580c)' }}>{item}</span>
          ))}
        </div>
      </>
    ),
    certifications: () => data.certifications?.length ? (
      <>
        <CH>Certifications</CH>
        <div className="flex flex-wrap gap-2">
          {data.certifications.map((c, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-[10px]" style={{ background: '#fef3c7' }}>🏅 {c}</span>
          ))}
        </div>
      </>
    ) : null,
    projects: () => data.projects?.length ? (
      <>
        <CH>Projects</CH>
        {data.projects.map((p, i) => (
          <div key={i} className="mb-2 ml-3 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #f97316)` }}>
            <p className="font-bold text-xs font-space">{p.name}</p>
            {p.bullets.map((b, j) => <li key={j}>• {b}</li>)}
          </div>
        ))}
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <CH>Leadership</CH>
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2 ml-3 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #f97316)` }}>
            <p className="font-bold text-xs font-space">{l.role} – {l.org}</p>
            {l.bullets.map((b, j) => <li key={j}>• {b}</li>)}
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <CH>{sec.title}</CH>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2 ml-3 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #f97316)` }}>
            {item.subtitle && <p className="font-bold text-xs font-space">{item.subtitle}</p>}
            {item.description && <p className="text-[10px]">{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k}>• {b}</li>)}
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="flex text-[11px]" style={{ color: '#222' }}>
      <div className="w-2 shrink-0" style={{ background: `linear-gradient(180deg, var(--resume-accent, #f97316), var(--resume-accent-dark, #ec4899), var(--resume-accent, #8b5cf6))` }} />
      <div className="flex-1 p-7">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-space">{data.header.name}</h1>
          <p className="font-space text-xs mt-1" style={{ color: 'var(--resume-accent, #f97316)' }}>{data.header.title}</p>
          <div className="flex gap-3 mt-2 text-[10px]" style={{ color: '#888' }}>
            <span>{data.header.email}</span><span>{data.header.phone}</span>
            {data.header.linkedin && <span>{data.header.linkedin}</span>}
          </div>
        </div>
        {renderOrderedSections(sectionOrder, sectionMap)}
      </div>
    </div>
  );
};

const CH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold font-space uppercase tracking-wider mb-2 mt-4" style={{ color: 'var(--resume-accent, #f97316)' }}>{children}</h2>
);
