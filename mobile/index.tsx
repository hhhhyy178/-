import React from 'react';
import {createRoot} from 'react-dom/client';
import Workspace from '../components/Workspace';
import '../app/globals.css';
import '../app/editorial.css';
class ErrorBoundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true}}render(){if(this.state.error)return <main><h1>BonjourLab 暂时无法打开</h1><p>请关闭后用 Safari 普通模式重新打开。请勿清理网站数据，以免删除已有学习记录。</p><button onClick={()=>location.reload()}>重新加载</button></main>;return this.props.children}}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><Workspace/></ErrorBoundary>);
