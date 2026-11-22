"""Non-destructive path grouping only. Does not create bones, pivots or animation."""
from pathlib import Path
import xml.etree.ElementTree as ET
import shutil, json, hashlib
NS='http://www.w3.org/2000/svg'; INK='http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('',NS);ET.register_namespace('inkscape',INK)
src=Path('docs/art/tiggy-rive-source/tiggy_neutral_layered.svg')
r=ET.fromstring(src.read_bytes())
# Each range is contiguous: preserve every original path, transform and paint order.
mapping={
'01_legs': [('left_shin',[0]),('right_shin',[1])],
'02_shoes':[('left_foot',list(range(5))),('right_foot',list(range(5,10)))],
'03_shorts_back':[('pelvis_back',[0])],
'04_left_arm_hand':[('left_upper_arm',[0]),('left_forearm',[1]),('left_hand',[2,3,4,5])],
'05_right_arm_hand':[('right_upper_arm',[0]),('right_forearm',[1]),('right_hand',[2,3,4,5])],
'06_neck':[('neck',[0,1])],
'07_head_hair_ears':[('head_upper',[0]),('head_lower',[1]),('left_ear',[2]),('right_ear',[3]),('hair',[4])],
'08_facial_features':[('left_eye',[0,1,2]),('right_eye',[3,4,5]),('left_brow',[6]),('right_brow',[7]),('nose_upper',[8]),('left_ear_inner',[9]),('nose_lower',[10]),('left_thigh',[11])],
'09_lower_body_front':[('right_thigh',[0]),('shorts',[1]),('shirt_and_sleeves_unsplit',[2])],
'10_torso_front':[('mouth_neutral',[0])],
}
original=[ET.tostring(p) for p in r.iter('{'+NS+'}path')]
for g in r:
 old=list(g)
 for p in old:g.remove(p)
 for name,indices in mapping[g.attrib['id']]:
  sub=ET.SubElement(g,'{'+NS+'}g',{'id':name,'{'+INK+'}label':name})
  for i in indices: sub.append(old[i])
assert original==[ET.tostring(p) for p in r.iter('{'+NS+'}path')], 'Path or order changed'
out=src.parent/'tiggy_neutral_rig-prep.svg';ET.ElementTree(r).write(out,encoding='utf-8',xml_declaration=True)
d=Path('public/assets/tiggy/original');d.mkdir(parents=True,exist_ok=True)
shutil.copyfile(src,d/'tiggy_neutral_layered.svg')
report={'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'pathCount':len(original),'pathOrderAndAttributesPreserved':True,'groups':mapping,'status':'Named path grouping only. No bones, constraints, pivots or animation authored.'}
(src.parent/'preparation-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'Prepared original SVG and {sum(len(v) for v in mapping.values())} named subgroups; all paths and draw order unchanged.')
