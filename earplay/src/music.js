export const syllables=['Do','Re','Mi','Fa','Sol','La','Ti'];
export const scale=[0,2,4,5,7,9,11];
export const keys=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const levels=[{notes:3,length:5},{notes:4,length:5},{notes:5,length:6},{notes:6,length:6},{notes:7,length:7},{notes:7,length:8}];
export function melody(level){const {notes,length}=levels[level];return Array.from({length},(_,i)=>i===0?0:Math.floor(Math.random()*notes));}
let context;const buffers=new Map();let active=[];
async function init(){context??=new AudioContext();await context.resume();return context;}
async function buffer(midi,instrument){const id=instrument+':'+midi;if(!buffers.has(id)){const name=keys[midi%12]+(Math.floor(midi/12)-1);buffers.set(id,fetch(`${import.meta.env.BASE_URL}audio/${instrument==='guitar'?'guitar/':instrument==='steel'?'steel/':''}${name}.mp3`).then(r=>{if(!r.ok)throw Error('Sound sample unavailable');return r.arrayBuffer()}).then(b=>context.decodeAudioData(b)).catch(e=>{buffers.delete(id);throw e}));}return buffers.get(id);}
export function stop(){active.forEach(n=>{try{n.stop()}catch{}});active=[];}
export async function playNotes(midis,spacing=.55,instrument='piano'){const c=await init();const b=await Promise.all(midis.map(m=>buffer(m,instrument)));const start=c.currentTime+.04;b.forEach((buf,i)=>{const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.connect(g);g.connect(c.destination);const t=start+i*spacing;g.gain.setValueAtTime(.8,t);g.gain.setValueAtTime(.8,t+.32);g.gain.exponentialRampToValueAtTime(.001,t+1.5);s.start(t);s.stop(t+1.6);active.push(s);s.onended=()=>{active=active.filter(a=>a!==s)};});return (midis.length-1)*spacing*1000+650;}
