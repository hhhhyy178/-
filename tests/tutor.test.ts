import {it,expect,afterEach,vi} from 'vitest';
import {askAI,offline} from '../lib/tutor';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs()});
it('无密钥规则纠错兼顾男女形式，不伪装大模型',()=>{const answer=offline('Je suis une étudiant.','纠错','');expect(answer).toContain('une étudiante');expect(answer).toContain('un étudiant')});
it('OpenAI 兼容调用传递服务端配置与诊断上下文',async()=>{
 vi.stubEnv('AI_API_KEY','test-only-token');vi.stubEnv('AI_BASE_URL','https://example.test/v1');vi.stubEnv('AI_MODEL','test-model');const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({choices:[{message:{content:'解释'}}]}),{status:200}));vi.stubGlobal('fetch',fetcher);expect(await askAI('为什么用 suis','讲解','A0，être错误2次')).toBe('解释');const [url,init]=fetcher.mock.calls[0];expect(url).toBe('https://example.test/v1/chat/completions');expect(init.headers.Authorization).toBe('Bearer test-only-token');expect(JSON.parse(init.body).messages[0].content).toContain('A0，être错误2次');
});
it('AI 服务错误不伪造成功答案',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('',{status:429})));await expect(askAI('你好','讲解','')).rejects.toThrow('429')});
