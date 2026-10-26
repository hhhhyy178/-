export const modes=['讲解','纠错','对话','引导练习','复习诊断'] as const;
export function offline(message:string,mode:string,weak:string){
 if(mode==='复习诊断')return `本地规则诊断：${weak||'尚无答题记录，请先完成第一节课。'}。建议先阅读对应课程，再主动回忆并重试错误题。此建议仅依据你的真实答题记录。`;
 if(/une étudiant/.test(message))return '规则纠错：une étudiant 的冠词与名词性别不一致。男性：un étudiant；女性：une étudiante。单纯介绍职业通常说 Je suis étudiant / Je suis étudiante，不加冠词。请根据说话者性别选择。';
 if(mode==='引导练习'){
 if(/完整|答案|解析/.test(message))return '离线练习解析：Je suis étudiant。主语 je 对应 être 的 suis，表示“我是男学生”。女性可用 Je suis étudiante。再试 Tu ___ étudiant（tu 对应 es）。';
 if(/二级/.test(message))return '离线练习（二级提示）：Je ___ étudiant。être 的原形不能直接放在 je 后面；回想 je 的变位，开头是 s，共四个字母。';
 return '离线练习（一级提示）：补全 Je ___ étudiant。先确定主语，再回想表示“是”的动词 être。输入“二级提示”或“完整解析”可以继续。';
 }
 if(/suis|être/.test(message))return '离线讲解：être 表示“是”。它随主语变位：je suis、tu es、il/elle est、nous sommes、vous êtes、ils/elles sont。Je suis étudiant 表示“我是男学生”。试一试：Elle ___ étudiante，主语换成 elle 后应该用什么？';
 if(mode==='对话')return '离线固定情境 · 咖啡馆：Bonjour ! Un café ?（你好！来杯咖啡吗？）你可以用 Oui, merci. 回应。此模式是预设示例，不具备自由对话能力。';
 return '当前为离线资料模式，不能自由理解所有问题。可以询问 suis / être 或 une étudiant，获得规则讲解；其他知识请查询语法知识库。桌面服务端版配置 AI 后可进行自由提问；手机本地版不保存 API 密钥。';
}
