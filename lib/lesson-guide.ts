import {type Lesson,words} from './learning';
// Explanations are authored for Chinese-speaking beginners, not machine translations.
const guides: [string,string[],string][] = [
 ['走进一家法国面包店，先和店员打招呼。',['Bonjour !|你好！白天见面用。','Merci !|谢谢！别人帮助你后用。','Salut !|嗨！和熟人见面用。'],'先记住两件事：见面说 Bonjour，感谢说 Merci。音标可以以后再看。'],
 ['你听到 tu 和 tout：看起来接近，嘴形也接近，但声音不同。',['tu|你。舌头靠前，嘴唇收圆；字母 u 的声音。','tout|全部。舌头靠后，嘴唇收圆；字母组合 ou 的声音。'],'先听 tu，再听 tout，再交替跟读。这里练声音，不要求掌握整句的动词。'],
 ['在面包店听到 bon pain，留意两个带鼻音的元音。',['bon|好的。on 是一个鼻化元音，后面不另读 n。','pain|面包。ain 也是一个鼻化元音，和 on 不同。'],'发元音时让少量气流经过鼻腔，不在末尾加“嗯”或 ng。'],
 ['看到 eau，不必把三个字母逐个拼出来。',['eau|水。三个字母合在一起只发一个元音 /o/。','chou|卷心菜。ch 发 /ʃ/；ou 发 /u/。','jour|日、天。j 发 /ʒ/；ou 发 /u/。'],'先看字母组合，再听整个词。法语拼读不是把每个字母名连起来。'],
 ['傍晚见面、离开、准备睡觉，是三个不同场景。',['Bonsoir !|晚上好。傍晚见面时说。','Au revoir !|再见。离开时说。','Bonne nuit !|晚安。准备睡觉时说。'],'Bonne nuit 不是通用的晚间问候。想一想：是在见面、告别，还是睡前？'],
 ['别人想认识你，你先介绍自己的名字。',['Je|我。说明是谁在说话。','Je m’appelle Lin.|我叫 Lin。先把 Je m’appelle 当作“我叫”的整体。'],'把 Lin 换成自己的名字即可。现在不用背 appeler 的全部变化。'],
 ['把第一次见面的三个动作连起来。',['Bonjour !|先打招呼。','Je m’appelle Lin.|再介绍名字。','Merci !|最后表达感谢。'],'遮住法语，只看中文，试着说出三句话；忘了哪一句就只回听那一句。'],
 ['想说“我是学生”，法语需要把“是”说出来。',['Je suis|我是。suis 和 je 搭配。','étudiant|男学生。说身份时这里不用 un。','Elle est étudiante.|她是女学生。elle 搭配 est；女学生写 étudiante。'],'先掌握 je suis 和 elle est。词典原形 être 不能直接放在 je 后面。'],
 ['你有一本书，也可以用同一个动词说年龄。',['J’ai|我有。je 遇到 ai 合成 j’ai。','un livre|一本书。un 表示“一本”。','J’ai vingt ans.|我二十岁。法语用“有二十年”表达年龄。'],'先认主语，再选 avoir 的形式。年龄用 ai，不用 suis。'],
 ['给物品配“一”，要和名词一起记。',['un livre|一本书。livre 是阳性名词，所以用 un。','une table|一张桌子。table 是阴性名词，所以用 une。'],'这里的阴阳性是语法分类，不是物品真的有男女。把 un livre 当一个词组记。'],
 ['第一次说一本书，和指着那本书，是不同意思。',['un livre|一本书，还没特指哪本。','le livre|这本、那本书；对方知道是哪一本。','des livres|一些书。复数 s 通常不发音。'],'先判断一个还是多个，再判断特指还是不特指。'],
 ['你想知道对方是不是学生。',['Tu es étudiant.|你是学生。这是陈述句。','Tu es étudiant ?|你是学生吗？语序不变，语调上扬。','Est-ce que tu es étudiant ?|同一个问题。est-ce que 是放在前面的提问框架。'],'今天先用 est-ce que 提问；不要把它逐词翻译成中文。'],
 ['准备一段只有三句的自我介绍。',['Je m’appelle Lin.|说名字。','J’ai vingt ans.|说年龄：用 ai。','Je suis chinoise.|说国籍：女性 chinoise，男性 chinois。'],'每一句只做一件事。年龄用 avoir；身份和国籍用 être。'],
 ['朋友问你有没有书，你用完整短句回答。',['Tu as un livre ?|你有一本书吗？tu 和 as 搭配。','Oui, j’ai un livre.|有，我有一本书。回答时换成 j’ai。'],'问题中的“你”变成回答中的“我”时，动词也要一起改变。'],
 ['你会说法语，试着把这个动作说出来。',['Je parle français.|我说法语。je 对应 parle。','Tu parles français.|你说法语。tu 对应 parles。','Nous parlons français.|我们说法语。nous 对应 parlons。'],'parler 去掉 er 后是 parl，再按主语加词尾。parle 和 parles 听起来相同，写法不同。'],
 ['用一个简单句，描述现在做什么。',['Je regarde|我看。regarder 遇到 je 变成 regarde。','un film|一部电影，是“看”的对象。','Je regarde un film.|我看一部电影：谁 + 做什么 + 对象。'],'先说主语，再说动作，最后说对象。先把短句说完整。'],
 ['你想把“我是学生”改成“我不是学生”。',['Je suis étudiant.|我是男学生。','Je ne suis pas étudiant.|我不是男学生。ne 和 pas 把 suis 夹起来。','Je n’ai pas de livre.|我没有书。ne 在 ai 前缩为 n’；否定拥有时 un 变 de。'],'先找句子里已经变化的动词，再把 ne…pas 放在两侧。'],
 ['别人问你的年龄，先练十八岁。',['dix|十。','dix-huit|十八。写法中有连字符。','J’ai dix-huit ans.|我十八岁。用 J’ai + 数字 + ans。'],'先听数字，再跟读整个年龄短句。不要把 J’ai 改成 Je suis。'],
 ['有人问现在几点，你先学整点。',['Il est deux heures.|现在两点。这里的 il 不指某个男性。','Il est une heure.|现在一点。une heure 用单数。','Nous sommes le deux janvier.|今天是一月二日。le + 日期数字 + 月份。'],'时间和日期用两个固定模板。先分清对方问“几点”还是“几号”。'],
 ['介绍你的母亲，注意“我的”跟谁配合。',['ma mère|我的母亲。mère 是阴性，所以用 ma。','mon père|我的父亲。père 是阳性，所以用 mon。','Ma mère est française.|我的母亲是法国人。française 描述母亲，用阴性。'],'mon/ma 看后面的名词，不看说话者是男是女。'],
 ['把这周学过的动作改成“我们”。',['Je parle français.|我说法语。','Nous parlons français.|我们说法语。主语变了，动词词尾也变。','Je ne regarde pas de film.|我不看电影。否定结构夹住 regarde。'],'检查顺序：谁在做 → 动词是否匹配 → 是否有否定。'],
 ['你想告诉朋友自己要去咖啡馆。',['Je vais|我去。aller 遇到 je 变成 vais，不能按普通 er 动词变化。','au café|去咖啡馆。à 和 le 合成 au。','Je vais au café.|我去咖啡馆。'],'把 vais 和 je 一起记；把 au café 当作一个地点表达。'],
 ['朋友找不到书，你告诉他书在哪里。',['Le livre|这本书，是句子主语。','est|是、处于。这里表示所在位置，不能省略。','sur la table|在桌子上。sous 是在下面，dans 是在里面。'],'完整结构是“东西 + est + 位置”，不要按中文省掉 est。'],
 ['进书店后，先礼貌地说自己想要什么。',['Je voudrais|我想要。现在作为礼貌请求整体记。','un livre|一本书。','s’il vous plaît|请。对陌生人或店员用 vous。'],'想问价格，再说 C’est combien ? 先请求，再问价。'],
 ['坐进咖啡馆，先点单，喝完再结账。',['Un café, s’il vous plaît.|请来一杯咖啡。','Je voudrais de l’eau.|我想要水。没有指定多少水，用 de l’eau。','L’addition, s’il vous plaît.|请结账。addition 在餐厅指账单。'],'点咖啡说 café；结账说 addition。这两个场景不要弄反。'],
 ['说说你喜欢什么、平时做什么。',['J’aime le thé.|我喜欢茶。泛指喜好时用 le。','J’aime parler français.|我喜欢说法语。aime 后面的 parler 保持原形。','Je fais du sport.|我做运动。faire 遇到 je 变成 fais。'],'喜欢某物：aimer + 名词；喜欢做某事：aimer + 动词原形。'],
 ['朋友问要不要咖啡，你只需简短回应。',['Vous voulez un café ?|您想要咖啡吗？先整体听懂这个问题。','Oui, merci.|好的，谢谢。','Un café, s’il vous plaît.|请来一杯咖啡。'],'现在不需要背 vouloir 的全部变化。先听懂 café，再用已学短句回答。'],
 ['回顾这段学习：介绍自己，再说一件会做的事。',['Je suis étudiante.|我是女学生：身份用 suis。','J’ai vingt ans.|我二十岁：年龄用 ai。','Je parle français.|我说法语：je 搭配 parle。'],'先独立回答。错题只回看对应句子；通过入门课程并不等于完成整个 A1。']
];
export function lessonGuide(lesson:Lesson){
 const [scene,parts,tip]=guides[lesson.day-1];
 return {scene,parts:parts.map(p=>{const [fr,zh]=p.split('|');return {fr,zh}}),tip,words:words.filter(w=>lesson.words.includes(w.id))};
}
export const guideAudio=guides.flatMap(([,parts])=>parts.map(p=>p.split('|')[0]));
