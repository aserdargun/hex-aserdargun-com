"""Deterministic HEX authoring pipeline. Blender 5.1+; no downloaded model assets."""
import bpy, math, json, os, shutil
from mathutils import Vector
from math import pi, sin, cos
BASE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for d in list(bpy.data.collections):
    if d.name != 'Collection': bpy.data.collections.remove(d)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene.render.fps=30
COL={}
for n in ['BODY','STRUCTURE','ACTUATORS','TRANSMISSIONS','BEARINGS','SENSORS','POWER','COMPUTE','DATA_HARNESS','FX','ANCHORS','CAMERAS','STUDIO']:
    c=bpy.data.collections.new(n); scene.collection.children.link(c); COL[n]=c
M={}
def material(n, color, metal=0, rough=.4):
    m=bpy.data.materials.new('HEX_MAT_'+n); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    M[n]=m; return m
material('ALUMINUM',(.52,.57,.59),.82,.32)
material('TITANIUM',(.19,.23,.25),.8,.3)
material('STEEL',(.41,.46,.49),.93,.23)
material('DARK',(.028,.041,.047),.55,.35)
material('SHELL',(.79,.81,.77),.16,.34)
material('COPPER',(.52,.21,.08),.75,.32)
material('ACCENT',(.72,.13,.055),.3,.33)
material('SENSOR',(.075,.29,.31),.4,.3)
material('PCB',(.018,.105,.095),.25,.55)
material('COMPUTE',(.085,.22,.36),.5,.38)
material('POWER',(.66,.29,.07),.45,.38)
material('RUBBER',(.022,.027,.027),0,.78)
material('GLASS',(.018,.055,.074),.75,.12)
material('GOLD',(.65,.45,.13),.78,.28)
MATCAT={'BODY':'SHELL','STRUCTURE':'ALUMINUM','ACTUATORS':'DARK','TRANSMISSIONS':'STEEL','BEARINGS':'STEEL','SENSORS':'SENSOR','POWER':'POWER','COMPUTE':'COMPUTE','DATA_HARNESS':'COMPUTE','FX':'ACCENT'}
root=None

def setup(o,n,cat,mat=None,parent=None,region='torso',lesson=None,explode=None,stage=None):
    o.name=n
    for c in list(o.users_collection): c.objects.unlink(o)
    COL[cat].objects.link(o)
    if o.type=='MESH':
        o.data.name=n+'_MESH'; o.data.materials.append(M[mat or MATCAT.get(cat,'DARK')])
    if parent:
        bpy.context.view_layer.update(); world=o.matrix_world.copy(); o.parent=parent; o.matrix_world=world
    o['category']=cat.lower(); o['region']=region; o['lesson']=lesson or cat.lower()
    if explode:
        # Export vectors in glTF axes. Stored on each selectable mesh.
        o['explode']=list(explode)
    o['stage']=stage or {'BODY':1,'STRUCTURE':2,'ACTUATORS':3,'TRANSMISSIONS':4,'BEARINGS':4,'SENSORS':5,'POWER':6,'COMPUTE':7,'DATA_HARNESS':8}.get(cat,0)
    return o

def empty(n,pos=(0,0,0),parent=None,cat='BODY',region='torso',axis=None):
    o=bpy.data.objects.new(n,None); COL[cat].objects.link(o); o.location=pos; o.empty_display_size=.025
    if parent:
        bpy.context.view_layer.update(); world=o.matrix_world.copy(); o.parent=parent; o.matrix_world=world
    o['region']=region
    if axis: o['axis']=axis; o['joint']=True
    return o
root=empty('HEX_ROOT')
root['description']='Original educational humanoid. Illustrative dimensions and kinematic demonstrations.'
root['dof']=27

def bevel(o,w=.003,seg=2):
    m=o.modifiers.new('Manufacturing_edge_radius','BEVEL'); m.width=w; m.segments=seg
    m=o.modifiers.new('Weighted_corner_normals','WEIGHTED_NORMAL'); m.keep_sharp=True
    return o

def box(n,p,s,cat='STRUCTURE',mat=None,parent=None,region='torso',lesson=None,explode=None,be=.003):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p); o=bpy.context.object; o.scale=s
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if be: bevel(o,min(be,min(s)*.25))
    return setup(o,n,cat,mat,parent or root,region,lesson,explode)

