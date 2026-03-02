// MBA Template 5: Leadership Bold - Bold headers with timeline layout
import { ResumeData } from "@/types/resume";

export const LeadershipBold = ({ data }: { data: ResumeData }) => (
  <div className="font-source p-8 text-[11px]" style={{ color: '#1a1a1a' }}>
    <div className="mb-6">
      <h1 className="text-3xl font-bold" style={{ color: 'var(--resume-accent, #8B0000)' }}>{data.header.name}</h1>
      <div className="h-1 w-20 mt-1 rounded" style={{ background: 'var(--resume-accent, #8B0000)' }} />
      <p className="mt-2 text-xs" style={{ color: '#666' }}>{data.header.title}</p>
      <div className="flex gap-4 mt-1 text-[10px]" style={{ color: '#888' }}>
        <span>{data.header.email}</span><span>{data.header.phone}</span>
        {data.header.linkedin && <span>{data.header.linkedin}</span>}
      </div>
    </div>

    <div className="p-3 rounded-sm mb-5" style={{ background: 'var(--resume-accent-light, #fdf5f5)', borderLeft: `3px solid var(--resume-accent, #8B0000)` }}>
      <p className="text-[10.5px] leading-relaxed">{data.summary}</p>
    </div>

    <SectionTitle>Career Timeline</SectionTitle>
    <div className="relative pl-6 mb-5">
      <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: '#ddd' }} />
      {data.experience.map((exp, i) => (
        <div key={i} className="mb-5 relative">
          <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: 'var(--resume-accent, #8B0000)', background: i === 0 ? 'var(--resume-accent, #8B0000)' : '#fff' }} />
          <div className="flex justify-between">
            <h3 className="font-bold text-xs">{exp.title}</h3>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--resume-accent, #8B0000)' }}>{exp.startDate} – {exp.endDate}</span>
          </div>
          <p className="text-[10px] mb-1" style={{ color: '#777' }}>{exp.company} • {exp.location}</p>
          <ul className="list-disc ml-4 space-y-0.5">
            {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
          </ul>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div>
        <SectionTitle>Education</SectionTitle>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold text-[10.5px]">{edu.degree}</p>
            <p className="text-[10px]" style={{ color: '#666' }}>{edu.school} | {edu.endDate}{edu.gpa && ` | ${edu.gpa}`}</p>
          </div>
        ))}
      </div>
      <div>
        <SectionTitle>Core Competencies</SectionTitle>
        {data.skills.map((s, i) => (
          <p key={i} className="mb-1"><span className="font-bold">{s.category}:</span> {s.items.join(", ")}</p>
        ))}
      </div>
    </div>

    {data.leadership && data.leadership.length > 0 && (
      <>
        <SectionTitle>Leadership</SectionTitle>
        {data.leadership.map((l, i) => (
          <div key={i} className="mb-2">
            <p><span className="font-bold">{l.role}</span> – {l.org} ({l.date})</p>
            <ul className="list-disc ml-4">{l.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
      </>
    )}

    {(data.customSections || []).map((sec, i) => (
      <div key={i}>
        <SectionTitle>{sec.title}</SectionTitle>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2">
            {item.subtitle && <p className="font-bold">{item.subtitle}</p>}
            {item.description && <p>{item.description}</p>}
            {item.bullets?.map((b, k) => <li key={k} className="list-disc ml-4">{b}</li>)}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-sm font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'var(--resume-accent, #8B0000)' }}>{children}</h2>
);
