export const MAX_BYTES=24*1024*1024, CHUNK_SIZE=240000;
export async function pack(data, cryptoApi=globalThis.crypto){
  const bytes=new TextEncoder().encode(JSON.stringify(data));
  if(bytes.length>MAX_BYTES)throw Error('온라인 저장은 24MB 이하만 지원합니다. 이미지 용량을 줄여 주세요.');
  let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
  const encoded=btoa(binary),parts=[];
  for(let i=0;i<encoded.length;i+=CHUNK_SIZE)parts.push(encoded.slice(i,i+CHUNK_SIZE));
  const digest=await cryptoApi.subtle.digest('SHA-256',bytes);
  return {parts,bytes:bytes.length,hash:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')};
}
export async function unpack(meta, readPart, cryptoApi=globalThis.crypto){
  if(meta.schema!==1||!Number.isInteger(meta.count)||meta.count<1||meta.count>140||!Number.isInteger(meta.bytes)||meta.bytes<1||meta.bytes>MAX_BYTES||!/^r_[a-zA-Z0-9_-]+$/.test(meta.revision)||!/^[a-f0-9]{64}$/.test(meta.hash))throw Error('온라인 저장 정보 형식이 올바르지 않습니다.');
  const parts=[];
  for(let i=0;i<meta.count;i++){
    const part=await readPart(meta.revision,i);
    if(typeof part!=='string'||part.length>CHUNK_SIZE||!/^[A-Za-z0-9+/=]+$/.test(part))throw Error('저장 내용 일부가 없거나 손상되었습니다.');
    parts.push(part);
  }
  const binary=atob(parts.join('')),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  if(bytes.length!==meta.bytes)throw Error('온라인 자료 크기가 일치하지 않습니다.');
  const digest=await cryptoApi.subtle.digest('SHA-256',bytes);
  if(Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')!==meta.hash)throw Error('온라인 자료 검증에 실패했습니다.');
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export async function saveRevision(data, baseRevision, adapter, cryptoApi=globalThis.crypto){
  if(baseRevision===undefined)throw Error('온라인 내용을 먼저 불러온 뒤 저장해 주세요.');
  const packed=await pack(data,cryptoApi),revision='r_'+cryptoApi.randomUUID();
  for(let i=0;i<packed.parts.length;i++)await adapter.writePart(revision,i,packed.parts[i]);
  const meta={schema:1,revision,count:packed.parts.length,bytes:packed.bytes,hash:packed.hash};
  // Publish only after all immutable chunks exist; adapter must compare in a server transaction.
  await adapter.commit(meta,baseRevision);
  return meta;
}
