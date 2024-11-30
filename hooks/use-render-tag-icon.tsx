import { AiOutlineCloudSync } from 'react-icons/ai'
import { DiPython } from 'react-icons/di'
import { FaDocker, FaNodeJs, FaReact } from 'react-icons/fa'
import {
  SiRedux,
  SiTypescript,
  SiJavascript,
  SiExpress,
  SiMongodb,
  SiVite,
  SiPython,
  SiTailwindcss,
  SiGithubactions,
  SiFirebase,
  SiJest,
  SiTestinglibrary,
} from 'react-icons/si'
import { TbJson } from 'react-icons/tb'

const techStack: Record<
  string,
  {
    icon: JSX.Element
    color: string
    name: string
  }
> = {
  Docker: {
    icon: <FaDocker size={24} />,
    color: '#2496ED',
    name: 'Docker',
  },
  ReactJS: {
    icon: <FaReact size={24} />,
    color: '#61DAFB',
    name: 'ReactJS',
  },
  NodeJS: { icon: <FaNodeJs size={24} />, color: '#339933', name: 'NodeJS' },
  Redux: { icon: <SiRedux size={24} />, color: '#764ABC', name: 'Redux' },
  TypeScript: { icon: <SiTypescript size={24} />, color: '#3178C6', name: 'TypeScript' },
  JavaScript: { icon: <SiJavascript size={24} />, color: '#F7DF1E', name: 'JavaScript' },
  ExpressJS: { icon: <SiExpress size={24} />, color: '#000000', name: 'ExpressJS' },
  MongoDB: { icon: <SiMongodb size={24} />, color: '#47A248', name: 'MongoDB' },
  Python: { icon: <SiPython size={24} />, color: '#3776AB', name: 'Python' },
  TailwindCSS: { icon: <SiTailwindcss size={24} />, color: '#06B6D4', name: 'TailwindCSS' },
  Vite: { icon: <SiVite size={24} />, color: '#646CFF', name: 'Vite' },
  Gradio: { icon: <DiPython size={24} />, color: '#FF7C00', name: 'Gradio' },
  Faker: { icon: <DiPython size={24} />, color: '#7F5AB6', name: 'Faker' },
  'Stable Diffusion': {
    icon: <AiOutlineCloudSync size={24} />,
    color: '#5C3EE8',
    name: 'Stable Diffusion',
  },
  'JSON Server': { icon: <TbJson size={24} />, color: '#000000', name: 'JSON Server' },
  'GitHub Action': {
    icon: <SiGithubactions size={24} />,
    name: 'GitHub Actions',
    color: '#2088FF',
  },
  'React Tesing Library': {
    icon: <SiTestinglibrary size={24} />,
    name: 'Testing Library',
    color: '#E33332',
  },
  Jest: { icon: <SiJest size={24} />, name: 'Jest', color: '#C21325' },
  Firebase: { icon: <SiFirebase size={24} />, name: 'Firebase', color: '#FFCA28' },
  default: { icon: <FaReact size={24} />, color: '#61DAFB', name: 'ReactJS' },
}
export function useRenderTagIcon(tagList: string[]) {
  if (!tagList || tagList.length === 0) return []
  return tagList.map((tag) => {
    return techStack?.[tag] || techStack.default
  })
}
