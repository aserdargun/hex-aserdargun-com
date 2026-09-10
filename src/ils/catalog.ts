import {parseManifest,type ExperimentDefinition,type LessonDefinition} from '@aserdargun/lab-core';
import raw from '../../lab.manifest.json' with {type:'json'};
import rawExperiments from './experiments.json' with {type:'json'};
import {chapters,lessons,type Mode} from '../data/content.ts';
export const manifest=parseManifest(raw);
export const experiments=rawExperiments as ExperimentDefinition<{mode:Mode}>[];
export const pair=(v:readonly string[])=>({en:v[0],tr:v[1]});
export const guidedLesson:LessonDefinition={schemaVersion:'0.1',id:'humanoid-systems',title:manifest.lessons![0].title,concepts:manifest.concepts,steps:chapters.map((c,i)=>({id:`chapter-${i+1}`,title:pair(c.title),explanation:pair(lessons[c.lesson].summary),experimentId:c.mode,mode:c.mode,focus:[c.lesson],completion:{kind:'manual'}}))};
export function initialRoute(search:string){const p=new URLSearchParams(search),lesson=p.get('lesson')===guidedLesson.id,mode=(lesson?'explore':experiments.find(e=>e.id===p.get('mode'))?.id??'explore') as Mode;return {mode,lesson,locale:p.get('lang')==='tr'?'tr' as const:p.get('lang')==='en'?'en' as const:undefined};}