def cylinder(n,p,r,depth,axis='X',cat='ACTUATORS',mat=None,parent=None,region='torso',lesson=None,explode=None,verts=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=p)
    o=bpy.context.object
    if axis=='X': o.rotation_euler[1]=pi/2
    elif axis=='Y': o.rotation_euler[0]=pi/2
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bevel(o,min(.002,depth*.18),2)
    for f in o.data.polygons: f.use_smooth=len(f.vertices)==4
    return setup(o,n,cat,mat,parent or root,region,lesson,explode)

def torus(n,p,r,t,axis='X',cat='BEARINGS',mat=None,parent=None,region='torso',lesson=None,explode=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=t,major_segments=36,minor_segments=8,location=p)
    o=bpy.context.object
    if axis=='X': o.rotation_euler[1]=pi/2
    elif axis=='Y': o.rotation_euler[0]=pi/2
    for f in o.data.polygons: f.use_smooth=True
    return setup(o,n,cat,mat,parent or root,region,lesson,explode)

def beam(n,a,b,w,d,cat='STRUCTURE',mat=None,parent=None,region='torso',lesson=None):
    a,b=Vector(a),Vector(b); o=box(n,(a+b)/2,(w,d,(b-a).length),cat,mat,None,region,lesson)
    # Temporarily detach before orienting.
    mw=o.matrix_world.copy(); o.parent=None; o.matrix_world=mw
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    bpy.context.view_layer.update(); mw=o.matrix_world.copy(); o.parent=parent or root; o.matrix_world=mw
    return o

def plate(n,points,y,depth,cat='STRUCTURE',mat=None,parent=None,region='torso',lesson=None,explode=None):
    verts=[(x,y+dy,z) for dy in [-depth/2,depth/2] for x,z in points]
    k=len(points); faces=[tuple(range(k-1,-1,-1)),tuple(range(k,2*k))]+[(i,(i+1)%k,(i+1)%k+k,i+k) for i in range(k)]
    mesh=bpy.data.meshes.new(n+'_MESH'); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(n,mesh); COL[cat].objects.link(o); bevel(o,.0035)
    return setup(o,n,cat,mat,parent or root,region,lesson,explode)

def cable(n,pts,cat='POWER',mat=None,parent=None,region='torso'):
    cu=bpy.data.curves.new(n+'_CURVE','CURVE'); cu.dimensions='3D'; cu.resolution_u=6; cu.bevel_depth=.0035; cu.bevel_resolution=2
    sp=cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts)-1)
    for p,v in zip(sp.bezier_points,pts): p.co=v; p.handle_left_type='AUTO'; p.handle_right_type='AUTO'
    o=bpy.data.objects.new(n,cu); COL[cat].objects.link(o); bpy.context.view_layer.objects.active=o; o.select_set(True)
    bpy.ops.object.convert(target='MESH'); o=bpy.context.object; o.select_set(False)
    return setup(o,n,cat,mat,parent or root,region,cat.lower())

def bolt(n,p,axis='Y',parent=None,region='torso'):
    return cylinder(n,p,.0045,.003,axis,'STRUCTURE','DARK',parent,region,'structure',verts=6)

def anchor(n,p,parent=None,region='torso'):
    return empty('HEX_ANCHOR_'+n,p,parent or root,'ANCHORS',region)

def gear(n,p,r,depth,teeth,cat='TRANSMISSIONS',mat='STEEL',parent=None,region='leg-l',explode=None,internal=False):
    # Schematic teeth: manufacturing-level conjugate gear profiles are intentionally not claimed.
    outer=[]; inner=[]
    for i in range(teeth*4):
        t=2*pi*i/(teeth*4)
        rad=r*(1 if i%4 in [1,2] else .88)
        if internal: outer.append((r*1.15*cos(t),r*1.15*sin(t))); inner.append((rad*cos(t),rad*sin(t)))
        else: outer.append((rad*cos(t),rad*sin(t))); inner.append((r*.3*cos(t),r*.3*sin(t)))
    verts=[]
    for dx in [-depth/2,depth/2]:
        for contour in [outer,inner]: verts.extend([(p[0]+dx,p[1]+a,p[2]+b) for a,b in contour])
    k=len(outer); faces=[]
    for i in range(k):
        j=(i+1)%k
        faces.extend([(i,j,j+2*k,i+2*k),(i+k,i+3*k,j+3*k,j+k),(i,i+k,j+k,j),(i+2*k,j+2*k,j+3*k,i+3*k)])
    me=bpy.data.meshes.new(n+'_MESH'); me.from_pydata(verts,[],faces); me.update(); o=bpy.data.objects.new(n,me); COL[cat].objects.link(o)
    return setup(o,n,cat,mat,parent or root,region,'transmission',explode)

