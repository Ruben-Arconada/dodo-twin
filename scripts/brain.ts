import {createInterface} from 'node:readline';
import {DodoEngine} from '../lib/dodo/engine.ts';
import {STEP} from '../lib/dodo/config.ts';
import {dispatch} from '../lib/dodo/protocol.ts';
// The same engine runs without DOM, a browser, a GPU, or cloud services.
const engine=new DodoEngine();
let last=performance.now(),accumulator=0,lastOutput=last;
const timer=setInterval(()=>{const now=performance.now();accumulator+=Math.min((now-last)/1000,.25);last=now;while(accumulator>=STEP){engine.step();accumulator-=STEP;}if(now-lastOutput>=100){process.stdout.write(JSON.stringify(engine.telemetry())+'\n');lastOutput=now}},8);
const input=createInterface({input:process.stdin,terminal:false});
input.on('line',line=>{try{process.stdout.write(JSON.stringify(dispatch(engine,JSON.parse(line)))+'\n')}catch(e){process.stdout.write(JSON.stringify({version:'1.0',ok:false,error:e instanceof Error?e.message:String(e)})+'\n')}});
function shutdown(){clearInterval(timer);input.close();process.exit(0)}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
