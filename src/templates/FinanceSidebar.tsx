// MBA Template 4: Finance Sidebar
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem } from "./sectionRenderer";

const sidebarSections = new Set(["skills", "certifications", "education"]);

export const FinanceSidebar = ({ data, sectionOrder }: { data: ResumeData; sectionOrder?: SectionOrderItem[] }) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div className="mb-4 pb-3" style={{ borderBottom: `2px solid var(--resume-accent-dark, #0a1628)` }}>
        <p className="text-[10.5px] leading-relaxed" style={{ color: '#444' }}>{data.summary}</p>
      </div>
    ) : null,
    experience: () => (
      <MainSection title="Professional Experience">
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between">
              <span className="font-bold">{exp.title}</span>
              <span className="text-[10px]" style={{ color: '#888' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="text-[10px] mb-1" style={{ color: '#666' }}>{exp.company}, {exp.location}</p>
            <ul className="list-disc ml-4 space-y-0.5">{exp.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </MainSection>
    ),
    education: () => (
      <SideSection title="Education">
        {data.education.map((edu, i) => (
          <div key={i} className="mb-1.5">
            <p className="text-[9.5px] font-semibold opacity-90">{edu.degree}</p>
            <p className="text-[9px] opacity-70">{edu.school}</p>
            <p className="text-[8.5px] opacity-50">{edu.startDate} – {edu.endDate}</p>
          </div>
        ))}
      </SideSection>
    ),
    skills: () => (
      <SideSection title="Skills">
        {data.skills.map((s, i) => (
          <div key={i} className="mb-2">
            <p className="text-[9px] uppercase tracking-wider mb-1 text-white/60">{s.category}</p>
            {s.items.map((item, j) => (
              <p key={j} className="mb-0.5 pl-2" style={{ borderLeft: `1px solid var(--resume-accent, #2a4a6b)` }}>{item}</p>
            ))}
          </div>
        ))}
      </SideSection>
    ),
    certifications: () => data.certifications?.length ? (
      <SideSection title="Certifications">
        {data.certifications.map((c, i) => <p key={i} className="mb-1 text-[10px]">● {c}</p>)}
      </SideSection>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <MainSection title="Leadership">
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2">
            <p><span className="font-bold">{l.role}</span> – {l.org} ({l.date})</p>
            <ul className="list-disc ml-4">{l.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </MainSection>
    ) : null,
    projects: () => data.projects?.length ? (
      <MainSection title="Projects">
        {data.projects.map((p, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold">{p.name}{p.tech && <span className="font-normal text-[10px]"> ({p.tech})</span>}</p>
            {p.bullets.map((b, j) => <li key={j} className="list-disc ml-4">{b}</li>)}
          </div>
        ))}
      </MainSection>
    ) : null,
  };

  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <MainSection title={sec.title}>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2">
            {item.subtitle && <p className="font-bold">{item.subtitle}</p>}
            {item.description && <p className="text-[10.5px]">{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="list-disc ml-4">{b}</li>)}
          </div>
        ))}
      </MainSection>
    );
  });

  // Split sections for sidebar vs main
  const order = sectionOrder || Object.keys(sectionMap).map(id => ({ id, visible: true }));
  const sideItems = order.filter(s => s.visible && sidebarSections.has(s.id));
  const mainItems = order.filter(s => s.visible && !sidebarSections.has(s.id));

  return (
    <div className="flex text-[11px]" style={{ color: '#1a1a1a' }}>
      <div className="w-[30%] p-6 min-h-full font-source" style={{ background: 'var(--resume-accent-dark, #0a1628)', color: '#ccd6e0' }}>
        <h1 className="text-lg font-bold text-white mb-1">{data.header.name}</h1>
        <p className="text-[9px] uppercase tracking-widest mb-5" style={{ color: 'var(--resume-accent-light, #6b8aad)' }}>{data.header.title}</p>
        <SideSection title="Contact">
          <p className="mb-0.5">{data.header.email}</p>
          <p className="mb-0.5">{data.header.phone}</p>
          {data.header.location && <p className="mb-0.5">{data.header.location}</p>}
          {data.header.linkedin && <p>{data.header.linkedin}</p>}
        </SideSection>
        {sideItems.map(s => {
          const fn = sectionMap[s.id];
          return fn ? <React.Fragment key={s.id}>{fn()}</React.Fragment> : null;
        })}
      </div>
      <div className="w-[70%] p-6 font-source">
        {mainItems.map(s => {
          const fn = sectionMap[s.id];
          return fn ? <React.Fragment key={s.id}>{fn()}</React.Fragment> : null;
        })}
      </div>
    </div>
  );
};

const SideSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white mb-2 pb-1" style={{ borderBottom: `1px solid var(--resume-accent, #1e3a5f)` }}>{title}</h2>
    {children}
  </div>
);

const MainSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1" style={{ borderBottom: '1px solid #ddd' }}>{title}</h2>
    {children}
  </div>
);
