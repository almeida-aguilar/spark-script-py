var yt=Object.defineProperty;var Et=(s,e,t)=>e in s?yt(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var E=(s,e,t)=>Et(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const Nt="-1212-efde-1523-785feabcd123",Tt="-0000-1000-8000-00805f9b34fb",Ue=s=>s.toString(16).padStart(4,"0"),v=s=>`0000${Ue(s)}${Nt}`,ie=s=>`0000${Ue(s)}${Tt}`;ie(6144);const vt=ie(6154),At=ie(6159),He=v(5411),Ct=v(20238),j=ie(10777);v(5412);const x=v(5414),C=v(5415);v(5416);v(5417);v(5418);const Me=v(5419),ne=v(5422),G=v(5472);v(5473);const P=v(5475),R=v(5477),ae=1,ce=2,kt=3,Ot=4,St=5,H=6,F=1,We=20,je=21,Ge=22,Te=23,I=34,M=35,Lt=36,Fe=0,qe=2,Rt=0,xt=1,be=0,Ve=1,It=0,Z=Object.freeze({[F]:"motor",[We]:"voltage",[je]:"current",[Ge]:"piezo",[Te]:"rgb-led",[I]:"tilt",[M]:"distance",[Lt]:"generic"}),Dt=Object.freeze([j,C,G,P,R]),Bt=Object.freeze(["LPF2 Smart Hub 2 I/O"]);class T extends Error{constructor(e,t){super(e,t),this.name=new.target.errorName}}E(T,"errorName","WedoError");class L extends T{}E(L,"errorName","BLEError");class B extends T{}E(B,"errorName","HubConnectionError");class O extends B{}E(O,"errorName","HubDisconnectedError");class q extends T{}E(q,"errorName","OperationTimeout");class X extends T{}E(X,"errorName","HubBusyError");class $ extends T{}E($,"errorName","DeviceNotFoundError");class ve extends T{}E(ve,"errorName","DeviceTypeError");class Ye extends T{}E(Ye,"errorName","AmbiguousDeviceError");class N extends T{}E(N,"errorName","InvalidStateError");class se extends T{}E(se,"errorName","UnsupportedFeatureError");class Pt{constructor(e){this._session=e}get isPressed(){return this._session.core.buttonPressed()}get isReleased(){return!this.isPressed}}const Ke=0,$t=0,ze=1,Je=2,Ut=2,Qe=3,Ze=4,Xe=4,Ht=4,et=5,tt=6,nt=7,st=8,rt=9,Mt=9,ot=10,Wt=10,jt=Ke,Gt=ze,Ft=Je,qt=Qe,Vt=Ze,Yt=Xe,Kt=et,zt=tt,Jt=nt,Qt=st,Zt=rt,Xt=ot,it={OFF:Ke,BLACK:$t,PINK:ze,PURPLE:Je,VIOLET:Ut,BLUE:Qe,CYAN:Ze,SKY_BLUE:Xe,LIGHT_BLUE:Ht,GREEN:et,YELLOW:tt,ORANGE:nt,RED:st,WHITE:rt,BRIGHT_WHITE:Mt,DIM_WHITE:ot,SOFT_WHITE:Wt,APAGADO:jt,ROSA:Gt,MORADO:Ft,AZUL:qt,CIAN:Vt,CELESTE:Yt,VERDE:Kt,AMARILLO:zt,NARANJA:Jt,ROJO:Qt,BLANCO:Zt,BLANCO_TENUE:Xt};function V(s,e,t){if(typeof e!="number"||!Number.isInteger(e))throw new TypeError(`${s} must be an integer, not ${typeof e}`);if(e<0||e>t)throw new RangeError(`${s} must be in 0..${t}, got ${e}`);return e}class at{constructor(e){this._session=e}on(){return this.rgb(255,255,255)}off(){return this.rgb(0,0,0)}index(e){return this._session.core.ledIndex(V("index",e,10))}rgb(e,t,n){return this._session.core.ledRgb(V("red",e,255),V("green",t,255),V("blue",n,255))}}Object.assign(at,it);Object.freeze({...it});function ct(s){if(typeof s!="number"||!Number.isInteger(s))throw new TypeError(`speed must be an integer in -100..100, not ${typeof s=="number"?s:typeof s}`);if(s<-100||s>100)throw new RangeError(`speed must be in -100..100, got ${s}`);return s}class en{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}run(e){return this._session.core.setMotor(this._conn,ct(e))}stop(){return this._session.core.setMotor(this._conn,0)}toString(){return`Motor('${this.port}')`}}class tn{constructor(e){this._motors=[...e].sort((t,n)=>t.port<n.port?-1:t.port>n.port?1:0)}async run(e){ct(e);for(const t of this._motors)await t.run(e)}async stop(){let e=null;for(const t of this._motors)try{await t.stop()}catch(n){e??(e=n)}if(e)throw e}toString(){return`MotorGroup(${this._motors.map(e=>`'${e.port}'`).join(", ")})`}}const S=()=>performance.now()/1e3,Y=s=>new Promise(e=>setTimeout(e,s*1e3));function U(s,e,t){return new Promise((n,r)=>{const o=setTimeout(()=>r(t()),e*1e3);s.then(i=>{clearTimeout(o),n(i)},i=>{clearTimeout(o),r(i)})})}const ue=(s,e)=>()=>new q(`${s} agotó el tiempo de espera (${e.toFixed(1)} s)`);class lt{constructor(){this._waiters=new Set}notify(){const e=[...this._waiters];this._waiters.clear();for(const t of e)t()}wait(e){return new Promise(t=>{const n=()=>{clearTimeout(r),this._waiters.delete(n),t()},r=setTimeout(n,Math.max(0,e)*1e3);this._waiters.add(n)})}}function we(s){const e=Math.floor(s),t=s-e;return t<.5?e:t>.5?e+1:e%2===0?e:e+1}class ht{constructor(){this._listeners=new Set}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}emit(e,t){for(const n of[...this._listeners])try{n(e,t)}catch(r){console.error("listener error",r)}}}const ut=s=>Array.from(s,e=>e.toString(16).padStart(2,"0")).join(" "),nn=Object.freeze({0:"neutral",3:"back",5:"right",7:"left",9:"forward"});function de(s,e){const t=Math.max(-100,Math.min(100,e));return Uint8Array.of(s,1,1,t&255)}const sn=s=>Uint8Array.of(H,4,1,s),rn=(s,e,t)=>Uint8Array.of(H,4,3,s,e,t);function Ce(s,e,t,n,r,o){const i=new Uint8Array(11),a=new DataView(i.buffer);return i[0]=1,i[1]=2,i[2]=s,i[3]=e,i[4]=t,a.setUint32(5,n,!0),i[9]=r,i[10]=1,i}const on=s=>Uint8Array.of(0,1,s);function an(s){if(s.length<2)throw new RangeError(`port event too short (${s.length} bytes)`);const e=s[0];if(!(s[1]===1))return{conn:e,attached:!1,hubIndex:0,type:0};if(s.length<4)throw new RangeError(`attach event too short (${s.length} bytes)`);return{conn:e,attached:!0,hubIndex:s[2],type:s[3]}}function cn(s){if(s.length<2)throw new RangeError(`sensor value too short (${s.length} bytes)`);const e=Uint8Array.from(s);return{conn:e[1],value:e.slice(2),raw:e}}const re=s=>new DataView(s.buffer,s.byteOffset,s.byteLength);function dt(s){switch(s.length){case 1:return s[0];case 2:return re(s).getUint16(0,!0);case 4:return re(s).getFloat32(0,!0);default:throw new RangeError(`cannot decode a ${s.length}-byte sensor value`)}}function ln(s){if(s.length===8){const t=re(s),n=t.getFloat32(0,!0),r=t.getFloat32(4,!0);if(!Number.isFinite(n)||!Number.isFinite(r))throw new RangeError("non-finite tilt angle");return[we(n),we(r)]}if(s.length<2)throw new RangeError(`tilt angle value too short (${s.length} bytes)`);const e=re(s);return[e.getInt8(0),e.getInt8(1)]}function hn(s){const e=dt(s);return Number.isFinite(e)?nn[Math.trunc(e)]??"unknown":"unknown"}function ye(s,e){try{return s(e)}catch(t){throw t instanceof RangeError?new L(`unexpected sensor value ${ut(e)}: ${t.message}`,{cause:t}):t}}class oe{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}async read(){const e=await this._session.core.readSensor(this._conn,M,It,qe),t=ye(dt,e);if(!Number.isFinite(t))throw new L("the distance sensor reported a non-finite value");return Math.max(0,Math.min(10,we(t)))}static _threshold(e){if(typeof e!="number")throw new TypeError("threshold must be a number");if(!Number.isFinite(e)||e<0||e>10)throw new RangeError("threshold must be a finite number in 0..10");return e}async isNear(e){const t=oe._threshold(e);return await this.read()<t}async isFar(e){const t=oe._threshold(e);return await this.read()>t}toString(){return`DistanceSensor('${this.port}')`}}class un{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}async readAngle(){const e=await this._session.core.readSensor(this._conn,I,be,Fe,2);return ye(ln,e)}async readDirection(){const e=await this._session.core.readSensor(this._conn,I,Ve,qe,4);return ye(hn,e)}toString(){return`TiltSensor('${this.port}')`}}const f=Object.freeze({DISCONNECTED:"disconnected",CONNECTING:"connecting",CONNECTED:"connected",DISCONNECTING:"disconnecting",SHUTDOWN:"shutdown",ERROR:"error"}),b=f,dn=Object.freeze({[b.DISCONNECTED]:new Set([b.CONNECTING]),[b.CONNECTING]:new Set([b.CONNECTED,b.ERROR,b.DISCONNECTED]),[b.CONNECTED]:new Set([b.DISCONNECTING,b.ERROR,b.SHUTDOWN]),[b.DISCONNECTING]:new Set([b.DISCONNECTED,b.ERROR]),[b.SHUTDOWN]:new Set([b.CONNECTING,b.DISCONNECTED]),[b.ERROR]:new Set([b.CONNECTING,b.DISCONNECTING,b.DISCONNECTED])});class fn{constructor(e=()=>{}){this._state=b.DISCONNECTED,this._error=null,this._onChange=e}get state(){return this._state}get error(){return this._error}transition(e,t=null){const n=this._state;if(e!==n){if(!dn[n].has(e))throw new N(`invalid hub state transition ${n} -> ${e}`);this._state=e,this._error=e===b.ERROR?t:null,this._onChange(e,this._error)}}forceError(e){(this._state===b.CONNECTED||this._state===b.CONNECTING)&&this.transition(b.ERROR,e)}}const _n=Object.freeze({heartbeatInterval:.5,watchdogTimeout:2,emergencyAttempts:2,emergencyAttemptTimeout:.5,opTimeout:1,sensorTimeout:1,settleQuiet:1.5,settleMax:5,connectTimeout:15,poll:.02});function Ee(s={}){return Object.freeze({..._n,...s})}class pn{constructor({timing:e,isArmed:t,enqueueHeartbeat:n,lastOk:r,trip:o,now:i=S}){this._tm=e,this._isArmed=t,this._enqueueHeartbeat=n,this._lastOk=r,this._trip=o,this._now=i,this._signal=new lt,this._stopped=!0,this._loop=null}start(){this._stopped=!1,this._loop=this._run()}wake(){this._signal.notify()}async stop(){this._stopped=!0,this._signal.notify();const e=this._loop;this._loop=null,e&&await e}async _run(){const e=this._tm;let t=null,n=0;for(;!this._stopped;){if(!this._isArmed()){t=null,await this._signal.wait(.1);continue}const r=this._now();if(t&&t.settled&&(t=null),t===null&&r>=n){n=r+e.heartbeatInterval;try{t=this._enqueueHeartbeat()}catch{t=null}}const o=r-this._lastOk();if(o>e.watchdogTimeout){await this._trip(`no valid ACK from the hub for ${o.toFixed(1)} s`),t=null;continue}await this._signal.wait(e.poll)}}}const mn=(s,e)=>`${s}/${e}`;class ft extends ht{constructor(e,t){super(),this._t=e,this.timing=t?Ee(t):Ee(),this._sm=new fn((n,r)=>this.emit("state",{state:n,error:r})),this._linkLost=!1,this._lossHandled=!1,this._tripping=!1,this._ports=new Map,this._modes=new Map,this._samples=new Map,this._ledMode=-1,this._button=!1,this._speeds=new Map,this._lastOk=0,this._lastPortChange=0,this._changed=new lt,this._emergencyQ=[],this._normalQ=[],this._workerActive=!1,this._draining=null,this._isDraining=!1,this._epoch=0,this._wd=null}get state(){return this._sm.state}get error(){return this._sm.error}_unusable(){const e=this._sm.state;switch(e){case f.CONNECTED:return null;case f.CONNECTING:case f.DISCONNECTING:return new X(`hub is ${e}`);case f.ERROR:return new O(`hub connection lost: ${this._sm.error}`);case f.SHUTDOWN:return new N("hub was shut down; power it on and call connect()");default:return new N("hub is not connected; call connect() first")}}checkUsable(){const e=this._unusable();if(e)throw e}_log(e,t){this.emit("log",{level:e,message:t})}_startWorker(){this._emergencyQ.length=0,this._normalQ.length=0,this._epoch+=1,this._workerActive=!0}async _stopWorker(){this._workerActive=!1,this._epoch+=1;const e=[...this._emergencyQ,...this._normalQ];this._emergencyQ.length=0,this._normalQ.length=0;for(const n of e)n.reject(new O("hub closed"));const t=this._isDraining?this._draining:null;t&&await U(t,this.timing.opTimeout*2+1,()=>null).catch(()=>{})}_enqueue(e,{emergency:t=!1,needsConnected:n=!0}={}){if(!this._workerActive)throw new N("hub is not connected; call connect() first");const r={fn:e,emergency:t,needsConnected:n,epoch:this._epoch,abandoned:!1,settled:!1};return r.promise=new Promise((o,i)=>{r.resolve=a=>{r.settled=!0,o(a)},r.reject=a=>{r.settled=!0,i(a)}}),r.promise.catch(()=>{}),(t?this._emergencyQ:this._normalQ).push(r),this._kick(),r}_kick(){this._isDraining||(this._isDraining=!0,this._draining=this._drain())}async _drain(){try{for(;this._workerActive;){const e=this._emergencyQ.length?this._emergencyQ.shift():this._normalQ.shift();if(!e)break;if(e.abandoned){e.resolve(void 0);continue}if(e.epoch!==this._epoch){e.reject(new O("stale request dropped after reconnect"));continue}try{e.needsConnected&&this.checkUsable();const t=await e.fn();this._lastOk=S(),e.resolve(t)}catch(t){e.reject(t)}}}finally{this._isDraining=!1}}_submit(e,t,n,r,o){const i=this._enqueue(e,{emergency:t,needsConnected:n}),a=o??r+this.timing.opTimeout+.5;return Number.isFinite(a)?U(i.promise,a,()=>(i.abandoned=!0,new q("hub operation did not complete"))):i.promise}async _io(e,t,n){try{return await this._t[e](...t,n)}catch(r){throw r instanceof O?(this._onLinkLost(r.message),r):r instanceof T?r:new L((r==null?void 0:r.message)??String(r),{cause:r})}}_call(e,t=[],{timeout:n,emergency:r=!1,needsConnected:o=!0,outer:i}={}){const a=n??this.timing.opTimeout;return this._submit(()=>this._io(e,t,a),r,o,a,i)}_onNotify(e,t){try{if(e===C)this._handlePort(t);else if(e===G){const n=cn(t);this._samples.set(n.conn,n.value),this.emit("sample",{conn:n.conn,value:n.value}),this._changed.notify()}else e===x?t.length>0&&(this._button=t[0]!==0,this.emit("button",{pressed:this._button})):e===ne&&this._onLinkLost("hub sent a Disconnect notification")}catch(n){this._log("debug",`bad notification on ${e}: ${ut(t)} (${n==null?void 0:n.message})`)}}_handlePort(e){const t=an(e),n=this._ports.get(t.conn);if(t.attached){if(n&&n.type===t.type&&n.hubIndex===t.hubIndex)return;this._ports.set(t.conn,t)}else{if(!n)return;this._ports.delete(t.conn)}this._modes.delete(t.conn),this._samples.delete(t.conn),t.conn===H&&(this._ledMode=-1),this._lastPortChange=S(),this.emit("ports",{ports:this.portsRaw()}),this._changed.notify()}_onLinkLost(e){const t=this._sm.state;if(t===f.DISCONNECTING||t===f.DISCONNECTED||t===f.SHUTDOWN)return;this._linkLost=!0,this._sm.forceError(e),this._changed.notify();const n=!this._lossHandled;this._lossHandled=!0,n&&this._log("error",`link lost: ${e}`),n&&this._motorsActive()&&this._trip(`link lost: ${e}`).catch(()=>{})}async connect(){const e=this._sm.state;if(e===f.CONNECTED)return;if(e===f.CONNECTING||e===f.DISCONNECTING)throw new X(`hub is ${e}`);this._sm.transition(f.CONNECTING),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._speeds.clear(),this._ledMode=-1,this._button=!1,this._linkLost=!1,this._lossHandled=!1,this._tripping=!1;const t=this.timing;try{this._startWorker(),this._t.setCallbacks((n,r)=>this._onNotify(n,r),n=>this._onLinkLost(n)),await this._call("connect",[],{timeout:t.connectTimeout,needsConnected:!1,outer:this._t.interactive?1/0:void 0});for(const n of Dt)if(!this._t.hasCharacteristic(n))throw new B(`device does not look like a WeDo 2.0 hub: missing ${n}`);if(await this._optional("subscribe",ne),await this._call("subscribe",[G],{needsConnected:!1}),this._t.hasCharacteristic(x)){await this._optional("subscribe",x);try{const n=await this._call("read",[x],{needsConnected:!1});this._button=n.length>0&&n[0]!==0}catch(n){if(!(n instanceof T))throw n}}if(await this._call("subscribe",[C],{needsConnected:!1}),await this._settlePorts(f.CONNECTING),this._sm.state!==f.CONNECTING)throw this._unusable()??new O("connection lost during connect");this._lastOk=S(),this._sm.transition(f.CONNECTED),this._startWatchdog()}catch(n){throw await this._abortConnect(n),n instanceof T?n:new B((n==null?void 0:n.message)??String(n),{cause:n})}}async _optional(e,...t){try{await this._call(e,t,{needsConnected:!1})}catch(n){if(!(n instanceof T))throw n;this._log("debug",`optional ${e} ${t} unavailable: ${n.message}`)}}async _abortConnect(e){this._sm.state===f.CONNECTING&&(this._sm.transition(f.ERROR,(e==null?void 0:e.message)??String(e)),this._changed.notify()),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}async _settlePorts(e){const t=this.timing,n=S();for(this._lastPortChange=Math.max(this._lastPortChange,n);;){if(this._sm.state!==e)throw this._unusable()??new O("connection lost during port discovery");const r=S(),o=t.settleQuiet-(r-this._lastPortChange),i=t.settleMax-(r-n);if(o<=0||i<=0)return;await this._changed.wait(Math.min(o,i))}}async disconnect(){const e=this._sm.state;if(e===f.DISCONNECTED||e===f.SHUTDOWN)return e===f.SHUTDOWN&&this._sm.transition(f.DISCONNECTED),!0;if(e===f.CONNECTING||e===f.DISCONNECTING)throw new X(`hub is ${e}`);const t=this._linkLost;this._sm.transition(f.DISCONNECTING);let n=!0;t?this._motorsActive()&&(n=!1):{confirmed:n}=await this._stopMotors(this.timing.emergencyAttempts,this.timing.emergencyAttemptTimeout),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch(r){this._log("debug",`transport disconnect failed: ${r==null?void 0:r.message}`)}return n&&this._speeds.clear(),this._sm.transition(f.DISCONNECTED),this._changed.notify(),n||this._log("warn","disconnect: motor stop could not be confirmed"),n}async shutdownHub(){this.checkUsable(),await this._call("write",[Me,Uint8Array.of(1)]),this._sm.transition(f.SHUTDOWN),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}portsRaw(){return new Map([...this._ports].map(([e,t])=>[e,t.type]))}async refreshPorts(){this.checkUsable(),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._ledMode=-1,this._lastPortChange=S(),await this._call("unsubscribe",[C]),await this._call("subscribe",[C]),await this._settlePorts(f.CONNECTED)}_requireDevice(e,t){const n=this._ports.get(e);if(!n)throw new $(`no device on connect id ${e}`);if(n.type!==t){const r=o=>Z[o]??`0x${o.toString(16).padStart(2,"0")}`;throw new ve(`device on connect id ${e} is a ${r(n.type)}, expected a ${r(t)}`)}}_motorsActive(){for(const e of this._speeds.values())if(e!==0)return!0;return!1}async setMotor(e,t){var o;this.checkUsable(),this._requireDevice(e,F);const n=de(e,t),r=this._motorsActive();t!==0&&(this._speeds.set(e,t),r||(this._lastOk=S()),(o=this._wd)==null||o.wake()),await this._call("write",[R,n]),t===0&&this._speeds.set(e,0),this.emit("motor",{conn:e,speed:t})}async stopAll(){this.checkUsable();const e=this._knownMotors();let t=null;for(const n of e){try{await this._call("write",[R,de(n,0)],{emergency:!0})}catch(r){t??(t=r);continue}this._speeds.set(n,0),this.emit("motor",{conn:n,speed:0})}if(t)throw t}_knownMotors(){const e=new Set;for(const[t,n]of this._ports)n.type===F&&e.add(t);for(const t of this._speeds.keys())e.add(t);return[...e].sort((t,n)=>t-n)}async _ensureLedMode(e){this._ledMode!==e&&(await this._call("write",[P,Ce(H,Te,e,1,Fe)]),this._ledMode=e)}async ledIndex(e){this.checkUsable(),await this._ensureLedMode(xt),await this._call("write",[R,sn(e)])}async ledRgb(e,t,n){this.checkUsable(),await this._ensureLedMode(Rt),await this._call("write",[R,rn(e,t,n)])}buttonPressed(){return this.checkUsable(),this._button}async readBattery(){return this.checkUsable(),(await this._call("read",[j]))[0]}async readSensor(e,t,n,r,o=null,i=null){this.checkUsable(),this._requireDevice(e,t);const a=i??this.timing.sensorTimeout,l=mn(t,n);if(this._modes.get(e)!==l){this._samples.delete(e),this._modes.set(e,l);try{await this._call("write",[P,Ce(e,t,n,1,r,!0)]),await this._call("write",[P,on(e)])}catch(d){throw this._modes.get(e)===l&&this._modes.delete(e),d}}const p=S()+a;for(;;){const d=this._unusable();if(d)throw d;if(!this._ports.has(e))throw new $(`the device on connect id ${e} was disconnected`);if(this._modes.get(e)!==l)throw new $(`the device on connect id ${e} changed`);const m=this._samples.get(e);if(m&&(o===null||m.length===o))return m;const _=p-S();if(_<=0)throw new q(`the hub sent no value within ${a.toFixed(1)} s`);await this._changed.wait(_)}}_startWatchdog(){this._wd=new pn({timing:this.timing,isArmed:()=>this._sm.state===f.CONNECTED&&this._motorsActive(),enqueueHeartbeat:()=>this._enqueue(()=>this._io("read",[j],this.timing.opTimeout),{emergency:!0,needsConnected:!1}),lastOk:()=>this._lastOk,trip:e=>this._trip(e)}),this._wd.start()}async _stopWatchdog(){const e=this._wd;this._wd=null,e&&await e.stop()}async _stopMotors(e,t){let n=this._knownMotors();const r=[];for(let o=0;o<e&&n.length!==0;o+=1){const i=[];for(const a of n){try{await this._call("write",[R,de(a,0)],{timeout:t,emergency:!0,needsConnected:!1})}catch{i.push(a);continue}this._speeds.set(a,0),this.emit("motor",{conn:a,speed:0})}n=i,r.push(n.length===0)}return{confirmed:n.length===0,results:r}}async _trip(e){if(!this._tripping){this._tripping=!0;try{const t=this.timing;this._log("error",`watchdog: ${e}`);const{confirmed:n,results:r}=await this._stopMotors(t.emergencyAttempts,t.emergencyAttemptTimeout),o=[];for(let i=0;i<r.length&&(o.push(`${i===0?"stop attempt 1":`attempt ${i+1}`}${r[i]?" ACK":" no ACK"}`),!r[i]);i+=1);n?(this._log("warn",`watchdog: ${o.join(", ")}`),this._log("warn","watchdog: motors stopped")):this._log("error",`watchdog: stop NOT confirmed (${t.emergencyAttempts} attempts)`),this._sm.forceError(e),this._changed.notify()}finally{this._tripping=!1}}}}E(ft,"STOP_PROFILE","nobarrier");class _t{constructor(){E(this,"interactive",!1)}setCallbacks(e,t){throw new N("not implemented")}async connect(e){throw new N("not implemented")}async disconnect(e){throw new N("not implemented")}hasCharacteristic(e){throw new N("not implemented")}async read(e,t){throw new N("not implemented")}async write(e,t,n){throw new N("not implemented")}async subscribe(e,t){throw new N("not implemented")}async unsubscribe(e,t){throw new N("not implemented")}}const fe=[He,Ct,At,vt];function pt(s=globalThis.navigator){return!!(s&&s.bluetooth&&typeof s.bluetooth.requestDevice=="function")}function mt(s=globalThis){var r;if(pt(s.navigator))return null;if(s.isSecureContext===!1)return"Web Bluetooth requiere HTTPS (o localhost). Abre la aplicación desde una dirección segura.";const e=((r=s.navigator)==null?void 0:r.userAgent)??"";return`Este navegador no admite Web Bluetooth. Usa Chrome o Edge en un sistema compatible (Firefox y Safari no están soportados).${/Linux/.test(e)&&!/Android/.test(e)?" En Linux Web Bluetooth está desactivado por defecto: abre chrome://flags/#enable-experimental-web-platform-features, ponlo en «Enabled», reinicia el navegador y comprueba que BlueZ ≥ 5.41 (`bluetoothd --version`) y el servicio bluetooth están activos.":""}`}const ke=s=>new Uint8Array(s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength));class gt extends _t{constructor({bluetooth:t=(r=>(r=globalThis.navigator)==null?void 0:r.bluetooth)(),acceptAll:n=!1}={}){super();E(this,"interactive",!0);this._bt=t,this._acceptAll=n,this._device=null,this._chars=new Map,this._handlers=new Map,this._onNotify=null,this._onDisconnect=null,this._closing=!1,this._onGattDisconnected=()=>{var o;this._closing||(o=this._onDisconnect)==null||o.call(this,"BLE link lost")}}setCallbacks(t,n){this._onNotify=t,this._onDisconnect=n}get deviceName(){var t;return((t=this._device)==null?void 0:t.name)??null}async connect(t){if(!this._bt)throw new se(mt()??"Web Bluetooth no está disponible");this._closing=!1;let n;try{n=await this._bt.requestDevice(this._acceptAll?{acceptAllDevices:!0,optionalServices:fe}:{filters:[{services:[He]},...Bt.map(r=>({name:r}))],optionalServices:fe})}catch(r){throw(r==null?void 0:r.name)==="NotFoundError"?new B("no WeDo 2.0 hub was selected"):(r==null?void 0:r.name)==="SecurityError"?new B("the browser requires a user gesture (click) and HTTPS to open the Bluetooth chooser"):new L((r==null?void 0:r.message)??String(r),{cause:r})}this._device=n,n.addEventListener("gattserverdisconnected",this._onGattDisconnected);try{const r=await U(n.gatt.connect(),t,ue("GATT connect",t));await U(this._discover(r),t,ue("service discovery",t))}catch(r){throw await this._release(),this._map(r)}}async _discover(t){this._chars.clear();for(const n of fe){let r;try{r=await t.getPrimaryService(n)}catch(o){if((o==null?void 0:o.name)==="NotFoundError")continue;throw o}for(const o of await r.getCharacteristics())this._chars.set(o.uuid.toLowerCase(),o)}}async disconnect(){this._closing=!0,await this._release()}async _release(){var n,r;const t=this._device;this._device=null;for(const[o,i]of this._handlers)(n=this._chars.get(o))==null||n.removeEventListener("characteristicvaluechanged",i);if(this._handlers.clear(),this._chars.clear(),t){t.removeEventListener("gattserverdisconnected",this._onGattDisconnected);try{(r=t.gatt)!=null&&r.connected&&t.gatt.disconnect()}catch{}}}hasCharacteristic(t){return this._chars.has(t)}_char(t){var r,o;if(!((o=(r=this._device)==null?void 0:r.gatt)!=null&&o.connected))throw new O("BLE link is not open");const n=this._chars.get(t);if(!n)throw new L(`characteristic not available: ${t}`);return n}_map(t){var n,r;return t instanceof T?t:!((r=(n=this._device)==null?void 0:n.gatt)!=null&&r.connected)||(t==null?void 0:t.name)==="NetworkError"?new O((t==null?void 0:t.message)||"BLE link lost",{cause:t}):new L((t==null?void 0:t.message)||(t==null?void 0:t.name)||"BLE error",{cause:t})}async _run(t,n,r){try{return await U(t,n,ue(r,n))}catch(o){throw this._map(o)}}async read(t,n){const r=this._char(t);return ke(await this._run(r.readValue(),n,"BLE read"))}async write(t,n,r){const o=this._char(t);if(typeof o.writeValueWithResponse!="function")throw new se("this browser lacks writeValueWithResponse; refusing to write without response");await this._run(o.writeValueWithResponse(Uint8Array.from(n)),r,"BLE write")}async subscribe(t,n){const r=this._char(t);if(!this._handlers.has(t)){const o=i=>{var l,p;const a=(l=i.target)==null?void 0:l.value;a&&((p=this._onNotify)==null||p.call(this,t,ke(a)))};r.addEventListener("characteristicvaluechanged",o),this._handlers.set(t,o)}await this._run(r.startNotifications(),n,"BLE start notifications")}async unsubscribe(t,n){const r=this._char(t);await this._run(r.stopNotifications(),n,"BLE stop notifications");const o=this._handlers.get(t);o&&(r.removeEventListener("characteristicvaluechanged",o),this._handlers.delete(t))}}class Ne extends Error{constructor(){super("task cancelled"),this.name="TaskCancelled"}}function gn(s){if(typeof s!="number")throw new TypeError(`seconds must be a number, not ${typeof s}`);if(!Number.isFinite(s)||s<0)throw new RangeError(`seconds must be a finite number >= 0, got ${s}`);return s}function bt(s,e){return new Promise((t,n)=>{if(e!=null&&e.aborted){n(new Ne);return}const r=()=>{clearTimeout(o),n(new Ne)},o=setTimeout(()=>{e==null||e.removeEventListener("abort",r),t()},s);e==null||e.addEventListener("abort",r,{once:!0})})}function bn(s,e){return gn(s),bt(s*1e3,e)}function wn(s){return bt(0,s)}class yn{constructor(e,t){this.signal=e,this._manager=t}get cancelled(){return this.signal.aborted}cancelAll(){this._manager._cancelNow()}sleep(e){return bn(e,this.signal)}yieldNow(){return wn(this.signal)}}const En=s=>s.name||"anonymous";class Nn{constructor({onInterrupt:e=null,cancelTimeout:t=2}={}){this._onInterrupt=e,this._cancelTimeout=t,this._pending=[],this._running=new Set,this._normal=0,this._waiting=!1,this._failure=null,this._wakeWait=null,this.diagnostics=[]}add(e,t={}){if(typeof e!="function")throw new TypeError(`a task must be a function, not ${typeof e}`);if(t===null||typeof t!="object")throw new TypeError("options must be an object such as { background: true }");const{background:n=!1}=t;if(typeof n!="boolean")throw new TypeError("background must be true or false");const r={func:e,name:En(e),background:n,controller:new AbortController,promise:null,finished:!1};n||(this._normal+=1),this._waiting?this._launch(r):this._pending.push(r)}async wait({signal:e}={}){if(this._waiting)throw new N("wait() cannot be called from a task or during another wait()");this._waiting=!0,this.diagnostics=[];const t=()=>{this._interruptedBy=e.reason??new DOMException("aborted","AbortError"),this._interruptWork=(async()=>{var o;await this.cancel();try{await((o=this._onInterrupt)==null?void 0:o.call(this))}catch{}})()};this._interruptedBy=null,this._interruptWork=null,e==null||e.addEventListener("abort",t,{once:!0});try{const o=this._pending;this._pending=[];for(const i of o)this._failure!==null?this._finish(i):this._launch(i);if(this._normal>0&&this._failure===null&&!this._interruptedBy&&(await new Promise(i=>{this._wakeWait=i}),this._wakeWait=null),this._failure===null&&!this._interruptedBy)for(const i of this._running)i.background&&i.controller.abort();else this._abortAll();await this._settle(),this._interruptWork&&await this._interruptWork}finally{e==null||e.removeEventListener("abort",t),this._waiting=!1}const n=this._interruptedBy;this._interruptedBy=null;const r=this._failure;if(this._failure=null,n)throw n;if(r)throw r}async cancel(){this._cancelNow(),await this._settle()}_abortAll(){for(const e of this._running)e.controller.abort()}_cancelNow(){for(const e of this._pending)this._finish(e);this._pending=[],this._abortAll()}async _settle(){if(this._running.size===0)return;const e=Promise.allSettled([...this._running].map(t=>t.promise));await U(e,this._cancelTimeout,()=>null).catch(()=>{})}_launch(e){const t=new yn(e.controller.signal,this);this._running.add(e),e.promise=this._run(e,t)}async _run(e,t){try{await e.func(t)}catch(n){n instanceof Ne||this._fail(e,n)}finally{this._running.delete(e),this._finish(e)}}_finish(e){var t;e.finished||(e.finished=!0,e.background||(this._normal-=1),(this._normal<=0||this._failure!==null)&&((t=this._wakeWait)==null||t.call(this)))}_fail(e,t){var n;if(this._failure===null&&!e.controller.signal.aborted){this._failure=t;try{t.taskName=e.name}catch{}this._abortAll(),(n=this._wakeWait)==null||n.call(this)}else this.diagnostics.push([e.name,t])}}const ee=new Set;let Oe=!1;function Tn(){Oe||typeof globalThis.addEventListener!="function"||(Oe=!0,globalThis.addEventListener("pagehide",()=>{for(const s of ee)s.emergencyClose().catch(()=>{})}))}class vn{constructor(e=null,t=null){this._transport=e,this._timing=t,this._core=null,this.tasks=new Nn({onInterrupt:()=>this._interrupted()})}get core(){if(!this._core)throw new N("hub is not connected; call connect() first");return this._core}get isConnected(){return this._core!==null&&this._core.state===f.CONNECTED}ensureCore(){return this._core||(this._core=new ft(this._transport??new gt,this._timing)),this._core}async connect(){await this.ensureCore().connect(),ee.add(this),Tn()}async disconnect(){await this.tasks.cancel();let e=!0;return this._core&&(e=await this._core.disconnect()),ee.delete(this),e}async shutdown(){await this.tasks.cancel();const e=this.core;try{await e.stopAll()}catch(t){e._log("warn",`could not stop motors before shutdown: ${t==null?void 0:t.message}`)}await e.shutdownHub(),ee.delete(this)}stopAll(){return this.core.stopAll()}portsRaw(){return this._core?this._core.portsRaw():new Map}refreshPorts(){return this.core.refreshPorts()}async emergencyClose(){try{await this.tasks.cancel(),this._core&&await this._core.disconnect()}catch{}}async _interrupted(){if(this.isConnected)try{await this._core.stopAll()}catch(e){this._core._log("warn",`could not stop motors after interrupt: ${e==null?void 0:e.message}`)}}}const wt={A:ae,B:ce},K={[ae]:"A",[ce]:"B"};function Se(s){if(typeof s!="string")throw new TypeError(`port must be 'A' or 'B', not ${typeof s}`);const e=wt[s.toUpperCase()];if(e===void 0)throw new RangeError(`port must be 'A' or 'B', got '${s}'`);return e}class Ae{constructor({transport:e=null,timing:t=null}={}){this._session=new vn(e,t),this._led=new at(this._session),this._button=new Pt(this._session)}static async use(e,t={}){const n=new Ae(t);await n.connect();let r=!0;try{const o=await e(n);return r=!1,o}finally{try{await n.disconnect()}catch(o){if(!r)throw o}}}async connect(){return await this._session.connect(),this}get isConnected(){return this._session.isConnected}get state(){return this._session._core?this._session._core.state:"disconnected"}disconnect(){return this._session.disconnect()}shutdown(){return this._session.shutdown()}stopAll(){return this._session.stopAll()}readBattery(){return this._session.core.readBattery()}subscribe(e){return this._session.ensureCore().subscribe(e)}get ports(){const e=this._session.portsRaw(),t={};for(const[n,r]of Object.entries(wt))if(e.has(r)){const o=e.get(r);t[n]=Z[o]??`unknown(0x${o.toString(16).padStart(2,"0")})`}return t}async refreshPorts(){return await this._session.refreshPorts(),this.ports}_select(e,t){this._session.core.checkUsable();const n=this._session.portsRaw(),r=Z[e];if(t!=null){const i=Se(t),a=n.get(i),l=t.toUpperCase();if(a===void 0)throw new $(`nothing is connected to port ${l}`);if(a!==e)throw new ve(`port ${l} holds a ${Z[a]??"unknown device"}, not a ${r}`);return i}const o=[ae,ce].filter(i=>n.get(i)===e);if(o.length===0)throw new $(`no ${r} is connected`);if(o.length>1)throw new Ye(`more than one ${r} is connected; pass the port ('A' or 'B')`);return o[0]}motor(e){const t=this._select(F,e);return new en(this._session,t,K[t])}motors(e){if(typeof e=="string")throw new TypeError("ports must be an array such as ['A', 'B']");const t=[...e];if(t.length===0)throw new RangeError("ports must not be empty");const n=t.map(Se);if(new Set(n).size!==n.length)throw new RangeError(`duplicate port in ${JSON.stringify(t)}`);return new tn(n.map(r=>this.motor(K[r])))}distanceSensor(e){const t=this._select(M,e);return new oe(this._session,t,K[t])}tiltSensor(e){const t=this._select(I,e);return new un(this._session,t,K[t])}get led(){return this._led}get button(){return this._button}get tasks(){return this._session.tasks}}performance.now();const Le={motor:F,distance:M,tilt:I},_e={A:ae,B:ce},An=[[kt,je],[Ot,We],[St,Ge],[H,Te]],Cn=Object.freeze({neutral:0,back:3,right:5,left:7,forward:9}),pe=(s,e)=>Uint8Array.of(s,1,0,e,0,0,0,16,0,0,0,16),Re=s=>{const e=new Uint8Array(4);return new DataView(e.buffer).setFloat32(0,s,!0),e};class kn extends _t{constructor(e,{externalDelay:t=.05,repeatPorts:n=null,ackDelay:r=0,silentSensors:o=!1,failConnect:i=!1}={}){super(),this.devices={...e??{A:"motor",B:"distance"}},this.externalDelay=t,this.repeatPorts=n,this.ackDelay=r,this.silentSensors=o,this.failConnect=i,this.failReads=!1,this.frozen=!1,this.dropped=!1,this.connected=!1,this.supportsDisconnectNotify=!1,this.writes=[],this.reads=[],this.motors={},this.sensorModes={},this.ledMode=null,this.button=!1,this.distance=0,this.tiltAngle=[0,0],this.tiltCode=0,this.battery=87,this._notifying=new Set,this._onNotify=null,this._onDisconnect=null,this._closed=!1,this._burstId=0}freeze(){this.frozen=!0}unfreeze(){this.frozen=!1}dropLink(e="simulated link loss"){var t;this.dropped=!0,this.connected=!1,(t=this._onDisconnect)==null||t.call(this,e)}writesTo(e){return this.writes.filter(([t])=>t===e).map(([,t])=>t)}press(){this.button=!0,this._notify(x,Uint8Array.of(1))}release(){this.button=!1,this._notify(x,Uint8Array.of(0))}setDistance(e){this.distance=e,this._pushValues(M)}setTiltAngle(e,t){this.tiltAngle=[Math.trunc(e),Math.trunc(t)],this._pushValues(I,be)}setTiltDirection(e){this.tiltCode=typeof e=="string"?Cn[e]:Number(e),this._pushValues(I,Ve)}attach(e,t){this.devices[e]=t,this._notify(C,pe(_e[e],Le[t]))}detach(e){delete this.devices[e],this._notify(C,Uint8Array.of(_e[e],0))}setCallbacks(e,t){this._onNotify=e,this._onDisconnect=t}async connect(e){if(this.failConnect)throw new B("no WeDo 2.0 hub found");this.dropped=!1,this.connected=!0,this._closed=!1}async disconnect(){this.connected=!1,this._notifying.clear(),this._closed=!0,this._burstId+=1}hasCharacteristic(e){return e===ne||[j,C,G,P,R,x,Me].includes(e)}async _gate(e){if(this.dropped||!this.connected)throw new O("simulated link is down");if(this.frozen)throw await Y(e),new q("no ACK from the simulated hub");if(this.ackDelay&&(await Y(this.ackDelay),this.dropped))throw new O("simulated link is down")}async read(e,t){if(await this._gate(t),this.failReads)throw new L("simulated read failure");if(this.reads.push(e),e===j)return Uint8Array.of(this.battery);if(e===x)return Uint8Array.of(this.button?1:0);throw new L(`characteristic not readable: ${e}`)}async write(e,t,n){if(await this._gate(n),t=Uint8Array.from(t),this.writes.push([e,t]),e===R)t.length===4&&t[1]===1&&t[2]===1&&(this.motors[t[0]]=t[3]<<24>>24);else if(e===P)if(t.length>=5&&t[0]===1&&t[1]===2){const[r,o,i]=[t[2],t[3],t[4]];this.sensorModes[r]=[o,i],r===H&&(this.ledMode=i)}else t.length===3&&t[0]===0&&t[1]===1&&this._pushConn(t[2])}async subscribe(e,t){if(await this._gate(t),e===ne&&!this.supportsDisconnectNotify)throw new L("notifications not supported on this characteristic");this._notifying.add(e),e===C&&this._portBurst(++this._burstId)}async unsubscribe(e,t){await this._gate(t),this._notifying.delete(e)}_notify(e,t){this._onNotify&&this._notifying.has(e)&&this._onNotify(e,Uint8Array.from(t))}async _portBurst(e){const t=()=>e===this._burstId&&!this._closed;for(const[r,o]of An)this._notify(C,pe(r,o));if(await Y(this.externalDelay),!t())return;const n=Object.keys(this.devices).sort().map(r=>pe(_e[r],Le[this.devices[r]]));for(const r of n)this._notify(C,r);for(;this.repeatPorts&&this._notifying.has(C);){if(await Y(this.repeatPorts),!t())return;for(const r of n)this._notify(C,r)}}_valueBytes(e){const[t,n]=this.sensorModes[e]??[null,null];return t===M?Re(this.distance):t===I?n===be?Uint8Array.of(this.tiltAngle[0]&255,this.tiltAngle[1]&255):Re(this.tiltCode):null}_pushConn(e){if(this.silentSensors)return;const t=this._valueBytes(e);t&&this._notify(G,Uint8Array.of(1,e,...t))}_pushValues(e,t=null){for(const[n,[r,o]]of Object.entries(this.sensorModes))r===e&&(t===null||o===t)&&this._pushConn(Number(n))}}const On=new Set([f.ERROR]);class Sn extends ht{constructor(){super(),this.hub=null,this.sim=null,this.kind="web-bluetooth",this.state=f.DISCONNECTED,this.activeMotors=new Map,this._unsub=null,this.simDevices={A:"motor",B:"distance"},this.simDistance=10}get supportsBluetooth(){return pt()}get connected(){return this.state===f.CONNECTED}get unsafe(){return On.has(this.state)}_log(e,t){this.emit("log",{level:e,message:t})}async connect(e,{acceptAll:t=!1}={}){var i;this.hub&&this.state!==f.DISCONNECTED&&await this.disconnect(),this.kind=e;let n,r=null;e==="simulated"?(this.sim=new kn(this.simDevices,{externalDelay:.05}),this.sim.distance=this.simDistance??10,n=this.sim,r=Ee({settleQuiet:.3})):(this.sim=null,n=new gt({acceptAll:t}));const o=new Ae({transport:n,timing:r});this.hub=o,this.activeMotors.clear(),(i=this._unsub)==null||i.call(this),this._unsub=o.subscribe((a,l)=>this._onCore(a,l)),this._log("info",`Conectando (${e==="simulated"?"simulador":"Web Bluetooth"})…`);try{await o.connect()}catch(a){throw this._log("error",`No se pudo conectar: ${a.message}`),this._setState(o.state),a}this._log("info","Conectado."),this.emit("hubname",{name:n.deviceName??(e==="simulated"?"Hub simulado":"WeDo 2.0 Smart Hub")}),this.emit("ports",{ports:o.ports}),await this.refreshBattery()}async disconnect(){const e=this.hub;if(e){try{const t=await e.disconnect();this._log(t?"info":"warn",t?"Desconectado.":"Desconectado, pero la parada de motores no pudo confirmarse.")}catch(t){this._log("error",`Error al desconectar: ${t.message}`)}this.activeMotors.clear(),this._setState(e.state),this.emit("ports",{ports:{}})}}async refreshBattery(){if(this.connected)try{this.emit("battery",{percent:await this.hub.readBattery()})}catch(e){this._log("warn",`Batería: ${e.message}`)}}async run(e,t){try{const n=await t(this.hub);return this._log("op",e),n}catch(n){this._log("error",`${e}: ${n.message}`);return}}async emergencyStop(){if(this.hub){this._log("warn","Parada de emergencia solicitada.");try{await this.hub.tasks.cancel()}catch{}try{await this.hub.stopAll()}catch(e){this._log("error",`Parada: ${e.message}`)}}}async onHidden(){this.connected&&[...this.activeMotors.values()].some(e=>e!==0)&&(this._log("warn","La pestaña se ocultó con motores en marcha: se envía parada (los temporizadores del navegador pueden retrasarse)."),await this.emergencyStop())}_setState(e){e!==this.state&&(this.state=e,this.emit("state",{state:e,unsafe:this.unsafe}))}_onCore(e,t){switch(e){case"state":this._setState(t.state),this._log(t.state===f.ERROR?"error":"info",`Estado: ${t.state}${t.error?` (${t.error})`:""}`);break;case"ports":this.emit("ports",{ports:this.hub.ports});break;case"motor":this.activeMotors.set(t.conn,t.speed),this.emit("motor",t);break;case"button":this.emit("button",t);break;case"log":t.level!=="debug"&&this._log(t.level,t.message);break}}}const h=(s,e=document)=>e.querySelector(s);function y(s,e={},...t){const n=document.createElement(s);for(const[r,o]of Object.entries(e))r.startsWith("on")&&typeof o=="function"?n.addEventListener(r.slice(2).toLowerCase(),o):o===!0?n.setAttribute(r,""):o!==!1&&o!=null&&n.setAttribute(r,o);for(const r of t.flat())n.append(r instanceof Node?r:document.createTextNode(String(r)));return n}function te(s,e){for(const t of s)t.disabled=!e}function Ln(s){const e={transport:h("#transport"),connect:h("#btn-connect"),disconnect:h("#btn-disconnect"),state:h("#state"),name:h("#hub-name"),battery:h("#battery"),estop:h("#btn-estop"),compat:h("#compat"),unsafe:h("#unsafe")},t=h("#btn-hub"),n=h("#hub-drawer"),r=h("#hub-close"),o=d=>{n.hidden=!d,t.setAttribute("aria-expanded",String(d))};o(!1),t.addEventListener("click",()=>o(n.hidden)),r.addEventListener("click",()=>o(!1)),document.addEventListener("keydown",d=>{d.key==="Escape"&&!n.hidden&&o(!1)});const i=document.querySelector(".wb-top");if(i&&typeof ResizeObserver=="function"){const d=()=>n.style.setProperty("--wb-top-h",`${i.offsetHeight}px`);d(),new ResizeObserver(d).observe(i)}const a=mt();a&&(e.compat.hidden=!1,e.compat.textContent=`${a} Puedes probar la aplicación con el simulador.`,e.transport.querySelector('option[value="web-bluetooth"]').disabled=!0,e.transport.value="simulated");const l=d=>te([e.connect,e.transport],!d);e.connect.addEventListener("click",async()=>{l(!0),o(!0),e.connect.textContent="Conectando…";try{await s.connect(e.transport.value,{acceptAll:h("#accept-all").checked})}catch{}finally{e.connect.textContent=s.unsafe?"Reconectar":"Conectar",l(!1),p()}}),e.disconnect.addEventListener("click",()=>s.disconnect()),e.estop.addEventListener("click",()=>s.emergencyStop());function p(){const{state:d}=s;e.state.textContent=d,e.state.className=`badge st-${d}`;const m=s.connected;e.disconnect.disabled=!(m||s.unsafe),e.estop.disabled=!m,e.transport.disabled=m,e.connect.disabled=m||d==="connecting",e.connect.textContent=s.unsafe?"Reconectar":"Conectar",e.unsafe.hidden=!s.unsafe,s.unsafe&&(e.unsafe.textContent="Estado inseguro: se perdió el enlace con el hub o el watchdog detectó que no respondía. Los controles están deshabilitados. Comprueba que los motores estén parados y reconecta."),document.querySelector("#card-sim").hidden=s.kind!=="simulated",m||(e.battery.textContent="—",s.unsafe||(e.name.textContent="—"))}s.subscribe((d,m)=>{if(d==="state"&&p(),d==="battery"&&(e.battery.textContent=`${m.percent} %`),d==="hubname"&&(e.name.textContent=m.name),d==="ports")for(const _ of["A","B"])h(`#port-${_}`).textContent=m.ports[_]??"—"}),p(),setInterval(()=>s.refreshBattery(),3e4)}const Rn=300;function xn(s=h("#console")){function e(t,n){const r=new Date().toLocaleTimeString(),o=y("li",{class:`lvl-${t}`},y("time",{},r)," ",n);for(s.append(o);s.children.length>Rn;)s.firstChild.remove();s.scrollTop=s.scrollHeight}return h("#console-clear").addEventListener("click",()=>{s.replaceChildren()}),{log:e}}const In=[["Apagado",0,"#222"],["Rosa",1,"#ff6ec7"],["Morado",2,"#8a2be2"],["Azul",3,"#1e5cff"],["Cian",4,"#00d5e0"],["Verde",5,"#18c24a"],["Amarillo",6,"#ffd400"],["Naranja",7,"#ff8a00"],["Rojo",8,"#e5251b"],["Blanco",9,"#ffffff"],["Blanco tenue",10,"#cfcfcf"]],Dn=s=>[1,3,5].map(e=>parseInt(s.slice(e,e+2),16));function Bn(s){const e=h("#motors"),t={};for(const c of["A","B"]){const u=y("input",{type:"range",min:-100,max:100,step:1,value:0,"aria-label":`Velocidad motor ${c}`}),w=y("output",{},"0"),k=y("button",{class:"primary"},"Girar"),A=y("button",{},"Parar"),W=y("button",{title:"Invertir dirección"},"⇄");u.addEventListener("input",()=>{w.textContent=u.value}),k.addEventListener("click",()=>s.run(`Motor ${c}: ${u.value}`,he=>he.motor(c).run(Number(u.value)))),A.addEventListener("click",()=>{u.value=0,w.textContent="0",s.run(`Motor ${c}: parar`,he=>he.motor(c).stop())}),W.addEventListener("click",()=>{u.value=-u.value,w.textContent=u.value}),e.append(y("div",{class:"motor","data-port":c},y("div",{class:"motor-head"},y("strong",{},`Motor ${c}`),y("span",{class:"dev",id:`dev-${c}`},"")),u,w,W,k,A)),t[c]={slider:u,run:k,stop:A,rev:W}}const n=y("button",{class:"primary"},"Grupo A+B: girar"),r=y("button",{},"Grupo A+B: parar");n.addEventListener("click",()=>{const c=Number(t.A.slider.value);s.run(`MotorGroup(A, B): ${c}`,u=>u.motors(["A","B"]).run(c))}),r.addEventListener("click",()=>s.run("MotorGroup(A, B): parar",c=>c.motors(["A","B"]).stop())),e.append(y("div",{class:"row"},n,r));const o=h("#led-presets");for(const[c,u,w]of In)o.append(y("button",{class:"swatch",style:`background:${w}`,title:`${c} (índice ${u})`,"aria-label":`${c}, índice ${u}`,onclick:()=>{h("#led-state").textContent=`índice ${u} (${c})`,s.run(`LED: ${c}`,k=>k.led.index(u))}}));h("#led-rgb").addEventListener("change",c=>{const[u,w,k]=Dn(c.target.value);h("#led-state").textContent=`RGB ${u},${w},${k}`,s.run(`LED: rgb(${u}, ${w}, ${k})`,A=>A.led.rgb(u,w,k))}),h("#led-off").addEventListener("click",()=>{h("#led-state").textContent="apagado",s.run("LED: apagar",c=>c.led.off())});const i=()=>[...Object.values(t).flatMap(c=>[c.slider,c.run,c.stop,c.rev]),n,r,h("#led-rgb"),h("#led-off"),...o.querySelectorAll("button")];function a(c=(u=>(u=s.hub)==null?void 0:u.ports)()??{}){const w=s.connected;te(i(),w);for(const A of["A","B"]){const W=c[A]==="motor";te(Object.values(t[A]),w&&W),h(`#dev-${A}`).textContent=c[A]?`(${c[A]})`:"(sin dispositivo)"}const k=["A","B"].filter(A=>c[A]==="motor").length;te([n,r],w&&k===2)}s.subscribe((c,u)=>{if(c==="state"&&a(),c==="ports"&&a(u.ports),c==="motor"){const w=u.conn===1?"A":u.conn===2?"B":null;w&&u.speed===0&&Number(t[w].slider.value)}}),a();const l=h("#dist"),p=h("#dist-meter"),d=h("#tilt"),m=h("#button"),_=c=>{m.textContent=c?"pulsado":"suelto",m.className=`badge ${c?"st-connected":""}`};s.subscribe((c,u)=>{if(c==="button"&&_(u.pressed),c==="state"&&!s.connected&&(l.textContent=d.textContent=m.textContent="—",p.value=0),c==="ports"&&s.connected)try{_(s.hub.button.isPressed)}catch{}});let g=!1;setInterval(async()=>{if(!(g||!s.connected)){g=!0;try{const c=s.hub.ports;for(const u of["A","B"])try{if(c[u]==="distance"){const w=await s.hub.distanceSensor(u).read();l.textContent=w,p.value=w}else c[u]==="tilt"&&(d.textContent=await s.hub.tiltSensor(u).readDirection())}catch(w){w.name==="OperationTimeout"?(c[u]==="distance"?l:d).textContent="esperando cambio…":s.connected&&s._log("warn",`Sensor ${u}: ${w.message}`)}}finally{g=!1}}},300)}const Pn="modulepreload",$n=function(s,e){return new URL(s,e).href},xe={},Un=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){const i=document.getElementsByTagName("link"),a=document.querySelector("meta[property=csp-nonce]"),l=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(t.map(p=>{if(p=$n(p,n),p in xe)return;xe[p]=!0;const d=p.endsWith(".css"),m=d?'[rel="stylesheet"]':"";if(!!n)for(let c=i.length-1;c>=0;c--){const u=i[c];if(u.href===p&&(!d||u.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${p}"]${m}`))return;const g=document.createElement("link");if(g.rel=d?"stylesheet":Pn,d||(g.as="script"),g.crossOrigin="",g.href=p,l&&g.setAttribute("nonce",l),document.head.appendChild(g),d)return new Promise((c,u)=>{g.addEventListener("load",c),g.addEventListener("error",()=>u(new Error(`Unable to preload CSS for ${p}`)))})}))}function o(i){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=i,window.dispatchEvent(a),!a.defaultPrevented)throw i}return r.then(i=>{for(const a of i||[])a.status==="rejected"&&o(a.reason);return e().catch(o)})},Hn=`"""wedopy: control the LEGO WeDo 2.0 Smart Hub from Python.

    from wedopy import Hub

    with Hub() as hub:
        motor = hub.motor("A")
        motor.run(100)
"""
from . import task
from .button import Button
from .exceptions import (
    AmbiguousDeviceError,
    BLEError,
    DeviceNotFoundError,
    DeviceTypeError,
    HubBusyError,
    HubConnectionError,
    HubDisconnectedError,
    InvalidStateError,
    OperationTimeout,
    UnsupportedFeatureError,
    WedoError,
)
from .hub import Hub
from .led import (
    LED,
    OFF, BLACK, PINK, PURPLE, VIOLET, BLUE, CYAN, SKY_BLUE, LIGHT_BLUE,
    GREEN, YELLOW, ORANGE, RED, WHITE, BRIGHT_WHITE, DIM_WHITE, SOFT_WHITE,
    APAGADO, ROSA, MORADO, AZUL, CIAN, CELESTE, VERDE, AMARILLO, NARANJA, ROJO,
    BLANCO, BLANCO_TENUE,
)
from .motor import Motor, MotorGroup
from .sensors import DistanceSensor, TiltSensor
from .time import running_time

__version__ = "0.1.2"

__all__ = [
    "Hub", "Motor", "MotorGroup", "DistanceSensor", "TiltSensor", "LED", "Button",
    "task", "running_time",
    "OFF", "BLACK", "PINK", "PURPLE", "VIOLET", "BLUE", "CYAN", "SKY_BLUE", "LIGHT_BLUE",
    "GREEN", "YELLOW", "ORANGE", "RED", "WHITE", "BRIGHT_WHITE", "DIM_WHITE", "SOFT_WHITE",
    "APAGADO", "ROSA", "MORADO", "AZUL", "CIAN", "CELESTE", "VERDE", "AMARILLO", "NARANJA", "ROJO",
    "BLANCO", "BLANCO_TENUE",
    "WedoError", "BLEError", "HubConnectionError", "HubDisconnectedError", "OperationTimeout",
    "HubBusyError", "DeviceNotFoundError", "DeviceTypeError", "AmbiguousDeviceError",
    "InvalidStateError", "UnsupportedFeatureError",
]
`,Mn=`"""Puente síncrono entre la API Python de wedopy y la API JavaScript de wedopy Web.

Funciona con Pyodide + JSPI (Chrome >= 137): \`\`run_sync\`\` bloquea el programa Python hasta que
la promesa de JavaScript se resuelve, sin congelar la página. Así los programas escritos para
la biblioteca Python (\`\`hub.motor("A").run(100)\`\`, \`\`yield task.sleep(1)\`\`) funcionan sin cambios.

El botón «Detener» del editor activa una bandera: la siguiente llamada del programa al hub o
a \`\`sleep\`\` lanza \`\`KeyboardInterrupt\`\` (igual que Ctrl+C en la biblioteca original).
"""
import js
from pyodide.ffi import JsException, run_sync

from . import exceptions as _exc

_NAMES = ("WedoError", "BLEError", "HubConnectionError", "HubDisconnectedError", "OperationTimeout",
          "HubBusyError", "DeviceNotFoundError", "DeviceTypeError", "AmbiguousDeviceError",
          "InvalidStateError", "UnsupportedFeatureError")
_JS_ERRORS = {name: getattr(_exc, name) for name in _NAMES}


def _bridge():
    return js.wedopyBridge


def check_stop():
    if _bridge().stopRequested():
        raise KeyboardInterrupt("programa detenido desde el editor")


def convert(exc):
    """JsException -> excepción Python equivalente (misma jerarquía que la biblioteca)."""
    err = exc.js_error
    name, message = str(err.name), str(err.message)
    cls = _JS_ERRORS.get(name)
    if cls is not None:
        return cls(message)
    if name == "TypeError":
        return TypeError(message)
    if name == "RangeError":
        return ValueError(message)
    return exc


def call(fn, *args):
    """Llamada JavaScript síncrona (puede lanzar)."""
    check_stop()
    try:
        return fn(*args)
    except JsException as exc:
        raise convert(exc) from None


def get(obj, name):
    check_stop()
    try:
        return getattr(obj, name)
    except JsException as exc:
        raise convert(exc) from None


def wait(awaitable):
    """Bloquea hasta que una promesa de JavaScript se resuelva; devuelve su valor.

    «Detener» no rechaza nada: si la promesa despertó antes de tiempo porque el usuario
    pulsó «Detener», la bandera sigue levantada y check_stop() la convierte aquí en
    KeyboardInterrupt, en puro Python (sin cruzar la frontera JSPI: lanzar excepciones
    a través de run_sync deja continuaciones huérfanas en Pyodide).
    """
    check_stop()
    try:
        result = run_sync(awaitable)
    except JsException as exc:
        raise convert(exc) from None
    check_stop()
    return result


def sleep(seconds):
    """Sustituto cooperativo de \`\`time.sleep\`\`: cede el control a la página y admite «Detener»."""
    if isinstance(seconds, bool) or not isinstance(seconds, (int, float)):
        raise TypeError("seconds must be a number, not %s" % type(seconds).__name__)
    if seconds != seconds or seconds < 0:
        raise ValueError("sleep length must be a non-negative number")
    wait(_bridge().sleep(float(seconds)))


def hub():
    h = _bridge().getHub()
    if h is None:
        raise _exc.HubConnectionError(
            "No hay hub: conéctalo desde el panel «Conexión» (o elige el Simulador) antes de ejecutar.")
    return h
`,Wn=`"""Botón integrado (misma API que wedopy.button)."""
from . import _bridge


class Button:
    def __init__(self, js_button):
        self._js = js_button

    @property
    def is_pressed(self):
        return bool(_bridge.get(self._js, "isPressed"))

    @property
    def is_released(self):
        return not self.is_pressed
`,jn=`"""Excepciones públicas (idénticas a wedopy_core/exceptions.py de la biblioteca Python)."""


class WedoError(Exception):
    pass


class BLEError(WedoError, OSError):
    pass


class HubConnectionError(WedoError, ConnectionError):
    pass


class HubDisconnectedError(HubConnectionError):
    pass


class OperationTimeout(WedoError, TimeoutError):
    pass


class HubBusyError(WedoError, RuntimeError):
    pass


class DeviceNotFoundError(WedoError, LookupError):
    pass


class DeviceTypeError(WedoError):
    pass


class AmbiguousDeviceError(WedoError, LookupError):
    pass


class InvalidStateError(WedoError, RuntimeError):
    pass


class UnsupportedFeatureError(WedoError, NotImplementedError):
    pass
`,Gn=`"""\`\`Hub\`\` (misma API que wedopy.hub) sobre el hub conectado en el panel de wedopy Web.

Diferencias respecto a la biblioteca Python de escritorio:

* \`\`Hub()\`\` usa el hub que ya está conectado en el panel «Conexión» (real o simulado); el
  selector Bluetooth del navegador necesita un clic del usuario y no puede abrirse desde un programa.
* \`\`disconnect()\`\` / salir de \`\`with Hub()\`\` cancelan las tareas y paran los motores, pero
  mantienen el enlace para poder ejecutar otro programa sin volver a elegir el dispositivo.
* \`\`time.sleep\`\` es cooperativo: cede el control a la página y admite el botón «Detener».
"""
from . import _bridge
from .button import Button
from .exceptions import AmbiguousDeviceError, DeviceNotFoundError, DeviceTypeError  # noqa: F401
from .led import LED
from .motor import Motor, MotorGroup
from .sensors import DistanceSensor, TiltSensor
from .tasks import TaskManager

_PORTS = ("A", "B")


def _port(port):
    if not isinstance(port, str):
        raise TypeError("port must be 'A' or 'B', not %s" % type(port).__name__)
    if port.upper() not in _PORTS:
        raise ValueError("port must be 'A' or 'B', got %r" % port)
    return port.upper()


class Hub:
    """Create it, then \`\`connect()\`\` or use it as a context manager (recommended)::

        with Hub() as hub:
            hub.motor("A").run(100)
    """

    def __init__(self, *, transport=None, timing=None):
        # \`transport\` y \`timing\` se aceptan por compatibilidad; en el navegador los fija el panel.
        self._js = _bridge.hub()
        self._led = LED(self._js.led)
        self._button = Button(self._js.button)
        self._tasks = TaskManager(sleeper=_bridge.sleep, on_interrupt=self._interrupted)

    # -- lifecycle ------------------------------------------------------------

    def connect(self):
        """Usa el hub del panel. Devuelve \`\`self\`\`."""
        if not self.is_connected:
            _bridge.wait(self._js.connect())  # puede fallar sin gesto de usuario: conecta desde el panel
        return self

    @property
    def is_connected(self):
        return bool(self._js.isConnected)

    def disconnect(self):
        """Cancel tasks and try to stop the motors. The link stays open (see module docstring)."""
        self._tasks.cancel()
        if self.is_connected:
            _bridge.wait(self._js.stopAll())

    def shutdown(self):
        """Ask the hub to power off. It must be switched on by hand afterwards."""
        self._tasks.cancel()
        try:
            self.stop_all()
        except Exception:
            pass
        _bridge.wait(self._js.shutdown())

    def stop_all(self):
        """Ask every motor to stop."""
        _bridge.wait(self._js.stopAll())

    def __enter__(self):
        return self.connect()

    def __exit__(self, exc_type, exc, tb):
        try:
            self.disconnect()
        except Exception:
            if exc_type is None:
                raise
        return False

    def _interrupted(self):
        """Detener / Ctrl+C durante \`\`tasks.wait()\`\`: intenta parar los motores."""
        try:
            _bridge.wait(self._js.stopAll())
        except BaseException:
            pass

    # -- ports and devices ------------------------------------------------------

    @property
    def ports(self):
        """Snapshot of the known external devices, e.g. \`\`{"A": "motor", "B": "distance"}\`\`."""
        return _bridge.get(self._js, "ports").to_py()

    def refresh_ports(self):
        return _bridge.wait(self._js.refreshPorts()).to_py()

    def motor(self, port=None):
        return Motor(_bridge.call(self._js.motor, None if port is None else port))

    def motors(self, ports):
        """A group of motors, e.g. \`\`hub.motors(("A", "B"))\`\`; driven A first, then B."""
        if isinstance(ports, str):
            raise TypeError("ports must be a sequence such as ('A', 'B')")
        ports = list(ports)
        if not ports:
            raise ValueError("ports must not be empty")
        norm = [_port(p) for p in ports]
        if len(set(norm)) != len(norm):
            raise ValueError("duplicate port in %r" % (ports,))
        return MotorGroup([self.motor(p) for p in norm])

    def distance_sensor(self, port=None):
        return DistanceSensor(_bridge.call(self._js.distanceSensor, None if port is None else port))

    def tilt_sensor(self, port=None):
        return TiltSensor(_bridge.call(self._js.tiltSensor, None if port is None else port))

    @property
    def led(self):
        return self._led

    @property
    def button(self):
        return self._button

    @property
    def tasks(self):
        """Cooperative task manager of this hub (\`\`add\`\` / \`\`wait\`\` / \`\`cancel\`\`)."""
        return self._tasks
`,Fn=`"""LED integrado (misma API y constantes que wedopy.led; llama a la API JavaScript)."""
from . import _bridge

# Colour index constants (discrete mode 0..10)
OFF = 0
BLACK = 0
PINK = 1
PURPLE = 2
VIOLET = 2
BLUE = 3
CYAN = 4
SKY_BLUE = 4
LIGHT_BLUE = 4
GREEN = 5
YELLOW = 6
ORANGE = 7
RED = 8
WHITE = 9
BRIGHT_WHITE = 9
DIM_WHITE = 10
SOFT_WHITE = 10

# Spanish aliases
APAGADO = OFF
ROSA = PINK
MORADO = PURPLE
AZUL = BLUE
CIAN = CYAN
CELESTE = SKY_BLUE
VERDE = GREEN
AMARILLO = YELLOW
NARANJA = ORANGE
ROJO = RED
BLANCO = WHITE
BLANCO_TENUE = DIM_WHITE

__all__ = [
    "LED",
    "OFF",
    "BLACK",
    "PINK",
    "PURPLE",
    "VIOLET",
    "BLUE",
    "CYAN",
    "SKY_BLUE",
    "LIGHT_BLUE",
    "GREEN",
    "YELLOW",
    "ORANGE",
    "RED",
    "WHITE",
    "BRIGHT_WHITE",
    "DIM_WHITE",
    "SOFT_WHITE",
    "APAGADO",
    "ROSA",
    "MORADO",
    "AZUL",
    "CIAN",
    "CELESTE",
    "VERDE",
    "AMARILLO",
    "NARANJA",
    "ROJO",
    "BLANCO",
    "BLANCO_TENUE",
]


def _byte(name, value, hi):
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError("%s must be an int, not %s" % (name, type(value).__name__))
    if not 0 <= value <= hi:
        raise ValueError("%s must be in 0..%d, got %d" % (name, hi, value))
    return value


class LED:
    """Indexed colours (0..10) and RGB are different hub modes; the core tracks which is active."""

    OFF = OFF
    BLACK = BLACK
    PINK = PINK
    PURPLE = PURPLE
    VIOLET = VIOLET
    BLUE = BLUE
    CYAN = CYAN
    SKY_BLUE = SKY_BLUE
    LIGHT_BLUE = LIGHT_BLUE
    GREEN = GREEN
    YELLOW = YELLOW
    ORANGE = ORANGE
    RED = RED
    WHITE = WHITE
    BRIGHT_WHITE = BRIGHT_WHITE
    DIM_WHITE = DIM_WHITE
    SOFT_WHITE = SOFT_WHITE

    # Spanish aliases
    APAGADO = APAGADO
    ROSA = ROSA
    MORADO = MORADO
    AZUL = AZUL
    CIAN = CIAN
    CELESTE = CELESTE
    VERDE = VERDE
    AMARILLO = AMARILLO
    NARANJA = NARANJA
    ROJO = ROJO
    BLANCO = BLANCO
    BLANCO_TENUE = BLANCO_TENUE

    def __init__(self, js_led):
        self._js = js_led

    def on(self):
        """White."""
        self.rgb(255, 255, 255)

    def off(self):
        self.rgb(0, 0, 0)

    def index(self, index):
        _bridge.wait(self._js.index(_byte("index", index, 10)))

    def rgb(self, red, green, blue):
        _bridge.wait(self._js.rgb(_byte("red", red, 255), _byte("green", green, 255),
                                  _byte("blue", blue, 255)))
`,qn=`"""Motores (misma API que wedopy.motor)."""
from . import _bridge


def _check_speed(speed):
    if isinstance(speed, bool) or not isinstance(speed, int):
        raise TypeError("speed must be an int in -100..100, not %s" % type(speed).__name__)
    if not -100 <= speed <= 100:
        raise ValueError("speed must be in -100..100, got %d" % speed)
    return speed


class Motor:
    """A motor on port \`\`A\`\` or \`\`B\`\`. The sign of \`\`speed\`\` is a logical direction."""

    def __init__(self, js_motor):
        self._js = js_motor
        self.port = str(js_motor.port)

    def run(self, speed):
        """Set the logical speed, -100..100. \`\`run(0)\`\` is \`\`stop()\`\`."""
        _bridge.wait(self._js.run(_check_speed(speed)))

    def stop(self):
        """Ask the motor to stop. An ACK confirms communication, not that the shaft stopped."""
        _bridge.wait(self._js.stop())

    def __repr__(self):
        return "Motor(%r)" % self.port


class MotorGroup:
    """Several motors driven in deterministic order (A, then B). Not atomic."""

    def __init__(self, motors):
        self._motors = sorted(motors, key=lambda m: m.port)

    def run(self, speed):
        speed = _check_speed(speed)
        for m in self._motors:
            m.run(speed)

    def stop(self):
        first = None
        for m in self._motors:
            try:
                m.stop()
            except Exception as exc:
                if first is None:
                    first = exc
        if first is not None:
            raise first

    def __repr__(self):
        return "MotorGroup(%s)" % ", ".join(repr(m.port) for m in self._motors)
`,Vn=`"""Sensores de distancia e inclinación (misma API que wedopy.sensors)."""
import math

from . import _bridge


class DistanceSensor:
    """Distance sensor. Values are normalised integers 0..10, not centimetres."""

    def __init__(self, js_sensor):
        self._js = js_sensor
        self.port = str(js_sensor.port)

    def read(self):
        return int(_bridge.wait(self._js.read()))

    @staticmethod
    def _threshold(threshold):
        if isinstance(threshold, bool) or not isinstance(threshold, (int, float)):
            raise TypeError("threshold must be a number")
        if not math.isfinite(threshold) or not 0 <= threshold <= 10:
            raise ValueError("threshold must be a finite number in 0..10")
        return threshold

    def is_near(self, threshold):
        """True when \`\`read() < threshold\`\` (strict)."""
        t = self._threshold(threshold)
        return self.read() < t

    def is_far(self, threshold):
        """True when \`\`read() > threshold\`\` (strict)."""
        t = self._threshold(threshold)
        return self.read() > t

    def __repr__(self):
        return "DistanceSensor(%r)" % self.port


class TiltSensor:
    """Tilt sensor (a 4-position switch, not an accelerometer). Reads only update on change."""

    def __init__(self, js_sensor):
        self._js = js_sensor
        self.port = str(js_sensor.port)

    def read_angle(self):
        """\`\`(x, y)\`\` in degrees, nominally -45..45."""
        return tuple(_bridge.wait(self._js.readAngle()).to_py())

    def read_direction(self):
        """One of \`\`neutral\`\`, \`\`back\`\`, \`\`right\`\`, \`\`left\`\`, \`\`forward\`\`."""
        return str(_bridge.wait(self._js.readDirection()))

    def __repr__(self):
        return "TiltSensor(%r)" % self.port
`,Yn=`"""Scheduling instructions for cooperative tasks (spec 5.7).

    yield task.sleep(0.3)
    yield task.yield_now()

These are general instructions and do not depend on any hub; \`\`hub.tasks\`\` runs them.
"""
import math
import warnings

__all__ = ["sleep", "yield_now"]


class _Instruction:
    """Base class. A created-but-never-yielded instruction warns, like an un-awaited coroutine."""

    _label = "instruction"

    def __init__(self):
        self._used = False

    def __del__(self):
        if not getattr(self, "_used", True):
            warnings.warn("task.%s() was created but never yielded; write 'yield task.%s()'"
                          % (self._label, self._label), RuntimeWarning, stacklevel=2)


class _Sleep(_Instruction):
    _label = "sleep"

    def __init__(self, seconds):
        super().__init__()
        self.seconds = seconds

    def __repr__(self):
        return "task.sleep(%r)" % (self.seconds,)


class _YieldNow(_Instruction):
    _label = "yield_now"

    def __repr__(self):
        return "task.yield_now()"


def yield_now():
    """Move the current task to the end of the ready queue without pausing it."""
    return _YieldNow()


def sleep(seconds):
    """Suspend the current task for at least \`\`seconds\`\` while other tasks keep running."""
    if isinstance(seconds, bool) or not isinstance(seconds, (int, float)):
        raise TypeError("seconds must be a number, not %s" % type(seconds).__name__)
    if math.isnan(seconds) or math.isinf(seconds) or seconds < 0:
        raise ValueError("seconds must be a finite number >= 0, got %r" % (seconds,))
    if seconds == 0:
        return _YieldNow()
    return _Sleep(float(seconds))
`,Kn=`"""Cooperative task scheduler behind \`\`hub.tasks\`\` (spec 5.7).

Single thread (the one calling \`\`wait()\`\`), deterministic order, switch only at \`\`yield\`\`.
"""
import functools
import heapq
import inspect
import itertools
import logging
import time

from . import task as _task
from .exceptions import InvalidStateError

_log = logging.getLogger("wedopy.tasks")


def _name_of(func):
    while isinstance(func, functools.partial):
        func = func.func
    return getattr(func, "__name__", None) or repr(func)


class _Task:
    __slots__ = ("func", "name", "background", "gen", "due", "seq", "cancelled", "finished")

    def __init__(self, func, background):
        self.func = func
        self.name = _name_of(func)
        self.background = background
        self.gen = None
        self.due = 0.0
        self.seq = 0
        self.cancelled = False
        self.finished = False


class TaskManager:
    def __init__(self, *, clock=time.monotonic, sleeper=time.sleep, on_interrupt=None):
        self._clock = clock
        self._sleeper = sleeper
        self._on_interrupt = on_interrupt
        self._heap = []
        self._counter = itertools.count()
        self._normal = 0          # live non-background tasks (the running one included)
        self._running = None
        self._waiting = False
        self._failure = None
        self.diagnostics = []     # secondary errors of the last wait(): [(task name, exception)]

    # -- public API --------------------------------------------------------

    def add(self, func, *, background=False):
        """Register a task. It starts running inside :meth:\`wait\`. Returns \`\`None\`\`."""
        if not callable(func):
            raise TypeError("a task must be a callable, not %s" % type(func).__name__)
        if inspect.iscoroutinefunction(func) or inspect.isasyncgenfunction(func):
            raise TypeError("'async def' tasks are not supported; use a plain function or a "
                            "generator that yields task.sleep(...)")
        if not isinstance(background, bool):
            raise TypeError("background must be True or False")
        t = _Task(func, background)
        t.due = self._clock()
        t.seq = next(self._counter)
        heapq.heappush(self._heap, (t.due, t.seq, t))
        if not background:
            self._normal += 1
        return None

    def wait(self):
        """Run tasks until every normal task has finished, then cancel background tasks."""
        if self._waiting or self._running is not None:
            raise InvalidStateError("wait() cannot be called from a task or during another wait()")
        self._waiting = True
        self.diagnostics = []
        try:
            self._loop()
        except KeyboardInterrupt:
            self.cancel()
            if self._on_interrupt is not None:
                try:
                    self._on_interrupt()
                except Exception:
                    _log.debug("interrupt handler failed", exc_info=True)
            raise
        finally:
            self._waiting = False
        failure, self._failure = self._failure, None
        if failure is not None:
            raise failure
        return None

    def cancel(self):
        """Close every task (normal and background). Does not stop motors."""
        entries, self._heap = self._heap, []
        for _due, _seq, t in sorted(entries):
            self._close(t)
            self._finish(t)
        if self._running is not None:
            self._running.cancelled = True   # closed at its next yield

    # -- internals ---------------------------------------------------------

    def _loop(self):
        while self._normal > 0 and self._failure is None:
            if not self._heap:
                break
            due = self._heap[0][0]
            delay = due - self._clock()
            if delay > 0:
                # Sleep with the task still queued, so an interrupt can cancel it cleanly.
                self._sleeper(delay)
                continue
            _due, _seq, t = heapq.heappop(self._heap)
            self._running = t
            try:
                self._advance(t)
            finally:
                self._running = None
        if self._failure is None:
            self._cancel_background()

    def _cancel_background(self):
        keep = []
        for entry in self._heap:
            t = entry[2]
            if t.background:
                self._close(t)
                self._finish(t)
            else:
                keep.append(entry)
        heapq.heapify(keep)
        self._heap = keep

    def _advance(self, t):
        throw = None
        while True:
            try:
                if t.gen is None:
                    result = t.func()
                    if inspect.isgenerator(result):
                        t.gen = result
                        instr = next(t.gen)
                    elif inspect.iscoroutine(result):
                        result.close()
                        raise TypeError("task %r returned a coroutine; 'async def' is not supported" % t.name)
                    else:
                        self._finish(t)
                        return
                elif throw is not None:
                    exc, throw = throw, None
                    instr = t.gen.throw(exc)
                else:
                    instr = next(t.gen)
            except StopIteration:
                self._finish(t)
                return
            except Exception as exc:
                self._fail(t, exc)
                return
            except BaseException:
                self._finish(t)
                raise
            if t.cancelled:
                if isinstance(instr, _task._Instruction):
                    instr._used = True
                self._close(t)
                self._finish(t)
                return
            if isinstance(instr, _task._Sleep):
                instr._used = True
                t.due = self._clock() + instr.seconds
            elif isinstance(instr, _task._YieldNow):
                instr._used = True
                t.due = self._clock()
            else:
                throw = TypeError("task %r yielded %r; tasks may only yield task.sleep(...) or "
                                  "task.yield_now()" % (t.name, instr))
                continue
            t.seq = next(self._counter)
            heapq.heappush(self._heap, (t.due, t.seq, t))
            return

    def _finish(self, t):
        if t.finished:
            return
        t.finished = True
        if not t.background:
            self._normal -= 1

    def _close(self, t):
        gen, t.gen = t.gen, None
        if gen is None:
            return
        try:
            gen.close()
        except Exception as exc:   # e.g. RuntimeError: the cleanup tried to yield
            _log.error("task %r failed while being cancelled: %r", t.name, exc)
            self.diagnostics.append((t.name, exc))

    def _fail(self, t, exc):
        self._finish(t)
        if self._failure is None:
            self._failure = exc
            if hasattr(exc, "add_note"):
                exc.add_note("raised in task %r" % t.name)
            _log.error("task %r failed: %r", t.name, exc)
            self.cancel_others(t)
        else:
            self.diagnostics.append((t.name, exc))

    def cancel_others(self, failed):
        entries, self._heap = self._heap, []
        for _due, _seq, other in sorted(entries):
            self._close(other)
            self._finish(other)
`,zn=`"""Small educational time helper. Use the standard \`\`time\`\` module for everything else."""
import time as _time

_START = _time.monotonic()


def running_time():
    """Milliseconds since \`\`wedopy\`\` was imported (the program's start, in practice)."""
    return int((_time.monotonic() - _START) * 1000)
`,Jn=Object.assign({"./wedopy/__init__.py":Hn,"./wedopy/_bridge.py":Mn,"./wedopy/button.py":Wn,"./wedopy/exceptions.py":jn,"./wedopy/hub.py":Gn,"./wedopy/led.py":Fn,"./wedopy/motor.py":qn,"./wedopy/sensors.py":Vn,"./wedopy/task.py":Yn,"./wedopy/tasks.py":Kn,"./wedopy/time.py":zn}),Qn=`
import time
from wedopy import _bridge
time.sleep = _bridge.sleep   # sleep cooperativo: cede a la página y admite «Detener»
`;class Zn{constructor({getHub:e,onOutput:t=()=>{},loader:n,indexURL:r}){this._getHub=e,this._out=t,this._loader=n,this._indexURL=r,this.py=null,this._loading=null,this._stop=!1,this._running=!1,this._sleepers=new Set,this._current=null}get running(){return this._running}get ready(){return this.py!==null}init(e=()=>{}){return this._loading??(this._loading=this._init(e).catch(t=>{throw this._loading=null,t})),this._loading}async _init(e){e("Cargando Python (solo la primera vez)…");const{loadPyodide:t}=await this._loader(),n=await t(this._indexURL?{indexURL:this._indexURL}:{});if(!await n.runPythonAsync(`from pyodide.ffi import can_run_sync
can_run_sync()`))throw new se("Este navegador no admite JSPI (WebAssembly JavaScript Promise Integration), necesario para ejecutar programas Python síncronos. Usa Chrome o Edge 137 o posterior.");n.setStdout({batched:o=>this._out("stdout",o)}),n.setStderr({batched:o=>this._out("stderr",o)}),n.FS.mkdirTree("/home/pyodide/wedopy");for(const[o,i]of Object.entries(Jn))n.FS.writeFile(`/home/pyodide/wedopy/${o.split("/").pop()}`,i);return globalThis.wedopyBridge={getHub:()=>this._getHub()??void 0,stopRequested:()=>{const o=this._stop;return this._stop=!1,o},sleep:o=>new Promise(i=>{const a=()=>{clearTimeout(l),this._sleepers.delete(a),i()},l=setTimeout(a,o*1e3);this._sleepers.add(a),this._stop&&a()})},await n.runPythonAsync(`import asyncio
asyncio.get_event_loop()._keyboard_interrupt_handler = lambda: None`),await n.runPythonAsync(Qn),this.py=n,e("Python listo."),n}async run(e){if(this._running){this.stop();try{await this._current}catch{}this._stop=!1}if(await this.init(),this._running){this.stop();try{await this._current}catch{}this._stop=!1}return this._running=!0,this._stop=!1,this._current=this._execute(e),this._current}async _execute(e){const t=this.py.globals.get("dict")();try{return await this.py.runPythonAsync(e,{globals:t}),{ok:!0,stopped:!1,error:null}}catch(n){if((n==null?void 0:n.type)==="KeyboardInterrupt")return{ok:!1,stopped:!0,error:null};const r=(n==null?void 0:n.message)??String(n);return this._out("stderr",r.endsWith(`
`)?r:`${r}
`),{ok:!1,stopped:!1,error:r}}finally{this._running=!1,t.destroy();const n=this._getHub();if(n!=null&&n.isConnected)try{await n.stopAll()}catch{}}}stop(){if(this._running){this._stop=!0;for(const e of[...this._sleepers])e()}}}function Xn(s="./"){const e=`${new URL(`${s}pyodide/`,globalThis.location.href).href}`;return{indexURL:e,loader:()=>Un(()=>import(`${e}pyodide.mjs`),[],import.meta.url)}}const z=s=>s.replace(/[&<>]/g,e=>e==="&"?"&amp;":e==="<"?"&lt;":"&gt;"),es=new Set(["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield","match","case"]),ts=new Set(["True","False","None","self","cls"]),ns=new Set(["print","len","range","input","open","str","int","float","bool","bytes","list","dict","set","tuple","frozenset","abs","min","max","round","sum","sorted","reversed","enumerate","zip","map","filter","any","all","isinstance","issubclass","type","object","super","dir","repr","hash","hex","oct","bin","ord","chr","divmod","pow","format","id","getattr","setattr","hasattr","callable","iter","next","Exception","KeyboardInterrupt","ValueError","TypeError","RuntimeError","IndexError","KeyError","AttributeError","OSError","StopIteration","ZeroDivisionError","TimeoutError"]),me=/(?<cmt>#.*)|(?<str>"""[\s\S]*?"""|'''[\s\S]*?'''|(?:[fFrRbBuU]{0,2})"(?:\\[\s\S]|[^"\\\n])*"|(?:[fFrRbBuU]{0,2})'(?:\\[\s\S]|[^'\\\n])*')|(?<dec>@[\w.]+)|(?<num>\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?|\.\d+(?:[eE][+-]?\d+)?)\b)|(?<id>[^\W\d]\w*)|(?<ws>[ \t]+)|(?<any>[\s\S])/g;function ss(s){me.lastIndex=0;let e="",t=0,n;for(;n=me.exec(s);){n.index>t&&(e+=z(s.slice(t,n.index))),t=n.index+n[0].length;const r=n.groups;let o=null,i=n[0];if(r.cmt)o="cmt";else if(r.str)o="str";else if(r.dec)o="dec";else if(r.num)o="num";else if(r.id){const a=r.id;if(i=a,es.has(a))o="kw";else if(ts.has(a))o="kw2";else if(ns.has(a))o="builtin";else{let l=Math.min(s.length,n.index+a.length);for(;l<s.length&&(s[l]===" "||s[l]==="	");)l+=1;s[l]==="("&&(o="fn")}}e+=o?`<span class="${o}">${z(i)}</span>`:z(i),n[0].length===0&&(me.lastIndex+=1)}return t<s.length&&(e+=z(s.slice(t))),e}function rs({host:s,onChange:e=()=>{}}){const t=y("div",{class:"py-gutter","aria-hidden":"true"}),n=y("div",{class:"py-surface"}),r=y("pre",{class:"py-hl","aria-hidden":"true"}),o=y("textarea",{id:"py-code",class:"py-input",wrap:"off",spellcheck:"false",autocapitalize:"off",autocorrect:"off","aria-label":"Código Python"});n.append(r,o),s.classList.add("py-editor"),s.append(t,n);function i(){const l=o.value;r.innerHTML=ss(l)+(l.endsWith(`
`)?"":`
`);const p=l.split(`
`).length;let d="";for(let m=1;m<=p;m+=1)d+=`<span>${m}</span>`;t.innerHTML=d,t.scrollTop=o.scrollTop}function a(){r.scrollTop=o.scrollTop,r.scrollLeft=o.scrollLeft,t.scrollTop=o.scrollTop}return o.addEventListener("input",()=>{i(),e(o.value)}),o.addEventListener("scroll",a),o.addEventListener("keydown",l=>{if(l.key!=="Tab")return;l.preventDefault();const{selectionStart:p,selectionEnd:d}=o;o.setRangeText("    ",p,d,"end"),o.dispatchEvent(new Event("input"))}),i(),{textarea:o,setValue(l){o.value=l,i()},getValue(){return o.value},focus(){o.focus()}}}function os(s,e="mi_programa.py"){const t=new Blob([s],{type:"text/x-python;charset=utf-8"}),n=URL.createObjectURL(t),r=Object.assign(document.createElement("a"),{href:n,download:e});document.body.append(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function is(s,e=t=>{throw t}){const t=Object.assign(document.createElement("input"),{type:"file",accept:".py,text/x-python"});t.addEventListener("change",async()=>{var r;const n=(r=t.files)==null?void 0:r[0];if(n)try{s(await n.text(),n.name)}catch(o){e(o)}}),t.click()}const Ie="wedopy.python.program",De="mi_programa.py",as=`"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
from wedopy import Hub, task

with Hub() as hub:
    def blink():
        while True:
            hub.led.index(6)
            yield task.sleep(0.3)
            hub.led.index(9)
            yield task.sleep(0.3)

    def move():
        motor = hub.motor("A")
        try:                      # cancelling a task never stops the motor by itself
            motor.run(75)
            yield task.sleep(3)
        finally:
            motor.stop()

    hub.tasks.add(blink, background=True)   # does not keep wait() alive
    hub.tasks.add(move)
    hub.tasks.wait()                        # returns when move() ends; blink is cancelled
`;function cs(s,{runtime:e}={}){const t=h("#py-out"),n=h("#py-status"),r=h("#py-run"),o=h("#py-stop"),i=_=>{try{localStorage.setItem(Ie,_)}catch{}},a=rs({host:h("#py-editor"),onChange:_=>i(_)}),l=(_,g)=>{t.append(y("span",{class:_==="stderr"?"err":""},g.endsWith(`
`)?g:`${g}
`)),t.scrollTop=t.scrollHeight},p=e??new Zn({getHub:()=>s.hub,onOutput:l,...Xn()});s.python=p;let d="";try{d=localStorage.getItem(Ie)??""}catch{}a.setValue(d||as),h("#py-export").addEventListener("click",()=>{os(a.getValue(),De),n.textContent=`Programa exportado como ${De}`}),h("#py-import").addEventListener("click",()=>{is((_,g)=>{a.setValue(_),i(_),n.textContent=`Importado «${g}» — listo para ejecutar.`},_=>{n.textContent="",l("stderr",`Importación: ${_.message}
`)})});let m=0;r.addEventListener("click",()=>{const _=++m,g=p.running;t.replaceChildren(),o.disabled=!1,g&&l("stderr",`⏹ se interrumpe el programa anterior…
`),n.textContent=g?"Interrumpiendo el programa anterior…":"Ejecutando…",p.run(a.getValue()).then(c=>{_===m&&(n.textContent=c.stopped?"Detenido.":c.ok?"Terminado.":"Terminó con error.",o.disabled=!0,c.stopped&&l("stdout","[programa detenido]"))}).catch(c=>{_===m&&(n.textContent="",l("stderr",c.message),o.disabled=!0)})}),o.addEventListener("click",()=>{var _,g,c;p.stop(),(c=(g=(_=s.hub)==null?void 0:_.tasks)==null?void 0:g.cancel)==null||c.call(g)}),document.addEventListener("keydown",_=>{_.key!=="Enter"||!(_.ctrlKey||_.metaKey)||(_.preventDefault(),r.click())})}function ls(s){const e=()=>s.sim;for(const o of["A","B"]){const i=h(`#sim-${o}`);i.value=s.simDevices[o]??"",i.addEventListener("change",()=>{const a=i.value;a?s.simDevices[o]=a:delete s.simDevices[o],!(!e()||!s.connected)&&(a?e().attach(o,a):e().detach(o),s._log("info",`Simulador: puerto ${o} → ${a||"vacío"}`))})}h("#sim-dist").addEventListener("input",o=>{var i;s.simDistance=Number(o.target.value),(i=e())==null||i.setDistance(s.simDistance)}),h("#sim-tilt").addEventListener("change",o=>{var i;return(i=e())==null?void 0:i.setTiltDirection(o.target.value)});const t=h("#sim-press"),n=()=>{var o;return(o=e())==null?void 0:o.press()},r=()=>{var o;return(o=e())==null?void 0:o.release()};t.addEventListener("pointerdown",n),t.addEventListener("pointerup",r),t.addEventListener("pointerleave",r),h("#sim-drop").addEventListener("click",()=>{var o;s._log("warn","Simulador: pérdida de enlace inyectada."),(o=e())==null||o.dropLink()}),h("#sim-freeze").addEventListener("change",o=>{var i,a;o.target.checked?(i=e())==null||i.freeze():(a=e())==null||a.unfreeze(),s._log("warn",`Simulador: hub ${o.target.checked?"sin responder (sin ACK)":"responde de nuevo"}.`)})}const Be="wedopy.theme",J=["auto","light","dark"],hs={auto:"🌗",light:"☀️",dark:"🌙"},Pe={auto:"Tema del sistema (auto)",light:"Tema claro",dark:"Tema oscuro (Dracula)"},ge={light:"#f4f5fa",dark:"#282a36"};function us(s){let e;try{e=localStorage.getItem(Be)}catch{}J.includes(e)||(e="auto");const t=()=>{e==="auto"?document.documentElement.removeAttribute("data-theme"):document.documentElement.setAttribute("data-theme",e),s.textContent=hs[e],s.setAttribute("aria-label",Pe[e]),s.title=Pe[e];for(const n of document.querySelectorAll('meta[name="theme-color"]'))n.content=e==="auto"?n.media.includes("light")?ge.light:ge.dark:ge[e==="light"?"light":"dark"]};s.addEventListener("click",()=>{e=J[(J.indexOf(e)+1)%J.length];try{localStorage.setItem(Be,e)}catch{}t()}),t()}const D=new Sn,le=xn();D.subscribe((s,e)=>{s==="log"&&le.log(e.level,e.message)});Ln(D);Bn(D);ls(D);cs(D);us(h("#btn-theme"));document.addEventListener("visibilitychange",()=>{document.hidden&&D.onHidden()});le.log("info",D.supportsBluetooth?"Web Bluetooth disponible. Pulsa «Conectar» y elige tu Smart Hub.":"Web Bluetooth no disponible en este navegador: usa el simulador.");le.log("debug",`Diagnóstico: isSecureContext=${window.isSecureContext}, navigator.bluetooth=${!!navigator.bluetooth}, origen=${location.origin}`);var Q,$e;($e=(Q=navigator.bluetooth)==null?void 0:Q.getAvailability)==null||$e.call(Q).then(s=>le.log(s?"info":"warn",s?"Adaptador Bluetooth disponible.":"El navegador no ve ningún adaptador Bluetooth (¿servicio bluetooth apagado?).")).catch(()=>{});window.wedopyApp=D;
