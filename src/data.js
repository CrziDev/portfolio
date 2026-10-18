/*
 * All portfolio content lives here. Edit this file to update the site.
 * Images are optional: leave `photo` / `image` as null to show a placeholder,
 * or point them at a file such as 'assets/profile.jpg'.
 */
const PORTFOLIO = {
  profile: {
    name: 'John Michael Bughao',
    greeting: "Hi, I'm John Michael",
    handle: 'CrziDev',
    initials: 'jm',
    photo: null,
    tagline: 'Full Stack Developer with 3+ years of experience and a strong focus on backend development.',
    status: 'Open to remote work',
    location: 'Davao City, Philippines',
    phone: '+63 948 565 6248',
    email: 'jmichaelbughao@gmail.com',
    github: 'CrziDev',
    linkedin: 'jmichael-bughao',
  },

  skills: [
    { label: 'Languages', items: ['PHP', 'Go', 'Python', 'JavaScript', 'SQL'] },
    {
      label: 'Backend & frameworks',
      items: ['Laravel', 'Filament', 'Livewire', 'Queues & Jobs', 'REST API', 'React', 'Tailwind CSS', 'Alpine.js'],
    },
    { label: 'Databases', items: ['MySQL', 'PostgreSQL'] },
    {
      label: 'DevOps & tools',
      items: ['Git', 'GitHub Actions', 'CI/CD', 'Pest', 'Docker', 'Laravel Forge', 'DigitalOcean', 'Nginx', 'Linux'],
    },
    { label: 'ML / Edge', items: ['YOLO', 'SSD', 'Roboflow', 'Jetson Nano'] },
  ],

  projects: [
    {
      name: 'realestate-erp',
      type: 'Work',
      description: '34-module Laravel ERP replacing spreadsheet workflows for 50+ users across 11 departments.',
      stack: ['Laravel', 'Filament', 'MySQL'],
      image: null,
      url: null,
    },
    {
      name: 'igaming-platform',
      type: 'Freelance',
      description: 'Go and PostgreSQL backend with an idempotent central wallet and game provider integration.',
      stack: ['Go', 'PostgreSQL', 'React'],
      image: null,
      url: null,
    },
    {
      name: 'ai-medisina',
      type: 'Freelance',
      description: 'Medical chatbot with Gemini guardrails and a Roboflow model that checks image authenticity.',
      stack: ['Flask', 'JavaScript', 'Gemini'],
      image: null,
      url: null,
    },
    // TODO: these repos have no README, so the descriptions below are inferred from their names.
    {
      name: 'pos',
      type: 'Personal',
      description: 'Point-of-sale system built with Laravel and Blade.',
      stack: ['Laravel', 'PHP', 'Blade'],
      image: null,
      url: 'https://github.com/CrziDev/POS',
    },
    {
      name: 'insurance-system',
      type: 'Personal',
      description: 'Insurance management system built with Laravel and Blade.',
      stack: ['Laravel', 'PHP', 'Blade'],
      image: null,
      url: 'https://github.com/CrziDev/insurance-system',
    },
    {
      name: 'supply-chain',
      type: 'Personal',
      description: 'Supply chain management app built with Laravel and Blade.',
      stack: ['Laravel', 'PHP', 'Blade'],
      image: null,
      url: 'https://github.com/CrziDev/supply-chain',
    },
    {
      name: 'priomed',
      type: 'Personal',
      description: 'Laravel and Blade web application.',
      stack: ['Laravel', 'PHP', 'Blade'],
      image: null,
      url: 'https://github.com/CrziDev/Priomed',
    },
    {
      name: 'project-sky',
      type: 'Personal',
      description: 'Browser project written in vanilla JavaScript.',
      stack: ['JavaScript', 'HTML'],
      image: null,
      url: 'https://github.com/CrziDev/project-sky',
    },
    {
      name: 'go-rand',
      type: 'Personal',
      description: 'Small Go utility for generating random values.',
      stack: ['Go'],
      image: null,
      url: 'https://github.com/CrziDev/go-rand',
    },
  ],

  experience: [
    {
      org: 'DevBeansPh',
      meta: 'Remote',
      roles: [
        { title: 'Lead Developer', period: 'Aug 2025 – Present' },
        { title: 'Junior Developer', period: 'Aug 2024 – Jul 2025' },
      ],
      highlights: [
        'Lead 3 developers on a 34-module ERP for a real estate company, replacing spreadsheets for 50+ users across 11 departments.',
        'Own accounting (payment requests, billing, collections), sales, accounts, units, inventory and purchasing modules.',
        'Designed role-based access control with 45 roles and granular permissions in every module.',
        'Set up CI/CD: GitHub Actions runs Pest tests on every PR and Laravel Forge deploys on merge, enabling weekly releases.',
        'Provision and maintain production servers on DigitalOcean via Forge, including Nginx and MySQL.',
      ],
    },
    {
      org: 'Self-employed',
      meta: 'Part-time',
      roles: [{ title: 'Freelance Full Stack Developer', period: 'Jan 2023 – Jul 2025' }],
      highlights: [
        'Built an iGaming prototype: Go and PostgreSQL backend, React front end, idempotent wallet and third-party game provider integration.',
        'Sole developer of AI-MedisinA, a Flask and JavaScript medical chatbot using Gemini with guardrails and a Roboflow image-authenticity model.',
      ],
    },
    {
      org: 'Davao del Norte State College',
      meta: null,
      roles: [{ title: 'Backend Developer Intern', period: 'Feb 2024 – Jul 2024' }],
      highlights: [
        'Developed a PHP and MySQL request management system with notifications, event tracking and admin reports.',
        'Built a custom MVC framework in native PHP and designed the MySQL schema; deployed to the college server.',
      ],
    },
  ],

  education: {
    degree: 'BS Information Technology',
    school: 'Davao del Norte State College',
    year: '2024',
  },
};
