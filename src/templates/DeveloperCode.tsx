// Tech Template 1: Developer Code - Monospace accents, code-inspired
import { ResumeData } from "@/types/resume";

export const DeveloperCode = ({ data }: { data: ResumeData }) => (
  <div className="font-mono-code p-7 text-[10.5px]" style={{ color: '#e0e0e0', background: '#1e1e2e' }}>
    <div className="mb-5">
      <p style={{ color: '#6c7086' }}>{'// resume.ts'}</p>
      <h1 className="text-xl font-bold" style={{ color: '#89b4fa' }}>
        <span style={{ color: '#cba6f7' }}>const</span> {data.header.name.replace(' ', '_')} = {'{'} 
      </h1>
      <div className="pl-4 text-[10px]" style={{ color: '#a6adc8' }}>
        <p>email: "{data.header.email}",</p>
        <p>phone: "{data.header.phone}",</p>
        {data.header.linkedin && <p>linkedin: "{data.header.linkedin}",</p>}
      </div>
      <p style={{ color: '#89b4fa' }}>{'}'}</p>
    </div>

    <Comment text="Summary" />
    <p className="mb-4 pl-4" style={{ color: '#a6e3a1' }}>"{data.summary}"</p>

    <Comment text="Experience" />
    {data.experience.map((exp, i) => (
      <div key={i} className="mb-4 pl-4">
        <p><span style={{ color: '#cba6f7' }}>role:</span> <span style={{ color: '#f9e2af' }}>"{exp.title}"</span> <span style={{ color: '#6c7086' }}>@ {exp.company} | {exp.startDate}–{exp.endDate}</span></p>
        {exp.bullets.map((b, j) => (
          <p key={j} className="pl-2" style={{ color: '#bac2de' }}>→ {b}</p>
        ))}
      </div>
    ))}

    <Comment text="Education" />
    {data.education.map((edu, i) => (
      <p key={i} className="pl-4 mb-1"><span style={{ color: '#f9e2af' }}>{edu.degree}</span> <span style={{ color: '#6c7086' }}>| {edu.school} | {edu.endDate}</span></p>
    ))}

    <Comment text="Skills" />
    <div className="pl-4 flex flex-wrap gap-1.5 mt-1">
      {data.skills.flatMap(s => s.items).map((item, i) => (
        <span key={i} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: '#313244', color: '#89b4fa' }}>{item}</span>
      ))}
    </div>

    {data.projects && (
      <>
        <Comment text="Projects" />
        {data.projects.map((p, i) => (
          <div key={i} className="pl-4 mb-2">
            <p><span style={{ color: '#a6e3a1' }}>{p.name}</span>{p.tech && <span style={{ color: '#6c7086' }}> [{p.tech}]</span>}</p>
            {p.bullets.map((b, j) => <p key={j} className="pl-2" style={{ color: '#bac2de' }}>→ {b}</p>)}
          </div>
        ))}
      </>
    )}
  </div>
);

const Comment = ({ text }: { text: string }) => (
  <p className="mt-3 mb-1" style={{ color: '#6c7086' }}>{'// ─── '}{text}{' ───'}</p>
);
