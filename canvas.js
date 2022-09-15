// WebGL Code

var vertex_positions = [];
var vertex_colors = [];
var gl = null;
var shader_program = null;
var attribute_locs = {
  vertex_positions: null,
  vertex_colors: null,
};
var uniform_locs = {
  projection_matrix: null,
  model_view_matrix: null,
};

function initWebGL() {
  const canvas = document.querySelector("#gl");
  gl = canvas.getContext("webgl");
  if (gl === null) {
    alert("Unable to initialize Webgl. Your browser or machine may not support it.");
    return;
  }

  // vertex shader program
  const vertex_shader_src = `
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
  const fragment_shader_src = `
  varying lowp vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
  `;

  // create vertex shader
  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, vertex_shader_src);
  gl.compileShader(vertex_shader);
  if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}");
    gl.deleteShader(vertex_shader);
    return null;
  }

  // create fragment shader
  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, fragment_shader_src);
  gl.compileShader(fragment_shader);
  if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}");
    gl.deleteShader(fragment_shader);
    return null;
  }

  // create the shader program
  shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);

  // if creating the shader program failed, alert
  if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program: ${gl.getProgramInfoLog(shader_program)}");
    return null;
  }

  attribute_locs.vertex_positions = gl.getAttribLocation(shader_program, "aVertexPosition");
  attribute_locs.vertex_colors = gl.getAttribLocation(shader_program, "aVertexColor");
  uniform_locs.projection_matrix = gl.getUniformLocation(shader_program, "uProjectionMatrix");
  uniform_locs.model_view_matrix = gl.getUniformLocation(shader_program, "uModelViewMatrix");
}

function clear() {
  vertex_positions = [];
  vertex_colors = [];
}

function triangle(x1, y1, z1, x2, y2, z2, x3, y3, z3, r, g, b, a) {
  vertex_positions.push(x1, y1, z1, x2, y2, z2, x3, y3, z3);
  vertex_colors.push(r, g, b, a, r, g, b, a, r, g, b, a);
}

function render() {
  gl.clearColor(0, 0, 0, 1);  // clear to black, fully opaque
  gl.clearDepth(1);  // clear everything
  gl.enable(gl.DEPTH_TEST);  // enable depth testing
  gl.depthFunc(gl.LEQUAL);  // near things obscure far things

  // clear the canvas before we start drawing on it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // create the projection matrix
  const fov = 45 * Math.PI / 180;  // in radians
  const aspect_ratio = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const z_near = 0.1;
  const z_far = 100;
  const projection_matrix = mat4.create();
  mat4.perspective(projection_matrix, fov, aspect_ratio, z_near, z_far);

  // create the model view matrix
  const model_view_matrix = mat4.create();
  mat4.translate(model_view_matrix, model_view_matrix, [0, 0, -6]);
  // mat4.rotate(model_view_matrix, model_view_matrix, t, [0, 0, 1]);  // rotate around z-axis
  // mat4.rotate(model_view_matrix, model_view_matrix, 0.7 * t, [0, 1, 0]);  // rotate around y-axis
  // mat4.rotate(model_view_matrix, model_view_matrix, 0.3 * t, [1, 0, 0]);  // rotate around x-axis

  // tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  const position_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_positions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribute_locs.vertex_positions, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute_locs.vertex_positions);

  const color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_colors), gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribute_locs.vertex_colors, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute_locs.vertex_colors);

  // tell WebGL to use our program when drawing
  gl.useProgram(self.shader_program);

  // set the shader uniforms
  gl.uniformMatrix4fv(uniform_locs.projection_matrix, false, projection_matrix);
  gl.uniformMatrix4fv(uniform_locs.model_view_matrix, false, model_view_matrix);

  gl.drawArrays(gl.TRIANGLES, 0, vertex_positions.length / 3);
}
