ASSIGNMENT 02
MODULE CODE = CS6105
MODULE NAME = Future and Emerging Interaction Technologies

Assignment Topic: Three.js Assignment - Create a WebXR scene of UCC Quad with at least two independently animated characters(avatars).

1. The entire scene consists of - 
   - UCC Quad Model.
   - Two trees.
   - Two benches.
   - A grass model (quadrangle).
   - A pillar.
   - Two spheres rotating upon the pillar.
   - A plane geometry with a video textured upon it.
   - A text 3D model.
   - 4 animated avatars.
   - A pole with Ireland's Flag.

2. Firstly three.module.js library was imported along with all the other required libraries such as controller, loaders, GUI, stats and VR button library.

3. The functions starts with the basic rendering function accompanied
   By function to set the camera, scene and lights.

4. A total of 4 lights were used, Spotlight, Pointlight, Ambientlight and Hemilight. Pointlight is given a flare texture to replicate a sun with shiny material.
   Code and images for lens flare retrieved from - https://github.com/mrdoob/three.js/blob/master/examples/webgl_lensflares.html 

5. The UCC quad and grass was loaded with Collada Loader. The pillar, trees and benches were loaded with GLTF loader.
   All the three models were retrieved from - https://poly.pizza

6. The ground was built as a box geometry wrapped with a wooden texture. 
   Texture credits - https://www.poliigon.com 

7. All the animated models were retrieved from https://www.mixamo.com/#/ and loaded with help of FBX loader.

8. I downloaded the music file from https://www.youtube.com/watch?v=jTPXwbDtIpA and incorporated it into my scene by using PositionalAudio function with ref distance 50.

9. The text was created with the createText function using font loader and a json file. The texture for the text was given with a pair of vertex and fragment shader. Also shader texture has been used for the cubes at the centre replicating a rotating magical stone.

10. A flag has been incorporated in the scene with the help of a three js physics library ammo.js. Full credit for the code goes to https://github.com/mrdoob/three.js/blob/master/examples/physics_ammo_cloth.html 

11. A GUI folder is set to the upper right side of the scene from which three functions can be controlled by the user, Audio with play and stop functionality, Video with play and pause functionality and the  functionality to rotate the flag pole to either clockwise or anticlockwise side with a halt button to stop the rotation. A stats screen is set to the upper left side of the scene which shows the system performance statistics.

12. Finally this entire scene has been designed and enabled for WebXr.




   
