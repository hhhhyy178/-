export function chapterFor(day:number){
 const index=Math.min(3,Math.max(0,Math.floor((day-1)/7)));
 return [
  {fr:'Les premiers mots',zh:'最初的声音',number:'I'},
  {fr:'Une voix à soi',zh:'找到自己的表达',number:'II'},
  {fr:'La vie en français',zh:'用法语说日常',number:'III'},
  {fr:'Au fil des rencontres',zh:'在相遇中开口',number:'IV'},
 ][index];
}
