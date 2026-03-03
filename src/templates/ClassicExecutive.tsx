// MBA Template 1: Classic Executive - Traditional serif fonts, conservative layout
import React from "react";
import { ResumeData } from "@/types/resume";
import { renderOrderedSections, SectionOrderItem, HighlightProps } from "./sectionRenderer";

export const ClassicExecutive = ({ data, sectionOrder, changedFields, showChanges }: { data: ResumeData; sectionOrder?: SectionOrderItem[] } & HighlightProps) => {
  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div className="border-t-2 border-b-2 py-3 mb-5" style={{ borderColor: 'var(--resume-accent, #1a1a1a)' }}>
        <p className="italic text-center">{data.summary}</p>
      </div>
    ) : null,
    experience: () => (
      <Section title="PROFESSIONAL EXPERIENCE">
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-bold">{exp.title}</span>
                <span className="mx-2">|</span>
                <span className="italic">{exp.company}</span>
                <span className="mx-1">–</span>
                <span>{exp.location}</span>
              </div>
              <span className="text-[10px] italic shrink-0">{exp.startDate} – {exp.endDate}</span>
            </div>
            <ul className="list-disc ml-5 mt-1 space-y-0.5">
              {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
      </Section>
    ),
    education: () => (
      <Section title="EDUCATION">
        {data.education.map((edu, i) => (
          <div key={i} className="flex justify-between mb-2">
            <div>
              <span className="font-bold">{edu.degree}</span>
              <span className="mx-1">–</span>
              <span>{edu.school}, {edu.location}</span>
              {edu.gpa && <span className="ml-2 italic">GPA: {edu.gpa}</span>}
            </div>
            <span className="text-[10px] italic">{edu.startDate} – {edu.endDate}</span>
          </div>
        ))}
      </Section>
    ),
    skills: () => (
      <Section title="SKILLS & COMPETENCIES">
        <div className="grid grid-cols-3 gap-2">
          {data.skills.map((s, i) => (
            <div key={i}>
              <span className="font-bold">{s.category}: </span>
              <span>{s.items.join(", ")}</span>
            </div>
          ))}
        </div>
      </Section>
    ),
    certifications: () => data.certifications?.length ? (
      <Section title="CERTIFICATIONS">
        <ul className="list-disc ml-5">
          {data.certifications.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </Section>
    ) : null,
    leadership: () => data.leadership?.length ? (
      <Section title="LEADERSHIP">
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2">
            <p><span className="font-bold">{l.role}</span> – {l.org} ({l.date})</p>
            <ul className="list-disc ml-5">{l.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </Section>
    ) : null,
    projects: () => data.projects?.length ? (
      <Section title="PROJECTS">
        {data.projects.map((p, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold">{p.name}{p.tech && <span className="font-normal italic"> ({p.tech})</span>}</p>
            <p>{p.description}</p>
            <ul className="list-disc ml-5">{p.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </Section>
    ) : null,
  };

  // Add custom sections
  (data.customSections || []).forEach((sec, i) => {
    sectionMap[`custom_${i}`] = () => (
      <Section title={sec.title.toUpperCase()}>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2">
            {item.subtitle && <p className="font-bold">{item.subtitle}</p>}
            {item.description && <p>{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="ml-5 list-disc">{b}</li>)}
          </div>
        ))}
      </Section>
    );
  });

  return (
    <div className="font-crimson p-10 text-[11px] leading-relaxed" style={{ color: '#1a1a1a' }}>
      <div className="text-center mb-6">
        <h1 className="font-playfair text-2xl font-bold tracking-wide uppercase">{data.header.name}</h1>
        <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: '#555' }}>{data.header.title}</p>
        <div className="flex justify-center gap-4 mt-2 text-[10px]" style={{ color: '#666' }}>
          <span>{data.header.email}</span>
          <span>•</span>
          <span>{data.header.phone}</span>
          {data.header.linkedin && <><span>•</span><span>{data.header.linkedin}</span></>}
        </div>
      </div>
      {renderOrderedSections(sectionOrder, sectionMap, { changedFields, showChanges })}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <h2 className="font-playfair text-sm font-bold tracking-widest uppercase mb-2 pb-1" style={{ borderBottom: '1px solid var(--resume-accent, #999)' }}>{title}</h2>
    {children}
  </div>
);
