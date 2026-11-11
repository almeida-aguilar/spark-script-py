var vt=Object.defineProperty;var kt=(s,e,t)=>e in s?vt(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var v=(s,e,t)=>kt(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const Ct="-1212-efde-1523-785feabcd123",Nt="-0000-1000-8000-00805f9b34fb",Xe=s=>s.toString(16).padStart(4,"0"),T=s=>`0000${Xe(s)}${Ct}`,he=s=>`0000${Xe(s)}${Nt}`;he(6144);const Tt=he(6154),xt=he(6159),Ze=T(5411),St=T(20238),G=he(10777);T(5412);const I=T(5414),x=T(5415);T(5416);T(5417);T(5418);const et=T(5419),oe=T(5422),V=T(5472);T(5473);const F=T(5475),O=T(5477),_e=1,tt=2,At=3,Dt=4,Lt=5,H=6,z=1,nt=20,st=21,rt=22,xe=23,L=34,j=35,Rt=36,ot=0,it=2,Ot=0,It=1,ie=0,at=1,Pt=0,ae=Object.freeze({[z]:"motor",[nt]:"voltage",[st]:"current",[rt]:"piezo",[xe]:"rgb-led",[L]:"tilt",[j]:"distance",[Rt]:"generic"}),$t=Object.freeze([G,x,V,F,O]),jt=Object.freeze(["LPF2 Smart Hub 2 I/O"]);class C extends Error{constructor(e,t){super(e,t),this.name=new.target.errorName}}v(C,"errorName","WedoError");class R extends C{}v(R,"errorName","BLEError");class B extends C{}v(B,"errorName","HubConnectionError");class D extends B{}v(D,"errorName","HubDisconnectedError");class W extends C{}v(W,"errorName","OperationTimeout");class Z extends C{}v(Z,"errorName","HubBusyError");class ce extends C{}v(ce,"errorName","DeviceNotFoundError");class Se extends C{}v(Se,"errorName","DeviceTypeError");class N extends C{}v(N,"errorName","InvalidStateError");class le extends C{}v(le,"errorName","UnsupportedFeatureError");class Ae extends C{}v(Ae,"errorName","NotConnectedError");class ct extends C{}v(ct,"errorName","ConnectionFailedError");class de extends C{}v(de,"errorName","PortError");class lt extends C{}v(lt,"errorName","NoReadingError");class dt extends C{}v(dt,"errorName","KeyboardUnavailableError");class M extends Error{constructor(e="task cancelled"){super(e),this.name=new.target.errorName}}v(M,"errorName","TaskCancelled");class Bt{constructor(e){this._session=e}read(){return this._session.requireUsable(),this._session.core.buttonPressed()}hasChange(e=null){this._session.requireUsable();const t=this._session.changes("button").button;return t.consume(t.checkFilter(e,"button"))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes("button").button;return t.wait(t.checkFilter(e,"button"))}toString(){return"Button()"}}const ut=Object.freeze({off:0,pink:1,purple:2,blue:3,light_blue:4,light_green:5,dark_green:6,yellow:7,orange:8,red:9,white:10}),Ut=Object.keys(ut).join(", ");function me(s,e,t=null){const n=`led${t?` (puerto "${t}")`:""}`;if(typeof e!="number"||!Number.isInteger(e))throw new TypeError(`${n}: color esperaba un entero y recibió ${typeof e}`);if(e<0||e>255)throw new RangeError(`${n}: el valor ${e} está fuera del rango 0..255`);return e}class qt{constructor(e){this._session=e}color(e,t,n){if(this._session.requireUsable(),e==null)throw new TypeError("led: color esperaba un nombre o tres canales RGB");if(typeof e=="string"){if(t!==void 0||n!==void 0)throw new TypeError("led: color admite un nombre o tres canales RGB, no ambos");const r=ut[e.toLowerCase()];if(r===void 0)throw new RangeError(`led: color "${e}" no válido (colores válidos: ${Ut})`);return this._session.core.ledIndex(r)}if(t===void 0||n===void 0)throw new TypeError("led: color esperaba un nombre o tres canales RGB");return this._session.core.ledRgb(me("red",e),me("green",t),me("blue",n))}toString(){return"LED()"}}const Mt="-100..100";function Ft(s,e){if(typeof s!="number")throw new TypeError(`motor (puerto "${e}"): run esperaba un número y recibió ${typeof s}`);if(!Number.isFinite(s)||s<-100||s>100)throw new RangeError(`motor (puerto "${e}"): el valor ${s} está fuera del rango ${Mt}`);return Math.round(s)}class Wt{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}run(e){const t=Ft(e,this.port);return this._session.requireDevice(this._conn,z),this._session.core.setMotor(this._conn,t)}stop(){return this._session.requireDevice(this._conn,z),this._session.core.setMotor(this._conn,0)}toString(){return`Motor('${this.port}')`}}const A=()=>performance.now()/1e3,J=s=>new Promise(e=>setTimeout(e,s*1e3));function K(s,e,t){return new Promise((n,r)=>{const o=setTimeout(()=>r(t()),e*1e3);s.then(i=>{clearTimeout(o),n(i)},i=>{clearTimeout(o),r(i)})})}const ge=(s,e)=>()=>new W(`${s} agotó el tiempo de espera (${e.toFixed(1)} s)`);class ht{constructor(){this._waiters=new Set}notify(){const e=[...this._waiters];this._waiters.clear();for(const t of e)t()}wait(e){return new Promise(t=>{const n=()=>{clearTimeout(r),this._waiters.delete(n),t()},r=setTimeout(n,Math.max(0,e)*1e3);this._waiters.add(n)})}}function Oe(s){const e=Math.floor(s),t=s-e;return t<.5?e:t>.5?e+1:e%2===0?e:e+1}class _t{constructor(){this._listeners=new Set}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}emit(e,t){for(const n of[...this._listeners])try{n(e,t)}catch(r){console.error("listener error",r)}}}const ft=s=>Array.from(s,e=>e.toString(16).padStart(2,"0")).join(" "),Ht=Object.freeze({0:"none",3:"backward",5:"right",7:"left",9:"forward"});function be(s,e){const t=Math.max(-100,Math.min(100,e));return Uint8Array.of(s,1,1,t&255)}const zt=s=>Uint8Array.of(H,4,1,s),Kt=(s,e,t)=>Uint8Array.of(H,4,3,s,e,t);function Ie(s,e,t,n,r,o){const i=new Uint8Array(11),a=new DataView(i.buffer);return i[0]=1,i[1]=2,i[2]=s,i[3]=e,i[4]=t,a.setUint32(5,n,!0),i[9]=r,i[10]=1,i}const Gt=s=>Uint8Array.of(0,1,s);function Vt(s){if(s.length<2)throw new RangeError(`port event too short (${s.length} bytes)`);const e=s[0];if(!(s[1]===1))return{conn:e,attached:!1,hubIndex:0,type:0};if(s.length<4)throw new RangeError(`attach event too short (${s.length} bytes)`);return{conn:e,attached:!0,hubIndex:s[2],type:s[3]}}function Jt(s){if(s.length<2)throw new RangeError(`sensor value too short (${s.length} bytes)`);const e=Uint8Array.from(s);return{conn:e[1],value:e.slice(2),raw:e}}const ue=s=>new DataView(s.buffer,s.byteOffset,s.byteLength);function pt(s){switch(s.length){case 1:return s[0];case 2:return ue(s).getUint16(0,!0);case 4:return ue(s).getFloat32(0,!0);default:throw new RangeError(`cannot decode a ${s.length}-byte sensor value`)}}function Yt(s){if(s.length===8){const t=ue(s),n=t.getFloat32(0,!0),r=t.getFloat32(4,!0);if(!Number.isFinite(n)||!Number.isFinite(r))throw new RangeError("non-finite tilt angle");return[Oe(n),Oe(r)]}if(s.length<2)throw new RangeError(`tilt angle value too short (${s.length} bytes)`);const e=ue(s);return[e.getInt8(0),e.getInt8(1)]}function Qt(s){const e=pt(s);return Number.isFinite(e)?Ht[Math.trunc(e)]??"unknown":"unknown"}async function De(s,e,...t){try{return await s.core.readSensor(...t)}catch(n){throw n instanceof ce||n instanceof Se?new de(n.message,{cause:n}):n.name==="OperationTimeout"?new lt(`${e}: todavía no hay ninguna lectura disponible`):n}}function Le(s,e){try{return s(e)}catch(t){throw t instanceof RangeError?new R(`unexpected sensor value ${ft(e)}: ${t.message}`,{cause:t}):t}}class Pe{constructor(e,t,n,r){this._session=e,this._conn=t,this.port=n,this._axis=r}get label(){return`tilt (puerto "${this.port}") eje ${this._axis===0?"x":"y"}`}async read(){this._session.requireDevice(this._conn,L);const e=await De(this._session,this.label,this._conn,L,ie,ot,2),[t,n]=Le(Yt,e);return this._axis===0?t:n}hasChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).axis(this._axis);return t.consume(t.checkFilter(e,this.label))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).axis(this._axis);return t.wait(t.checkFilter(e,this.label))}toString(){return`TiltAxis('${this.port}', '${this._axis===0?"x":"y"}')`}}class Xt{constructor(e,t,n){this._session=e,this._conn=t,this.port=n}get label(){return`distance (puerto "${this.port}")`}async read(){this._session.requireDevice(this._conn,j);const e=await De(this._session,this.label,this._conn,j,Pt,it),t=Le(pt,e);if(!Number.isFinite(t))throw new R("the distance sensor reported a non-finite value");return Math.max(0,Math.min(10,Math.round(t)))}hasChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).distance;return t.consume(t.checkFilter(e,this.label))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).distance;return t.wait(t.checkFilter(e,this.label))}toString(){return`DistanceSensor('${this.port}')`}}class Zt{constructor(e,t,n){this._session=e,this._conn=t,this.port=n,this.x=new Pe(e,t,n,0),this.y=new Pe(e,t,n,1)}get label(){return`tilt (puerto "${this.port}")`}async read(){this._session.requireDevice(this._conn,L);const e=await De(this._session,this.label,this._conn,L,at,it,4);return Le(Qt,e)}hasChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).tilt;return t.consume(t.checkFilter(e,this.label))}waitChange(e=null){this._session.requireUsable();const t=this._session.changes(this._conn).tilt;return t.wait(t.checkFilter(e,this.label))}toString(){return`TiltSensor('${this.port}')`}}const f=Object.freeze({DISCONNECTED:"disconnected",CONNECTING:"connecting",CONNECTED:"connected",DISCONNECTING:"disconnecting",SHUTDOWN:"shutdown",ERROR:"error"}),m=f,en=Object.freeze({[m.DISCONNECTED]:new Set([m.CONNECTING]),[m.CONNECTING]:new Set([m.CONNECTED,m.ERROR,m.DISCONNECTED]),[m.CONNECTED]:new Set([m.DISCONNECTING,m.ERROR,m.SHUTDOWN]),[m.DISCONNECTING]:new Set([m.DISCONNECTED,m.ERROR]),[m.SHUTDOWN]:new Set([m.CONNECTING,m.DISCONNECTED]),[m.ERROR]:new Set([m.CONNECTING,m.DISCONNECTING,m.DISCONNECTED])});class tn{constructor(e=()=>{}){this._state=m.DISCONNECTED,this._error=null,this._onChange=e}get state(){return this._state}get error(){return this._error}transition(e,t=null){const n=this._state;if(e!==n){if(!en[n].has(e))throw new N(`invalid hub state transition ${n} -> ${e}`);this._state=e,this._error=e===m.ERROR?t:null,this._onChange(e,this._error)}}forceError(e){(this._state===m.CONNECTED||this._state===m.CONNECTING)&&this.transition(m.ERROR,e)}}const nn=Object.freeze({heartbeatInterval:.5,watchdogTimeout:2,emergencyAttempts:2,emergencyAttemptTimeout:.5,opTimeout:1,sensorTimeout:1,settleQuiet:1.5,settleMax:5,connectTimeout:15,poll:.02});function Te(s={}){return Object.freeze({...nn,...s})}class sn{constructor({timing:e,isArmed:t,enqueueHeartbeat:n,lastOk:r,trip:o,now:i=A}){this._tm=e,this._isArmed=t,this._enqueueHeartbeat=n,this._lastOk=r,this._trip=o,this._now=i,this._signal=new ht,this._stopped=!0,this._loop=null}start(){this._stopped=!1,this._loop=this._run()}wake(){this._signal.notify()}async stop(){this._stopped=!0,this._signal.notify();const e=this._loop;this._loop=null,e&&await e}async _run(){const e=this._tm;let t=null,n=0;for(;!this._stopped;){if(!this._isArmed()){t=null,await this._signal.wait(.1);continue}const r=this._now();if(t&&t.settled&&(t=null),t===null&&r>=n){n=r+e.heartbeatInterval;try{t=this._enqueueHeartbeat()}catch{t=null}}const o=r-this._lastOk();if(o>e.watchdogTimeout){await this._trip(`no valid ACK from the hub for ${o.toFixed(1)} s`),t=null;continue}await this._signal.wait(e.poll)}}}const rn=(s,e)=>`${s}/${e}`,on=3;class mt extends _t{constructor(e,t){super(),this._t=e,this.timing=t?Te(t):Te(),this._sm=new tn((n,r)=>this.emit("state",{state:n,error:r})),this._linkLost=!1,this._lossHandled=!1,this._tripping=!1,this._ports=new Map,this._modes=new Map,this._samples=new Map,this._ledMode=-1,this._button=!1,this._speeds=new Map,this._lastOk=0,this._lastPortChange=0,this._changed=new ht,this._emergencyQ=[],this._normalQ=[],this._workerActive=!1,this._draining=null,this._isDraining=!1,this._epoch=0,this._wd=null}get state(){return this._sm.state}get error(){return this._sm.error}_unusable(){const e=this._sm.state;switch(e){case f.CONNECTED:return null;case f.CONNECTING:case f.DISCONNECTING:return new Z(`hub is ${e}`);case f.ERROR:return new D(`hub connection lost: ${this._sm.error}`);case f.SHUTDOWN:return new N("hub was shut down; power it on and call connect()");default:return new N("hub is not connected; call connect() first")}}checkUsable(){const e=this._unusable();if(e)throw e}_log(e,t){this.emit("log",{level:e,message:t})}_startWorker(){this._emergencyQ.length=0,this._normalQ.length=0,this._epoch+=1,this._workerActive=!0}async _stopWorker(){this._workerActive=!1,this._epoch+=1;const e=[...this._emergencyQ,...this._normalQ];this._emergencyQ.length=0,this._normalQ.length=0;for(const n of e)n.reject(new D("hub closed"));const t=this._isDraining?this._draining:null;t&&await K(t,this.timing.opTimeout*2+1,()=>null).catch(()=>{})}_enqueue(e,{emergency:t=!1,needsConnected:n=!0}={}){if(!this._workerActive)throw new N("hub is not connected; call connect() first");const r={fn:e,emergency:t,needsConnected:n,epoch:this._epoch,abandoned:!1,settled:!1};return r.promise=new Promise((o,i)=>{r.resolve=a=>{r.settled=!0,o(a)},r.reject=a=>{r.settled=!0,i(a)}}),r.promise.catch(()=>{}),(t?this._emergencyQ:this._normalQ).push(r),this._kick(),r}_kick(){this._isDraining||(this._isDraining=!0,this._draining=this._drain())}async _drain(){try{for(;this._workerActive;){const e=this._emergencyQ.length?this._emergencyQ.shift():this._normalQ.shift();if(!e)break;if(e.abandoned){e.resolve(void 0);continue}if(e.epoch!==this._epoch){e.reject(new D("stale request dropped after reconnect"));continue}try{e.needsConnected&&this.checkUsable();const t=await e.fn();this._lastOk=A(),e.resolve(t)}catch(t){e.reject(t)}}}finally{this._isDraining=!1}}_submit(e,t,n,r,o){const i=this._enqueue(e,{emergency:t,needsConnected:n}),a=o??r+this.timing.opTimeout+.5;return Number.isFinite(a)?K(i.promise,a,()=>(i.abandoned=!0,new W("hub operation did not complete"))):i.promise}async _io(e,t,n){try{return await this._t[e](...t,n)}catch(r){throw r instanceof D?(this._onLinkLost(r.message),r):r instanceof C?r:new R((r==null?void 0:r.message)??String(r),{cause:r})}}_call(e,t=[],{timeout:n,emergency:r=!1,needsConnected:o=!0,outer:i}={}){const a=n??this.timing.opTimeout;return this._submit(()=>this._io(e,t,a),r,o,a,i)}_onNotify(e,t){try{if(e===x)this._handlePort(t);else if(e===V){const n=Jt(t);this._samples.set(n.conn,n.value),this.emit("sample",{conn:n.conn,value:n.value,mode:this._sampleMode(n.conn)}),this._changed.notify()}else e===I?t.length>0&&(this._button=t[0]!==0,this.emit("button",{pressed:this._button})):e===oe&&this._onLinkLost("hub sent a Disconnect notification")}catch(n){this._log("debug",`bad notification on ${e}: ${ft(t)} (${n==null?void 0:n.message})`)}}_sampleMode(e){const t=this._modes.get(e);if(!t)return null;const n=t.lastIndexOf("/");return n>=0?Number(t.slice(n+1)):null}_handlePort(e){const t=Vt(e),n=this._ports.get(t.conn);if(t.attached){if(n&&n.type===t.type&&n.hubIndex===t.hubIndex)return;this._ports.set(t.conn,t)}else{if(!n)return;this._ports.delete(t.conn)}this._modes.delete(t.conn),this._samples.delete(t.conn),t.conn===H&&(this._ledMode=-1),this._lastPortChange=A(),this.emit("ports",{ports:this.portsRaw()}),this._changed.notify()}_onLinkLost(e){const t=this._sm.state;if(t===f.DISCONNECTING||t===f.DISCONNECTED||t===f.SHUTDOWN)return;this._linkLost=!0,this._sm.forceError(e),this._changed.notify();const n=!this._lossHandled;this._lossHandled=!0,n&&this._log("error",`link lost: ${e}`),n&&this._motorsActive()&&this._trip(`link lost: ${e}`).catch(()=>{})}async connect(){const e=this._sm.state;if(e===f.CONNECTED)return;if(e===f.CONNECTING||e===f.DISCONNECTING)throw new Z(`hub is ${e}`);this._sm.transition(f.CONNECTING),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._speeds.clear(),this._ledMode=-1,this._button=!1,this._linkLost=!1,this._lossHandled=!1,this._tripping=!1;const t=this.timing;try{this._startWorker(),this._t.setCallbacks((n,r)=>this._onNotify(n,r),n=>this._onLinkLost(n)),await this._call("connect",[],{timeout:t.connectTimeout,needsConnected:!1,outer:this._t.interactive?1/0:void 0});for(const n of $t)if(!this._t.hasCharacteristic(n))throw new B(`device does not look like a WeDo 2.0 hub: missing ${n}`);if(await this._optional("subscribe",oe),await this._call("subscribe",[V],{needsConnected:!1}),this._t.hasCharacteristic(I)){await this._optional("subscribe",I);try{const n=await this._call("read",[I],{needsConnected:!1});this._button=n.length>0&&n[0]!==0}catch(n){if(!(n instanceof C))throw n}}if(await this._call("subscribe",[x],{needsConnected:!1}),await this._settlePorts(f.CONNECTING),this._sm.state!==f.CONNECTING)throw this._unusable()??new D("connection lost during connect");this._lastOk=A(),this._sm.transition(f.CONNECTED),this._startWatchdog()}catch(n){throw await this._abortConnect(n),n instanceof C?n:new B((n==null?void 0:n.message)??String(n),{cause:n})}}async _optional(e,...t){try{await this._call(e,t,{needsConnected:!1})}catch(n){if(!(n instanceof C))throw n;this._log("debug",`optional ${e} ${t} unavailable: ${n.message}`)}}async _abortConnect(e){this._sm.state===f.CONNECTING&&(this._sm.transition(f.ERROR,(e==null?void 0:e.message)??String(e)),this._changed.notify()),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}async _settlePorts(e){const t=this.timing,n=A();for(this._lastPortChange=Math.max(this._lastPortChange,n);;){if(this._sm.state!==e)throw this._unusable()??new D("connection lost during port discovery");const r=A(),o=t.settleQuiet-(r-this._lastPortChange),i=t.settleMax-(r-n);if(o<=0||i<=0)return;await this._changed.wait(Math.min(o,i))}}async disconnect(){const e=this._sm.state;if(e===f.DISCONNECTED||e===f.SHUTDOWN)return e===f.SHUTDOWN&&this._sm.transition(f.DISCONNECTED),!0;if(e===f.CONNECTING||e===f.DISCONNECTING)throw new Z(`hub is ${e}`);const t=this._linkLost;this._sm.transition(f.DISCONNECTING);let n=!0;t?this._motorsActive()&&(n=!1):{confirmed:n}=await this._stopMotors(this.timing.emergencyAttempts,this.timing.emergencyAttemptTimeout),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch(r){this._log("debug",`transport disconnect failed: ${r==null?void 0:r.message}`)}return n&&this._speeds.clear(),this._sm.transition(f.DISCONNECTED),this._changed.notify(),n||this._log("warn","disconnect: motor stop could not be confirmed"),n}async shutdownHub(){this.checkUsable(),await this._call("write",[et,Uint8Array.of(1)]),this._sm.transition(f.SHUTDOWN),await this._stopWatchdog(),await this._stopWorker();try{await this._t.disconnect()}catch{}}portsRaw(){return new Map([...this._ports].map(([e,t])=>[e,t.type]))}async refreshPorts(){this.checkUsable(),this._ports.clear(),this._modes.clear(),this._samples.clear(),this._ledMode=-1,this._lastPortChange=A(),await this._call("unsubscribe",[x]),await this._call("subscribe",[x]),await this._settlePorts(f.CONNECTED)}_requireDevice(e,t){const n=this._ports.get(e);if(!n)throw new ce(`no device on connect id ${e}`);if(n.type!==t){const r=o=>ae[o]??`0x${o.toString(16).padStart(2,"0")}`;throw new Se(`device on connect id ${e} is a ${r(n.type)}, expected a ${r(t)}`)}}_motorsActive(){for(const e of this._speeds.values())if(e!==0)return!0;return!1}async setMotor(e,t){var o;this.checkUsable(),this._requireDevice(e,z);const n=be(e,t),r=this._motorsActive();t!==0&&(this._speeds.set(e,t),r||(this._lastOk=A()),(o=this._wd)==null||o.wake()),await this._call("write",[O,n]),t===0&&this._speeds.set(e,0),this.emit("motor",{conn:e,speed:t})}async stopAll(){this.checkUsable();const e=this._knownMotors();let t=null;for(const n of e){try{await this._call("write",[O,be(n,0)],{emergency:!0})}catch(r){t??(t=r);continue}this._speeds.set(n,0),this.emit("motor",{conn:n,speed:0})}if(t)throw t}_knownMotors(){const e=new Set;for(const[t,n]of this._ports)n.type===z&&e.add(t);for(const t of this._speeds.keys())e.add(t);return[...e].sort((t,n)=>t-n)}async _ensureLedMode(e){this._ledMode!==e&&(await this._call("write",[F,Ie(H,xe,e,1,ot)]),this._ledMode=e)}async ledIndex(e){this.checkUsable(),await this._ensureLedMode(It),await this._call("write",[O,zt(e)])}async ledRgb(e,t,n){this.checkUsable(),await this._ensureLedMode(Ot),await this._call("write",[O,Kt(e,t,n)])}buttonPressed(){return this.checkUsable(),this._button}async readBattery(){return this.checkUsable(),(await this._call("read",[G]))[0]}async readSensor(e,t,n,r,o=null,i=null){this.checkUsable(),this._requireDevice(e,t);const a=i??this.timing.sensorTimeout,c=rn(t,n),h=async()=>{this._samples.delete(e),this._modes.set(e,c);try{await this._call("write",[F,Ie(e,t,n,1,r,!0)]),await this._call("write",[F,Gt(e)])}catch(b){throw this._modes.get(e)===c&&this._modes.delete(e),b}};this._modes.get(e)!==c&&await h();const u=A()+a;let g=0;for(;;){const b=this._unusable();if(b)throw b;if(!this._ports.has(e))throw new ce(`the device on connect id ${e} was disconnected`);if(this._modes.get(e)!==c&&g<on){if(g++,await h(),A()>=u)throw new W(`the hub sent no value within ${a.toFixed(1)} s`);continue}const _=this._samples.get(e);if(_&&(o===null||_.length===o))return _;const w=u-A();if(w<=0)throw new W(`the hub sent no value within ${a.toFixed(1)} s`);await this._changed.wait(w)}}_startWatchdog(){this._wd=new sn({timing:this.timing,isArmed:()=>this._sm.state===f.CONNECTED&&this._motorsActive(),enqueueHeartbeat:()=>this._enqueue(()=>this._io("read",[G],this.timing.opTimeout),{emergency:!0,needsConnected:!1}),lastOk:()=>this._lastOk,trip:e=>this._trip(e)}),this._wd.start()}async _stopWatchdog(){const e=this._wd;this._wd=null,e&&await e.stop()}async _stopMotors(e,t){let n=this._knownMotors();const r=[];for(let o=0;o<e&&n.length!==0;o+=1){const i=[];for(const a of n){try{await this._call("write",[O,be(a,0)],{timeout:t,emergency:!0,needsConnected:!1})}catch{i.push(a);continue}this._speeds.set(a,0),this.emit("motor",{conn:a,speed:0})}n=i,r.push(n.length===0)}return{confirmed:n.length===0,results:r}}async _trip(e){if(!this._tripping){this._tripping=!0;try{const t=this.timing;this._log("error",`watchdog: ${e}`);const{confirmed:n,results:r}=await this._stopMotors(t.emergencyAttempts,t.emergencyAttemptTimeout),o=[];for(let i=0;i<r.length&&(o.push(`${i===0?"stop attempt 1":`attempt ${i+1}`}${r[i]?" ACK":" no ACK"}`),!r[i]);i+=1);n?(this._log("warn",`watchdog: ${o.join(", ")}`),this._log("warn","watchdog: motors stopped")):this._log("error",`watchdog: stop NOT confirmed (${t.emergencyAttempts} attempts)`),this._sm.forceError(e),this._changed.notify()}finally{this._tripping=!1}}}}v(mt,"STOP_PROFILE","nobarrier");class gt{constructor(){v(this,"interactive",!1)}setCallbacks(e,t){throw new N("not implemented")}async connect(e){throw new N("not implemented")}async disconnect(e){throw new N("not implemented")}hasCharacteristic(e){throw new N("not implemented")}async read(e,t){throw new N("not implemented")}async write(e,t,n){throw new N("not implemented")}async subscribe(e,t){throw new N("not implemented")}async unsubscribe(e,t){throw new N("not implemented")}}const we=[Ze,St,xt,Tt];function bt(s=globalThis.navigator){return!!(s&&s.bluetooth&&typeof s.bluetooth.requestDevice=="function")}function wt(s=globalThis){var r;if(bt(s.navigator))return null;if(s.isSecureContext===!1)return"Web Bluetooth requiere HTTPS (o localhost). Abre la aplicación desde una dirección segura.";const e=((r=s.navigator)==null?void 0:r.userAgent)??"";return`Este navegador no admite Web Bluetooth. Usa Chrome o Edge en un sistema compatible (Firefox y Safari no están soportados).${/Linux/.test(e)&&!/Android/.test(e)?" En Linux Web Bluetooth está desactivado por defecto: abre chrome://flags/#enable-experimental-web-platform-features, ponlo en «Enabled», reinicia el navegador y comprueba que BlueZ ≥ 5.41 (`bluetoothd --version`) y el servicio bluetooth están activos.":""}`}const $e=s=>new Uint8Array(s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength));class yt extends gt{constructor({bluetooth:t=(r=>(r=globalThis.navigator)==null?void 0:r.bluetooth)(),acceptAll:n=!1}={}){super();v(this,"interactive",!0);this._bt=t,this._acceptAll=n,this._device=null,this._chars=new Map,this._handlers=new Map,this._onNotify=null,this._onDisconnect=null,this._closing=!1,this._onGattDisconnected=()=>{var o;this._closing||(o=this._onDisconnect)==null||o.call(this,"BLE link lost")}}setCallbacks(t,n){this._onNotify=t,this._onDisconnect=n}get deviceName(){var t;return((t=this._device)==null?void 0:t.name)??null}async connect(t){if(!this._bt)throw new le(wt()??"Web Bluetooth no está disponible");this._closing=!1;let n;try{n=await this._bt.requestDevice(this._acceptAll?{acceptAllDevices:!0,optionalServices:we}:{filters:[{services:[Ze]},...jt.map(r=>({name:r}))],optionalServices:we})}catch(r){throw(r==null?void 0:r.name)==="NotFoundError"?new B("no WeDo 2.0 hub was selected"):(r==null?void 0:r.name)==="SecurityError"?new B("the browser requires a user gesture (click) and HTTPS to open the Bluetooth chooser"):new R((r==null?void 0:r.message)??String(r),{cause:r})}this._device=n,n.addEventListener("gattserverdisconnected",this._onGattDisconnected);try{const r=await K(n.gatt.connect(),t,ge("GATT connect",t));await K(this._discover(r),t,ge("service discovery",t))}catch(r){throw await this._release(),this._map(r)}}async _discover(t){this._chars.clear();for(const n of we){let r;try{r=await t.getPrimaryService(n)}catch(o){if((o==null?void 0:o.name)==="NotFoundError")continue;throw o}for(const o of await r.getCharacteristics())this._chars.set(o.uuid.toLowerCase(),o)}}async disconnect(){this._closing=!0,await this._release()}async _release(){var n,r;const t=this._device;this._device=null;for(const[o,i]of this._handlers)(n=this._chars.get(o))==null||n.removeEventListener("characteristicvaluechanged",i);if(this._handlers.clear(),this._chars.clear(),t){t.removeEventListener("gattserverdisconnected",this._onGattDisconnected);try{(r=t.gatt)!=null&&r.connected&&t.gatt.disconnect()}catch{}}}hasCharacteristic(t){return this._chars.has(t)}_char(t){var r,o;if(!((o=(r=this._device)==null?void 0:r.gatt)!=null&&o.connected))throw new D("BLE link is not open");const n=this._chars.get(t);if(!n)throw new R(`characteristic not available: ${t}`);return n}_map(t){var n,r;return t instanceof C?t:!((r=(n=this._device)==null?void 0:n.gatt)!=null&&r.connected)||(t==null?void 0:t.name)==="NetworkError"?new D((t==null?void 0:t.message)||"BLE link lost",{cause:t}):new R((t==null?void 0:t.message)||(t==null?void 0:t.name)||"BLE error",{cause:t})}async _run(t,n,r){try{return await K(t,n,ge(r,n))}catch(o){throw this._map(o)}}async read(t,n){const r=this._char(t);return $e(await this._run(r.readValue(),n,"BLE read"))}async write(t,n,r){const o=this._char(t);if(typeof o.writeValueWithResponse!="function")throw new le("this browser lacks writeValueWithResponse; refusing to write without response");await this._run(o.writeValueWithResponse(Uint8Array.from(n)),r,"BLE write")}async subscribe(t,n){const r=this._char(t);if(!this._handlers.has(t)){const o=i=>{var c,h;const a=(c=i.target)==null?void 0:c.value;a&&((h=this._onNotify)==null||h.call(this,t,$e(a)))};r.addEventListener("characteristicvaluechanged",o),this._handlers.set(t,o)}await this._run(r.startNotifications(),n,"BLE start notifications")}async unsubscribe(t,n){const r=this._char(t);await this._run(r.stopNotifications(),n,"BLE stop notifications");const o=this._handlers.get(t);o&&(r.removeEventListener("characteristicvaluechanged",o),this._handlers.delete(t))}}class an{constructor(){this.distance=new q(["increase","decrease"]),this.tilt=new q(["left","right","forward","backward","none"]),this._axes=[new q(["increase","decrease"]),new q(["increase","decrease"])],this.button=new q(["pressed","released"],{firstIsChange:!0})}axis(e){return this._axes[e]}reset(){this.distance.reset(),this.tilt.reset(),this._axes.forEach(e=>e.reset()),this.button.reset()}}class q{constructor(e=[],t={}){this._filters=new Set(e),this._firstIsChange=!!t.firstIsChange,this._pending=[],this._waiters=[],this._baseline=void 0}get filters(){return[...this._filters]}checkFilter(e,t="recurso"){if(e==null)return null;if(typeof e!="string")throw new TypeError(`${t}: el filtro esperaba una cadena y recibió ${typeof e}`);if(!this._filters.has(e)){const n=[...this._filters].map(r=>`"${r}"`).join(", ");throw new RangeError(`${t}: filtro "${e}" no admitido (admitidos: ${n})`)}return e}observe(e,t){if(this._baseline===void 0){this._baseline=e;const i=t(void 0,e);return i==null||!this._firstIsChange?null:(this._record(i),i)}const n=this._baseline;this._baseline=e;const r=t(n,e);return r==null?null:(this._record(r),r)}_record(e){this._pending.includes(e)||this._pending.push(e),this._wake()}pending(){return[...this._pending]}consume(e=null){if(e===null){const n=this._pending.length>0;return this._pending=[],n}const t=this._pending.indexOf(e);return t>=0?(this._pending.splice(t,1),!0):!1}reset(){this._pending=[],this._baseline=void 0;const e=this._waiters;this._waiters=[];for(const t of e)t.reject(new Ae("hub no conectado"))}wait(e=null){if(e!==null&&this.consume(e))return Promise.resolve(e);if(e===null){const t=this._pending[0];if(t!==void 0)return this._pending.shift(),Promise.resolve(t)}return new Promise((t,n)=>{this._waiters.push({filter:e,resolve:t,reject:n})})}_wake(){for(let e=0;e<this._waiters.length;e+=1){const t=this._waiters[e];if(!(t.filter===null?this._pending.length>0:this._pending.includes(t.filter)))continue;const r=t.filter===null?this._pending.shift():t.filter;if(t.filter!==null){const o=this._pending.indexOf(t.filter);o>=0&&this._pending.splice(o,1)}this._waiters.splice(e,1),t.resolve(r);return}}}const ee=new Set;let je=!1;function cn(){je||typeof globalThis.addEventListener!="function"||(je=!0,globalThis.addEventListener("pagehide",()=>{for(const s of ee)s.emergencyClose().catch(()=>{})}))}class ln{constructor(e=null,t=null){this._transport=e,this._timing=t,this._core=null,this._changes=new Map,this._unsub=null}get core(){if(!this._core)throw new N("hub is not connected; call connect() first");return this._core}get isConnected(){return this._core!==null&&this._core.state===f.CONNECTED}ensureCore(){var e;return this._core||(this._core=new mt(this._transport??new yt,this._timing),(e=this._unsub)==null||e.call(this),this._unsub=this._core.subscribe((t,n)=>this._onCore(t,n))),this._core}requireUsable(){if(!this.isConnected)throw new Ae("hub no conectado")}requireDevice(e,t){this.requireUsable();const r=this.portsRaw().get(e),o=e===_e?"a":"b",i=ae[t]??"unknown";if(r===void 0)throw new de(`puerto "${o}": no hay ningún periférico conectado (se esperaba "${i}")`);if(r!==t)throw new de(`puerto "${o}": hay un periférico "${ae[r]??"unknown"}" y se esperaba "${i}"`)}changes(e){let t=this._changes.get(e);return t||(t=new an,this._changes.set(e,t)),t}resetChanges(){for(const e of this._changes.values())e.reset()}async connect(){await this.ensureCore().connect(),this.resetChanges(),ee.add(this),cn()}async disconnect(){let e=!0;return this._core&&(e=await this._core.disconnect()),this.resetChanges(),ee.delete(this),e}async shutdown(){const e=this.core;try{await e.stopAll()}catch(t){e._log("warn",`could not stop motors before shutdown: ${t==null?void 0:t.message}`)}await e.shutdownHub(),ee.delete(this)}stopAll(){return this.core.stopAll()}portsRaw(){return this._core?this._core.portsRaw():new Map}refreshPorts(){return this.core.refreshPorts()}async emergencyClose(){try{this._core&&await this._core.disconnect()}catch{}}_onCore(e,t){e==="sample"?this._onSample(t):e==="button"?this._onButton(t):(e==="state"||e==="ports")&&this.resetChanges()}_onSample({conn:e,value:t,mode:n}){const r=this.portsRaw().get(e);if(r===j){const o=this._asNumber(t);this.changes(e).distance.observe(o,(i,a)=>a>i?"increase":a<i?"decrease":null)}else if(r===L)if(n===ie){const[o,i]=this._asPair(t),a=this.changes(e);a.axis(0).observe(o,(c,h)=>h>c?"increase":h<c?"decrease":null),a.axis(1).observe(i,(c,h)=>h>c?"increase":h<c?"decrease":null)}else{const o=this._asDirection(t);this.changes(e).tilt.observe(o,(i,a)=>a===i?null:a)}}_onButton({pressed:e}){this.changes("button").button.observe(!!e,(t,n)=>n?"pressed":"released")}_asNumber(e){return e instanceof Float32Array?e[0]:e instanceof Uint8Array?new DataView(e.buffer,e.byteOffset,e.byteLength).getFloat32(0,!0):Number(e)}_asPair(e){return e instanceof Uint8Array&&e.length>=2?[e[0]>127?e[0]-256:e[0],e[1]>127?e[1]-256:e[1]]:[0,0]}_asDirection(e){const t={0:"none",3:"backward",5:"right",7:"left",9:"forward"},n=this._asNumber(e);return t[n]??"none"}}const Et={A:_e,B:tt};function te(s){if(typeof s!="string")throw new TypeError(`hub: el puerto esperaba una cadena y recibió ${typeof s}`);const e=Et[s.toUpperCase()];if(e===void 0)throw new RangeError(`puerto "${s}" no válido (puertos válidos: a, b)`);return e}function ye(s){return te(s)===_e?"a":"b"}function dn(s){if(s==null)return null;if(typeof s!="number")throw new TypeError(`timeout must be a number, not ${typeof s}`);if(!Number.isFinite(s)||s<0)throw new RangeError(`timeout must be a finite number >= 0, got ${s}`);return s}class un{constructor({transport:e=null,timing:t=null}={}){this._session=new ln(e,t),this._led=new qt(this._session),this._button=new Bt(this._session),this._connectError=null,this._connecting=null}connect(){if(this.isConnected||this._connecting)return this;const e=this._session.ensureCore();return this._connectError=null,this._connecting=e.connect().then(()=>{this._connecting=null},t=>{this._connectError=t,this._connecting=null}),this}async waitConnection(e=null){const t=dn(e),n=t===null?1/0:Date.now()+t*1e3;for(;;){if(this.isConnected)return!0;if(this._connectError){const r=this._connectError;throw this._connectError=null,new ct((r==null?void 0:r.message)??"no se pudo conectar con el hub")}if(Date.now()>=n)return!1;await new Promise(r=>setTimeout(r,40))}}get isConnected(){return this._session.isConnected}get state(){return this._session._core?this._session._core.state:"disconnected"}disconnect(){return this._session.disconnect()}shutdown(){return this._session.shutdown()}stopAll(){return this._session.stopAll()}readBattery(){return this._session.core.readBattery()}subscribe(e){return this._session.ensureCore().subscribe(e)}ports(){this._session.requireUsable();const e=this._session.portsRaw(),t={};for(const[n,r]of Object.entries(Et))e.has(r)&&(t[n.toLowerCase()]=ae[e.get(r)]??"unknown");return t}async refreshPorts(){return await this._session.refreshPorts(),this.ports()}motor(e){return new Wt(this._session,te(e),ye(e))}distance(e){return new Xt(this._session,te(e),ye(e))}tilt(e){return new Zt(this._session,te(e),ye(e))}get led(){return this._led}get button(){return this._button}}const S={ok:"ok",cancelled:"cancelled",stopped:"stopped"};function ne(s){if(typeof s!="number")throw new TypeError(`seconds must be a number, not ${typeof s}`);if(!Number.isFinite(s)||s<0)throw new RangeError(`seconds must be a finite number >= 0, got ${s}`);return s}class hn{constructor(e,t){this._manager=e,this._id=t}get id(){return this._id}get state(){return this._manager.state(this._id)}cancel(){this._manager.cancel(this._id)}join(){return this._manager.join(this._id,void 0)}toString(){return`Task(${this._id})`}}class _n{constructor(){this._tasks=new Map,this._main=new Set,this._counter=0,this._allWaiters=[]}_nextId(){return this._counter+=1,this._counter}spawn(e,t){const n={id:e,callable:t,state:"running",pending:null,cancelRequested:!1,joiners:[],error:null,result:null};return this._tasks.set(e,n),this._start(n),e}_start(e){var n;let t;try{t=typeof((n=e.callable)==null?void 0:n.callPromising)=="function"?e.callable.callPromising():Promise.resolve().then(()=>e.callable())}catch(r){this._finish(e,"failed",r);return}t=t.then(r=>{e.result=r,this._finish(e,"finished",null)},r=>{this._finish(e,"failed",r)}),e.promise=t,t.catch(()=>{})}_finish(e,t,n){if(e.state=t,e.error=n??null,e.pending){const o=e.pending;e.pending=null,o.settle(S.ok)}const r=e.joiners;e.joiners=[];for(const o of r)o.handle.settle(S.ok);if(this._live()===0){const o=this._allWaiters;this._allWaiters=[];for(const i of o)i()}}_live(){let e=0;for(const t of this._tasks.values())t.state==="running"&&(e+=1);return e}wait(e,t){ne(t);const n=setTimeout(()=>a.settle(S.ok),t*1e3),r=e==null?null:this._tasks.get(e);let o;const i=new Promise(c=>{o=c}),a={settled:!1,settle:c=>{a.settled||(a.settled=!0,clearTimeout(n),r&&r.pending===a&&(r.pending=null),r==null&&this._main.has(a)&&this._main.delete(a),o(c))}};return r?r.pending=a:this._main.add(a),i}join(e,t=void 0){const n=this._tasks.get(e);if(!n||n.state==="finished"||n.state==="failed")return Promise.resolve();const r=t==null?null:this._tasks.get(t);return new Promise((o,i)=>{if(r){const c={settle:h=>{const u=n.joiners.indexOf(a);u>=0&&n.joiners.splice(u,1),r.pending===c&&(r.pending=null),h===S.cancelled?i(new M):o()}};var a={};a.handle=c,n.joiners.push(a),r.pending=c}else{var a={handle:{settle:()=>{const u=n.joiners.indexOf(a);u>=0&&n.joiners.splice(u,1),o()}}};n.joiners.push(a)}})}cancelRequested(e){const t=this._tasks.get(e);return!!(t!=null&&t.cancelRequested)}cancel(e){const t=this._tasks.get(e);if(!(!t||t.state!=="running")&&(t.cancelRequested=!0,t.pending)){const n=t.pending;t.pending=null,n.settle(S.cancelled)}}interruptAll(){for(const e of[...this._tasks.values()])if(e.cancelRequested=!0,e.pending){const t=e.pending;e.pending=null,t.settle(S.cancelled)}for(const e of[...this._main])e.settle(S.stopped)}cancelAll(){this.interruptAll()}allSettled(){return this._live()===0?Promise.resolve():new Promise(e=>{this._allWaiters.push(e)})}state(e){const t=this._tasks.get(e);return t?t.state:null}}class fn{constructor(e){this._manager=e}spawn(e,t=void 0){if(typeof e=="function"){const n=this._manager._nextId(),r={id:n,wait:async o=>{if(this._manager.cancelRequested(n))throw new M;const i=await this._manager.wait(n,ne(o));if(i===S.cancelled)throw new M;if(i===S.stopped)throw new M("program stopped");if(this._manager.cancelRequested(n))throw new M;return i===S.ok?void 0:i}};return this._manager.spawn(n,()=>Promise.resolve().then(()=>e(r))),new hn(this._manager,n)}return this._manager.spawn(e,t)}async wait(e,t=void 0){return t!==void 0?this._manager.wait(e,ne(t)).then(n=>n===S.ok?void 0:n):this._manager.wait(null,ne(e)).then(n=>n===S.ok?void 0:n)}join(e,t=void 0){return this._manager.join(e,t)}cancel(e){this._manager.cancel(e)}cancelAll(){this._manager.cancelAll()}interruptAll(){return this._manager.interruptAll()}allSettled(){return this._manager.allSettled()}state(e){return this._manager.state(e)}}const Be=new fn(new _n),pn="a-z, 0-9, up, down, left, right, space, enter, escape, tab, backspace, shift, control, alt",mn=/^(?:[a-z0-9]|up|down|left|right|space|enter|escape|tab|backspace|shift|control|alt)$/,Ue=new Map([["arrowup","up"],["arrowdown","down"],["arrowleft","left"],["arrowright","right"],[" ","space"],["enter","enter"],["escape","escape"],["tab","tab"],["backspace","backspace"],["shift","shift"],["control","control"],["alt","alt"]]);function gn(s){if(s.repeat||typeof s.code=="string"&&s.code.startsWith("Numpad"))return null;const e=String(s.key??""),t=e.toLowerCase();return Ue.has(t)?Ue.get(t):e.length===1&&(t>="a"&&t<="z"||t>="0"&&t<="9")?t:null}class bn{constructor(e=void 0){this._target=e===void 0?globalThis.window:e,this._pressed=new Set,this._trackers=new Map,this._active=!1,this._onKeyDown=t=>this._observe(t,!0),this._onKeyUp=t=>this._observe(t,!1),this._onBlur=()=>this.releaseAll()}tracker(e){let t=this._trackers.get(e);return t||(t=new q(["pressed","released"],{firstIsChange:!0}),this._trackers.set(e,t)),t}use(){if(!this._active){if(!this._target||typeof this._target.addEventListener!="function")throw new dt("teclado no disponible en este entorno");this._target.addEventListener("keydown",this._onKeyDown),this._target.addEventListener("keyup",this._onKeyUp),this._target.addEventListener("blur",this._onBlur),this._active=!0}}release(){this._active&&(this._target.removeEventListener("keydown",this._onKeyDown),this._target.removeEventListener("keyup",this._onKeyUp),this._target.removeEventListener("blur",this._onBlur),this._active=!1,this.releaseAll())}reset(){this._pressed.clear();for(const e of this._trackers.values())e.reset()}get active(){return this._active}isPressed(e){return this._pressed.has(e)}releaseAll(){for(const e of[...this._pressed])this._settle(e,!1)}_observe(e,t){const n=gn(e);n!==null&&this._settle(n,t)}_settle(e,t){if(t){if(this._pressed.has(e))return;this._pressed.add(e),this.tracker(e).observe(!0,n=>n!==!0?"pressed":null)}else{if(!this._pressed.has(e))return;this._pressed.delete(e),this.tracker(e).observe(!1,n=>n!==!1?"released":null)}}}const Re=new bn;function wn(s){if(typeof s!="string")throw new TypeError(`key: la tecla esperaba una cadena y recibió ${typeof s}`);const e=s.toLowerCase();if(!mn.test(e))throw new RangeError(`tecla "${s}" no válida (teclas válidas: ${pn})`);return new vn(Re,e)}function yn(){Re.release()}function En(){Re.reset()}class vn{constructor(e,t){this._capture=e,this.name=t}get label(){return`tecla "${this.name}"`}read(){return this._capture.use(),this._capture.isPressed(this.name)}hasChange(e=null){this._capture.use();const t=this._capture.tracker(this.name);return t.consume(t.checkFilter(e,this.label))}waitChange(e=null){this._capture.use();const t=this._capture.tracker(this.name);return t.wait(t.checkFilter(e,this.label))}toString(){return`Key('${this.name}')`}}const qe={motor:z,distance:j,tilt:L},Ee={A:_e,B:tt},kn=[[At,st],[Dt,nt],[Lt,rt],[H,xe]],Cn=Object.freeze({none:0,backward:3,right:5,left:7,forward:9}),ve=(s,e)=>Uint8Array.of(s,1,0,e,0,0,0,16,0,0,0,16),Me=s=>{const e=new Uint8Array(4);return new DataView(e.buffer).setFloat32(0,s,!0),e};class Nn extends gt{constructor(e,{externalDelay:t=.05,repeatPorts:n=null,ackDelay:r=0,silentSensors:o=!1,failConnect:i=!1}={}){super(),this.devices={...e??{A:"motor",B:"distance"}},this.externalDelay=t,this.repeatPorts=n,this.ackDelay=r,this.silentSensors=o,this.failConnect=i,this.failReads=!1,this.frozen=!1,this.dropped=!1,this.connected=!1,this.supportsDisconnectNotify=!1,this.writes=[],this.reads=[],this.motors={},this.sensorModes={},this.ledMode=null,this.button=!1,this.distance=0,this.tiltAngle=[0,0],this.tiltCode=0,this.battery=87,this._notifying=new Set,this._onNotify=null,this._onDisconnect=null,this._closed=!1,this._burstId=0}freeze(){this.frozen=!0}unfreeze(){this.frozen=!1}dropLink(e="simulated link loss"){var t;this.dropped=!0,this.connected=!1,(t=this._onDisconnect)==null||t.call(this,e)}writesTo(e){return this.writes.filter(([t])=>t===e).map(([,t])=>t)}press(){this.button=!0,this._notify(I,Uint8Array.of(1))}release(){this.button=!1,this._notify(I,Uint8Array.of(0))}setDistance(e){this.distance=e,this._pushValues(j)}setTiltAngle(e,t){this.tiltAngle=[Math.trunc(e),Math.trunc(t)],this._pushValues(L,ie)}setTiltDirection(e){this.tiltCode=typeof e=="string"?Cn[e]:Number(e),this._pushValues(L,at)}attach(e,t){this.devices[e]=t,this._notify(x,ve(Ee[e],qe[t]))}detach(e){delete this.devices[e],this._notify(x,Uint8Array.of(Ee[e],0))}setCallbacks(e,t){this._onNotify=e,this._onDisconnect=t}async connect(e){if(this.failConnect)throw new B("no WeDo 2.0 hub found");this.dropped=!1,this.connected=!0,this._closed=!1}async disconnect(){this.connected=!1,this._notifying.clear(),this._closed=!0,this._burstId+=1}hasCharacteristic(e){return e===oe||[G,x,V,F,O,I,et].includes(e)}async _gate(e){if(this.dropped||!this.connected)throw new D("simulated link is down");if(this.frozen)throw await J(e),new W("no ACK from the simulated hub");if(this.ackDelay&&(await J(this.ackDelay),this.dropped))throw new D("simulated link is down")}async read(e,t){if(await this._gate(t),this.failReads)throw new R("simulated read failure");if(this.reads.push(e),e===G)return Uint8Array.of(this.battery);if(e===I)return Uint8Array.of(this.button?1:0);throw new R(`characteristic not readable: ${e}`)}async write(e,t,n){if(await this._gate(n),t=Uint8Array.from(t),this.writes.push([e,t]),e===O)t.length===4&&t[1]===1&&t[2]===1&&(this.motors[t[0]]=t[3]<<24>>24);else if(e===F)if(t.length>=5&&t[0]===1&&t[1]===2){const[r,o,i]=[t[2],t[3],t[4]];this.sensorModes[r]=[o,i],r===H&&(this.ledMode=i)}else t.length===3&&t[0]===0&&t[1]===1&&this._pushConn(t[2])}async subscribe(e,t){if(await this._gate(t),e===oe&&!this.supportsDisconnectNotify)throw new R("notifications not supported on this characteristic");this._notifying.add(e),e===x&&this._portBurst(++this._burstId)}async unsubscribe(e,t){await this._gate(t),this._notifying.delete(e)}_notify(e,t){this._onNotify&&this._notifying.has(e)&&this._onNotify(e,Uint8Array.from(t))}async _portBurst(e){const t=()=>e===this._burstId&&!this._closed;for(const[r,o]of kn)this._notify(x,ve(r,o));if(await J(this.externalDelay),!t())return;const n=Object.keys(this.devices).sort().map(r=>ve(Ee[r],qe[this.devices[r]]));for(const r of n)this._notify(x,r);for(;this.repeatPorts&&this._notifying.has(x);){if(await J(this.repeatPorts),!t())return;for(const r of n)this._notify(x,r)}}_valueBytes(e){const[t,n]=this.sensorModes[e]??[null,null];return t===j?Me(this.distance):t===L?n===ie?Uint8Array.of(this.tiltAngle[0]&255,this.tiltAngle[1]&255):Me(this.tiltCode):null}_pushConn(e){if(this.silentSensors)return;const t=this._valueBytes(e);t&&this._notify(V,Uint8Array.of(1,e,...t))}_pushValues(e,t=null){for(const[n,[r,o]]of Object.entries(this.sensorModes))r===e&&(t===null||o===t)&&this._pushConn(Number(n))}}const Tn=new Set([f.ERROR]);class xn extends _t{constructor(){super(),this.hub=null,this.sim=null,this.kind="web-bluetooth",this.state=f.DISCONNECTED,this.activeMotors=new Map,this._unsub=null,this.simDevices={A:"motor",B:"distance"},this.simDistance=10}get supportsBluetooth(){return bt()}get connected(){return this.state===f.CONNECTED}get unsafe(){return Tn.has(this.state)}_log(e,t){this.emit("log",{level:e,message:t})}async connect(e,{acceptAll:t=!1}={}){var i;this.hub&&this.state!==f.DISCONNECTED&&await this.disconnect(),this.kind=e;let n,r=null;e==="simulated"?(this.sim=new Nn(this.simDevices,{externalDelay:.05}),this.sim.distance=this.simDistance??10,n=this.sim,r=Te({settleQuiet:.3})):(this.sim=null,n=new yt({acceptAll:t}));const o=new un({transport:n,timing:r});this.hub=o,this.activeMotors.clear(),(i=this._unsub)==null||i.call(this),this._unsub=o.subscribe((a,c)=>this._onCore(a,c)),this._log("info",`Conectando (${e==="simulated"?"simulador":"Web Bluetooth"})…`);try{if(o.connect(),!await o.waitConnection(60))throw new Error("la conexión del hub no se completó")}catch(a){throw this._log("error",`No se pudo conectar: ${a.message}`),this._setState(o.state),a}this._log("info","Conectado."),this.emit("hubname",{name:n.deviceName??(e==="simulated"?"Hub simulado":"WeDo 2.0 Smart Hub")}),this.emit("ports",{ports:o.ports()}),await this.refreshBattery()}async disconnect(){const e=this.hub;if(e){try{const t=await e.disconnect();this._log(t?"info":"warn",t?"Desconectado.":"Desconectado, pero la parada de motores no pudo confirmarse.")}catch(t){this._log("error",`Error al desconectar: ${t.message}`)}this.activeMotors.clear(),this._setState(e.state),this.emit("ports",{ports:{}})}}async refreshBattery(){if(this.connected)try{this.emit("battery",{percent:await this.hub.readBattery()})}catch(e){this._log("warn",`Batería: ${e.message}`)}}async run(e,t){try{const n=await t(this.hub);return this._log("op",e),n}catch(n){this._log("error",`${e}: ${n.message}`);return}}async emergencyStop(){if(this.hub){this._log("warn","Parada de emergencia solicitada.");try{await this.hub.stopAll()}catch(e){this._log("error",`Parada: ${e.message}`)}}}async onHidden(){this.connected&&[...this.activeMotors.values()].some(e=>e!==0)&&(this._log("warn","La pestaña se ocultó con motores en marcha: se envía parada (los temporizadores del navegador pueden retrasarse)."),await this.emergencyStop())}_setState(e){e!==this.state&&(this.state=e,this.emit("state",{state:e,unsafe:this.unsafe}))}_onCore(e,t){switch(e){case"state":this._setState(t.state),this._log(t.state===f.ERROR?"error":"info",`Estado: ${t.state}${t.error?` (${t.error})`:""}`);break;case"ports":this.emit("ports",{ports:this.hub.ports()});break;case"motor":this.activeMotors.set(t.conn,t.speed),this.emit("motor",t);break;case"button":this.emit("button",t);break;case"log":t.level!=="debug"&&this._log(t.level,t.message);break}}}const d=(s,e=document)=>e.querySelector(s);function k(s,e={},...t){const n=document.createElement(s);for(const[r,o]of Object.entries(e))r.startsWith("on")&&typeof o=="function"?n.addEventListener(r.slice(2).toLowerCase(),o):o===!0?n.setAttribute(r,""):o!==!1&&o!=null&&n.setAttribute(r,o);for(const r of t.flat())n.append(r instanceof Node?r:document.createTextNode(String(r)));return n}function se(s,e){for(const t of s)t.disabled=!e}function Sn(s){const e={transport:d("#transport"),connect:d("#btn-connect"),disconnect:d("#btn-disconnect"),state:d("#state"),name:d("#hub-name"),battery:d("#battery"),estop:d("#btn-estop"),compat:d("#compat"),unsafe:d("#unsafe")},t=d("#btn-hub"),n=d("#hub-drawer"),r=d("#hub-close"),o=u=>{n.hidden=!u,t.setAttribute("aria-expanded",String(u))};o(!1),t.addEventListener("click",()=>o(n.hidden)),r.addEventListener("click",()=>o(!1)),document.addEventListener("keydown",u=>{u.key==="Escape"&&!n.hidden&&o(!1)});const i=document.querySelector(".wb-top");if(i&&typeof ResizeObserver=="function"){const u=()=>n.style.setProperty("--wb-top-h",`${i.offsetHeight}px`);u(),new ResizeObserver(u).observe(i)}const a=wt();a&&(e.compat.hidden=!1,e.compat.textContent=`${a} Puedes probar la aplicación con el simulador.`,e.transport.querySelector('option[value="web-bluetooth"]').disabled=!0,e.transport.value="simulated");const c=u=>se([e.connect,e.transport],!u);e.connect.addEventListener("click",async()=>{c(!0),o(!0),e.connect.textContent="Conectando…";try{await s.connect(e.transport.value,{acceptAll:d("#accept-all").checked})}catch{}finally{e.connect.textContent=s.unsafe?"Reconectar":"Conectar",c(!1),h()}}),e.disconnect.addEventListener("click",()=>s.disconnect()),e.estop.addEventListener("click",()=>s.emergencyStop());function h(){const{state:u}=s,g={disconnected:"sin conexión",connecting:"conectando",connected:"conectado",disconnecting:"desconectando",error:"error"};e.state.textContent=g[u]??u,e.state.className=`badge st-${u}`;const b=s.connected;e.disconnect.disabled=!(b||s.unsafe),e.estop.disabled=!b,e.transport.disabled=b,e.connect.disabled=b||u==="connecting",e.connect.textContent=s.unsafe?"Reconectar":"Conectar",e.unsafe.hidden=!s.unsafe,s.unsafe&&(e.unsafe.textContent="Estado inseguro: se perdió el enlace con el hub o el watchdog detectó que no respondía. Los controles están deshabilitados. Comprueba que los motores estén parados y reconecta."),document.querySelector("#card-sim").hidden=s.kind!=="simulated",b||(e.battery.textContent="—",s.unsafe||(e.name.textContent="—"))}s.subscribe((u,g)=>{if(u==="state"&&h(),u==="battery"&&(e.battery.textContent=`${g.percent} %`),u==="hubname"&&(e.name.textContent=g.name),u==="ports")for(const b of["A","B"])d(`#port-${b}`).textContent=g.ports[b.toLowerCase()]??"—"}),h(),setInterval(()=>s.refreshBattery(),3e4)}const An=300;function Dn(s=d("#console")){function e(t,n){const r=new Date().toLocaleTimeString(),o=k("li",{class:`lvl-${t}`},k("time",{},r)," ",n);for(s.append(o);s.children.length>An;)s.firstChild.remove();s.scrollTop=s.scrollHeight}return d("#console-clear").addEventListener("click",()=>{s.replaceChildren()}),{log:e}}const Ln=[["Apagado","off","#1a1a1a"],["Rosa","pink","#ff6ec7"],["Morado","purple","#8a2be2"],["Azul","blue","#1e5cff"],["Azul claro","light_blue","#00d5e0"],["Verde claro","light_green","#00b894"],["Verde oscuro","dark_green","#0a7d34"],["Amarillo","yellow","#ffd400"],["Naranja","orange","#ff8a00"],["Rojo","red","#e5251b"],["Blanco","white","#ffffff"]],Rn=s=>[1,3,5].map(e=>parseInt(s.slice(e,e+2),16));function On(s){const e=d("#motors"),t={};for(const l of["A","B"]){const p=k("input",{type:"range",min:-100,max:100,step:1,value:0,"aria-label":`Velocidad motor ${l}`}),y=k("output",{},"0"),E=k("button",{class:"primary"},"Girar"),$=k("button",{},"Parar"),U=k("button",{title:"Invertir dirección"},"⇄");p.addEventListener("input",()=>{y.textContent=p.value}),E.addEventListener("click",()=>s.run(`Motor ${l}: ${p.value}`,pe=>pe.motor(l).run(Number(p.value)))),$.addEventListener("click",()=>{p.value=0,y.textContent="0",s.run(`Motor ${l}: parar`,pe=>pe.motor(l).stop())}),U.addEventListener("click",()=>{p.value=-p.value,y.textContent=p.value}),e.append(k("div",{class:"motor","data-port":l},k("div",{class:"motor-head"},k("strong",{},`Motor ${l}`),k("span",{class:"dev",id:`dev-${l}`},"")),p,y,U,E,$)),t[l]={slider:p,run:E,stop:$,rev:U}}const n=k("button",{class:"primary"},"A+B: girar"),r=k("button",{},"A+B: parar");n.addEventListener("click",()=>{const l=Number(t.A.slider.value);s.run(`Motores A y B: ${l}`,async p=>{await p.motor("A").run(l),await p.motor("B").run(l)})}),r.addEventListener("click",()=>s.run("Motores A y B: parar",async l=>{await l.motor("A").stop(),await l.motor("B").stop()})),e.append(k("div",{class:"row"},n,r));const o=d("#led-presets");for(const[l,p,y]of Ln)o.append(k("button",{class:"swatch",style:`background:${y}`,title:l,"aria-label":l,onclick:()=>{d("#led-state").textContent=l,s.run(`LED: ${l}`,E=>E.led.color(p))}}));d("#led-rgb").addEventListener("change",l=>{const[p,y,E]=Rn(l.target.value);d("#led-state").textContent=`RGB ${p},${y},${E}`,s.run(`LED: rgb(${p}, ${y}, ${E})`,$=>$.led.color(p,y,E))}),d("#led-off").addEventListener("click",()=>{d("#led-state").textContent="apagado",s.run("LED: apagar",l=>l.led.color(0,0,0))});const i=()=>[...Object.values(t).flatMap(l=>[l.slider,l.run,l.stop,l.rev]),n,r,d("#led-rgb"),d("#led-off"),...o.querySelectorAll("button")];function a(l=c()){const p=s.connected;se(i(),p);for(const E of["A","B"]){const $=l[E.toLowerCase()]==="motor";se(Object.values(t[E]),p&&$);const U=l[E.toLowerCase()];d(`#dev-${E}`).textContent=U?`(${U})`:"(sin dispositivo)"}const y=["A","B"].filter(E=>l[E.toLowerCase()]==="motor").length;se([n,r],p&&y===2)}function c(){try{return s.connected?s.hub.ports():{}}catch{return{}}}s.subscribe((l,p)=>{if(l==="state"&&a(),l==="ports"&&a(p.ports),l==="motor"){const y=p.conn===1?"A":p.conn===2?"B":null;y&&p.speed===0&&Number(t[y].slider.value)}}),a();const h=d("#dist"),u=d("#dist-meter"),g=d("#tilt"),b=d("#button"),_=l=>{b.textContent=l?"pulsado":"suelto",b.className=`badge ${l?"st-connected":""}`};s.subscribe((l,p)=>{if(l==="button"&&_(p.pressed),l==="state"&&!s.connected&&(h.textContent=g.textContent=b.textContent="—",u.value=0),l==="ports"&&s.connected)try{_(s.hub.button.read())}catch{}});let w=!1;setInterval(async()=>{var l;if(!(w||!s.connected||(l=s.python)!=null&&l.running)){w=!0;try{const p=c();for(const y of["A","B"])try{if(p[y.toLowerCase()]==="distance"){const E=await s.hub.distance(y).read();h.textContent=E,u.value=E}else p[y.toLowerCase()]==="tilt"&&(g.textContent=await s.hub.tilt(y).read())}catch(E){E.name==="NoReadingError"?(p[y.toLowerCase()]==="distance"?h:g).textContent="sin lectura aún…":s.connected&&s._log("warn",`Sensor ${y}: ${E.message}`)}}finally{w=!1}}},300)}const In="modulepreload",Pn=function(s,e){return new URL(s,e).href},Fe={},$n=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){const i=document.getElementsByTagName("link"),a=document.querySelector("meta[property=csp-nonce]"),c=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(t.map(h=>{if(h=Pn(h,n),h in Fe)return;Fe[h]=!0;const u=h.endsWith(".css"),g=u?'[rel="stylesheet"]':"";if(!!n)for(let w=i.length-1;w>=0;w--){const l=i[w];if(l.href===h&&(!u||l.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${g}`))return;const _=document.createElement("link");if(_.rel=u?"stylesheet":In,u||(_.as="script"),_.crossOrigin="",_.href=h,c&&_.setAttribute("nonce",c),document.head.appendChild(_),u)return new Promise((w,l)=>{_.addEventListener("load",w),_.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${h}`)))})}))}function o(i){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=i,window.dispatchEvent(a),!a.defaultPrevented)throw i}return r.then(i=>{for(const a of i||[])a.status==="rejected"&&o(a.reason);return e().catch(o)})},jn=`"""wedopy: control del LEGO WeDo 2.0 Smart Hub desde Python.

    from wedopy import Hub

    import wedopy
    with Hub() as hub:
        hub.led.color("light_green")
        hub.motor("A").run(50)
        wedopy.task.wait(2)
        hub.motor("A").stop()

La API es síncrona en apariencia: la cooperación se expresa con las esperas de
\`\`wedopy.task\`\` y las de los recursos (\`\`wait_change\`\`), no con corrutinas.
"""
from .button import Button
from .exceptions import (
    ConnectionFailedError,
    KeyboardUnavailableError,
    NoReadingError,
    NotConnectedError,
    PortError,
    TaskCancelled,
    WedoError,
)
from .hub import Hub
from .keyboard import Key, key
from .led import LED
from .motor import Motor
from .sensors import DistanceSensor, TiltAxis, TiltSensor
from .task import Task, task

__version__ = "0.3.0"

__all__ = [
    "Hub",
    "key",
    "task",
    "Motor",
    "DistanceSensor",
    "TiltSensor",
    "TiltAxis",
    "Button",
    "Key",
    "LED",
    "Task",
    "WedoError",
    "NotConnectedError",
    "ConnectionFailedError",
    "PortError",
    "NoReadingError",
    "KeyboardUnavailableError",
    "TaskCancelled",
    "__version__",
]
`,Bn=`"""Puente síncrono entre la API Python de wedopy y la API JavaScript de la aplicación.

Funciona con Pyodide + JSPI (Chrome >= 137): \`\`run_sync\`\` bloquea el programa Python hasta que
la promesa de JavaScript se resuelve, sin congelar la página. Así, los programas escritos de
forma síncrona funcionan sin cambios.

El botón «Detener» del editor activa una bandera: la siguiente llamada del programa al hub o
a una espera lanza \`\`KeyboardInterrupt\`\` (igual que Ctrl+C).

Regla de oro para la cancelación (aprendido con trazas en Pyodide): JAMÁS se rechaza una
promesa cuyo resultado espera \`\`run_sync\`\` — eso deja continuaciones de pila huérfanas. Las
esperas se **resuelven** con un marcador ("ok" | "cancelled" | "stopped") y el código Python,
de vuelta, lanza la excepción en su propia pila (véase \`\`wedopy.task\`\`).
"""
import js
from pyodide.ffi import JsException, run_sync

from .exceptions import (
    ConnectionFailedError,
    NoReadingError,
    NotConnectedError,
    PortError,
    KeyboardUnavailableError,
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
    "KeyboardUnavailableError": KeyboardUnavailableError,
    "HubConnectionError": ConnectionFailedError,
    "DeviceNotFoundError": PortError,
    "DeviceTypeError": PortError,
    "AmbiguousDeviceError": WedoError,
    "UnsupportedFeatureError": WedoError,
    "OperationTimeout": WedoError,
    "TaskCancelled": TaskCancelled,
}


def _bridge():
    return js.wedopyBridge


def hub():
    """El hub de JavaScript (el que está conectado en el panel)."""
    js_hub = _bridge().getHub()
    if js_hub is None or js_hub is js.undefined:
        raise NotConnectedError("no hay ningún hub conectado en el panel")
    return js_hub


def task_manager():
    """El planificador de tareas de JavaScript: es del módulo, no del hub (v5 §12)."""
    return _bridge().getTask()


def key(name):
    """La selección de tecla de JavaScript (\`\`wedopy.key\`\`); valida el nombre."""
    return _bridge().key(name)


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
    return wait(js.wedopyBridge.sleep(seconds))
`,Un=`"""Botón integrado del hub (API v0.3.0): \`\`hub.button\`\`.

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
`,qn=`"""Excepciones públicas de la API Wedo.

- \`\`WedoError\`\`: base de todos los errores de la API.
- \`\`NotConnectedError\`\`: se usa un recurso con el hub desconectado, o se pierde la
  conexión durante una espera.
- \`\`ConnectionFailedError\`\`: el intento de conexión falló o fue rechazado.
- \`\`PortError\`\`: el puerto está vacío o tiene un periférico de otro tipo.
- \`\`NoReadingError\`\`: todavía no hay una lectura válida del dispositivo.
- \`\`KeyboardUnavailableError\`\`: el entorno no puede entregar eventos de teclado.

\`\`TaskCancelled\`\` deriva de \`\`BaseException\`\` (no de \`\`WedoError\`\`): un \`\`except
Exception\`\` no debe capturar por accidente la cancelación de una tarea.
"""

__all__ = [
    "WedoError",
    "NotConnectedError",
    "ConnectionFailedError",
    "PortError",
    "NoReadingError",
    "KeyboardUnavailableError",
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


class KeyboardUnavailableError(WedoError):
    """El entorno no puede entregar eventos de pulsación y liberación de teclas."""


class TaskCancelled(BaseException):
    """La tarea fue cancelada.

    Deriva de \`\`BaseException\`\` a propósito: un \`\`except Exception\`\` no debe capturarla
    por accidente. Si se captura, hay que volver a lanzarla.
    """
`,Mn=`"""El hub Wedo (LEGO WeDo 2.0 Smart Hub) (API v0.3.0).

    from wedopy import Hub

    import wedopy
    with Hub() as hub:
        hub.motor("A").run(50)
        wedopy.task.wait(2)
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
from .task import task as _task


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
            # Las tareas son del programa y no del hub (v5 §12): el bloque las espera
            # (o las cancela, en la salida por excepción) igualmente.
            if exc_type is None:
                _task._all_settled()
            else:
                _task._cancel_all()
                try:
                    _task._all_settled()
                except Exception:
                    pass
        finally:
            try:
                _bridge.wait(self._js.stopAll())
            except Exception:
                pass

    def __repr__(self) -> str:
        return "Hub()"
`,Fn=`"""Teclado (API v0.3.0): \`\`wedopy.key(name)\`\` (del módulo, v5 §10).

    space = wedopy.key("space")
    space.read()                    -> bool (¿está presionada?)
    space.has_change("pressed")     -> bool (consume los cambios pendientes)
    space.wait_change("released")   -> str  (tipo consumido)

El teclado NO forma parte del hub físico: no requiere crear un \`\`Hub\`\` ni que esté
conectado, y sus recursos no aparecen en \`\`ports()\`\`. Cada tecla se comporta como
\`\`hub.button\`\` con los mismos filtros (\`\`"pressed"\`\` y \`\`"released"\`\`), y las esperas
de teclas no terminan con \`\`NotConnectedError\`\` aunque el hub se desconecte.
"""
from . import _bridge


class Key:
    """Una tecla del teclado, seleccionada por su nombre."""

    def __init__(self, js_key) -> None:
        self._js = js_key

    @property
    def name(self) -> str:
        """El nombre de la tecla (\`\`"up"\`\`, \`\`"space"\`\`, ...)."""
        return str(self._js.name)

    def read(self) -> bool:
        """True si la tecla está presionada. Siempre tiene estado: nunca lanza NoReadingError."""
        return bool(_bridge.call(self._js.read))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("pressed" / "released")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return f"Key('{self._js.name}')"


def _key_name(name) -> str:
    """Validación del nombre de tecla: cadena no vacía (el detalle lo valida JavaScript)."""
    if isinstance(name, bool) or not isinstance(name, str):
        raise TypeError("key: la tecla esperaba una cadena y recibió %s" % type(name).__name__)
    if not name:
        raise ValueError('tecla "" no válida (teclas válidas: a-z, 0-9, up, down, left, right, space, enter, escape, tab, backspace, shift, control, alt)')
    return name


def key(name) -> Key:
    """Selecciona una tecla: \`\`wedopy.key("space")\`\`.

    No requiere crear un \`\`Hub\`\` ni que esté conectado. El conjunto de nombres es
    cerrado, así que un nombre desconocido lanza \`\`ValueError\`\` al seleccionar la tecla,
    no al usarla; \`\`KeyboardUnavailableError\`\`, al usarla.
    """
    return Key(_bridge.call(_bridge.key, _key_name(name)))
`,Wn=`"""LED integrado del hub (API v0.3.0): \`\`hub.led\`\`.

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
`,Hn=`"""Motores (API v0.3.0).

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
`,zn=`"""Sensores de distancia e inclinación (API v0.3.0).

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
`,Kn=`"""Concurrencia cooperativa (API v0.3.0): \`\`wedopy.task\`\` (del módulo, v5 §12).

    task = wedopy.task.spawn(movement)   # movement es un invocable sin parámetros
    wedopy.task.wait(1)                  # suspende el flujo actual
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
el runtime lo informa por el registrador \`\`"wedopy"\`\` (nivel ERROR, con traceback) y no
propaga el error a quien la creó.
"""
import logging
import sys

from . import _bridge
from .exceptions import TaskCancelled

_log = logging.getLogger("wedopy")

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
            "wedopy.task: wait esperaba un número mayor o igual que 0 y recibió %r" % (value,)
        )
    return float(value)


class Task:
    """Una tarea concurrente creada con \`\`wedopy.task.spawn\`\`."""

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
    """El espacio de nombres \`\`wedopy.task\`\` (instancia única: hay un planificador
    por proceso; las tareas son del programa y no del hub, v5 §12)."""

    @property
    def _manager(self):
        """El planificador de JavaScript, que vive en el puente del runtime."""
        return _bridge.task_manager()

    def _all_settled(self) -> None:
        """Espera cooperativamente a que terminen todas las tareas (lo usa el \`\`with\`\`)."""
        _bridge.wait(_bridge.call(self._manager.allSettled))

    def _cancel_all(self) -> None:
        """Pide la cancelación de todas las tareas en ejecución (lo usa el \`\`with\`\`)."""
        _bridge.call(self._manager.cancelAll)

    def spawn(self, function) -> Task:
        """Crea y programa una tarea; devuelve su referencia."""
        if not callable(function):
            raise TypeError("spawn esperaba un invocable y recibió %s" % type(function).__name__)
        task = Task(self._manager, function)
        _bridge.call(self._manager.spawn, task._id, task._entry)
        return task

    def wait(self, seconds: float) -> None:
        """Suspende la ejecución actual durante \`\`seconds\`\` segundos (cooperativo)."""
        task_id = _current_task_id()
        _resolve_marker(_bridge.wait(_bridge.call(self._manager.wait, task_id, _seconds(seconds))))
        _check_cancelled(task_id)


# La instancia del módulo: \`\`wedopy.task\`\`.
task = TaskNamespace()
`,Gn=Object.assign({"./wedopy/__init__.py":jn,"./wedopy/_bridge.py":Bn,"./wedopy/button.py":Un,"./wedopy/exceptions.py":qn,"./wedopy/hub.py":Mn,"./wedopy/keyboard.py":Fn,"./wedopy/led.py":Wn,"./wedopy/motor.py":Hn,"./wedopy/sensors.py":zn,"./wedopy/task.py":Kn}),Vn=`
import time
from wedopy import _bridge
time.sleep = _bridge.sleep   # sleep cooperativo: cede a la página y admite «Detener»
`;class Jn{constructor({getHub:e,onOutput:t=()=>{},loader:n,indexURL:r}){this._getHub=e,this._out=t,this._loader=n,this._indexURL=r,this.py=null,this._loading=null,this._stop=!1,this._running=!1,this._sleepers=new Set,this._current=null}get running(){return this._running}get ready(){return this.py!==null}init(e=()=>{}){return this._loading??(this._loading=this._init(e).catch(t=>{throw this._loading=null,t})),this._loading}async _init(e){e("Cargando Python (solo la primera vez)…");const{loadPyodide:t}=await this._loader(),n=await t(this._indexURL?{indexURL:this._indexURL}:{});if(!await n.runPythonAsync(`from pyodide.ffi import can_run_sync
can_run_sync()`))throw new le("Este navegador no admite JSPI (WebAssembly JavaScript Promise Integration), necesario para ejecutar programas Python síncronos. Usa Chrome o Edge 137 o posterior.");n.setStdout({batched:o=>this._out("stdout",o)}),n.setStderr({batched:o=>this._out("stderr",o)}),n.FS.mkdirTree("/home/pyodide/wedopy");for(const[o,i]of Object.entries(Gn))n.FS.writeFile(`/home/pyodide/wedopy/${o.split("/").pop()}`,i);return globalThis.wedopyBridge={getHub:()=>this._getHub()??void 0,getTask:()=>Be,key:o=>wn(o),stopRequested:()=>{const o=this._stop;return this._stop=!1,o},sleep:o=>new Promise(i=>{const a=()=>{clearTimeout(c),this._sleepers.delete(a),i()},c=setTimeout(a,o*1e3);this._sleepers.add(a),this._stop&&a()})},await n.runPythonAsync(`import asyncio
asyncio.get_event_loop()._keyboard_interrupt_handler = lambda: None`),await n.runPythonAsync(Vn),this.py=n,e("Python listo."),n}async run(e){if(this._running){this.stop();try{await this._current}catch{}this._stop=!1}if(await this.init(),this._running){this.stop();try{await this._current}catch{}this._stop=!1}return this._running=!0,this._stop=!1,En(),this._current=this._execute(e),this._current}async _execute(e){const t=this.py.globals.get("dict")();try{return await this.py.runPythonAsync(e,{globals:t}),{ok:!0,stopped:!1,error:null}}catch(n){if((n==null?void 0:n.type)==="KeyboardInterrupt")return{ok:!1,stopped:!0,error:null};const r=(n==null?void 0:n.message)??String(n);return this._out("stderr",r.endsWith(`
`)?r:`${r}
`),{ok:!1,stopped:!1,error:r}}finally{this._running=!1,t.destroy();const n=this._getHub();if(n!=null&&n.isConnected)try{await n.stopAll()}catch{}try{yn()}catch{}}}stop(){if(this._running){this._stop=!0;for(const e of[...this._sleepers])e();try{Be.interruptAll()}catch{}}}}function Yn(s="./"){const e=`${new URL(`${s}pyodide/`,globalThis.location.href).href}`;return{indexURL:e,loader:()=>$n(()=>import(`${e}pyodide.mjs`),[],import.meta.url)}}const Y=s=>s.replace(/[&<>]/g,e=>e==="&"?"&amp;":e==="<"?"&lt;":"&gt;"),Qn=new Set(["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield","match","case"]),Xn=new Set(["True","False","None","self","cls"]),Zn=new Set(["print","len","range","input","open","str","int","float","bool","bytes","list","dict","set","tuple","frozenset","abs","min","max","round","sum","sorted","reversed","enumerate","zip","map","filter","any","all","isinstance","issubclass","type","object","super","dir","repr","hash","hex","oct","bin","ord","chr","divmod","pow","format","id","getattr","setattr","hasattr","callable","iter","next","Exception","KeyboardInterrupt","ValueError","TypeError","RuntimeError","IndexError","KeyError","AttributeError","OSError","StopIteration","ZeroDivisionError","TimeoutError"]),ke=/(?<cmt>#.*)|(?<str>"""[\s\S]*?"""|'''[\s\S]*?'''|(?:[fFrRbBuU]{0,2})"(?:\\[\s\S]|[^"\\\n])*"|(?:[fFrRbBuU]{0,2})'(?:\\[\s\S]|[^'\\\n])*')|(?<dec>@[\w.]+)|(?<num>\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?|\.\d+(?:[eE][+-]?\d+)?)\b)|(?<id>[^\W\d]\w*)|(?<ws>[ \t]+)|(?<any>[\s\S])/g;function es(s){ke.lastIndex=0;let e="",t=0,n;for(;n=ke.exec(s);){n.index>t&&(e+=Y(s.slice(t,n.index))),t=n.index+n[0].length;const r=n.groups;let o=null,i=n[0];if(r.cmt)o="cmt";else if(r.str)o="str";else if(r.dec)o="dec";else if(r.num)o="num";else if(r.id){const a=r.id;if(i=a,Qn.has(a))o="kw";else if(Xn.has(a))o="kw2";else if(Zn.has(a))o="builtin";else{let c=Math.min(s.length,n.index+a.length);for(;c<s.length&&(s[c]===" "||s[c]==="	");)c+=1;s[c]==="("&&(o="fn")}}e+=o?`<span class="${o}">${Y(i)}</span>`:Y(i),n[0].length===0&&(ke.lastIndex+=1)}return t<s.length&&(e+=Y(s.slice(t))),e}function ts({host:s,onChange:e=()=>{}}){const t=k("div",{class:"py-gutter","aria-hidden":"true"}),n=k("div",{class:"py-surface"}),r=k("pre",{class:"py-hl","aria-hidden":"true"}),o=k("textarea",{id:"py-code",class:"py-input",wrap:"off",spellcheck:"false",autocapitalize:"off",autocorrect:"off","aria-label":"Código Python"});n.append(r,o),s.classList.add("py-editor"),s.append(t,n);function i(){const c=o.value;r.innerHTML=es(c)+(c.endsWith(`
`)?"":`
`);const h=c.split(`
`).length;let u="";for(let g=1;g<=h;g+=1)u+=`<span>${g}</span>`;t.innerHTML=u,t.scrollTop=o.scrollTop}function a(){r.scrollTop=o.scrollTop,r.scrollLeft=o.scrollLeft,t.scrollTop=o.scrollTop}return o.addEventListener("input",()=>{i(),e(o.value)}),o.addEventListener("scroll",a),o.addEventListener("keydown",c=>{if(c.key!=="Tab")return;c.preventDefault();const{selectionStart:h,selectionEnd:u}=o;o.setRangeText("    ",h,u,"end"),o.dispatchEvent(new Event("input"))}),i(),{textarea:o,setValue(c){o.value=c,i()},getValue(){return o.value},focus(){o.focus()}}}function re(s){return`${String(s??"").trim().replace(/[\\/:*?"<>| -]+/g,"-").replace(/^\.+/,"").slice(0,80).replace(/\.py$/i,"")||"mi_programa"}.py`}function ns(s="mi_programa.py"){const e=document.querySelector("#dlg-export"),t=document.querySelector("#export-name"),n=document.querySelector("#export-form"),r=document.querySelector("#export-cancel");return!e||!t||!n?Promise.resolve(re(s)):(t.value=re(s),e.showModal(),t.focus(),t.select(),new Promise(o=>{const i=()=>{const a=e.returnValue==="ok";o(a?re(t.value):null)};n.addEventListener("submit",a=>{a.preventDefault(),e.close("ok")},{once:!0}),r==null||r.addEventListener("click",()=>e.close("cancel"),{once:!0}),e.addEventListener("close",i,{once:!0})}))}function ss(s,e="mi_programa.py"){const t=new Blob([s],{type:"text/x-python;charset=utf-8"}),n=URL.createObjectURL(t),r=Object.assign(document.createElement("a"),{href:n,download:e});document.body.append(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function rs(s,e=t=>{throw t}){const t=Object.assign(document.createElement("input"),{type:"file",accept:".py,text/x-python"});t.addEventListener("change",async()=>{var r;const n=(r=t.files)==null?void 0:r[0];if(n)try{s(await n.text(),n.name)}catch(o){e(o)}}),t.click()}const We="wedopy.python.program",Ce="wedopy.python.fileName",He="wedopy.python.fontSize",ze="mi_programa.py",Ke=10,Ge=18,Ve=1;function os(s){const e=d("#btn-font-down"),t=d("#btn-font-up");if(!e||!t)return;const n=()=>parseFloat(getComputedStyle(s).getPropertyValue("--py-fs"))||13.5,r=()=>{const a=n();e.disabled=a<=Ke,t.disabled=a>=Ge;const c=`Tamaño del texto del código: ${a} px`;e.title=`${c} (reducir)`,t.title=`${c} (aumentar)`},o=a=>{const c=Math.min(Ge,Math.max(Ke,a));s.style.setProperty("--py-fs",`${c}px`);try{localStorage.setItem(He,String(c))}catch{}r()};let i=null;try{i=parseFloat(localStorage.getItem(He))}catch{}Number.isFinite(i)&&s.style.setProperty("--py-fs",`${i}px`),r(),e.addEventListener("click",()=>o(n()-Ve)),t.addEventListener("click",()=>o(n()+Ve))}const is=`"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
import wedopy
from wedopy import Hub

with Hub() as hub:
    motor = hub.motor("A")

    def blink():
        for _ in range(10):
            hub.led.color("yellow")
            wedopy.task.wait(0.3)
            hub.led.color("white")
            wedopy.task.wait(0.3)

    def move():
        try:                      # cancelling a task never stops the motor by itself
            motor.run(75)
            wedopy.task.wait(3)
        finally:
            motor.stop()

    wedopy.task.spawn(blink)
    wedopy.task.spawn(move)
    # On leaving the block, the runtime waits for every task to finish.
`;function as(s,{runtime:e}={}){const t=d("#py-out"),n=d("#py-status"),r=d("#py-run"),o=d("#py-stop"),i=_=>{try{localStorage.setItem(We,_)}catch{}},a=ts({host:d("#py-editor"),onChange:_=>i(_)});os(d("#py-editor"));const c=(_,w)=>{t.append(k("span",{class:_==="stderr"?"err":""},w.endsWith(`
`)?w:`${w}
`)),t.scrollTop=t.scrollHeight},h=e??new Jn({getHub:()=>s.hub,onOutput:c,...Yn()});s.python=h;let u="";try{u=localStorage.getItem(We)??""}catch{}a.setValue(u||is);let g=ze;try{g=localStorage.getItem(Ce)||ze}catch{}d("#py-export").addEventListener("click",async()=>{const _=await ns(g);if(!_){n.textContent="Exportación cancelada.";return}g=_;try{localStorage.setItem(Ce,_)}catch{}ss(a.getValue(),_),n.textContent=`Programa exportado como ${_}`}),d("#py-import").addEventListener("click",()=>{rs((_,w)=>{a.setValue(_),i(_),g=re(w);try{localStorage.setItem(Ce,g)}catch{}n.textContent=`Importado «${w}» — listo para ejecutar.`},_=>{n.textContent="",c("stderr",`Importación: ${_.message}
`)})});let b=0;r.addEventListener("click",()=>{const _=++b,w=h.running;t.replaceChildren(),o.disabled=!1,w&&c("stderr",`⏹ se interrumpe el programa anterior…
`),n.textContent=w?"Interrumpiendo el programa anterior…":"Ejecutando…",h.run(a.getValue()).then(l=>{_===b&&(n.textContent=l.stopped?"Detenido.":l.ok?"Terminado.":"Terminó con error.",o.disabled=!0,l.stopped&&c("stdout","[programa detenido]"))}).catch(l=>{_===b&&(n.textContent="",c("stderr",l.message),o.disabled=!0)})}),o.addEventListener("click",()=>{h.stop()}),document.addEventListener("keydown",_=>{_.key!=="Enter"||!(_.ctrlKey||_.metaKey)||(_.preventDefault(),r.click())})}function cs(s){const e=()=>s.sim;for(const o of["A","B"]){const i=d(`#sim-${o}`);i.value=s.simDevices[o]??"",i.addEventListener("change",()=>{const a=i.value;a?s.simDevices[o]=a:delete s.simDevices[o],!(!e()||!s.connected)&&(a?e().attach(o,a):e().detach(o),s._log("info",`Simulador: puerto ${o} → ${a||"vacío"}`))})}d("#sim-dist").addEventListener("input",o=>{var i;s.simDistance=Number(o.target.value),(i=e())==null||i.setDistance(s.simDistance)}),d("#sim-tilt").addEventListener("change",o=>{var i;return(i=e())==null?void 0:i.setTiltDirection(o.target.value)});const t=d("#sim-press"),n=()=>{var o;return(o=e())==null?void 0:o.press()},r=()=>{var o;return(o=e())==null?void 0:o.release()};t.addEventListener("pointerdown",n),t.addEventListener("pointerup",r),t.addEventListener("pointerleave",r),d("#sim-drop").addEventListener("click",()=>{var o;s._log("warn","Simulador: pérdida de enlace inyectada."),(o=e())==null||o.dropLink()}),d("#sim-freeze").addEventListener("change",o=>{var i,a;o.target.checked?(i=e())==null||i.freeze():(a=e())==null||a.unfreeze(),s._log("warn",`Simulador: hub ${o.target.checked?"sin responder (sin ACK)":"responde de nuevo"}.`)})}const Je="wedopy.theme",Q=["auto","light","dark"],ls={auto:"🌗",light:"☀️",dark:"🌙"},Ye={auto:"Tema del sistema (auto)",light:"Tema claro",dark:"Tema oscuro (Dracula)"},Ne={light:"#f4f5fa",dark:"#282a36"};function ds(s){let e;try{e=localStorage.getItem(Je)}catch{}Q.includes(e)||(e="auto");const t=()=>{e==="auto"?document.documentElement.removeAttribute("data-theme"):document.documentElement.setAttribute("data-theme",e),s.textContent=ls[e],s.setAttribute("aria-label",Ye[e]),s.title=Ye[e];for(const n of document.querySelectorAll('meta[name="theme-color"]'))n.content=e==="auto"?n.media.includes("light")?Ne.light:Ne.dark:Ne[e==="light"?"light":"dark"]};s.addEventListener("click",()=>{e=Q[(Q.indexOf(e)+1)%Q.length];try{localStorage.setItem(Je,e)}catch{}t()}),t()}const P=new xn,fe=Dn();P.subscribe((s,e)=>{s==="log"&&fe.log(e.level,e.message)});Sn(P);On(P);cs(P);as(P);ds(d("#btn-theme"));document.addEventListener("visibilitychange",()=>{document.hidden&&P.onHidden()});fe.log("info",P.supportsBluetooth?"Web Bluetooth disponible. Pulsa «Conectar» y elige tu Smart Hub.":"Web Bluetooth no disponible en este navegador: usa el simulador.");fe.log("debug",`Diagnóstico: isSecureContext=${window.isSecureContext}, navigator.bluetooth=${!!navigator.bluetooth}, origen=${location.origin}`);var X,Qe;(Qe=(X=navigator.bluetooth)==null?void 0:X.getAvailability)==null||Qe.call(X).then(s=>fe.log(s?"info":"warn",s?"Adaptador Bluetooth disponible.":"El navegador no ve ningún adaptador Bluetooth (¿servicio bluetooth apagado?).")).catch(()=>{});window.wedopyApp=P;
