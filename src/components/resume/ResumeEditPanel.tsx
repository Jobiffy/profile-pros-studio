import { motion, AnimatePresence } from "framer-motion";
import { ResumeData } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User, Briefcase, GraduationCap, Wrench, FolderOpen, Award, Users,
  FileText, Plus, Trash2, ChevronDown, X, type LucideIcon
} from "lucide-react";
import { useState } from "react";

interface Props {
  data: ResumeData;
  onUpdateHeader: (key: keyof ResumeData["header"], value: string) => void;
  onUpdateSummary: (value: string) => void;
  onUpdateExperience: (index: number, field: string, value: unknown) => void;
  onUpdateEducation: (index: number, field: string, value: unknown) => void;
  onUpdateField: (field: string, value: unknown) => void;
  onAddExperience: () => void;
  onRemoveExperience: (i: number) => void;
  onAddEducation: () => void;
  onRemoveEducation: (i: number) => void;
  onAddSkillCategory: () => void;
  onRemoveSkillCategory: (i: number) => void;
  onAddProject: () => void;
  onRemoveProject: (i: number) => void;
  onAddCertification: () => void;
  onRemoveCertification: (i: number) => void;
  onAddLeadership: () => void;
  onRemoveLeadership: (i: number) => void;
  onAddBullet: (section: "experience" | "projects" | "leadership", index: number) => void;
  onRemoveBullet: (section: "experience" | "projects" | "leadership", itemIdx: number, bulletIdx: number) => void;
}

const sectionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" as const, transition: { duration: 0.3, ease: "easeOut" as const } },
};