PIVOTS={}
def joint(key,p,r,parent,region,axis='X',detail=False):
    side=-1 if key.endswith('_R') else 1
    v={'X':Vector((1,0,0)),'Y':Vector((0,1,0)),'Z':Vector((0,0,1))}[axis]
    v*=side if axis=='X' else 1
    lesson=next((j for j in ['knee','hip','ankle','shoulder','elbow','wrist','neck'] if j in key.lower()),'joints')
    package_scale=r/.058*(.65 if 'YAW' in key or 'ROLL' in key else .85)
    def loc(off): return Vector(p)+v*off*package_scale
    def ex(off): return (v.x*off,v.z*off,-v.y*off)
    cylinder('HEX_ACT_'+key,loc(0),r,.045,axis,'ACTUATORS','DARK',parent,region,lesson,ex(.11))
    torus('HEX_ACT_WINDING_'+key,loc(.026),r*.84,.004,axis,'ACTUATORS','COPPER',parent,region,lesson,ex(.125))
    cylinder('HEX_SHAFT_'+key,loc(.032),r*.20,.102,axis,'TRANSMISSIONS','STEEL',parent,region,lesson,ex(.17))
    if detail and axis=='X':
        gear('HEX_GEAR_RING_'+key,loc(.06),r*.79,.018,36,parent=parent,region=region,explode=ex(.23),internal=True)
        gear('HEX_GEAR_SUN_'+key,loc(.06),r*.235,.019,12,mat='COPPER',parent=parent,region=region,explode=ex(.23))
        for i in range(3):
            t=i*2*pi/3; pp=loc(.06)+Vector((0,cos(t)*r*.47,sin(t)*r*.47))
            gear('HEX_GEAR_PLANET_'+key+'_'+str(i+1),pp,r*.235,.018,12,parent=parent,region=region,explode=ex(.23))
        cylinder('HEX_GEAR_CARRIER_'+key,loc(.078),r*.68,.006,axis,'TRANSMISSIONS','TITANIUM',parent,region,lesson,ex(.29))
    else:
        cylinder('HEX_GEAR_'+key,loc(.045),r*.92,.026,axis,'TRANSMISSIONS','TITANIUM',parent,region,lesson,ex(.2))
    torus('HEX_BEARING_IN_'+key,loc(-.021),r*.77,.007,axis,'BEARINGS','STEEL',parent,region,lesson,ex(-.09))
    torus('HEX_BEARING_OUT_'+key,loc(.086),r*.79,.007,axis,'BEARINGS','STEEL',parent,region,lesson,ex(.35))
    cylinder('HEX_ENCODER_'+key,loc(.098),r*.72,.005,axis,'SENSORS','SENSOR',parent,region,'encoder',ex(.41))
    cylinder('HEX_OUTPUT_'+key,loc(.103),r*.5,.008,axis,'STRUCTURE','ALUMINUM',parent,region,lesson,ex(.44))
    if r>.04:
        for i in range(4):
            t=i*pi/2+pi/4; pp=loc(.109)
            if axis=='X': pp+=Vector((0,cos(t)*r*.36,sin(t)*r*.36))
            elif axis=='Y': pp+=Vector((cos(t)*r*.36,0,sin(t)*r*.36))
            else: pp+=Vector((cos(t)*r*.36,sin(t)*r*.36,0))
            bolt('HEX_FASTENER_'+key+'_'+str(i+1),pp,axis,parent,region)
    pivot=empty('HEX_PIVOT_'+key,p,parent,'BODY',region,axis)
    PIVOTS[key]=pivot
    # The output flange and yoke belong to the moving link, not the fixed housing.
    output=bpy.data.objects['HEX_OUTPUT_'+key]
    bpy.context.view_layer.update(); mw=output.matrix_world.copy();output.parent=pivot;output.matrix_world=mw
    if axis=='X' and not ('NECK' in key):
        off=.098*package_scale*side
        beam('HEX_STRUCTURE_YOKE_'+key,(p[0]+off,p[1],p[2]),(p[0]+off,p[1],p[2]-r*1.15),.013,.028,parent=pivot,region=region,lesson=lesson)
        beam('HEX_STRUCTURE_YOKE_BRIDGE_'+key,(p[0]+off,p[1],p[2]-r*1.05),(p[0],p[1],p[2]-r*1.05),.012,.03,parent=pivot,region=region,lesson=lesson)
    anchor(key,loc(.112),pivot,region)
    return pivot

