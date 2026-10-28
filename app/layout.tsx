import type {Metadata} from 'next';
import './globals.css';
import './editorial.css';
import './atelier.css';
import './artwork.css';
import './carnet.css';
export const metadata:Metadata={title:'BonjourLab · 每天一点，离法语更近',description:'面向中文初学者的法语学习实验室'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
