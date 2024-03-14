let vertexSource = "vertex.vsh";
let fragSource = "fragment.fsh";
let fastColor = [0.0, 0.3, 0.9, 1.0];
let slowColor = [0.8, 0.1, 0.1, 1.0];
let projectionMatrix, inverseProj;
let modelViewMatrix;
let gl;
let shaderProgramDraw;
let shaderProgramUpdate;
let numPoints = 1000000;
let buffers;
let ldsMousePos, ecMousePos;
let canvas;
let mouseOn = false;

function setMousePos(){
    mouseX = (e.offsetX / canvas.clientWidth)*2-1;
    mouseY = ((canvas.clientHeight - e.offsetY) / canvas.clientHeight)*2-1;
}

function main() {
    canvas = document.querySelector("#glCanvas");
    ldsMousePos = vec4.create();
    ecMousePos = vec4.create();
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // Initialize the GL context
    gl = canvas.getContext("webgl2");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    // Only continue if WebGL is available and working
    if (gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }
    shaderProgramDraw = initShaderProgram(gl, vDrawSource, fDrawSource);
    shaderProgramUpdate = initShaderProgram(gl, vUpdateSource, fUpdateSource, ['position', 'velocity'])
    createScene(gl);
    buffers = initBuffers(gl);
    canvas.addEventListener('mousemove', e => {
        mouseOn = true;
        let mouseX = (e.offsetX / canvas.clientWidth)*2-1;
        let mouseY = ((canvas.clientHeight - e.offsetY) / canvas.clientHeight)*2-1;
        vec4.set(ldsMousePos, mouseX, mouseY, 0, 0.0);
        vec4.transformMat4(ecMousePos, ldsMousePos, inverseProj);
    });
    canvas.addEventListener('mouseover', e => {
        mouseOn = true;
    });
    canvas.addEventListener('mouseout', e => {
        mouseOn = false;
    });
    requestAnimationFrame(render);
}

function createScene(gl) {
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    projectionMatrix = mat4.create();
    inverseProj = mat4.create();
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    mat4.invert(inverseProj, projectionMatrix);

    modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix,     // destination matrix
                modelViewMatrix,     // matrix to translate
                [-0.0, 0.0, -1.0]);  // amount to translate

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    
    // Clear the canvas before we start drawing on it.
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}


function initBuffers(gl) {
    // Create a buffer for the square's positions.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posA = gl.createBuffer();
    const posB = gl.createBuffer();
    const velA = gl.createBuffer();
    const velB = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    
    // Now create an array of positions for the square.
    
    let positions = [];
    let vel = [];
    for(let i=0;i<numPoints * 4;i+=4){
        positions[i] = Math.random() * 2 - 1.0;
        positions[i+1] = Math.random() * 2 - 1.0;
        positions[i+2] = 0.0;
        positions[i+3] = 1.0;
        vel[i] = 0.0;
        vel[i+1] = 0.0;
        vel[i+2] = 0.0;
        vel[i+3] = 0.0;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, posA);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, posB);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, velA);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vel), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, velB);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vel), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    const tf = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);

    return {
    vao: vao,
    posA: posA,
    posB: posB,
    velA: velA,
    velB: velB,
    tf: tf,
    };
}
let then = 0.0;
function render(now){
    // console.log(mouseX, mouseY);
    gl.useProgram(shaderProgramUpdate);
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindVertexArray(buffers.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.posA);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramUpdate, 'mcPosition'), 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramUpdate, 'mcPosition'));
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velA);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramUpdate, 'mcVelocity'), 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramUpdate, 'mcVelocity'));

    gl.uniform1f(gl.getUniformLocation(shaderProgramUpdate, 'mouseOn'), mouseOn);
    gl.uniform4fv(gl.getUniformLocation(shaderProgramUpdate, 'ecMousePos'), ecMousePos);
    gl.uniform1f(gl.getUniformLocation(shaderProgramUpdate, 'deltaTime'), now - then);
    then = now;

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers.posB);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, buffers.velB);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, numPoints);
    gl.endTransformFeedback();
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD);

    gl.useProgram(shaderProgramDraw);
  
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.posB);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramDraw, 'mcPosition'), 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramDraw, 'mcPosition'));

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velB);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramDraw, 'mcVelocity'), 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramDraw, 'mcVelocity'));

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramDraw, 'uProjectionMatrix'), false, projectionMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramDraw, 'uModelViewMatrix'), false, modelViewMatrix);
    gl.uniform4fv(gl.getUniformLocation(shaderProgramDraw, 'fastColor'), fastColor);
    gl.uniform4fv(gl.getUniformLocation(shaderProgramDraw, 'slowColor'), slowColor);
    
    gl.drawArrays(gl.POINTS, 0, numPoints);

    let t = buffers.posA;
    buffers.posA = buffers.posB;
    buffers.posB = t;
    t = buffers.velA;
    buffers.velA = buffers.velB;
    buffers.velB = t;
    requestAnimationFrame(render);
}