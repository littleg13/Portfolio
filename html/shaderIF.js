function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function initShaderProgram(gl, vsSource, fsSource, outVaryings) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    if (outVaryings) {
        gl.transformFeedbackVaryings(shaderProgram, outVaryings, gl.SEPARATE_ATTRIBS);
    }
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}
  
  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

let vDrawSource = `# version 300 es
    in vec4 mcPosition;
    in vec4 mcVelocity;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform float deltaTime;
    out vec4 velocity;
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * mcPosition;
        gl_PointSize = 0.7;
        velocity = mcVelocity;
    }`;

let fDrawSource = `# version 300 es
    precision mediump float;
    uniform vec4 fastColor;
    uniform vec4 slowColor;
    in vec4 velocity;
    out vec4 fragColor;
    void main() {
        fragColor = mix(fastColor, slowColor, length(velocity.xyz) / 0.001);
    }`;

let vUpdateSource = `# version 300 es
    in vec4 mcPosition;
    in vec4 mcVelocity;

    out vec4 position;
    out vec4 velocity;

    uniform float deltaTime;
    uniform vec4 ecMousePos;
    uniform float mouseOn;
    
    void main() {
        vec3 toMouse = ecMousePos.xyz - mcPosition.xyz;
        vec3 vel = toMouse * 0.000001 / (length(toMouse)* length(toMouse));
        vec3 newVelocity = mcVelocity.xyz + (vel * mouseOn);
        vec3 newPosition = mcPosition.xyz + newVelocity * deltaTime;
        position.w = mcPosition.w;
        if(newPosition.x > 1.0 || newPosition.x < -1.0){
            position.xyz = vec3(1.0 * normalize(newPosition.x), newPosition.yz);
            velocity = vec4(-newVelocity * 1.0, 0.0);
        }
        else{
            position.xyz = newPosition.xyz;
            velocity = vec4(newVelocity * 0.99, 0.0);
        }
    }`;

let fUpdateSource = `# version 300 es
    precision mediump float;
    out vec4 fragColor;
    void main() {
        discard;
    }`;
