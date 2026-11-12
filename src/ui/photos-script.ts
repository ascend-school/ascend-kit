//
//  photos-script.ts
//  ascend-kit
//
//  Created by Venumadhav on 12/11/26.
//

/**
 * F-16: the ID-card photo roster, served as /_ui/photos.js on that page only. Without it each row is a plain form (pick
 * or take a photo, then Save). With it, taking the photo is enough: it is shrunk on the phone (800 px, JPEG 0.85, a
 * few tens of KB), sent at once, the row's picture changes and the next student's Take photo button gets the focus.
 * Written without template literals so it can live in this string.
 */
export const PHOTOS_SCRIPT = String.raw`(function(){
var forms=document.querySelectorAll("form.photo-take");if(!forms.length||!window.fetch||!HTMLCanvasElement.prototype.toBlob)return;
function shrink(f){return new Promise(function(ok,ko){var u=URL.createObjectURL(f),i=new Image();
  i.onload=function(){var k=Math.min(1,800/Math.max(i.naturalWidth,i.naturalHeight)),c=document.createElement("canvas");c.width=Math.round(i.naturalWidth*k);c.height=Math.round(i.naturalHeight*k);
    c.getContext("2d").drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?ok(b):ko(new Error("The photo couldn't be read."))},"image/jpeg",0.85)};
  i.onerror=function(){URL.revokeObjectURL(u);ko(new Error("That file isn't a photo."))};i.src=u})}
function count(){var h=document.querySelector("#ph-roster h2"),all=document.querySelectorAll("form.photo-take").length,has=document.querySelectorAll("img.photo-thumb:not([hidden])").length;if(h)h.textContent=has+" of "+all+" have a photo"}
Array.prototype.forEach.call(forms,function(form,n){
  var input=form.querySelector("input[type=file]"),save=form.querySelector("button[type=submit]"),state=form.querySelector(".photo-state"),row=form.closest("tr"),img=row&&row.querySelector("img.photo-thumb");
  var take=form.querySelector("label.btn");if(save)save.style.display="none";if(take){take.style.display="";input.hidden=true;take.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();input.click()}})}
  input.addEventListener("change",function(){var f=input.files&&input.files[0];if(!f)return;state.textContent="Saving…";
    shrink(f).then(function(b){var fd=new FormData();fd.append("file",new File([b],"photo.jpg",{type:"image/jpeg"}));
      return fetch(form.action,{method:"POST",body:fd,headers:{accept:"application/json"},credentials:"same-origin"}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||"Not saved");return j})})})
    .then(function(j){state.textContent="Saved";state.className="photo-state mark paid";if(img&&j.photo){img.src="/documents/"+j.photo;img.hidden=false;var none=row.querySelector(".photo-none");if(none)none.remove()}input.value="";count();
      var next=forms[n+1];if(next){var l=next.querySelector("label.btn");if(l)l.focus()}},
      function(e){state.textContent=e.message;state.className="photo-state mark due";input.value=""})})});
})();`;

/** The script tag for the roster page, with a version token. */
export const PHOTOS_SCRIPT_TAG = `<script src="/_ui/photos.js?v=${[...PHOTOS_SCRIPT].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(36)}" defer></script>`;
