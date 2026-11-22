"""Export the user's original SVG paths, preserving geometry. No generated artwork."""
from pathlib import Path
import xml.etree.ElementTree as E
import re,json
root=Path('docs/art/tiggy-rive-source')
def paths(name):
 r=E.parse(root/f'tiggy_{name}_layered.svg').getroot();return r,{g.attrib['id']:list(g) for g in r}
r,gs=paths('neutral')
mapping=json.loads((root/'preparation-report.json').read_text())['groups']
parts=[]
for g,groups in mapping.items():
 for name,indices in groups:
  for i in indices:
   p=gs[g][i];parts.append({'part':name,'d':p.attrib['d'],'fill':p.attrib.get('fill','#000'),'matrix':[float(v) for v in re.findall(r'-?\d*\.?\d+(?:e[+-]?\d+)?',p.attrib.get('transform','matrix(1,0,0,1,0,0)'))]})
# Expression mouths are original source paths, aligned to the neutral viewBox by translation.
expressions={}
for name in ['thinking','laughing']:
 rr,gg=paths(name);delta=float(r.attrib['viewBox'].split()[0])-float(rr.attrib['viewBox'].split()[0]);out=[]
 for p in ([gg['09_lower_body_front'][1], gg['09_lower_body_front'][2], *gg['10_torso_front']] if name == 'laughing' else gg['10_torso_front']):
  m=[float(v) for v in re.findall(r'-?\d*\.?\d+(?:e[+-]?\d+)?',p.attrib['transform'])];m[4]+=delta
  out.append({'d':p.attrib['d'],'fill':p.attrib['fill'],'matrix':m})
 expressions[name]=out
rr,gg=paths('laughing');delta=float(r.attrib['viewBox'].split()[0])-float(rr.attrib['viewBox'].split()[0])
for name,p in [('closedLeft',gg['08_facial_features'][9]),('closedRight',gg['09_lower_body_front'][0])]:
 m=[float(v) for v in re.findall(r'-?\d*\.?\d+(?:e[+-]?\d+)?',p.attrib['transform'])];m[4]+=delta
 expressions[name]=[{'d':p.attrib['d'],'fill':p.attrib['fill'],'matrix':m}]
Path('src/game/tiggyLayers.json').write_text(json.dumps({'parts':parts,'expressions':expressions},separators=(',',':'))+'\n')
print(f'Exported {len(parts)} original paths plus original expression mouths.')
