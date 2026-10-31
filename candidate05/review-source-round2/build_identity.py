from pathlib import Path
import hashlib,json
SELF_CONFIG={'config/run-binding.json','config/provider-binding.json'}
def payload_entries(root):
 result=[]
 for p in root.rglob('*'):
  if not p.is_file() or any(n in ['node_modules','.next'] for n in p.relative_to(root).parts):continue
  rel=p.relative_to(root).as_posix()
  if rel in ['config/build-binding.json','SOURCE-MANIFEST.json'] or rel.endswith('.tsbuildinfo'):continue
  if rel in SELF_CONFIG:
   value=json.loads(p.read_text(encoding='utf-8-sig'));value.pop('buildId',None)
   data=json.dumps(value,sort_keys=True,separators=(',',':')).encode()
   result.append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'normalization':'canonical JSON; omit only top-level self-referential buildId'})
  else:
   data=p.read_bytes();result.append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 return sorted(result,key=lambda x:x['path'])
def build_id(entries):return hashlib.sha256(json.dumps(entries,sort_keys=True,separators=(',',':')).encode()).hexdigest()
