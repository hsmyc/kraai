function X(B,I){if(B.length!==I.length)return!1;for(let E=0;E<B.length;E++)if(B[E]!==I[E])return!1;return!0}function N(){if(!Q)Q=!0,Promise.resolve().then(F)}function F(){Q=!1;const B=new Set;while(G.size>0){const I=new Set(G);G.clear();for(let E of I){if(B.has(E))continue;if("recompute"in E){B.add(E),E.recompute();const j=E.get(),k=E;for(let J of k.subscribers)J(j)}}for(let E of I){if(B.has(E))continue;if(!("recompute"in E)){B.add(E);const j=E,k=E.get();for(let J of j.subscribers)J(k)}}for(let E of B){const j=E;for(let k of j.dependents)if(!B.has(k))G.add(k)}}}function R(B,I,E){B.clear();for(let j of I)j.removeDependency(E);I.clear()}function U(B,I){B.add(I)}function Y(B,I){B.delete(I)}function Z(B){let I=structuredClone(B);const E=new Set,j=new Set,k={get(){if(L)L.addDependency(k),U(j,L);return I},set(J){if(I!==J)I=structuredClone(J),G.add(k),N()},subscribe(J){return E.add(J),J(I),()=>{if(E.delete(J),E.size===0&&j.size===0)R(E,j,k)}},subscribers:E,dependents:j,addDependency(J){j.add(J)},removeDependency(J){j.delete(J)}};return[k.get,k.set,k.subscribe]}function q(B){let I;const E=new Set,j=new Set,k=new Set;let J=[];const A={get(){if(L&&L!==A)L.addDependency(A),U(k,L);return I},set($){throw new Error("Cannot set value of a computed state")},subscribe($){return E.add($),$(I),()=>{if(E.delete($),E.size===0&&j.size===0&&k.size===0)R(E,k,A)}},recompute(){for(let M of j)Y(M.dependents,A);j.clear();const $=L;L=A;const H=B(),T=Array.from(j);if(!X(J,T))I=structuredClone(H),J=T;if(L=$,I!==H)I=structuredClone(H),G.add(A),N()},addDependency($){j.add($)},removeDependency($){j.delete($)},subscribers:E,dependents:k};return A.recompute(),[A.get,A.subscribe]}function z(B,I){let E=structuredClone(I);const j=new Set,k=new Set,J=new Set;let A=[],$=null;const H={get(){if(L&&L!==H)L.addDependency(H),U(J,L);return E},set(T){$={...$,...T},E={...structuredClone(E),...$},G.add(H),N()},subscribe(T){return j.add(T),T(E),()=>{if(j.delete(T),j.size===0&&k.size===0&&J.size===0)R(j,J,H)}},recompute(){for(let x of k)Y(x.dependents,H);k.clear();const T=L;L=H;const M=B(),W=Array.from(k);if(!X(A,W))A=W;if(L=T,$)E={...structuredClone(M),...$};else E=structuredClone(M);G.add(H),N()},addDependency(T){k.add(T)},removeDependency(T){k.delete(T)},subscribers:j,dependents:J};return H.recompute(),[H.get,H.set,H.subscribe]}var L=null,G=new Set,Q=!1;function o(){O(K()+1)}function v(){O(K()-1)}function g(){m({name:{first:"Jane",last:"Doe"}})}function S(B){_.innerText=B}function b(B){C.innerText=B}function c(B){P.innerText=`${B.no} ${B.name.first} ${B.name.last}`}var[K,O,f]=Z(0),[i,w]=q(()=>K()*2),[a,m,V]=z(()=>({no:K(),name:{first:"John",last:"Doe"}}),{no:K(),name:{first:"John",last:"Doe"}}),_=document.getElementById("count"),C=document.getElementById("scount"),P=document.getElementById("dcount"),h=document.getElementById("increment"),y=document.getElementById("decrement"),D=document.getElementById("dincrement");h?.addEventListener("click",o);D?.addEventListener("click",()=>{g()});y?.addEventListener("click",v);f(S);w(b);V(c);
