function Y(B,T){if(B.length!==T.length)return!1;for(let E=0;E<B.length;E++)if(B[E]!==T[E])return!1;return!0}function M(){if(!R)R=!0,Promise.resolve().then(m)}function m(){R=!1;const B=new Set;while(A.size>0){const T=new Set(A);A.clear();for(let E of T){if(B.has(E))continue;if("recompute"in E){B.add(E),E.recompute();const I=E.get(),L=E;for(let j of L.subscribers)j(I)}}for(let E of T){if(B.has(E))continue;if(!("recompute"in E)){B.add(E);const I=E,L=E.get();for(let j of I.subscribers)j(L)}}for(let E of B){const I=E;for(let L of I.dependents)if(!B.has(L))A.add(L)}}}function U(B,T,E){B.clear();for(let I of T)I.removeDependency(E);T.clear()}function W(B,T){B.add(T)}function Z(B,T){B.delete(T)}function Q(B){let T=structuredClone(B);const E=new Set,I=new Set,L={get(){if(k)k.addDependency(L),W(I,k);return T},set(j){if(T!==j)T=structuredClone(j),A.add(L),M()},subscribe(j){return E.add(j),j(T),()=>{if(E.delete(j),E.size===0&&I.size===0)U(E,I,L)}},subscribers:E,dependents:I,addDependency(j){I.add(j)},removeDependency(j){I.delete(j)}};return[L.get,L.set,L.subscribe]}function f(B){let T;const E=new Set,I=new Set,L=new Set;let j=[];const N={get(){if(k&&k!==N)k.addDependency(N),W(L,k);return T},set(J){throw new Error("Cannot set value of a computed state")},subscribe(J){return E.add(J),J(T),()=>{if(E.delete(J),E.size===0&&I.size===0&&L.size===0)U(E,L,N)}},recompute(){for(let K of I)Z(K.dependents,N);I.clear();const J=k;k=N;const $=B(),H=Array.from(I);if(!Y(j,H))T=structuredClone($),j=H;if(k=J,T!==$)T=structuredClone($),A.add(N),M()},addDependency(J){I.add(J)},removeDependency(J){I.delete(J)},subscribers:E,dependents:L};return N.recompute(),[N.get,N.subscribe]}function O(B,T){let E=structuredClone(T);const I=new Set,L=new Set,j=new Set;let N=[],J=null;const $={get(){if(k&&k!==$)k.addDependency($),W(j,k);return E},set(H){J={...J,...H},E={...structuredClone(E),...J},A.add($),M()},subscribe(H){return I.add(H),H(E),()=>{if(I.delete(H),I.size===0&&L.size===0&&j.size===0)U(I,j,$)}},recompute(){for(let z of L)Z(z.dependents,$);L.clear();const H=k;k=$;const K=B(),X=Array.from(L);if(!Y(N,X))N=X;if(k=H,J)E={...structuredClone(K),...J};else E=structuredClone(K);A.add($),M()},addDependency(H){L.add(H)},removeDependency(H){L.delete(H)},subscribers:I,dependents:j};return $.recompute(),[$.get,$.set,$.subscribe]}var k=null,A=new Set,R=!1;function u(){q(G()+1)}function i(){q(G()-1)}function r(){y({name:{first:"Jane",last:"Doe"}})}function n(){w(o()+1)}function t(){fetch("https://randomuser.me/api/").then((B)=>B.json()).then((B)=>{console.log(B.results[0]),D(B.results[0])})}function d(B){C.innerText=B}function p(B){P.innerText=B}function s(B){c.innerText=`${B.no} ${B.name.first} ${B.name.last}`}function e(B){b.innerText=B}function EE(B){a.innerText=JSON.stringify(B)}var[G,q,x]=Q(0),[TE,F]=f(()=>G()*2),[o,w,h]=Q(0),[LE,y,_]=O(()=>({no:G(),name:{first:"John",last:"Doe"}}),{no:G(),name:{first:"John",last:"Doe"}}),[jE,D,V]=Q({}),C=document.getElementById("count"),P=document.getElementById("scount"),c=document.getElementById("dcount"),g=document.getElementById("increment"),v=document.getElementById("decrement"),S=document.getElementById("name"),b=document.getElementById("timer"),l=document.getElementById("data"),a=document.getElementById("data2");g?.addEventListener("click",u);S?.addEventListener("click",()=>{r()});v?.addEventListener("click",i);l?.addEventListener("click",t);setInterval(n,1000);x(d);F(p);_(s);h(e);V(EE);
