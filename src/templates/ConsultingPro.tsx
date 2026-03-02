// MBA Template 2: Consulting Pro - Clean, structured with emphasis on impact metrics
import { ResumeData } from "@/types/resume";

export const ConsultingPro = ({ data }: { data: ResumeData }) => (
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

    <div className="h-[2px] mb-4" style={{ background: 'linear-gradient(90deg, #0B3D2E, #1a7a5a, #0B3D2E)' }} />

    <div className="mb-4 p-3 rounded" style={{ background: '#f4f7f5' }}>
      <p className="text-center italic text-[10.5px]">{data.summary}</p>
    </div>

    <SectionHead title="EXPERIENCE" />
    {data.experience.map((exp, i) => (
      <div key={i} className="mb-4 pl-3" style={{ borderLeft: '2px solid #0B3D2E' }}>
        <div className="flex justify-between">
          <div><span className="font-bold">{exp.company}</span> — <span>{exp.location}</span></div>
          <span className="text-[10px]" style={{ color: '#666' }}>{exp.startDate} – {exp.endDate}</span>
        </div>
        <p className="italic text-[10.5px] mb-1">{exp.title}</p>
        <ul className="space-y-0.5">
          {exp.bullets.map((b, j) => (
            <li key={j} className="flex gap-1.5">
              <span style={{ color: '#0B3D2E' }}>▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}

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

    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <SectionHead title="SKILLS" />
        {data.skills.map((s, i) => (
          <p key={i} className="mb-1"><span className="font-semibold">{s.category}:</span> {s.items.join(" · ")}</p>
        ))}
      </div>
      <div>
        {data.certifications && (
          <>
            <SectionHead title="CERTIFICATIONS" />
            {data.certifications.map((c, i) => <p key={i} className="mb-0.5">✓ {c}</p>)}
          </>
        )}
      </div>
    </div>
  </div>
);

const SectionHead = ({ title }: { title: string }) => (
  <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-2 mt-3 pb-1" style={{ borderBottom: '1px solid #ccc' }}>{title}</h2>
);
