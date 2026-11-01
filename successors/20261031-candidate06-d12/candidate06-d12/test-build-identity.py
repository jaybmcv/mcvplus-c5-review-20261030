from pathlib import Path
import json,uuid
from build_identity import payload_entries,build_id
r=Path(__file__).parent/'evidence'/('SYNTHETIC-config-'+uuid.uuid4().hex)
(r/'config').mkdir(parents=True)
def save(name,obj):(r/'config'/name).write_text(json.dumps(obj))
save('run-binding.json',{'enabled':False,'buildId':'a'*64,'requires':{'readOnly':True}})
save('provider-binding.json',{'buildId':'a'*64,'enabled':False,'scopes':['members:read']})
save('replay-binding.json',{'enabled':False,'projectId':'UNBOUND','databaseId':'UNBOUND'})
initial=build_id(payload_entries(r))
save('run-binding.json',{'enabled':False,'buildId':'b'*64,'requires':{'readOnly':True}})
assert build_id(payload_entries(r))==initial
save('run-binding.json',{'enabled':False,'buildId':'b'*64,'requires':{'readOnly':False}})
assert build_id(payload_entries(r))!=initial
save('run-binding.json',{'enabled':False,'buildId':'a'*64,'requires':{'readOnly':True}})
save('replay-binding.json',{'enabled':False,'projectId':'UNBOUND','databaseId':'replacement'})
assert build_id(payload_entries(r))!=initial
print(json.dumps({'checks':3,'passed':3,'fixture':str(r),'checksProve':['self buildId is noncircular','immutable run security fields change identity','replay namespace changes identity']}))
