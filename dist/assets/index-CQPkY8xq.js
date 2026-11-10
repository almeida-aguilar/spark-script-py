var bt=Object.defineProperty;var wt=(s,e,t)=>e in s?bt(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var C=(s,e,t)=>wt(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const yt="-1212-efde-1523-785feabcd123",Et="-0000-1000-8000-00805f9b34fb",Je=s=>s.toString(16).padStart(4,"0"),T=s=>`0000${Je(s)}${yt}`,he=s=>`0000${Je(s)}${Et}`;he(6144);const vt=he(6154),Ct=he(6159),Ye=T(5411),Nt=T(20238),V=he(10777);T(5412);const I=T(5414),x=T(5415);T(5416);T(5417);T(5418);const Qe=T(5419),oe=T(5422),K=T(5472);T(5473);const M=T(5475),O=T(5477),fe=1,Xe=2,kt=3,Tt=4,xt=5,W=6,H=1,Ze=20,et=21,tt=22,xe=23,L=34,j=35,St=36,nt=0,st=2,At=0,Dt=1,ie=0,rt=1,Lt=0,ae=Object.freeze({[H]:"motor",[Ze]:"voltage",[et]:"current",[tt]:"piezo",[xe]:"rgb-led",[L]:"tilt",[j]:"distance",[St]:"generic"}),Rt=Object.freeze([V,x,K,M,O]),Ot=Object.freeze(["LPF2 Smart Hub 2 I/O"]);class N extends Error{constructor(e,t){super(e,t),this.name=new.target.errorName}}C(N,"errorName","WedoError");class R extends N{}C(R,"errorName","BLEError");class B extends N{}C(B,"errorName","HubConnectionError");class D extends B{}C(D,"errorName","HubDisconnectedError");class F extends N{}C(F,"errorName","OperationTimeout");class Z extends N{}C(Z,"errorName","HubBusyError");class ce extends N{}C(ce,"errorName","DeviceNotFoundError");class Se extends N{}C(Se,"errorName","DeviceTypeError");class k extends N{}C(k,"errorName","InvalidStateError");class le extends N{}C(le,"errorName","UnsupportedFeatureError");class Ae extends N{}C(Ae,"errorName","NotConnectedError");class ot extends N{}C(ot,"errorName","ConnectionFailedError");class ue extends N{}C(ue,"errorName","PortError");class it extends N{}C(it,"errorName","NoReadingError");class U extends Error{constructor(e="task cancelled"){super(e),this.name=new.target.errorName}}C(U,"errorName","TaskCancelled");class It{constructor(e){this._session=e}read(){return this._session.requireUsable(),this._session.core.buttonPressed()}hasChange(e=null){this._session.requireUsable();const t=this._session.changes("button").button;return t.consume(t.checkFilter(e,"button"))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes("button").button;return t.wait(t.checkFilter(e,"button"))}toString(){return"Button()"}}const at=Object.freeze({off:0,pink:1,purple:2,blue:3,light_blue:4,light_green:5,dark_green:6,yellow:7,orange:8,red:9,white:10}),Pt=Object.keys(at).join(", ");function me(s,e,t=null){const n=`led${t?` (puerto "${t}")`:""}`;if(typeof e!="number"||!Number.isInteger(e))throw new TypeError(`${n}: color esperaba un entero y recibió ${typeof e}`);if(e<0||e>255)throw new RangeError(`${n}: el valor ${e} está fuera del rango 0..255`);return e}class $t{constructor(e){this._session=e}color(e,t,n){if(this._session.requireUsable(),e==null)throw new TypeError("led: color esperaba un nombre o tres canales RGB");if(typeof e=="string"){if(t!==void 0||n!==void 0)throw new TypeError("led: color admite un nombre o tres canales RGB, no ambos");const r=at[e.toLowerCase()];if(r===void 0)throw new RangeError(`led: color "${e}" no válido (colores válidos: ${Pt})`);return this._session.core.ledIndex(r)}if(t===void 0||n===void 0)throw new TypeError("led: color esperaba un nombre o tres canales RGB");return this._session.core.ledRgb(me("red",e),me("green",t),me("blue",n))}toString(){return"LED()"}}const jt="-100..100";function Bt(s,e){if(typeof s!="number")throw new TypeError(`motor (puerto "${e}"): run esperaba un número y recibió ${typeof s}`);if(!Number.isFinite(s)||s<-100||s>100)throw new RangeError(`motor (puerto "${e}"): el valor ${s} está fuera del rango ${jt}`);return Math.round(s)}class qt{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}run(e){const t=Bt(e,this.port);return this._session.requireDevice(this._conn,H),this._session.core.setMotor(this._conn,t)}stop(){return this._session.requireDevice(this._conn,H),this._session.core.setMotor(this._conn,0)}toString(){return`Motor('${this.port}')`}}const A=()=>performance.now()/1e3,J=s=>new Promise(e=>setTimeout(e,s*1e3));function G(s,e,t){return new Promise((n,r)=>{const o=setTimeout(()=>r(t()),e*1e3);s.then(i=>{clearTimeout(o),n(i)},i=>{clearTimeout(o),r(i)})})}const ge=(s,e)=>()=>new F(`${s} agotó el tiempo de espera (${e.toFixed(1)} s)`);class ct{constructor(){this._waiters=new Set}notify(){const e=[...this._waiters];this._waiters.clear();for(const t of e)t()}wait(e){return new Promise(t=>{const n=()=>{clearTimeout(r),this._waiters.delete(n),t()},r=setTimeout(n,Math.max(0,e)*1e3);this._waiters.add(n)})}}function Re(s){const e=Math.floor(s),t=s-e;return t<.5?e:t>.5?e+1:e%2===0?e:e+1}class lt{constructor(){this._listeners=new Set}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}emit(e,t){for(const n of[...this._listeners])try{n(e,t)}catch(r){console.error("listener error",r)}}}const ut=s=>Array.from(s,e=>e.toString(16).padStart(2,"0")).join(" "),Ut=Object.freeze({0:"none",3:"backward",5:"right",7:"left",9:"forward"});function be(s,e){const t=Math.max(-100,Math.min(100,e));return Uint8Array.of(s,1,1,t&255)}const Mt=s=>Uint8Array.of(W,4,1,s),Ft=(s,e,t)=>Uint8Array.of(W,4,3,s,e,t);function Oe(s,e,t,n,r,o){const i=new Uint8Array(11),a=new DataView(i.buffer);return i[0]=1,i[1]=2,i[2]=s,i[3]=e,i[4]=t,a.setUint32(5,n,!0),i[9]=r,i[10]=1,i}const Wt=s=>Uint8Array.of(0,1,s);function Ht(s){if(s.length<2)throw new RangeError(`port event too short (${s.length} bytes)`);const e=s[0];if(!(s[1]===1))return{conn:e,attached:!1,hubIndex:0,type:0};if(s.length<4)throw new RangeError(`attach event too short (${s.length} bytes)`);return{conn:e,attached:!0,hubIndex:s[2],type:s[3]}}function zt(s){if(s.length<2)throw new RangeError(`sensor value too short (${s.length} bytes)`);const e=Uint8Array.from(s);return{conn:e[1],value:e.slice(2),raw:e}}const de=s=>new DataView(s.buffer,s.byteOffset,s.byteLength);function dt(s){switch(s.length){case 1:return s[0];case 2:return de(s).getUint16(0,!0);case 4:return de(s).getFloat32(0,!0);default:throw new RangeError(`cannot decode a ${s.length}-byte sensor value`)}}function Gt(s){if(s.length===8){const t=de(s),n=t.getFloat32(0,!0),r=t.getFloat32(4,!0);if(!Number.isFinite(n)||!Number.isFinite(r))throw new RangeError("non-finite tilt angle");return[Re(n),Re(r)]}if(s.length<2)throw new RangeError(`tilt angle value too short (${s.length} bytes)`);const e=de(s);return[e.getInt8(0),e.getInt8(1)]}function Vt(s){const e=dt(s);return Number.isFinite(e)?Ut[Math.trunc(e)]??"unknown":"unknown"}async function De(s,e,...t){try{return await s.core.readSensor(...t)}catch(n){throw n instanceof ce||n instanceof Se?new ue(n.message,{cause:n}):n.name==="OperationTimeout"?new it(`${e}: todavía no hay ninguna lectura disponible`):n}}function Le(s,e){try{return s(e)}catch(t){throw t instanceof RangeError?new R(`unexpected sensor value ${ut(e)}: ${t.message}`,{cause:t}):t}}class Ie{constructor(e,t,n,r){this._session=e,this._conn=t,this.port=n,this._axis=r}get label(){return`tilt (puerto "${this.port}") eje ${this._axis===0?"x":"y"}`}async read(){this._session.requireDevice(this._conn,L);const e=await De(this._session,this.label,this._conn,L,ie,nt,2),[t,n]=Le(Gt,e);return this._axis===0?t:n}hasChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).axis(this._axis);return t.consume(t.checkFilter(e,this.label))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).axis(this._axis);return t.wait(t.checkFilter(e,this.label))}toString(){return`TiltAxis('${this.port}', '${this._axis===0?"x":"y"}')`}}class Kt{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}get label(){return`distance (puerto "${this.port}")`}async read(){this._session.requireDevice(this._conn,j);const e=await De(this._session,this.label,this._conn,j,Lt,st),t=Le(dt,e);if(!Number.isFinite(t))throw new R("the distance sensor reported a non-finite value");return Math.max(0,Math.min(10,Math.round(t)))}hasChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).distance;return t.consume(t.checkFilter(e,this.label))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).distance;return t.wait(t.checkFilter(e,this.label))}toString(){return`DistanceSensor('${this.port}')`}}class Jt{constructor(e,t,n){this._session=e,this._conn=t,this.port=n,this.x=new Ie(e,t,n,0),this.y=new Ie(e,t,n,1)}get label(){return`tilt (puerto "${this.port}")`}async read(){this._session.requireDevice(this._conn,L);const e=await De(this._session,this.label,this._conn,L,rt,st,4);return Le(Vt,e)}hasChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).tilt;return t.consume(t.checkFilter(e,this.label))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).tilt;return t.wait(t.checkFilter(e,this.label))}toString(){return`TiltSensor('${this.port}')`}}const _=Object.freeze({DISCONNECTED:"disconnected",CONNECTING:"connecting",CONNECTED:"connected",DISCONNECTING:"disconnecting",SHUTDOWN:"shutdown",ERROR:"error"}),m=_,Yt=Object.freeze({[m.DISCONNECTED]:new Set([m.CONNECTING]),[m.CONNECTING]:new Set([m.CONNECTED,m.ERROR,m.DISCONNECTED]),[m.CONNECTED]:new Set([m.DISCONNECTING,m.ERROR,m.SHUTDOWN]),[m.DISCONNECTING]:new Set([m.DISCONNECTED,m.ERROR]),[m.SHUTDOWN]:new Set([m.CONNECTING,m.DISCONNECTED]),[m.ERROR]:new Set([m.CONNECTING,m.DISCONNECTING,m.DISCONNECTED])});class Qt{constructor(e=()=>{}){this._state=m.DISCONNECTED,this._error=null,this._onChange=e}get state(){return this._state}get error(){return this._error}transition(e,t=null){const n=this._state;if(e!==n){if(!Yt[n].has(e))throw new k(`invalid hub state transition ${n} -> ${e}`);this._state=e,this._error=e===m.ERROR?t:null,this._onChange(e,this._error)}}forceError(e){(this._state===m.CONNECTED||this._state===m.CONNECTING)&&this.transition(m.ERROR,e)}}const Xt=Object.freeze({heartbeatInterval:.5,watchdogTimeout:2,emergencyAttempts:2,emergencyAttemptTimeout:.5,opTimeout:1,sensorTimeout:1,settleQuiet:1.5,settleMax:5,connectTimeout:15,poll:.02});function Te(s={}){return Object.freeze({...Xt,...s})}class Zt{constructor({timing:e,isArmed:t,enqueueHeartbeat:n,lastOk:r,trip:o,now:i=A}){this._tm=e,this._isArmed=t,this._enqueueHeartbeat=n,this._lastOk=r,this._trip=o,this._now=i,this._signal=new ct,this._stopped=!0,this._loop=null}start(){this._stopped=!1,this._loop=this._run()}wake(){this._signal.notify()}async stop(){this._stopped=!0,this._signal.notify();const e=this._loop;this._loop=null,e&&await e}async _run(){const e=this._tm;let t=null,n=0;for(;!this._stopped;){if(!this._isArmed()){t=null,await this._signal.wait(.1);continue}const r=this._now();if(t&&t.settled&&(t=null),t===null&&r>=n){n=r+e.heartbeatInterval;try{t=this._enqueueHeartbeat()}catch{t=null}}const o=r-this._lastOk();if(o>e.watchdogTimeout){await this._trip(`no valid ACK from the hub for ${o.toFixed(1)} s`),t=null;continue}await this._signal.wait(e.poll)}}}const en=(s,e)=>`${s}/${e}`,tn=3;class ht extends lt{constructor(e,t){super(),this._t=e,this.timing=t?Te(t):Te(),this._sm=new Qt((n,r)=>this.emit("state",{state:n,error:r})),this._linkLost=!1,this._lossHandled=!1,this._tripping=!1,this._ports=new Map,this._modes=new Map,this._samples=new Map,this._ledMode=-1,this._button=!1,this._speeds=new Map,this._lastOk=0,this._lastPortChange=0,this._changed=new ct,this._emergencyQ=[],this._normalQ=[],this._workerActive=!1,this._draining=null,this._isDraining=!1,this._epoch=0,this._wd=null}get state(){return this._sm.state}get error(){return this._sm.error}_unusable(){const e=this._sm.state;switch(e){case _.CONNECTED:return null;case _.CONNECTING:case _.DISCONNECTING:return new Z(`hub is ${e}`);case _.ERROR:return new D(`hub connection lost: ${this._sm.error}`);case _.SHUTDOWN:return new k("hub was shut down; power it on and call connect()");default:return new k("hub is not connected; call connect() first")}}checkUsable(){const e=this._unusable();if(e)throw e}_log(e,t){this.emit("log",{level:e,message:t})}_startWorker(){this._emergencyQ.length=0,this._normalQ.length=0,this._epoch+=1,this._workerActive=!0}async _stopWorker(){this._workerActive=!1,this._epoch+=1;const e=[...this._emergencyQ,...this._normalQ];this._emergencyQ.length=0,this._normalQ.length=0;for(const n of e)n.reject(new D("hub closed"));const t=this._isDraining?this._draining:null;t&&await G(t,this.timing.opTimeout*2+1,()=>null).catch(()=>{})}_enqueue(e,{emergency:t=!1,needsConnected:n=!0}={}){if(!this._workerActive)throw new k("hub is not connected; call connect() first");const r={fn:e,emergency:t,needsConnected:n,epoch:this._epoch,abandoned:!1,settled:!1};return r.promise=new Promise((o,i)=>{r.resolve=a=>{r.settled=!0,o(a)},r.reject=a=>{r.settled=!0,i(a)}}),r.promise.catch(()=>{}),(t?this._emergencyQ:this._normalQ).push(r),this._kick(),r}_kick(){this._isDraining||(this._isDraining=!0,this._draining=this._drain())}async _drain(){try{for(;this._workerActive;){const e=this._emergencyQ.length?this._emergencyQ.shift():this._normalQ.shift();if(!e)break;if(e.abandoned){e.resolve(void 0);continue}if(e.epoch!==this._epoch){e.reject(new D("stale request dropped after reconnect"));continue}try{e.needsConnected&&this.checkUsable();const t=await e.fn();this._lastOk=A(),e.resolve(t)}catch(t){e.reject(t)}}}finally{this._isDraining=!1}}_submit(e,t,n,r,o){const i=this._enqueue(e,{emergency:t,needsConnected:n}),a=o??r+this.timing.opTimeout+.5;return Number.isFinite(a)?G(i.promise,a,()=>(i.abandoned=!0,new F("hub operation did not complete"))):i.promise}async _io(e,t,n){try{return await this._t[e](...t,n)}catch(r){throw r instanceof D?(this._onLinkLost(r.message),r):r instanceof N?r:new R((r==null?void 0:r.message)??String(r),{cause:r})}}_call(e,t=[],{timeout:n,emergency:r=!1,needsConnected:o=!0,outer:i}={}){const a=n??this.timing.opTimeout;return this._submit(()=>this._io(e,t,a),r,o,a,i)}_onNotify(e,t){try{if(e===x)this._handlePort(t);else if(e===K){const n=zt(t);this._samples.set(n.conn,n.value),this.emit("sample",{conn:n.conn,value:n.value,mode:this._sampleMode(n.conn)}),this._changed.notify()}else e===I?t.length>0&&(this._button=t[0]!==0,this.emit("button",{pressed:this._button})):e===oe&&this._onLinkLost("hub sent a Disconnect notification")}catch(n){this._log("debug",`bad notification on ${e}: ${ut(t)} (${n==null?void 0:n.message})`)}}_sampleMode(e){const t=this._modes.get(e);if(!t)return null;const n=t.lastIndexOf("/");return n>=0?Number(t.slice(n+1)):null}_handlePort(e){const t=Ht(e),n=this._ports.get(t.conn);if(t.attached){if(n&&n.type===t.type&&n.hubIndex===t.hubIndex)return;this._ports.set(t.conn,t)}else{if(!n)return;this._ports.delete(t.conn)}this._modes.delete(t.conn),this._samples.delete(t.conn),t.conn===W&&(this._ledMode=-1),this._lastPortChange=A(),this.emit("ports",{ports:this.portsRaw()}),this._changed.notify()}_onLinkLost(e){const t=this._sm.state;if(t===_.DISCONNECTING||t===_.DISCONNECTED||t===_.SHUTDOWN)return;this._linkLost=!0,this._sm.forceError(e),this._changed.notify();const n=!this._lossHandled;this._lossHandled=!0,n&&this._log("error",`link lost: ${e}`),n&&this._motorsActive()&&this._trip(`link lost: ${e}`).catch(()=>{})}async connect(){const e=this._sm.state;if(e===_.CONNECTED)return;if(e===_.CONNECTING||e===_.DISCONNECTING)throw new Z(`hub is ${e}`);this._sm.transition(_.CONNECTING),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._speeds.clear(),this._ledMode=-1,this._button=!1,this._linkLost=!1,this._lossHandled=!1,this._tripping=!1;const t=this.timing;try{this._startWorker(),this._t.setCallbacks((n,r)=>this._onNotify(n,r),n=>this._onLinkLost(n)),await this._call("connect",[],{timeout:t.connectTimeout,needsConnected:!1,outer:this._t.interactive?1/0:void 0});for(const n of Rt)if(!this._t.hasCharacteristic(n))throw new B(`device does not look like a WeDo 2.0 hub: missing ${n}`);if(await this._optional("subscribe",oe),await this._call("subscribe",[K],{needsConnected:!1}),this._t.hasCharacteristic(I)){await this._optional("subscribe",I);try{const n=await this._call("read",[I],{needsConnected:!1});this._button=n.length>0&&n[0]!==0}catch(n){if(!(n instanceof N))throw n}}if(await this._call("subscribe",[x],{needsConnected:!1}),await this._settlePorts(_.CONNECTING),this._sm.state!==_.CONNECTING)throw this._unusable()??new D("connection lost during connect");this._lastOk=A(),this._sm.transition(_.CONNECTED),this._startWatchdog()}catch(n){throw await this._abortConnect(n),n instanceof N?n:new B((n==null?void 0:n.message)??String(n),{cause:n})}}async _optional(e,...t){try{await this._call(e,t,{needsConnected:!1})}catch(n){if(!(n instanceof N))throw n;this._log("debug",`optional ${e} ${t} unavailable: ${n.message}`)}}async _abortConnect(e){this._sm.state===_.CONNECTING&&(this._sm.transition(_.ERROR,(e==null?void 0:e.message)??String(e)),this._changed.notify()),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}async _settlePorts(e){const t=this.timing,n=A();for(this._lastPortChange=Math.max(this._lastPortChange,n);;){if(this._sm.state!==e)throw this._unusable()??new D("connection lost during port discovery");const r=A(),o=t.settleQuiet-(r-this._lastPortChange),i=t.settleMax-(r-n);if(o<=0||i<=0)return;await this._changed.wait(Math.min(o,i))}}async disconnect(){const e=this._sm.state;if(e===_.DISCONNECTED||e===_.SHUTDOWN)return e===_.SHUTDOWN&&this._sm.transition(_.DISCONNECTED),!0;if(e===_.CONNECTING||e===_.DISCONNECTING)throw new Z(`hub is ${e}`);const t=this._linkLost;this._sm.transition(_.DISCONNECTING);let n=!0;t?this._motorsActive()&&(n=!1):{confirmed:n}=await this._stopMotors(this.timing.emergencyAttempts,this.timing.emergencyAttemptTimeout),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch(r){this._log("debug",`transport disconnect failed: ${r==null?void 0:r.message}`)}return n&&this._speeds.clear(),this._sm.transition(_.DISCONNECTED),this._changed.notify(),n||this._log("warn","disconnect: motor stop could not be confirmed"),n}async shutdownHub(){this.checkUsable(),await this._call("write",[Qe,Uint8Array.of(1)]),this._sm.transition(_.SHUTDOWN),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}portsRaw(){return new Map([...this._ports].map(([e,t])=>[e,t.type]))}async refreshPorts(){this.checkUsable(),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._ledMode=-1,this._lastPortChange=A(),await this._call("unsubscribe",[x]),await this._call("subscribe",[x]),await this._settlePorts(_.CONNECTED)}_requireDevice(e,t){const n=this._ports.get(e);if(!n)throw new ce(`no device on connect id ${e}`);if(n.type!==t){const r=o=>ae[o]??`0x${o.toString(16).padStart(2,"0")}`;throw new Se(`device on connect id ${e} is a ${r(n.type)}, expected a ${r(t)}`)}}_motorsActive(){for(const e of this._speeds.values())if(e!==0)return!0;return!1}async setMotor(e,t){var o;this.checkUsable(),this._requireDevice(e,H);const n=be(e,t),r=this._motorsActive();t!==0&&(this._speeds.set(e,t),r||(this._lastOk=A()),(o=this._wd)==null||o.wake()),await this._call("write",[O,n]),t===0&&this._speeds.set(e,0),this.emit("motor",{conn:e,speed:t})}async stopAll(){this.checkUsable();const e=this._knownMotors();let t=null;for(const n of e){try{await this._call("write",[O,be(n,0)],{emergency:!0})}catch(r){t??(t=r);continue}this._speeds.set(n,0),this.emit("motor",{conn:n,speed:0})}if(t)throw t}_knownMotors(){const e=new Set;for(const[t,n]of this._ports)n.type===H&&e.add(t);for(const t of this._speeds.keys())e.add(t);return[...e].sort((t,n)=>t-n)}async _ensureLedMode(e){this._ledMode!==e&&(await this._call("write",[M,Oe(W,xe,e,1,nt)]),this._ledMode=e)}async ledIndex(e){this.checkUsable(),await this._ensureLedMode(Dt),await this._call("write",[O,Mt(e)])}async ledRgb(e,t,n){this.checkUsable(),await this._ensureLedMode(At),await this._call("write",[O,Ft(e,t,n)])}buttonPressed(){return this.checkUsable(),this._button}async readBattery(){return this.checkUsable(),(await this._call("read",[V]))[0]}async readSensor(e,t,n,r,o=null,i=null){this.checkUsable(),this._requireDevice(e,t);const a=i??this.timing.sensorTimeout,c=en(t,n),h=async()=>{this._samples.delete(e),this._modes.set(e,c);try{await this._call("write",[M,Oe(e,t,n,1,r,!0)]),await this._call("write",[M,Wt(e)])}catch(b){throw this._modes.get(e)===c&&this._modes.delete(e),b}};this._modes.get(e)!==c&&await h();const d=A()+a;let g=0;for(;;){const b=this._unusable();if(b)throw b;if(!this._ports.has(e))throw new ce(`the device on connect id ${e} was disconnected`);if(this._modes.get(e)!==c&&g<tn){if(g++,await h(),A()>=d)throw new F(`the hub sent no value within ${a.toFixed(1)} s`);continue}const f=this._samples.get(e);if(f&&(o===null||f.length===o))return f;const w=d-A();if(w<=0)throw new F(`the hub sent no value within ${a.toFixed(1)} s`);await this._changed.wait(w)}}_startWatchdog(){this._wd=new Zt({timing:this.timing,isArmed:()=>this._sm.state===_.CONNECTED&&this._motorsActive(),enqueueHeartbeat:()=>this._enqueue(()=>this._io("read",[V],this.timing.opTimeout),{emergency:!0,needsConnected:!1}),lastOk:()=>this._lastOk,trip:e=>this._trip(e)}),this._wd.start()}async _stopWatchdog(){const e=this._wd;this._wd=null,e&&await e.stop()}async _stopMotors(e,t){let n=this._knownMotors();const r=[];for(let o=0;o<e&&n.length!==0;o+=1){const i=[];for(const a of n){try{await this._call("write",[O,be(a,0)],{timeout:t,emergency:!0,needsConnected:!1})}catch{i.push(a);continue}this._speeds.set(a,0),this.emit("motor",{conn:a,speed:0})}n=i,r.push(n.length===0)}return{confirmed:n.length===0,results:r}}async _trip(e){if(!this._tripping){this._tripping=!0;try{const t=this.timing;this._log("error",`watchdog: ${e}`);const{confirmed:n,results:r}=await this._stopMotors(t.emergencyAttempts,t.emergencyAttemptTimeout),o=[];for(let i=0;i<r.length&&(o.push(`${i===0?"stop attempt 1":`attempt ${i+1}`}${r[i]?" ACK":" no ACK"}`),!r[i]);i+=1);n?(this._log("warn",`watchdog: ${o.join(", ")}`),this._log("warn","watchdog: motors stopped")):this._log("error",`watchdog: stop NOT confirmed (${t.emergencyAttempts} attempts)`),this._sm.forceError(e),this._changed.notify()}finally{this._tripping=!1}}}}C(ht,"STOP_PROFILE","nobarrier");class ft{constructor(){C(this,"interactive",!1)}setCallbacks(e,t){throw new k("not implemented")}async connect(e){throw new k("not implemented")}async disconnect(e){throw new k("not implemented")}hasCharacteristic(e){throw new k("not implemented")}async read(e,t){throw new k("not implemented")}async write(e,t,n){throw new k("not implemented")}async subscribe(e,t){throw new k("not implemented")}async unsubscribe(e,t){throw new k("not implemented")}}const we=[Ye,Nt,Ct,vt];function _t(s=globalThis.navigator){return!!(s&&s.bluetooth&&typeof s.bluetooth.requestDevice=="function")}function pt(s=globalThis){var r;if(_t(s.navigator))return null;if(s.isSecureContext===!1)return"Web Bluetooth requiere HTTPS (o localhost). Abre la aplicación desde una dirección segura.";const e=((r=s.navigator)==null?void 0:r.userAgent)??"";return`Este navegador no admite Web Bluetooth. Usa Chrome o Edge en un sistema compatible (Firefox y Safari no están soportados).${/Linux/.test(e)&&!/Android/.test(e)?" En Linux Web Bluetooth está desactivado por defecto: abre chrome://flags/#enable-experimental-web-platform-features, ponlo en «Enabled», reinicia el navegador y comprueba que BlueZ ≥ 5.41 (`bluetoothd --version`) y el servicio bluetooth están activos.":""}`}const Pe=s=>new Uint8Array(s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength));class mt extends ft{constructor({bluetooth:t=(r=>(r=globalThis.navigator)==null?void 0:r.bluetooth)(),acceptAll:n=!1}={}){super();C(this,"interactive",!0);this._bt=t,this._acceptAll=n,this._device=null,this._chars=new Map,this._handlers=new Map,this._onNotify=null,this._onDisconnect=null,this._closing=!1,this._onGattDisconnected=()=>{var o;this._closing||(o=this._onDisconnect)==null||o.call(this,"BLE link lost")}}setCallbacks(t,n){this._onNotify=t,this._onDisconnect=n}get deviceName(){var t;return((t=this._device)==null?void 0:t.name)??null}async connect(t){if(!this._bt)throw new le(pt()??"Web Bluetooth no está disponible");this._closing=!1;let n;try{n=await this._bt.requestDevice(this._acceptAll?{acceptAllDevices:!0,optionalServices:we}:{filters:[{services:[Ye]},...Ot.map(r=>({name:r}))],optionalServices:we})}catch(r){throw(r==null?void 0:r.name)==="NotFoundError"?new B("no WeDo 2.0 hub was selected"):(r==null?void 0:r.name)==="SecurityError"?new B("the browser requires a user gesture (click) and HTTPS to open the Bluetooth chooser"):new R((r==null?void 0:r.message)??String(r),{cause:r})}this._device=n,n.addEventListener("gattserverdisconnected",this._onGattDisconnected);try{const r=await G(n.gatt.connect(),t,ge("GATT connect",t));await G(this._discover(r),t,ge("service discovery",t))}catch(r){throw await this._release(),this._map(r)}}async _discover(t){this._chars.clear();for(const n of we){let r;try{r=await t.getPrimaryService(n)}catch(o){if((o==null?void 0:o.name)==="NotFoundError")continue;throw o}for(const o of await r.getCharacteristics())this._chars.set(o.uuid.toLowerCase(),o)}}async disconnect(){this._closing=!0,await this._release()}async _release(){var n,r;const t=this._device;this._device=null;for(const[o,i]of this._handlers)(n=this._chars.get(o))==null||n.removeEventListener("characteristicvaluechanged",i);if(this._handlers.clear(),this._chars.clear(),t){t.removeEventListener("gattserverdisconnected",this._onGattDisconnected);try{(r=t.gatt)!=null&&r.connected&&t.gatt.disconnect()}catch{}}}hasCharacteristic(t){return this._chars.has(t)}_char(t){var r,o;if(!((o=(r=this._device)==null?void 0:r.gatt)!=null&&o.connected))throw new D("BLE link is not open");const n=this._chars.get(t);if(!n)throw new R(`characteristic not available: ${t}`);return n}_map(t){var n,r;return t instanceof N?t:!((r=(n=this._device)==null?void 0:n.gatt)!=null&&r.connected)||(t==null?void 0:t.name)==="NetworkError"?new D((t==null?void 0:t.message)||"BLE link lost",{cause:t}):new R((t==null?void 0:t.message)||(t==null?void 0:t.name)||"BLE error",{cause:t})}async _run(t,n,r){try{return await G(t,n,ge(r,n))}catch(o){throw this._map(o)}}async read(t,n){const r=this._char(t);return Pe(await this._run(r.readValue(),n,"BLE read"))}async write(t,n,r){const o=this._char(t);if(typeof o.writeValueWithResponse!="function")throw new le("this browser lacks writeValueWithResponse; refusing to write without response");await this._run(o.writeValueWithResponse(Uint8Array.from(n)),r,"BLE write")}async subscribe(t,n){const r=this._char(t);if(!this._handlers.has(t)){const o=i=>{var c,h;const a=(c=i.target)==null?void 0:c.value;a&&((h=this._onNotify)==null||h.call(this,t,Pe(a)))};r.addEventListener("characteristicvaluechanged",o),this._handlers.set(t,o)}await this._run(r.startNotifications(),n,"BLE start notifications")}async unsubscribe(t,n){const r=this._char(t);await this._run(r.stopNotifications(),n,"BLE stop notifications");const o=this._handlers.get(t);o&&(r.removeEventListener("characteristicvaluechanged",o),this._handlers.delete(t))}}class nn{constructor(){this.distance=new z(["increase","decrease"]),this.tilt=new z(["left","right","forward","backward","none"]),this._axes=[new z(["increase","decrease"]),new z(["increase","decrease"])],this.button=new z(["pressed","released"],{firstIsChange:!0})}axis(e){return this._axes[e]}reset(){this.distance.reset(),this.tilt.reset(),this._axes.forEach(e=>e.reset()),this.button.reset()}}class z{constructor(e=[],t={}){this._filters=new Set(e),this._firstIsChange=!!t.firstIsChange,this._pending=[],this._waiters=[],this._baseline=void 0}get filters(){return[...this._filters]}checkFilter(e,t="recurso"){if(e==null)return null;if(typeof e!="string")throw new TypeError(`${t}: el filtro esperaba una cadena y recibió ${typeof e}`);if(!this._filters.has(e)){const n=[...this._filters].map(r=>`"${r}"`).join(", ");throw new RangeError(`${t}: filtro "${e}" no admitido (admitidos: ${n})`)}return e}observe(e,t){if(this._baseline===void 0){this._baseline=e;const i=t(void 0,e);return i==null||!this._firstIsChange?null:(this._record(i),i)}const n=this._baseline;this._baseline=e;const r=t(n,e);return r==null?null:(this._record(r),r)}_record(e){this._pending.includes(e)||this._pending.push(e),this._wake()}pending(){return[...this._pending]}consume(e=null){if(e===null){const n=this._pending.length>0;return this._pending=[],n}const t=this._pending.indexOf(e);return t>=0?(this._pending.splice(t,1),!0):!1}reset(){this._pending=[],this._baseline=void 0;const e=this._waiters;this._waiters=[];for(const t of e)t.reject(new Ae("hub no conectado"))}wait(e=null){if(e!==null&&this.consume(e))return Promise.resolve(e);if(e===null){const t=this._pending[0];if(t!==void 0)return this._pending.shift(),Promise.resolve(t)}return new Promise((t,n)=>{this._waiters.push({filter:e,resolve:t,reject:n})})}_wake(){for(let e=0;e<this._waiters.length;e+=1){const t=this._waiters[e];if(!(t.filter===null?this._pending.length>0:this._pending.includes(t.filter)))continue;const r=t.filter===null?this._pending.shift():t.filter;if(t.filter!==null){const o=this._pending.indexOf(t.filter);o>=0&&this._pending.splice(o,1)}this._waiters.splice(e,1),t.resolve(r);return}}}const ee=new Set;let $e=!1;function sn(){$e||typeof globalThis.addEventListener!="function"||($e=!0,globalThis.addEventListener("pagehide",()=>{for(const s of ee)s.emergencyClose().catch(()=>{})}))}class rn{constructor(e=null,t=null){this._transport=e,this._timing=t,this._core=null,this._changes=new Map,this._unsub=null}get core(){if(!this._core)throw new k("hub is not connected; call connect() first");return this._core}get isConnected(){return this._core!==null&&this._core.state===_.CONNECTED}ensureCore(){var e;return this._core||(this._core=new ht(this._transport??new mt,this._timing),(e=this._unsub)==null||e.call(this),this._unsub=this._core.subscribe((t,n)=>this._onCore(t,n))),this._core}requireUsable(){if(!this.isConnected)throw new Ae("hub no conectado")}requireDevice(e,t){this.requireUsable();const r=this.portsRaw().get(e),o=e===fe?"a":"b",i=ae[t]??"unknown";if(r===void 0)throw new ue(`puerto "${o}": no hay ningún periférico conectado (se esperaba "${i}")`);if(r!==t)throw new ue(`puerto "${o}": hay un periférico "${ae[r]??"unknown"}" y se esperaba "${i}"`)}changes(e){let t=this._changes.get(e);return t||(t=new nn,this._changes.set(e,t)),t}resetChanges(){for(const e of this._changes.values())e.reset()}async connect(){await this.ensureCore().connect(),this.resetChanges(),ee.add(this),sn()}async disconnect(){let e=!0;return this._core&&(e=await this._core.disconnect()),this.resetChanges(),ee.delete(this),e}async shutdown(){const e=this.core;try{await e.stopAll()}catch(t){e._log("warn",`could not stop motors before shutdown: ${t==null?void 0:t.message}`)}await e.shutdownHub(),ee.delete(this)}stopAll(){return this.core.stopAll()}portsRaw(){return this._core?this._core.portsRaw():new Map}refreshPorts(){return this.core.refreshPorts()}async emergencyClose(){try{this._core&&await this._core.disconnect()}catch{}}_onCore(e,t){e==="sample"?this._onSample(t):e==="button"?this._onButton(t):(e==="state"||e==="ports")&&this.resetChanges()}_onSample({conn:e,value:t,mode:n}){const r=this.portsRaw().get(e);if(r===j){const o=this._asNumber(t);this.changes(e).distance.observe(o,(i,a)=>a>i?"increase":a<i?"decrease":null)}else if(r===L)if(n===ie){const[o,i]=this._asPair(t),a=this.changes(e);a.axis(0).observe(o,(c,h)=>h>c?"increase":h<c?"decrease":null),a.axis(1).observe(i,(c,h)=>h>c?"increase":h<c?"decrease":null)}else{const o=this._asDirection(t);this.changes(e).tilt.observe(o,(i,a)=>a===i?null:a)}}_onButton({pressed:e}){this.changes("button").button.observe(!!e,(t,n)=>n?"pressed":"released")}_asNumber(e){return e instanceof Float32Array?e[0]:e instanceof Uint8Array?new DataView(e.buffer,e.byteOffset,e.byteLength).getFloat32(0,!0):Number(e)}_asPair(e){return e instanceof Uint8Array&&e.length>=2?[e[0]>127?e[0]-256:e[0],e[1]>127?e[1]-256:e[1]]:[0,0]}_asDirection(e){const t={0:"none",3:"backward",5:"right",7:"left",9:"forward"},n=this._asNumber(e);return t[n]??"none"}}const S={ok:"ok",cancelled:"cancelled",stopped:"stopped"};function te(s){if(typeof s!="number")throw new TypeError(`seconds must be a number, not ${typeof s}`);if(!Number.isFinite(s)||s<0)throw new RangeError(`seconds must be a finite number >= 0, got ${s}`);return s}class on{constructor(e,t){this._manager=e,this._id=t}get id(){return this._id}get state(){return this._manager.state(this._id)}cancel(){this._manager.cancel(this._id)}join(){return this._manager.join(this._id,void 0)}toString(){return`Task(${this._id})`}}class an{constructor(){this._tasks=new Map,this._main=new Set,this._counter=0,this._allWaiters=[]}_nextId(){return this._counter+=1,this._counter}spawn(e,t){const n={id:e,callable:t,state:"running",pending:null,cancelRequested:!1,joiners:[],error:null,result:null};return this._tasks.set(e,n),this._start(n),e}_start(e){var n;let t;try{t=typeof((n=e.callable)==null?void 0:n.callPromising)=="function"?e.callable.callPromising():Promise.resolve().then(()=>e.callable())}catch(r){this._finish(e,"failed",r);return}t=t.then(r=>{e.result=r,this._finish(e,"finished",null)},r=>{this._finish(e,"failed",r)}),e.promise=t,t.catch(()=>{})}_finish(e,t,n){if(e.state=t,e.error=n??null,e.pending){const o=e.pending;e.pending=null,o.settle(S.ok)}const r=e.joiners;e.joiners=[];for(const o of r)o.handle.settle(S.ok);if(this._live()===0){const o=this._allWaiters;this._allWaiters=[];for(const i of o)i()}}_live(){let e=0;for(const t of this._tasks.values())t.state==="running"&&(e+=1);return e}wait(e,t){te(t);const n=setTimeout(()=>a.settle(S.ok),t*1e3),r=e==null?null:this._tasks.get(e);let o;const i=new Promise(c=>{o=c}),a={settled:!1,settle:c=>{a.settled||(a.settled=!0,clearTimeout(n),r&&r.pending===a&&(r.pending=null),r==null&&this._main.has(a)&&this._main.delete(a),o(c))}};return r?r.pending=a:this._main.add(a),i}join(e,t=void 0){const n=this._tasks.get(e);if(!n||n.state==="finished"||n.state==="failed")return Promise.resolve();const r=t==null?null:this._tasks.get(t);return new Promise((o,i)=>{if(r){const c={settle:h=>{const d=n.joiners.indexOf(a);d>=0&&n.joiners.splice(d,1),r.pending===c&&(r.pending=null),h===S.cancelled?i(new U):o()}};var a={};a.handle=c,n.joiners.push(a),r.pending=c}else{var a={handle:{settle:()=>{const d=n.joiners.indexOf(a);d>=0&&n.joiners.splice(d,1),o()}}};n.joiners.push(a)}})}cancelRequested(e){const t=this._tasks.get(e);return!!(t!=null&&t.cancelRequested)}cancel(e){const t=this._tasks.get(e);if(!(!t||t.state!=="running")&&(t.cancelRequested=!0,t.pending)){const n=t.pending;t.pending=null,n.settle(S.cancelled)}}interruptAll(){for(const e of[...this._tasks.values()])if(e.cancelRequested=!0,e.pending){const t=e.pending;e.pending=null,t.settle(S.cancelled)}for(const e of[...this._main])e.settle(S.stopped)}cancelAll(){this.interruptAll()}allSettled(){return this._live()===0?Promise.resolve():new Promise(e=>{this._allWaiters.push(e)})}state(e){const t=this._tasks.get(e);return t?t.state:null}}class cn{constructor(e){this._manager=e}spawn(e,t=void 0){if(typeof e=="function"){const n=this._manager._nextId(),r={id:n,wait:async o=>{if(this._manager.cancelRequested(n))throw new U;const i=await this._manager.wait(n,te(o));if(i===S.cancelled)throw new U;if(i===S.stopped)throw new U("program stopped");if(this._manager.cancelRequested(n))throw new U;return i===S.ok?void 0:i}};return this._manager.spawn(n,()=>Promise.resolve().then(()=>e(r))),new on(this._manager,n)}return this._manager.spawn(e,t)}async wait(e,t=void 0){return t!==void 0?this._manager.wait(e,te(t)).then(n=>n===S.ok?void 0:n):this._manager.wait(null,te(e)).then(n=>n===S.ok?void 0:n)}join(e,t=void 0){return this._manager.join(e,t)}cancel(e){this._manager.cancel(e)}cancelAll(){this._manager.cancelAll()}interruptAll(){return this._manager.interruptAll()}allSettled(){return this._manager.allSettled()}state(e){return this._manager.state(e)}}const gt={A:fe,B:Xe};function ne(s){if(typeof s!="string")throw new TypeError(`hub: el puerto esperaba una cadena y recibió ${typeof s}`);const e=gt[s.toUpperCase()];if(e===void 0)throw new RangeError(`puerto "${s}" no válido (puertos válidos: a, b)`);return e}function ye(s){return ne(s)===fe?"a":"b"}function ln(s){if(s==null)return null;if(typeof s!="number")throw new TypeError(`timeout must be a number, not ${typeof s}`);if(!Number.isFinite(s)||s<0)throw new RangeError(`timeout must be a finite number >= 0, got ${s}`);return s}class un{constructor({transport:e=null,timing:t=null}={}){this._session=new rn(e,t),this._led=new $t(this._session),this._button=new It(this._session),this._taskManager=new an,this._task=new cn(this._taskManager),this._connectError=null,this._connecting=null}connect(){if(this.isConnected||this._connecting)return this;const e=this._session.ensureCore();return this._connectError=null,this._connecting=e.connect().then(()=>{this._connecting=null},t=>{this._connectError=t,this._connecting=null}),this}async waitConnection(e=null){const t=ln(e),n=t===null?1/0:Date.now()+t*1e3;for(;;){if(this.isConnected)return!0;if(this._connectError){const r=this._connectError;throw this._connectError=null,new ot((r==null?void 0:r.message)??"no se pudo conectar con el hub")}if(Date.now()>=n)return!1;await new Promise(r=>setTimeout(r,40))}}get isConnected(){return this._session.isConnected}get state(){return this._session._core?this._session._core.state:"disconnected"}disconnect(){return this._session.disconnect()}shutdown(){return this._session.shutdown()}stopAll(){return this._session.stopAll()}readBattery(){return this._session.core.readBattery()}subscribe(e){return this._session.ensureCore().subscribe(e)}ports(){this._session.requireUsable();const e=this._session.portsRaw(),t={};for(const[n,r]of Object.entries(gt))e.has(r)&&(t[n.toLowerCase()]=ae[e.get(r)]??"unknown");return t}async refreshPorts(){return await this._session.refreshPorts(),this.ports()}motor(e){return new qt(this._session,ne(e),ye(e))}distance(e){return new Kt(this._session,ne(e),ye(e))}tilt(e){return new Jt(this._session,ne(e),ye(e))}get led(){return this._led}get button(){return this._button}get task(){return this._task}}const je={motor:H,distance:j,tilt:L},Ee={A:fe,B:Xe},dn=[[kt,et],[Tt,Ze],[xt,tt],[W,xe]],hn=Object.freeze({none:0,backward:3,right:5,left:7,forward:9}),ve=(s,e)=>Uint8Array.of(s,1,0,e,0,0,0,16,0,0,0,16),Be=s=>{const e=new Uint8Array(4);return new DataView(e.buffer).setFloat32(0,s,!0),e};class fn extends ft{constructor(e,{externalDelay:t=.05,repeatPorts:n=null,ackDelay:r=0,silentSensors:o=!1,failConnect:i=!1}={}){super(),this.devices={...e??{A:"motor",B:"distance"}},this.externalDelay=t,this.repeatPorts=n,this.ackDelay=r,this.silentSensors=o,this.failConnect=i,this.failReads=!1,this.frozen=!1,this.dropped=!1,this.connected=!1,this.supportsDisconnectNotify=!1,this.writes=[],this.reads=[],this.motors={},this.sensorModes={},this.ledMode=null,this.button=!1,this.distance=0,this.tiltAngle=[0,0],this.tiltCode=0,this.battery=87,this._notifying=new Set,this._onNotify=null,this._onDisconnect=null,this._closed=!1,this._burstId=0}freeze(){this.frozen=!0}unfreeze(){this.frozen=!1}dropLink(e="simulated link loss"){var t;this.dropped=!0,this.connected=!1,(t=this._onDisconnect)==null||t.call(this,e)}writesTo(e){return this.writes.filter(([t])=>t===e).map(([,t])=>t)}press(){this.button=!0,this._notify(I,Uint8Array.of(1))}release(){this.button=!1,this._notify(I,Uint8Array.of(0))}setDistance(e){this.distance=e,this._pushValues(j)}setTiltAngle(e,t){this.tiltAngle=[Math.trunc(e),Math.trunc(t)],this._pushValues(L,ie)}setTiltDirection(e){this.tiltCode=typeof e=="string"?hn[e]:Number(e),this._pushValues(L,rt)}attach(e,t){this.devices[e]=t,this._notify(x,ve(Ee[e],je[t]))}detach(e){delete this.devices[e],this._notify(x,Uint8Array.of(Ee[e],0))}setCallbacks(e,t){this._onNotify=e,this._onDisconnect=t}async connect(e){if(this.failConnect)throw new B("no WeDo 2.0 hub found");this.dropped=!1,this.connected=!0,this._closed=!1}async disconnect(){this.connected=!1,this._notifying.clear(),this._closed=!0,this._burstId+=1}hasCharacteristic(e){return e===oe||[V,x,K,M,O,I,Qe].includes(e)}async _gate(e){if(this.dropped||!this.connected)throw new D("simulated link is down");if(this.frozen)throw await J(e),new F("no ACK from the simulated hub");if(this.ackDelay&&(await J(this.ackDelay),this.dropped))throw new D("simulated link is down")}async read(e,t){if(await this._gate(t),this.failReads)throw new R("simulated read failure");if(this.reads.push(e),e===V)return Uint8Array.of(this.battery);if(e===I)return Uint8Array.of(this.button?1:0);throw new R(`characteristic not readable: ${e}`)}async write(e,t,n){if(await this._gate(n),t=Uint8Array.from(t),this.writes.push([e,t]),e===O)t.length===4&&t[1]===1&&t[2]===1&&(this.motors[t[0]]=t[3]<<24>>24);else if(e===M)if(t.length>=5&&t[0]===1&&t[1]===2){const[r,o,i]=[t[2],t[3],t[4]];this.sensorModes[r]=[o,i],r===W&&(this.ledMode=i)}else t.length===3&&t[0]===0&&t[1]===1&&this._pushConn(t[2])}async subscribe(e,t){if(await this._gate(t),e===oe&&!this.supportsDisconnectNotify)throw new R("notifications not supported on this characteristic");this._notifying.add(e),e===x&&this._portBurst(++this._burstId)}async unsubscribe(e,t){await this._gate(t),this._notifying.delete(e)}_notify(e,t){this._onNotify&&this._notifying.has(e)&&this._onNotify(e,Uint8Array.from(t))}async _portBurst(e){const t=()=>e===this._burstId&&!this._closed;for(const[r,o]of dn)this._notify(x,ve(r,o));if(await J(this.externalDelay),!t())return;const n=Object.keys(this.devices).sort().map(r=>ve(Ee[r],je[this.devices[r]]));for(const r of n)this._notify(x,r);for(;this.repeatPorts&&this._notifying.has(x);){if(await J(this.repeatPorts),!t())return;for(const r of n)this._notify(x,r)}}_valueBytes(e){const[t,n]=this.sensorModes[e]??[null,null];return t===j?Be(this.distance):t===L?n===ie?Uint8Array.of(this.tiltAngle[0]&255,this.tiltAngle[1]&255):Be(this.tiltCode):null}_pushConn(e){if(this.silentSensors)return;const t=this._valueBytes(e);t&&this._notify(K,Uint8Array.of(1,e,...t))}_pushValues(e,t=null){for(const[n,[r,o]]of Object.entries(this.sensorModes))r===e&&(t===null||o===t)&&this._pushConn(Number(n))}}const _n=new Set([_.ERROR]);class pn extends lt{constructor(){super(),this.hub=null,this.sim=null,this.kind="web-bluetooth",this.state=_.DISCONNECTED,this.activeMotors=new Map,this._unsub=null,this.simDevices={A:"motor",B:"distance"},this.simDistance=10}get supportsBluetooth(){return _t()}get connected(){return this.state===_.CONNECTED}get unsafe(){return _n.has(this.state)}_log(e,t){this.emit("log",{level:e,message:t})}async connect(e,{acceptAll:t=!1}={}){var i;this.hub&&this.state!==_.DISCONNECTED&&await this.disconnect(),this.kind=e;let n,r=null;e==="simulated"?(this.sim=new fn(this.simDevices,{externalDelay:.05}),this.sim.distance=this.simDistance??10,n=this.sim,r=Te({settleQuiet:.3})):(this.sim=null,n=new mt({acceptAll:t}));const o=new un({transport:n,timing:r});this.hub=o,this.activeMotors.clear(),(i=this._unsub)==null||i.call(this),this._unsub=o.subscribe((a,c)=>this._onCore(a,c)),this._log("info",`Conectando (${e==="simulated"?"simulador":"Web Bluetooth"})…`);try{if(o.connect(),!await o.waitConnection(60))throw new Error("la conexión del hub no se completó")}catch(a){throw this._log("error",`No se pudo conectar: ${a.message}`),this._setState(o.state),a}this._log("info","Conectado."),this.emit("hubname",{name:n.deviceName??(e==="simulated"?"Hub simulado":"WeDo 2.0 Smart Hub")}),this.emit("ports",{ports:o.ports()}),await this.refreshBattery()}async disconnect(){const e=this.hub;if(e){try{const t=await e.disconnect();this._log(t?"info":"warn",t?"Desconectado.":"Desconectado, pero la parada de motores no pudo confirmarse.")}catch(t){this._log("error",`Error al desconectar: ${t.message}`)}this.activeMotors.clear(),this._setState(e.state),this.emit("ports",{ports:{}})}}async refreshBattery(){if(this.connected)try{this.emit("battery",{percent:await this.hub.readBattery()})}catch(e){this._log("warn",`Batería: ${e.message}`)}}async run(e,t){try{const n=await t(this.hub);return this._log("op",e),n}catch(n){this._log("error",`${e}: ${n.message}`);return}}async emergencyStop(){if(this.hub){this._log("warn","Parada de emergencia solicitada.");try{await this.hub.stopAll()}catch(e){this._log("error",`Parada: ${e.message}`)}}}async onHidden(){this.connected&&[...this.activeMotors.values()].some(e=>e!==0)&&(this._log("warn","La pestaña se ocultó con motores en marcha: se envía parada (los temporizadores del navegador pueden retrasarse)."),await this.emergencyStop())}_setState(e){e!==this.state&&(this.state=e,this.emit("state",{state:e,unsafe:this.unsafe}))}_onCore(e,t){switch(e){case"state":this._setState(t.state),this._log(t.state===_.ERROR?"error":"info",`Estado: ${t.state}${t.error?` (${t.error})`:""}`);break;case"ports":this.emit("ports",{ports:this.hub.ports()});break;case"motor":this.activeMotors.set(t.conn,t.speed),this.emit("motor",t);break;case"button":this.emit("button",t);break;case"log":t.level!=="debug"&&this._log(t.level,t.message);break}}}const u=(s,e=document)=>e.querySelector(s);function v(s,e={},...t){const n=document.createElement(s);for(const[r,o]of Object.entries(e))r.startsWith("on")&&typeof o=="function"?n.addEventListener(r.slice(2).toLowerCase(),o):o===!0?n.setAttribute(r,""):o!==!1&&o!=null&&n.setAttribute(r,o);for(const r of t.flat())n.append(r instanceof Node?r:document.createTextNode(String(r)));return n}function se(s,e){for(const t of s)t.disabled=!e}function mn(s){const e={transport:u("#transport"),connect:u("#btn-connect"),disconnect:u("#btn-disconnect"),state:u("#state"),name:u("#hub-name"),battery:u("#battery"),estop:u("#btn-estop"),compat:u("#compat"),unsafe:u("#unsafe")},t=u("#btn-hub"),n=u("#hub-drawer"),r=u("#hub-close"),o=d=>{n.hidden=!d,t.setAttribute("aria-expanded",String(d))};o(!1),t.addEventListener("click",()=>o(n.hidden)),r.addEventListener("click",()=>o(!1)),document.addEventListener("keydown",d=>{d.key==="Escape"&&!n.hidden&&o(!1)});const i=document.querySelector(".wb-top");if(i&&typeof ResizeObserver=="function"){const d=()=>n.style.setProperty("--wb-top-h",`${i.offsetHeight}px`);d(),new ResizeObserver(d).observe(i)}const a=pt();a&&(e.compat.hidden=!1,e.compat.textContent=`${a} Puedes probar la aplicación con el simulador.`,e.transport.querySelector('option[value="web-bluetooth"]').disabled=!0,e.transport.value="simulated");const c=d=>se([e.connect,e.transport],!d);e.connect.addEventListener("click",async()=>{c(!0),o(!0),e.connect.textContent="Conectando…";try{await s.connect(e.transport.value,{acceptAll:u("#accept-all").checked})}catch{}finally{e.connect.textContent=s.unsafe?"Reconectar":"Conectar",c(!1),h()}}),e.disconnect.addEventListener("click",()=>s.disconnect()),e.estop.addEventListener("click",()=>s.emergencyStop());function h(){const{state:d}=s,g={disconnected:"sin conexión",connecting:"conectando",connected:"conectado",disconnecting:"desconectando",error:"error"};e.state.textContent=g[d]??d,e.state.className=`badge st-${d}`;const b=s.connected;e.disconnect.disabled=!(b||s.unsafe),e.estop.disabled=!b,e.transport.disabled=b,e.connect.disabled=b||d==="connecting",e.connect.textContent=s.unsafe?"Reconectar":"Conectar",e.unsafe.hidden=!s.unsafe,s.unsafe&&(e.unsafe.textContent="Estado inseguro: se perdió el enlace con el hub o el watchdog detectó que no respondía. Los controles están deshabilitados. Comprueba que los motores estén parados y reconecta."),document.querySelector("#card-sim").hidden=s.kind!=="simulated",b||(e.battery.textContent="—",s.unsafe||(e.name.textContent="—"))}s.subscribe((d,g)=>{if(d==="state"&&h(),d==="battery"&&(e.battery.textContent=`${g.percent} %`),d==="hubname"&&(e.name.textContent=g.name),d==="ports")for(const b of["A","B"])u(`#port-${b}`).textContent=g.ports[b.toLowerCase()]??"—"}),h(),setInterval(()=>s.refreshBattery(),3e4)}const gn=300;function bn(s=u("#console")){function e(t,n){const r=new Date().toLocaleTimeString(),o=v("li",{class:`lvl-${t}`},v("time",{},r)," ",n);for(s.append(o);s.children.length>gn;)s.firstChild.remove();s.scrollTop=s.scrollHeight}return u("#console-clear").addEventListener("click",()=>{s.replaceChildren()}),{log:e}}const wn=[["Apagado","off","#1a1a1a"],["Rosa","pink","#ff6ec7"],["Morado","purple","#8a2be2"],["Azul","blue","#1e5cff"],["Azul claro","light_blue","#00d5e0"],["Verde claro","light_green","#00b894"],["Verde oscuro","dark_green","#0a7d34"],["Amarillo","yellow","#ffd400"],["Naranja","orange","#ff8a00"],["Rojo","red","#e5251b"],["Blanco","white","#ffffff"]],yn=s=>[1,3,5].map(e=>parseInt(s.slice(e,e+2),16));function En(s){const e=u("#motors"),t={};for(const l of["A","B"]){const p=v("input",{type:"range",min:-100,max:100,step:1,value:0,"aria-label":`Velocidad motor ${l}`}),y=v("output",{},"0"),E=v("button",{class:"primary"},"Girar"),$=v("button",{},"Parar"),q=v("button",{title:"Invertir dirección"},"⇄");p.addEventListener("input",()=>{y.textContent=p.value}),E.addEventListener("click",()=>s.run(`Motor ${l}: ${p.value}`,pe=>pe.motor(l).run(Number(p.value)))),$.addEventListener("click",()=>{p.value=0,y.textContent="0",s.run(`Motor ${l}: parar`,pe=>pe.motor(l).stop())}),q.addEventListener("click",()=>{p.value=-p.value,y.textContent=p.value}),e.append(v("div",{class:"motor","data-port":l},v("div",{class:"motor-head"},v("strong",{},`Motor ${l}`),v("span",{class:"dev",id:`dev-${l}`},"")),p,y,q,E,$)),t[l]={slider:p,run:E,stop:$,rev:q}}const n=v("button",{class:"primary"},"A+B: girar"),r=v("button",{},"A+B: parar");n.addEventListener("click",()=>{const l=Number(t.A.slider.value);s.run(`Motores A y B: ${l}`,async p=>{await p.motor("A").run(l),await p.motor("B").run(l)})}),r.addEventListener("click",()=>s.run("Motores A y B: parar",async l=>{await l.motor("A").stop(),await l.motor("B").stop()})),e.append(v("div",{class:"row"},n,r));const o=u("#led-presets");for(const[l,p,y]of wn)o.append(v("button",{class:"swatch",style:`background:${y}`,title:l,"aria-label":l,onclick:()=>{u("#led-state").textContent=l,s.run(`LED: ${l}`,E=>E.led.color(p))}}));u("#led-rgb").addEventListener("change",l=>{const[p,y,E]=yn(l.target.value);u("#led-state").textContent=`RGB ${p},${y},${E}`,s.run(`LED: rgb(${p}, ${y}, ${E})`,$=>$.led.color(p,y,E))}),u("#led-off").addEventListener("click",()=>{u("#led-state").textContent="apagado",s.run("LED: apagar",l=>l.led.color(0,0,0))});const i=()=>[...Object.values(t).flatMap(l=>[l.slider,l.run,l.stop,l.rev]),n,r,u("#led-rgb"),u("#led-off"),...o.querySelectorAll("button")];function a(l=c()){const p=s.connected;se(i(),p);for(const E of["A","B"]){const $=l[E.toLowerCase()]==="motor";se(Object.values(t[E]),p&&$);const q=l[E.toLowerCase()];u(`#dev-${E}`).textContent=q?`(${q})`:"(sin dispositivo)"}const y=["A","B"].filter(E=>l[E.toLowerCase()]==="motor").length;se([n,r],p&&y===2)}function c(){try{return s.connected?s.hub.ports():{}}catch{return{}}}s.subscribe((l,p)=>{if(l==="state"&&a(),l==="ports"&&a(p.ports),l==="motor"){const y=p.conn===1?"A":p.conn===2?"B":null;y&&p.speed===0&&Number(t[y].slider.value)}}),a();const h=u("#dist"),d=u("#dist-meter"),g=u("#tilt"),b=u("#button"),f=l=>{b.textContent=l?"pulsado":"suelto",b.className=`badge ${l?"st-connected":""}`};s.subscribe((l,p)=>{if(l==="button"&&f(p.pressed),l==="state"&&!s.connected&&(h.textContent=g.textContent=b.textContent="—",d.value=0),l==="ports"&&s.connected)try{f(s.hub.button.read())}catch{}});let w=!1;setInterval(async()=>{var l;if(!(w||!s.connected||(l=s.python)!=null&&l.running)){w=!0;try{const p=c();for(const y of["A","B"])try{if(p[y.toLowerCase()]==="distance"){const E=await s.hub.distance(y).read();h.textContent=E,d.value=E}else p[y.toLowerCase()]==="tilt"&&(g.textContent=await s.hub.tilt(y).read())}catch(E){E.name==="NoReadingError"?(p[y.toLowerCase()]==="distance"?h:g).textContent="sin lectura aún…":s.connected&&s._log("warn",`Sensor ${y}: ${E.message}`)}}finally{w=!1}}},300)}const vn="modulepreload",Cn=function(s,e){return new URL(s,e).href},qe={},Nn=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){const i=document.getElementsByTagName("link"),a=document.querySelector("meta[property=csp-nonce]"),c=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(t.map(h=>{if(h=Cn(h,n),h in qe)return;qe[h]=!0;const d=h.endsWith(".css"),g=d?'[rel="stylesheet"]':"";if(!!n)for(let w=i.length-1;w>=0;w--){const l=i[w];if(l.href===h&&(!d||l.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${g}`))return;const f=document.createElement("link");if(f.rel=d?"stylesheet":vn,d||(f.as="script"),f.crossOrigin="",f.href=h,c&&f.setAttribute("nonce",c),document.head.appendChild(f),d)return new Promise((w,l)=>{f.addEventListener("load",w),f.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${h}`)))})}))}function o(i){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=i,window.dispatchEvent(a),!a.defaultPrevented)throw i}return r.then(i=>{for(const a of i||[])a.status==="rejected"&&o(a.reason);return e().catch(o)})},kn=`"""wedo: control del LEGO WeDo 2.0 Smart Hub desde Python.

    from wedo import Hub

    with Hub() as hub:
        hub.led.color("green")
        hub.motor("A").run(50)
        hub.task.wait(2)
        hub.motor("A").stop()

La API es síncrona en apariencia: la cooperación se expresa con las esperas de
\`\`hub.task\`\` y las de los recursos (\`\`wait_change\`\`), no con corrutinas.
"""
from .button import Button
from .exceptions import (
    ConnectionFailedError,
    NoReadingError,
    NotConnectedError,
    PortError,
    TaskCancelled,
    WedoError,
)
from .hub import Hub
from .led import LED
from .motor import Motor
from .sensors import DistanceSensor, TiltAxis, TiltSensor
from .task import Task, TaskNamespace

__version__ = "0.2.0"

__all__ = [
    "Hub",
    "Motor",
    "DistanceSensor",
    "TiltSensor",
    "TiltAxis",
    "Button",
    "LED",
    "Task",
    "WedoError",
    "NotConnectedError",
    "ConnectionFailedError",
    "PortError",
    "NoReadingError",
    "TaskCancelled",
    "__version__",
]
`,Tn=`"""Puente síncrono entre la API Python de Wedo y la API JavaScript de la aplicación.

Funciona con Pyodide + JSPI (Chrome >= 137): \`\`run_sync\`\` bloquea el programa Python hasta que
la promesa de JavaScript se resuelve, sin congelar la página. Así, los programas escritos de
forma síncrona funcionan sin cambios.

El botón «Detener» del editor activa una bandera: la siguiente llamada del programa al hub o
a una espera lanza \`\`KeyboardInterrupt\`\` (igual que Ctrl+C).

Regla de oro para la cancelación (aprendido con trazas en Pyodide): JAMÁS se rechaza una
promesa cuyo resultado espera \`\`run_sync\`\` — eso deja continuaciones de pila huérfanas. Las
esperas se **resuelven** con un marcador ("ok" | "cancelled" | "stopped") y el código Python,
de vuelta, lanza la excepción en su propia pila (véase \`\`wedo.task\`\`).
"""
import js
from pyodide.ffi import JsException, run_sync

from .exceptions import (
    ConnectionFailedError,
    NoReadingError,
    NotConnectedError,
    PortError,
    TaskCancelled,
    WedoError,
)

# Errores de JavaScript -> excepciones de la API.
_JS_ERRORS = {
    "WedoError": WedoError,
    "NotConnectedError": NotConnectedError,
    "ConnectionFailedError": ConnectionFailedError,
    "PortError": PortError,
    "NoReadingError": NoReadingError,
    "HubDisconnectedError": NotConnectedError,
    "InvalidStateError": NotConnectedError,
    "HubConnectionError": ConnectionFailedError,
    "DeviceNotFoundError": PortError,
    "DeviceTypeError": PortError,
    "AmbiguousDeviceError": WedoError,
    "UnsupportedFeatureError": WedoError,
    "OperationTimeout": WedoError,
    "TaskCancelled": TaskCancelled,
}


def _bridge():
    return js.wedoBridge


def hub():
    """El hub de JavaScript (el que está conectado en el panel)."""
    js_hub = _bridge().getHub()
    if js_hub is None or js_hub is js.undefined:
        raise NotConnectedError("no hay ningún hub conectado en el panel")
    return js_hub


def check_stop():
    """Un solo disparo, como Ctrl+C: la limpieza del programa (finally) puede llamar al hub."""
    if _bridge().stopRequested():
        raise KeyboardInterrupt("programa detenido desde el editor")


def convert(exc):
    """JsException -> excepción Python equivalente."""
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
    """Llamada JavaScript síncrona (una función o un método; puede lanzar)."""
    check_stop()
    try:
        return fn(*args)
    except JsException as exc:
        raise convert(exc) from None


def get(obj, name):
    """Propiedad de un objeto JavaScript."""
    check_stop()
    try:
        return getattr(obj, name)
    except JsException as exc:
        raise convert(exc) from None


def wait(awaitable):
    """Bloquea hasta que una promesa de JavaScript se resuelva; devuelve su valor.

    «Detener» no rechaza nada: si la promesa despertó antes de tiempo porque el usuario
    pulsó «Detener», la bandera sigue levantada y \`\`check_stop()\`\` la convierte aquí en
    KeyboardInterrupt, en puro Python (sin cruzar la frontera JSPI). Una cancelación de
    tarea (\`\`TaskCancelled\`\`) sí llega como JsException con nombre TaskCancelled.
    """
    check_stop()
    try:
        result = run_sync(awaitable)
    except JsException as exc:
        raise convert(exc) from None
    check_stop()
    return result


def sleep(seconds):
    """Suspenso del programa: cede a la página y admite «Detener».

    La promesa de JavaScript se despierta antes de tiempo al pulsar «Detener» (resolución
    normal, sin rechazar); \`\`check_stop()\`\` tras volver de \`\`run_sync\`\` lanza aquí el
    KeyboardInterrupt, en puro Python.
    """
    return wait(js.wedoBridge.sleep(seconds))
`,xn=`"""Botón integrado del hub (API v0.2.0): \`\`hub.button\`\`.

    hub.button.read()                    -> bool
    hub.button.has_change("pressed")     -> bool (consume los cambios pendientes)
    hub.button.wait_change("released")   -> str  (tipo consumido)

Los cambios pendientes se conservan por tipo: una pulsación breve entre dos consultas no
se pierde; quedan pendientes "pressed" y "released".
"""
from . import _bridge


class Button:
    """Botón del hub: está integrado, no se selecciona por puerto."""

    def __init__(self, js_button) -> None:
        self._js = js_button

    def read(self) -> bool:
        """True si el botón está presionado."""
        return bool(_bridge.call(self._js.read))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("pressed" / "released")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return "Button()"
`,Sn=`"""Excepciones públicas de la API Wedo.

- \`\`WedoError\`\`: base de todos los errores de la API.
- \`\`NotConnectedError\`\`: se usa un recurso con el hub desconectado, o se pierde la
  conexión durante una espera.
- \`\`ConnectionFailedError\`\`: el intento de conexión falló o fue rechazado.
- \`\`PortError\`\`: el puerto está vacío o tiene un periférico de otro tipo.
- \`\`NoReadingError\`\`: todavía no hay una lectura válida del dispositivo.

\`\`TaskCancelled\`\` deriva de \`\`BaseException\`\` (no de \`\`WedoError\`\`): un \`\`except
Exception\`\` no debe capturar por accidente la cancelación de una tarea.
"""

__all__ = [
    "WedoError",
    "NotConnectedError",
    "ConnectionFailedError",
    "PortError",
    "NoReadingError",
    "TaskCancelled",
]


class WedoError(Exception):
    """Base de los errores de la API Wedo."""


class NotConnectedError(WedoError):
    """El hub no está conectado (o se perdió la conexión durante una espera)."""


class ConnectionFailedError(WedoError):
    """El intento de conexión falló o fue rechazado."""


class PortError(WedoError):
    """El puerto está vacío o tiene un periférico de otro tipo."""


class NoReadingError(WedoError):
    """Todavía no hay una lectura válida del dispositivo."""


class TaskCancelled(BaseException):
    """La tarea fue cancelada.

    Deriva de \`\`BaseException\`\` a propósito: un \`\`except Exception\`\` no debe capturarla
    por accidente. Si se captura, hay que volver a lanzarla.
    """
`,An=`"""El hub Wedo (LEGO WeDo 2.0 Smart Hub) (API v0.2.0).

    from wedo import Hub

    with Hub() as hub:
        hub.motor("A").run(50)
        hub.task.wait(2)
        hub.motor("A").stop()

Crear un \`\`Hub\`\` no conecta: hay que llamar a \`\`connect()\`\` (que solo inicia el intento) y
esperar con \`\`wait_connection()\`\`, o usar el bloque \`\`with\`\`, que hace ambas cosas y además
espera a las tareas y para los motores al salir.

Las diferencias con la biblioteca de escritorio (que usa Bluetooth en el sistema) son:

* La conexión la inicia el panel del navegador: el selector de Bluetooth necesita un clic
  del usuario, así que \`\`connect()\`\` no puede abrirlo desde el programa.
* \`\`Hub()\`\` usa el hub ya conectado en el panel (real o simulado).
* El botón «Detener» del editor equivale a Ctrl+C: interrumpe el programa.
"""
from . import _bridge
from .button import Button
from .exceptions import ConnectionFailedError
from .led import LED
from .motor import Motor
from .sensors import DistanceSensor, TiltSensor
from .task import TaskNamespace


def _timeout(name, value):
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError("%s must be a number, not %s" % (name, type(value).__name__))
    if value != value or value in (float("inf"), float("-inf")) or value < 0:
        raise ValueError("%s must be a finite number >= 0, got %r" % (name, value))
    return float(value)


def _port(port):
    if not isinstance(port, str):
        raise TypeError("port must be 'A' or 'B', not %s" % type(port).__name__)
    if port.upper() not in ("A", "B"):
        raise ValueError("port must be 'A' or 'B', got %r" % port)
    return port


class Hub:
    """El dispositivo Wedo.

    \`\`connect_timeout\`\` es el tiempo máximo, en segundos, que \`\`with Hub() as hub\`\` espera
    a que se complete la conexión (\`\`None\`\` espera indefinidamente).
    """

    def __init__(self, *, connect_timeout: float | None = 10.0) -> None:
        self._js = _bridge.hub()
        self._connect_timeout = _timeout("connect_timeout", connect_timeout)
        self._led = LED(self._js.led)
        self._button = Button(self._js.button)
        self._task = TaskNamespace(self._js.task)

    # -- ciclo de vida ------------------------------------------------------------------

    def connect(self) -> None:
        """Inicia el intento de conexión y regresa de inmediato."""
        _bridge.call(self._js.connect)

    def wait_connection(self, timeout: float | None = None) -> bool:
        """Espera a que el hub esté conectado.

        Devuelve \`\`True\`\` si se conectó y \`\`False\`\` si se agotó el tiempo. Si el intento
        falló, lanza \`\`ConnectionFailedError\`\`.
        """
        limit = _timeout("timeout", timeout)
        return bool(_bridge.wait(_bridge.call(self._js.waitConnection, limit)))

    def disconnect(self) -> None:
        """Cierra la conexión (parando antes los motores)."""
        _bridge.wait(self._js.disconnect())

    def ports(self) -> dict[str, str]:
        """Instantánea de los puertos: \`\`{"a": "motor", "b": "distance"}\`\`.

        Los nombres van en minúsculas. El botón y el LED están integrados y no aparecen.
        """
        return _bridge.call(self._js.ports).to_py()

    # -- periféricos --------------------------------------------------------------------

    def motor(self, port: str) -> Motor:
        """Un motor en el puerto indicado. No exige conexión."""
        return Motor(_bridge.call(self._js.motor, _port(port)), _port(port).lower())

    def distance(self, port: str) -> DistanceSensor:
        """Un sensor de distancia en el puerto indicado. No exige conexión."""
        return DistanceSensor(_bridge.call(self._js.distance, _port(port)), _port(port).lower())

    def tilt(self, port: str) -> TiltSensor:
        """Un sensor de inclinación en el puerto indicado. No exige conexión."""
        return TiltSensor(_bridge.call(self._js.tilt, _port(port)), _port(port).lower())

    @property
    def led(self) -> LED:
        """El LED integrado del hub."""
        return self._led

    @property
    def button(self) -> Button:
        """El botón integrado del hub."""
        return self._button

    @property
    def task(self) -> TaskNamespace:
        """La concurrencia cooperativa: \`\`spawn\`\` y \`\`wait\`\`."""
        return self._task

    # -- gestor de contexto ---------------------------------------------------------------

    def __enter__(self) -> "Hub":
        self.connect()
        if not self.wait_connection(self._connect_timeout):
            try:
                self.disconnect()
            except Exception:
                pass
            detail = ""
            if self._connect_timeout is not None:
                detail = " (tiempo de espera agotado: %g s)" % self._connect_timeout
            raise ConnectionFailedError("no se pudo conectar con el hub" + detail)
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        # Al salir: esperar a las tareas (o cancelarlas si hubo excepción) y parar los
        # motores. Nunca se suprime la excepción que provocó la salida.
        # La conexión NO se cierra aquí: en el navegador el enlace del hub es del panel
        # de la aplicación, no del programa (el botón «Desconectar» es quien lo cierra).
        try:
            if exc_type is None:
                _bridge.wait(_bridge.call(self._js.task.allSettled))
            else:
                _bridge.call(self._js.task.cancelAll)
                try:
                    _bridge.wait(_bridge.call(self._js.task.allSettled))
                except Exception:
                    pass
        finally:
            try:
                _bridge.wait(self._js.stopAll())
            except Exception:
                pass

    def __repr__(self) -> str:
        return "Hub()"
`,Dn=`"""LED integrado del hub (API v0.2.0): \`\`hub.led\`\`.

    hub.led.color("green")     # color predefinido por nombre
    hub.led.color(255, 0, 0)   # color absoluto (canales 0..255)

El catálogo de colores predefinidos es el del firmware real (comprobado en hardware): el
índice 5 es el verde claro y el 6 el verde puro, así que a partir del 5 todo va desplazado
uno respecto a la tabla que circulaba por la documentación de LEGO.
"""
from . import _bridge


def _channel(name, value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError("%s must be an integer, not %s" % (name, type(value).__name__))
    if not 0 <= value <= 255:
        raise ValueError("%s must be in 0..255, got %r" % (name, value))
    return value


class LED:
    """LED multicolor del hub: está integrado, no se selecciona por puerto."""

    def __init__(self, js_led) -> None:
        self._js = js_led

    def color(self, name_or_red, green=None, blue=None) -> None:
        """Color predefinido por nombre o color absoluto (r, g, b)."""
        if green is None and blue is None:
            if not isinstance(name_or_red, str):
                raise TypeError(
                    "color() needs a colour name or three RGB channels, not %s"
                    % type(name_or_red).__name__
                )
            _bridge.wait(self._js.color(name_or_red))
            return
        if green is None or blue is None:
            raise TypeError("color() takes either a colour name or three RGB channels")
        _bridge.wait(self._js.color(
            _channel("red", name_or_red),
            _channel("green", green),
            _channel("blue", blue),
        ))

    def __repr__(self) -> str:
        return "LED()"
`,Ln=`"""Motores (API v0.2.0).

    motor = hub.motor("A")
    motor.run(50)      # -100..100: el signo es el sentido, el valor absoluto la intensidad
    motor.stop()        # alias de run(0)

No hay grupo de motores: para actuar sobre los dos se hacen dos llamadas explícitas.
"""
from . import _bridge


def _number(name, value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError("%s must be a number, not %s" % (name, type(value).__name__))
    return value


class Motor:
    """Un motor en el puerto indicado."""

    def __init__(self, js_motor, port: str) -> None:
        self._js = js_motor
        self.port = port

    def run(self, value: float) -> None:
        """Fija la velocidad lógica, de -100 a 100."""
        _bridge.wait(_bridge.call(self._js.run, _number("value", value)))

    def stop(self) -> None:
        """Pide parar el motor (alias de \`\`run(0)\`\`)."""
        _bridge.wait(self._js.stop())

    def __repr__(self) -> str:
        return "Motor(%r)" % self.port
`,Rn=`"""Sensores de distancia e inclinación (API v0.2.0).

    distance = hub.distance("A")
    distance.read()                      # cm enteros 0..10
    distance.has_change("increase")      # consume los cambios pendientes
    distance.wait_change("decrease")     # espera un cambio y devuelve su tipo

    tilt = hub.tilt("B")
    tilt.read()                          # "left" | "right" | "forward" | "backward" | "none"
    tilt.x.read()                        # grados enteros -45..45
    tilt.x.has_change("increase")

El sensor de inclinación es un interruptor de 4 posiciones, no un acelerómetro: el
firmware solo notifica cuando el valor cambia.
"""
from . import _bridge


class DistanceSensor:
    """Sensor de distancia: valores enteros normalizados 0..10."""

    def __init__(self, js_sensor, port: str) -> None:
        self._js = js_sensor
        self.port = port

    def read(self) -> int:
        """Distancia en centímetros (0..10)."""
        return int(_bridge.wait(self._js.read()))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("increase" / "decrease")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return "DistanceSensor(%r)" % self.port


class TiltAxis:
    """Un eje del sensor de inclinación (recurso independiente)."""

    def __init__(self, js_axis, port: str, name: str) -> None:
        self._js = js_axis
        self.port = port
        self.name = name

    def read(self) -> int:
        """Ángulo del eje en grados (-45..45)."""
        return int(_bridge.wait(self._js.read()))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("increase" / "decrease")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return "TiltAxis(%r, %r)" % (self.port, self.name)


class TiltSensor:
    """Sensor de inclinación: dirección y ejes."""

    def __init__(self, js_sensor, port: str) -> None:
        self._js = js_sensor
        self.port = port
        self._x = TiltAxis(js_sensor.x, port, "x")
        self._y = TiltAxis(js_sensor.y, port, "y")

    def read(self) -> str:
        """Dirección actual: "left", "right", "forward", "backward" o "none"."""
        return str(_bridge.wait(self._js.read()))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios de dirección pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio de dirección y devuelve su tipo."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    @property
    def x(self) -> TiltAxis:
        """Eje X del sensor."""
        return self._x

    @property
    def y(self) -> TiltAxis:
        """Eje Y del sensor."""
        return self._y

    def __repr__(self) -> str:
        return "TiltSensor(%r)" % self.port
`,On=`"""Concurrencia cooperativa (API v0.2.0): \`\`hub.task\`\`.

    task = hub.task.spawn(movement)   # movement es un invocable sin parámetros
    hub.task.wait(1)                   # suspende el flujo actual
    task.cancel()                      # cancelación cooperativa
    task.join()                        # espera a que termine

La cancelación se entrega como la excepción \`\`TaskCancelled\`\` dentro de la tarea, en su
siguiente punto cooperativo (\`\`wait\`\`, \`\`wait_change\`\`, \`\`wait_connection\`\`, \`\`join\`\`).
La cancelación es persistente: después del pedido, todo punto cooperativo posterior de esa
tarea vuelve a lanzarla (así los bloques \`\`finally\`\` no pueden quedarse esperando). Como
\`\`TaskCancelled\`\` deriva de \`\`BaseException\`\`, un \`\`except Exception\`\` no la captura por
accidente: si se captura, hay que volver a lanzarla.

En el navegador cada tarea corre en su propia pila de Python, de modo que varias tareas se
alternan de verdad mientras una espera. Si una tarea falla con una excepción no capturada,
el runtime lo informa por el registrador \`\`"wedo"\`\` (nivel ERROR, con traceback) y no
propaga el error a quien la creó.
"""
import logging
import sys

from . import _bridge
from .exceptions import TaskCancelled

_log = logging.getLogger("wedo")

# Tareas vivas por id (para poder comprobar la cancelación).
_tasks = {}


def _current_task_id():
    """Id de la tarea que está ejecutando la pila actual (\`\`None\`\` en el flujo principal).

    Cada tarea corre en su propia pila de Python, así que el local \`\`_wedo_task_id\`\` de su
    frame se encuentra recorriendo la cadena de frames.
    """
    frame = sys._getframe(1)
    while frame is not None:
        task_id = frame.f_locals.get("_wedo_task_id")
        if task_id is not None:
            return task_id
        frame = frame.f_back
    return None


def _check_cancelled(task_id):
    """Si la tarea fue cancelada, lanza \`\`TaskCancelled\`\` (la cancelación es persistente)."""
    if task_id is None:
        return
    task = _tasks.get(task_id)
    if task is not None and task.cancelled:
        raise TaskCancelled("la tarea fue cancelada")


def _check_cooperative(task_id):
    """Los puntos cooperativos solo existen en el flujo principal o dentro de una tarea.."""
    if task_id is None:
        return
    # Dentro de una tarea la cancelación pendiente se comprueba en el punto de espera.
    _check_cancelled(task_id)


def _number(name, value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError("%s esperaba un número y recibió %s" % (name, type(value).__name__))
    return value


def _seconds(value):
    """Validación del argumento de \`\`wait\`\`/\`\`wait_connection\`\`: número finito >= 0."""
    _number("espera", value)
    if value != value or value == float("inf") or value == float("-inf") or value < 0:
        raise ValueError(
            "hub.task: wait esperaba un número mayor o igual que 0 y recibió %r" % (value,)
        )
    return float(value)


class Task:
    """Una tarea concurrente creada con \`\`hub.task.spawn\`\`."""

    def __init__(self, manager, function) -> None:
        self._manager = manager
        self._function = function
        self._id = Task._next_id()
        self._cancelled = False
        _tasks[self._id] = self

    _counter = 0

    @classmethod
    def _next_id(cls):
        cls._counter += 1
        return cls._counter

    @property
    def id(self) -> int:
        """Identificador interno de la tarea."""
        return self._id

    @property
    def cancelled(self) -> bool:
        """True si se pidió su cancelación."""
        return self._cancelled

    def _entry(self):
        # Local del frame: \`\`_current_task_id()\`\` lo encuentra al recorrer la pila.
        _wedo_task_id = self._id
        try:
            self._function()
        except (TaskCancelled, KeyboardInterrupt):
            raise  # la cancelación no es un error de ejecución: no se notifica
        except BaseException:
            # Fallo de la tarea: se informa por logging (with traceback) y el error no
            # se propaga a quien la creó (spawn); el_join() del que espera no la relanza.
            _log.exception("la tarea %d falló", self._id)
            raise
        finally:
            del _wedo_task_id

    def cancel(self) -> None:
        """Solicita cancelar la tarea (cooperativa y persistente)."""
        self._cancelled = True
        _bridge.call(self._manager.cancel, self._id)

    def join(self) -> None:
        """Espera a que la tarea termine (no propaga su excepción)."""
        task_id = _current_task_id()
        if task_id == self._id:
            raise RuntimeError("una tarea no puede unirse a sí misma")
        _resolve_marker(_bridge.wait(_bridge.call(self._manager.join, self._id, task_id)))
        _check_cancelled(task_id)

    def __repr__(self) -> str:
        return "Task(%d)" % self._id


def _resolve_marker(marker) -> None:
    """Traduce el marcador de una espera ("ok" | "cancelled" | "stopped") a su excepción.

    El marcador llega en la resolución del lado JavaScript (nunca se rechaza la promesa
    a través de \`\`run_sync\`\`): la excepción se lanza AQUÍ, ya en la pila Python de la
    tarea, con lo cual los bloques \`\`finally\`\` sí se ejecutan.
    """
    name = marker if isinstance(marker, str) else str(marker) if marker is not None else "ok"
    if name == "cancelled":
        raise TaskCancelled("la tarea fue cancelada")
    if name == "stopped":
        raise KeyboardInterrupt("programa detenido desde el editor")


class TaskNamespace:
    """El espacio de nombres \`\`hub.task\`\`."""

    def __init__(self, manager) -> None:
        self._manager = manager

    def spawn(self, function) -> Task:
        """Crea y programa una tarea; devuelve su referencia."""
        if not callable(function):
            raise TypeError("spawn() needs a callable, not %s" % type(function).__name__)
        task = Task(self._manager, function)
        _bridge.call(self._manager.spawn, task._id, task._entry)
        return task

    def wait(self, seconds: float) -> None:
        """Suspende la ejecución actual durante \`\`seconds\`\` segundos (cooperativo)."""
        task_id = _current_task_id()
        _resolve_marker(_bridge.wait(_bridge.call(self._manager.wait, task_id, _seconds(seconds))))
        _check_cancelled(task_id)
`,In=Object.assign({"./wedo/__init__.py":kn,"./wedo/_bridge.py":Tn,"./wedo/button.py":xn,"./wedo/exceptions.py":Sn,"./wedo/hub.py":An,"./wedo/led.py":Dn,"./wedo/motor.py":Ln,"./wedo/sensors.py":Rn,"./wedo/task.py":On}),Pn=`
import time
from wedo import _bridge
time.sleep = _bridge.sleep   # sleep cooperativo: cede a la página y admite «Detener»
`;class $n{constructor({getHub:e,onOutput:t=()=>{},loader:n,indexURL:r}){this._getHub=e,this._out=t,this._loader=n,this._indexURL=r,this.py=null,this._loading=null,this._stop=!1,this._running=!1,this._sleepers=new Set,this._current=null}get running(){return this._running}get ready(){return this.py!==null}init(e=()=>{}){return this._loading??(this._loading=this._init(e).catch(t=>{throw this._loading=null,t})),this._loading}async _init(e){e("Cargando Python (solo la primera vez)…");const{loadPyodide:t}=await this._loader(),n=await t(this._indexURL?{indexURL:this._indexURL}:{});if(!await n.runPythonAsync(`from pyodide.ffi import can_run_sync
can_run_sync()`))throw new le("Este navegador no admite JSPI (WebAssembly JavaScript Promise Integration), necesario para ejecutar programas Python síncronos. Usa Chrome o Edge 137 o posterior.");n.setStdout({batched:o=>this._out("stdout",o)}),n.setStderr({batched:o=>this._out("stderr",o)}),n.FS.mkdirTree("/home/pyodide/wedo");for(const[o,i]of Object.entries(In))n.FS.writeFile(`/home/pyodide/wedo/${o.split("/").pop()}`,i);return globalThis.wedoBridge={getHub:()=>this._getHub()??void 0,stopRequested:()=>{const o=this._stop;return this._stop=!1,o},sleep:o=>new Promise(i=>{const a=()=>{clearTimeout(c),this._sleepers.delete(a),i()},c=setTimeout(a,o*1e3);this._sleepers.add(a),this._stop&&a()})},await n.runPythonAsync(`import asyncio
asyncio.get_event_loop()._keyboard_interrupt_handler = lambda: None`),await n.runPythonAsync(Pn),this.py=n,e("Python listo."),n}async run(e){if(this._running){this.stop();try{await this._current}catch{}this._stop=!1}if(await this.init(),this._running){this.stop();try{await this._current}catch{}this._stop=!1}return this._running=!0,this._stop=!1,this._current=this._execute(e),this._current}async _execute(e){const t=this.py.globals.get("dict")();try{return await this.py.runPythonAsync(e,{globals:t}),{ok:!0,stopped:!1,error:null}}catch(n){if((n==null?void 0:n.type)==="KeyboardInterrupt")return{ok:!1,stopped:!0,error:null};const r=(n==null?void 0:n.message)??String(n);return this._out("stderr",r.endsWith(`
`)?r:`${r}
`),{ok:!1,stopped:!1,error:r}}finally{this._running=!1,t.destroy();const n=this._getHub();if(n!=null&&n.isConnected)try{await n.stopAll()}catch{}}}stop(){var e,t,n;if(this._running){this._stop=!0;for(const r of[...this._sleepers])r();try{(n=(t=(e=this._getHub())==null?void 0:e.task)==null?void 0:t.interruptAll)==null||n.call(t)}catch{}}}}function jn(s="./"){const e=`${new URL(`${s}pyodide/`,globalThis.location.href).href}`;return{indexURL:e,loader:()=>Nn(()=>import(`${e}pyodide.mjs`),[],import.meta.url)}}const Y=s=>s.replace(/[&<>]/g,e=>e==="&"?"&amp;":e==="<"?"&lt;":"&gt;"),Bn=new Set(["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield","match","case"]),qn=new Set(["True","False","None","self","cls"]),Un=new Set(["print","len","range","input","open","str","int","float","bool","bytes","list","dict","set","tuple","frozenset","abs","min","max","round","sum","sorted","reversed","enumerate","zip","map","filter","any","all","isinstance","issubclass","type","object","super","dir","repr","hash","hex","oct","bin","ord","chr","divmod","pow","format","id","getattr","setattr","hasattr","callable","iter","next","Exception","KeyboardInterrupt","ValueError","TypeError","RuntimeError","IndexError","KeyError","AttributeError","OSError","StopIteration","ZeroDivisionError","TimeoutError"]),Ce=/(?<cmt>#.*)|(?<str>"""[\s\S]*?"""|'''[\s\S]*?'''|(?:[fFrRbBuU]{0,2})"(?:\\[\s\S]|[^"\\\n])*"|(?:[fFrRbBuU]{0,2})'(?:\\[\s\S]|[^'\\\n])*')|(?<dec>@[\w.]+)|(?<num>\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?|\.\d+(?:[eE][+-]?\d+)?)\b)|(?<id>[^\W\d]\w*)|(?<ws>[ \t]+)|(?<any>[\s\S])/g;function Mn(s){Ce.lastIndex=0;let e="",t=0,n;for(;n=Ce.exec(s);){n.index>t&&(e+=Y(s.slice(t,n.index))),t=n.index+n[0].length;const r=n.groups;let o=null,i=n[0];if(r.cmt)o="cmt";else if(r.str)o="str";else if(r.dec)o="dec";else if(r.num)o="num";else if(r.id){const a=r.id;if(i=a,Bn.has(a))o="kw";else if(qn.has(a))o="kw2";else if(Un.has(a))o="builtin";else{let c=Math.min(s.length,n.index+a.length);for(;c<s.length&&(s[c]===" "||s[c]==="	");)c+=1;s[c]==="("&&(o="fn")}}e+=o?`<span class="${o}">${Y(i)}</span>`:Y(i),n[0].length===0&&(Ce.lastIndex+=1)}return t<s.length&&(e+=Y(s.slice(t))),e}function Fn({host:s,onChange:e=()=>{}}){const t=v("div",{class:"py-gutter","aria-hidden":"true"}),n=v("div",{class:"py-surface"}),r=v("pre",{class:"py-hl","aria-hidden":"true"}),o=v("textarea",{id:"py-code",class:"py-input",wrap:"off",spellcheck:"false",autocapitalize:"off",autocorrect:"off","aria-label":"Código Python"});n.append(r,o),s.classList.add("py-editor"),s.append(t,n);function i(){const c=o.value;r.innerHTML=Mn(c)+(c.endsWith(`
`)?"":`
`);const h=c.split(`
`).length;let d="";for(let g=1;g<=h;g+=1)d+=`<span>${g}</span>`;t.innerHTML=d,t.scrollTop=o.scrollTop}function a(){r.scrollTop=o.scrollTop,r.scrollLeft=o.scrollLeft,t.scrollTop=o.scrollTop}return o.addEventListener("input",()=>{i(),e(o.value)}),o.addEventListener("scroll",a),o.addEventListener("keydown",c=>{if(c.key!=="Tab")return;c.preventDefault();const{selectionStart:h,selectionEnd:d}=o;o.setRangeText("    ",h,d,"end"),o.dispatchEvent(new Event("input"))}),i(),{textarea:o,setValue(c){o.value=c,i()},getValue(){return o.value},focus(){o.focus()}}}function re(s){return`${String(s??"").trim().replace(/[\\/:*?"<>| -]+/g,"-").replace(/^\.+/,"").slice(0,80).replace(/\.py$/i,"")||"mi_programa"}.py`}function Wn(s="mi_programa.py"){const e=document.querySelector("#dlg-export"),t=document.querySelector("#export-name"),n=document.querySelector("#export-form"),r=document.querySelector("#export-cancel");return!e||!t||!n?Promise.resolve(re(s)):(t.value=re(s),e.showModal(),t.focus(),t.select(),new Promise(o=>{const i=()=>{const a=e.returnValue==="ok";o(a?re(t.value):null)};n.addEventListener("submit",a=>{a.preventDefault(),e.close("ok")},{once:!0}),r==null||r.addEventListener("click",()=>e.close("cancel"),{once:!0}),e.addEventListener("close",i,{once:!0})}))}function Hn(s,e="mi_programa.py"){const t=new Blob([s],{type:"text/x-python;charset=utf-8"}),n=URL.createObjectURL(t),r=Object.assign(document.createElement("a"),{href:n,download:e});document.body.append(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function zn(s,e=t=>{throw t}){const t=Object.assign(document.createElement("input"),{type:"file",accept:".py,text/x-python"});t.addEventListener("change",async()=>{var r;const n=(r=t.files)==null?void 0:r[0];if(n)try{s(await n.text(),n.name)}catch(o){e(o)}}),t.click()}const Ue="wedopy.python.program",Ne="wedopy.python.fileName",Me="wedopy.python.fontSize",Fe="mi_programa.py",We=10,He=18,ze=1;function Gn(s){const e=u("#btn-font-down"),t=u("#btn-font-up");if(!e||!t)return;const n=()=>parseFloat(getComputedStyle(s).getPropertyValue("--py-fs"))||13.5,r=()=>{const a=n();e.disabled=a<=We,t.disabled=a>=He;const c=`Tamaño del texto del código: ${a} px`;e.title=`${c} (reducir)`,t.title=`${c} (aumentar)`},o=a=>{const c=Math.min(He,Math.max(We,a));s.style.setProperty("--py-fs",`${c}px`);try{localStorage.setItem(Me,String(c))}catch{}r()};let i=null;try{i=parseFloat(localStorage.getItem(Me))}catch{}Number.isFinite(i)&&s.style.setProperty("--py-fs",`${i}px`),r(),e.addEventListener("click",()=>o(n()-ze)),t.addEventListener("click",()=>o(n()+ze))}const Vn=`"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")

    def blink():
        for _ in range(10):
            hub.led.color("yellow")
            hub.task.wait(0.3)
            hub.led.color("white")
            hub.task.wait(0.3)

    def move():
        try:                      # cancelling a task never stops the motor by itself
            motor.run(75)
            hub.task.wait(3)
        finally:
            motor.stop()

    hub.task.spawn(blink)
    hub.task.spawn(move)
    # On leaving the block, the runtime waits for every task to finish.
`;function Kn(s,{runtime:e}={}){const t=u("#py-out"),n=u("#py-status"),r=u("#py-run"),o=u("#py-stop"),i=f=>{try{localStorage.setItem(Ue,f)}catch{}},a=Fn({host:u("#py-editor"),onChange:f=>i(f)});Gn(u("#py-editor"));const c=(f,w)=>{t.append(v("span",{class:f==="stderr"?"err":""},w.endsWith(`
`)?w:`${w}
`)),t.scrollTop=t.scrollHeight},h=e??new $n({getHub:()=>s.hub,onOutput:c,...jn()});s.python=h;let d="";try{d=localStorage.getItem(Ue)??""}catch{}a.setValue(d||Vn);let g=Fe;try{g=localStorage.getItem(Ne)||Fe}catch{}u("#py-export").addEventListener("click",async()=>{const f=await Wn(g);if(!f){n.textContent="Exportación cancelada.";return}g=f;try{localStorage.setItem(Ne,f)}catch{}Hn(a.getValue(),f),n.textContent=`Programa exportado como ${f}`}),u("#py-import").addEventListener("click",()=>{zn((f,w)=>{a.setValue(f),i(f),g=re(w);try{localStorage.setItem(Ne,g)}catch{}n.textContent=`Importado «${w}» — listo para ejecutar.`},f=>{n.textContent="",c("stderr",`Importación: ${f.message}
`)})});let b=0;r.addEventListener("click",()=>{const f=++b,w=h.running;t.replaceChildren(),o.disabled=!1,w&&c("stderr",`⏹ se interrumpe el programa anterior…
`),n.textContent=w?"Interrumpiendo el programa anterior…":"Ejecutando…",h.run(a.getValue()).then(l=>{f===b&&(n.textContent=l.stopped?"Detenido.":l.ok?"Terminado.":"Terminó con error.",o.disabled=!0,l.stopped&&c("stdout","[programa detenido]"))}).catch(l=>{f===b&&(n.textContent="",c("stderr",l.message),o.disabled=!0)})}),o.addEventListener("click",()=>{h.stop()}),document.addEventListener("keydown",f=>{f.key!=="Enter"||!(f.ctrlKey||f.metaKey)||(f.preventDefault(),r.click())})}function Jn(s){const e=()=>s.sim;for(const o of["A","B"]){const i=u(`#sim-${o}`);i.value=s.simDevices[o]??"",i.addEventListener("change",()=>{const a=i.value;a?s.simDevices[o]=a:delete s.simDevices[o],!(!e()||!s.connected)&&(a?e().attach(o,a):e().detach(o),s._log("info",`Simulador: puerto ${o} → ${a||"vacío"}`))})}u("#sim-dist").addEventListener("input",o=>{var i;s.simDistance=Number(o.target.value),(i=e())==null||i.setDistance(s.simDistance)}),u("#sim-tilt").addEventListener("change",o=>{var i;return(i=e())==null?void 0:i.setTiltDirection(o.target.value)});const t=u("#sim-press"),n=()=>{var o;return(o=e())==null?void 0:o.press()},r=()=>{var o;return(o=e())==null?void 0:o.release()};t.addEventListener("pointerdown",n),t.addEventListener("pointerup",r),t.addEventListener("pointerleave",r),u("#sim-drop").addEventListener("click",()=>{var o;s._log("warn","Simulador: pérdida de enlace inyectada."),(o=e())==null||o.dropLink()}),u("#sim-freeze").addEventListener("change",o=>{var i,a;o.target.checked?(i=e())==null||i.freeze():(a=e())==null||a.unfreeze(),s._log("warn",`Simulador: hub ${o.target.checked?"sin responder (sin ACK)":"responde de nuevo"}.`)})}const Ge="wedopy.theme",Q=["auto","light","dark"],Yn={auto:"🌗",light:"☀️",dark:"🌙"},Ve={auto:"Tema del sistema (auto)",light:"Tema claro",dark:"Tema oscuro (Dracula)"},ke={light:"#f4f5fa",dark:"#282a36"};function Qn(s){let e;try{e=localStorage.getItem(Ge)}catch{}Q.includes(e)||(e="auto");const t=()=>{e==="auto"?document.documentElement.removeAttribute("data-theme"):document.documentElement.setAttribute("data-theme",e),s.textContent=Yn[e],s.setAttribute("aria-label",Ve[e]),s.title=Ve[e];for(const n of document.querySelectorAll('meta[name="theme-color"]'))n.content=e==="auto"?n.media.includes("light")?ke.light:ke.dark:ke[e==="light"?"light":"dark"]};s.addEventListener("click",()=>{e=Q[(Q.indexOf(e)+1)%Q.length];try{localStorage.setItem(Ge,e)}catch{}t()}),t()}const P=new pn,_e=bn();P.subscribe((s,e)=>{s==="log"&&_e.log(e.level,e.message)});mn(P);En(P);Jn(P);Kn(P);Qn(u("#btn-theme"));document.addEventListener("visibilitychange",()=>{document.hidden&&P.onHidden()});_e.log("info",P.supportsBluetooth?"Web Bluetooth disponible. Pulsa «Conectar» y elige tu Smart Hub.":"Web Bluetooth no disponible en este navegador: usa el simulador.");_e.log("debug",`Diagnóstico: isSecureContext=${window.isSecureContext}, navigator.bluetooth=${!!navigator.bluetooth}, origen=${location.origin}`);var X,Ke;(Ke=(X=navigator.bluetooth)==null?void 0:X.getAvailability)==null||Ke.call(X).then(s=>_e.log(s?"info":"warn",s?"Adaptador Bluetooth disponible.":"El navegador no ve ningún adaptador Bluetooth (¿servicio bluetooth apagado?).")).catch(()=>{});window.wedopyApp=P;
