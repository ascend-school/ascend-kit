//
//  queue-script.ts
//  ascend-kit
//
//  Created by Venumadhav on 12/11/26.
//

/**
 * F-12: the phone queue for answer scripts, served as /_ui/queue.js on the upload page only. The page renders the plain
 * form (it works without this) and a hidden #pq block; this script shows #pq instead and:
 * - opens the camera, adds each photo as a page, and shrinks it on the phone (1800 px, JPEG 0.75);
 * - keeps each queued script in the browser's IndexedDB until the server has it, so a dropped connection, a reload or a
 *   closed tab never loses a photo; each carries its own id (ref), so a repeated upload is the same script;
 * - uploads one at a time with progress, retrying when back online and every 20 s;
 * - asks the server to mark two at a time, and polls the paper's state every 15 s (picking up scripts left waiting).
 * Plain DOM, no libraries; written without template literals so it can live in this string.
 */
export const QUEUE_SCRIPT = String.raw`(function(){
var root=document.getElementById("pq"),plain=document.getElementById("pq-plain");
if(!root||!window.indexedDB||!window.fetch||!window.FormData||!HTMLCanvasElement.prototype.toBlob)return;
root.hidden=false;if(plain)plain.hidden=true;
var base=root.dataset.base,paper=root.dataset.paper,max=root.dataset.max,MAXPX=1800,Q=0.75,MAKERS=2;
function $(id){return document.getElementById(id)}
var sel=$("pq-student"),cam=$("pq-cam"),pick=$("pq-pick"),pagesEl=$("pq-pages"),undo=$("pq-undo"),hint=$("pq-hint"),add=$("pq-add"),list=$("pq-list"),sum=$("pq-sum"),off=$("pq-offline"),alt=$("pq-alt");
var pages=[],items=[],db=null,uploading=false,marking=0;
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function mb(n){return (n/1048576).toFixed(1)+" MB"}
function newRef(){var a=new Uint8Array(12);crypto.getRandomValues(a);return "q"+Array.prototype.map.call(a,function(b){return("0"+b.toString(16)).slice(-2)}).join("")}
function idb(){return new Promise(function(ok,ko){var r=indexedDB.open("ascend-script-queue",1);r.onupgradeneeded=function(){r.result.createObjectStore("items",{keyPath:"ref"})};r.onsuccess=function(){ok(r.result)};r.onerror=function(){ko(r.error)}})}
function tx(mode,fn){return new Promise(function(ok,ko){var t=db.transaction("items",mode),q=fn(t.objectStore("items"));t.oncomplete=function(){ok(q&&q.result)};t.onerror=function(){ko(t.error)}})}
function save(it){return tx("readwrite",function(s){return s.put({ref:it.ref,paper:it.paper,student:it.student,name:it.name,pages:it.pages,size:it.size,at:it.at})})}
function drop(ref){return tx("readwrite",function(s){return s.delete(ref)})}
function shrink(f){return new Promise(function(ok,ko){
  if(!/^image\//.test(f.type)){ko(new Error("That file isn't a photo."));return}
  var u=URL.createObjectURL(f),i=new Image();
  i.onload=function(){var k=Math.min(1,MAXPX/Math.max(i.naturalWidth,i.naturalHeight)),c=document.createElement("canvas");
    c.width=Math.round(i.naturalWidth*k);c.height=Math.round(i.naturalHeight*k);c.getContext("2d").drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);
    c.toBlob(function(b){b?ok(b):ko(new Error("The photo couldn't be read."))},"image/jpeg",Q)};
  i.onerror=function(){URL.revokeObjectURL(u);ko(new Error("The photo couldn't be read."))};i.src=u})}
function showPages(){pagesEl.textContent="";pages.forEach(function(b,n){var li=el("li"),im=el("img");im.src=URL.createObjectURL(b);im.alt="Page "+(n+1);li.appendChild(im);li.appendChild(el("span",null,String(n+1)));pagesEl.appendChild(li)});
  undo.hidden=!pages.length;add.disabled=!pages.length||!sel.value;
  var size=pages.reduce(function(a,b){return a+b.size},0);
  add.textContent=pages.length?"Add to queue ("+pages.length+(pages.length===1?" page":" pages")+", "+mb(size)+")":"Add to queue";
  hint.textContent=pages.length?"Take the next page, or add this script to the queue.":"Take a photo of each page, in order."}
function takeFiles(fs){var a=Array.prototype.slice.call(fs);if(!a.length)return;hint.textContent="Shrinking the photo…";
  a.reduce(function(p,f){return p.then(function(){return shrink(f).then(function(b){if(pages.length<20)pages.push(b)})})},Promise.resolve())
   .then(showPages,function(e){showPages();hint.textContent=e.message})}
cam.addEventListener("change",function(){takeFiles(cam.files);cam.value=""});
pick.addEventListener("change",function(){takeFiles(pick.files);pick.value=""});
undo.addEventListener("click",function(){pages.pop();showPages()});
sel.addEventListener("change",showPages);
function nextStudent(){var o=sel.options,i=sel.selectedIndex;for(var k=1;k<=o.length;k++){var j=(i+k)%o.length;if(o[j].value&&!o[j].dataset.queued){sel.selectedIndex=j;return}}}
add.addEventListener("click",function(){if(!pages.length||!sel.value)return;var o=sel.options[sel.selectedIndex];
  var it={ref:newRef(),paper:paper,student:sel.value,name:o.dataset.name||o.textContent,pages:pages.slice(),size:pages.reduce(function(a,b){return a+b.size},0),at:Date.now(),state:"saved",tries:0,next:0,id:null};
  save(it).then(function(){items.unshift(it);o.dataset.queued="1";o.textContent=it.name+" · queued";pages=[];nextStudent();showPages();render();pump()},function(){hint.textContent="The phone's storage is full. Upload the queue before adding more."})});
var STATES={saved:["info","Saved on phone"],uploading:["sent","Uploading"],waiting:["info","Uploaded, waiting to mark"],marking:["sent","Marking"],evaluated:["paid","Suggested"],confirmed:["paid","Confirmed"],failed:["due","Failed"],rejected:["due","Not uploaded"]};
function render(){list.textContent="";var marked=0,onPhone=0;
  items.forEach(function(it){var st=STATES[it.state]||STATES.saved,li=el("li"),who=el("span","what");
    who.appendChild(el("strong",null,it.name));who.appendChild(el("span",null,it.pages?(it.pages.length+(it.pages.length===1?" page · ":" pages · ")+mb(it.size)):"Uploaded earlier"));
    var label=st[1];if(it.state==="uploading"&&it.pct!=null)label+=" "+it.pct+"%";if(it.state==="evaluated"&&it.score!=null)label+=" "+it.score+" / "+max;
    if(it.state==="saved"&&it.tries)label="Saved on phone, will retry";if(it.state==="rejected"&&it.error)label+=": "+it.error;
    var m=el("span","mark "+st[0],label),cell=m;
    if(it.id&&(it.state==="evaluated"||it.state==="failed"||it.state==="confirmed")){cell=el("a");cell.href="/exams/s/"+it.id;cell.appendChild(m)}
    li.appendChild(who);li.appendChild(cell);list.appendChild(li);
    if(it.state==="evaluated"||it.state==="confirmed")marked++;if(it.state==="saved"||it.state==="uploading")onPhone++});
  sum.textContent=items.length?items.length+" queued · "+marked+" marked":"Nothing queued yet.";
  off.hidden=navigator.onLine||!onPhone;off.style.display=off.hidden?"none":"";off.textContent="Offline: "+onPhone+" saved on the phone. They send when you are back online."}
function upload(it){return new Promise(function(done){
  var fd=new FormData();fd.append("student_id",it.student);fd.append("ref",it.ref);
  it.pages.forEach(function(b,n){fd.append("pages",new File([b],"page-"+(n+1)+".jpg",{type:"image/jpeg"}))});
  var x=new XMLHttpRequest();x.open("POST",base+"/queue");x.setRequestHeader("accept","application/json");
  x.upload.onprogress=function(e){if(e.lengthComputable){it.pct=Math.round(e.loaded*100/e.total);render()}};
  x.onload=function(){var j={};try{j=JSON.parse(x.responseText)}catch(e){}
    if(x.status===200&&j.id){it.id=j.id;it.state="waiting";it.pct=null;drop(it.ref);done(true)}
    else if(x.status>=400&&x.status<500&&x.status!==408&&x.status!==429){it.state="rejected";it.error=j.error||("error "+x.status);drop(it.ref);done(true)}
    else fail()};
  x.onerror=x.ontimeout=fail;x.timeout=180000;it.state="uploading";it.pct=0;render();x.send(fd);
  function fail(){it.state="saved";it.pct=null;it.tries++;it.next=Date.now()+Math.min(20000*it.tries,60000);done(false)}})}
function pump(){render();
  if(!uploading&&navigator.onLine){var now=Date.now(),it=null;for(var i=items.length-1;i>=0;i--){if(items[i].state==="saved"&&items[i].next<=now){it=items[i];break}}
    if(it){uploading=true;upload(it).then(function(){uploading=false;pump()})}}
  while(marking<MAKERS){var w=null;for(var k=items.length-1;k>=0;k--){if(items[k].state==="waiting"&&items[k].id&&!items[k].asked){w=items[k];break}}if(!w)break;mark(w)}}
function mark(it){marking++;it.asked=true;it.state="marking";render();
  fetch("/exams/s/"+it.id+"/mark",{method:"POST",headers:{accept:"application/json"},credentials:"same-origin"}).then(function(r){return r.json().then(function(j){return[r.status,j]})})
   .then(function(a){var j=a[1];if(a[0]===200){it.state=j.status==="pending"?"marking":j.status;it.score=j.score}else{it.state="waiting";it.asked=false;it.next=Date.now()+20000}},function(){it.state="waiting";it.asked=false})
   .then(function(){marking--;pump()})}
function poll(){if(!navigator.onLine)return;fetch(base+"/state",{headers:{accept:"application/json"},credentials:"same-origin"}).then(function(r){return r.ok?r.json():null}).then(function(j){if(!j)return;
  j.rows.forEach(function(r){if(!r.id)return;var it=null;for(var i=0;i<items.length;i++)if(items[i].id===r.id||(r.ref&&items[i].ref===r.ref))it=items[i];
    if(!it){if(r.status!=="pending")return;it={ref:r.ref||r.id,student:r.student_id,name:r.student,pages:null,state:"waiting",id:r.id,tries:0,next:0};items.push(it)}
    if(it.state==="uploading"||it.state==="saved")return;it.id=r.id;
    if(r.status==="pending"){if(!it.asked)it.state=r.marking?"marking":"waiting"}else{it.state=r.status;it.score=r.score;it.asked=false}});pump()},function(){})}
window.addEventListener("online",function(){items.forEach(function(it){if(it.state==="saved")it.next=0});pump();poll()});
window.addEventListener("offline",render);
if(alt)alt.addEventListener("click",function(e){e.preventDefault();root.hidden=true;if(plain)plain.hidden=false});
idb().then(function(d){db=d;return tx("readonly",function(s){return s.getAll()})}).then(function(rows){
  (rows||[]).filter(function(r){return r.paper===paper}).sort(function(a,b){return b.at-a.at}).forEach(function(r){r.state="saved";r.tries=0;r.next=0;r.id=null;items.push(r);
    for(var i=0;i<sel.options.length;i++)if(sel.options[i].value===r.student){sel.options[i].dataset.queued="1";sel.options[i].textContent=r.name+" · queued"}});
  if(sel.options[sel.selectedIndex]&&sel.options[sel.selectedIndex].dataset.queued)nextStudent();showPages();pump();poll()},function(){hint.textContent="This browser can't keep photos. Use the plain form below."});
setInterval(function(){pump();poll()},15000);
})();`;

/** The script tag for the upload page, with a version token so phones fetch a changed script. */
export const QUEUE_SCRIPT_TAG = `<script src="/_ui/queue.js?v=${[...QUEUE_SCRIPT].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(36)}" defer></script>`;
