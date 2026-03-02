// MBA Template 3: Strategy Minimal
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem } from "./sectionRenderer";

export const StrategyMinimal = ({ data, sectionOrder }: { data: ResumeData; sectionOrder?: SectionOrderItem[] }) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? <p className="mb-6 text-[10.5px] leading-relaxed" style={{ color: '#555' }}>{data.summary}</p> : null,
    experience: () => (
      <>
        <Heading>Experience</Heading>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs">{exp.title}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--resume-accent-light, #f5f0e8)', color: 'var(--resume-accent, #C4975C)' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#888' }}>{exp.company} · {exp.location}</p>
            <ul className="space-y-0.5">
              {exp.bullets.map((b, j) => <li key={j} className="pl-3" style={{ borderLeft: `1px solid var(--resume-accent, #C4975C)` }}>{b}</li>)}
            </ul>
          </div>
        ))}
      </>
    ),
    education: () => (
      <>
        <Heading>Education</Heading>
        {data.education.map((edu, i) => (
          <div key={i} className="flex justify-between mb-2">
            <div><span className="font-semibold">{edu.degree}</span> · {edu.school}{edu.gpa && ` · ${edu.gpa}`}</div>
            <span className="text-[10px]" style={{ color: '#999' }}>{edu.endDate}</span>
          </div>
        ))}
      </>
    ),
    skills: () => (
      <>
        <Heading>Skills</Heading>
        <div className="flex flex-wrap gap-1.5">
          {data.skills.flatMap(s => s.items).map((item, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'var(--resume-accent-light, #f5f0e8)', color: 'var(--resume-accent-dark, #8B6914)' }}>{item}</span>
          ))}
        </div>
      </>
    ),
    certifications: () => data.certifications?.length ? (
      <>
        <Heading>Certifications</Heading>
        <div className="flex flex-wrap gap-1.5">
          {data.certifications.map((c, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: '#f0f0f0' }}>{c}</span>
          ))}
        </div>
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <Heading>Leadership</Heading>
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2">
            <p><span className="font-bold">{l.role}</span> – {l.org} ({l.date})</p>
            <ul className="space-y-0.5">{l.bullets.map((b, j) => <li key={j} className="pl-3" style={{ borderLeft: `1px solid var(--resume-accent, #C4975C)` }}>{b}</li>)}</ul>
          </div>
        ))}
      </>
    ) : null,
    projects: () => data.projects?.length ? (
      <>
        <Heading>Projects</Heading>
        {data.projects.map((p, i) => (
          <div key={i} className="mb-2">
            <p className="font-semibold">{p.name}{p.tech && <span className="font-normal text-[10px]"> ({p.tech})</span>}</p>
            <ul className="space-y-0.5">{p.bullets.map((b, j) => <li key={j} className="pl-3" style={{ borderLeft: `1px solid var(--resume-accent, #C4975C)` }}>{b}</li>)}</ul>
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <Heading>{sec.title}</Heading>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2">
            {item.subtitle && <p className="font-semibold">{item.subtitle}</p>}
            {item.description && <p className="text-[10.5px]" style={{ color: '#555' }}>{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="pl-3" style={{ borderLeft: `1px solid var(--resume-accent, #C4975C)` }}>{b}</li>)}
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="font-dm p-8 text-[11px]" style={{ color: '#2d2d2d' }}>
      <div className="flex items-end gap-4 mb-6">
        <div className="w-1.5 h-16 rounded-full" style={{ background: 'var(--resume-accent, #C4975C)' }} />
        <div>
          <h1 className="text-2xl font-bold">{data.header.name}</h1>
          <p className="text-[10px] tracking-wider uppercase mt-0.5" style={{ color: '#888' }}>{data.header.title}</p>
        </div>
      </div>
      <div className="flex gap-6 text-[10px] mb-5" style={{ color: '#777' }}>
        <span>{data.header.email}</span>
        <span>{data.header.phone}</span>
        {data.header.linkedin && <span>{data.header.linkedin}</span>}
      </div>
      <div className="space-y-5">
        {renderOrderedSections(sectionOrder, sectionMap)}
      </div>
    </div>
  );
};

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
    <span className="w-3 h-0.5 rounded" style={{ background: 'var(--resume-accent, #C4975C)' }} />
    {children}
  </h2>
);
