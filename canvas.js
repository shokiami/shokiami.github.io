// WebGL Code

class Canvas {
  constructor() {
    const canvas = document.querySelector("#gl");
    this.gl = canvas.getContext("webgl");
    if (this.gl === null) {
      alert("Unable to initialize Webgl. Your browser or machine may not support it.");
      return;
    }
  
    // vertex shader program
    const vertex_shader_src = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;
  
    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
  
    varying lowp vec4 vColor;
    varying highp vec3 vLighting;
  
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;

      highp vec3 ambientLight = vec3(0.1, 0.1, 0.1);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalLightVector = normalize(vec3(0, 0, -1));
      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
      highp float directional = max(dot(-transformedNormal.xyz, directionalLightVector), 0.0);
      vLighting = ambientLight + directionalLightColor * directional;
    }
    `;
  
    // fragment shader program
    const fragment_shader_src = `
    varying lowp vec4 vColor;
    varying highp vec3 vLighting;
  
    void main() {
      gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
    }
    `;
  
    // create vertex shader
    const vertex_shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertex_shader, vertex_shader_src);
    this.gl.compileShader(vertex_shader);
    if (!this.gl.getShaderParameter(vertex_shader, this.gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the vertex shader.");
      this.gl.deleteShader(vertex_shader);
      return;
    }
  
    // create fragment shader
    const fragment_shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragment_shader, fragment_shader_src);
    this.gl.compileShader(fragment_shader);
    if (!this.gl.getShaderParameter(fragment_shader, this.gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the fragment shader.");
      this.gl.deleteShader(fragment_shader);
      return;
    }
  
    // create the shader program
    this.shader_program = this.gl.createProgram();
    this.gl.attachShader(this.shader_program, vertex_shader);
    this.gl.attachShader(this.shader_program, fragment_shader);
    this.gl.linkProgram(this.shader_program);
  
    // if creating the shader program failed, alert
    if (!this.gl.getProgramParameter(this.shader_program, this.gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: ${this.gl.getProgramInfoLog(this.shader_program)}");
      return;
    }
  
    this.attribute_locs = {
      vertex_positions: this.gl.getAttribLocation(this.shader_program, "aVertexPosition"),
      vertex_colors: this.gl.getAttribLocation(this.shader_program, "aVertexColor"),
      vertex_normals: this.gl.getAttribLocation(this.shader_program, "aVertexNormal"),
    };
    this.uniform_locs = {
      projection_matrix: this.gl.getUniformLocation(this.shader_program, "uProjectionMatrix"),
      model_view_matrix: this.gl.getUniformLocation(this.shader_program, "uModelViewMatrix"),
      normal_matrix: this.gl.getUniformLocation(this.shader_program, "uNormalMatrix"),
    };

    this.gl.enable(this.gl.CULL_FACE);

    // clear the canvas
    this.clear();

    // initialize state variables
    this.fov = Math.PI / 4;
    this.x = 0;
    this.y = 0;
    this.z = 4;
    this.rot_x = 0;
    this.rot_y = 0;
    this.rot_z = 0;
  }
  
  clear() {
    this.vertex_positions = [];
    this.vertex_colors = [];
    this.vertex_normals = [];
  }
  
  triangle(x1, y1, z1, x2, y2, z2, x3, y3, z3, r, g, b, a) {
    this.vertex_positions.push(x1, y1, z1, x2, y2, z2, x3, y3, z3);
    this.vertex_colors.push(r, g, b, a, r, g, b, a, r, g, b, a);
    var v1 = vec3.fromValues(x2 - x1, y2 - y1, z2 - z1);
    var v2 = vec3.fromValues(x3 - x1, y3 - y1, z3 - z1);
    var n = vec3.create();
    vec3.cross(n, v1, v2);
    vec3.normalize(n, n);
    let [n1, n2, n3] = n;
    this.vertex_normals.push(n1, n2, n3, n1, n2, n3, n1, n2, n3);
  }

  to_xyz(pixel_x, pixel_y) {
    let normalized_x = pixel_x / window.innerWidth * 2 - 1;
    let normalized_y = pixel_y / window.innerHeight * -2 + 1;
    let max_y = this.z * Math.tan(this.fov / 2);
    let max_x = max_y * (window.innerWidth / window.innerHeight);
    return [max_x * normalized_x, max_y * normalized_y];
  }
  
  render() {
    this.gl.clearColor(0, 0, 0, 1);  // clear to black, fully opaque
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  
    // clear the canvas before we start drawing on it
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  
    // create the projection matrix
    const aspect_ratio = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const z_near = 0.1;
    const z_far = 100;
    const projection_matrix = mat4.create();
    mat4.perspective(projection_matrix, this.fov, aspect_ratio, z_near, z_far);
  
    // create the model view matrix
    const model_view_matrix = mat4.create();
    mat4.rotate(model_view_matrix, model_view_matrix, this.rot_z, [0, 0, 1]);  // rotate around z-axis
    mat4.rotate(model_view_matrix, model_view_matrix, this.rot_y, [0, 1, 0]);  // rotate around y-axis
    mat4.rotate(model_view_matrix, model_view_matrix, this.rot_x, [1, 0, 0]);  // rotate around x-axis
    mat4.translate(model_view_matrix, model_view_matrix, [-this.x, -this.y, -this.z]);

    // create normal matrix
    const normal_matrix = mat4.create();
    mat4.invert(normal_matrix, model_view_matrix);
    mat4.transpose(normal_matrix, normal_matrix);
  
    // tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    const position_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, position_buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertex_positions), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.attribute_locs.vertex_positions, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.attribute_locs.vertex_positions);
  
    const color_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, color_buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertex_colors), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.attribute_locs.vertex_colors, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.attribute_locs.vertex_colors);

    const normal_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normal_buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertex_normals), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.attribute_locs.vertex_normals, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.attribute_locs.vertex_normals);
  
    // tell WebGL to use our program when drawing
    this.gl.useProgram(this.shader_program);
  
    // set the shader uniforms
    this.gl.uniformMatrix4fv(this.uniform_locs.projection_matrix, false, projection_matrix);
    this.gl.uniformMatrix4fv(this.uniform_locs.model_view_matrix, false, model_view_matrix);
    this.gl.uniformMatrix4fv(this.uniform_locs.normal_matrix, false, normal_matrix);
  
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertex_positions.length / 3);
  }
}
