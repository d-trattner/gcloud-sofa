import { Injectable } from '@angular/core';

import * as THREE from 'three';

declare var Ammo: any;
import '../../../node_modules/ammo.js/builds/ammo.js';

@Injectable()
export class PhysicsService {

  private scene: THREE.Scene;

  private collisionConfiguration: any;
  private dispatcher: any;
  private broadphase: any;
  private solver: any;
  private softBodySolver: any;
  private physicsWorld: any;

  private rigidBodies = [];
  private softBodies = [];

  public gravityConstant: number = -9.8;
  private margin: number = 0.01;

  private transformAux1 = new Ammo.btTransform();
  private softBodyHelpers = new Ammo.btSoftBodyHelpers();

  private clearing: Boolean = false;

  constructor() { }

  changeGravity(g: number){
	this.gravityConstant = g;
	this.physicsWorld.setGravity( new Ammo.btVector3( 0, this.gravityConstant, 0 ) );
	this.physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, this.gravityConstant, 0 ) );
  }

  init(_scene: THREE.Scene) {
		
    this.scene = _scene;

    this.collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfiguration );
    this.broadphase = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.softBodySolver = new Ammo.btDefaultSoftBodySolver();
    this.physicsWorld = new Ammo.btSoftRigidDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration, this.softBodySolver);
    this.physicsWorld.setGravity( new Ammo.btVector3( 0, this.gravityConstant, 0 ) );
    this.physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, this.gravityConstant, 0 ) );

	}

  /**
   * HELPERS
   */

  	private processGeometry( bufGeometry ) {
		// Obtain a Geometry
		var geometry = new THREE.Geometry().fromBufferGeometry( bufGeometry );
		// Merge the vertices so the triangle soup is converted to indexed triangles
		var vertsDiff = geometry.mergeVertices();
		// Convert again to BufferGeometry, indexed
		var indexedBufferGeom = this.createIndexedBufferGeometryFromGeometry( geometry );
		// Create index arrays mapping the indexed vertices to bufGeometry vertices
		this.mapIndices( bufGeometry, indexedBufferGeom );
	}

	private createIndexedBufferGeometryFromGeometry( geometry ) {
		var numVertices = geometry.vertices.length;
		var numFaces = geometry.faces.length;
		var bufferGeom = new THREE.BufferGeometry();
		var vertices = new Float32Array( numVertices * 3 );
		var indices = new ( numFaces * 3 > 65535 ? Uint32Array : Uint16Array )( numFaces * 3 );
		for ( var i = 0; i < numVertices; i++ ) {
			var p = geometry.vertices[ i ];
			var i3 = i * 3;
			vertices[ i3 ] = p.x;
			vertices[ i3 + 1 ] = p.y;
			vertices[ i3 + 2 ] = p.z;
		}
		for ( var i = 0; i < numFaces; i++ ) {
			var f = geometry.faces[ i ];
			var i3 = i * 3;
			indices[ i3 ] = f.a;
			indices[ i3 + 1 ] = f.b;
			indices[ i3 + 2 ] = f.c;
		}
		bufferGeom.setIndex( new THREE.BufferAttribute( indices, 1 ) );
		bufferGeom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		return bufferGeom;
	}

	private isEqual( x1, y1, z1, x2, y2, z2 ) {
		var delta = 0.000001;
		return Math.abs( x2 - x1 ) < delta &&
			Math.abs( y2 - y1 ) < delta &&
			Math.abs( z2 - z1 ) < delta;
	}

	private mapIndices( bufGeometry, indexedBufferGeom ) {
		// Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry
		var vertices = bufGeometry.attributes.position.array;
		var idxVertices = indexedBufferGeom.attributes.position.array;
		var indices = indexedBufferGeom.index.array;
		var numIdxVertices = idxVertices.length / 3;
		var numVertices = vertices.length / 3;
		bufGeometry.ammoVertices = idxVertices;
		bufGeometry.ammoIndices = indices;
		bufGeometry.ammoIndexAssociation = [];
		for ( var i = 0; i < numIdxVertices; i++ ) {
			var association = [];
			bufGeometry.ammoIndexAssociation.push( association );
			var i3 = i * 3;
			for ( var j = 0; j < numVertices; j++ ) {
				var j3 = j * 3;
				if ( this.isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ],  idxVertices[ i3 + 2 ],
							vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) ) {
					association.push( j3 );
				}
			}
		}
	}

	public createSoftVolume( bufferGeom, mat, mass, pressure, friction, damping, stiffness ) {
		this.processGeometry( bufferGeom );
		var volume = new THREE.Mesh( bufferGeom, mat );
		volume.castShadow = true;
		volume.receiveShadow = true;
		volume.frustumCulled = false;
		this.scene.add( volume );
	/*
		textureLoader.load( "textures/colors.png", function( texture ) {
			volume.material.map = texture;
			volume.material.needsUpdate = true;
		} );
	*/
		// Volume physic object
		var volumeSoftBody = this.softBodyHelpers.CreateFromTriMesh(
			this.physicsWorld.getWorldInfo(),
			bufferGeom.ammoVertices,
			bufferGeom.ammoIndices,
			bufferGeom.ammoIndices.length / 3,
			true );
		var sbConfig = volumeSoftBody.get_m_cfg();
		sbConfig.set_viterations( 40 );
		sbConfig.set_piterations( 40 );
		// Soft-soft and soft-rigid collisions
		sbConfig.set_collisions( 0x11 );
		// Friction
		sbConfig.set_kDF( friction );
		// Damping
		sbConfig.set_kDP( damping );
		// Pressure
		sbConfig.set_kPR( pressure );
		// Stiffness
		volumeSoftBody.get_m_materials().at( 0 ).set_m_kLST( stiffness );
		volumeSoftBody.get_m_materials().at( 0 ).set_m_kAST( stiffness );
		volumeSoftBody.setTotalMass( mass, false )
		Ammo.castObject( volumeSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( this.margin * 20 );
		this.physicsWorld.addSoftBody( volumeSoftBody, 1, -1 );
		volume.userData.physicsBody = volumeSoftBody;
		// Disable deactivation
		volumeSoftBody.setActivationState( 4 );
		this.softBodies.push( volume );

		return volume;
	}

	public createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {
		var geo = new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 );
		//geo.translate(quat.x,quat.y,quat.z);
		var threeObject = new THREE.Mesh( geo, material );
		threeObject.position.copy( pos );
		threeObject.rotation.set(quat.x,quat.y,quat.z);
		var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
		shape.setMargin( this.margin );
		this.createRigidBody( threeObject, shape, mass, pos, quat );
		return threeObject;
	}

	private createRigidBody( threeObject, physicsShape, mass, pos, quat ) {
		//threeObject.position.copy( pos );
		//threeObject.quaternion.copy( quat );
		var transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
		transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		var motionState = new Ammo.btDefaultMotionState( transform );
		var localInertia = new Ammo.btVector3( 0, 0, 0 );
		//var localInertia = new Ammo.btVector3( pos.x, pos.y, pos.z );
		physicsShape.calculateLocalInertia( mass, localInertia );
		var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
		rbInfo.m_friction = 100;
		var body = new Ammo.btRigidBody( rbInfo );
		

		threeObject.userData.physicsBody = body;
		this.scene.add( threeObject );
		if ( mass > 0 ) {
			this.rigidBodies.push( threeObject );
			// Disable deactivation
			body.setActivationState( 4 );
		}
		this.physicsWorld.addRigidBody( body );
		return body;
	}

	/**
	 * Create an Ammo physics object from a JSON Model
	 * @param threeObject 
	 * @param boxMesh 
	 * @param mass 
	 * @param pos 
	 * @param quat 
	 */
    public createFromJsonSoft( threeGeo, mat, mass, pos, quat, params ) {
		var bufferGeom: any = new THREE.BufferGeometry().fromGeometry( threeGeo );
		this.processGeometry( bufferGeom );
		var volume = new THREE.Mesh( bufferGeom, mat );
		volume.castShadow = true;
		volume.receiveShadow = true;
		volume.frustumCulled = false;
		volume.position.copy(pos);
      	volume.rotation.set(quat.x,quat.y,quat.z);
		this.scene.add( volume );

		var volumeSoftBody = this.softBodyHelpers.CreateFromTriMesh(
			this.physicsWorld.getWorldInfo(),
			bufferGeom.ammoVertices,
			bufferGeom.ammoIndices,
			bufferGeom.ammoIndices.length / 3,
			true );

		var sbConfig = volumeSoftBody.get_m_cfg();
		sbConfig.set_viterations( 40 );
		sbConfig.set_piterations( 40 );
		// Soft-soft and soft-rigid collisions
		sbConfig.set_collisions( 0x11 );
		// Friction
		sbConfig.set_kDF( params.friction );
		// Damping
		sbConfig.set_kDP( params.damping );
		// Pressure
		sbConfig.set_kPR( params.pressure );
		// Stiffness
		volumeSoftBody.get_m_materials().at( 0 ).set_m_kLST( params.stiffness );
		volumeSoftBody.get_m_materials().at( 0 ).set_m_kAST( params.stiffness );
		volumeSoftBody.setTotalMass( mass, false )
		Ammo.castObject( volumeSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( this.margin * 10 );
		this.physicsWorld.addSoftBody( volumeSoftBody, 1, -1 );
		volume.userData.physicsBody = volumeSoftBody;
		// Disable deactivation
		volumeSoftBody.setActivationState( 4 );
		this.softBodies.push( volume );

		return volume;

	}

	/**
	 * Create an Ammo physics object from a JSON Model
	 * @param threeObject 
	 * @param boxMesh 
	 * @param mass 
	 * @param pos 
	 * @param quat 
	 */
    public createFromJson( threeObject, boxMesh, mass, pos, quat ) {
		var shape;
		if(boxMesh){
			// if we like to use a invisible lower poly shape to be the physics shape
			shape = this.ThreeMesh2AmmoShape(boxMesh);
		} else {
			// take the threeObject as shape
			shape = this.ThreeMesh2AmmoShape(threeObject);
		}
		shape.setMargin( this.margin );
		this.createRigidBody( threeObject, shape, mass, pos, quat );
		return threeObject;
	}

	/**
	 * Converts a THREE.Mesh or THREE.Group into Ammo.btConvexTriangleMeshShape
	 * @param threeObject 
	 */
    private ThreeMesh2AmmoShape(threeObject){

		var threeObjects = [];
		if(threeObject instanceof THREE.Group){
			threeObjects = threeObject.children;
		} else {
			threeObjects.push(threeObject);
		}

		var i, o,width, height, depth, vertices, face, triangles = [];
		for ( o = 0; o < threeObjects.length; o++ ){
			vertices = threeObjects[o].geometry.vertices;
			for ( i = 0; i < threeObjects[o].geometry.faces.length; i++ ) {
				var face = threeObjects[o].geometry.faces[i];
				if ( face instanceof THREE.Face3) {
					triangles.push([
						{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
						{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
						{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z }
					]);
	}/* else if ( face instanceof THREE.Face4 ) { // THREE.Face4 deprecated
					triangles.push([
						{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
						{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
						{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
					]);
					triangles.push([
						{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
						{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
						{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
					]);
				}*/
			}
		}

		//console.log("ThreeMesh2AmmoShape: creating mesh with "+triangles.length+" triangles...");

		var triangle, triangle_mesh = new Ammo.btTriangleMesh;
		var btConvexHullShape = new Ammo.btConvexHullShape();
		var _vec3_1 = new Ammo.btVector3(0,0,0);
		var _vec3_2 = new Ammo.btVector3(0,0,0);
		var _vec3_3 = new Ammo.btVector3(0,0,0);
		for ( i = 0; i < triangles.length; i++ ) {
			triangle = triangles[i];

			_vec3_1.setX(triangle[0].x);
			_vec3_1.setY(triangle[0].y);
			_vec3_1.setZ(triangle[0].z);
			btConvexHullShape.addPoint(_vec3_1,true);

			_vec3_2.setX(triangle[1].x);
			_vec3_2.setY(triangle[1].y);
			_vec3_2.setZ(triangle[1].z);
			btConvexHullShape.addPoint(_vec3_2,true);

			_vec3_3.setX(triangle[2].x);
			_vec3_3.setY(triangle[2].y);
			_vec3_3.setZ(triangle[2].z);
			btConvexHullShape.addPoint(_vec3_3,true);

			triangle_mesh.addTriangle(
				_vec3_1,
				_vec3_2,
				_vec3_3,
				true
			);
		}
		// we try btConvexTriangleMeshShape
		return new Ammo.btConvexTriangleMeshShape(
			triangle_mesh,
			true
		);
		// we tried btConvexHullShape
		//return btConvexHullShape;
		// https://github.com/kripken/ammo.js/blob/master/bullet/src/BulletCollision/CollisionShapes/btBvhTriangleMeshShape.h
		// reads: The btBvhTriangleMeshShape is a static-triangle mesh shape, it can only be used for fixed/non-moving objects
		// maybe thats why it is not working...
/*
		return new Ammo.btBvhTriangleMeshShape(
			triangle_mesh,
			true,
			true
		);*/
		
	}

    public update(delta: number){
      if(!this.clearing){
      	// Step world
		this.physicsWorld.stepSimulation( delta, 10 );
		// Update soft volumes
		for ( var i = 0, il = this.softBodies.length; i < il; i++ ) {
			var volume = this.softBodies[ i ];
			var geometry = volume.geometry;
			var softBody = volume.userData.physicsBody;
			var volumePositions = geometry.attributes.position.array;
			var volumeNormals = geometry.attributes.normal.array;
			var association = geometry.ammoIndexAssociation;
			var numVerts = association.length;
			var nodes = softBody.get_m_nodes();
			for ( var j = 0; j < numVerts; j ++ ) {
				var node = nodes.at( j );
				var nodePos = node.get_m_x();
				var x = nodePos.x();
				var y = nodePos.y();
				var z = nodePos.z();
				var nodeNormal = node.get_m_n();
				var nx = nodeNormal.x();
				var ny = nodeNormal.y();
				var nz = nodeNormal.z();
				var assocVertex = association[ j ];
				for ( var k = 0, kl = assocVertex.length; k < kl; k++ ) {
					var indexVertex = assocVertex[ k ];
					volumePositions[ indexVertex ] = x;
					volumeNormals[ indexVertex ] = nx;
					indexVertex++;
					volumePositions[ indexVertex ] = y;
					volumeNormals[ indexVertex ] = ny;
					indexVertex++;
					volumePositions[ indexVertex ] = z;
					volumeNormals[ indexVertex ] = nz;
				}
			}
			geometry.attributes.position.needsUpdate = true;
			geometry.attributes.normal.needsUpdate = true;
		}
		// Update rigid bodies
		for ( var i = 0, il = this.rigidBodies.length; i < il; i++ ) {
			var objThree = this.rigidBodies[ i ];
			var objPhys = objThree.userData.physicsBody;
			var ms = objPhys.getMotionState();
			if ( ms ) {
				ms.getWorldTransform( this.transformAux1 );
				var p = this.transformAux1.getOrigin();
				var q = this.transformAux1.getRotation();
				objThree.position.set( p.x(), p.y(), p.z() );
				objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
			}
		}
	  }
    }

	/**
	 * not working
	 * @param body
	 * @param vec 
	 */
	applyForce(body,vec){
		var relativeForce = Ammo.btVector3(vec.x, vec.y, vec.z);
		//var boxRot = body.getWorldTransform().getBasis();
		//var correctedForce = boxRot * relativeForce;
		//body.applyCentralForce(correctedForce);
		body.applyForce(relativeForce,Ammo.btVector3(0,0,0));
	}

	setLinearVelocity(body,vec){
		var relativeForce = Ammo.btVector3(vec.x, vec.y, vec.z);
		body.setLinearVelocity(relativeForce);
	}

	clearUp(doNotClearUp:Array<THREE.Mesh>){
		//console.log(this.physicsWorld);
		this.clearing = true;
		let i,o, newRigitBodies = [], newSoftBodies = [];
		for(i=0; i<this.rigidBodies.length; i++){
			o = this.rigidBodies[i].userData.physicsBody;
			//this.physicsWorld.removeCollisionObject(o);
			if(doNotClearUp.indexOf(o) < 0){
				this.physicsWorld.removeRigidBody(o);
				o = null;
				this.rigidBodies[i] = null;
			} else {
				newRigitBodies.push(doNotClearUp[doNotClearUp.indexOf(o)]);
			}
		}
		for(i=0; i<this.softBodies.length; i++){
			o = this.softBodies[i].userData.physicsBody;
			if(doNotClearUp.indexOf(o) < 0){
				this.physicsWorld.removeSoftBody(o);
				o = null;
				this.softBodies[i] = null;
			} else {
				newSoftBodies.push(doNotClearUp[doNotClearUp.indexOf(o)]);
			}
		}
		this.rigidBodies = newRigitBodies;
		this.softBodies = newSoftBodies;
		this.clearing = false;
	}

}
