"""File-only correction; does not execute the candidate construction recipe."""
from pathlib import Path
import shutil
w=Path(__file__).parent;old=w/'candidate06-d12';r=w/'candidate06-d12-final'
shutil.copytree(old,r)
p=r/'prepare-provider-bundle.py';s=p.read_text()
anchor="p=out/'provider'/'readonly-db.mjs';s=p.read_bytes().decode('utf-8')"
assert anchor in s
s=s.replace(anchor,anchor+"\n# Match Candidate05's Windows text-write conversion before adding the LF exception comment.\ns=s.replace('\\r\\n','\\n').replace('\\n','\\r\\n')")
s=s.replace("for p in sorted(out.rglob('*')):","for p in sorted(out.rglob('*'),key=lambda p:p.relative_to(out).as_posix()):")
p.write_bytes(s.encode())
p=r/'REMAINING-WORK.md';s=p.read_text()
s=s.replace('- [ ] Obtain independent static source/SQL review of the sealed packet; close any in-scope findings before return. Final review receipt records completion, without granting runtime approval.','- Independent static source/SQL review is a mandatory delivery gate. Its completion and exact reviewed manifest hash are recorded in the external INDEPENDENT-STATIC-REVIEW.md, not inferred from this checklist or used as runtime approval.')
p.write_bytes(s.encode())
p=r/'README.md';s=p.read_text();s=s.replace('It reproduces the amended provider from immutable amendment inputs with the same disabled binding and current README.','It preserves the predecessor Windows CRLF text conversion, then adds the exception comment and signature; it uses explicit path ordering for the service manifest and the same disabled binding/current README references. This is a static construction design, not an executed reproducibility result.')
p.write_bytes(s.encode())
seal=(w/'seal-static-packet.py').read_text().replace("r=w/'candidate06-d12'","r=w/'candidate06-d12-final'")
(w/'seal-static-packet-final.py').write_bytes(seal.encode())
print('Final review copy prepared; initial sealed review copy retained unchanged.')
