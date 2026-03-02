// Tech Template 4: Data Science - Metrics focused layout
import { ResumeData } from "@/types/resume";

export const DataScience = ({ data }: { data: ResumeData }) => (
  <div className="font-source p-8 text-[11px]" style={{ color: '#1a1a1a' }}>
    <div className="text-center mb-5 pb-4" style={{ borderBottom: '2px solid #059669' }}>
      <h1 className="text-xl font-bold">{data.header.name}</h1>
      <p className="text-[10px] mt-1" style={{ color: '#059669' }}>{data.header.title}</p>
      <div className="flex justify-center gap-3 mt-2 text-[10px]" style={{ color: '#666' }}>
        {[data.header.email, data.header.phone, data.header.linkedin].filter(Boolean).map((c, i) => <span key={i}>{c}</span>)}
      </div>
    </div>

    <p className="mb-4 text-center" style={{ color: '#444' }}>{data.summary}</p>

    {/* Skills as a matrix */}
    <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded" style={{ background: '#f0fdf4' }}>
      {data.skills.map((s, i) => (
        <div key={i}>
          <p className="font-bold text-[9px] uppercase mb-1" style={{ color: '#059669' }}>{s.category}</p>
          <div className="flex flex-wrap gap-1">
            {s.items.map((item, j) => (
              <span key={j} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#dcfce7' }}>{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>

    <DH>Experience</DH>
    {data.experience.map((exp, i) => (
      <div key={i} className="mb-4">
        <div className="flex justify-between items-baseline">
          <h3 className="font-bold text-xs">{exp.title} <span style={{ color: '#059669' }}>@ {exp.company}</span></h3>
          <span className="text-[10px]" style={{ color: '#999' }}>{exp.startDate} – {exp.endDate}</span>
        </div>
        <ul className="mt-1 space-y-0.5">
          {exp.bullets.map((b, j) => (
            <li key={j} className="flex gap-1.5">
              <span style={{ color: '#059669' }}>▪</span><span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}

    <div className="grid grid-cols-2 gap-6">
      <div>
        <DH>Education</DH>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold text-[10.5px]">{edu.degree}</p>
            <p className="text-[10px]" style={{ color: '#666' }}>{edu.school} · {edu.endDate}{edu.gpa && ` · GPA: ${edu.gpa}`}</p>
          </div>
        ))}
      </div>
      <div>
        {data.projects && (
          <>
            <DH>Key Projects</DH>
            {data.projects.map((p, i) => (
              <div key={i} className="mb-2">
                <p className="font-bold text-[10.5px]">{p.name}</p>
                <p className="text-[9px]" style={{ color: '#059669' }}>{p.tech}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  </div>
);

const DH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold mb-2 mt-4 pb-1 flex items-center gap-2" style={{ borderBottom: '1px solid #d1d5db' }}>
    <span className="w-2 h-2 rounded-full" style={{ background: '#059669' }} />{children}
  </h2>
);