function SectionToggle({
  icon: Icon, label, children, defaultOpen = false, onAdd, addLabel
}: {
  icon: LucideIcon; label: string; children: React.ReactNode; defaultOpen?: boolean;
  onAdd?: () => void; addLabel?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
        <Icon size={16} className="text-primary shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={sectionVariants} className="overflow-hidden">
            <div className="px-5 pb-4 space-y-3">
              {children}
              {onAdd && (
                <button
                  onClick={onAdd}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Plus size={12} /> {addLabel || "Add"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm bg-background border-border/60 focus:border-primary" />
    </div>
  );
}

function ItemCard({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2 relative group"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 size={12} />
        </button>
      )}
      {children}
    </motion.div>
  );
}

export function ResumeEditPanel(props: Props) {
  const { data, onUpdateHeader, onUpdateSummary, onUpdateExperience, onUpdateEducation, onUpdateField } = props;

  return (
    <ScrollArea className="h-full">
      <div className="pb-8">
        {/* Personal Info */}
        <SectionToggle icon={User} label="Personal Info" defaultOpen>
          <FieldInput label="Full Name" value={data.header.name} onChange={v => onUpdateHeader("name", v)} />
          <FieldInput label="Title / Headline" value={data.header.title} onChange={v => onUpdateHeader("title", v)} />
          <div className="grid grid-cols-2 gap-2">
            <FieldInput label="Email" value={data.header.email} onChange={v => onUpdateHeader("email", v)} />
            <FieldInput label="Phone" value={data.header.phone} onChange={v => onUpdateHeader("phone", v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FieldInput label="Location" value={data.header.location || ""} onChange={v => onUpdateHeader("location", v)} />
            <FieldInput label="LinkedIn" value={data.header.linkedin || ""} onChange={v => onUpdateHeader("linkedin", v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FieldInput label="GitHub" value={data.header.github || ""} onChange={v => onUpdateHeader("github", v)} />
            <FieldInput label="Website" value={data.header.website || ""} onChange={v => onUpdateHeader("website", v)} />
          </div>
        </SectionToggle>

        {/* Summary */}
        <SectionToggle icon={FileText} label="Professional Summary">
          <Textarea value={data.summary} onChange={e => onUpdateSummary(e.target.value)} rows={4} className="text-sm bg-background border-border/60 focus:border-primary resize-none" placeholder="Write a compelling professional summary..." />
        </SectionToggle>

        {/* Work Experience */}
        <SectionToggle icon={Briefcase} label={`Experience (${data.experience.length})`} onAdd={props.onAddExperience} addLabel="Add Experience">
          {data.experience.map((exp, i) => (
            <ItemCard key={i} onRemove={() => props.onRemoveExperience(i)}>
              <FieldInput label="Job Title" value={exp.title} onChange={v => onUpdateExperience(i, "title", v)} />
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Company" value={exp.company} onChange={v => onUpdateExperience(i, "company", v)} />
                <FieldInput label="Location" value={exp.location} onChange={v => onUpdateExperience(i, "location", v)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Start Date" value={exp.startDate} onChange={v => onUpdateExperience(i, "startDate", v)} />
                <FieldInput label="End Date" value={exp.endDate} onChange={v => onUpdateExperience(i, "endDate", v)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bullet Points</Label>
                {exp.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-1 group/bullet">
                    <span className="text-primary mt-2 text-xs">•</span>
                    <Textarea value={b} onChange={e => {
                      const bullets = [...exp.bullets];
                      bullets[bi] = e.target.value;
                      onUpdateExperience(i, "bullets", bullets);
                    }} rows={2} className="text-xs bg-background border-border/60 resize-none flex-1" />
                    <button
                      onClick={() => props.onRemoveBullet("experience", i, bi)}
                      className="w-5 h-5 mt-1.5 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover/bullet:opacity-100 hover:text-destructive transition-all"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => props.onAddBullet("experience", i)}
                  className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 transition-colors"
                >
                  <Plus size={10} /> Add bullet
                </button>
              </div>
            </ItemCard>
          ))}
        </SectionToggle>

        {/* Education */}
        <SectionToggle icon={GraduationCap} label={`Education (${data.education.length})`} onAdd={props.onAddEducation} addLabel="Add Education">
          {data.education.map((edu, i) => (
            <ItemCard key={i} onRemove={() => props.onRemoveEducation(i)}>
              <FieldInput label="Degree" value={edu.degree} onChange={v => onUpdateEducation(i, "degree", v)} />
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="School" value={edu.school} onChange={v => onUpdateEducation(i, "school", v)} />
                <FieldInput label="Location" value={edu.location} onChange={v => onUpdateEducation(i, "location", v)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Start" value={edu.startDate} onChange={v => onUpdateEducation(i, "startDate", v)} />
                <FieldInput label="End" value={edu.endDate} onChange={v => onUpdateEducation(i, "endDate", v)} />
              </div>
              <FieldInput label="GPA" value={edu.gpa || ""} onChange={v => onUpdateEducation(i, "gpa", v)} />
            </ItemCard>
          ))}
        </SectionToggle>

        {/* Skills */}
        <SectionToggle icon={Wrench} label={`Skills (${data.skills.length} categories)`} onAdd={props.onAddSkillCategory} addLabel="Add Skill Category">
          {data.skills.map((skill, i) => (
            <ItemCard key={i} onRemove={() => props.onRemoveSkillCategory(i)}>
              <FieldInput label="Category Name" value={skill.category} onChange={v => {
                const skills = [...data.skills];
                skills[i] = { ...skills[i], category: v };
                onUpdateField("skills", skills);
              }} />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Skills (comma separated)</Label>
                <Input value={skill.items.join(", ")} onChange={e => {
                  const skills = [...data.skills];
                  skills[i] = { ...skills[i], items: e.target.value.split(",").map(s => s.trim()).filter(Boolean) };
                  onUpdateField("skills", skills);
                }} className="h-8 text-sm bg-background border-border/60" placeholder="e.g. Python, SQL, Excel" />
              </div>
            </ItemCard>
          ))}
        </SectionToggle>

        {/* Projects */}
        <SectionToggle icon={FolderOpen} label={`Projects (${(data.projects || []).length})`} onAdd={props.onAddProject} addLabel="Add Project">
          {(data.projects || []).map((proj, i) => (
            <ItemCard key={i} onRemove={() => props.onRemoveProject(i)}>
              <FieldInput label="Project Name" value={proj.name} onChange={v => {
                const projects = [...(data.projects || [])];
                projects[i] = { ...projects[i], name: v };
                onUpdateField("projects", projects);
              }} />
              <FieldInput label="Description" value={proj.description} onChange={v => {
                const projects = [...(data.projects || [])];
                projects[i] = { ...projects[i], description: v };
                onUpdateField("projects", projects);
              }} />
              <FieldInput label="Technologies" value={proj.tech || ""} onChange={v => {
                const projects = [...(data.projects || [])];
                projects[i] = { ...projects[i], tech: v };
                onUpdateField("projects", projects);
              }} />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bullet Points</Label>
                {proj.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-1 group/bullet">
                    <span className="text-primary mt-2 text-xs">•</span>
                    <Textarea value={b} onChange={e => {
                      const projects = [...(data.projects || [])];
                      const bullets = [...proj.bullets];
                      bullets[bi] = e.target.value;
                      projects[i] = { ...projects[i], bullets };
                      onUpdateField("projects", projects);
                    }} rows={2} className="text-xs bg-background border-border/60 resize-none flex-1" />
                    <button
                      onClick={() => props.onRemoveBullet("projects", i, bi)}
                      className="w-5 h-5 mt-1.5 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover/bullet:opacity-100 hover:text-destructive transition-all"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => props.onAddBullet("projects", i)}
                  className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 transition-colors"
                >
                  <Plus size={10} /> Add bullet
                </button>
              </div>
            </ItemCard>
          ))}
        </SectionToggle>

        {/* Certifications */}
        <SectionToggle icon={Award} label={`Certifications (${(data.certifications || []).length})`} onAdd={props.onAddCertification} addLabel="Add Certification">
          {(data.certifications || []).map((cert, i) => (
            <ItemCard key={i} onRemove={() => props.onRemoveCertification(i)}>
              <Input value={cert} onChange={e => {
                const certs = [...(data.certifications || [])];
                certs[i] = e.target.value;
                onUpdateField("certifications", certs);
              }} className="h-8 text-sm bg-background border-border/60" placeholder="Certification name" />
            </ItemCard>
          ))}
        </SectionToggle>

        {/* Leadership */}
        <SectionToggle icon={Users} label={`Leadership (${(data.leadership || []).length})`} onAdd={props.onAddLeadership} addLabel="Add Leadership Role">
          {(data.leadership || []).map((lead, i) => (
            <ItemCard key={i} onRemove={() => props.onRemoveLeadership(i)}>
              <FieldInput label="Role" value={lead.role} onChange={v => {
                const leadership = [...(data.leadership || [])];
                leadership[i] = { ...leadership[i], role: v };
                onUpdateField("leadership", leadership);
              }} />
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Organization" value={lead.org} onChange={v => {
                  const leadership = [...(data.leadership || [])];
                  leadership[i] = { ...leadership[i], org: v };
                  onUpdateField("leadership", leadership);
                }} />
                <FieldInput label="Date" value={lead.date} onChange={v => {
                  const leadership = [...(data.leadership || [])];
                  leadership[i] = { ...leadership[i], date: v };
                  onUpdateField("leadership", leadership);
                }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bullet Points</Label>
                {lead.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-1 group/bullet">
                    <span className="text-primary mt-2 text-xs">•</span>
                    <Textarea value={b} onChange={e => {
                      const leadership = [...(data.leadership || [])];
                      const bullets = [...lead.bullets];
                      bullets[bi] = e.target.value;
                      leadership[i] = { ...leadership[i], bullets };
                      onUpdateField("leadership", leadership);
                    }} rows={2} className="text-xs bg-background border-border/60 resize-none flex-1" />
                    <button
                      onClick={() => props.onRemoveBullet("leadership", i, bi)}
                      className="w-5 h-5 mt-1.5 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover/bullet:opacity-100 hover:text-destructive transition-all"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => props.onAddBullet("leadership", i)}
                  className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 transition-colors"
                >
                  <Plus size={10} /> Add bullet
                </button>
              </div>
            </ItemCard>
          ))}
        </SectionToggle>

        {/* Custom Sections */}
        {(data.customSections || []).map((sec, si) => (
          <SectionToggle
            key={`custom_${si}`}
            icon={FileText}
            label={sec.title || `Custom Section ${si + 1}`}
            onAdd={() => {
              const customs = [...(data.customSections || [])];
              customs[si] = { ...customs[si], items: [...customs[si].items, { subtitle: "", description: "", bullets: [""] }] };
              onUpdateField("customSections", customs);
            }}
            addLabel="Add Item"
          >
            <FieldInput
              label="Section Title"
              value={sec.title}
              onChange={v => {
                const customs = [...(data.customSections || [])];
                customs[si] = { ...customs[si], title: v };
                onUpdateField("customSections", customs);
              }}
            />
            {sec.items.map((item, ii) => (
              <ItemCard
                key={ii}
                onRemove={() => {
                  const customs = [...(data.customSections || [])];
                  customs[si] = { ...customs[si], items: customs[si].items.filter((_, idx) => idx !== ii) };
                  onUpdateField("customSections", customs);
                }}
              >
                <FieldInput
                  label="Subtitle"
                  value={item.subtitle || ""}
                  onChange={v => {
                    const customs = structuredClone(data.customSections || []);
                    customs[si].items[ii].subtitle = v;
                    onUpdateField("customSections", customs);
                  }}
                />
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Textarea
                    value={item.description || ""}
                    onChange={e => {
                      const customs = structuredClone(data.customSections || []);
                      customs[si].items[ii].description = e.target.value;
                      onUpdateField("customSections", customs);
                    }}
                    rows={2}
                    className="text-xs bg-background border-border/60 resize-none"
                    placeholder="Description..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Bullet Points</Label>
                  {(item.bullets || []).map((b, bi) => (
                    <div key={bi} className="flex gap-1 group/bullet">
                      <span className="text-primary mt-2 text-xs">•</span>
                      <Textarea
                        value={b}
                        onChange={e => {
                          const customs = structuredClone(data.customSections || []);
                          const bullets = [...(customs[si].items[ii].bullets || [])];
                          bullets[bi] = e.target.value;
                          customs[si].items[ii].bullets = bullets;
                          onUpdateField("customSections", customs);
                        }}
                        rows={2}
                        className="text-xs bg-background border-border/60 resize-none flex-1"
                      />
                      <button
                        onClick={() => {
                          const customs = structuredClone(data.customSections || []);
                          customs[si].items[ii].bullets.splice(bi, 1);
                          onUpdateField("customSections", customs);
                        }}
                        className="w-5 h-5 mt-1.5 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover/bullet:opacity-100 hover:text-destructive transition-all"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const customs = structuredClone(data.customSections || []);
                      if (!customs[si].items[ii].bullets) customs[si].items[ii].bullets = [];
                      customs[si].items[ii].bullets.push("");
                      onUpdateField("customSections", customs);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 transition-colors"
                  >
                    <Plus size={10} /> Add bullet
                  </button>
                </div>
              </ItemCard>
            ))}
          </SectionToggle>
        ))}
      </div>
    </ScrollArea>
  );
}
