// Generic Template 4: Minimalist Type - Ultra-clean, typography-focused
import { ResumeData } from "@/types/resume";

export const MinimalistType = ({ data }: { data: ResumeData }) => (
  <div className="p-12 text-[11px] font-light" style={{ color: '#333', fontFamily: "'Inter', sans-serif" }}>
    <div className="mb-10">
      <h1 className="text-3xl font-extralight tracking-tight">{data.header.name}</h1>
      <div className="w-8 h-px mt-3 mb-2" style={{ background: '#333' }} />
      <div className="flex gap-6 text-[10px]" style={{ color: '#aaa' }}>
        <span>{data.header.email}</span>
        <span>{data.header.phone}</span>
        {data.header.linkedin && <span>{data.header.linkedin}</span>}
      </div>
    </div>

    <p className="mb-10 leading-relaxed max-w-[85%]" style={{ color: '#777' }}>{data.summary}</p>

    <MinH>Experience</MinH>
    {data.experience.map((exp, i) => (
      <div key={i} className="mb-6 grid grid-cols-[120px_1fr] gap-4">
        <div className="text-[10px]" style={{ color: '#bbb' }}>
          <p>{exp.startDate}</p>
          <p>{exp.endDate}</p>
        </div>
        <div>
          <h3 className="font-medium">{exp.title}</h3>
          <p className="text-[10px] mb-1.5" style={{ color: '#999' }}>{exp.company}</p>
          {exp.bullets.map((b, j) => <p key={j} className="mb-0.5" style={{ color: '#555' }}>{b}</p>)}
        </div>
      </div>
    ))}

    <MinH>Education</MinH>
    {data.education.map((edu, i) => (
      <div key={i} className="mb-3 grid grid-cols-[120px_1fr] gap-4">
        <span className="text-[10px]" style={{ color: '#bbb' }}>{edu.endDate}</span>
        <div>
          <p className="font-medium">{edu.degree}</p>
          <p className="text-[10px]" style={{ color: '#999' }}>{edu.school}{edu.gpa && ` · ${edu.gpa}`}</p>
        </div>
      </div>
    ))}

    <MinH>Skills</MinH>
    <p style={{ color: '#777' }}>
      {data.skills.flatMap(s => s.items).join("  ·  ")}
    </p>
  </div>
);

const MinH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[9px] uppercase tracking-[0.3em] mb-4 mt-8" style={{ color: '#bbb' }}>{children}</h2>
);
