import bpy, os, shutil, math, json
from mathutils import Vector
BASE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scene=bpy.context.scene
args=__import__('sys').argv
only=args[args.index('--')+1:] if '--' in args else []
root=bpy.data.objects['HEX_ROOT']
parts=[o for o in root.children_recursive if o.type=='MESH']
base={o.name:o.location.copy() for o in parts}
base_materials={o.name:list(o.data.materials) for o in parts}
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1000;scene.render.resolution_y=1200
# Transparent contextual frame keeps highlighted systems readable.
def ghost_material(base):
    mat=base.copy();mat.name=base.name+'_CONTEXT';mat.use_nodes=True
    nt=mat.node_tree;bs=nt.nodes.get('Principled BSDF');out=nt.nodes.get('Material Output')
    transparent=nt.nodes.new('ShaderNodeBsdfTransparent');mix=nt.nodes.new('ShaderNodeMixShader');mix.inputs[0].default_value=.11
    nt.links.new(transparent.outputs[0],mix.inputs[1]);nt.links.new(bs.outputs[0],mix.inputs[2]);nt.links.new(mix.outputs[0],out.inputs['Surface'])
    return mat
context={m.name:ghost_material(m) for m in list(bpy.data.materials)}
scene.cycles.transparent_max_bounces=24
extras=[]
for mode in (only or ['hero','exploded','structure','actuation','sensors','power','compute','knee','balance']):
    for o in extras:bpy.data.objects.remove(o,do_unlink=True)
    extras=[]
    for o in parts:
        o.hide_render=False;o.location=base[o.name].copy()
        o.data.materials.clear()
        for mat in base_materials[o.name]:o.data.materials.append(mat)
    if mode=='exploded':
        for o in parts:
            if 'explode' in o:
                ex=o['explode'];delta=Vector((ex[0],-ex[2],ex[1]))
                if o.parent:delta=o.parent.matrix_world.inverted().to_3x3()@delta
                o.location+=delta
    elif mode in ['structure','actuation','sensors','power','compute']:
        for o in parts:
            cat=o.get('category')
            if cat=='body':o.hide_render=True
            if mode=='structure' and cat not in ['structure','bearings']:o.hide_render=True
            if mode in ['actuation','sensors','power','compute']:
                allowed={'actuation':['actuators','transmissions'],'sensors':['sensors'],'power':['power'],'compute':['compute','data_harness']}[mode]
                if cat not in allowed:
                    for i,mat in enumerate(base_materials[o.name]):o.data.materials[i]=context[mat.name] if mat else context['HEX_MAT_DARK']
    elif mode=='knee':
        for o in parts:
            if 'KNEE_L' in o.name and 'explode' in o:
                ex=o['explode'];delta=Vector((ex[0],-ex[2],ex[1]))
                if o.parent:delta=o.parent.matrix_world.inverted().to_3x3()@delta
                o.location+=delta
            if o.get('region')!='leg-l':o.hide_render=True
    elif mode=='balance':
        root.rotation_euler[0]=.04
        for name,pos,r,color in [('COM',(0,0,.94),.024,(.8,.15,.04,1)),('COP',(.02,-.04,.008),.018,(.05,.4,.47,1))]:
            bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=r,location=pos);o=bpy.context.object;o.name='HEX_FX_'+name;extras.append(o)
            mat=bpy.data.materials.new('HEX_FX_MAT_'+name);mat.diffuse_color=color;o.data.materials.append(mat)
        cu=bpy.data.curves.new('HEX_FX_SUPPORT','CURVE');cu.dimensions='3D';cu.bevel_depth=.002;cu.bevel_resolution=2
        sp=cu.splines.new('POLY');sp.points.add(4)
        for p,v in zip(sp.points,[(-.171,-.155,.003),(.171,-.155,.003),(.171,.085,.003),(-.171,.085,.003),(-.171,-.155,.003)]):p.co=(*v,1)
        o=bpy.data.objects.new('HEX_FX_SUPPORT',cu);scene.collection.objects.link(o);extras.append(o)
    scene.camera=bpy.data.objects['HEX_CAM_'+('KNEE' if mode=='knee' else 'EXPLODED' if mode=='exploded' else 'HERO_BACK' if mode=='compute' else 'HERO_FRONT')]
    scene.render.resolution_x=1400 if mode=='knee' else 1000
    scene.render.resolution_y=1000 if mode=='knee' else 1200
    if mode=='knee':
        scene.camera.location=(1.5,-1.5,.95)
        scene.camera.rotation_euler=(Vector((.32,0,.49))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
        scene.camera.data.lens=62
    scene.render.filepath=os.path.join(BASE,'HEX/renders/'+mode+'.webp')
    bpy.ops.render.render(write_still=True)
    shutil.copy2(scene.render.filepath,os.path.join(BASE,'public/renders/'+mode+'.webp'))
    root.rotation_euler=(0,0,0)
print('HEX_RENDERS_COMPLETE')