pelvis=empty('HEX_BODY_PELVIS',(0,0,.9),root,region='pelvis')
box('HEX_STRUCTURE_PELVIS',(0,0,.94),(.28,.14,.085),parent=pelvis,region='pelvis',lesson='structure')
box('HEX_BATTERY_MAIN',(0,.019,1.025),(.195,.126,.16),'POWER','DARK',pelvis,'pelvis','battery',(0,.04,-.25))
for i in [-1,1]: box('HEX_BATTERY_LOCK_'+str(i),(i*.074,-.047,1.024),(.019,.007,.116),'POWER','POWER',pelvis,'pelvis','battery',(0,.04,-.25))
box('HEX_BMS_MAIN',(0,.03,.961),(.16,.04,.02),'POWER','PCB',pelvis,'pelvis','battery',(0,0,-.2))
plate('HEX_SHELL_PELVIS',[(-.15,.956),(-.1,.86),(-.035,.847),(.035,.847),(.1,.86),(.15,.956)],-.09,.011,'BODY','SHELL',pelvis,'pelvis','structure',(0,-.05,.28))
anchor('BATTERY',(0,-.062,1.04),pelvis,'pelvis')
waist=joint('WAIST',(0,0,1.115),.047,pelvis,'torso','Z')
for side in [-1,1]:
    beam('HEX_STRUCTURE_SPINE_'+str(side),(side*.055,.034,1.13),(side*.093,.043,1.385),.018,.028,parent=waist)
    beam('HEX_STRUCTURE_RIB_'+str(side),(side*.05,-.045,1.16),(side*.163,-.045,1.365),.018,.024,parent=waist)
box('HEX_STRUCTURE_TORSO_CROSS',(0,0,1.375),(.34,.09,.036),parent=waist)
box('HEX_STRUCTURE_TORSO_BASE',(0,0,1.176),(.20,.12,.023),parent=waist)
plate('HEX_SHELL_CHEST',[(-.165,1.36),(-.137,1.215),(-.065,1.18),(.065,1.18),(.137,1.215),(.165,1.36)],-.071,.011,'BODY','SHELL',waist,'torso','structure',(0,.06,.28))
# Divided chest insert and fastening details.
plate('HEX_CHEST_SERVICE_INSERT',[(-.06,1.23),(-.045,1.202),(.045,1.202),(.06,1.23)],-.079,.006,'BODY','DARK',waist,'torso','structure',(0,.06,.28))
for x in [-.134,.134]:
    for z in [1.33,1.25]: bolt('HEX_CHEST_BOLT_'+str(x)+'_'+str(z),(x,-.08,z),parent=waist)
box('HEX_COMPUTE_MAIN',(0,.058,1.31),(.136,.066,.085),'COMPUTE','DARK',waist,'torso','compute',(0,.13,-.3))
for i in range(10): box('HEX_COMPUTE_HEATSINK_'+str(i),(-.058+i*.013,.101,1.31),(.004,.025,.076),'COMPUTE','TITANIUM',waist,'torso','compute',(0,.13,-.3),.001)
box('HEX_CTRL_REALTIME',(.066,-.015,1.23),(.065,.027,.074),'COMPUTE','PCB',waist,'torso','realtime',(.16,.02,.08))
box('HEX_CTRL_REALTIME_CHIP',(.066,-.032,1.24),(.025,.007,.025),'COMPUTE','DARK',waist,'torso','realtime',(.16,.02,.08))
box('HEX_POWER_DISTRIBUTION',(-.06,0,1.22),(.055,.052,.073),'POWER','POWER',waist,'torso','power',(-.17,.03,-.13))
box('HEX_DC_CONVERTER',(-.06,.025,1.29),(.055,.04,.032),'POWER','DARK',waist,'torso','power',(-.17,.03,-.13))
box('HEX_SENSOR_IMU_TORSO',(0,-.036,1.163),(.035,.028,.025),'SENSORS','SENSOR',waist,'torso','imu',(0,.04,.22))
anchor('IMU',(0,-.06,1.163),waist)
anchor('MAIN_COMPUTE',(0,.09,1.31),waist)
for side in [-1,1]:
    cable('HEX_POWER_TRUNK_'+str(side),[(side*.07,.05,1.02),(side*.105,.055,1.15),(side*.11,.065,1.33),(side*.2,.04,1.37)],parent=waist)
    cable('HEX_DATA_TRUNK_'+str(side),[(0,.09,1.32),(side*.075,.082,1.24),(side*.1,.085,1.1),(side*.13,.08,.91)],'DATA_HARNESS','COMPUTE',waist)
