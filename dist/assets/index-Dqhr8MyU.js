var ct=Object.defineProperty;var lt=(s,e,t)=>e in s?ct(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var v=(s,e,t)=>lt(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const ht="-1212-efde-1523-785feabcd123",ut="-0000-1000-8000-00805f9b34fb",Ue=s=>s.toString(16).padStart(4,"0"),k=s=>`0000${Ue(s)}${ht}`,ie=s=>`0000${Ue(s)}${ut}`;ie(6144);const dt=ie(6154),ft=ie(6159),He=k(5411),_t=k(20238),W=ie(10777);k(5412);const O=k(5414),S=k(5415);k(5416);k(5417);k(5418);const Me=k(5419),ne=k(5422),j=k(5472);k(5473);const P=k(5475),L=k(5477),ae=1,ce=2,pt=3,mt=4,gt=5,H=6,F=1,Ge=20,We=21,je=22,Ne=23,I=34,M=35,bt=36,Fe=0,qe=2,wt=0,yt=1,be=0,Ke=1,Et=0,X=Object.freeze({[F]:"motor",[Ge]:"voltage",[We]:"current",[je]:"piezo",[Ne]:"rgb-led",[I]:"tilt",[M]:"distance",[bt]:"generic"}),vt=Object.freeze([W,S,j,P,L]),Nt=Object.freeze(["LPF2 Smart Hub 2 I/O"]);class T extends Error{constructor(e,t){super(e,t),this.name=new.target.errorName}}v(T,"errorName","WedoError");class R extends T{}v(R,"errorName","BLEError");class B extends T{}v(B,"errorName","HubConnectionError");class A extends B{}v(A,"errorName","HubDisconnectedError");class $ extends T{}v($,"errorName","OperationTimeout");class Z extends T{}v(Z,"errorName","HubBusyError");class q extends T{}v(q,"errorName","DeviceNotFoundError");class Te extends T{}v(Te,"errorName","DeviceTypeError");class Ve extends T{}v(Ve,"errorName","AmbiguousDeviceError");class N extends T{}v(N,"errorName","InvalidStateError");class se extends T{}v(se,"errorName","UnsupportedFeatureError");class Tt{constructor(e){this._session=e}get isPressed(){return this._session.core.buttonPressed()}get isReleased(){return!this.isPressed}}const kt=0,Ct=0,St=1,xt=1,At=2,Rt=2,Lt=3,Ot=4,It=4,Dt=4,Bt=5,Pt=5,$t=6,Ut=6,Ht=7,Mt=8,Gt=9,Wt=10,jt=10,Ye={OFF:kt,BLACK:Ct,PINK:St,ROSE:xt,PURPLE:At,VIOLET:Rt,BLUE:Lt,CYAN:Ot,LIGHT_BLUE:It,SKY_BLUE:Dt,LIGHT_GREEN:Bt,TEAL:Pt,GREEN:$t,DARK_GREEN:Ut,YELLOW:Ht,ORANGE:Mt,RED:Gt,WHITE:Wt,BRIGHT_WHITE:jt};function K(s,e,t){if(typeof e!="number"||!Number.isInteger(e))throw new TypeError(`${s} must be an integer, not ${typeof e}`);if(e<0||e>t)throw new RangeError(`${s} must be in 0..${t}, got ${e}`);return e}class ze{constructor(e){this._session=e}on(){return this.rgb(255,255,255)}off(){return this.rgb(0,0,0)}index(e){return this._session.core.ledIndex(K("index",e,10))}rgb(e,t,n){return this._session.core.ledRgb(K("red",e,255),K("green",t,255),K("blue",n,255))}}Object.assign(ze,Ye);Object.freeze({...Ye});function Je(s){if(typeof s!="number"||!Number.isInteger(s))throw new TypeError(`speed must be an integer in -100..100, not ${typeof s=="number"?s:typeof s}`);if(s<-100||s>100)throw new RangeError(`speed must be in -100..100, got ${s}`);return s}class Ft{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}run(e){return this._session.core.setMotor(this._conn,Je(e))}stop(){return this._session.core.setMotor(this._conn,0)}toString(){return`Motor('${this.port}')`}}class qt{constructor(e){this._motors=[...e].sort((t,n)=>t.port<n.port?-1:t.port>n.port?1:0)}async run(e){Je(e);for(const t of this._motors)await t.run(e)}async stop(){let e=null;for(const t of this._motors)try{await t.stop()}catch(n){e??(e=n)}if(e)throw e}toString(){return`MotorGroup(${this._motors.map(e=>`'${e.port}'`).join(", ")})`}}const x=()=>performance.now()/1e3,V=s=>new Promise(e=>setTimeout(e,s*1e3));function U(s,e,t){return new Promise((n,r)=>{const o=setTimeout(()=>r(t()),e*1e3);s.then(i=>{clearTimeout(o),n(i)},i=>{clearTimeout(o),r(i)})})}const ue=(s,e)=>()=>new $(`${s} agotó el tiempo de espera (${e.toFixed(1)} s)`);class Qe{constructor(){this._waiters=new Set}notify(){const e=[...this._waiters];this._waiters.clear();for(const t of e)t()}wait(e){return new Promise(t=>{const n=()=>{clearTimeout(r),this._waiters.delete(n),t()},r=setTimeout(n,Math.max(0,e)*1e3);this._waiters.add(n)})}}function we(s){const e=Math.floor(s),t=s-e;return t<.5?e:t>.5?e+1:e%2===0?e:e+1}class Xe{constructor(){this._listeners=new Set}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}emit(e,t){for(const n of[...this._listeners])try{n(e,t)}catch(r){console.error("listener error",r)}}}const Ze=s=>Array.from(s,e=>e.toString(16).padStart(2,"0")).join(" "),Kt=Object.freeze({0:"neutral",3:"back",5:"right",7:"left",9:"forward"});function de(s,e){const t=Math.max(-100,Math.min(100,e));return Uint8Array.of(s,1,1,t&255)}const Vt=s=>Uint8Array.of(H,4,1,s),Yt=(s,e,t)=>Uint8Array.of(H,4,3,s,e,t);function Ce(s,e,t,n,r,o){const i=new Uint8Array(11),a=new DataView(i.buffer);return i[0]=1,i[1]=2,i[2]=s,i[3]=e,i[4]=t,a.setUint32(5,n,!0),i[9]=r,i[10]=1,i}const zt=s=>Uint8Array.of(0,1,s);function Jt(s){if(s.length<2)throw new RangeError(`port event too short (${s.length} bytes)`);const e=s[0];if(!(s[1]===1))return{conn:e,attached:!1,hubIndex:0,type:0};if(s.length<4)throw new RangeError(`attach event too short (${s.length} bytes)`);return{conn:e,attached:!0,hubIndex:s[2],type:s[3]}}function Qt(s){if(s.length<2)throw new RangeError(`sensor value too short (${s.length} bytes)`);const e=Uint8Array.from(s);return{conn:e[1],value:e.slice(2),raw:e}}const re=s=>new DataView(s.buffer,s.byteOffset,s.byteLength);function et(s){switch(s.length){case 1:return s[0];case 2:return re(s).getUint16(0,!0);case 4:return re(s).getFloat32(0,!0);default:throw new RangeError(`cannot decode a ${s.length}-byte sensor value`)}}function Xt(s){if(s.length===8){const t=re(s),n=t.getFloat32(0,!0),r=t.getFloat32(4,!0);if(!Number.isFinite(n)||!Number.isFinite(r))throw new RangeError("non-finite tilt angle");return[we(n),we(r)]}if(s.length<2)throw new RangeError(`tilt angle value too short (${s.length} bytes)`);const e=re(s);return[e.getInt8(0),e.getInt8(1)]}function Zt(s){const e=et(s);return Number.isFinite(e)?Kt[Math.trunc(e)]??"unknown":"unknown"}function ye(s,e){try{return s(e)}catch(t){throw t instanceof RangeError?new R(`unexpected sensor value ${Ze(e)}: ${t.message}`,{cause:t}):t}}class oe{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}async read(){const e=await this._session.core.readSensor(this._conn,M,Et,qe),t=ye(et,e);if(!Number.isFinite(t))throw new R("the distance sensor reported a non-finite value");return Math.max(0,Math.min(10,we(t)))}static _threshold(e){if(typeof e!="number")throw new TypeError("threshold must be a number");if(!Number.isFinite(e)||e<0||e>10)throw new RangeError("threshold must be a finite number in 0..10");return e}async isNear(e){const t=oe._threshold(e);return await this.read()<t}async isFar(e){const t=oe._threshold(e);return await this.read()>t}toString(){return`DistanceSensor('${this.port}')`}}class en{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}async readAngle(){const e=await this._session.core.readSensor(this._conn,I,be,Fe,2);return ye(Xt,e)}async readDirection(){const e=await this._session.core.readSensor(this._conn,I,Ke,qe,4);return ye(Zt,e)}toString(){return`TiltSensor('${this.port}')`}}const f=Object.freeze({DISCONNECTED:"disconnected",CONNECTING:"connecting",CONNECTED:"connected",DISCONNECTING:"disconnecting",SHUTDOWN:"shutdown",ERROR:"error"}),b=f,tn=Object.freeze({[b.DISCONNECTED]:new Set([b.CONNECTING]),[b.CONNECTING]:new Set([b.CONNECTED,b.ERROR,b.DISCONNECTED]),[b.CONNECTED]:new Set([b.DISCONNECTING,b.ERROR,b.SHUTDOWN]),[b.DISCONNECTING]:new Set([b.DISCONNECTED,b.ERROR]),[b.SHUTDOWN]:new Set([b.CONNECTING,b.DISCONNECTED]),[b.ERROR]:new Set([b.CONNECTING,b.DISCONNECTING,b.DISCONNECTED])});class nn{constructor(e=()=>{}){this._state=b.DISCONNECTED,this._error=null,this._onChange=e}get state(){return this._state}get error(){return this._error}transition(e,t=null){const n=this._state;if(e!==n){if(!tn[n].has(e))throw new N(`invalid hub state transition ${n} -> ${e}`);this._state=e,this._error=e===b.ERROR?t:null,this._onChange(e,this._error)}}forceError(e){(this._state===b.CONNECTED||this._state===b.CONNECTING)&&this.transition(b.ERROR,e)}}const sn=Object.freeze({heartbeatInterval:.5,watchdogTimeout:2,emergencyAttempts:2,emergencyAttemptTimeout:.5,opTimeout:1,sensorTimeout:1,settleQuiet:1.5,settleMax:5,connectTimeout:15,poll:.02});function Ee(s={}){return Object.freeze({...sn,...s})}class rn{constructor({timing:e,isArmed:t,enqueueHeartbeat:n,lastOk:r,trip:o,now:i=x}){this._tm=e,this._isArmed=t,this._enqueueHeartbeat=n,this._lastOk=r,this._trip=o,this._now=i,this._signal=new Qe,this._stopped=!0,this._loop=null}start(){this._stopped=!1,this._loop=this._run()}wake(){this._signal.notify()}async stop(){this._stopped=!0,this._signal.notify();const e=this._loop;this._loop=null,e&&await e}async _run(){const e=this._tm;let t=null,n=0;for(;!this._stopped;){if(!this._isArmed()){t=null,await this._signal.wait(.1);continue}const r=this._now();if(t&&t.settled&&(t=null),t===null&&r>=n){n=r+e.heartbeatInterval;try{t=this._enqueueHeartbeat()}catch{t=null}}const o=r-this._lastOk();if(o>e.watchdogTimeout){await this._trip(`no valid ACK from the hub for ${o.toFixed(1)} s`),t=null;continue}await this._signal.wait(e.poll)}}}const on=(s,e)=>`${s}/${e}`,an=3;class tt extends Xe{constructor(e,t){super(),this._t=e,this.timing=t?Ee(t):Ee(),this._sm=new nn((n,r)=>this.emit("state",{state:n,error:r})),this._linkLost=!1,this._lossHandled=!1,this._tripping=!1,this._ports=new Map,this._modes=new Map,this._samples=new Map,this._ledMode=-1,this._button=!1,this._speeds=new Map,this._lastOk=0,this._lastPortChange=0,this._changed=new Qe,this._emergencyQ=[],this._normalQ=[],this._workerActive=!1,this._draining=null,this._isDraining=!1,this._epoch=0,this._wd=null}get state(){return this._sm.state}get error(){return this._sm.error}_unusable(){const e=this._sm.state;switch(e){case f.CONNECTED:return null;case f.CONNECTING:case f.DISCONNECTING:return new Z(`hub is ${e}`);case f.ERROR:return new A(`hub connection lost: ${this._sm.error}`);case f.SHUTDOWN:return new N("hub was shut down; power it on and call connect()");default:return new N("hub is not connected; call connect() first")}}checkUsable(){const e=this._unusable();if(e)throw e}_log(e,t){this.emit("log",{level:e,message:t})}_startWorker(){this._emergencyQ.length=0,this._normalQ.length=0,this._epoch+=1,this._workerActive=!0}async _stopWorker(){this._workerActive=!1,this._epoch+=1;const e=[...this._emergencyQ,...this._normalQ];this._emergencyQ.length=0,this._normalQ.length=0;for(const n of e)n.reject(new A("hub closed"));const t=this._isDraining?this._draining:null;t&&await U(t,this.timing.opTimeout*2+1,()=>null).catch(()=>{})}_enqueue(e,{emergency:t=!1,needsConnected:n=!0}={}){if(!this._workerActive)throw new N("hub is not connected; call connect() first");const r={fn:e,emergency:t,needsConnected:n,epoch:this._epoch,abandoned:!1,settled:!1};return r.promise=new Promise((o,i)=>{r.resolve=a=>{r.settled=!0,o(a)},r.reject=a=>{r.settled=!0,i(a)}}),r.promise.catch(()=>{}),(t?this._emergencyQ:this._normalQ).push(r),this._kick(),r}_kick(){this._isDraining||(this._isDraining=!0,this._draining=this._drain())}async _drain(){try{for(;this._workerActive;){const e=this._emergencyQ.length?this._emergencyQ.shift():this._normalQ.shift();if(!e)break;if(e.abandoned){e.resolve(void 0);continue}if(e.epoch!==this._epoch){e.reject(new A("stale request dropped after reconnect"));continue}try{e.needsConnected&&this.checkUsable();const t=await e.fn();this._lastOk=x(),e.resolve(t)}catch(t){e.reject(t)}}}finally{this._isDraining=!1}}_submit(e,t,n,r,o){const i=this._enqueue(e,{emergency:t,needsConnected:n}),a=o??r+this.timing.opTimeout+.5;return Number.isFinite(a)?U(i.promise,a,()=>(i.abandoned=!0,new $("hub operation did not complete"))):i.promise}async _io(e,t,n){try{return await this._t[e](...t,n)}catch(r){throw r instanceof A?(this._onLinkLost(r.message),r):r instanceof T?r:new R((r==null?void 0:r.message)??String(r),{cause:r})}}_call(e,t=[],{timeout:n,emergency:r=!1,needsConnected:o=!0,outer:i}={}){const a=n??this.timing.opTimeout;return this._submit(()=>this._io(e,t,a),r,o,a,i)}_onNotify(e,t){try{if(e===S)this._handlePort(t);else if(e===j){const n=Qt(t);this._samples.set(n.conn,n.value),this.emit("sample",{conn:n.conn,value:n.value}),this._changed.notify()}else e===O?t.length>0&&(this._button=t[0]!==0,this.emit("button",{pressed:this._button})):e===ne&&this._onLinkLost("hub sent a Disconnect notification")}catch(n){this._log("debug",`bad notification on ${e}: ${Ze(t)} (${n==null?void 0:n.message})`)}}_handlePort(e){const t=Jt(e),n=this._ports.get(t.conn);if(t.attached){if(n&&n.type===t.type&&n.hubIndex===t.hubIndex)return;this._ports.set(t.conn,t)}else{if(!n)return;this._ports.delete(t.conn)}this._modes.delete(t.conn),this._samples.delete(t.conn),t.conn===H&&(this._ledMode=-1),this._lastPortChange=x(),this.emit("ports",{ports:this.portsRaw()}),this._changed.notify()}_onLinkLost(e){const t=this._sm.state;if(t===f.DISCONNECTING||t===f.DISCONNECTED||t===f.SHUTDOWN)return;this._linkLost=!0,this._sm.forceError(e),this._changed.notify();const n=!this._lossHandled;this._lossHandled=!0,n&&this._log("error",`link lost: ${e}`),n&&this._motorsActive()&&this._trip(`link lost: ${e}`).catch(()=>{})}async connect(){const e=this._sm.state;if(e===f.CONNECTED)return;if(e===f.CONNECTING||e===f.DISCONNECTING)throw new Z(`hub is ${e}`);this._sm.transition(f.CONNECTING),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._speeds.clear(),this._ledMode=-1,this._button=!1,this._linkLost=!1,this._lossHandled=!1,this._tripping=!1;const t=this.timing;try{this._startWorker(),this._t.setCallbacks((n,r)=>this._onNotify(n,r),n=>this._onLinkLost(n)),await this._call("connect",[],{timeout:t.connectTimeout,needsConnected:!1,outer:this._t.interactive?1/0:void 0});for(const n of vt)if(!this._t.hasCharacteristic(n))throw new B(`device does not look like a WeDo 2.0 hub: missing ${n}`);if(await this._optional("subscribe",ne),await this._call("subscribe",[j],{needsConnected:!1}),this._t.hasCharacteristic(O)){await this._optional("subscribe",O);try{const n=await this._call("read",[O],{needsConnected:!1});this._button=n.length>0&&n[0]!==0}catch(n){if(!(n instanceof T))throw n}}if(await this._call("subscribe",[S],{needsConnected:!1}),await this._settlePorts(f.CONNECTING),this._sm.state!==f.CONNECTING)throw this._unusable()??new A("connection lost during connect");this._lastOk=x(),this._sm.transition(f.CONNECTED),this._startWatchdog()}catch(n){throw await this._abortConnect(n),n instanceof T?n:new B((n==null?void 0:n.message)??String(n),{cause:n})}}async _optional(e,...t){try{await this._call(e,t,{needsConnected:!1})}catch(n){if(!(n instanceof T))throw n;this._log("debug",`optional ${e} ${t} unavailable: ${n.message}`)}}async _abortConnect(e){this._sm.state===f.CONNECTING&&(this._sm.transition(f.ERROR,(e==null?void 0:e.message)??String(e)),this._changed.notify()),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}async _settlePorts(e){const t=this.timing,n=x();for(this._lastPortChange=Math.max(this._lastPortChange,n);;){if(this._sm.state!==e)throw this._unusable()??new A("connection lost during port discovery");const r=x(),o=t.settleQuiet-(r-this._lastPortChange),i=t.settleMax-(r-n);if(o<=0||i<=0)return;await this._changed.wait(Math.min(o,i))}}async disconnect(){const e=this._sm.state;if(e===f.DISCONNECTED||e===f.SHUTDOWN)return e===f.SHUTDOWN&&this._sm.transition(f.DISCONNECTED),!0;if(e===f.CONNECTING||e===f.DISCONNECTING)throw new Z(`hub is ${e}`);const t=this._linkLost;this._sm.transition(f.DISCONNECTING);let n=!0;t?this._motorsActive()&&(n=!1):{confirmed:n}=await this._stopMotors(this.timing.emergencyAttempts,this.timing.emergencyAttemptTimeout),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch(r){this._log("debug",`transport disconnect failed: ${r==null?void 0:r.message}`)}return n&&this._speeds.clear(),this._sm.transition(f.DISCONNECTED),this._changed.notify(),n||this._log("warn","disconnect: motor stop could not be confirmed"),n}async shutdownHub(){this.checkUsable(),await this._call("write",[Me,Uint8Array.of(1)]),this._sm.transition(f.SHUTDOWN),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}portsRaw(){return new Map([...this._ports].map(([e,t])=>[e,t.type]))}async refreshPorts(){this.checkUsable(),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._ledMode=-1,this._lastPortChange=x(),await this._call("unsubscribe",[S]),await this._call("subscribe",[S]),await this._settlePorts(f.CONNECTED)}_requireDevice(e,t){const n=this._ports.get(e);if(!n)throw new q(`no device on connect id ${e}`);if(n.type!==t){const r=o=>X[o]??`0x${o.toString(16).padStart(2,"0")}`;throw new Te(`device on connect id ${e} is a ${r(n.type)}, expected a ${r(t)}`)}}_motorsActive(){for(const e of this._speeds.values())if(e!==0)return!0;return!1}async setMotor(e,t){var o;this.checkUsable(),this._requireDevice(e,F);const n=de(e,t),r=this._motorsActive();t!==0&&(this._speeds.set(e,t),r||(this._lastOk=x()),(o=this._wd)==null||o.wake()),await this._call("write",[L,n]),t===0&&this._speeds.set(e,0),this.emit("motor",{conn:e,speed:t})}async stopAll(){this.checkUsable();const e=this._knownMotors();let t=null;for(const n of e){try{await this._call("write",[L,de(n,0)],{emergency:!0})}catch(r){t??(t=r);continue}this._speeds.set(n,0),this.emit("motor",{conn:n,speed:0})}if(t)throw t}_knownMotors(){const e=new Set;for(const[t,n]of this._ports)n.type===F&&e.add(t);for(const t of this._speeds.keys())e.add(t);return[...e].sort((t,n)=>t-n)}async _ensureLedMode(e){this._ledMode!==e&&(await this._call("write",[P,Ce(H,Ne,e,1,Fe)]),this._ledMode=e)}async ledIndex(e){this.checkUsable(),await this._ensureLedMode(yt),await this._call("write",[L,Vt(e)])}async ledRgb(e,t,n){this.checkUsable(),await this._ensureLedMode(wt),await this._call("write",[L,Yt(e,t,n)])}buttonPressed(){return this.checkUsable(),this._button}async readBattery(){return this.checkUsable(),(await this._call("read",[W]))[0]}async readSensor(e,t,n,r,o=null,i=null){this.checkUsable(),this._requireDevice(e,t);const a=i??this.timing.sensorTimeout,l=on(t,n),p=async()=>{this._samples.delete(e),this._modes.set(e,l);try{await this._call("write",[P,Ce(e,t,n,1,r,!0)]),await this._call("write",[P,zt(e)])}catch(_){throw this._modes.get(e)===l&&this._modes.delete(e),_}};this._modes.get(e)!==l&&await p();const u=x()+a;let g=0;for(;;){const _=this._unusable();if(_)throw _;if(!this._ports.has(e))throw new q(`the device on connect id ${e} was disconnected`);if(this._modes.get(e)!==l&&g<an){if(g++,await p(),x()>=u)throw new $(`the hub sent no value within ${a.toFixed(1)} s`);continue}const m=this._samples.get(e);if(m&&(o===null||m.length===o))return m;const c=u-x();if(c<=0)throw new $(`the hub sent no value within ${a.toFixed(1)} s`);await this._changed.wait(c)}}_startWatchdog(){this._wd=new rn({timing:this.timing,isArmed:()=>this._sm.state===f.CONNECTED&&this._motorsActive(),enqueueHeartbeat:()=>this._enqueue(()=>this._io("read",[W],this.timing.opTimeout),{emergency:!0,needsConnected:!1}),lastOk:()=>this._lastOk,trip:e=>this._trip(e)}),this._wd.start()}async _stopWatchdog(){const e=this._wd;this._wd=null,e&&await e.stop()}async _stopMotors(e,t){let n=this._knownMotors();const r=[];for(let o=0;o<e&&n.length!==0;o+=1){const i=[];for(const a of n){try{await this._call("write",[L,de(a,0)],{timeout:t,emergency:!0,needsConnected:!1})}catch{i.push(a);continue}this._speeds.set(a,0),this.emit("motor",{conn:a,speed:0})}n=i,r.push(n.length===0)}return{confirmed:n.length===0,results:r}}async _trip(e){if(!this._tripping){this._tripping=!0;try{const t=this.timing;this._log("error",`watchdog: ${e}`);const{confirmed:n,results:r}=await this._stopMotors(t.emergencyAttempts,t.emergencyAttemptTimeout),o=[];for(let i=0;i<r.length&&(o.push(`${i===0?"stop attempt 1":`attempt ${i+1}`}${r[i]?" ACK":" no ACK"}`),!r[i]);i+=1);n?(this._log("warn",`watchdog: ${o.join(", ")}`),this._log("warn","watchdog: motors stopped")):this._log("error",`watchdog: stop NOT confirmed (${t.emergencyAttempts} attempts)`),this._sm.forceError(e),this._changed.notify()}finally{this._tripping=!1}}}}v(tt,"STOP_PROFILE","nobarrier");class nt{constructor(){v(this,"interactive",!1)}setCallbacks(e,t){throw new N("not implemented")}async connect(e){throw new N("not implemented")}async disconnect(e){throw new N("not implemented")}hasCharacteristic(e){throw new N("not implemented")}async read(e,t){throw new N("not implemented")}async write(e,t,n){throw new N("not implemented")}async subscribe(e,t){throw new N("not implemented")}async unsubscribe(e,t){throw new N("not implemented")}}const fe=[He,_t,ft,dt];function st(s=globalThis.navigator){return!!(s&&s.bluetooth&&typeof s.bluetooth.requestDevice=="function")}function rt(s=globalThis){var r;if(st(s.navigator))return null;if(s.isSecureContext===!1)return"Web Bluetooth requiere HTTPS (o localhost). Abre la aplicación desde una dirección segura.";const e=((r=s.navigator)==null?void 0:r.userAgent)??"";return`Este navegador no admite Web Bluetooth. Usa Chrome o Edge en un sistema compatible (Firefox y Safari no están soportados).${/Linux/.test(e)&&!/Android/.test(e)?" En Linux Web Bluetooth está desactivado por defecto: abre chrome://flags/#enable-experimental-web-platform-features, ponlo en «Enabled», reinicia el navegador y comprueba que BlueZ ≥ 5.41 (`bluetoothd --version`) y el servicio bluetooth están activos.":""}`}const Se=s=>new Uint8Array(s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength));class ot extends nt{constructor({bluetooth:t=(r=>(r=globalThis.navigator)==null?void 0:r.bluetooth)(),acceptAll:n=!1}={}){super();v(this,"interactive",!0);this._bt=t,this._acceptAll=n,this._device=null,this._chars=new Map,this._handlers=new Map,this._onNotify=null,this._onDisconnect=null,this._closing=!1,this._onGattDisconnected=()=>{var o;this._closing||(o=this._onDisconnect)==null||o.call(this,"BLE link lost")}}setCallbacks(t,n){this._onNotify=t,this._onDisconnect=n}get deviceName(){var t;return((t=this._device)==null?void 0:t.name)??null}async connect(t){if(!this._bt)throw new se(rt()??"Web Bluetooth no está disponible");this._closing=!1;let n;try{n=await this._bt.requestDevice(this._acceptAll?{acceptAllDevices:!0,optionalServices:fe}:{filters:[{services:[He]},...Nt.map(r=>({name:r}))],optionalServices:fe})}catch(r){throw(r==null?void 0:r.name)==="NotFoundError"?new B("no WeDo 2.0 hub was selected"):(r==null?void 0:r.name)==="SecurityError"?new B("the browser requires a user gesture (click) and HTTPS to open the Bluetooth chooser"):new R((r==null?void 0:r.message)??String(r),{cause:r})}this._device=n,n.addEventListener("gattserverdisconnected",this._onGattDisconnected);try{const r=await U(n.gatt.connect(),t,ue("GATT connect",t));await U(this._discover(r),t,ue("service discovery",t))}catch(r){throw await this._release(),this._map(r)}}async _discover(t){this._chars.clear();for(const n of fe){let r;try{r=await t.getPrimaryService(n)}catch(o){if((o==null?void 0:o.name)==="NotFoundError")continue;throw o}for(const o of await r.getCharacteristics())this._chars.set(o.uuid.toLowerCase(),o)}}async disconnect(){this._closing=!0,await this._release()}async _release(){var n,r;const t=this._device;this._device=null;for(const[o,i]of this._handlers)(n=this._chars.get(o))==null||n.removeEventListener("characteristicvaluechanged",i);if(this._handlers.clear(),this._chars.clear(),t){t.removeEventListener("gattserverdisconnected",this._onGattDisconnected);try{(r=t.gatt)!=null&&r.connected&&t.gatt.disconnect()}catch{}}}hasCharacteristic(t){return this._chars.has(t)}_char(t){var r,o;if(!((o=(r=this._device)==null?void 0:r.gatt)!=null&&o.connected))throw new A("BLE link is not open");const n=this._chars.get(t);if(!n)throw new R(`characteristic not available: ${t}`);return n}_map(t){var n,r;return t instanceof T?t:!((r=(n=this._device)==null?void 0:n.gatt)!=null&&r.connected)||(t==null?void 0:t.name)==="NetworkError"?new A((t==null?void 0:t.message)||"BLE link lost",{cause:t}):new R((t==null?void 0:t.message)||(t==null?void 0:t.name)||"BLE error",{cause:t})}async _run(t,n,r){try{return await U(t,n,ue(r,n))}catch(o){throw this._map(o)}}async read(t,n){const r=this._char(t);return Se(await this._run(r.readValue(),n,"BLE read"))}async write(t,n,r){const o=this._char(t);if(typeof o.writeValueWithResponse!="function")throw new se("this browser lacks writeValueWithResponse; refusing to write without response");await this._run(o.writeValueWithResponse(Uint8Array.from(n)),r,"BLE write")}async subscribe(t,n){const r=this._char(t);if(!this._handlers.has(t)){const o=i=>{var l,p;const a=(l=i.target)==null?void 0:l.value;a&&((p=this._onNotify)==null||p.call(this,t,Se(a)))};r.addEventListener("characteristicvaluechanged",o),this._handlers.set(t,o)}await this._run(r.startNotifications(),n,"BLE start notifications")}async unsubscribe(t,n){const r=this._char(t);await this._run(r.stopNotifications(),n,"BLE stop notifications");const o=this._handlers.get(t);o&&(r.removeEventListener("characteristicvaluechanged",o),this._handlers.delete(t))}}class ve extends Error{constructor(){super("task cancelled"),this.name="TaskCancelled"}}function cn(s){if(typeof s!="number")throw new TypeError(`seconds must be a number, not ${typeof s}`);if(!Number.isFinite(s)||s<0)throw new RangeError(`seconds must be a finite number >= 0, got ${s}`);return s}function it(s,e){return new Promise((t,n)=>{if(e!=null&&e.aborted){n(new ve);return}const r=()=>{clearTimeout(o),n(new ve)},o=setTimeout(()=>{e==null||e.removeEventListener("abort",r),t()},s);e==null||e.addEventListener("abort",r,{once:!0})})}function ln(s,e){return cn(s),it(s*1e3,e)}function hn(s){return it(0,s)}class un{constructor(e,t){this.signal=e,this._manager=t}get cancelled(){return this.signal.aborted}cancelAll(){this._manager._cancelNow()}sleep(e){return ln(e,this.signal)}yieldNow(){return hn(this.signal)}}const dn=s=>s.name||"anonymous";class fn{constructor({onInterrupt:e=null,cancelTimeout:t=2}={}){this._onInterrupt=e,this._cancelTimeout=t,this._pending=[],this._running=new Set,this._normal=0,this._waiting=!1,this._failure=null,this._wakeWait=null,this.diagnostics=[]}add(e,t={}){if(typeof e!="function")throw new TypeError(`a task must be a function, not ${typeof e}`);if(t===null||typeof t!="object")throw new TypeError("options must be an object such as { background: true }");const{background:n=!1}=t;if(typeof n!="boolean")throw new TypeError("background must be true or false");const r={func:e,name:dn(e),background:n,controller:new AbortController,promise:null,finished:!1};n||(this._normal+=1),this._waiting?this._launch(r):this._pending.push(r)}async wait({signal:e}={}){if(this._waiting)throw new N("wait() cannot be called from a task or during another wait()");this._waiting=!0,this.diagnostics=[];const t=()=>{this._interruptedBy=e.reason??new DOMException("aborted","AbortError"),this._interruptWork=(async()=>{var o;await this.cancel();try{await((o=this._onInterrupt)==null?void 0:o.call(this))}catch{}})()};this._interruptedBy=null,this._interruptWork=null,e==null||e.addEventListener("abort",t,{once:!0});try{const o=this._pending;this._pending=[];for(const i of o)this._failure!==null?this._finish(i):this._launch(i);if(this._normal>0&&this._failure===null&&!this._interruptedBy&&(await new Promise(i=>{this._wakeWait=i}),this._wakeWait=null),this._failure===null&&!this._interruptedBy)for(const i of this._running)i.background&&i.controller.abort();else this._abortAll();await this._settle(),this._interruptWork&&await this._interruptWork}finally{e==null||e.removeEventListener("abort",t),this._waiting=!1}const n=this._interruptedBy;this._interruptedBy=null;const r=this._failure;if(this._failure=null,n)throw n;if(r)throw r}async cancel(){this._cancelNow(),await this._settle()}_abortAll(){for(const e of this._running)e.controller.abort()}_cancelNow(){for(const e of this._pending)this._finish(e);this._pending=[],this._abortAll()}async _settle(){if(this._running.size===0)return;const e=Promise.allSettled([...this._running].map(t=>t.promise));await U(e,this._cancelTimeout,()=>null).catch(()=>{})}_launch(e){const t=new un(e.controller.signal,this);this._running.add(e),e.promise=this._run(e,t)}async _run(e,t){try{await e.func(t)}catch(n){n instanceof ve||this._fail(e,n)}finally{this._running.delete(e),this._finish(e)}}_finish(e){var t;e.finished||(e.finished=!0,e.background||(this._normal-=1),(this._normal<=0||this._failure!==null)&&((t=this._wakeWait)==null||t.call(this)))}_fail(e,t){var n;if(this._failure===null&&!e.controller.signal.aborted){this._failure=t;try{t.taskName=e.name}catch{}this._abortAll(),(n=this._wakeWait)==null||n.call(this)}else this.diagnostics.push([e.name,t])}}const ee=new Set;let xe=!1;function _n(){xe||typeof globalThis.addEventListener!="function"||(xe=!0,globalThis.addEventListener("pagehide",()=>{for(const s of ee)s.emergencyClose().catch(()=>{})}))}class pn{constructor(e=null,t=null){this._transport=e,this._timing=t,this._core=null,this.tasks=new fn({onInterrupt:()=>this._interrupted()})}get core(){if(!this._core)throw new N("hub is not connected; call connect() first");return this._core}get isConnected(){return this._core!==null&&this._core.state===f.CONNECTED}ensureCore(){return this._core||(this._core=new tt(this._transport??new ot,this._timing)),this._core}async connect(){await this.ensureCore().connect(),ee.add(this),_n()}async disconnect(){await this.tasks.cancel();let e=!0;return this._core&&(e=await this._core.disconnect()),ee.delete(this),e}async shutdown(){await this.tasks.cancel();const e=this.core;try{await e.stopAll()}catch(t){e._log("warn",`could not stop motors before shutdown: ${t==null?void 0:t.message}`)}await e.shutdownHub(),ee.delete(this)}stopAll(){return this.core.stopAll()}portsRaw(){return this._core?this._core.portsRaw():new Map}refreshPorts(){return this.core.refreshPorts()}async emergencyClose(){try{await this.tasks.cancel(),this._core&&await this._core.disconnect()}catch{}}async _interrupted(){if(this.isConnected)try{await this._core.stopAll()}catch(e){this._core._log("warn",`could not stop motors after interrupt: ${e==null?void 0:e.message}`)}}}const at={A:ae,B:ce},Y={[ae]:"A",[ce]:"B"};function Ae(s){if(typeof s!="string")throw new TypeError(`port must be 'A' or 'B', not ${typeof s}`);const e=at[s.toUpperCase()];if(e===void 0)throw new RangeError(`port must be 'A' or 'B', got '${s}'`);return e}class ke{constructor({transport:e=null,timing:t=null}={}){this._session=new pn(e,t),this._led=new ze(this._session),this._button=new Tt(this._session)}static async use(e,t={}){const n=new ke(t);await n.connect();let r=!0;try{const o=await e(n);return r=!1,o}finally{try{await n.disconnect()}catch(o){if(!r)throw o}}}async connect(){return await this._session.connect(),this}get isConnected(){return this._session.isConnected}get state(){return this._session._core?this._session._core.state:"disconnected"}disconnect(){return this._session.disconnect()}shutdown(){return this._session.shutdown()}stopAll(){return this._session.stopAll()}readBattery(){return this._session.core.readBattery()}subscribe(e){return this._session.ensureCore().subscribe(e)}get ports(){const e=this._session.portsRaw(),t={};for(const[n,r]of Object.entries(at))if(e.has(r)){const o=e.get(r);t[n]=X[o]??`unknown(0x${o.toString(16).padStart(2,"0")})`}return t}async refreshPorts(){return await this._session.refreshPorts(),this.ports}_select(e,t){this._session.core.checkUsable();const n=this._session.portsRaw(),r=X[e];if(t!=null){const i=Ae(t),a=n.get(i),l=t.toUpperCase();if(a===void 0)throw new q(`nothing is connected to port ${l}`);if(a!==e)throw new Te(`port ${l} holds a ${X[a]??"unknown device"}, not a ${r}`);return i}const o=[ae,ce].filter(i=>n.get(i)===e);if(o.length===0)throw new q(`no ${r} is connected`);if(o.length>1)throw new Ve(`more than one ${r} is connected; pass the port ('A' or 'B')`);return o[0]}motor(e){const t=this._select(F,e);return new Ft(this._session,t,Y[t])}motors(e){if(typeof e=="string")throw new TypeError("ports must be an array such as ['A', 'B']");const t=[...e];if(t.length===0)throw new RangeError("ports must not be empty");const n=t.map(Ae);if(new Set(n).size!==n.length)throw new RangeError(`duplicate port in ${JSON.stringify(t)}`);return new qt(n.map(r=>this.motor(Y[r])))}distanceSensor(e){const t=this._select(M,e);return new oe(this._session,t,Y[t])}tiltSensor(e){const t=this._select(I,e);return new en(this._session,t,Y[t])}get led(){return this._led}get button(){return this._button}get tasks(){return this._session.tasks}}performance.now();const Re={motor:F,distance:M,tilt:I},_e={A:ae,B:ce},mn=[[pt,We],[mt,Ge],[gt,je],[H,Ne]],gn=Object.freeze({neutral:0,back:3,right:5,left:7,forward:9}),pe=(s,e)=>Uint8Array.of(s,1,0,e,0,0,0,16,0,0,0,16),Le=s=>{const e=new Uint8Array(4);return new DataView(e.buffer).setFloat32(0,s,!0),e};class bn extends nt{constructor(e,{externalDelay:t=.05,repeatPorts:n=null,ackDelay:r=0,silentSensors:o=!1,failConnect:i=!1}={}){super(),this.devices={...e??{A:"motor",B:"distance"}},this.externalDelay=t,this.repeatPorts=n,this.ackDelay=r,this.silentSensors=o,this.failConnect=i,this.failReads=!1,this.frozen=!1,this.dropped=!1,this.connected=!1,this.supportsDisconnectNotify=!1,this.writes=[],this.reads=[],this.motors={},this.sensorModes={},this.ledMode=null,this.button=!1,this.distance=0,this.tiltAngle=[0,0],this.tiltCode=0,this.battery=87,this._notifying=new Set,this._onNotify=null,this._onDisconnect=null,this._closed=!1,this._burstId=0}freeze(){this.frozen=!0}unfreeze(){this.frozen=!1}dropLink(e="simulated link loss"){var t;this.dropped=!0,this.connected=!1,(t=this._onDisconnect)==null||t.call(this,e)}writesTo(e){return this.writes.filter(([t])=>t===e).map(([,t])=>t)}press(){this.button=!0,this._notify(O,Uint8Array.of(1))}release(){this.button=!1,this._notify(O,Uint8Array.of(0))}setDistance(e){this.distance=e,this._pushValues(M)}setTiltAngle(e,t){this.tiltAngle=[Math.trunc(e),Math.trunc(t)],this._pushValues(I,be)}setTiltDirection(e){this.tiltCode=typeof e=="string"?gn[e]:Number(e),this._pushValues(I,Ke)}attach(e,t){this.devices[e]=t,this._notify(S,pe(_e[e],Re[t]))}detach(e){delete this.devices[e],this._notify(S,Uint8Array.of(_e[e],0))}setCallbacks(e,t){this._onNotify=e,this._onDisconnect=t}async connect(e){if(this.failConnect)throw new B("no WeDo 2.0 hub found");this.dropped=!1,this.connected=!0,this._closed=!1}async disconnect(){this.connected=!1,this._notifying.clear(),this._closed=!0,this._burstId+=1}hasCharacteristic(e){return e===ne||[W,S,j,P,L,O,Me].includes(e)}async _gate(e){if(this.dropped||!this.connected)throw new A("simulated link is down");if(this.frozen)throw await V(e),new $("no ACK from the simulated hub");if(this.ackDelay&&(await V(this.ackDelay),this.dropped))throw new A("simulated link is down")}async read(e,t){if(await this._gate(t),this.failReads)throw new R("simulated read failure");if(this.reads.push(e),e===W)return Uint8Array.of(this.battery);if(e===O)return Uint8Array.of(this.button?1:0);throw new R(`characteristic not readable: ${e}`)}async write(e,t,n){if(await this._gate(n),t=Uint8Array.from(t),this.writes.push([e,t]),e===L)t.length===4&&t[1]===1&&t[2]===1&&(this.motors[t[0]]=t[3]<<24>>24);else if(e===P)if(t.length>=5&&t[0]===1&&t[1]===2){const[r,o,i]=[t[2],t[3],t[4]];this.sensorModes[r]=[o,i],r===H&&(this.ledMode=i)}else t.length===3&&t[0]===0&&t[1]===1&&this._pushConn(t[2])}async subscribe(e,t){if(await this._gate(t),e===ne&&!this.supportsDisconnectNotify)throw new R("notifications not supported on this characteristic");this._notifying.add(e),e===S&&this._portBurst(++this._burstId)}async unsubscribe(e,t){await this._gate(t),this._notifying.delete(e)}_notify(e,t){this._onNotify&&this._notifying.has(e)&&this._onNotify(e,Uint8Array.from(t))}async _portBurst(e){const t=()=>e===this._burstId&&!this._closed;for(const[r,o]of mn)this._notify(S,pe(r,o));if(await V(this.externalDelay),!t())return;const n=Object.keys(this.devices).sort().map(r=>pe(_e[r],Re[this.devices[r]]));for(const r of n)this._notify(S,r);for(;this.repeatPorts&&this._notifying.has(S);){if(await V(this.repeatPorts),!t())return;for(const r of n)this._notify(S,r)}}_valueBytes(e){const[t,n]=this.sensorModes[e]??[null,null];return t===M?Le(this.distance):t===I?n===be?Uint8Array.of(this.tiltAngle[0]&255,this.tiltAngle[1]&255):Le(this.tiltCode):null}_pushConn(e){if(this.silentSensors)return;const t=this._valueBytes(e);t&&this._notify(j,Uint8Array.of(1,e,...t))}_pushValues(e,t=null){for(const[n,[r,o]]of Object.entries(this.sensorModes))r===e&&(t===null||o===t)&&this._pushConn(Number(n))}}const wn=new Set([f.ERROR]);class yn extends Xe{constructor(){super(),this.hub=null,this.sim=null,this.kind="web-bluetooth",this.state=f.DISCONNECTED,this.activeMotors=new Map,this._unsub=null,this.simDevices={A:"motor",B:"distance"},this.simDistance=10}get supportsBluetooth(){return st()}get connected(){return this.state===f.CONNECTED}get unsafe(){return wn.has(this.state)}_log(e,t){this.emit("log",{level:e,message:t})}async connect(e,{acceptAll:t=!1}={}){var i;this.hub&&this.state!==f.DISCONNECTED&&await this.disconnect(),this.kind=e;let n,r=null;e==="simulated"?(this.sim=new bn(this.simDevices,{externalDelay:.05}),this.sim.distance=this.simDistance??10,n=this.sim,r=Ee({settleQuiet:.3})):(this.sim=null,n=new ot({acceptAll:t}));const o=new ke({transport:n,timing:r});this.hub=o,this.activeMotors.clear(),(i=this._unsub)==null||i.call(this),this._unsub=o.subscribe((a,l)=>this._onCore(a,l)),this._log("info",`Conectando (${e==="simulated"?"simulador":"Web Bluetooth"})…`);try{await o.connect()}catch(a){throw this._log("error",`No se pudo conectar: ${a.message}`),this._setState(o.state),a}this._log("info","Conectado."),this.emit("hubname",{name:n.deviceName??(e==="simulated"?"Hub simulado":"WeDo 2.0 Smart Hub")}),this.emit("ports",{ports:o.ports}),await this.refreshBattery()}async disconnect(){const e=this.hub;if(e){try{const t=await e.disconnect();this._log(t?"info":"warn",t?"Desconectado.":"Desconectado, pero la parada de motores no pudo confirmarse.")}catch(t){this._log("error",`Error al desconectar: ${t.message}`)}this.activeMotors.clear(),this._setState(e.state),this.emit("ports",{ports:{}})}}async refreshBattery(){if(this.connected)try{this.emit("battery",{percent:await this.hub.readBattery()})}catch(e){this._log("warn",`Batería: ${e.message}`)}}async run(e,t){try{const n=await t(this.hub);return this._log("op",e),n}catch(n){this._log("error",`${e}: ${n.message}`);return}}async emergencyStop(){if(this.hub){this._log("warn","Parada de emergencia solicitada.");try{await this.hub.tasks.cancel()}catch{}try{await this.hub.stopAll()}catch(e){this._log("error",`Parada: ${e.message}`)}}}async onHidden(){this.connected&&[...this.activeMotors.values()].some(e=>e!==0)&&(this._log("warn","La pestaña se ocultó con motores en marcha: se envía parada (los temporizadores del navegador pueden retrasarse)."),await this.emergencyStop())}_setState(e){e!==this.state&&(this.state=e,this.emit("state",{state:e,unsafe:this.unsafe}))}_onCore(e,t){switch(e){case"state":this._setState(t.state),this._log(t.state===f.ERROR?"error":"info",`Estado: ${t.state}${t.error?` (${t.error})`:""}`);break;case"ports":this.emit("ports",{ports:this.hub.ports});break;case"motor":this.activeMotors.set(t.conn,t.speed),this.emit("motor",t);break;case"button":this.emit("button",t);break;case"log":t.level!=="debug"&&this._log(t.level,t.message);break}}}const h=(s,e=document)=>e.querySelector(s);function y(s,e={},...t){const n=document.createElement(s);for(const[r,o]of Object.entries(e))r.startsWith("on")&&typeof o=="function"?n.addEventListener(r.slice(2).toLowerCase(),o):o===!0?n.setAttribute(r,""):o!==!1&&o!=null&&n.setAttribute(r,o);for(const r of t.flat())n.append(r instanceof Node?r:document.createTextNode(String(r)));return n}function te(s,e){for(const t of s)t.disabled=!e}function En(s){const e={transport:h("#transport"),connect:h("#btn-connect"),disconnect:h("#btn-disconnect"),state:h("#state"),name:h("#hub-name"),battery:h("#battery"),estop:h("#btn-estop"),compat:h("#compat"),unsafe:h("#unsafe")},t=h("#btn-hub"),n=h("#hub-drawer"),r=h("#hub-close"),o=u=>{n.hidden=!u,t.setAttribute("aria-expanded",String(u))};o(!1),t.addEventListener("click",()=>o(n.hidden)),r.addEventListener("click",()=>o(!1)),document.addEventListener("keydown",u=>{u.key==="Escape"&&!n.hidden&&o(!1)});const i=document.querySelector(".wb-top");if(i&&typeof ResizeObserver=="function"){const u=()=>n.style.setProperty("--wb-top-h",`${i.offsetHeight}px`);u(),new ResizeObserver(u).observe(i)}const a=rt();a&&(e.compat.hidden=!1,e.compat.textContent=`${a} Puedes probar la aplicación con el simulador.`,e.transport.querySelector('option[value="web-bluetooth"]').disabled=!0,e.transport.value="simulated");const l=u=>te([e.connect,e.transport],!u);e.connect.addEventListener("click",async()=>{l(!0),o(!0),e.connect.textContent="Conectando…";try{await s.connect(e.transport.value,{acceptAll:h("#accept-all").checked})}catch{}finally{e.connect.textContent=s.unsafe?"Reconectar":"Conectar",l(!1),p()}}),e.disconnect.addEventListener("click",()=>s.disconnect()),e.estop.addEventListener("click",()=>s.emergencyStop());function p(){const{state:u}=s;e.state.textContent=u,e.state.className=`badge st-${u}`;const g=s.connected;e.disconnect.disabled=!(g||s.unsafe),e.estop.disabled=!g,e.transport.disabled=g,e.connect.disabled=g||u==="connecting",e.connect.textContent=s.unsafe?"Reconectar":"Conectar",e.unsafe.hidden=!s.unsafe,s.unsafe&&(e.unsafe.textContent="Estado inseguro: se perdió el enlace con el hub o el watchdog detectó que no respondía. Los controles están deshabilitados. Comprueba que los motores estén parados y reconecta."),document.querySelector("#card-sim").hidden=s.kind!=="simulated",g||(e.battery.textContent="—",s.unsafe||(e.name.textContent="—"))}s.subscribe((u,g)=>{if(u==="state"&&p(),u==="battery"&&(e.battery.textContent=`${g.percent} %`),u==="hubname"&&(e.name.textContent=g.name),u==="ports")for(const _ of["A","B"])h(`#port-${_}`).textContent=g.ports[_]??"—"}),p(),setInterval(()=>s.refreshBattery(),3e4)}const vn=300;function Nn(s=h("#console")){function e(t,n){const r=new Date().toLocaleTimeString(),o=y("li",{class:`lvl-${t}`},y("time",{},r)," ",n);for(s.append(o);s.children.length>vn;)s.firstChild.remove();s.scrollTop=s.scrollHeight}return h("#console-clear").addEventListener("click",()=>{s.replaceChildren()}),{log:e}}const Tn=[["Apagado",0,"#1a1a1a"],["Rosa",1,"#ff6ec7"],["Morado",2,"#8a2be2"],["Azul",3,"#1e5cff"],["Azul claro",4,"#00d5e0"],["Verde claro",5,"#00b894"],["Verde",6,"#18c24a"],["Amarillo",7,"#ffd400"],["Naranja",8,"#ff8a00"],["Rojo",9,"#e5251b"],["Blanco",10,"#ffffff"]],kn=s=>[1,3,5].map(e=>parseInt(s.slice(e,e+2),16));function Cn(s){const e=h("#motors"),t={};for(const c of["A","B"]){const d=y("input",{type:"range",min:-100,max:100,step:1,value:0,"aria-label":`Velocidad motor ${c}`}),w=y("output",{},"0"),E=y("button",{class:"primary"},"Girar"),C=y("button",{},"Parar"),G=y("button",{title:"Invertir dirección"},"⇄");d.addEventListener("input",()=>{w.textContent=d.value}),E.addEventListener("click",()=>s.run(`Motor ${c}: ${d.value}`,he=>he.motor(c).run(Number(d.value)))),C.addEventListener("click",()=>{d.value=0,w.textContent="0",s.run(`Motor ${c}: parar`,he=>he.motor(c).stop())}),G.addEventListener("click",()=>{d.value=-d.value,w.textContent=d.value}),e.append(y("div",{class:"motor","data-port":c},y("div",{class:"motor-head"},y("strong",{},`Motor ${c}`),y("span",{class:"dev",id:`dev-${c}`},"")),d,w,G,E,C)),t[c]={slider:d,run:E,stop:C,rev:G}}const n=y("button",{class:"primary"},"Grupo A+B: girar"),r=y("button",{},"Grupo A+B: parar");n.addEventListener("click",()=>{const c=Number(t.A.slider.value);s.run(`MotorGroup(A, B): ${c}`,d=>d.motors(["A","B"]).run(c))}),r.addEventListener("click",()=>s.run("MotorGroup(A, B): parar",c=>c.motors(["A","B"]).stop())),e.append(y("div",{class:"row"},n,r));const o=h("#led-presets");for(const[c,d,w]of Tn)o.append(y("button",{class:"swatch",style:`background:${w}`,title:`${c} (índice ${d})`,"aria-label":`${c}, índice ${d}`,onclick:()=>{h("#led-state").textContent=`índice ${d} (${c})`,s.run(`LED: ${c}`,E=>E.led.index(d))}}));h("#led-rgb").addEventListener("change",c=>{const[d,w,E]=kn(c.target.value);h("#led-state").textContent=`RGB ${d},${w},${E}`,s.run(`LED: rgb(${d}, ${w}, ${E})`,C=>C.led.rgb(d,w,E))}),h("#led-off").addEventListener("click",()=>{h("#led-state").textContent="apagado",s.run("LED: apagar",c=>c.led.off())});const i=()=>[...Object.values(t).flatMap(c=>[c.slider,c.run,c.stop,c.rev]),n,r,h("#led-rgb"),h("#led-off"),...o.querySelectorAll("button")];function a(c=(d=>(d=s.hub)==null?void 0:d.ports)()??{}){const w=s.connected;te(i(),w);for(const C of["A","B"]){const G=c[C]==="motor";te(Object.values(t[C]),w&&G),h(`#dev-${C}`).textContent=c[C]?`(${c[C]})`:"(sin dispositivo)"}const E=["A","B"].filter(C=>c[C]==="motor").length;te([n,r],w&&E===2)}s.subscribe((c,d)=>{if(c==="state"&&a(),c==="ports"&&a(d.ports),c==="motor"){const w=d.conn===1?"A":d.conn===2?"B":null;w&&d.speed===0&&Number(t[w].slider.value)}}),a();const l=h("#dist"),p=h("#dist-meter"),u=h("#tilt"),g=h("#button"),_=c=>{g.textContent=c?"pulsado":"suelto",g.className=`badge ${c?"st-connected":""}`};s.subscribe((c,d)=>{if(c==="button"&&_(d.pressed),c==="state"&&!s.connected&&(l.textContent=u.textContent=g.textContent="—",p.value=0),c==="ports"&&s.connected)try{_(s.hub.button.isPressed)}catch{}});let m=!1;setInterval(async()=>{var c;if(!(m||!s.connected||(c=s.python)!=null&&c.running)){m=!0;try{const d=s.hub.ports;for(const w of["A","B"])try{if(d[w]==="distance"){const E=await s.hub.distanceSensor(w).read();l.textContent=E,p.value=E}else d[w]==="tilt"&&(u.textContent=await s.hub.tiltSensor(w).readDirection())}catch(E){E.name==="OperationTimeout"?(d[w]==="distance"?l:u).textContent="esperando cambio…":s.connected&&s._log("warn",`Sensor ${w}: ${E.message}`)}}finally{m=!1}}},300)}const Sn="modulepreload",xn=function(s,e){return new URL(s,e).href},Oe={},An=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){const i=document.getElementsByTagName("link"),a=document.querySelector("meta[property=csp-nonce]"),l=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(t.map(p=>{if(p=xn(p,n),p in Oe)return;Oe[p]=!0;const u=p.endsWith(".css"),g=u?'[rel="stylesheet"]':"";if(!!n)for(let c=i.length-1;c>=0;c--){const d=i[c];if(d.href===p&&(!u||d.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${p}"]${g}`))return;const m=document.createElement("link");if(m.rel=u?"stylesheet":Sn,u||(m.as="script"),m.crossOrigin="",m.href=p,l&&m.setAttribute("nonce",l),document.head.appendChild(m),u)return new Promise((c,d)=>{m.addEventListener("load",c),m.addEventListener("error",()=>d(new Error(`Unable to preload CSS for ${p}`)))})}))}function o(i){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=i,window.dispatchEvent(a),!a.defaultPrevented)throw i}return r.then(i=>{for(const a of i||[])a.status==="rejected"&&o(a.reason);return e().catch(o)})},Rn=`"""wedopy: control the LEGO WeDo 2.0 Smart Hub from Python.

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
    OFF, BLACK, PINK, ROSE, PURPLE, VIOLET, BLUE, CYAN, LIGHT_BLUE, SKY_BLUE,
    LIGHT_GREEN, TEAL, GREEN, DARK_GREEN, YELLOW, ORANGE, RED, WHITE, BRIGHT_WHITE,
)
from .motor import Motor, MotorGroup
from .sensors import DistanceSensor, TiltSensor
from .time import running_time

__version__ = "0.1.2"

__all__ = [
    "Hub", "Motor", "MotorGroup", "DistanceSensor", "TiltSensor", "LED", "Button",
    "task", "running_time",
    "OFF", "BLACK", "PINK", "ROSE", "PURPLE", "VIOLET", "BLUE", "CYAN", "LIGHT_BLUE", "SKY_BLUE",
    "LIGHT_GREEN", "TEAL", "GREEN", "DARK_GREEN", "YELLOW", "ORANGE", "RED", "WHITE", "BRIGHT_WHITE",
    "WedoError", "BLEError", "HubConnectionError", "HubDisconnectedError", "OperationTimeout",
    "HubBusyError", "DeviceNotFoundError", "DeviceTypeError", "AmbiguousDeviceError",
    "InvalidStateError", "UnsupportedFeatureError",
]
`,Ln=`"""Synchronous bridge between the wedopy Python API and the wedopy Web JavaScript API.

Works with Pyodide + JSPI (Chrome >= 137): \`\`run_sync\`\` blocks the Python program until the
JavaScript promise settles, without freezing the page. So programs written for the Python
library (\`\`hub.motor("A").run(100)\`\`, \`\`yield task.sleep(1)\`\`) work unchanged.

The editor's Stop button raises a flag: the next call to the hub or to \`\`sleep\`\` raises
\`\`KeyboardInterrupt\`\` (just like Ctrl+C in the original library).
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
    """JsException -> equivalent Python exception (same hierarchy as the library)."""
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
    """Synchronous JavaScript call (may raise)."""
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
    """Blocks until a JavaScript promise settles; returns its value.

    Stop rejects nothing: if the promise woke up early because the user pressed Stop, the
    flag is still raised and check_stop() turns it into a KeyboardInterrupt here, in plain
    Python (without crossing the JSPI boundary: raising exceptions through run_sync leaves
    orphaned continuations in Pyodide).
    """
    check_stop()
    try:
        result = run_sync(awaitable)
    except JsException as exc:
        raise convert(exc) from None
    check_stop()
    return result


def sleep(seconds):
    """Cooperative replacement for \`\`time.sleep\`\`: yields control to the page and supports Stop."""
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
`,On=`"""Built-in button (same API as wedopy.button)."""
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
`,In=`"""Public exceptions (identical to wedopy_core/exceptions.py in the Python library)."""


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
`,Dn=`"""\`\`Hub\`\` (same API as wedopy.hub) over the hub connected in the wedopy Web panel.

Differences with the desktop Python library:

* \`\`Hub()\`\` uses the hub already connected in the panel (real or simulated); the browser's
  Bluetooth picker needs a user click and cannot be opened from a program.
* \`\`disconnect()\`\` / leaving \`\`with Hub()\`\` cancel the tasks and stop the motors, but keep
  the link open so another program can run without picking the device again.
* \`\`time.sleep\`\` is cooperative: it yields control to the page and supports the Stop button.
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
        """Use the hub from the panel. Returns \`\`self\`\`."""
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
        """Stop / Ctrl+C during \`\`tasks.wait()\`\`: tries to stop the motors."""
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
`,Bn=`"""Built-in LED (same API and constants as wedopy.led; calls the JavaScript API)."""
from . import _bridge

# Colour index constants (discrete mode 0..10).
# Indexed colours of the Smart Hub LED, as the firmware really maps them (checked on
# hardware): 0 off, 1 pink, 2 purple, 3 blue, 4 cyan/light blue, 5 light green, 6 green,
# 7 yellow, 8 orange, 9 red, 10 white.
# Note that index 5 is the light green and 6 the pure green, so from 5 on everything is
# shifted by one compared with the table in LEGO's documentation (which omits the light
# green and adds a grey the firmware does not have).
OFF = 0
BLACK = 0
PINK = 1
ROSE = 1
PURPLE = 2
VIOLET = 2
BLUE = 3
CYAN = 4
LIGHT_BLUE = 4
SKY_BLUE = 4
LIGHT_GREEN = 5
TEAL = 5
GREEN = 6
DARK_GREEN = 6
YELLOW = 7
ORANGE = 8
RED = 9
WHITE = 10
BRIGHT_WHITE = 10

__all__ = [
    "LED",
    "OFF",
    "BLACK",
    "PINK",
    "ROSE",
    "PURPLE",
    "VIOLET",
    "BLUE",
    "CYAN",
    "LIGHT_BLUE",
    "SKY_BLUE",
    "LIGHT_GREEN",
    "TEAL",
    "GREEN",
    "DARK_GREEN",
    "YELLOW",
    "ORANGE",
    "RED",
    "WHITE",
    "BRIGHT_WHITE",
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
    ROSE = ROSE
    PURPLE = PURPLE
    VIOLET = VIOLET
    BLUE = BLUE
    CYAN = CYAN
    LIGHT_BLUE = LIGHT_BLUE
    SKY_BLUE = SKY_BLUE
    LIGHT_GREEN = LIGHT_GREEN
    TEAL = TEAL
    GREEN = GREEN
    DARK_GREEN = DARK_GREEN
    YELLOW = YELLOW
    ORANGE = ORANGE
    RED = RED
    WHITE = WHITE
    BRIGHT_WHITE = BRIGHT_WHITE

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
`,Pn=`"""Motors (same API as wedopy.motor)."""
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
`,$n=`"""Distance and tilt sensors (same API as wedopy.sensors)."""
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
`,Un=`"""Scheduling instructions for cooperative tasks (spec 5.7).

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
`,Hn=`"""Cooperative task scheduler behind \`\`hub.tasks\`\` (spec 5.7).

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
`,Mn=`"""Small educational time helper. Use the standard \`\`time\`\` module for everything else."""
import time as _time

_START = _time.monotonic()


def running_time():
    """Milliseconds since \`\`wedopy\`\` was imported (the program's start, in practice)."""
    return int((_time.monotonic() - _START) * 1000)
`,Gn=Object.assign({"./wedopy/__init__.py":Rn,"./wedopy/_bridge.py":Ln,"./wedopy/button.py":On,"./wedopy/exceptions.py":In,"./wedopy/hub.py":Dn,"./wedopy/led.py":Bn,"./wedopy/motor.py":Pn,"./wedopy/sensors.py":$n,"./wedopy/task.py":Un,"./wedopy/tasks.py":Hn,"./wedopy/time.py":Mn}),Wn=`
import time
from wedopy import _bridge
time.sleep = _bridge.sleep   # sleep cooperativo: cede a la página y admite «Detener»
`;class jn{constructor({getHub:e,onOutput:t=()=>{},loader:n,indexURL:r}){this._getHub=e,this._out=t,this._loader=n,this._indexURL=r,this.py=null,this._loading=null,this._stop=!1,this._running=!1,this._sleepers=new Set,this._current=null}get running(){return this._running}get ready(){return this.py!==null}init(e=()=>{}){return this._loading??(this._loading=this._init(e).catch(t=>{throw this._loading=null,t})),this._loading}async _init(e){e("Cargando Python (solo la primera vez)…");const{loadPyodide:t}=await this._loader(),n=await t(this._indexURL?{indexURL:this._indexURL}:{});if(!await n.runPythonAsync(`from pyodide.ffi import can_run_sync
can_run_sync()`))throw new se("Este navegador no admite JSPI (WebAssembly JavaScript Promise Integration), necesario para ejecutar programas Python síncronos. Usa Chrome o Edge 137 o posterior.");n.setStdout({batched:o=>this._out("stdout",o)}),n.setStderr({batched:o=>this._out("stderr",o)}),n.FS.mkdirTree("/home/pyodide/wedopy");for(const[o,i]of Object.entries(Gn))n.FS.writeFile(`/home/pyodide/wedopy/${o.split("/").pop()}`,i);return globalThis.wedopyBridge={getHub:()=>this._getHub()??void 0,stopRequested:()=>{const o=this._stop;return this._stop=!1,o},sleep:o=>new Promise(i=>{const a=()=>{clearTimeout(l),this._sleepers.delete(a),i()},l=setTimeout(a,o*1e3);this._sleepers.add(a),this._stop&&a()})},await n.runPythonAsync(`import asyncio
asyncio.get_event_loop()._keyboard_interrupt_handler = lambda: None`),await n.runPythonAsync(Wn),this.py=n,e("Python listo."),n}async run(e){if(this._running){this.stop();try{await this._current}catch{}this._stop=!1}if(await this.init(),this._running){this.stop();try{await this._current}catch{}this._stop=!1}return this._running=!0,this._stop=!1,this._current=this._execute(e),this._current}async _execute(e){const t=this.py.globals.get("dict")();try{return await this.py.runPythonAsync(e,{globals:t}),{ok:!0,stopped:!1,error:null}}catch(n){if((n==null?void 0:n.type)==="KeyboardInterrupt")return{ok:!1,stopped:!0,error:null};const r=(n==null?void 0:n.message)??String(n);return this._out("stderr",r.endsWith(`
`)?r:`${r}
`),{ok:!1,stopped:!1,error:r}}finally{this._running=!1,t.destroy();const n=this._getHub();if(n!=null&&n.isConnected)try{await n.stopAll()}catch{}}}stop(){if(this._running){this._stop=!0;for(const e of[...this._sleepers])e()}}}function Fn(s="./"){const e=`${new URL(`${s}pyodide/`,globalThis.location.href).href}`;return{indexURL:e,loader:()=>An(()=>import(`${e}pyodide.mjs`),[],import.meta.url)}}const z=s=>s.replace(/[&<>]/g,e=>e==="&"?"&amp;":e==="<"?"&lt;":"&gt;"),qn=new Set(["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield","match","case"]),Kn=new Set(["True","False","None","self","cls"]),Vn=new Set(["print","len","range","input","open","str","int","float","bool","bytes","list","dict","set","tuple","frozenset","abs","min","max","round","sum","sorted","reversed","enumerate","zip","map","filter","any","all","isinstance","issubclass","type","object","super","dir","repr","hash","hex","oct","bin","ord","chr","divmod","pow","format","id","getattr","setattr","hasattr","callable","iter","next","Exception","KeyboardInterrupt","ValueError","TypeError","RuntimeError","IndexError","KeyError","AttributeError","OSError","StopIteration","ZeroDivisionError","TimeoutError"]),me=/(?<cmt>#.*)|(?<str>"""[\s\S]*?"""|'''[\s\S]*?'''|(?:[fFrRbBuU]{0,2})"(?:\\[\s\S]|[^"\\\n])*"|(?:[fFrRbBuU]{0,2})'(?:\\[\s\S]|[^'\\\n])*')|(?<dec>@[\w.]+)|(?<num>\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?|\.\d+(?:[eE][+-]?\d+)?)\b)|(?<id>[^\W\d]\w*)|(?<ws>[ \t]+)|(?<any>[\s\S])/g;function Yn(s){me.lastIndex=0;let e="",t=0,n;for(;n=me.exec(s);){n.index>t&&(e+=z(s.slice(t,n.index))),t=n.index+n[0].length;const r=n.groups;let o=null,i=n[0];if(r.cmt)o="cmt";else if(r.str)o="str";else if(r.dec)o="dec";else if(r.num)o="num";else if(r.id){const a=r.id;if(i=a,qn.has(a))o="kw";else if(Kn.has(a))o="kw2";else if(Vn.has(a))o="builtin";else{let l=Math.min(s.length,n.index+a.length);for(;l<s.length&&(s[l]===" "||s[l]==="	");)l+=1;s[l]==="("&&(o="fn")}}e+=o?`<span class="${o}">${z(i)}</span>`:z(i),n[0].length===0&&(me.lastIndex+=1)}return t<s.length&&(e+=z(s.slice(t))),e}function zn({host:s,onChange:e=()=>{}}){const t=y("div",{class:"py-gutter","aria-hidden":"true"}),n=y("div",{class:"py-surface"}),r=y("pre",{class:"py-hl","aria-hidden":"true"}),o=y("textarea",{id:"py-code",class:"py-input",wrap:"off",spellcheck:"false",autocapitalize:"off",autocorrect:"off","aria-label":"Código Python"});n.append(r,o),s.classList.add("py-editor"),s.append(t,n);function i(){const l=o.value;r.innerHTML=Yn(l)+(l.endsWith(`
`)?"":`
`);const p=l.split(`
`).length;let u="";for(let g=1;g<=p;g+=1)u+=`<span>${g}</span>`;t.innerHTML=u,t.scrollTop=o.scrollTop}function a(){r.scrollTop=o.scrollTop,r.scrollLeft=o.scrollLeft,t.scrollTop=o.scrollTop}return o.addEventListener("input",()=>{i(),e(o.value)}),o.addEventListener("scroll",a),o.addEventListener("keydown",l=>{if(l.key!=="Tab")return;l.preventDefault();const{selectionStart:p,selectionEnd:u}=o;o.setRangeText("    ",p,u,"end"),o.dispatchEvent(new Event("input"))}),i(),{textarea:o,setValue(l){o.value=l,i()},getValue(){return o.value},focus(){o.focus()}}}function Jn(s,e="mi_programa.py"){const t=new Blob([s],{type:"text/x-python;charset=utf-8"}),n=URL.createObjectURL(t),r=Object.assign(document.createElement("a"),{href:n,download:e});document.body.append(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function Qn(s,e=t=>{throw t}){const t=Object.assign(document.createElement("input"),{type:"file",accept:".py,text/x-python"});t.addEventListener("change",async()=>{var r;const n=(r=t.files)==null?void 0:r[0];if(n)try{s(await n.text(),n.name)}catch(o){e(o)}}),t.click()}const Ie="wedopy.python.program",De="mi_programa.py",Xn=`"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
from wedopy import Hub, task

with Hub() as hub:
    def blink():
        while True:
            hub.led.index(7)
            yield task.sleep(0.3)
            hub.led.index(10)
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
`;function Zn(s,{runtime:e}={}){const t=h("#py-out"),n=h("#py-status"),r=h("#py-run"),o=h("#py-stop"),i=_=>{try{localStorage.setItem(Ie,_)}catch{}},a=zn({host:h("#py-editor"),onChange:_=>i(_)}),l=(_,m)=>{t.append(y("span",{class:_==="stderr"?"err":""},m.endsWith(`
`)?m:`${m}
`)),t.scrollTop=t.scrollHeight},p=e??new jn({getHub:()=>s.hub,onOutput:l,...Fn()});s.python=p;let u="";try{u=localStorage.getItem(Ie)??""}catch{}a.setValue(u||Xn),h("#py-export").addEventListener("click",()=>{Jn(a.getValue(),De),n.textContent=`Programa exportado como ${De}`}),h("#py-import").addEventListener("click",()=>{Qn((_,m)=>{a.setValue(_),i(_),n.textContent=`Importado «${m}» — listo para ejecutar.`},_=>{n.textContent="",l("stderr",`Importación: ${_.message}
`)})});let g=0;r.addEventListener("click",()=>{const _=++g,m=p.running;t.replaceChildren(),o.disabled=!1,m&&l("stderr",`⏹ se interrumpe el programa anterior…
`),n.textContent=m?"Interrumpiendo el programa anterior…":"Ejecutando…",p.run(a.getValue()).then(c=>{_===g&&(n.textContent=c.stopped?"Detenido.":c.ok?"Terminado.":"Terminó con error.",o.disabled=!0,c.stopped&&l("stdout","[programa detenido]"))}).catch(c=>{_===g&&(n.textContent="",l("stderr",c.message),o.disabled=!0)})}),o.addEventListener("click",()=>{var _,m,c;p.stop(),(c=(m=(_=s.hub)==null?void 0:_.tasks)==null?void 0:m.cancel)==null||c.call(m)}),document.addEventListener("keydown",_=>{_.key!=="Enter"||!(_.ctrlKey||_.metaKey)||(_.preventDefault(),r.click())})}function es(s){const e=()=>s.sim;for(const o of["A","B"]){const i=h(`#sim-${o}`);i.value=s.simDevices[o]??"",i.addEventListener("change",()=>{const a=i.value;a?s.simDevices[o]=a:delete s.simDevices[o],!(!e()||!s.connected)&&(a?e().attach(o,a):e().detach(o),s._log("info",`Simulador: puerto ${o} → ${a||"vacío"}`))})}h("#sim-dist").addEventListener("input",o=>{var i;s.simDistance=Number(o.target.value),(i=e())==null||i.setDistance(s.simDistance)}),h("#sim-tilt").addEventListener("change",o=>{var i;return(i=e())==null?void 0:i.setTiltDirection(o.target.value)});const t=h("#sim-press"),n=()=>{var o;return(o=e())==null?void 0:o.press()},r=()=>{var o;return(o=e())==null?void 0:o.release()};t.addEventListener("pointerdown",n),t.addEventListener("pointerup",r),t.addEventListener("pointerleave",r),h("#sim-drop").addEventListener("click",()=>{var o;s._log("warn","Simulador: pérdida de enlace inyectada."),(o=e())==null||o.dropLink()}),h("#sim-freeze").addEventListener("change",o=>{var i,a;o.target.checked?(i=e())==null||i.freeze():(a=e())==null||a.unfreeze(),s._log("warn",`Simulador: hub ${o.target.checked?"sin responder (sin ACK)":"responde de nuevo"}.`)})}const Be="wedopy.theme",J=["auto","light","dark"],ts={auto:"🌗",light:"☀️",dark:"🌙"},Pe={auto:"Tema del sistema (auto)",light:"Tema claro",dark:"Tema oscuro (Dracula)"},ge={light:"#f4f5fa",dark:"#282a36"};function ns(s){let e;try{e=localStorage.getItem(Be)}catch{}J.includes(e)||(e="auto");const t=()=>{e==="auto"?document.documentElement.removeAttribute("data-theme"):document.documentElement.setAttribute("data-theme",e),s.textContent=ts[e],s.setAttribute("aria-label",Pe[e]),s.title=Pe[e];for(const n of document.querySelectorAll('meta[name="theme-color"]'))n.content=e==="auto"?n.media.includes("light")?ge.light:ge.dark:ge[e==="light"?"light":"dark"]};s.addEventListener("click",()=>{e=J[(J.indexOf(e)+1)%J.length];try{localStorage.setItem(Be,e)}catch{}t()}),t()}const D=new yn,le=Nn();D.subscribe((s,e)=>{s==="log"&&le.log(e.level,e.message)});En(D);Cn(D);es(D);Zn(D);ns(h("#btn-theme"));document.addEventListener("visibilitychange",()=>{document.hidden&&D.onHidden()});le.log("info",D.supportsBluetooth?"Web Bluetooth disponible. Pulsa «Conectar» y elige tu Smart Hub.":"Web Bluetooth no disponible en este navegador: usa el simulador.");le.log("debug",`Diagnóstico: isSecureContext=${window.isSecureContext}, navigator.bluetooth=${!!navigator.bluetooth}, origen=${location.origin}`);var Q,$e;($e=(Q=navigator.bluetooth)==null?void 0:Q.getAvailability)==null||$e.call(Q).then(s=>le.log(s?"info":"warn",s?"Adaptador Bluetooth disponible.":"El navegador no ve ningún adaptador Bluetooth (¿servicio bluetooth apagado?).")).catch(()=>{});window.wedopyApp=D;
