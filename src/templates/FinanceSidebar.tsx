// MBA Template 4: Finance Sidebar - Two-column with sidebar for skills
import { ResumeData } from "@/types/resume";

export const FinanceSidebar = ({ data }: { data: ResumeData }) => (
  <div className="flex text-[11px]" style={{ color: '#1a1a1a' }}>
    {/* Sidebar */}
    <div className="w-[30%] p-6 min-h-full font-source" style={{ background: 'var(--resume-accent-dark, #0a1628)', color: '#ccd6e0' }}>
      <h1 className="text-lg font-bold text-white mb-1">{data.header.name}</h1>
      <p className="text-[9px] uppercase tracking-widest mb-5" style={{ color: 'var(--resume-accent-light, #6b8aad)' }}>{data.header.title}</p>

      <SideSection title="Contact">
        <p className="mb-0.5">{data.header.email}</p>
        <p className="mb-0.5">{data.header.phone}</p>
        {data.header.location && <p className="mb-0.5">{data.header.location}</p>}
        {data.header.linkedin && <p>{data.header.linkedin}</p>}
      </SideSection>

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

      {data.certifications && (
        <SideSection title="Certifications">
          {data.certifications.map((c, i) => <p key={i} className="mb-1 text-[10px]">● {c}</p>)}
        </SideSection>
      )}
    </div>

    {/* Main */}
    <div className="w-[70%] p-6 font-source">
      <div className="mb-4 pb-3" style={{ borderBottom: `2px solid var(--resume-accent-dark, #0a1628)` }}>
        <p className="text-[10.5px] leading-relaxed" style={{ color: '#444' }}>{data.summary}</p>
      </div>

      <MainSection title="Professional Experience">
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between">
              <span className="font-bold">{exp.title}</span>
              <span className="text-[10px]" style={{ color: '#888' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="text-[10px] mb-1" style={{ color: '#666' }}>{exp.company}, {exp.location}</p>
            <ul className="list-disc ml-4 space-y-0.5">
              {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
      </MainSection>

      <MainSection title="Education">
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2 flex justify-between">
            <div><span className="font-bold">{edu.degree}</span> – {edu.school}{edu.gpa && ` (${edu.gpa})`}</div>
            <span className="text-[10px]">{edu.endDate}</span>
          </div>
        ))}
      </MainSection>

      {(data.customSections || []).map((sec, i) => (
        <MainSection key={i} title={sec.title}>
          {sec.items.map((item, j) => (
            <div key={j} className="mb-2">
              {item.subtitle && <p className="font-bold">{item.subtitle}</p>}
              {item.description && <p className="text-[10.5px]">{item.description}</p>}
              {item.bullets?.map((b, k) => <li key={k} className="list-disc ml-4">{b}</li>)}
            </div>
          ))}
        </MainSection>
      ))}
    </div>
  </div>
);

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
