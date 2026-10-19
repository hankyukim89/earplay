export const syllables=['Do','Re','Mi','Fa','Sol','La','Ti'];
export const scale=[0,2,4,5,7,9,11];
export const keys=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const scales={
 major:{name:'Major',steps:[0,2,4,5,7,9,11]},minor:{name:'Natural minor',steps:[0,2,3,5,7,8,10]},both:{name:'Major + minor',steps:[0,2,3,4,5,7,8,9,10,11]},
 dorian:{name:'Dorian',steps:[0,2,3,5,7,9,10]},phrygian:{name:'Phrygian',steps:[0,1,3,5,7,8,10]},lydian:{name:'Lydian',steps:[0,2,4,6,7,9,11]},mixolydian:{name:'Mixolydian',steps:[0,2,4,5,7,9,10]},locrian:{name:'Locrian',steps:[0,1,3,5,6,8,10]},
 pentatonic:{name:'Major pentatonic',steps:[0,2,4,7,9]},minorPentatonic:{name:'Minor pentatonic',steps:[0,3,5,7,10]},harmonic:{name:'Harmonic minor',steps:[0,2,3,5,7,8,11]},melodic:{name:'Melodic minor',steps:[0,2,3,5,7,9,11]},chromatic:{name:'Chromatic',steps:[0,1,2,3,4,5,6,7,8,9,10,11]}};
export function pitches(config){return Array.from({length:config.high-config.low+1},(_,i)=>config.low+i).filter(n=>scales[config.scale].steps.includes((n+120)%12));}
export function noteLabel(offset){const names=['Do','Di','Re','Me','Mi','Fa','Fi','Sol','Le','La','Te','Ti'];return names[(offset+120)%12]+(offset<0?' ↓':offset>=12?' '+ '↑'.repeat(Math.floor(offset/12)):'');}
export const levels=[
 ['First steps',0,4,'major'],['Add Fa',0,5,'major'],['Up to Sol',0,7,'major'],['Add La',0,9,'major'],['All seven',0,11,'major'],['Upper Do',0,12,'major'],
 ['Lower Ti',-1,12,'major'],['Lower La',-3,12,'major'],['Lower Sol',-5,12,'major'],['Minor',-5,12,'minor'],['Major + minor',-5,12,'both'],['Pentatonic',-5,12,'pentatonic'],['Minor pentatonic',-5,12,'minorPentatonic'],['Dorian',-5,12,'dorian'],['Mixolydian',-5,12,'mixolydian'],['Lydian',-5,12,'lydian'],['Phrygian',-5,12,'phrygian'],['Locrian',-5,12,'locrian'],['Harmonic minor',-5,12,'harmonic'],['Melodic minor',-5,12,'melodic'],['Chromatic',-5,12,'chromatic']
].map(([name,low,high,scale],i)=>({id:'level-'+i,name,low,high,scale,length:5}));
export function melody(config){const pool=pitches(typeof config==='number'?levels[config]:config);return Array.from({length:5},(_,i)=>i===0?pool.indexOf(0):Math.floor(Math.random()*pool.length));}
let context;const buffers=new Map();let active=[];
function withTimeout(promise,ms,message){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms)})]).finally(()=>clearTimeout(timer));}
// Called synchronously by lesson and Play taps, before any effects or fetching.
export async function unlockAudio(){
 const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!Audio)throw new Error('Audio is not supported in this browser. Open this page in Safari or Chrome.');
 try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch{/* Optional on older browsers. */}
 if(!context||context.state==='closed'){context=new Audio();buffers.clear();}
 const c=context;
 const resumed=c.state==='running'?Promise.resolve():c.resume();
 const silent=c.createBufferSource();silent.buffer=c.createBuffer(1,1,c.sampleRate);silent.connect(c.destination);silent.start(0);
 await withTimeout(resumed,4000,'Audio is blocked. Tap Play melody to enable sound.');
 if(c.state!=='running')throw new Error('Audio is paused. Tap Play melody to enable sound.');
 return c;
}
async function buffer(midi,instrument){const id=instrument+':'+midi;if(!buffers.has(id)){const name=keys[midi%12]+(Math.floor(midi/12)-1);buffers.set(id,withTimeout(fetch(`${import.meta.env.BASE_URL}audio/${instrument==='guitar'?'guitar/':instrument==='steel'?'steel/':''}${name}.mp3`),15000,'Sound download timed out. Check your connection and tap Play melody.').then(r=>{if(!r.ok)throw Error('Sound sample unavailable');return r.arrayBuffer()}).then(b=>context.decodeAudioData(b)).catch(e=>{buffers.delete(id);throw e}));}return buffers.get(id);}
export function stop(){active.forEach(n=>{try{n.stop()}catch{}});active=[];}
export async function playNotes(midis,spacing=.55,instrument='piano'){const c=await unlockAudio();const b=await Promise.all(midis.map(m=>buffer(m,instrument)));if(c.state!=='running')throw new Error('Audio was interrupted. Tap Play melody to try again.');const start=c.currentTime+.04;b.forEach((buf,i)=>{const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.connect(g);g.connect(c.destination);const t=start+i*spacing;g.gain.setValueAtTime(.8,t);g.gain.setValueAtTime(.8,t+.32);g.gain.exponentialRampToValueAtTime(.001,t+1.5);s.start(t);s.stop(t+1.6);active.push(s);s.onended=()=>{active=active.filter(a=>a!==s)};});return (midis.length-1)*spacing*1000+650;}
