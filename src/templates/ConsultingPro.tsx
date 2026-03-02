// MBA Template 2: Consulting Pro
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem } from "./sectionRenderer";

export const ConsultingPro = ({ data, sectionOrder }: { data: ResumeData; sectionOrder?: SectionOrderItem[] }) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div className="mb-4 p-3 rounded" style={{ background: 'var(--resume-accent-light, #f4f7f5)' }}>
        <p className="text-center italic text-[10.5px]">{data.summary}</p>
      </div>
    ) : null,
    experience: () => (
      <>
        <SectionHead title="EXPERIENCE" />
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #0B3D2E)` }}>
            <div className="flex justify-between">
              <div><span className="font-bold">{exp.company}</span> — <span>{exp.location}</span></div>
              <span className="text-[10px]" style={{ color: '#666' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="italic text-[10.5px] mb-1">{exp.title}</p>
            <ul className="space-y-0.5">
              {exp.bullets.map((b, j) => (
                <li key={j} className="flex gap-1.5">
                  <span style={{ color: 'var(--resume-accent, #0B3D2E)' }}>▸</span>
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
        <SectionHead title="EDUCATION" />
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2 flex justify-between">
            <div>
              <span className="font-bold">{edu.school}</span> — {edu.degree}
              {edu.gpa && <span className="ml-2 text-[10px]">({edu.gpa})</span>}
            </div>
            <span className="text-[10px]">{edu.startDate} – {edu.endDate}</span>
          </div>
        ))}
      </>
    ),
    skills: () => (
      <>
        <SectionHead title="SKILLS" />
        {data.skills.map((s, i) => (
          <p key={i} className="mb-1"><span className="font-semibold">{s.category}:</span> {s.items.join(" · ")}</p>
        ))}
      </>
    ),
    certifications: () => data.certifications?.length ? (
      <>
        <SectionHead title="CERTIFICATIONS" />
        {data.certifications.map((c, i) => <p key={i} className="mb-0.5">✓ {c}</p>)}
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <SectionHead title="LEADERSHIP" />
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #0B3D2E)` }}>
            <p><span className="font-bold">{l.role}</span> – {l.org} ({l.date})</p>
            <ul className="space-y-0.5">{l.bullets.map((b, j) => <li key={j} className="flex gap-1.5"><span style={{ color: 'var(--resume-accent, #0B3D2E)' }}>▸</span><span>{b}</span></li>)}</ul>
          </div>
        ))}
      </>
    ) : null,
    projects: () => data.projects?.length ? (
      <>
        <SectionHead title="PROJECTS" />
        {data.projects.map((p, i) => (
          <div key={i} className="mb-2 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #0B3D2E)` }}>
            <p className="font-bold">{p.name}{p.tech && <span className="font-normal text-[10px]"> ({p.tech})</span>}</p>
            <p className="text-[10.5px]">{p.description}</p>
            {p.bullets.map((b, j) => <li key={j} className="flex gap-1.5"><span style={{ color: 'var(--resume-accent, #0B3D2E)' }}>▸</span><span>{b}</span></li>)}
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <SectionHead title={sec.title.toUpperCase()} />
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2 pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #0B3D2E)` }}>
            {item.subtitle && <p className="font-bold">{item.subtitle}</p>}
            {item.description && <p className="text-[10.5px]">{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="flex gap-1.5"><span style={{ color: 'var(--resume-accent, #0B3D2E)' }}>▸</span><span>{b}</span></li>)}
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="font-source p-8 text-[11px] leading-relaxed" style={{ color: '#222' }}>
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-wider uppercase">{data.header.name}</h1>
        <div className="flex justify-center gap-3 mt-1 text-[10px]" style={{ color: '#555' }}>
          <span>{data.header.email}</span><span>|</span>
          <span>{data.header.phone}</span>
          {data.header.linkedin && <><span>|</span><span>{data.header.linkedin}</span></>}
          {data.header.location && <><span>|</span><span>{data.header.location}</span></>}
        </div>
      </div>
      <div className="h-[2px] mb-4" style={{ background: `linear-gradient(90deg, var(--resume-accent, #0B3D2E), var(--resume-accent-light, #1a7a5a), var(--resume-accent, #0B3D2E))` }} />
      {renderOrderedSections(sectionOrder, sectionMap)}
    </div>
  );
};

const SectionHead = ({ title }: { title: string }) => (
  <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-2 mt-3 pb-1" style={{ borderBottom: '1px solid #ccc' }}>{title}</h2>
);
