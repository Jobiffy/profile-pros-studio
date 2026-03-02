// Tech Template 5: DevOps Terminal
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem } from "./sectionRenderer";

export const DevOpsTerminal = ({ data, sectionOrder }: { data: ResumeData; sectionOrder?: SectionOrderItem[] }) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (<><Cmd cmd="cat summary.txt" /><p className="mb-3 pl-2" style={{ color: '#ccc' }}>{data.summary}</p></>) : null,
    experience: () => (
      <>
        <Cmd cmd="ls experience/" />
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-3 pl-2">
            <p><span style={{ color: '#ff6600' }}>{exp.title}</span> <span style={{ color: '#666' }}>@ {exp.company} [{exp.startDate}–{exp.endDate}]</span></p>
            {exp.bullets.map((b, j) => <p key={j} className="pl-2" style={{ color: '#aaa' }}>├── {b}</p>)}
          </div>
        ))}
      </>
    ),
    education: () => (
      <>
        <Cmd cmd="cat education.conf" />
        {data.education.map((edu, i) => (
          <p key={i} className="pl-2 mb-1" style={{ color: '#ccc' }}>
            [{edu.degree}] <span style={{ color: '#888' }}>@ {edu.school} ({edu.endDate}){edu.gpa && ` GPA=${edu.gpa}`}</span>
          </p>
        ))}
      </>
    ),
    skills: () => (
      <>
        <Cmd cmd="dpkg --list skills" />
        <div className="pl-2 flex flex-wrap gap-1">
          {data.skills.flatMap(s => s.items).map((item, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: '#1a2a1a', color: '#33ff33', border: '1px solid #2a4a2a' }}>{item}</span>
          ))}
        </div>
      </>
    ),
    projects: () => data.projects?.length ? (
      <>
        <Cmd cmd="git log --oneline projects/" />
        {data.projects.map((p, i) => (
          <p key={i} className="pl-2 mb-0.5" style={{ color: '#ccc' }}>
            <span style={{ color: '#ffcc00' }}>{p.name}</span>{p.tech && <span style={{ color: '#666' }}> ({p.tech})</span>}
          </p>
        ))}
      </>
    ) : null,
    certifications: () => data.certifications?.length ? (
      <>
        <Cmd cmd="cat /etc/certifications" />
        {data.certifications.map((c, i) => <p key={i} className="pl-2" style={{ color: '#33ff33' }}>[✓] {c}</p>)}
      </>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <>
        <Cmd cmd="cat leadership.log" />
        {data.leadership.map((l, i) => (
          <div key={i} className="pl-2 mb-1">
            <p><span style={{ color: '#ff6600' }}>{l.role}</span> <span style={{ color: '#666' }}>@ {l.org} [{l.date}]</span></p>
            {l.bullets.map((b, j) => <p key={j} className="pl-2" style={{ color: '#aaa' }}>├── {b}</p>)}
          </div>
        ))}
      </>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <>
        <Cmd cmd={`cat ${sec.title.toLowerCase().replace(/\s+/g, '-')}.txt`} />
        {sec.items.map((item, j) => (
          <div key={j} className="pl-2 mb-1">
            {item.subtitle && <p style={{ color: '#ffcc00' }}>{item.subtitle}</p>}
            {item.description && <p style={{ color: '#ccc' }}>{item.description}</p>}
            {item.bullets?.map((b, k) => <p key={k} className="pl-2" style={{ color: '#aaa' }}>├── {b}</p>)}
          </div>
        ))}
      </>
    );
  });

  return (
    <div className="font-mono-code p-6 text-[10px] leading-relaxed" style={{ color: '#33ff33', background: '#0d0d0d' }}>
      <div className="mb-4 p-3 rounded" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
        <p style={{ color: '#888' }}>user@resume:~$ whoami</p>
        <h1 className="text-lg font-bold text-white">{data.header.name}</h1>
        <p style={{ color: 'var(--resume-accent, #ffcc00)' }}>{data.header.title}</p>
        <p className="mt-1" style={{ color: '#888' }}>
          {data.header.email} | {data.header.phone}{data.header.linkedin && ` | ${data.header.linkedin}`}
        </p>
      </div>
      {renderOrderedSections(sectionOrder, sectionMap)}
      <p className="mt-4" style={{ color: '#888' }}>user@resume:~$ <span className="animate-pulse">█</span></p>
    </div>
  );
};

const Cmd = ({ cmd }: { cmd: string }) => (
  <p className="mt-3 mb-1"><span style={{ color: '#888' }}>$</span> <span style={{ color: '#33ff33' }}>{cmd}</span></p>
);
