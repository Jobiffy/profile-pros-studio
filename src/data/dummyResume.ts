import { ResumeData } from "@/types/resume";

export const dummyResume: ResumeData = {
  header: {
    name: "John Doe",
    title: "Software Engineer | Full Stack Developer",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/johndoe",
    location: "San Francisco, CA",
    website: "johndoe.dev",
  },
  summary:
    "Results-driven software engineer with 5+ years of experience designing and building scalable web applications. Proficient in modern JavaScript frameworks, cloud infrastructure, and agile methodologies. Passionate about clean code, user experience, and delivering impactful products.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Solutions Inc.",
      location: "San Francisco, CA",
      startDate: "03/2022",
      endDate: "Present",
      bullets: [
        "Led development of a customer-facing dashboard serving 50K+ daily active users, improving page load times by 40%",
        "Architected microservices infrastructure on AWS, reducing deployment time from 2 hours to 15 minutes",
        "Mentored a team of 4 junior developers through code reviews and pair programming sessions",
      ],
    },
    {
      title: "Software Engineer",
      company: "Digital Innovations LLC",
      location: "Austin, TX",
      startDate: "06/2019",
      endDate: "02/2022",
      bullets: [
        "Built and maintained RESTful APIs handling 10M+ requests per day with 99.9% uptime",
        "Implemented CI/CD pipelines using GitHub Actions, reducing release cycle from weekly to daily",
        "Collaborated with product and design teams to ship 12 major features over 18 months",
      ],
    },
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.8/4.0",
    },
  ],
  skills: [
    { category: "Languages", items: ["JavaScript", "TypeScript", "Python", "Go", "SQL"] },
    { category: "Frameworks", items: ["React", "Node.js", "Next.js", "Express", "Django"] },
    { category: "Tools & Cloud", items: ["AWS", "Docker", "Kubernetes", "Git", "PostgreSQL", "Redis"] },
  ],
  projects: [
    {
      name: "TaskFlow – Project Management App",
      description: "A real-time collaborative project management tool",
      tech: "React, Node.js, WebSocket, PostgreSQL",
      bullets: [
        "Built real-time collaboration features supporting 100+ concurrent users per workspace",
        "Implemented drag-and-drop Kanban boards with optimistic UI updates",
      ],
    },
    {
      name: "HealthTrack – Fitness Dashboard",
      description: "Personal fitness tracking and analytics platform",
      tech: "Next.js, Chart.js, Supabase",
      bullets: [
        "Designed responsive dashboard with interactive charts and goal tracking",
        "Integrated with third-party fitness APIs for automated data sync",
      ],
    },
  ],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "Google Professional Cloud Developer",
    "Certified Kubernetes Application Developer (CKAD)",
  ],
  leadership: [
    {
      role: "Tech Lead",
      org: "Open Source Community, Bay Area",
      date: "2021–Present",
      bullets: [
        "Organized monthly hackathons with 50+ participants",
        "Contributed to 5+ open-source projects with 500+ GitHub stars",
      ],
    },
  ],
};
