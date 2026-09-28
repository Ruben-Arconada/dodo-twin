import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
test('The independent brain advances and handles JSON commands without a browser',async()=>{
 const child=spawn(process.execPath,['--experimental-strip-types','scripts/brain.ts'],{cwd:process.cwd(),stdio:['pipe','pipe','pipe']});
 const output=[];let pending='';let stderr='';child.stderr.on('data',c=>stderr+=c);
 child.stdout.on('data',c=>{pending+=c;let i;while((i=pending.indexOf('\n'))>=0){const line=pending.slice(0,i);pending=pending.slice(i+1);output.push(JSON.parse(line));}});
 try{
  await new Promise(r=>setTimeout(r,450));
  const telemetry=output.filter(x=>x.source==='simulation'&&typeof x.time_s==='number');assert.ok(telemetry.length>=2,stderr);assert.ok(telemetry.at(-1).time_s>telemetry[0].time_s);
  child.stdin.write(JSON.stringify({version:'1.0',type:'stimulus',environment:{presence:true,distance:1,azimuth:30}})+'\n');
  child.stdin.write(JSON.stringify({version:'1.0',type:'stop'})+'\n');
  await new Promise(r=>setTimeout(r,200));
  assert.ok(output.some(x=>x.ok===true&&x.status==='stopped'));assert.ok(output.filter(x=>x.time_s!==undefined).every(x=>x.connected===false&&x.measured===null));
 }finally{child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve));}
});
