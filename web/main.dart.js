(function dartProgram(){function copyProperties(a,b){var s=Object.keys(a)
for(var r=0;r<s.length;r++){var q=s[r]
b[q]=a[q]}}function mixinPropertiesHard(a,b){var s=Object.keys(a)
for(var r=0;r<s.length;r++){var q=s[r]
if(!b.hasOwnProperty(q)){b[q]=a[q]}}}function mixinPropertiesEasy(a,b){Object.assign(b,a)}var z=function(){var s=function(){}
s.prototype={p:{}}
var r=new s()
if(!(Object.getPrototypeOf(r)&&Object.getPrototypeOf(r).p===s.prototype.p))return false
try{if(typeof navigator!="undefined"&&typeof navigator.userAgent=="string"&&navigator.userAgent.indexOf("Chrome/")>=0)return true
if(typeof version=="function"&&version.length==0){var q=version()
if(/^\d+\.\d+\.\d+\.\d+$/.test(q))return true}}catch(p){}return false}()
function inherit(a,b){a.prototype.constructor=a
a.prototype["$i"+a.name]=a
if(b!=null){if(z){Object.setPrototypeOf(a.prototype,b.prototype)
return}var s=Object.create(b.prototype)
copyProperties(a.prototype,s)
a.prototype=s}}function inheritMany(a,b){for(var s=0;s<b.length;s++){inherit(b[s],a)}}function mixinEasy(a,b){mixinPropertiesEasy(b.prototype,a.prototype)
a.prototype.constructor=a}function mixinHard(a,b){mixinPropertiesHard(b.prototype,a.prototype)
a.prototype.constructor=a}function lazy(a,b,c,d){var s=a
a[b]=s
a[c]=function(){if(a[b]===s){a[b]=d()}a[c]=function(){return this[b]}
return a[b]}}function lazyFinal(a,b,c,d){var s=a
a[b]=s
a[c]=function(){if(a[b]===s){var r=d()
if(a[b]!==s){A.hn(b)}a[b]=r}var q=a[b]
a[c]=function(){return q}
return q}}function makeConstList(a,b){if(b!=null)A.w(a,b)
a.$flags=7
return a}function convertToFastObject(a){function t(){}t.prototype=a
new t()
return a}function convertAllToFastObject(a){for(var s=0;s<a.length;++s){convertToFastObject(a[s])}}var y=0
function instanceTearOffGetter(a,b){var s=null
return a?function(c){if(s===null)s=A.df(b)
return new s(c,this)}:function(){if(s===null)s=A.df(b)
return new s(this,null)}}function staticTearOffGetter(a){var s=null
return function(){if(s===null)s=A.df(a).prototype
return s}}var x=0
function tearOffParameters(a,b,c,d,e,f,g,h,i,j){if(typeof h=="number"){h+=x}return{co:a,iS:b,iI:c,rC:d,dV:e,cs:f,fs:g,fT:h,aI:i||0,nDA:j}}function installStaticTearOff(a,b,c,d,e,f,g,h){var s=tearOffParameters(a,true,false,c,d,e,f,g,h,false)
var r=staticTearOffGetter(s)
a[b]=r}function installInstanceTearOff(a,b,c,d,e,f,g,h,i,j){c=!!c
var s=tearOffParameters(a,false,c,d,e,f,g,h,i,!!j)
var r=instanceTearOffGetter(c,s)
a[b]=r}function setOrUpdateInterceptorsByTag(a){var s=v.interceptorsByTag
if(!s){v.interceptorsByTag=a
return}copyProperties(a,s)}function setOrUpdateLeafTags(a){var s=v.leafTags
if(!s){v.leafTags=a
return}copyProperties(a,s)}function updateTypes(a){var s=v.types
var r=s.length
s.push.apply(s,a)
return r}function updateHolder(a,b){copyProperties(b,a)
return a}var hunkHelpers=function(){var s=function(a,b,c,d,e){return function(f,g,h,i){return installInstanceTearOff(f,g,a,b,c,d,[h],i,e,false)}},r=function(a,b,c,d){return function(e,f,g,h){return installStaticTearOff(e,f,a,b,c,[g],h,d)}}
return{inherit:inherit,inheritMany:inheritMany,mixin:mixinEasy,mixinHard:mixinHard,installStaticTearOff:installStaticTearOff,installInstanceTearOff:installInstanceTearOff,_instance_0u:s(0,0,null,["$0"],0),_instance_1u:s(0,1,null,["$1"],0),_instance_2u:s(0,2,null,["$2"],0),_instance_0i:s(1,0,null,["$0"],0),_instance_1i:s(1,1,null,["$1"],0),_instance_2i:s(1,2,null,["$2"],0),_static_0:r(0,null,["$0"],0),_static_1:r(1,null,["$1"],0),_static_2:r(2,null,["$2"],0),makeConstList:makeConstList,lazy:lazy,lazyFinal:lazyFinal,updateHolder:updateHolder,convertToFastObject:convertToFastObject,updateTypes:updateTypes,setOrUpdateInterceptorsByTag:setOrUpdateInterceptorsByTag,setOrUpdateLeafTags:setOrUpdateLeafTags}}()
function initializeDeferredHunk(a){x=v.types.length
a(hunkHelpers,v,w,$)}var J={
dk(a,b,c,d){return{i:a,p:b,e:c,x:d}},
dh(a){var s,r,q,p,o,n=a[v.dispatchPropertyName]
if(n==null)if($.di==null){A.hb()
n=a[v.dispatchPropertyName]}if(n!=null){s=n.p
if(!1===s)return n.i
if(!0===s)return a
r=Object.getPrototypeOf(a)
if(s===r)return n.i
if(n.e===r)throw A.j(A.dI("Return interceptor for "+A.n(s(a,n))))}q=a.constructor
if(q==null)p=null
else{o=$.cw
if(o==null)o=$.cw=v.getIsolateTag("_$dart_js")
p=q[o]}if(p!=null)return p
p=A.hh(a)
if(p!=null)return p
if(typeof a=="function")return B.u
s=Object.getPrototypeOf(a)
if(s==null)return B.k
if(s===Object.prototype)return B.k
if(typeof q=="function"){o=$.cw
if(o==null)o=$.cw=v.getIsolateTag("_$dart_js")
Object.defineProperty(q,o,{value:B.h,enumerable:false,writable:true,configurable:true})
return B.h}return B.h},
ac(a){if(typeof a=="number"){if(Math.floor(a)==a)return J.av.prototype
return J.bq.prototype}if(typeof a=="string")return J.ay.prototype
if(a==null)return J.aw.prototype
if(typeof a=="boolean")return J.bp.prototype
if(Array.isArray(a))return J.t.prototype
if(typeof a!="object"){if(typeof a=="function")return J.X.prototype
if(typeof a=="symbol")return J.aB.prototype
if(typeof a=="bigint")return J.az.prototype
return a}if(a instanceof A.e)return a
return J.dh(a)},
ek(a){if(typeof a=="string")return J.ay.prototype
if(a==null)return a
if(Array.isArray(a))return J.t.prototype
if(typeof a!="object"){if(typeof a=="function")return J.X.prototype
if(typeof a=="symbol")return J.aB.prototype
if(typeof a=="bigint")return J.az.prototype
return a}if(a instanceof A.e)return a
return J.dh(a)},
dg(a){if(a==null)return a
if(Array.isArray(a))return J.t.prototype
if(typeof a!="object"){if(typeof a=="function")return J.X.prototype
if(typeof a=="symbol")return J.aB.prototype
if(typeof a=="bigint")return J.az.prototype
return a}if(a instanceof A.e)return a
return J.dh(a)},
cV(a,b){if(a==null)return b==null
if(typeof a!="object")return b!=null&&a===b
return J.ac(a).D(a,b)},
eB(a,b){return J.dg(a).H(a,b)},
K(a){return J.ac(a).gm(a)},
eC(a){return J.dg(a).gu(a)},
cW(a){return J.ek(a).gj(a)},
eD(a){return J.ac(a).gl(a)},
eE(a,b,c){return J.dg(a).J(a,b,c)},
bf(a){return J.ac(a).i(a)},
bn:function bn(){},
bp:function bp(){},
aw:function aw(){},
aA:function aA(){},
Y:function Y(){},
bB:function bB(){},
aO:function aO(){},
X:function X(){},
az:function az(){},
aB:function aB(){},
t:function t(a){this.$ti=a},
bo:function bo(){},
c2:function c2(a){this.$ti=a},
as:function as(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
ax:function ax(){},
av:function av(){},
bq:function bq(){},
ay:function ay(){}},A={d0:function d0(){},
dA(a){return new A.aC("Field '"+a+"' has not been initialized.")},
Z(a,b){a=a+b&536870911
a=a+((a&524287)<<10)&536870911
return a^a>>>6},
d4(a){a=a+((a&67108863)<<3)&536870911
a^=a>>>11
return a+((a&16383)<<15)&536870911},
eg(a,b,c){return a},
dj(a){var s,r
for(s=$.C.length,r=0;r<s;++r)if(a===$.C[r])return!0
return!1},
eU(a,b,c,d){if(t.V.b(a))return new A.au(a,b,c.h("@<0>").k(d).h("au<1,2>"))
return new A.a6(a,b,c.h("@<0>").k(d).h("a6<1,2>"))},
aC:function aC(a){this.a=a},
c6:function c6(){},
d:function d(){},
N:function N(){},
a4:function a4(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
a6:function a6(a,b,c){this.a=a
this.b=b
this.$ti=c},
au:function au(a,b,c){this.a=a
this.b=b
this.$ti=c},
aF:function aF(a,b,c){var _=this
_.a=null
_.b=a
_.c=b
_.$ti=c},
O:function O(a,b,c){this.a=a
this.b=b
this.$ti=c},
v:function v(){},
ep(a){var s=v.mangledGlobalNames[a]
if(s!=null)return s
return"minified:"+a},
hG(a,b){var s
if(b!=null){s=b.x
if(s!=null)return s}return t.p.b(a)},
n(a){var s
if(typeof a=="string")return a
if(typeof a=="number"){if(a!==0)return""+a}else if(!0===a)return"true"
else if(!1===a)return"false"
else if(a==null)return"null"
s=J.bf(a)
return s},
bC(a){var s,r=$.dD
if(r==null)r=$.dD=Symbol("identityHashCode")
s=a[r]
if(s==null){s=Math.random()*0x3fffffff|0
a[r]=s}return s},
bD(a){var s,r,q,p
if(a instanceof A.e)return A.B(A.aq(a),null)
s=J.ac(a)
if(s===B.t||s===B.v||t.G.b(a)){r=B.i(a)
if(r!=="Object"&&r!=="")return r
q=a.constructor
if(typeof q=="function"){p=q.name
if(typeof p=="string"&&p!=="Object"&&p!=="")return p}}return A.B(A.aq(a),null)},
dE(a){var s,r,q
if(a==null||typeof a=="number"||A.cF(a))return J.bf(a)
if(typeof a=="string")return JSON.stringify(a)
if(a instanceof A.V)return a.i(0)
if(a instanceof A.a_)return a.a2(!0)
s=$.eA()
for(r=0;r<1;++r){q=s[r].aB(a)
if(q!=null)return q}return"Instance of '"+A.bD(a)+"'"},
eW(a){var s=a.$thrownJsError
if(s==null)return null
return A.ap(s)},
p(a,b){if(a==null)J.cW(a)
throw A.j(A.ej(a,b))},
ej(a,b){var s,r="index"
if(!A.e6(b))return new A.L(!0,b,r,null)
s=A.u(J.cW(a))
if(b<0||b>=s)return A.eO(b,s,a,r)
return new A.ai(null,null,!0,b,r,"Value not in range")},
j(a){return A.r(a,new Error())},
r(a,b){var s
if(a==null)a=new A.P()
b.dartException=a
s=A.ho
if("defineProperty" in Object){Object.defineProperty(b,"message",{get:s})
b.name=""}else b.toString=s
return b},
ho(){return J.bf(this.dartException)},
dp(a,b){throw A.r(a,b==null?new Error():b)},
dq(a,b,c){var s
if(b==null)b=0
if(c==null)c=0
s=Error()
A.dp(A.fs(a,b,c),s)},
fs(a,b,c){var s,r,q,p,o,n,m,l,k
if(typeof b=="string")s=b
else{r="[]=;add;removeWhere;retainWhere;removeRange;setRange;setInt8;setInt16;setInt32;setUint8;setUint16;setUint32;setFloat32;setFloat64".split(";")
q=r.length
p=b
if(p>q){c=p/q|0
p%=q}s=r[p]}o=typeof c=="string"?c:"modify;remove from;add to".split(";")[c]
n=t.j.b(a)?"list":"ByteData"
m=a.$flags|0
l="a "
if((m&4)!==0)k="constant "
else if((m&2)!==0){k="unmodifiable "
l="an "}else k=(m&1)!==0?"fixed-length ":""
return new A.aP("'"+s+"': Cannot "+o+" "+l+k+n)},
dn(a){throw A.j(A.at(a))},
Q(a){var s,r,q,p,o,n
a=A.hm(a.replace(String({}),"$receiver$"))
s=a.match(/\\\$[a-zA-Z]+\\\$/g)
if(s==null)s=A.w([],t.s)
r=s.indexOf("\\$arguments\\$")
q=s.indexOf("\\$argumentsExpr\\$")
p=s.indexOf("\\$expr\\$")
o=s.indexOf("\\$method\\$")
n=s.indexOf("\\$receiver\\$")
return new A.ca(a.replace(new RegExp("\\\\\\$arguments\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$argumentsExpr\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$expr\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$method\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$receiver\\\\\\$","g"),"((?:x|[^x])*)"),r,q,p,o,n)},
cb(a){return function($expr$){var $argumentsExpr$="$arguments$"
try{$expr$.$method$($argumentsExpr$)}catch(s){return s.message}}(a)},
dH(a){return function($expr$){try{$expr$.$method$}catch(s){return s.message}}(a)},
d1(a,b){var s=b==null,r=s?null:b.method
return new A.br(a,r,s?null:b.receiver)},
be(a){if(a==null)return new A.c5(a)
if(typeof a!=="object")return a
if("dartException" in a)return A.ae(a,a.dartException)
return A.fX(a)},
ae(a,b){if(t.Q.b(b))if(b.$thrownJsError==null)b.$thrownJsError=a
return b},
fX(a){var s,r,q,p,o,n,m,l,k,j,i,h,g
if(!("message" in a))return a
s=a.message
if("number" in a&&typeof a.number=="number"){r=a.number
q=r&65535
if((B.d.af(r,16)&8191)===10)switch(q){case 438:return A.ae(a,A.d1(A.n(s)+" (Error "+q+")",null))
case 445:case 5007:A.n(s)
return A.ae(a,new A.aK())}}if(a instanceof TypeError){p=$.eq()
o=$.er()
n=$.es()
m=$.et()
l=$.ew()
k=$.ex()
j=$.ev()
$.eu()
i=$.ez()
h=$.ey()
g=p.v(s)
if(g!=null)return A.ae(a,A.d1(A.b8(s),g))
else{g=o.v(s)
if(g!=null){g.method="call"
return A.ae(a,A.d1(A.b8(s),g))}else if(n.v(s)!=null||m.v(s)!=null||l.v(s)!=null||k.v(s)!=null||j.v(s)!=null||m.v(s)!=null||i.v(s)!=null||h.v(s)!=null){A.b8(s)
return A.ae(a,new A.aK())}}return A.ae(a,new A.bK(typeof s=="string"?s:""))}if(a instanceof RangeError){if(typeof s=="string"&&s.indexOf("call stack")!==-1)return new A.aM()
s=function(b){try{return String(b)}catch(f){}return null}(a)
return A.ae(a,new A.L(!1,null,null,typeof s=="string"?s.replace(/^RangeError:\s*/,""):s))}if(typeof InternalError=="function"&&a instanceof InternalError)if(typeof s=="string"&&s==="too much recursion")return new A.aM()
return a},
ap(a){var s
if(a==null)return new A.b0(a)
s=a.$cachedTrace
if(s!=null)return s
s=new A.b0(a)
if(typeof a==="object")a.$cachedTrace=s
return s},
cR(a){if(a==null)return J.K(a)
if(typeof a=="object")return A.bC(a)
return J.K(a)},
h5(a,b){var s,r,q,p=a.length
for(s=0;s<p;s=q){r=s+1
q=r+1
b.A(0,a[s],a[r])}return b},
fA(a,b,c,d,e,f){t.Z.a(a)
switch(A.u(b)){case 0:return a.$0()
case 1:return a.$1(c)
case 2:return a.$2(c,d)
case 3:return a.$3(c,d,e)
case 4:return a.$4(c,d,e,f)}throw A.j(new A.cm("Unsupported number of arguments for wrapped closure"))},
cI(a,b){var s=a.$identity
if(!!s)return s
s=A.h1(a,b)
a.$identity=s
return s},
h1(a,b){var s
switch(b){case 0:s=a.$0
break
case 1:s=a.$1
break
case 2:s=a.$2
break
case 3:s=a.$3
break
case 4:s=a.$4
break
default:s=null}if(s!=null)return s.bind(a)
return function(c,d,e){return function(f,g,h,i){return e(c,d,f,g,h,i)}}(a,b,A.fA)},
eL(a2){var s,r,q,p,o,n,m,l,k,j,i=a2.co,h=a2.iS,g=a2.iI,f=a2.nDA,e=a2.aI,d=a2.fs,c=a2.cs,b=d[0],a=c[0],a0=i[b],a1=a2.fT
a1.toString
s=h?Object.create(new A.bG().constructor.prototype):Object.create(new A.af(null,null).constructor.prototype)
s.$initialize=s.constructor
r=h?function static_tear_off(){this.$initialize()}:function tear_off(a3,a4){this.$initialize(a3,a4)}
s.constructor=r
r.prototype=s
s.$_name=b
s.$_target=a0
q=!h
if(q)p=A.dy(b,a0,g,f)
else{s.$static_name=b
p=a0}s.$S=A.eH(a1,h,g)
s[a]=p
for(o=p,n=1;n<d.length;++n){m=d[n]
if(typeof m=="string"){l=i[m]
k=m
m=l}else k=""
j=c[n]
if(j!=null){if(q)m=A.dy(k,m,g,f)
s[j]=m}if(n===e)o=m}s.$C=o
s.$R=a2.rC
s.$D=a2.dV
return r},
eH(a,b,c){if(typeof a=="number")return a
if(typeof a=="string"){if(b)throw A.j("Cannot compute signature for static tearoff.")
return function(d,e){return function(){return e(this,d)}}(a,A.eF)}throw A.j("Error in functionType of tearoff")},
eI(a,b,c,d){var s=A.dx
switch(b?-1:a){case 0:return function(e,f){return function(){return f(this)[e]()}}(c,s)
case 1:return function(e,f){return function(g){return f(this)[e](g)}}(c,s)
case 2:return function(e,f){return function(g,h){return f(this)[e](g,h)}}(c,s)
case 3:return function(e,f){return function(g,h,i){return f(this)[e](g,h,i)}}(c,s)
case 4:return function(e,f){return function(g,h,i,j){return f(this)[e](g,h,i,j)}}(c,s)
case 5:return function(e,f){return function(g,h,i,j,k){return f(this)[e](g,h,i,j,k)}}(c,s)
default:return function(e,f){return function(){return e.apply(f(this),arguments)}}(d,s)}},
dy(a,b,c,d){if(c)return A.eK(a,b,d)
return A.eI(b.length,d,a,b)},
eJ(a,b,c,d){var s=A.dx,r=A.eG
switch(b?-1:a){case 0:throw A.j(new A.bE("Intercepted function with no arguments."))
case 1:return function(e,f,g){return function(){return f(this)[e](g(this))}}(c,r,s)
case 2:return function(e,f,g){return function(h){return f(this)[e](g(this),h)}}(c,r,s)
case 3:return function(e,f,g){return function(h,i){return f(this)[e](g(this),h,i)}}(c,r,s)
case 4:return function(e,f,g){return function(h,i,j){return f(this)[e](g(this),h,i,j)}}(c,r,s)
case 5:return function(e,f,g){return function(h,i,j,k){return f(this)[e](g(this),h,i,j,k)}}(c,r,s)
case 6:return function(e,f,g){return function(h,i,j,k,l){return f(this)[e](g(this),h,i,j,k,l)}}(c,r,s)
default:return function(e,f,g){return function(){var q=[g(this)]
Array.prototype.push.apply(q,arguments)
return e.apply(f(this),q)}}(d,r,s)}},
eK(a,b,c){var s,r
if($.dv==null)$.dv=A.du("interceptor")
if($.dw==null)$.dw=A.du("receiver")
s=b.length
r=A.eJ(s,c,a,b)
return r},
df(a){return A.eL(a)},
eF(a,b){return A.b5(v.typeUniverse,A.aq(a.a),b)},
dx(a){return a.a},
eG(a){return a.b},
du(a){var s,r,q,p=new A.af("receiver","interceptor"),o=Object.getOwnPropertyNames(p)
o.$flags=1
s=o
for(o=s.length,r=0;r<o;++r){q=s[r]
if(p[q]===a)return q}throw A.j(A.bW("Field name "+a+" not found.",null))},
h6(a){return v.getIsolateTag(a)},
hh(a){var s,r,q,p,o,n=A.b8($.el.$1(a)),m=$.cJ[n]
if(m!=null){Object.defineProperty(a,v.dispatchPropertyName,{value:m,enumerable:false,writable:true,configurable:true})
return m.i}s=$.cO[n]
if(s!=null)return s
r=v.interceptorsByTag[n]
if(r==null){q=A.e2($.ee.$2(a,n))
if(q!=null){m=$.cJ[q]
if(m!=null){Object.defineProperty(a,v.dispatchPropertyName,{value:m,enumerable:false,writable:true,configurable:true})
return m.i}s=$.cO[q]
if(s!=null)return s
r=v.interceptorsByTag[q]
n=q}}if(r==null)return null
s=r.prototype
p=n[0]
if(p==="!"){m=A.cQ(s)
$.cJ[n]=m
Object.defineProperty(a,v.dispatchPropertyName,{value:m,enumerable:false,writable:true,configurable:true})
return m.i}if(p==="~"){$.cO[n]=s
return s}if(p==="-"){o=A.cQ(s)
Object.defineProperty(Object.getPrototypeOf(a),v.dispatchPropertyName,{value:o,enumerable:false,writable:true,configurable:true})
return o.i}if(p==="+")return A.en(a,s)
if(p==="*")throw A.j(A.dI(n))
if(v.leafTags[n]===true){o=A.cQ(s)
Object.defineProperty(Object.getPrototypeOf(a),v.dispatchPropertyName,{value:o,enumerable:false,writable:true,configurable:true})
return o.i}else return A.en(a,s)},
en(a,b){var s=Object.getPrototypeOf(a)
Object.defineProperty(s,v.dispatchPropertyName,{value:J.dk(b,s,null,null),enumerable:false,writable:true,configurable:true})
return b},
cQ(a){return J.dk(a,!1,null,!!a.$iz)},
hk(a,b,c){var s=b.prototype
if(v.leafTags[a]===true)return A.cQ(s)
else return J.dk(s,c,null,null)},
hb(){if(!0===$.di)return
$.di=!0
A.hc()},
hc(){var s,r,q,p,o,n,m,l
$.cJ=Object.create(null)
$.cO=Object.create(null)
A.ha()
s=v.interceptorsByTag
r=Object.getOwnPropertyNames(s)
if(typeof window!="undefined"){window
q=function(){}
for(p=0;p<r.length;++p){o=r[p]
n=$.eo.$1(o)
if(n!=null){m=A.hk(o,s[o],n)
if(m!=null){Object.defineProperty(n,v.dispatchPropertyName,{value:m,enumerable:false,writable:true,configurable:true})
q.prototype=n}}}}for(p=0;p<r.length;++p){o=r[p]
if(/^[A-Za-z_]/.test(o)){l=s[o]
s["!"+o]=l
s["~"+o]=l
s["-"+o]=l
s["+"+o]=l
s["*"+o]=l}}},
ha(){var s,r,q,p,o,n,m=B.l()
m=A.ao(B.m,A.ao(B.n,A.ao(B.j,A.ao(B.j,A.ao(B.o,A.ao(B.p,A.ao(B.q(B.i),m)))))))
if(typeof dartNativeDispatchHooksTransformer!="undefined"){s=dartNativeDispatchHooksTransformer
if(typeof s=="function")s=[s]
if(Array.isArray(s))for(r=0;r<s.length;++r){q=s[r]
if(typeof q=="function")m=q(m)||m}}p=m.getTag
o=m.getUnknownTag
n=m.prototypeForTag
$.el=new A.cK(p)
$.ee=new A.cL(o)
$.eo=new A.cM(n)},
ao(a,b){return a(b)||b},
h2(a,b){var s=b.length,r=v.rttc[""+s+";"+a]
if(r==null)return null
if(s===0)return r
if(s===r.length)return r.apply(null,b)
return r(b)},
hm(a){if(/[[\]{}()*+?.\\^$|]/.test(a))return a.replace(/[[\]{}()*+?.\\^$|]/g,"\\$&")
return a},
a0:function a0(a,b){this.a=a
this.b=b},
b_:function b_(a,b){this.a=a
this.b=b},
aL:function aL(){},
ca:function ca(a,b,c,d,e,f){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f},
aK:function aK(){},
br:function br(a,b,c){this.a=a
this.b=b
this.c=c},
bK:function bK(a){this.a=a},
c5:function c5(a){this.a=a},
b0:function b0(a){this.a=a
this.b=null},
V:function V(){},
bi:function bi(){},
bj:function bj(){},
bI:function bI(){},
bG:function bG(){},
af:function af(a,b){this.a=a
this.b=b},
bE:function bE(a){this.a=a},
a3:function a3(a){var _=this
_.a=0
_.f=_.e=_.d=_.c=_.b=null
_.r=0
_.$ti=a},
c3:function c3(a,b){this.a=a
this.b=b
this.c=null},
aE:function aE(a,b){this.a=a
this.$ti=b},
aD:function aD(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=null
_.$ti=d},
cK:function cK(a){this.a=a},
cL:function cL(a){this.a=a},
cM:function cM(a){this.a=a},
a_:function a_(){},
a8:function a8(){},
hn(a){throw A.r(new A.aC("Field '"+a+"' has been assigned during initialization."),new Error())},
U(){throw A.r(A.dA(""),new Error())},
d5(){var s=new A.ck()
return s.b=s},
ck:function ck(){this.b=null},
ag:function ag(){},
aI:function aI(){},
bs:function bs(){},
ah:function ah(){},
aG:function aG(){},
aH:function aH(){},
bt:function bt(){},
bu:function bu(){},
bv:function bv(){},
bw:function bw(){},
bx:function bx(){},
by:function by(){},
bz:function bz(){},
aJ:function aJ(){},
bA:function bA(){},
aW:function aW(){},
aX:function aX(){},
aY:function aY(){},
aZ:function aZ(){},
d2(a,b){var s=b.c
return s==null?b.c=A.b3(a,"bl",[b.x]):s},
dF(a){var s=a.w
if(s===6||s===7)return A.dF(a.x)
return s===11||s===12},
eZ(a){return a.as},
bd(a){return A.cD(v.typeUniverse,a,!1)},
aa(a1,a2,a3,a4){var s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0=a2.w
switch(a0){case 5:case 1:case 2:case 3:case 4:return a2
case 6:s=a2.x
r=A.aa(a1,s,a3,a4)
if(r===s)return a2
return A.dV(a1,r,!0)
case 7:s=a2.x
r=A.aa(a1,s,a3,a4)
if(r===s)return a2
return A.dU(a1,r,!0)
case 8:q=a2.y
p=A.an(a1,q,a3,a4)
if(p===q)return a2
return A.b3(a1,a2.x,p)
case 9:o=a2.x
n=A.aa(a1,o,a3,a4)
m=a2.y
l=A.an(a1,m,a3,a4)
if(n===o&&l===m)return a2
return A.d7(a1,n,l)
case 10:k=a2.x
j=a2.y
i=A.an(a1,j,a3,a4)
if(i===j)return a2
return A.dW(a1,k,i)
case 11:h=a2.x
g=A.aa(a1,h,a3,a4)
f=a2.y
e=A.fU(a1,f,a3,a4)
if(g===h&&e===f)return a2
return A.dT(a1,g,e)
case 12:d=a2.y
a4+=d.length
c=A.an(a1,d,a3,a4)
o=a2.x
n=A.aa(a1,o,a3,a4)
if(c===d&&n===o)return a2
return A.d8(a1,n,c,!0)
case 13:b=a2.x
if(b<a4)return a2
a=a3[b-a4]
if(a==null)return a2
return a
default:throw A.j(A.bh("Attempted to substitute unexpected RTI kind "+a0))}},
an(a,b,c,d){var s,r,q,p,o=b.length,n=A.cE(o)
for(s=!1,r=0;r<o;++r){q=b[r]
p=A.aa(a,q,c,d)
if(p!==q)s=!0
n[r]=p}return s?n:b},
fV(a,b,c,d){var s,r,q,p,o,n,m=b.length,l=A.cE(m)
for(s=!1,r=0;r<m;r+=3){q=b[r]
p=b[r+1]
o=b[r+2]
n=A.aa(a,o,c,d)
if(n!==o)s=!0
l.splice(r,3,q,p,n)}return s?l:b},
fU(a,b,c,d){var s,r=b.a,q=A.an(a,r,c,d),p=b.b,o=A.an(a,p,c,d),n=b.c,m=A.fV(a,n,c,d)
if(q===r&&o===p&&m===n)return b
s=new A.bP()
s.a=q
s.b=o
s.c=m
return s},
w(a,b){a[v.arrayRti]=b
return a},
eh(a){var s=a.$S
if(s!=null){if(typeof s=="number")return A.h8(s)
return a.$S()}return null},
he(a,b){var s
if(A.dF(b))if(a instanceof A.V){s=A.eh(a)
if(s!=null)return s}return A.aq(a)},
aq(a){if(a instanceof A.e)return A.a9(a)
if(Array.isArray(a))return A.al(a)
return A.db(J.ac(a))},
al(a){var s=a[v.arrayRti],r=t.b
if(s==null)return r
if(s.constructor!==r.constructor)return r
return s},
a9(a){var s=a.$ti
return s!=null?s:A.db(a)},
db(a){var s=a.constructor,r=s.$ccache
if(r!=null)return r
return A.fz(a,s)},
fz(a,b){var s=a instanceof A.V?Object.getPrototypeOf(Object.getPrototypeOf(a)).constructor:b,r=A.fk(v.typeUniverse,s.name)
b.$ccache=r
return r},
h8(a){var s,r=v.types,q=r[a]
if(typeof q=="string"){s=A.cD(v.typeUniverse,q,!1)
r[a]=s
return s}return q},
h7(a){return A.ab(A.a9(a))},
de(a){var s
if(a instanceof A.a_)return A.h4(a.$r,a.a0())
s=a instanceof A.V?A.eh(a):null
if(s!=null)return s
if(t.r.b(a))return J.eD(a).a
if(Array.isArray(a))return A.al(a)
return A.aq(a)},
ab(a){var s=a.r
return s==null?a.r=new A.cC(a):s},
h4(a,b){var s,r,q=b,p=q.length
if(p===0)return t.d
if(0>=p)return A.p(q,0)
s=A.b5(v.typeUniverse,A.de(q[0]),"@<0>")
for(r=1;r<p;++r){if(!(r<q.length))return A.p(q,r)
s=A.dX(v.typeUniverse,s,A.de(q[r]))}return A.b5(v.typeUniverse,s,a)},
H(a){return A.ab(A.cD(v.typeUniverse,a,!1))},
fy(a){var s=this
s.b=A.fS(s)
return s.b(a)},
fS(a){var s,r,q,p,o
if(a===t.K)return A.fG
if(A.ad(a))return A.fK
s=a.w
if(s===6)return A.fw
if(s===1)return A.e8
if(s===7)return A.fB
r=A.fR(a)
if(r!=null)return r
if(s===8){q=a.x
if(a.y.every(A.ad)){a.f="$i"+q
if(q==="i")return A.fE
if(a===t.m)return A.fD
return A.fJ}}else if(s===10){p=A.h2(a.x,a.y)
o=p==null?A.e8:p
return o==null?A.b7(o):o}return A.fu},
fR(a){if(a.w===8){if(a===t.S)return A.e6
if(a===t.i||a===t.o)return A.fF
if(a===t.N)return A.fI
if(a===t.y)return A.cF}return null},
fx(a){var s=this,r=A.ft
if(A.ad(s))r=A.fq
else if(s===t.K)r=A.b7
else if(A.ar(s)){r=A.fv
if(s===t.a3)r=A.fp
else if(s===t.aD)r=A.e2
else if(s===t.u)r=A.fn
else if(s===t.ae)r=A.e1
else if(s===t.I)r=A.fo
else if(s===t.aQ)r=A.R}else if(s===t.S)r=A.u
else if(s===t.N)r=A.b8
else if(s===t.y)r=A.fm
else if(s===t.o)r=A.e0
else if(s===t.i)r=A.d9
else if(s===t.m)r=A.c
s.a=r
return s.a(a)},
fu(a){var s=this
if(a==null)return A.ar(s)
return A.hf(v.typeUniverse,A.he(a,s),s)},
fw(a){if(a==null)return!0
return this.x.b(a)},
fJ(a){var s,r=this
if(a==null)return A.ar(r)
s=r.f
if(a instanceof A.e)return!!a[s]
return!!J.ac(a)[s]},
fE(a){var s,r=this
if(a==null)return A.ar(r)
if(typeof a!="object")return!1
if(Array.isArray(a))return!0
s=r.f
if(a instanceof A.e)return!!a[s]
return!!J.ac(a)[s]},
fD(a){var s=this
if(a==null)return!1
if(typeof a=="object"){if(a instanceof A.e)return!!a[s.f]
return!0}if(typeof a=="function")return!0
return!1},
e7(a){if(typeof a=="object"){if(a instanceof A.e)return t.m.b(a)
return!0}if(typeof a=="function")return!0
return!1},
ft(a){var s=this
if(a==null){if(A.ar(s))return a}else if(s.b(a))return a
throw A.r(A.e3(a,s),new Error())},
fv(a){var s=this
if(a==null||s.b(a))return a
throw A.r(A.e3(a,s),new Error())},
e3(a,b){return new A.b1("TypeError: "+A.dL(a,A.B(b,null)))},
dL(a,b){return A.bX(a)+": type '"+A.B(A.de(a),null)+"' is not a subtype of type '"+b+"'"},
E(a,b){return new A.b1("TypeError: "+A.dL(a,b))},
fB(a){var s=this
return s.x.b(a)||A.d2(v.typeUniverse,s).b(a)},
fG(a){return a!=null},
b7(a){if(a!=null)return a
throw A.r(A.E(a,"Object"),new Error())},
fK(a){return!0},
fq(a){return a},
e8(a){return!1},
cF(a){return!0===a||!1===a},
fm(a){if(!0===a)return!0
if(!1===a)return!1
throw A.r(A.E(a,"bool"),new Error())},
fn(a){if(!0===a)return!0
if(!1===a)return!1
if(a==null)return a
throw A.r(A.E(a,"bool?"),new Error())},
d9(a){if(typeof a=="number")return a
throw A.r(A.E(a,"double"),new Error())},
fo(a){if(typeof a=="number")return a
if(a==null)return a
throw A.r(A.E(a,"double?"),new Error())},
e6(a){return typeof a=="number"&&Math.floor(a)===a},
u(a){if(typeof a=="number"&&Math.floor(a)===a)return a
throw A.r(A.E(a,"int"),new Error())},
fp(a){if(typeof a=="number"&&Math.floor(a)===a)return a
if(a==null)return a
throw A.r(A.E(a,"int?"),new Error())},
fF(a){return typeof a=="number"},
e0(a){if(typeof a=="number")return a
throw A.r(A.E(a,"num"),new Error())},
e1(a){if(typeof a=="number")return a
if(a==null)return a
throw A.r(A.E(a,"num?"),new Error())},
fI(a){return typeof a=="string"},
b8(a){if(typeof a=="string")return a
throw A.r(A.E(a,"String"),new Error())},
e2(a){if(typeof a=="string")return a
if(a==null)return a
throw A.r(A.E(a,"String?"),new Error())},
c(a){if(A.e7(a))return a
throw A.r(A.E(a,"JSObject"),new Error())},
R(a){if(a==null)return a
if(A.e7(a))return a
throw A.r(A.E(a,"JSObject?"),new Error())},
ec(a,b){var s,r,q
for(s="",r="",q=0;q<a.length;++q,r=", ")s+=r+A.B(a[q],b)
return s},
fN(a,b){var s,r,q,p,o,n,m=a.x,l=a.y
if(""===m)return"("+A.ec(l,b)+")"
s=l.length
r=m.split(",")
q=r.length-s
for(p="(",o="",n=0;n<s;++n,o=", "){p+=o
if(q===0)p+="{"
p+=A.B(l[n],b)
if(q>=0)p+=" "+r[q];++q}return p+"})"},
e4(a3,a4,a5){var s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1=", ",a2=null
if(a5!=null){s=a5.length
if(a4==null)a4=A.w([],t.s)
else a2=a4.length
r=a4.length
for(q=s;q>0;--q)B.a.t(a4,"T"+(r+q))
for(p=t.X,o="<",n="",q=0;q<s;++q,n=a1){m=a4.length
l=m-1-q
if(!(l>=0))return A.p(a4,l)
o=o+n+a4[l]
k=a5[q]
j=k.w
if(!(j===2||j===3||j===4||j===5||k===p))o+=" extends "+A.B(k,a4)}o+=">"}else o=""
p=a3.x
i=a3.y
h=i.a
g=h.length
f=i.b
e=f.length
d=i.c
c=d.length
b=A.B(p,a4)
for(a="",a0="",q=0;q<g;++q,a0=a1)a+=a0+A.B(h[q],a4)
if(e>0){a+=a0+"["
for(a0="",q=0;q<e;++q,a0=a1)a+=a0+A.B(f[q],a4)
a+="]"}if(c>0){a+=a0+"{"
for(a0="",q=0;q<c;q+=3,a0=a1){a+=a0
if(d[q+1])a+="required "
a+=A.B(d[q+2],a4)+" "+d[q]}a+="}"}if(a2!=null){a4.toString
a4.length=a2}return o+"("+a+") => "+b},
B(a,b){var s,r,q,p,o,n,m,l=a.w
if(l===5)return"erased"
if(l===2)return"dynamic"
if(l===3)return"void"
if(l===1)return"Never"
if(l===4)return"any"
if(l===6){s=a.x
r=A.B(s,b)
q=s.w
return(q===11||q===12?"("+r+")":r)+"?"}if(l===7)return"FutureOr<"+A.B(a.x,b)+">"
if(l===8){p=A.fW(a.x)
o=a.y
return o.length>0?p+("<"+A.ec(o,b)+">"):p}if(l===10)return A.fN(a,b)
if(l===11)return A.e4(a,b,null)
if(l===12)return A.e4(a.x,b,a.y)
if(l===13){n=a.x
m=b.length
n=m-1-n
if(!(n>=0&&n<m))return A.p(b,n)
return b[n]}return"?"},
fW(a){var s=v.mangledGlobalNames[a]
if(s!=null)return s
return"minified:"+a},
fl(a,b){var s=a.tR[b]
while(typeof s=="string")s=a.tR[s]
return s},
fk(a,b){var s,r,q,p,o,n=a.eT,m=n[b]
if(m==null)return A.cD(a,b,!1)
else if(typeof m=="number"){s=m
r=A.b4(a,5,"#")
q=A.cE(s)
for(p=0;p<s;++p)q[p]=r
o=A.b3(a,b,q)
n[b]=o
return o}else return m},
fj(a,b){return A.dY(a.tR,b)},
fi(a,b){return A.dY(a.eT,b)},
cD(a,b,c){var s,r=a.eC,q=r.get(b)
if(q!=null)return q
s=A.dR(A.dP(a,null,b,!1))
r.set(b,s)
return s},
b5(a,b,c){var s,r,q=b.z
if(q==null)q=b.z=new Map()
s=q.get(c)
if(s!=null)return s
r=A.dR(A.dP(a,b,c,!0))
q.set(c,r)
return r},
dX(a,b,c){var s,r,q,p=b.Q
if(p==null)p=b.Q=new Map()
s=c.as
r=p.get(s)
if(r!=null)return r
q=A.d7(a,b,c.w===9?c.y:[c])
p.set(s,q)
return q},
a1(a,b){b.a=A.fx
b.b=A.fy
return b},
b4(a,b,c){var s,r,q=a.eC.get(c)
if(q!=null)return q
s=new A.F(null,null)
s.w=b
s.as=c
r=A.a1(a,s)
a.eC.set(c,r)
return r},
dV(a,b,c){var s,r=b.as+"?",q=a.eC.get(r)
if(q!=null)return q
s=A.fg(a,b,r,c)
a.eC.set(r,s)
return s},
fg(a,b,c,d){var s,r,q
if(d){s=b.w
r=!0
if(!A.ad(b))if(!(b===t.P||b===t.T))if(s!==6)r=s===7&&A.ar(b.x)
if(r)return b
else if(s===1)return t.P}q=new A.F(null,null)
q.w=6
q.x=b
q.as=c
return A.a1(a,q)},
dU(a,b,c){var s,r=b.as+"/",q=a.eC.get(r)
if(q!=null)return q
s=A.fe(a,b,r,c)
a.eC.set(r,s)
return s},
fe(a,b,c,d){var s,r
if(d){s=b.w
if(A.ad(b)||b===t.K)return b
else if(s===1)return A.b3(a,"bl",[b])
else if(b===t.P||b===t.T)return t.x}r=new A.F(null,null)
r.w=7
r.x=b
r.as=c
return A.a1(a,r)},
fh(a,b){var s,r,q=""+b+"^",p=a.eC.get(q)
if(p!=null)return p
s=new A.F(null,null)
s.w=13
s.x=b
s.as=q
r=A.a1(a,s)
a.eC.set(q,r)
return r},
b2(a){var s,r,q,p=a.length
for(s="",r="",q=0;q<p;++q,r=",")s+=r+a[q].as
return s},
fd(a){var s,r,q,p,o,n=a.length
for(s="",r="",q=0;q<n;q+=3,r=","){p=a[q]
o=a[q+1]?"!":":"
s+=r+p+o+a[q+2].as}return s},
b3(a,b,c){var s,r,q,p=b
if(c.length>0)p+="<"+A.b2(c)+">"
s=a.eC.get(p)
if(s!=null)return s
r=new A.F(null,null)
r.w=8
r.x=b
r.y=c
if(c.length>0)r.c=c[0]
r.as=p
q=A.a1(a,r)
a.eC.set(p,q)
return q},
d7(a,b,c){var s,r,q,p,o,n
if(b.w===9){s=b.x
r=b.y.concat(c)}else{r=c
s=b}q=s.as+(";<"+A.b2(r)+">")
p=a.eC.get(q)
if(p!=null)return p
o=new A.F(null,null)
o.w=9
o.x=s
o.y=r
o.as=q
n=A.a1(a,o)
a.eC.set(q,n)
return n},
dW(a,b,c){var s,r,q="+"+(b+"("+A.b2(c)+")"),p=a.eC.get(q)
if(p!=null)return p
s=new A.F(null,null)
s.w=10
s.x=b
s.y=c
s.as=q
r=A.a1(a,s)
a.eC.set(q,r)
return r},
dT(a,b,c){var s,r,q,p,o,n=b.as,m=c.a,l=m.length,k=c.b,j=k.length,i=c.c,h=i.length,g="("+A.b2(m)
if(j>0){s=l>0?",":""
g+=s+"["+A.b2(k)+"]"}if(h>0){s=l>0?",":""
g+=s+"{"+A.fd(i)+"}"}r=n+(g+")")
q=a.eC.get(r)
if(q!=null)return q
p=new A.F(null,null)
p.w=11
p.x=b
p.y=c
p.as=r
o=A.a1(a,p)
a.eC.set(r,o)
return o},
d8(a,b,c,d){var s,r=b.as+("<"+A.b2(c)+">"),q=a.eC.get(r)
if(q!=null)return q
s=A.ff(a,b,c,r,d)
a.eC.set(r,s)
return s},
ff(a,b,c,d,e){var s,r,q,p,o,n,m,l
if(e){s=c.length
r=A.cE(s)
for(q=0,p=0;p<s;++p){o=c[p]
if(o.w===1){r[p]=o;++q}}if(q>0){n=A.aa(a,b,r,0)
m=A.an(a,c,r,0)
return A.d8(a,n,m,c!==m)}}l=new A.F(null,null)
l.w=12
l.x=b
l.y=c
l.as=d
return A.a1(a,l)},
dP(a,b,c,d){return{u:a,e:b,r:c,s:[],p:0,n:d}},
dR(a){var s,r,q,p,o,n,m,l=a.r,k=a.s
for(s=l.length,r=0;r<s;){q=l.charCodeAt(r)
if(q>=48&&q<=57)r=A.f7(r+1,q,l,k)
else if((((q|32)>>>0)-97&65535)<26||q===95||q===36||q===124)r=A.dQ(a,r,l,k,!1)
else if(q===46)r=A.dQ(a,r,l,k,!0)
else{++r
switch(q){case 44:break
case 58:k.push(!1)
break
case 33:k.push(!0)
break
case 59:k.push(A.a7(a.u,a.e,k.pop()))
break
case 94:k.push(A.fh(a.u,k.pop()))
break
case 35:k.push(A.b4(a.u,5,"#"))
break
case 64:k.push(A.b4(a.u,2,"@"))
break
case 126:k.push(A.b4(a.u,3,"~"))
break
case 60:k.push(a.p)
a.p=k.length
break
case 62:A.f9(a,k)
break
case 38:A.f8(a,k)
break
case 63:p=a.u
k.push(A.dV(p,A.a7(p,a.e,k.pop()),a.n))
break
case 47:p=a.u
k.push(A.dU(p,A.a7(p,a.e,k.pop()),a.n))
break
case 40:k.push(-3)
k.push(a.p)
a.p=k.length
break
case 41:A.f6(a,k)
break
case 91:k.push(a.p)
a.p=k.length
break
case 93:o=k.splice(a.p)
A.dS(a.u,a.e,o)
a.p=k.pop()
k.push(o)
k.push(-1)
break
case 123:k.push(a.p)
a.p=k.length
break
case 125:o=k.splice(a.p)
A.fb(a.u,a.e,o)
a.p=k.pop()
k.push(o)
k.push(-2)
break
case 43:n=l.indexOf("(",r)
k.push(l.substring(r,n))
k.push(-4)
k.push(a.p)
a.p=k.length
r=n+1
break
default:throw"Bad character "+q}}}m=k.pop()
return A.a7(a.u,a.e,m)},
f7(a,b,c,d){var s,r,q=b-48
for(s=c.length;a<s;++a){r=c.charCodeAt(a)
if(!(r>=48&&r<=57))break
q=q*10+(r-48)}d.push(q)
return a},
dQ(a,b,c,d,e){var s,r,q,p,o,n,m=b+1
for(s=c.length;m<s;++m){r=c.charCodeAt(m)
if(r===46){if(e)break
e=!0}else{if(!((((r|32)>>>0)-97&65535)<26||r===95||r===36||r===124))q=r>=48&&r<=57
else q=!0
if(!q)break}}p=c.substring(b,m)
if(e){s=a.u
o=a.e
if(o.w===9)o=o.x
n=A.fl(s,o.x)[p]
if(n==null)A.dp('No "'+p+'" in "'+A.eZ(o)+'"')
d.push(A.b5(s,o,n))}else d.push(p)
return m},
f9(a,b){var s,r=a.u,q=A.dO(a,b),p=b.pop()
if(typeof p=="string")b.push(A.b3(r,p,q))
else{s=A.a7(r,a.e,p)
switch(s.w){case 11:b.push(A.d8(r,s,q,a.n))
break
default:b.push(A.d7(r,s,q))
break}}},
f6(a,b){var s,r,q,p=a.u,o=b.pop(),n=null,m=null
if(typeof o=="number")switch(o){case-1:n=b.pop()
break
case-2:m=b.pop()
break
default:b.push(o)
break}else b.push(o)
s=A.dO(a,b)
o=b.pop()
switch(o){case-3:o=b.pop()
if(n==null)n=p.sEA
if(m==null)m=p.sEA
r=A.a7(p,a.e,o)
q=new A.bP()
q.a=s
q.b=n
q.c=m
b.push(A.dT(p,r,q))
return
case-4:b.push(A.dW(p,b.pop(),s))
return
default:throw A.j(A.bh("Unexpected state under `()`: "+A.n(o)))}},
f8(a,b){var s=b.pop()
if(0===s){b.push(A.b4(a.u,1,"0&"))
return}if(1===s){b.push(A.b4(a.u,4,"1&"))
return}throw A.j(A.bh("Unexpected extended operation "+A.n(s)))},
dO(a,b){var s=b.splice(a.p)
A.dS(a.u,a.e,s)
a.p=b.pop()
return s},
a7(a,b,c){if(typeof c=="string")return A.b3(a,c,a.sEA)
else if(typeof c=="number"){b.toString
return A.fa(a,b,c)}else return c},
dS(a,b,c){var s,r=c.length
for(s=0;s<r;++s)c[s]=A.a7(a,b,c[s])},
fb(a,b,c){var s,r=c.length
for(s=2;s<r;s+=3)c[s]=A.a7(a,b,c[s])},
fa(a,b,c){var s,r,q=b.w
if(q===9){if(c===0)return b.x
s=b.y
r=s.length
if(c<=r)return s[c-1]
c-=r
b=b.x
q=b.w}else if(c===0)return b
if(q!==8)throw A.j(A.bh("Indexed base must be an interface type"))
s=b.y
if(c<=s.length)return s[c-1]
throw A.j(A.bh("Bad index "+c+" for "+b.i(0)))},
hf(a,b,c){var s,r=b.d
if(r==null)r=b.d=new Map()
s=r.get(c)
if(s==null){s=A.o(a,b,null,c,null)
r.set(c,s)}return s},
o(a,b,c,d,e){var s,r,q,p,o,n,m,l,k,j,i
if(b===d)return!0
if(A.ad(d))return!0
s=b.w
if(s===4)return!0
if(A.ad(b))return!1
if(b.w===1)return!0
r=s===13
if(r)if(A.o(a,c[b.x],c,d,e))return!0
q=d.w
p=t.P
if(b===p||b===t.T){if(q===7)return A.o(a,b,c,d.x,e)
return d===p||d===t.T||q===6}if(d===t.K){if(s===7)return A.o(a,b.x,c,d,e)
return s!==6}if(s===7){if(!A.o(a,b.x,c,d,e))return!1
return A.o(a,A.d2(a,b),c,d,e)}if(s===6)return A.o(a,p,c,d,e)&&A.o(a,b.x,c,d,e)
if(q===7){if(A.o(a,b,c,d.x,e))return!0
return A.o(a,b,c,A.d2(a,d),e)}if(q===6)return A.o(a,b,c,p,e)||A.o(a,b,c,d.x,e)
if(r)return!1
p=s!==11
if((!p||s===12)&&d===t.Z)return!0
o=s===10
if(o&&d===t.L)return!0
if(q===12){if(b===t.g)return!0
if(s!==12)return!1
n=b.y
m=d.y
l=n.length
if(l!==m.length)return!1
c=c==null?n:n.concat(c)
e=e==null?m:m.concat(e)
for(k=0;k<l;++k){j=n[k]
i=m[k]
if(!A.o(a,j,c,i,e)||!A.o(a,i,e,j,c))return!1}return A.e5(a,b.x,c,d.x,e)}if(q===11){if(b===t.g)return!0
if(p)return!1
return A.e5(a,b,c,d,e)}if(s===8){if(q!==8)return!1
return A.fC(a,b,c,d,e)}if(o&&q===10)return A.fH(a,b,c,d,e)
return!1},
e5(a3,a4,a5,a6,a7){var s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1,a2
if(!A.o(a3,a4.x,a5,a6.x,a7))return!1
s=a4.y
r=a6.y
q=s.a
p=r.a
o=q.length
n=p.length
if(o>n)return!1
m=n-o
l=s.b
k=r.b
j=l.length
i=k.length
if(o+j<n+i)return!1
for(h=0;h<o;++h){g=q[h]
if(!A.o(a3,p[h],a7,g,a5))return!1}for(h=0;h<m;++h){g=l[h]
if(!A.o(a3,p[o+h],a7,g,a5))return!1}for(h=0;h<i;++h){g=l[m+h]
if(!A.o(a3,k[h],a7,g,a5))return!1}f=s.c
e=r.c
d=f.length
c=e.length
for(b=0,a=0;a<c;a+=3){a0=e[a]
for(;;){if(b>=d)return!1
a1=f[b]
b+=3
if(a0<a1)return!1
a2=f[b-2]
if(a1<a0){if(a2)return!1
continue}g=e[a+1]
if(a2&&!g)return!1
g=f[b-1]
if(!A.o(a3,e[a+2],a7,g,a5))return!1
break}}while(b<d){if(f[b+1])return!1
b+=3}return!0},
fC(a,b,c,d,e){var s,r,q,p,o,n=b.x,m=d.x
while(n!==m){s=a.tR[n]
if(s==null)return!1
if(typeof s=="string"){n=s
continue}r=s[m]
if(r==null)return!1
q=r.length
p=q>0?new Array(q):v.typeUniverse.sEA
for(o=0;o<q;++o)p[o]=A.b5(a,b,r[o])
return A.e_(a,p,null,c,d.y,e)}return A.e_(a,b.y,null,c,d.y,e)},
e_(a,b,c,d,e,f){var s,r=b.length
for(s=0;s<r;++s)if(!A.o(a,b[s],d,e[s],f))return!1
return!0},
fH(a,b,c,d,e){var s,r=b.y,q=d.y,p=r.length
if(p!==q.length)return!1
if(b.x!==d.x)return!1
for(s=0;s<p;++s)if(!A.o(a,r[s],c,q[s],e))return!1
return!0},
ar(a){var s=a.w,r=!0
if(!(a===t.P||a===t.T))if(!A.ad(a))if(s!==6)r=s===7&&A.ar(a.x)
return r},
ad(a){var s=a.w
return s===2||s===3||s===4||s===5||a===t.X},
dY(a,b){var s,r,q=Object.keys(b),p=q.length
for(s=0;s<p;++s){r=q[s]
a[r]=b[r]}},
cE(a){return a>0?new Array(a):v.typeUniverse.sEA},
F:function F(a,b){var _=this
_.a=a
_.b=b
_.r=_.f=_.d=_.c=null
_.w=0
_.as=_.Q=_.z=_.y=_.x=null},
bP:function bP(){this.c=this.b=this.a=null},
cC:function cC(a){this.a=a},
bN:function bN(){},
b1:function b1(a){this.a=a},
f0(){var s,r,q
if(self.scheduleImmediate!=null)return A.fZ()
if(self.MutationObserver!=null&&self.document!=null){s={}
r=self.document.createElement("div")
q=self.document.createElement("span")
s.a=null
new self.MutationObserver(A.cI(new A.ch(s),1)).observe(r,{childList:true})
return new A.cg(s,r,q)}else if(self.setImmediate!=null)return A.h_()
return A.h0()},
f1(a){self.scheduleImmediate(A.cI(new A.ci(t.M.a(a)),0))},
f2(a){self.setImmediate(A.cI(new A.cj(t.M.a(a)),0))},
f3(a){t.M.a(a)
A.fc(0,a)},
fc(a,b){var s=new A.cA()
s.a6(a,b)
return s},
cX(a){var s
if(t.Q.b(a)){s=a.gL()
if(s!=null)return s}return B.r},
f4(a,b,c){var s,r,q,p={},o=p.a=a
for(s=t._;r=o.a,(r&4)!==0;o=a){a=s.a(o.c)
p.a=a}if(o===b){s=A.f_()
b.a7(new A.M(new A.L(!0,o,null,"Cannot complete a future with itself"),s))
return}s=r|b.a&1
o.a=s
if((s&24)===0){q=t.F.a(b.c)
b.a=b.a&1|4
b.c=o
o.a1(q)
return}q=b.F()
b.E(p.a)
A.ak(b,q)
return},
ak(a,b){var s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d={},c=d.a=a
for(s=t.n,r=t.F;;){q={}
p=c.a
o=(p&16)===0
n=!o
if(b==null){if(n&&(p&1)===0){m=s.a(c.c)
A.cG(m.a,m.b)}return}q.a=b
l=b.a
for(c=b;l!=null;c=l,l=k){c.a=null
A.ak(d.a,c)
q.a=l
k=l.a}p=d.a
j=p.c
q.b=n
q.c=j
if(o){i=c.c
i=(i&1)!==0||(i&15)===8}else i=!0
if(i){h=c.b.b
if(n){p=p.b===h
p=!(p||p)}else p=!1
if(p){s.a(j)
A.cG(j.a,j.b)
return}g=$.q
if(g!==h)$.q=h
else g=null
c=c.c
if((c&15)===8)new A.cs(q,d,n).$0()
else if(o){if((c&1)!==0)new A.cr(q,j).$0()}else if((c&2)!==0)new A.cq(d,q).$0()
if(g!=null)$.q=g
c=q.c
if(c instanceof A.D){p=q.a.$ti
p=p.h("bl<2>").b(c)||!p.y[1].b(c)}else p=!1
if(p){f=q.a.b
if((c.a&24)!==0){e=r.a(f.c)
f.c=null
b=f.G(e)
f.a=c.a&30|f.a&1
f.c=c.c
d.a=c
continue}else A.f4(c,f,!0)
return}}f=q.a.b
e=r.a(f.c)
f.c=null
b=f.G(e)
c=q.b
p=q.c
if(!c){f.$ti.c.a(p)
f.a=8
f.c=p}else{s.a(p)
f.a=f.a&1|16
f.c=p}d.a=f
c=f}},
fO(a,b){var s=t.C
if(s.b(a))return s.a(a)
s=t.v
if(s.b(a))return s.a(a)
throw A.j(A.dt(a,"onError",u.c))},
fM(){var s,r
for(s=$.am;s!=null;s=$.am){$.ba=null
r=s.b
$.am=r
if(r==null)$.b9=null
s.a.$0()}},
fT(){$.dc=!0
try{A.fM()}finally{$.ba=null
$.dc=!1
if($.am!=null)$.ds().$1(A.ef())}},
ed(a){var s=new A.bL(a),r=$.b9
if(r==null){$.am=$.b9=s
if(!$.dc)$.ds().$1(A.ef())}else $.b9=r.b=s},
fQ(a){var s,r,q,p=$.am
if(p==null){A.ed(a)
$.ba=$.b9
return}s=new A.bL(a)
r=$.ba
if(r==null){s.b=p
$.am=$.ba=s}else{q=r.b
s.b=q
$.ba=r.b=s
if(q==null)$.b9=s}},
cG(a,b){A.fQ(new A.cH(a,b))},
ea(a,b,c,d,e){var s,r=$.q
if(r===c)return d.$0()
$.q=c
s=r
try{r=d.$0()
return r}finally{$.q=s}},
eb(a,b,c,d,e,f,g){var s,r=$.q
if(r===c)return d.$1(e)
$.q=c
s=r
try{r=d.$1(e)
return r}finally{$.q=s}},
fP(a,b,c,d,e,f,g,h,i){var s,r=$.q
if(r===c)return d.$2(e,f)
$.q=c
s=r
try{r=d.$2(e,f)
return r}finally{$.q=s}},
dd(a,b,c,d){t.M.a(d)
if(B.c!==c){d=c.ah(d)
d=d}A.ed(d)},
ch:function ch(a){this.a=a},
cg:function cg(a,b,c){this.a=a
this.b=b
this.c=c},
ci:function ci(a){this.a=a},
cj:function cj(a){this.a=a},
cA:function cA(){},
cB:function cB(a,b){this.a=a
this.b=b},
M:function M(a,b){this.a=a
this.b=b},
aR:function aR(a,b,c,d,e){var _=this
_.a=null
_.b=a
_.c=b
_.d=c
_.e=d
_.$ti=e},
D:function D(a,b){var _=this
_.a=0
_.b=a
_.c=null
_.$ti=b},
cn:function cn(a,b){this.a=a
this.b=b},
cp:function cp(a,b){this.a=a
this.b=b},
co:function co(a,b){this.a=a
this.b=b},
cs:function cs(a,b,c){this.a=a
this.b=b
this.c=c},
ct:function ct(a,b){this.a=a
this.b=b},
cu:function cu(a){this.a=a},
cr:function cr(a,b){this.a=a
this.b=b},
cq:function cq(a,b){this.a=a
this.b=b},
bL:function bL(a){this.a=a
this.b=null},
aN:function aN(){},
c8:function c8(a,b){this.a=a
this.b=b},
c9:function c9(a,b){this.a=a
this.b=b},
b6:function b6(){},
cH:function cH(a,b){this.a=a
this.b=b},
bQ:function bQ(){},
cy:function cy(a,b){this.a=a
this.b=b},
cz:function cz(a,b,c){this.a=a
this.b=b
this.c=c},
dM(a,b){var s=a[b]
return s===a?null:s},
dN(a,b,c){if(c==null)a[b]=a
else a[b]=c},
f5(){var s=Object.create(null)
A.dN(s,"<non-identifier-key>",s)
delete s["<non-identifier-key>"]
return s},
eR(a,b,c){return b.h("@<0>").k(c).h("dB<1,2>").a(A.h5(a,new A.a3(b.h("@<0>").k(c).h("a3<1,2>"))))},
eQ(a,b){return new A.a3(a.h("@<0>").k(b).h("a3<1,2>"))},
dC(a){var s,r
if(A.dj(a))return"{...}"
s=new A.bH("")
try{r={}
B.a.t($.C,a)
s.a+="{"
r.a=!0
a.S(0,new A.c4(r,s))
s.a+="}"}finally{if(0>=$.C.length)return A.p($.C,-1)
$.C.pop()}r=s.a
return r.charCodeAt(0)==0?r:r},
aS:function aS(){},
aV:function aV(a){var _=this
_.a=0
_.e=_.d=_.c=_.b=null
_.$ti=a},
aT:function aT(a,b){this.a=a
this.$ti=b},
aU:function aU(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
l:function l(){},
a5:function a5(){},
c4:function c4(a,b){this.a=a
this.b=b},
eM(a,b){a=A.r(a,new Error())
if(a==null)a=A.b7(a)
a.stack=b.i(0)
throw a},
eS(a,b,c){var s,r
if(a>4294967295)A.dp(A.eY(a,0,4294967295,"length",null))
s=A.w(new Array(a),c.h("t<0>"))
s.$flags=1
r=s
return r},
eT(a,b,c){var s,r,q=A.w([],c.h("t<0>"))
for(s=a.length,r=0;r<a.length;a.length===s||(0,A.dn)(a),++r)B.a.t(q,c.a(a[r]))
q.$flags=1
return q},
dG(a,b,c){var s=J.eC(b)
if(!s.n())return a
if(c.length===0){do a+=A.n(s.gq())
while(s.n())}else{a+=A.n(s.gq())
while(s.n())a=a+c+A.n(s.gq())}return a},
f_(){return A.ap(new Error())},
bX(a){if(typeof a=="number"||A.cF(a)||a==null)return J.bf(a)
if(typeof a=="string")return JSON.stringify(a)
return A.dE(a)},
eN(a,b){A.eg(a,"error",t.K)
A.eg(b,"stackTrace",t.l)
A.eM(a,b)},
bh(a){return new A.bg(a)},
bW(a,b){return new A.L(!1,null,b,a)},
dt(a,b,c){return new A.L(!0,a,b,c)},
eX(a){var s=null
return new A.ai(s,s,!1,s,s,a)},
eY(a,b,c,d,e){return new A.ai(b,c,!0,a,d,"Invalid value")},
eO(a,b,c,d){return new A.bm(b,!0,a,d,"Index out of range")},
dJ(a){return new A.aP(a)},
dI(a){return new A.bJ(a)},
at(a){return new A.bk(a)},
eP(a,b,c){var s,r
if(A.dj(a)){if(b==="("&&c===")")return"(...)"
return b+"..."+c}s=A.w([],t.s)
B.a.t($.C,a)
try{A.fL(a,s)}finally{if(0>=$.C.length)return A.p($.C,-1)
$.C.pop()}r=A.dG(b,t.R.a(s),", ")+c
return r.charCodeAt(0)==0?r:r},
dz(a,b,c){var s,r
if(A.dj(a))return b+"..."+c
s=new A.bH(b)
B.a.t($.C,a)
try{r=s
r.a=A.dG(r.a,a,", ")}finally{if(0>=$.C.length)return A.p($.C,-1)
$.C.pop()}s.a+=c
r=s.a
return r.charCodeAt(0)==0?r:r},
fL(a,b){var s,r,q,p,o,n,m,l=a.gu(a),k=0,j=0
for(;;){if(!(k<80||j<3))break
if(!l.n())return
s=A.n(l.gq())
B.a.t(b,s)
k+=s.length+2;++j}if(!l.n()){if(j<=5)return
if(0>=b.length)return A.p(b,-1)
r=b.pop()
if(0>=b.length)return A.p(b,-1)
q=b.pop()}else{p=l.gq();++j
if(!l.n()){if(j<=4){B.a.t(b,A.n(p))
return}r=A.n(p)
if(0>=b.length)return A.p(b,-1)
q=b.pop()
k+=r.length+2}else{o=l.gq();++j
for(;l.n();p=o,o=n){n=l.gq();++j
if(j>100){for(;;){if(!(k>75&&j>3))break
if(0>=b.length)return A.p(b,-1)
k-=b.pop().length+2;--j}B.a.t(b,"...")
return}}q=A.n(p)
r=A.n(o)
k+=r.length+q.length+4}}if(j>b.length+2){k+=5
m="..."}else m=null
for(;;){if(!(k>80&&b.length>3))break
if(0>=b.length)return A.p(b,-1)
k-=b.pop().length+2
if(m==null){k+=5
m="..."}}if(m!=null)B.a.t(b,m)
B.a.t(b,q)
B.a.t(b,r)},
eV(a,b,c,d){var s
if(B.f===c){s=B.d.gm(a)
b=J.K(b)
return A.d4(A.Z(A.Z($.cU(),s),b))}if(B.f===d){s=B.d.gm(a)
b=J.K(b)
c=J.K(c)
return A.d4(A.Z(A.Z(A.Z($.cU(),s),b),c))}s=B.d.gm(a)
b=J.K(b)
c=J.K(c)
d=J.K(d)
d=A.d4(A.Z(A.Z(A.Z(A.Z($.cU(),s),b),c),d))
return d},
m:function m(){},
bg:function bg(a){this.a=a},
P:function P(){},
L:function L(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
ai:function ai(a,b,c,d,e,f){var _=this
_.e=a
_.f=b
_.a=c
_.b=d
_.c=e
_.d=f},
bm:function bm(a,b,c,d,e){var _=this
_.f=a
_.a=b
_.b=c
_.c=d
_.d=e},
aP:function aP(a){this.a=a},
bJ:function bJ(a){this.a=a},
bk:function bk(a){this.a=a},
aM:function aM(){},
cm:function cm(a){this.a=a},
b:function b(){},
A:function A(){},
e:function e(){},
bR:function bR(){},
bH:function bH(a){this.a=a},
da(a){var s
if(typeof a=="function")throw A.j(A.bW("Attempting to rewrap a JS function.",null))
s=function(b,c){return function(d){return b(c,d,arguments.length)}}(A.fr,a)
s[$.dr()]=a
return s},
fr(a,b,c){t.Z.a(a)
if(A.u(c)>=1)return a.$1(b)
return a.$0()},
e9(a){return a==null||A.cF(a)||typeof a=="number"||typeof a=="string"||t.U.b(a)||t.E.b(a)||t.e.b(a)||t.O.b(a)||t.D.b(a)||t.k.b(a)||t.w.b(a)||t.B.b(a)||t.q.b(a)||t.J.b(a)||t.Y.b(a)},
hg(a){if(A.e9(a))return a
return new A.cP(new A.aV(t.A)).$1(a)},
bU(a,b,c,d){return d.a(a[b].apply(a,c))},
cP:function cP(a){this.a=a},
cv:function cv(){},
d6(a,b,c,d,e){var s=A.fY(new A.cl(c),t.m)
s=s==null?null:A.da(s)
if(s!=null)a.addEventListener(b,s,!1)
return new A.bO(a,b,s,!1,e.h("bO<0>"))},
fY(a,b){var s=$.q
if(s===B.c)return a
return s.ai(a,b)},
d_:function d_(a,b){this.a=a
this.$ti=b},
aQ:function aQ(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.$ti=d},
bM:function bM(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.$ti=d},
bO:function bO(a,b,c,d,e){var _=this
_.b=a
_.c=b
_.d=c
_.e=d
_.$ti=e},
cl:function cl(a){this.a=a},
bV(a,b){return B.b.U(b-a+1)+a},
dl(a,b,c,d,e){return d+(e-d)*((a-b)/(c-b))},
hl(){var s,r,q,p,o,n,m,l,k,j,i,h
for(s=v.G,r=0;r<4;++r){q=$.d3[r]
p=A.c(A.c(s.document).createElement("canvas"))
p.width=20
p.height=20
o=A.R(p.getContext("2d"))
if(o==null)o=A.c(o)
n=A.c(o.createRadialGradient.apply(o,[10,10,0,10,10,10]))
m=q.b
if(0>=m.length)return A.p(m,0)
n.addColorStop(0,m[0])
if(1>=m.length)return A.p(m,1)
n.addColorStop(1,m[1])
o.fillStyle=n
o.beginPath()
o.arc.apply(o,[10,10,10,0,6.283185307179586])
o.fill()
l=A.c(A.c(s.document).createElement("canvas"))
l.width=20
l.height=20
k=A.R(l.getContext("2d"))
if(k==null)k=A.c(k)
j=A.c(k.createRadialGradient.apply(k,[10,10,0,10,10,10]))
if(0>=m.length)return A.p(m,0)
j.addColorStop(0,m[0])
if(1>=m.length)return A.p(m,1)
j.addColorStop(1,m[1])
k.fillStyle=j
k.beginPath()
k.moveTo(10,0)
for(i=4.71238898038469,h=0;h<5;++h){k.lineTo(10+Math.cos(i)*10,10+Math.sin(i)*10)
i+=0.6283185307179586
k.lineTo(10+Math.cos(i)*5,10+Math.sin(i)*5)
i+=0.6283185307179586}k.lineTo(10,0)
k.closePath()
k.fill()
$.dm.A(0,q.a,new A.b_(p,l))}},
ei(){var s,r,q,p,o,n,m,l="createRadialGradient"
$.bS.b=A.c(A.c(v.G.document).createElement("canvas"))
$.bS.p().width=$.G
$.bS.p().height=$.S
s=A.R($.bS.p().getContext("2d"))
if(s==null)s=A.c(s)
$.J.b=s
s=$.J.p()
r=$.G
q=r*0.5
p=$.S*0.5
o=t.m
n=A.bU(s,l,[q,p,0,q,p,r*0.6],o)
n.addColorStop(0,"rgba(100, 50, 150, 0.4)")
n.addColorStop(0.5,"rgba(50, 20, 100, 0.2)")
n.addColorStop(1,"rgba(0, 0, 0, 0)")
$.J.p().fillStyle=n
$.J.p().beginPath()
r=$.J.p()
p=$.G
q=t.H
A.bU(r,"arc",[p*0.5,$.S*0.5,p*0.6,0,6.283185307179586],q)
$.J.p().fill()
p=$.J.p()
r=$.G*0.3
s=$.S*0.3
m=A.bU(p,l,[r,s,0,r,s,r],o)
m.addColorStop(0,"rgba(255, 100, 200, 0.3)")
m.addColorStop(0.5,"rgba(100, 150, 255, 0.1)")
m.addColorStop(1,"rgba(0, 0, 0, 0)")
$.J.p().fillStyle=m
$.J.p().beginPath()
o=$.J.p()
r=$.G*0.3
A.bU(o,"arc",[r,$.S*0.3,r,0,6.283185307179586],q)
$.J.p().fill()},
h3(a){var s,r,q
A.e0(a)
s=$.x
if(s==null)return
s.fillStyle="rgba(0, 0, 0, 0.3)"
$.x.fillRect(0,0,$.G,$.S)
s=$.x
s.toString
s.drawImage($.bS.p(),0,0)
$.x.translate($.bb,$.bc)
for(s=$.cT,r=s.length,q=0;q<s.length;s.length===r||(0,A.dn)(s),++q)s[q].al()
$.x.translate(-$.bb,-$.bc)
$.dZ.p().ak()
A.u(A.c(v.G.window).requestAnimationFrame(A.da(A.em())))},
h9(a){var s,r,q,p,o,n,m,l,k,j=A.R(a.target)
if(j==null)j=A.c(j)
s=A.c(j.getBoundingClientRect())
r=A.u(a.clientX)-A.d9(s.left)
q=A.u(a.clientY)-A.d9(s.top)
for(p=$.cT.length-1;p>=0;--p){j=$.cT
if(!(p<j.length))return A.p(j,p)
o=j[p]
j=$.bb
n=$.bc
m=r-j-o.y
l=q-n-o.z
if(Math.sqrt(m*m+l*l)<=Math.max(o.Q,5)){$.cS=$.cS+1
j=v.G
k=A.R(A.c(j.document).querySelector(".score-counter"))
if(k==null&&$.cS>0){k=A.c(A.c(j.document).createElement("div"))
k.className="score-counter"
A.R(A.c(j.document).body).append(k)}if(k!=null)k.textContent="Score: "+$.cS
break}}},
hd(){var s,r,q,p=v.G,o=A.c(A.c(p.document).createElement("canvas"))
$.y=o
o.id="outerspace"
A.c($.y.style).position="fixed"
A.c($.y.style).top="0"
A.c($.y.style).left="0"
A.c($.y.style).width="100%"
A.c($.y.style).height="100%"
A.c($.y.style).zIndex="-1"
o=A.R(A.c(p.document).body)
o.toString
s=$.y
s.toString
o.append(s)
s=$.y
s.toString
s=A.R(s.getContext("2d",A.hg(A.eR(["alpha",!1],t.N,t.y))))
$.x=s
if(s==null)return
o=$.y
o.toString
o.width=A.u(A.c(p.window).innerWidth)
o=$.y
o.toString
o.height=A.u(A.c(p.window).innerHeight)
o=$.y
s=A.u(o.width)
$.G=s
o=A.u(o.height)
$.S=o
$.bb=s*0.5
$.bc=o*0.5
A.hl()
for(r=0;r<500;++r){o=$.cT
s=new A.bF()
s.a4(!0)
q=$.G
s.c=B.b.U(q-1+1)+1
B.a.t(o,s)}$.dZ.b=new A.c7()
A.ei()
o=$.y
o.toString
s=t.a
A.d6(o,"click",s.h("~(1)?").a(A.hj()),!1,s.c)
A.u(A.c(p.window).requestAnimationFrame(A.da(A.em())))
A.d6(A.c(p.window),"resize",t.bj.a(new A.cN()),!1,t.m)},
hi(){var s,r,q,p,o
A.hd()
s=v.G
r=A.R(A.c(s.document).querySelector("main"))
if(r!=null){r.innerHTML=""
q=A.c(A.c(s.document).createElement("header"))
p=A.c(A.c(s.document).createElement("h2"))
p.className="title"
p.textContent="Home (Dart Rewrite)"
q.append(p)
r.append(q)
o=A.c(A.c(s.document).createElement("p"))
o.textContent="This site has been completely rewritten in Dart."
r.append(o)}},
bF:function bF(){var _=this
_.x=_.w=_.r=_.f=_.e=_.d=_.c=_.b=_.a=$
_.Q=_.z=_.y=0},
c7:function c7(){var _=this
_.d=_.c=_.b=_.a=0
_.e=!1
_.f=0},
cN:function cN(){}},B={}
var w=[A,J,B]
var $={}
A.d0.prototype={}
J.bn.prototype={
D(a,b){return a===b},
gm(a){return A.bC(a)},
i(a){return"Instance of '"+A.bD(a)+"'"},
gl(a){return A.ab(A.db(this))}}
J.bp.prototype={
i(a){return String(a)},
gm(a){return a?519018:218159},
gl(a){return A.ab(t.y)},
$ih:1,
$ibT:1}
J.aw.prototype={
D(a,b){return null==b},
i(a){return"null"},
gm(a){return 0},
$ih:1}
J.aA.prototype={$ik:1}
J.Y.prototype={
gm(a){return 0},
i(a){return String(a)}}
J.bB.prototype={}
J.aO.prototype={}
J.X.prototype={
i(a){var s=a[$.dr()]
if(s==null)return this.a5(a)
return"JavaScript function for "+J.bf(s)},
$ia2:1}
J.az.prototype={
gm(a){return 0},
i(a){return String(a)}}
J.aB.prototype={
gm(a){return 0},
i(a){return String(a)}}
J.t.prototype={
t(a,b){A.al(a).c.a(b)
a.$flags&1&&A.dq(a,29)
a.push(b)},
ag(a,b){var s
A.al(a).h("b<1>").a(b)
a.$flags&1&&A.dq(a,"addAll",2)
for(s=b.gu(b);s.n();)a.push(s.gq())},
J(a,b,c){var s=A.al(a)
return new A.O(a,s.k(c).h("1(2)").a(b),s.h("@<1>").k(c).h("O<1,2>"))},
H(a,b){if(!(b<a.length))return A.p(a,b)
return a[b]},
i(a){return A.dz(a,"[","]")},
gu(a){return new J.as(a,a.length,A.al(a).h("as<1>"))},
gm(a){return A.bC(a)},
gj(a){return a.length},
A(a,b,c){A.al(a).c.a(c)
a.$flags&2&&A.dq(a)
if(!(b>=0&&b<a.length))throw A.j(A.ej(a,b))
a[b]=c},
$id:1,
$ib:1,
$ii:1}
J.bo.prototype={
aB(a){var s,r,q
if(!Array.isArray(a))return null
s=a.$flags|0
if((s&4)!==0)r="const, "
else if((s&2)!==0)r="unmodifiable, "
else r=(s&1)!==0?"fixed, ":""
q="Instance of '"+A.bD(a)+"'"
if(r==="")return q
return q+" ("+r+"length: "+a.length+")"}}
J.c2.prototype={}
J.as.prototype={
gq(){var s=this.d
return s==null?this.$ti.c.a(s):s},
n(){var s,r=this,q=r.a,p=q.length
if(r.b!==p){q=A.dn(q)
throw A.j(q)}s=r.c
if(s>=p){r.d=null
return!1}r.d=q[s]
r.c=s+1
return!0},
$iW:1}
J.ax.prototype={
K(a){var s
if(a>=-2147483648&&a<=2147483647)return a|0
if(isFinite(a)){s=a<0?Math.ceil(a):Math.floor(a)
return s+0}throw A.j(A.dJ(""+a+".toInt()"))},
i(a){if(a===0&&1/a<0)return"-0.0"
else return""+a},
gm(a){var s,r,q,p,o=a|0
if(a===o)return o&536870911
s=Math.abs(a)
r=Math.log(s)/0.6931471805599453|0
q=Math.pow(2,r)
p=s<1?s/q:q/s
return((p*9007199254740992|0)+(p*3542243181176521|0))*599197+r*1259&536870911},
af(a,b){var s
if(a>0)s=this.ae(a,b)
else{s=b>31?31:b
s=a>>s>>>0}return s},
ae(a,b){return b>31?0:a>>>b},
gl(a){return A.ab(t.o)},
$if:1,
$iT:1}
J.av.prototype={
gl(a){return A.ab(t.S)},
$ih:1,
$ia:1}
J.bq.prototype={
gl(a){return A.ab(t.i)},
$ih:1}
J.ay.prototype={
i(a){return a},
gm(a){var s,r,q
for(s=a.length,r=0,q=0;q<s;++q){r=r+a.charCodeAt(q)&536870911
r=r+((r&524287)<<10)&536870911
r^=r>>6}r=r+((r&67108863)<<3)&536870911
r^=r>>11
return r+((r&16383)<<15)&536870911},
gl(a){return A.ab(t.N)},
gj(a){return a.length},
$ih:1,
$iI:1}
A.aC.prototype={
i(a){return"LateInitializationError: "+this.a}}
A.c6.prototype={}
A.d.prototype={}
A.N.prototype={
gu(a){return new A.a4(this,this.gj(0),this.$ti.h("a4<N.E>"))},
J(a,b,c){var s=this.$ti
return new A.O(this,s.k(c).h("1(N.E)").a(b),s.h("@<N.E>").k(c).h("O<1,2>"))}}
A.a4.prototype={
gq(){var s=this.d
return s==null?this.$ti.c.a(s):s},
n(){var s,r=this,q=r.a,p=J.ek(q),o=p.gj(q)
if(r.b!==o)throw A.j(A.at(q))
s=r.c
if(s>=o){r.d=null
return!1}r.d=p.H(q,s);++r.c
return!0},
$iW:1}
A.a6.prototype={
gu(a){var s=this.a
return new A.aF(s.gu(s),this.b,A.a9(this).h("aF<1,2>"))},
gj(a){var s=this.a
return s.gj(s)}}
A.au.prototype={$id:1}
A.aF.prototype={
n(){var s=this,r=s.b
if(r.n()){s.a=s.c.$1(r.gq())
return!0}s.a=null
return!1},
gq(){var s=this.a
return s==null?this.$ti.y[1].a(s):s},
$iW:1}
A.O.prototype={
gj(a){return J.cW(this.a)},
H(a,b){return this.b.$1(J.eB(this.a,b))}}
A.v.prototype={}
A.a0.prototype={$r:"+name,stops(1,2)",$s:1}
A.b_.prototype={$r:"+round,spiky(1,2)",$s:2}
A.aL.prototype={}
A.ca.prototype={
v(a){var s,r,q=this,p=new RegExp(q.a).exec(a)
if(p==null)return null
s=Object.create(null)
r=q.b
if(r!==-1)s.arguments=p[r+1]
r=q.c
if(r!==-1)s.argumentsExpr=p[r+1]
r=q.d
if(r!==-1)s.expr=p[r+1]
r=q.e
if(r!==-1)s.method=p[r+1]
r=q.f
if(r!==-1)s.receiver=p[r+1]
return s}}
A.aK.prototype={
i(a){return"Null check operator used on a null value"}}
A.br.prototype={
i(a){var s,r=this,q="NoSuchMethodError: method not found: '",p=r.b
if(p==null)return"NoSuchMethodError: "+r.a
s=r.c
if(s==null)return q+p+"' ("+r.a+")"
return q+p+"' on '"+s+"' ("+r.a+")"}}
A.bK.prototype={
i(a){var s=this.a
return s.length===0?"Error":"Error: "+s}}
A.c5.prototype={
i(a){return"Throw of null ('"+(this.a===null?"null":"undefined")+"' from JavaScript)"}}
A.b0.prototype={
i(a){var s,r=this.b
if(r!=null)return r
r=this.a
s=r!==null&&typeof r==="object"?r.stack:null
return this.b=s==null?"":s},
$iaj:1}
A.V.prototype={
i(a){var s=this.constructor,r=s==null?null:s.name
return"Closure '"+A.ep(r==null?"unknown":r)+"'"},
$ia2:1,
gaC(){return this},
$C:"$1",
$R:1,
$D:null}
A.bi.prototype={$C:"$0",$R:0}
A.bj.prototype={$C:"$2",$R:2}
A.bI.prototype={}
A.bG.prototype={
i(a){var s=this.$static_name
if(s==null)return"Closure of unknown static method"
return"Closure '"+A.ep(s)+"'"}}
A.af.prototype={
D(a,b){if(b==null)return!1
if(this===b)return!0
if(!(b instanceof A.af))return!1
return this.$_target===b.$_target&&this.a===b.a},
gm(a){return(A.cR(this.a)^A.bC(this.$_target))>>>0},
i(a){return"Closure '"+this.$_name+"' of "+("Instance of '"+A.bD(this.a)+"'")}}
A.bE.prototype={
i(a){return"RuntimeError: "+this.a}}
A.a3.prototype={
gj(a){return this.a},
gI(){return new A.aE(this,this.$ti.h("aE<1>"))},
C(a,b){var s,r,q,p,o=null
if(typeof b=="string"){s=this.b
if(s==null)return o
r=s[b]
q=r==null?o:r.b
return q}else if(typeof b=="number"&&(b&0x3fffffff)===b){p=this.c
if(p==null)return o
r=p[b]
q=r==null?o:r.b
return q}else return this.an(b)},
an(a){var s,r,q=this.d
if(q==null)return null
s=q[J.K(a)&1073741823]
r=this.a3(s,a)
if(r<0)return null
return s[r].b},
A(a,b,c){var s,r,q,p,o,n,m=this,l=m.$ti
l.c.a(b)
l.y[1].a(c)
if(typeof b=="string"){s=m.b
m.W(s==null?m.b=m.P():s,b,c)}else if(typeof b=="number"&&(b&0x3fffffff)===b){r=m.c
m.W(r==null?m.c=m.P():r,b,c)}else{q=m.d
if(q==null)q=m.d=m.P()
p=J.K(b)&1073741823
o=q[p]
if(o==null)q[p]=[m.R(b,c)]
else{n=m.a3(o,b)
if(n>=0)o[n].b=c
else o.push(m.R(b,c))}}},
S(a,b){var s,r,q=this
q.$ti.h("~(1,2)").a(b)
s=q.e
r=q.r
while(s!=null){b.$2(s.a,s.b)
if(r!==q.r)throw A.j(A.at(q))
s=s.c}},
W(a,b,c){var s,r=this.$ti
r.c.a(b)
r.y[1].a(c)
s=a[b]
if(s==null)a[b]=this.R(b,c)
else s.b=c},
R(a,b){var s=this,r=s.$ti,q=new A.c3(r.c.a(a),r.y[1].a(b))
if(s.e==null)s.e=s.f=q
else s.f=s.f.c=q;++s.a
s.r=s.r+1&1073741823
return q},
a3(a,b){var s,r
if(a==null)return-1
s=a.length
for(r=0;r<s;++r)if(J.cV(a[r].a,b))return r
return-1},
i(a){return A.dC(this)},
P(){var s=Object.create(null)
s["<non-identifier-key>"]=s
delete s["<non-identifier-key>"]
return s},
$idB:1}
A.c3.prototype={}
A.aE.prototype={
gj(a){return this.a.a},
gu(a){var s=this.a
return new A.aD(s,s.r,s.e,this.$ti.h("aD<1>"))}}
A.aD.prototype={
gq(){return this.d},
n(){var s,r=this,q=r.a
if(r.b!==q.r)throw A.j(A.at(q))
s=r.c
if(s==null){r.d=null
return!1}else{r.d=s.a
r.c=s.c
return!0}},
$iW:1}
A.cK.prototype={
$1(a){return this.a(a)},
$S:5}
A.cL.prototype={
$2(a,b){return this.a(a,b)},
$S:6}
A.cM.prototype={
$1(a){return this.a(A.b8(a))},
$S:7}
A.a_.prototype={
i(a){return this.a2(!1)},
a2(a){var s,r,q,p,o,n=this.ab(),m=this.a0(),l=(a?"Record ":"")+"("
for(s=n.length,r="",q=0;q<s;++q,r=", "){l+=r
p=n[q]
if(typeof p=="string")l=l+p+": "
if(!(q<m.length))return A.p(m,q)
o=m[q]
l=a?l+A.dE(o):l+A.n(o)}l+=")"
return l.charCodeAt(0)==0?l:l},
ab(){var s,r=this.$s
while($.cx.length<=r)B.a.t($.cx,null)
s=$.cx[r]
if(s==null){s=this.a9()
B.a.A($.cx,r,s)}return s},
a9(){var s,r,q,p=this.$r,o=p.indexOf("("),n=p.substring(1,o),m=p.substring(o),l=m==="()"?0:m.replace(/[^,]/g,"").length+1,k=A.w(new Array(l),t.f)
for(s=0;s<l;++s)k[s]=s
if(n!==""){r=n.split(",")
s=r.length
for(q=l;s>0;){--q;--s
B.a.A(k,q,r[s])}}k=A.eT(k,!1,t.K)
k.$flags=3
return k}}
A.a8.prototype={
a0(){return[this.a,this.b]},
D(a,b){if(b==null)return!1
return b instanceof A.a8&&this.$s===b.$s&&J.cV(this.a,b.a)&&J.cV(this.b,b.b)},
gm(a){return A.eV(this.$s,this.a,this.b,B.f)}}
A.ck.prototype={
p(){var s=this.b
if(s===this)throw A.j(A.dA(""))
return s}}
A.ag.prototype={
gl(a){return B.w},
$ih:1,
$icY:1}
A.aI.prototype={}
A.bs.prototype={
gl(a){return B.x},
$ih:1,
$icZ:1}
A.ah.prototype={
gj(a){return a.length},
$iz:1}
A.aG.prototype={$id:1,$ib:1,$ii:1}
A.aH.prototype={$id:1,$ib:1,$ii:1}
A.bt.prototype={
gl(a){return B.y},
$ih:1,
$ibY:1}
A.bu.prototype={
gl(a){return B.z},
$ih:1,
$ibZ:1}
A.bv.prototype={
gl(a){return B.A},
$ih:1,
$ic_:1}
A.bw.prototype={
gl(a){return B.B},
$ih:1,
$ic0:1}
A.bx.prototype={
gl(a){return B.C},
$ih:1,
$ic1:1}
A.by.prototype={
gl(a){return B.E},
$ih:1,
$icc:1}
A.bz.prototype={
gl(a){return B.F},
$ih:1,
$icd:1}
A.aJ.prototype={
gl(a){return B.G},
gj(a){return a.length},
$ih:1,
$ice:1}
A.bA.prototype={
gl(a){return B.H},
gj(a){return a.length},
$ih:1,
$icf:1}
A.aW.prototype={}
A.aX.prototype={}
A.aY.prototype={}
A.aZ.prototype={}
A.F.prototype={
h(a){return A.b5(v.typeUniverse,this,a)},
k(a){return A.dX(v.typeUniverse,this,a)}}
A.bP.prototype={}
A.cC.prototype={
i(a){return A.B(this.a,null)}}
A.bN.prototype={
i(a){return this.a}}
A.b1.prototype={$iP:1}
A.ch.prototype={
$1(a){var s=this.a,r=s.a
s.a=null
r.$0()},
$S:3}
A.cg.prototype={
$1(a){var s,r
this.a.a=t.M.a(a)
s=this.b
r=this.c
s.firstChild?s.removeChild(r):s.appendChild(r)},
$S:8}
A.ci.prototype={
$0(){this.a.$0()},
$S:4}
A.cj.prototype={
$0(){this.a.$0()},
$S:4}
A.cA.prototype={
a6(a,b){if(self.setTimeout!=null)self.setTimeout(A.cI(new A.cB(this,b),0),a)
else throw A.j(A.dJ("`setTimeout()` not found."))}}
A.cB.prototype={
$0(){this.b.$0()},
$S:0}
A.M.prototype={
i(a){return A.n(this.a)},
$im:1,
gL(){return this.b}}
A.aR.prototype={
ao(a){if((this.c&15)!==6)return!0
return this.b.b.V(t.t.a(this.d),a.a,t.y,t.K)},
am(a){var s,r=this,q=r.e,p=null,o=t.z,n=t.K,m=a.a,l=r.b.b
if(t.C.b(q))p=l.au(q,m,a.b,o,n,t.l)
else p=l.V(t.v.a(q),m,o,n)
try{o=r.$ti.h("2/").a(p)
return o}catch(s){if(t.c.b(A.be(s))){if((r.c&1)!==0)throw A.j(A.bW("The error handler of Future.then must return a value of the returned future's type","onError"))
throw A.j(A.bW("The error handler of Future.catchError must return a value of the future's type","onError"))}else throw s}}}
A.D.prototype={
az(a,b,c){var s,r,q=this.$ti
q.k(c).h("1/(2)").a(a)
s=$.q
if(s===B.c){if(!t.C.b(b)&&!t.v.b(b))throw A.j(A.dt(b,"onError",u.c))}else{c.h("@<0/>").k(q.c).h("1(2)").a(a)
b=A.fO(b,s)}r=new A.D(s,c.h("D<0>"))
this.X(new A.aR(r,3,a,b,q.h("@<1>").k(c).h("aR<1,2>")))
return r},
ad(a){this.a=this.a&1|16
this.c=a},
E(a){this.a=a.a&30|this.a&1
this.c=a.c},
X(a){var s,r=this,q=r.a
if(q<=3){a.a=t.F.a(r.c)
r.c=a}else{if((q&4)!==0){s=t._.a(r.c)
if((s.a&24)===0){s.X(a)
return}r.E(s)}A.dd(null,null,r.b,t.M.a(new A.cn(r,a)))}},
a1(a){var s,r,q,p,o,n,m=this,l={}
l.a=a
if(a==null)return
s=m.a
if(s<=3){r=t.F.a(m.c)
m.c=a
if(r!=null){q=a.a
for(p=a;q!=null;p=q,q=o)o=q.a
p.a=r}}else{if((s&4)!==0){n=t._.a(m.c)
if((n.a&24)===0){n.a1(a)
return}m.E(n)}l.a=m.G(a)
A.dd(null,null,m.b,t.M.a(new A.cp(l,m)))}},
F(){var s=t.F.a(this.c)
this.c=null
return this.G(s)},
G(a){var s,r,q
for(s=a,r=null;s!=null;r=s,s=q){q=s.a
s.a=r}return r},
a8(a){var s,r,q=this
if((a.a&16)!==0){s=q.b===a.b
s=!(s||s)}else s=!1
if(s)return
r=q.F()
q.E(a)
A.ak(q,r)},
Y(a){var s=this.F()
this.ad(a)
A.ak(this,s)},
a7(a){this.a^=2
A.dd(null,null,this.b,t.M.a(new A.co(this,a)))},
$ibl:1}
A.cn.prototype={
$0(){A.ak(this.a,this.b)},
$S:0}
A.cp.prototype={
$0(){A.ak(this.b,this.a.a)},
$S:0}
A.co.prototype={
$0(){this.a.Y(this.b)},
$S:0}
A.cs.prototype={
$0(){var s,r,q,p,o,n,m,l,k=this,j=null
try{q=k.a.a
j=q.b.b.ar(t.W.a(q.d),t.z)}catch(p){s=A.be(p)
r=A.ap(p)
if(k.c&&t.n.a(k.b.a.c).a===s){q=k.a
q.c=t.n.a(k.b.a.c)}else{q=s
o=r
if(o==null)o=A.cX(q)
n=k.a
n.c=new A.M(q,o)
q=n}q.b=!0
return}if(j instanceof A.D&&(j.a&24)!==0){if((j.a&16)!==0){q=k.a
q.c=t.n.a(j.c)
q.b=!0}return}if(j instanceof A.D){m=k.b.a
l=new A.D(m.b,m.$ti)
j.az(new A.ct(l,m),new A.cu(l),t.H)
q=k.a
q.c=l
q.b=!1}},
$S:0}
A.ct.prototype={
$1(a){this.a.a8(this.b)},
$S:3}
A.cu.prototype={
$2(a,b){A.b7(a)
t.l.a(b)
this.a.Y(new A.M(a,b))},
$S:9}
A.cr.prototype={
$0(){var s,r,q,p,o,n,m,l
try{q=this.a
p=q.a
o=p.$ti
n=o.c
m=n.a(this.b)
q.c=p.b.b.V(o.h("2/(1)").a(p.d),m,o.h("2/"),n)}catch(l){s=A.be(l)
r=A.ap(l)
q=s
p=r
if(p==null)p=A.cX(q)
o=this.a
o.c=new A.M(q,p)
o.b=!0}},
$S:0}
A.cq.prototype={
$0(){var s,r,q,p,o,n,m,l=this
try{s=t.n.a(l.a.a.c)
p=l.b
if(p.a.ao(s)&&p.a.e!=null){p.c=p.a.am(s)
p.b=!1}}catch(o){r=A.be(o)
q=A.ap(o)
p=t.n.a(l.a.a.c)
if(p.a===r){n=l.b
n.c=p
p=n}else{p=r
n=q
if(n==null)n=A.cX(p)
m=l.b
m.c=new A.M(p,n)
p=m}p.b=!0}},
$S:0}
A.bL.prototype={}
A.aN.prototype={
gj(a){var s,r,q=this,p={},o=new A.D($.q,t.h)
p.a=0
s=A.a9(q)
r=s.h("~(1)?").a(new A.c8(p,q))
t.bp.a(new A.c9(p,o))
A.d6(q.a,q.b,r,!1,s.c)
return o}}
A.c8.prototype={
$1(a){A.a9(this.b).c.a(a);++this.a.a},
$S(){return A.a9(this.b).h("~(1)")}}
A.c9.prototype={
$0(){var s=this.b,r=s.$ti,q=r.h("1/").a(this.a.a),p=s.F()
r.c.a(q)
s.a=8
s.c=q
A.ak(s,p)},
$S:0}
A.b6.prototype={$idK:1}
A.cH.prototype={
$0(){A.eN(this.a,this.b)},
$S:0}
A.bQ.prototype={
av(a){var s,r,q
t.M.a(a)
try{if(B.c===$.q){a.$0()
return}A.ea(null,null,this,a,t.H)}catch(q){s=A.be(q)
r=A.ap(q)
A.cG(A.b7(s),t.l.a(r))}},
aw(a,b,c){var s,r,q
c.h("~(0)").a(a)
c.a(b)
try{if(B.c===$.q){a.$1(b)
return}A.eb(null,null,this,a,b,t.H,c)}catch(q){s=A.be(q)
r=A.ap(q)
A.cG(A.b7(s),t.l.a(r))}},
ah(a){return new A.cy(this,t.M.a(a))},
ai(a,b){return new A.cz(this,b.h("~(0)").a(a),b)},
ar(a,b){b.h("0()").a(a)
if($.q===B.c)return a.$0()
return A.ea(null,null,this,a,b)},
V(a,b,c,d){c.h("@<0>").k(d).h("1(2)").a(a)
d.a(b)
if($.q===B.c)return a.$1(b)
return A.eb(null,null,this,a,b,c,d)},
au(a,b,c,d,e,f){d.h("@<0>").k(e).k(f).h("1(2,3)").a(a)
e.a(b)
f.a(c)
if($.q===B.c)return a.$2(b,c)
return A.fP(null,null,this,a,b,c,d,e,f)}}
A.cy.prototype={
$0(){return this.a.av(this.b)},
$S:0}
A.cz.prototype={
$1(a){var s=this.c
return this.a.aw(this.b,s.a(a),s)},
$S(){return this.c.h("~(0)")}}
A.aS.prototype={
gj(a){return this.a},
gI(){return new A.aT(this,this.$ti.h("aT<1>"))},
aj(a){var s,r
if(typeof a=="string"&&a!=="__proto__"){s=this.b
return s==null?!1:s[a]!=null}else if(typeof a=="number"&&(a&1073741823)===a){r=this.c
return r==null?!1:r[a]!=null}else return this.aa(a)},
aa(a){var s=this.d
if(s==null)return!1
return this.O(this.a_(s,a),a)>=0},
C(a,b){var s,r,q
if(typeof b=="string"&&b!=="__proto__"){s=this.b
r=s==null?null:A.dM(s,b)
return r}else if(typeof b=="number"&&(b&1073741823)===b){q=this.c
r=q==null?null:A.dM(q,b)
return r}else return this.ac(b)},
ac(a){var s,r,q=this.d
if(q==null)return null
s=this.a_(q,a)
r=this.O(s,a)
return r<0?null:s[r+1]},
A(a,b,c){var s,r,q,p,o=this,n=o.$ti
n.c.a(b)
n.y[1].a(c)
s=o.d
if(s==null)s=o.d=A.f5()
r=A.cR(b)&1073741823
q=s[r]
if(q==null){A.dN(s,r,[b,c]);++o.a
o.e=null}else{p=o.O(q,b)
if(p>=0)q[p+1]=c
else{q.push(b,c);++o.a
o.e=null}}},
S(a,b){var s,r,q,p,o,n,m=this,l=m.$ti
l.h("~(1,2)").a(b)
s=m.Z()
for(r=s.length,q=l.c,l=l.y[1],p=0;p<r;++p){o=s[p]
q.a(o)
n=m.C(0,o)
b.$2(o,n==null?l.a(n):n)
if(s!==m.e)throw A.j(A.at(m))}},
Z(){var s,r,q,p,o,n,m,l,k,j,i=this,h=i.e
if(h!=null)return h
h=A.eS(i.a,null,t.z)
s=i.b
r=0
if(s!=null){q=Object.getOwnPropertyNames(s)
p=q.length
for(o=0;o<p;++o){h[r]=q[o];++r}}n=i.c
if(n!=null){q=Object.getOwnPropertyNames(n)
p=q.length
for(o=0;o<p;++o){h[r]=+q[o];++r}}m=i.d
if(m!=null){q=Object.getOwnPropertyNames(m)
p=q.length
for(o=0;o<p;++o){l=m[q[o]]
k=l.length
for(j=0;j<k;j+=2){h[r]=l[j];++r}}}return i.e=h},
a_(a,b){return a[A.cR(b)&1073741823]}}
A.aV.prototype={
O(a,b){var s,r,q
if(a==null)return-1
s=a.length
for(r=0;r<s;r+=2){q=a[r]
if(q==null?b==null:q===b)return r}return-1}}
A.aT.prototype={
gj(a){return this.a.a},
gu(a){var s=this.a
return new A.aU(s,s.Z(),this.$ti.h("aU<1>"))}}
A.aU.prototype={
gq(){var s=this.d
return s==null?this.$ti.c.a(s):s},
n(){var s=this,r=s.b,q=s.c,p=s.a
if(r!==p.e)throw A.j(A.at(p))
else if(q>=r.length){s.d=null
return!1}else{s.d=r[q]
s.c=q+1
return!0}},
$iW:1}
A.l.prototype={
gu(a){return new A.a4(a,a.length,A.aq(a).h("a4<l.E>"))},
H(a,b){if(!(b<a.length))return A.p(a,b)
return a[b]},
J(a,b,c){var s=A.aq(a)
return new A.O(a,s.k(c).h("1(l.E)").a(b),s.h("@<l.E>").k(c).h("O<1,2>"))},
i(a){return A.dz(a,"[","]")}}
A.a5.prototype={
S(a,b){var s,r,q,p=A.a9(this)
p.h("~(1,2)").a(b)
for(s=this.gI(),s=s.gu(s),p=p.y[1];s.n();){r=s.gq()
q=this.C(0,r)
b.$2(r,q==null?p.a(q):q)}},
gj(a){var s=this.gI()
return s.gj(s)},
i(a){return A.dC(this)}}
A.c4.prototype={
$2(a,b){var s,r=this.a
if(!r.a)this.b.a+=", "
r.a=!1
r=this.b
s=A.n(a)
r.a=(r.a+=s)+": "
s=A.n(b)
r.a+=s},
$S:10}
A.m.prototype={
gL(){return A.eW(this)}}
A.bg.prototype={
i(a){var s=this.a
if(s!=null)return"Assertion failed: "+A.bX(s)
return"Assertion failed"}}
A.P.prototype={}
A.L.prototype={
gN(){return"Invalid argument"+(!this.a?"(s)":"")},
gM(){return""},
i(a){var s=this,r=s.c,q=r==null?"":" ("+r+")",p=s.d,o=p==null?"":": "+p,n=s.gN()+q+o
if(!s.a)return n
return n+s.gM()+": "+A.bX(s.gT())},
gT(){return this.b}}
A.ai.prototype={
gT(){return A.e1(this.b)},
gN(){return"RangeError"},
gM(){var s,r=this.e,q=this.f
if(r==null)s=q!=null?": Not less than or equal to "+A.n(q):""
else if(q==null)s=": Not greater than or equal to "+A.n(r)
else if(q>r)s=": Not in inclusive range "+A.n(r)+".."+A.n(q)
else s=q<r?": Valid value range is empty":": Only valid value is "+A.n(r)
return s}}
A.bm.prototype={
gT(){return A.u(this.b)},
gN(){return"RangeError"},
gM(){if(A.u(this.b)<0)return": index must not be negative"
var s=this.f
if(s===0)return": no indices are valid"
return": index should be less than "+s},
gj(a){return this.f}}
A.aP.prototype={
i(a){return"Unsupported operation: "+this.a}}
A.bJ.prototype={
i(a){return"UnimplementedError: "+this.a}}
A.bk.prototype={
i(a){var s=this.a
if(s==null)return"Concurrent modification during iteration."
return"Concurrent modification during iteration: "+A.bX(s)+"."}}
A.aM.prototype={
i(a){return"Stack Overflow"},
gL(){return null},
$im:1}
A.cm.prototype={
i(a){return"Exception: "+this.a}}
A.b.prototype={
J(a,b,c){var s=A.a9(this)
return A.eU(this,s.k(c).h("1(b.E)").a(b),s.h("b.E"),c)},
gj(a){var s,r=this.gu(this)
for(s=0;r.n();)++s
return s},
i(a){return A.eP(this,"(",")")}}
A.A.prototype={
gm(a){return A.e.prototype.gm.call(this,0)},
i(a){return"null"}}
A.e.prototype={$ie:1,
D(a,b){return this===b},
gm(a){return A.bC(this)},
i(a){return"Instance of '"+A.bD(this)+"'"},
gl(a){return A.h7(this)},
toString(){return this.i(this)}}
A.bR.prototype={
i(a){return""},
$iaj:1}
A.bH.prototype={
gj(a){return this.a.length},
i(a){var s=this.a
return s.charCodeAt(0)==0?s:s}}
A.cP.prototype={
$1(a){var s,r,q,p
if(A.e9(a))return a
s=this.a
if(s.aj(a))return s.C(0,a)
if(a instanceof A.a5){r={}
s.A(0,a,r)
for(s=a.gI(),s=s.gu(s);s.n();){q=s.gq()
r[q]=this.$1(a.C(0,q))}return r}else if(t.R.b(a)){p=[]
s.A(0,a,p)
B.a.ag(p,J.eE(a,this,t.z))
return p}else return a},
$S:11}
A.cv.prototype={
U(a){if(a<=0||a>4294967296)throw A.j(A.eX("max must be in range 0 < max \u2264 2^32, was "+a))
return Math.random()*a>>>0},
B(){return Math.random()},
ap(){return Math.random()<0.5}}
A.d_.prototype={}
A.aQ.prototype={}
A.bM.prototype={}
A.bO.prototype={}
A.cl.prototype={
$1(a){return this.a.$1(A.c(a))},
$S:1}
A.bF.prototype={
a4(a){var s,r=this
r.c=$.G
s=$.bb
r.a=A.bV(B.e.K(-s),B.e.K(s))
s=$.bc
r.b=A.bV(B.e.K(-s),B.e.K(s))
if(a){r.d=1+B.b.B()*2
r.e=A.bV(5,10)
r.f=0.7+B.b.B()*0.3
r.x=B.b.B()*3.141592653589793*2}else{r.d=A.bV(1,10)
r.e=A.bV(1,5)}s=B.b.U(4)
if(!(s>=0&&s<4))return A.p($.d3,s)
r.w=$.d3[s].a
r.r=B.b.ap()},
aq(){return this.a4(!1)},
al(){var s,r,q,p,o,n,m,l,k,j=this,i=j.c
i===$&&A.U()
s=j.e
s===$&&A.U()
s=i-s
j.c=s
if(s<1)j.aq()
i=j.a
i===$&&A.U()
s=j.c
r=j.b
r===$&&A.U()
q=$.G
p=A.dl(i/s,0,1,0,q)
o=A.dl(r/s,0,1,0,$.S)
r=j.d
r===$&&A.U()
n=A.dl(s,0,q,r,0)
if(n<=0)return
j.y=p
j.z=o
j.Q=n
m=n*2
i=Date.now()
s=j.x
s===$&&A.U()
s=Math.sin(i*0.003+s)
i=j.f
i===$&&A.U()
l=i+s*0.15
if(l<0.2)l=0.2
if(l>1)l=1
i=$.x
if(i!=null){i.globalAlpha=l
i=j.r
i===$&&A.U()
s=j.w
if(i){s===$&&A.U()
k=$.dm.C(0,s).b}else{s===$&&A.U()
k=$.dm.C(0,s).a}i=$.x
i.toString
A.bU(i,"drawImage",[k,p-n,o-n,m,m],t.H)
i=$.x
i.toString
i.globalAlpha=1}}}
A.c7.prototype={
aA(){var s,r,q=this
if(q.e)return
q.e=!0
q.f=1
q.a=B.b.B()*$.G
q.b=B.b.B()*$.S
s=B.b.B()*3.141592653589793*2
r=15+B.b.B()*10
q.c=Math.cos(s)*r
q.d=Math.sin(s)*r},
ak(){var s,r,q,p,o=this
if(!o.e){if(B.b.B()<0.005)o.aA()
return}o.a=o.a+o.c
o.b=o.b+o.d
if((o.f-=0.015)<=0){o.e=!1
return}s=$.x
if(s!=null){s.beginPath()
s=$.x
r=o.a
q=o.b
p=A.c(s.createLinearGradient(r,q,r-o.c*3,q-o.d*3))
p.addColorStop(0,"rgba(255, 255, 255, "+A.n(o.f)+")")
p.addColorStop(1,"rgba(255, 255, 255, 0)")
q=$.x
q.toString
q.lineWidth=2
q=$.x
q.toString
q.strokeStyle=p
$.x.moveTo(o.a,o.b)
$.x.lineTo(o.a-o.c*3,o.b-o.d*3)
$.x.stroke()}}}
A.cN.prototype={
$1(a){var s,r=$.y
r.toString
s=v.G
r.width=A.u(A.c(s.window).innerWidth)
r=$.y
r.toString
r.height=A.u(A.c(s.window).innerHeight)
s=$.y
r=A.u(s.width)
$.G=r
s=A.u(s.height)
$.S=s
$.bb=r*0.5
$.bc=s*0.5
A.ei()},
$S:1};(function aliases(){var s=J.Y.prototype
s.a5=s.i})();(function installTearOffs(){var s=hunkHelpers._static_1,r=hunkHelpers._static_0
s(A,"fZ","f1",2)
s(A,"h_","f2",2)
s(A,"h0","f3",2)
r(A,"ef","fT",0)
s(A,"em","h3",12)
s(A,"hj","h9",1)})();(function inheritance(){var s=hunkHelpers.mixin,r=hunkHelpers.inherit,q=hunkHelpers.inheritMany
r(A.e,null)
q(A.e,[A.d0,J.bn,A.aL,J.as,A.m,A.c6,A.b,A.a4,A.aF,A.v,A.a_,A.ca,A.c5,A.b0,A.V,A.a5,A.c3,A.aD,A.ck,A.F,A.bP,A.cC,A.cA,A.M,A.aR,A.D,A.bL,A.aN,A.b6,A.aU,A.l,A.aM,A.cm,A.A,A.bR,A.bH,A.cv,A.d_,A.bO,A.bF,A.c7])
q(J.bn,[J.bp,J.aw,J.aA,J.az,J.aB,J.ax,J.ay])
q(J.aA,[J.Y,J.t,A.ag,A.aI])
q(J.Y,[J.bB,J.aO,J.X])
r(J.bo,A.aL)
r(J.c2,J.t)
q(J.ax,[J.av,J.bq])
q(A.m,[A.aC,A.P,A.br,A.bK,A.bE,A.bN,A.bg,A.L,A.aP,A.bJ,A.bk])
q(A.b,[A.d,A.a6])
q(A.d,[A.N,A.aE,A.aT])
r(A.au,A.a6)
r(A.O,A.N)
r(A.a8,A.a_)
q(A.a8,[A.a0,A.b_])
r(A.aK,A.P)
q(A.V,[A.bi,A.bj,A.bI,A.cK,A.cM,A.ch,A.cg,A.ct,A.c8,A.cz,A.cP,A.cl,A.cN])
q(A.bI,[A.bG,A.af])
q(A.a5,[A.a3,A.aS])
q(A.bj,[A.cL,A.cu,A.c4])
q(A.aI,[A.bs,A.ah])
q(A.ah,[A.aW,A.aY])
r(A.aX,A.aW)
r(A.aG,A.aX)
r(A.aZ,A.aY)
r(A.aH,A.aZ)
q(A.aG,[A.bt,A.bu])
q(A.aH,[A.bv,A.bw,A.bx,A.by,A.bz,A.aJ,A.bA])
r(A.b1,A.bN)
q(A.bi,[A.ci,A.cj,A.cB,A.cn,A.cp,A.co,A.cs,A.cr,A.cq,A.c9,A.cH,A.cy])
r(A.bQ,A.b6)
r(A.aV,A.aS)
q(A.L,[A.ai,A.bm])
r(A.aQ,A.aN)
r(A.bM,A.aQ)
s(A.aW,A.l)
s(A.aX,A.v)
s(A.aY,A.l)
s(A.aZ,A.v)})()
var v={G:typeof self!="undefined"?self:globalThis,typeUniverse:{eC:new Map(),tR:{},eT:{},tPV:{},sEA:[]},mangledGlobalNames:{a:"int",f:"double",T:"num",I:"String",bT:"bool",A:"Null",i:"List",e:"Object",hq:"Map",k:"JSObject"},mangledNames:{},types:["~()","~(k)","~(~())","A(@)","A()","@(@)","@(@,I)","@(I)","A(~())","A(e,aj)","~(e?,e?)","e?(e?)","~(T)"],interceptorsByTag:null,leafTags:null,arrayRti:Symbol("$ti"),rttc:{"2;name,stops":(a,b)=>c=>c instanceof A.a0&&a.b(c.a)&&b.b(c.b),"2;round,spiky":(a,b)=>c=>c instanceof A.b_&&a.b(c.a)&&b.b(c.b)}}
A.fj(v.typeUniverse,JSON.parse('{"bB":"Y","aO":"Y","X":"Y","hr":"ag","bp":{"bT":[],"h":[]},"aw":{"h":[]},"aA":{"k":[]},"Y":{"k":[]},"t":{"i":["1"],"d":["1"],"k":[],"b":["1"]},"bo":{"aL":[]},"c2":{"t":["1"],"i":["1"],"d":["1"],"k":[],"b":["1"]},"as":{"W":["1"]},"ax":{"f":[],"T":[]},"av":{"f":[],"a":[],"T":[],"h":[]},"bq":{"f":[],"T":[],"h":[]},"ay":{"I":[],"h":[]},"aC":{"m":[]},"d":{"b":["1"]},"N":{"d":["1"],"b":["1"]},"a4":{"W":["1"]},"a6":{"b":["2"],"b.E":"2"},"au":{"a6":["1","2"],"d":["2"],"b":["2"],"b.E":"2"},"aF":{"W":["2"]},"O":{"N":["2"],"d":["2"],"b":["2"],"b.E":"2","N.E":"2"},"a0":{"a8":[],"a_":[]},"b_":{"a8":[],"a_":[]},"aK":{"P":[],"m":[]},"br":{"m":[]},"bK":{"m":[]},"b0":{"aj":[]},"V":{"a2":[]},"bi":{"a2":[]},"bj":{"a2":[]},"bI":{"a2":[]},"bG":{"a2":[]},"af":{"a2":[]},"bE":{"m":[]},"a3":{"a5":["1","2"],"dB":["1","2"]},"aE":{"d":["1"],"b":["1"],"b.E":"1"},"aD":{"W":["1"]},"a8":{"a_":[]},"ag":{"k":[],"cY":[],"h":[]},"aI":{"k":[]},"bs":{"cZ":[],"k":[],"h":[]},"ah":{"z":["1"],"k":[]},"aG":{"l":["f"],"i":["f"],"z":["f"],"d":["f"],"k":[],"b":["f"],"v":["f"]},"aH":{"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"]},"bt":{"bY":[],"l":["f"],"i":["f"],"z":["f"],"d":["f"],"k":[],"b":["f"],"v":["f"],"h":[],"l.E":"f"},"bu":{"bZ":[],"l":["f"],"i":["f"],"z":["f"],"d":["f"],"k":[],"b":["f"],"v":["f"],"h":[],"l.E":"f"},"bv":{"c_":[],"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"],"h":[],"l.E":"a"},"bw":{"c0":[],"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"],"h":[],"l.E":"a"},"bx":{"c1":[],"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"],"h":[],"l.E":"a"},"by":{"cc":[],"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"],"h":[],"l.E":"a"},"bz":{"cd":[],"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"],"h":[],"l.E":"a"},"aJ":{"ce":[],"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"],"h":[],"l.E":"a"},"bA":{"cf":[],"l":["a"],"i":["a"],"z":["a"],"d":["a"],"k":[],"b":["a"],"v":["a"],"h":[],"l.E":"a"},"bN":{"m":[]},"b1":{"P":[],"m":[]},"M":{"m":[]},"D":{"bl":["1"]},"b6":{"dK":[]},"bQ":{"b6":[],"dK":[]},"aS":{"a5":["1","2"]},"aV":{"aS":["1","2"],"a5":["1","2"]},"aT":{"d":["1"],"b":["1"],"b.E":"1"},"aU":{"W":["1"]},"f":{"T":[]},"a":{"T":[]},"i":{"d":["1"],"b":["1"]},"bg":{"m":[]},"P":{"m":[]},"L":{"m":[]},"ai":{"m":[]},"bm":{"m":[]},"aP":{"m":[]},"bJ":{"m":[]},"bk":{"m":[]},"aM":{"m":[]},"bR":{"aj":[]},"aQ":{"aN":["1"]},"bM":{"aQ":["1"],"aN":["1"]},"c1":{"i":["a"],"d":["a"],"b":["a"]},"cf":{"i":["a"],"d":["a"],"b":["a"]},"ce":{"i":["a"],"d":["a"],"b":["a"]},"c_":{"i":["a"],"d":["a"],"b":["a"]},"cc":{"i":["a"],"d":["a"],"b":["a"]},"c0":{"i":["a"],"d":["a"],"b":["a"]},"cd":{"i":["a"],"d":["a"],"b":["a"]},"bY":{"i":["f"],"d":["f"],"b":["f"]},"bZ":{"i":["f"],"d":["f"],"b":["f"]}}'))
A.fi(v.typeUniverse,JSON.parse('{"d":1,"ah":1}'))
var u={c:"Error handler must accept one Object or one Object and a StackTrace as arguments, and return a value of the returned future's type"}
var t=(function rtii(){var s=A.bd
return{n:s("M"),J:s("cY"),Y:s("cZ"),V:s("d<@>"),Q:s("m"),B:s("bY"),q:s("bZ"),Z:s("a2"),O:s("c_"),k:s("c0"),U:s("c1"),R:s("b<@>"),f:s("t<e>"),s:s("t<I>"),b:s("t<@>"),T:s("aw"),m:s("k"),g:s("X"),p:s("z<@>"),j:s("i<@>"),P:s("A"),K:s("e"),L:s("hs"),d:s("+()"),l:s("aj"),N:s("I"),r:s("h"),c:s("P"),D:s("cc"),w:s("cd"),e:s("ce"),E:s("cf"),G:s("aO"),a:s("bM<k>"),_:s("D<@>"),h:s("D<a>"),A:s("aV<e?,e?>"),y:s("bT"),t:s("bT(e)"),i:s("f"),z:s("@"),W:s("@()"),v:s("@(e)"),C:s("@(e,aj)"),S:s("a"),x:s("bl<A>?"),aQ:s("k?"),X:s("e?"),aD:s("I?"),F:s("aR<@,@>?"),u:s("bT?"),I:s("f?"),a3:s("a?"),ae:s("T?"),bp:s("~()?"),bj:s("~(k)?"),o:s("T"),H:s("~"),M:s("~()")}})();(function constants(){B.t=J.bn.prototype
B.a=J.t.prototype
B.d=J.av.prototype
B.e=J.ax.prototype
B.u=J.X.prototype
B.v=J.aA.prototype
B.k=J.bB.prototype
B.h=J.aO.prototype
B.i=function getTagFallback(o) {
  var s = Object.prototype.toString.call(o);
  return s.substring(8, s.length - 1);
}
B.l=function() {
  var toStringFunction = Object.prototype.toString;
  function getTag(o) {
    var s = toStringFunction.call(o);
    return s.substring(8, s.length - 1);
  }
  function getUnknownTag(object, tag) {
    if (/^HTML[A-Z].*Element$/.test(tag)) {
      var name = toStringFunction.call(object);
      if (name == "[object Object]") return null;
      return "HTMLElement";
    }
  }
  function getUnknownTagGenericBrowser(object, tag) {
    if (object instanceof HTMLElement) return "HTMLElement";
    return getUnknownTag(object, tag);
  }
  function prototypeForTag(tag) {
    if (typeof window == "undefined") return null;
    if (typeof window[tag] == "undefined") return null;
    var constructor = window[tag];
    if (typeof constructor != "function") return null;
    return constructor.prototype;
  }
  function discriminator(tag) { return null; }
  var isBrowser = typeof HTMLElement == "function";
  return {
    getTag: getTag,
    getUnknownTag: isBrowser ? getUnknownTagGenericBrowser : getUnknownTag,
    prototypeForTag: prototypeForTag,
    discriminator: discriminator };
}
B.q=function(getTagFallback) {
  return function(hooks) {
    if (typeof navigator != "object") return hooks;
    var userAgent = navigator.userAgent;
    if (typeof userAgent != "string") return hooks;
    if (userAgent.indexOf("DumpRenderTree") >= 0) return hooks;
    if (userAgent.indexOf("Chrome") >= 0) {
      function confirm(p) {
        return typeof window == "object" && window[p] && window[p].name == p;
      }
      if (confirm("Window") && confirm("HTMLElement")) return hooks;
    }
    hooks.getTag = getTagFallback;
  };
}
B.m=function(hooks) {
  if (typeof dartExperimentalFixupGetTag != "function") return hooks;
  hooks.getTag = dartExperimentalFixupGetTag(hooks.getTag);
}
B.p=function(hooks) {
  if (typeof navigator != "object") return hooks;
  var userAgent = navigator.userAgent;
  if (typeof userAgent != "string") return hooks;
  if (userAgent.indexOf("Firefox") == -1) return hooks;
  var getTag = hooks.getTag;
  var quickMap = {
    "BeforeUnloadEvent": "Event",
    "DataTransfer": "Clipboard",
    "GeoGeolocation": "Geolocation",
    "Location": "!Location",
    "WorkerMessageEvent": "MessageEvent",
    "XMLDocument": "!Document"};
  function getTagFirefox(o) {
    var tag = getTag(o);
    return quickMap[tag] || tag;
  }
  hooks.getTag = getTagFirefox;
}
B.o=function(hooks) {
  if (typeof navigator != "object") return hooks;
  var userAgent = navigator.userAgent;
  if (typeof userAgent != "string") return hooks;
  if (userAgent.indexOf("Trident/") == -1) return hooks;
  var getTag = hooks.getTag;
  var quickMap = {
    "BeforeUnloadEvent": "Event",
    "DataTransfer": "Clipboard",
    "HTMLDDElement": "HTMLElement",
    "HTMLDTElement": "HTMLElement",
    "HTMLPhraseElement": "HTMLElement",
    "Position": "Geoposition"
  };
  function getTagIE(o) {
    var tag = getTag(o);
    var newTag = quickMap[tag];
    if (newTag) return newTag;
    if (tag == "Object") {
      if (window.DataView && (o instanceof window.DataView)) return "DataView";
    }
    return tag;
  }
  function prototypeForTagIE(tag) {
    var constructor = window[tag];
    if (constructor == null) return null;
    return constructor.prototype;
  }
  hooks.getTag = getTagIE;
  hooks.prototypeForTag = prototypeForTagIE;
}
B.n=function(hooks) {
  var getTag = hooks.getTag;
  var prototypeForTag = hooks.prototypeForTag;
  function getTagFixed(o) {
    var tag = getTag(o);
    if (tag == "Document") {
      if (!!o.xmlVersion) return "!Document";
      return "!HTMLDocument";
    }
    return tag;
  }
  function prototypeForTagFixed(tag) {
    if (tag == "Document") return null;
    return prototypeForTag(tag);
  }
  hooks.getTag = getTagFixed;
  hooks.prototypeForTag = prototypeForTagFixed;
}
B.j=function(hooks) { return hooks; }

B.f=new A.c6()
B.b=new A.cv()
B.c=new A.bQ()
B.r=new A.bR()
B.w=A.H("cY")
B.x=A.H("cZ")
B.y=A.H("bY")
B.z=A.H("bZ")
B.A=A.H("c_")
B.B=A.H("c0")
B.C=A.H("c1")
B.D=A.H("e")
B.E=A.H("cc")
B.F=A.H("cd")
B.G=A.H("ce")
B.H=A.H("cf")})();(function staticFields(){$.cw=null
$.C=A.w([],t.f)
$.dD=null
$.dw=null
$.dv=null
$.el=null
$.ee=null
$.eo=null
$.cJ=null
$.cO=null
$.di=null
$.cx=A.w([],A.bd("t<i<e>?>"))
$.am=null
$.b9=null
$.ba=null
$.dc=!1
$.q=B.c
$.cS=0
$.y=null
$.x=null
$.G=0
$.S=0
$.bb=0
$.bc=0
$.dm=A.eQ(t.N,A.bd("+round,spiky(k,k)"))
$.d3=function(){var s=t.s
return A.w([new A.a0("white",A.w(["rgba(255, 255, 255, 1)","rgba(255, 255, 255, 0)"],s)),new A.a0("blue",A.w(["rgba(170, 191, 255, 1)","rgba(170, 191, 255, 0)"],s)),new A.a0("red",A.w(["rgba(255, 204, 170, 1)","rgba(255, 204, 170, 0)"],s)),new A.a0("yellow",A.w(["rgba(255, 255, 170, 1)","rgba(255, 255, 170, 0)"],s))],A.bd("t<+name,stops(I,i<I>)>"))}()
$.cT=A.w([],A.bd("t<bF>"))
$.dZ=A.d5()
$.bS=A.d5()
$.J=A.d5()})();(function lazyInitializers(){var s=hunkHelpers.lazyFinal
s($,"hp","dr",()=>A.h6("_$dart_dartClosure"))
s($,"hF","eA",()=>A.w([new J.bo()],A.bd("t<aL>")))
s($,"ht","eq",()=>A.Q(A.cb({
toString:function(){return"$receiver$"}})))
s($,"hu","er",()=>A.Q(A.cb({$method$:null,
toString:function(){return"$receiver$"}})))
s($,"hv","es",()=>A.Q(A.cb(null)))
s($,"hw","et",()=>A.Q(function(){var $argumentsExpr$="$arguments$"
try{null.$method$($argumentsExpr$)}catch(r){return r.message}}()))
s($,"hz","ew",()=>A.Q(A.cb(void 0)))
s($,"hA","ex",()=>A.Q(function(){var $argumentsExpr$="$arguments$"
try{(void 0).$method$($argumentsExpr$)}catch(r){return r.message}}()))
s($,"hy","ev",()=>A.Q(A.dH(null)))
s($,"hx","eu",()=>A.Q(function(){try{null.$method$}catch(r){return r.message}}()))
s($,"hC","ez",()=>A.Q(A.dH(void 0)))
s($,"hB","ey",()=>A.Q(function(){try{(void 0).$method$}catch(r){return r.message}}()))
s($,"hD","ds",()=>A.f0())
s($,"hE","cU",()=>A.cR(B.D))})();(function nativeSupport(){!function(){var s=function(a){var m={}
m[a]=1
return Object.keys(hunkHelpers.convertToFastObject(m))[0]}
v.getIsolateTag=function(a){return s("___dart_"+a+v.isolateTag)}
var r="___dart_isolate_tags_"
var q=Object[r]||(Object[r]=Object.create(null))
var p="_ZxYxX"
for(var o=0;;o++){var n=s(p+"_"+o+"_")
if(!(n in q)){q[n]=1
v.isolateTag=n
break}}v.dispatchPropertyName=v.getIsolateTag("dispatch_record")}()
hunkHelpers.setOrUpdateInterceptorsByTag({ArrayBuffer:A.ag,SharedArrayBuffer:A.ag,ArrayBufferView:A.aI,DataView:A.bs,Float32Array:A.bt,Float64Array:A.bu,Int16Array:A.bv,Int32Array:A.bw,Int8Array:A.bx,Uint16Array:A.by,Uint32Array:A.bz,Uint8ClampedArray:A.aJ,CanvasPixelArray:A.aJ,Uint8Array:A.bA})
hunkHelpers.setOrUpdateLeafTags({ArrayBuffer:true,SharedArrayBuffer:true,ArrayBufferView:false,DataView:true,Float32Array:true,Float64Array:true,Int16Array:true,Int32Array:true,Int8Array:true,Uint16Array:true,Uint32Array:true,Uint8ClampedArray:true,CanvasPixelArray:true,Uint8Array:false})
A.ah.$nativeSuperclassTag="ArrayBufferView"
A.aW.$nativeSuperclassTag="ArrayBufferView"
A.aX.$nativeSuperclassTag="ArrayBufferView"
A.aG.$nativeSuperclassTag="ArrayBufferView"
A.aY.$nativeSuperclassTag="ArrayBufferView"
A.aZ.$nativeSuperclassTag="ArrayBufferView"
A.aH.$nativeSuperclassTag="ArrayBufferView"})()
Function.prototype.$0=function(){return this()}
Function.prototype.$1=function(a){return this(a)}
Function.prototype.$2=function(a,b){return this(a,b)}
Function.prototype.$3=function(a,b,c){return this(a,b,c)}
Function.prototype.$4=function(a,b,c,d){return this(a,b,c,d)}
Function.prototype.$1$1=function(a){return this(a)}
convertAllToFastObject(w)
convertToFastObject($);(function(a){if(typeof document==="undefined"){a(null)
return}if(typeof document.currentScript!="undefined"){a(document.currentScript)
return}var s=document.scripts
function onLoad(b){for(var q=0;q<s.length;++q){s[q].removeEventListener("load",onLoad,false)}a(b.target)}for(var r=0;r<s.length;++r){s[r].addEventListener("load",onLoad,false)}})(function(a){v.currentScript=a
var s=A.hi
if(typeof dartMainRunner==="function"){dartMainRunner(s,[])}else{s([])}})})()
//# sourceMappingURL=main.dart.js.map
