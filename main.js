// WebGL Code

// runs once on window load
function main() {
  const canvas = document.querySelector("#glCanvas");
  // initialize the GL context
  const gl = canvas.getContext("webgl");

  // only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // vertex shader program
  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
  `;

  // fragment shader program
  const fsSource = `
  varying lowp vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
    }
  };

  const positionBuffer = setPositionBuffer(gl);
  const colorBuffer = setColorBuffer(gl);

  drawScene(gl, programInfo, positionBuffer, colorBuffer);
}

// initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // if creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    return null;
  }

  return shaderProgram;
}

// creates a shader of the given type, uploads the source and compiles it
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // send the source to the shader object
  gl.shaderSource(shader, source);

  // compile the shader program
  gl.compileShader(shader);

  // see if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

const vertexCount = 25;

function setPositionBuffer(gl) {
  // create a buffer for the square's positions
  const positionBuffer = gl.createBuffer();

  // select the positionBuffer as the one to apply buffer
  // operations to from here out
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // now create an array of positions for the square.
  var positions = [];
  const diff = 3 / vertexCount;
  for (let t = 0; t < vertexCount; t++) {
    positions.push(diff * t * Math.cos(t), -1, diff * t * Math.sin(t));
  }

  // now pass the list of positions into WebGL to build the shape
  // we do this by creating a Float32Array from the JavaScript array then use it to fill the current buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function setColorBuffer(gl) {
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var colors = [];
  for (let t = 0; t < vertexCount; t++) {
    colors.push((Math.cos(0.5 * t) + 1) / 2, 1, 0, 1);
  }
  console.log(colors);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
}

function drawScene(gl, programInfo, positionBuffer, colorBuffer) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // clear to black, fully opaque
  gl.clearDepth(1.0);                 // clear everything
  gl.enable(gl.DEPTH_TEST);           // enable depth testing
  gl.depthFunc(gl.LEQUAL);            // near things obscure far things

  // clear the canvas before we start drawing on it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // set the drawing position to the "identity" point, which is
  // the center of the scene
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

  // tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

  // tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
}

window.onload = main;
