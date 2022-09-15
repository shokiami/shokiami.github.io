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
    const vertex_shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertex_shader, vertex_shader_src);
    this.gl.compileShader(vertex_shader);
    if (!this.gl.getShaderParameter(vertex_shader, this.gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(shader)}");
      this.gl.deleteShader(vertex_shader);
      return;
    }
  
    // create fragment shader
    const fragment_shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragment_shader, fragment_shader_src);
    this.gl.compileShader(fragment_shader);
    if (!this.gl.getShaderParameter(fragment_shader, this.gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(shader)}");
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
    };
    this.uniform_locs = {
      projection_matrix: this.gl.getUniformLocation(this.shader_program, "uProjectionMatrix"),
      model_view_matrix: this.gl.getUniformLocation(this.shader_program, "uModelViewMatrix"),
    };

    this.vertex_positions = [];
    this.vertex_colors = [];
    
    this.camera_x = 0;
    this.camera_y = 0;
    this.camera_z = 6;
    this.angle_x = 0;
    this.angle_y = 0;
    this.angle_z = 0;
  }
  
  clear() {
    this.vertex_positions = [];
    this.vertex_colors = [];
  }
  
  triangle(x1, y1, z1, x2, y2, z2, x3, y3, z3, r, g, b, a) {
    this.vertex_positions.push(x1, y1, z1, x2, y2, z2, x3, y3, z3);
    this.vertex_colors.push(r, g, b, a, r, g, b, a, r, g, b, a);
  }
  
  render() {
    this.gl.clearColor(0, 0, 0, 1);  // clear to black, fully opaque
    this.gl.clearDepth(1);  // clear everything
    this.gl.enable(this.gl.DEPTH_TEST);  // enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);  // near things obscure far things
  
    // clear the canvas before we start drawing on it
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  
    // create the projection matrix
    const fov = 45 * Math.PI / 180;  // in radians
    const aspect_ratio = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const z_near = 0.1;
    const z_far = 100;
    const projection_matrix = mat4.create();
    mat4.perspective(projection_matrix, fov, aspect_ratio, z_near, z_far);
  
    // create the model view matrix
    const model_view_matrix = mat4.create();
    mat4.translate(model_view_matrix, model_view_matrix, [-this.camera_x, -this.camera_y, -this.camera_z]);
    mat4.rotate(model_view_matrix, model_view_matrix, this.angle_x, [0, 0, 1]);  // rotate around z-axis
    mat4.rotate(model_view_matrix, model_view_matrix, this.angle_y, [0, 1, 0]);  // rotate around y-axis
    mat4.rotate(model_view_matrix, model_view_matrix, this.angle_z, [1, 0, 0]);  // rotate around x-axis
  
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
  
    // tell WebGL to use our program when drawing
    this.gl.useProgram(this.shader_program);
  
    // set the shader uniforms
    this.gl.uniformMatrix4fv(this.uniform_locs.projection_matrix, false, projection_matrix);
    this.gl.uniformMatrix4fv(this.uniform_locs.model_view_matrix, false, model_view_matrix);
  
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertex_positions.length / 3);
  }
}