neckyaw=joint('NECK_YAW',(0,0,1.43),.026,waist,'head','Z')
neck=joint('NECK_PITCH',(0,0,1.495),.026,neckyaw,'head')
box('HEX_STRUCTURE_HEAD',(0,0,1.575),(.145,.098,.073),parent=neck,region='head')
box('HEX_SHELL_HEAD',(0,-.005,1.585),(.176,.13,.104),'BODY','SHELL',neck,'head','camera',(0,.16,.04),.018)
box('HEX_CAMERA_FACE',(0,-.074,1.58),(.142,.017,.069),'STRUCTURE','DARK',neck,'head','camera',be=.013)
for side,label in [(1,'L'),(-1,'R')]:
    cylinder('HEX_SENSOR_CAM_'+label,(side*.039,-.088,1.583),.024,.017,'Y','SENSORS','TITANIUM',neck,'head','camera',(side*.08,.09,.2))
    cylinder('HEX_SENSOR_CAM_LENS_'+label,(side*.039,-.099,1.583),.017,.007,'Y','SENSORS','GLASS',neck,'head','camera',(side*.08,.09,.2))
    torus('HEX_CAMERA_LENS_RING_'+label,(side*.039,-.103,1.583),.019,.0015,'Y','SENSORS','STEEL',neck,'head','camera',(side*.08,.09,.2))
anchor('HEAD_CAMERA',(0,-.11,1.585),neck,'head')

# Open links with tapered side rails, bracing, controller, cover and major harnesses.
def link(key,x,top,bottom,w,parent,region,shell=True):
    center=(top+bottom)/2
    for sign in [-1,1]:
        px=x+sign*w*.37
        pts=[(px-w*.12,top+.01),(px+w*.12,top+.01),(px+w*.10,center+.025),(px+w*.065,bottom-.054),(px-w*.07,bottom-.054),(px-w*.105,center+.025)]
        plate('HEX_STRUCTURE_'+key+'_RAIL_'+str(sign),pts,0,.048,'STRUCTURE','ALUMINUM',parent,region,'structure')
    beam('HEX_STRUCTURE_'+key+'_BRACE',(x-w*.3,.025,top-.055),(x+w*.3,.025,bottom+.055),.014,.018,parent=parent,region=region)
    for i,z in enumerate([top-.04,bottom+.04]):
        box('HEX_STRUCTURE_'+key+'_MOUNT_'+str(i),(x,0,z),(w,.052,.017),'STRUCTURE','TITANIUM',parent,region,'structure')
        for sign in [-1,1]: bolt('HEX_LINK_FASTENER_'+key+'_'+str(i)+'_'+str(sign),(x+sign*w*.36,-.027,z),parent=parent,region=region)
    box('HEX_CTRL_MOTOR_'+key,(x,.043,center),(.036,.024,min(.085,top-bottom-.08)),'COMPUTE','PCB',parent,region,'motor-control',((1 if x>0 else -1)*.18,0,-.14))
    box('HEX_CTRL_CHIP_'+key,(x,.058,center),(.02,.009,.022),'COMPUTE','DARK',parent,region,'motor-control',((1 if x>0 else -1)*.18,0,-.14))
    cable('HEX_POWER_'+key,[(x-w*.3,.047,top-.02),(x-w*.4,.047,center),(x-w*.3,.047,bottom+.025)],'POWER','POWER',parent,region)
    cable('HEX_DATA_'+key,[(x+w*.3,.047,top-.02),(x+w*.4,.047,center),(x+w*.3,.047,bottom+.025)],'DATA_HARNESS','COMPUTE',parent,region)
    if shell:
        pts=[(x-w*.38,top-.065),(x+w*.38,top-.065),(x+w*.26,bottom+.075),(x-w*.26,bottom+.075)]
        plate('HEX_SHELL_'+key,pts,-.036,.009,'BODY','SHELL',parent,region,'structure',((1 if x>0 else -1)*.11,.02,.19))
        box('HEX_SHELL_ACCENT_'+key,(x,-.042,top-.076),(w*.4,.003,.007),'BODY','ACCENT',parent,region,'structure',((1 if x>0 else -1)*.11,.02,.19),.0005)

