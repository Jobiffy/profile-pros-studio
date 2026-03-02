// Generic Template 3: Professional Classic - Classic two-column
import { ResumeData } from "@/types/resume";

export const ProfessionalClassic = ({ data }: { data: ResumeData }) => (
  <div className="flex text-[11px] font-source" style={{ color: '#1a1a1a' }}>
    {/* Sidebar */}
    <div className="w-[32%] p-6" style={{ background: 'var(--resume-accent-dark, #2d3748)', color: '#e2e8f0' }}>
      <h1 className="text-lg font-bold text-white mb-4">{data.header.name}</h1>

      <PSide title="CONTACT">
        <p className="mb-0.5">{data.header.email}</p>
        <p className="mb-0.5">{data.header.phone}</p>
        {data.header.location && <p className="mb-0.5">{data.header.location}</p>}
        {data.header.linkedin && <p>{data.header.linkedin}</p>}
      </PSide>

      <PSide title="SKILLS">
        {data.skills.map((s, i) => (
          <div key={i} className="mb-3">
            <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: '#a0aec0' }}>{s.category}</p>
            {s.items.map((item, j) => (
              <div key={j} className="flex items-center gap-2 mb-0.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="w-1.5 h-1.5 rounded-full" style={{ background: n <= 4 ? 'var(--resume-accent, #63b3ed)' : '#4a5568' }} />
                  ))}
                </div>
                <span className="text-[10px]">{item}</span>
              </div>
            ))}
          </div>
        ))}
      </PSide>

      {data.certifications && (
        <PSide title="CERTIFICATIONS">
          {data.certifications.map((c, i) => <p key={i} className="mb-1 text-[10px]">▸ {c}</p>)}
        </PSide>
      )}
    </div>

    {/* Main */}
    <div className="w-[68%] p-6">
      <p className="text-[10.5px] leading-relaxed mb-5 pb-4" style={{ color: '#555', borderBottom: '1px solid #e2e8f0' }}>{data.summary}</p>

      <PMain title="WORK EXPERIENCE">
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between">
              <h3 className="font-bold">{exp.title}</h3>
              <span className="text-[10px]" style={{ color: '#a0aec0' }}>{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="text-[10px] italic mb-1" style={{ color: '#718096' }}>{exp.company}, {exp.location}</p>
            <ul className="list-disc ml-4 space-y-0.5">{exp.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </PMain>

      <PMain title="EDUCATION">
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2 flex justify-between">
            <div><span className="font-bold">{edu.degree}</span> – {edu.school}{edu.gpa && ` (${edu.gpa})`}</div>
            <span className="text-[10px]">{edu.endDate}</span>
          </div>
        ))}
      </PMain>

      {data.projects && (
        <PMain title="PROJECTS">
          {data.projects.map((p, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold">{p.name}{p.tech && <span className="font-normal text-[10px]" style={{ color: '#a0aec0' }}> · {p.tech}</span>}</p>
              {p.bullets.map((b, j) => <p key={j} className="pl-2 text-[10px]">• {b}</p>)}
            </div>
          ))}
        </PMain>
      )}

      {(data.customSections || []).map((sec, i) => (
        <PMain key={i} title={sec.title.toUpperCase()}>
          {sec.items.map((item, j) => (
            <div key={j} className="mb-2">
              {item.subtitle && <p className="font-bold">{item.subtitle}</p>}
              {item.description && <p className="text-[10px]">{item.description}</p>}
              {item.bullets?.map((b, k) => <p key={k} className="pl-2 text-[10px]">• {b}</p>)}
            </div>
          ))}
        </PMain>
      ))}
    </div>
  </div>
);

const PSide = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <h2 className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/80 mb-2 pb-1" style={{ borderBottom: '1px solid #4a5568' }}>{title}</h2>
    {children}
  </div>
);

const PMain = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h2 className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2 pb-1" style={{ borderBottom: `2px solid var(--resume-accent-dark, #2d3748)` }}>{title}</h2>
    {children}
  </div>
);
