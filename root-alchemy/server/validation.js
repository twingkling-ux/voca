export class AppError extends Error{constructor(status,message){super(message);this.status=status}}
export const fail=(status,message)=>{throw new AppError(status,message)};
export function validateWord(w){if(!w||typeof w!=='object'||Array.isArray(w))fail(400,'단어 형식이 올바르지 않습니다.');const out={};for(const key of ['prefix','root','suffix','word','meaning','prefixMeaning','rootMeaning','suffixMeaning','sentence','answer','translation','source','pack']){const value=w[key]??'';if(typeof value!=='string'||value.length>3000)fail(400,`${key} 항목을 확인하세요.`);out[key]=value.trim()}
for(const k of ['root','word','meaning','rootMeaning','sentence','answer','translation','source','pack'])if(!out[k])fail(400,`${k} 항목이 필요합니다.`);
if(!/^[a-z]+$/.test(out.word)||out.prefix+out.root+out.suffix!==out.word)fail(400,'접두사+어근+접미사의 철자가 단어와 같아야 합니다.');
if((out.sentence.match(/_____/g)||[]).length!==1)fail(400,'예문에 _____ 빈칸 하나가 필요합니다.');if(out.answer!==out.word)fail(400,'정답은 합성 단어의 기본형이어야 합니다.');return out}
export function validEmail(email){if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email))fail(400,'올바른 이메일을 입력하세요.');return email.trim().toLowerCase()}
export function teacherEmail(email,allowlist){return typeof email==='string'&&allowlist.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase())}
export function checkOrigin(req){const origin=req.headers.origin;if(!origin)fail(403,'요청 출처를 확인할 수 없습니다.');let url;try{url=new URL(origin)}catch{fail(403,'요청 출처가 올바르지 않습니다.')}const host=req.headers.host;if(url.host!==host||!['https:','http:'].includes(url.protocol))fail(403,'다른 사이트의 요청은 허용되지 않습니다.');if(process.env.APP_URL&&new URL(process.env.APP_URL).origin!==url.origin)fail(403,'등록되지 않은 주소입니다.')}
export function uuid(s){if(typeof s!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s))fail(400,'잘못된 ID입니다.');return s}
