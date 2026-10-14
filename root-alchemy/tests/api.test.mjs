import test from 'node:test';import assert from 'node:assert/strict';import {createHandler} from '../api/app.js';
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(data){this.data=data;return data}}}
const request=(action,options={})=>({method:'GET',url:'/api/app?action='+action,headers:{authorization:'Bearer valid',host:'game.example',...options.headers},...options});
test('anonymous calls do not access Firestore',async()=>{let touched=false;const h=createHandler(async()=>{touched=true});const r=response();await h({method:'GET',url:'/api/app?action=bootstrap',headers:{}},r);assert.equal(r.statusCode,401);assert.equal(touched,false)});
test('student or unverified teacher cannot reach any admin API',async()=>{for(const token of [{uid:'student',email:'twingkling@gmail.com'},{uid:'teacher',email:'teacher@example.com',teacher:true,email_verified:false}]){let touched=false;const h=createHandler(async()=>({auth:{verifyIdToken:async()=>token},db:{collection(){touched=true;throw Error('Unexpected DB access')}}}));for(const action of ['admin-list','admin-students','admin-save','admin-import','admin-publish']){const r=response();await h(request(action),r);assert.equal(r.statusCode,403);assert.equal(touched,false)}}});
test('admin mutations require POST even with a valid teacher token',async()=>{const h=createHandler(async()=>({auth:{verifyIdToken:async()=>({uid:'teacher',email:'teacher@example.com',teacher:true,email_verified:true})},db:{}}));const r=response();await h(request('admin-save'),r);assert.equal(r.statusCode,405)});
test('cross-site POST rejected before auth or data access',async()=>{const h=createHandler(async()=>{throw Error('Must not run')});const r=response();await h(request('attempt',{method:'POST',headers:{origin:'https://evil.example',host:'game.example'},body:{}}),r);assert.equal(r.statusCode,403)});
test('attempt paths are scoped to the signed-in UID, not body user ID',async()=>{
 const paths=[];
 const db={
  collection(name){paths.push(name);return {doc(uid){paths.push(uid);return {collection(name){paths.push(name);return {doc(id){paths.push(id);return {}}}}}}}},
  async runTransaction(fn){return fn({get:async()=>({exists:false})})}
 };
 const h=createHandler(async()=>({auth:{verifyIdToken:async()=>({uid:'signed-in-user',email:'student@example.com'})},db}));
 const r=response();await h(request('attempt',{method:'POST',headers:{origin:'https://game.example',host:'game.example',authorization:'Bearer valid'},body:{userId:'other-student',challengeId:'quiz-123',answer:'extract'}}),r);
 assert.equal(r.statusCode,404);assert.deepEqual(paths,['rootAlchemyUsers','signed-in-user','challenges','quiz-123']);assert.equal(paths.includes('other-student'),false)
});
