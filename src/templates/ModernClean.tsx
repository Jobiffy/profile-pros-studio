// Generic Template 1: Modern Clean - Simple, lots of whitespace
import { ResumeData } from "@/types/resume";

export const ModernClean = ({ data }: { data: ResumeData }) => (
  <div className="font-dm p-10 text-[11px]" style={{ color: '#333' }}>
    <div className="mb-8">
      <h1 className="text-2xl font-light tracking-wide">{data.header.name}</h1>
      <div className="flex gap-4 mt-2 text-[10px]" style={{ color: '#999' }}>
        <span>{data.header.email}</span>
        <span>{data.header.phone}</span>
        {data.header.linkedin && <span>{data.header.linkedin}</span>}
      </div>
    </div>

    <p className="mb-8 text-[11px] leading-relaxed" style={{ color: '#666' }}>{data.summary}</p>

    <MSection title="Experience">
      {data.experience.map((exp, i) => (
        <div key={i} className="mb-6">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-[10px]" style={{ color: '#999' }}>{exp.company}, {exp.location}</p>
            </div>
            <span className="text-[10px]" style={{ color: '#bbb' }}>{exp.startDate} – {exp.endDate}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {exp.bullets.map((b, j) => <li key={j} className="pl-3" style={{ borderLeft: `1px solid var(--resume-accent-light, #e0e0e0)` }}>{b}</li>)}
          </ul>
        </div>
      ))}
    </MSection>

    <MSection title="Education">
      {data.education.map((edu, i) => (
        <div key={i} className="mb-3 flex justify-between">
          <div>
            <p className="font-semibold">{edu.degree}</p>
            <p className="text-[10px]" style={{ color: '#999' }}>{edu.school}{edu.gpa && ` — ${edu.gpa}`}</p>
          </div>
          <span className="text-[10px]" style={{ color: '#bbb' }}>{edu.endDate}</span>
        </div>
      ))}
    </MSection>

    <MSection title="Skills">
      <div className="flex flex-wrap gap-2">
        {data.skills.flatMap(s => s.items).map((item, i) => (
          <span key={i} className="px-3 py-1 rounded-full text-[10px]" style={{ background: 'var(--resume-accent-light, #f5f5f5)' }}>{item}</span>
        ))}
      </div>
    </MSection>

    {(data.customSections || []).map((sec, i) => (
      <MSection key={i} title={sec.title}>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-3">
            {item.subtitle && <p className="font-semibold">{item.subtitle}</p>}
            {item.description && <p className="text-[10px]" style={{ color: '#999' }}>{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="pl-3" style={{ borderLeft: `1px solid var(--resume-accent-light, #e0e0e0)` }}>{b}</li>)}
          </div>
        ))}
      </MSection>
    ))}
  </div>
);

const MSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--resume-accent, #bbb)' }}>{title}</h2>
    {children}
  </div>
);
