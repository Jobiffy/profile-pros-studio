// MBA Template 3: Strategy Minimal - Modern minimalist with accent color bars
import { ResumeData } from "@/types/resume";

export const StrategyMinimal = ({ data }: { data: ResumeData }) => (
  <div className="font-dm p-8 text-[11px]" style={{ color: '#2d2d2d' }}>
    <div className="flex items-end gap-4 mb-6">
      <div className="w-1.5 h-16 rounded-full" style={{ background: '#C4975C' }} />
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

    <p className="mb-6 text-[10.5px] leading-relaxed" style={{ color: '#555' }}>{data.summary}</p>

    <div className="space-y-5">
      <Heading>Experience</Heading>
      {data.experience.map((exp, i) => (
        <div key={i} className="mb-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs">{exp.title}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#f5f0e8', color: '#C4975C' }}>{exp.startDate} – {exp.endDate}</span>
          </div>
          <p className="text-[10px] mb-1.5" style={{ color: '#888' }}>{exp.company} · {exp.location}</p>
          <ul className="space-y-0.5">
            {exp.bullets.map((b, j) => <li key={j} className="pl-3" style={{ borderLeft: '1px solid #C4975C' }}>{b}</li>)}
          </ul>
        </div>
      ))}

      <Heading>Education</Heading>
      {data.education.map((edu, i) => (
        <div key={i} className="flex justify-between mb-2">
          <div><span className="font-semibold">{edu.degree}</span> · {edu.school}{edu.gpa && ` · ${edu.gpa}`}</div>
          <span className="text-[10px]" style={{ color: '#999' }}>{edu.endDate}</span>
        </div>
      ))}

      <Heading>Skills</Heading>
      <div className="flex flex-wrap gap-1.5">
        {data.skills.flatMap(s => s.items).map((item, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: '#f5f0e8', color: '#8B6914' }}>{item}</span>
        ))}
      </div>

      {data.certifications && (
        <>
          <Heading>Certifications</Heading>
          <div className="flex flex-wrap gap-1.5">
            {data.certifications.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: '#f0f0f0' }}>{c}</span>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
    <span className="w-3 h-0.5 rounded" style={{ background: '#C4975C' }} />
    {children}
  </h2>
);
