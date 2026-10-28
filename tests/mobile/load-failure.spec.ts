import {test,expect} from '@playwright/test';
test.use({serviceWorkers:'block'});
test('脚本加载失败时显示可读的恢复提示，而非空白页面',async({page})=>{
 await page.route('**/app-*.js',route=>route.abort());await page.goto('./');await expect(page.getByRole('heading',{name:'BonjourLab 暂时无法加载'})).toBeVisible();await expect(page.getByText('请检查网络后刷新页面。学习记录保存在本机。')).toBeVisible();
});