for side,s in [(1,'L'),(-1,'R')]:
    reg='arm-'+s.lower(); x=side*.235
    shoulder_y=joint('SHOULDER_YAW_'+s,(side*.19,0,1.366),.043,waist,reg,'Z')
    shoulder_r=joint('SHOULDER_ROLL_'+s,(side*.226,0,1.344),.046,shoulder_y,reg,'Y')
    shoulder=joint('SHOULDER_'+s,(x,0,1.322),.05,shoulder_r,reg)
    link('UPPER_ARM_'+s,x,1.3,1.064,.071,shoulder,reg)
    elbow=joint('ELBOW_'+s,(x,0,1.025),.04,shoulder,reg,detail=s=='L')
    link('FOREARM_'+s,x,1.012,.832,.065,elbow,reg)
    wristroll=joint('WRIST_ROLL_'+s,(x,0,.817),.024,elbow,reg,'Z')
    wrist=joint('WRIST_'+s,(x,0,.775),.025,wristroll,reg)
    box('HEX_STRUCTURE_PALM_'+s,(x,0,.725),(.07,.046,.068),'STRUCTURE','TITANIUM',wrist,reg,'wrist',be=.007)
    for j,offset in enumerate([-.024,0,.024]):
        xx=x+offset
        beam('HEX_GRIPPER_'+s+'_'+str(j)+'_A',(xx,0,.698),(xx,-.012,.655),.015,.018,parent=wrist,region=reg,lesson='wrist')
        beam('HEX_GRIPPER_'+s+'_'+str(j)+'_B',(xx,-.012,.655),(xx,-.033,.645),.014,.016,parent=wrist,region=reg,lesson='wrist')
    beam('HEX_GRIPPER_THUMB_'+s,(x-side*.041,0,.728),(x-side*.055,-.032,.685),.016,.02,parent=wrist,region=reg,lesson='wrist')
    reg='leg-'+s.lower(); x=side*.102
    hipyaw=joint('HIP_YAW_'+s,(x,0,.89),.041,pelvis,reg,'Z')
    hiproll=joint('HIP_ROLL_'+s,(x,0,.846),.047,hipyaw,reg,'Y')
    hip=joint('HIP_'+s,(x,0,.801),.062,hiproll,reg)
    link('THIGH_'+s,x,.785,.53,.108,hip,reg)
    knee=joint('KNEE_'+s,(x,0,.487),.058,hip,reg,detail=True)
    link('SHIN_'+s,x,.475,.177,.088,knee,reg)
    ankle=joint('ANKLE_'+s,(x,0,.133),.041,knee,reg)
    foot=joint('ANKLE_ROLL_'+s,(x,0,.092),.032,ankle,reg,'Y')
    cylinder('HEX_FT_ANKLE_'+s,(x,0,.072),.043,.012,'Z','SENSORS','SENSOR',foot,reg,'foot',(side*.13,-.035,.09))
    box('HEX_STRUCTURE_FOOT_'+s,(x,-.033,.045),(.127,.228,.045),'STRUCTURE','TITANIUM',foot,reg,'foot',be=.008)
    box('HEX_SOLE_'+s,(x,-.035,.016),(.138,.24,.024),'STRUCTURE','RUBBER',foot,reg,'foot',be=.008)
    plate('HEX_FOOT_TOE_COVER_'+s,[(x-.06,.055),(x-.04,.073),(x+.04,.073),(x+.06,.055)],-.128,.037,'BODY','SHELL',foot,reg,'foot',(0,.06,.16))
    for j,(dx,dy) in enumerate([(-.04,-.11),(.04,-.11),(-.04,.046),(.04,.046)]):
        box('HEX_FOOT_SENSOR_'+s+'_'+str(j+1),(x+dx,dy,.029),(.027,.035,.008),'SENSORS','SENSOR',foot,reg,'foot',(side*.07,-.025,-dy))
    for dy in [-.106,-.055,0,.055]:
        box('HEX_SOLE_TREAD_'+s+'_'+str(dy),(x,dy,.005),(.12,.007,.006),'STRUCTURE','DARK',foot,reg,'foot',be=.001)
    anchor('FOOT_SENSOR_'+s,(x,-.11,.05),foot,reg)

# Lightweighting openings cut through the removable link covers.
for ob in [o for o in list(bpy.data.objects) if o.name.startswith('HEX_SHELL_') and any(k in o.name for k in ['THIGH','SHIN','UPPER_ARM','FOREARM']) and 'ACCENT' not in o.name]:
    corners=[ob.matrix_world@Vector(v) for v in ob.bound_box]
    xx=sum(v.x for v in corners)/8; zz=sum(v.z for v in corners)/8
    height=max(v.z for v in corners)-min(v.z for v in corners)
    bpy.ops.mesh.primitive_cube_add(size=1,location=(xx,-.037,zz)); cutter=bpy.context.object;cutter.scale=(.019,.07,height*.52)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bev=cutter.modifiers.new('Slot_radius','BEVEL');bev.width=.008;bev.segments=3
    bpy.context.view_layer.objects.active=cutter;bpy.ops.object.modifier_apply(modifier=bev.name)
    mod=ob.modifiers.new('Service_slot','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
# Physical labels, readable in detailed views.
def text_obj(n,text,pos,size,parent,region):
    cu=bpy.data.curves.new(n+'_FONT','FONT'); cu.body=text; cu.size=size; cu.extrude=.0001
    o=bpy.data.objects.new(n,cu); COL['BODY'].objects.link(o); o.location=pos; o.rotation_euler=(pi/2,0,0)
    bpy.context.view_layer.objects.active=o; o.select_set(True); bpy.ops.object.convert(target='MESH'); o=bpy.context.object; o.select_set(False)
    return setup(o,n,'BODY','ACCENT',parent,region,'structure',(0,.06,.28))
text_obj('HEX_CHEST_ID','H E X',(-.041,-.079,1.284),.027,waist,'torso')
anchor('COM',(0,0,.94),root,'pelvis'); anchor('SUPPORT_POLYGON',(0,-.035,.002),root,'pelvis')
# Separate NLA tracks preserve clip boundaries in GLB and in the editable master.
def stash(ob,clip):
    action=ob.animation_data.action; action.name=clip+'_'+ob.name
    track=ob.animation_data.nla_tracks.new();track.name=clip
    strip=track.strips.new(clip,1,action)
    strip.action_slot=ob.animation_data.action_slot
    ob.animation_data.action=None
    track.mute=True
# Reusable independent transform clips exported from actions.
for key,clip,axis,ang in [('KNEE_L','HEX_KNEE_FLEX',0,.85),('ELBOW_L','HEX_ELBOW_FLEX',0,-.95),('NECK_YAW','HEX_CAMERA_SCAN',2,.35)]:
    p=PIVOTS[key]; p.rotation_mode='XYZ'
    for frame,value in [(1,0),(31,ang),(61,0)]:
        p.rotation_euler[axis]=value; p.keyframe_insert('rotation_euler',frame=frame)
    stash(p,clip)
    p.rotation_euler=(0,0,0)
# Named modular explosion actions. Web uses extras for progressive sequencing.
for cat,clip in [('BODY','HEX_EXPLODE_STRUCTURE'),('ACTUATORS','HEX_EXPLODE_ACTUATORS'),('SENSORS','HEX_EXPLODE_SENSORS'),('POWER','HEX_EXPLODE_POWER'),('COMPUTE','HEX_EXPLODE_COMPUTE')]:
    for ob in [o for o in COL[cat].objects if o.get('explode')]:
        start=ob.location.copy(); ex=ob['explode']; delta=Vector((ex[0],-ex[2],ex[1]))
        if ob.parent: delta=ob.parent.matrix_world.inverted().to_3x3()@delta
        for f,t in [(1,0),(31,1)]: ob.location=start+delta*t; ob.keyframe_insert('location',frame=f)
        stash(ob,clip); ob.location=start
scene.frame_set(1)
# Export physical model and anchors only. Studio never contributes browser draw calls.
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o==root or o in root.children_recursive: o.select_set(True)
for folder in ['HEX/blender','HEX/export','public/models']: os.makedirs(os.path.join(BASE,folder),exist_ok=True)
export_path=os.path.join(BASE,'HEX/export/HEX_Web.glb')
bpy.ops.export_scene.gltf(filepath=export_path,export_format='GLB',use_selection=True,export_extras=True,export_texcoords=False,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_yup=True,export_apply=True)
shutil.copy2(export_path,os.path.join(BASE,'public/models/HEX_Web.glb'))
# High variant increases curved surface/bevel tessellation, same component contract.
for o in bpy.data.objects:
    for m in o.modifiers:
        if m.type=='BEVEL': m.segments=3
bpy.ops.export_scene.gltf(filepath=os.path.join(BASE,'HEX/export/HEX_High.glb'),export_format='GLB',use_selection=True,export_extras=True,export_texcoords=False,export_animations=True,export_animation_mode='NLA_TRACKS',export_yup=True,export_apply=True)
# Studio cameras and render rig.
def camera(n,pos,target,lens=65):
    d=bpy.data.cameras.new(n); o=bpy.data.objects.new(n,d); COL['CAMERAS'].objects.link(o); o.location=pos; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler(); d.lens=lens; d.clip_start=.01; return o
cameras={
'HERO_FRONT':((2.2,-4.4,2.1),(0,0,.85)), 'HERO_BACK':((-2.5,4.3,2.1),(0,0,.85)),
'FULL_SIDE':((4.7,0,1.65),(0,0,.85)), 'EXPLODED':((2.8,-5,2.4),(0,0,.86)),
'TORSO':((1,-2,1.55),(0,0,1.25)), 'HEAD':((.5,-.9,1.74),(0,0,1.57)),
'SHOULDER':((1.1,-1.2,1.6),(.235,0,1.32)), 'ELBOW':((1.1,-1.2,1.2),(.235,0,1.025)),
'HIP':((1.1,-1.3,1.06),(.1,0,.84)), 'KNEE':((1.5,-1.5,.95),(.32,0,.49)),
'ANKLE':((.8,-1.1,.55),(.1,-.03,.13)), 'FOOT':((.55,-.75,.5),(.1,-.04,.06)),
'COMPUTE':((.7,1.1,1.6),(0,.065,1.3))}
for n,(pos,tgt) in cameras.items(): camera('HEX_CAM_'+n,pos,tgt)
scene.camera=bpy.data.objects['HEX_CAM_HERO_FRONT']
material('FLOOR',(.78,.80,.77),0,.86)
box('HEX_STUDIO_FLOOR',(0,0,-.028),(200,200,.05),'STUDIO','FLOOR',be=0)
# Floor should not follow root when posing.
o=bpy.data.objects['HEX_STUDIO_FLOOR']; mw=o.matrix_world.copy(); o.parent=None; o.matrix_world=mw
for n,p,power,size in [('KEY',(-3,-4,5),650,4),('FILL',(3,-2,3),460,3),('RIM',(1,3,4),800,3)]:
    d=bpy.data.lights.new('HEX_LIGHT_'+n,'AREA'); d.energy=power; d.shape='DISK'; d.size=size; o=bpy.data.objects.new(d.name,d); COL['STUDIO'].objects.link(o); o.location=p; o.rotation_euler=(Vector((0,0,.9))-o.location).to_track_quat('-Z','Y').to_euler()
scene.world.color=(.3,.3,.3)
scene.world.use_nodes=True; scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.81,.84,1); scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
scene.render.engine='CYCLES'; scene.cycles.samples=32; scene.cycles.use_denoising=True
scene.render.resolution_x=1200; scene.render.resolution_y=1400; scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='WEBP'; scene.render.image_settings.quality=92
scene.render.film_transparent=False
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BASE,'HEX/blender/HEX_Master.blend'))
manifest={'name':'HEX','version':'0.1.0','illustrative':True,'dof':27,'joints':list(PIVOTS),'cameras':list(cameras),'objects':[{'name':o.name,'type':o.type,**{k:o[k].to_list() if hasattr(o[k],'to_list') else o[k] for k in ['category','region','lesson','stage','explode'] if k in o}} for o in bpy.data.objects if o==root or o in root.children_recursive],'webBytes':os.path.getsize(export_path)}
with open(os.path.join(BASE,'HEX/docs/model-manifest.json'),'w') as f: json.dump(manifest,f,indent=2)
print('HEX_BUILD_COMPLETE',len(manifest['objects']),manifest['webBytes'])
