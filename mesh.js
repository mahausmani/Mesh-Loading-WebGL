"use strict";

let gl; // WebGL "context"
let vertices = [];
let orig_vertices = [];
let colors = [];
var theta = [0, 0, 0];
var stheta = [0, 0, 0];
var s = [1, 1, 1];
var d = [0, 0, 0, 0];
var thetaLoc;
var sthetaLoc;
var dLoc;
var sLoc;
var stop;
var axis = 2;
let max = 0;
var x_max = 0;
var x_min = 0;
var y_max = 0;
var y_min = 0;
var z_max = 0;
var z_min = 0;
window.onload = function init() {
    let canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    //  Load shaders and initialize attribute buffers
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    document.getElementById("inputfile").addEventListener("change", function () {
        var fr = new FileReader();
        fr.onload = function () {
            var text = fr.result;
            var end_header = 0;
            var lines = text.split("\n");
            for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
                const line = lines[lineNo];
                if (line == "") {
                    continue;
                }
                var parts = line.split(/\s+/).slice(0);
                if (line.startsWith("element")) {
                    if (parts[1] == "vertex") {
                        var lenVertices = parseFloat(parts[2]);
                    } else if (parts[1] == "face") var lenFace = parseInt(parts[2]);
                } else if (line.startsWith("end_header")) {
                    end_header = 1;
                    var count = 1;
                    console.log(lenVertices);
                } else if (end_header == 1) {
                    if (count <= lenVertices) {
                        //bringing it to webgl coordinates
                        let a = map_point(-0.09, 0.2, -1, 1, parseFloat(parts[0]));
                        let b = map_point(-0.09, 0.2, -1, 1, parseFloat(parts[1]));
                        let c = map_point(-0.09, 0.2, -1, 1, parseFloat(parts[2]));
                        if (a > x_max) x_max = a;
                        if (a < x_min) x_min = a;
                        if (b > y_max) y_max = b;
                        if (b < y_min) y_min = b;
                        if (c > z_max) z_max = c;
                        if (c < z_min) z_min = c;
                        var vertex = vec3(parseFloat(a), parseFloat(-b), parseFloat(c));
                        vertices.push(vertex);
                        orig_vertices.push(vertex);
                    }
                    count++;
                }
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

            let vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            thetaLoc = gl.getUniformLocation(program, "theta");
            sthetaLoc = gl.getUniformLocation(program, "stheta");
            dLoc = gl.getUniformLocation(program, "d");
            sLoc = gl.getUniformLocation(program, "sf");

            //centering at origin
            var v = [];
            for (var i = 0; i < vertices.length; ++i) {
                var new_vertex = vec3(
                    vertices[i][0] - (x_max + x_min) / 2 - 0.1,
                    vertices[i][1] + (y_max + y_min) / 2,
                    vertices[i][2] - (z_max + z_min) / 2
                );
                v.push(new_vertex);
            }
            vertices = v;
            orig_vertices = v;
            gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
            render();
        };
        fr.readAsText(this.files[0]);
    });
    document.getElementById("Button1x").onclick = function () {
        theta[0] += 10;
    };
    document.getElementById("Button2x").onclick = function () {
        theta[0] -= 10;
    };
    document.getElementById("Button1y").onclick = function () {
        theta[1] += 10;
    };
    document.getElementById("Button2y").onclick = function () {
        theta[1] -= 10;
    };
    document.getElementById("Button1z").onclick = function () {
        theta[2] += 10;
    };
    document.getElementById("Button2z").onclick = function () {
        theta[2] -= 10;
    };
    document.getElementById("shearx").onclick = function () {
        stheta[0] = 0.27474;
    }; //cot 45
    document.getElementById("shearnx").onclick = function () {
        stheta[0] = -0.27474;
    }; //cot 45
    document.getElementById("sheary").onclick = function () {
        stheta[1] = 0.27474;
    }; //cot 45
    document.getElementById("shearny").onclick = function () {
        stheta[1] = -0.27474;
    }; //cot 45
    document.getElementById("shearz").onclick = function () {
        stheta[2] = 1;
    }; //cot 45
    document.getElementById("shearnz").onclick = function () {
        stheta[2] = -1;
    }; //cot 45
    document.getElementById("shiftx").onclick = function () {
        d[0] += 0.1;
    };
    document.getElementById("shiftnx").onclick = function () {
        d[0] -= 0.1;
    };
    document.getElementById("shifty").onclick = function () {
        d[1] += 0.1;
    };
    document.getElementById("shiftny").onclick = function () {
        d[1] -= 0.1;
    };
    document.getElementById("shiftz").onclick = function () {
        d[2] += 0.1;
    };
    document.getElementById("shiftnz").onclick = function () {
        d[2] -= 0.1;
    };
    document.getElementById("growx").onclick = function () {
        s[0] += 0.1;
    };
    document.getElementById("shrinkx").onclick = function () {
        s[0] -= 0.1;
    };
    document.getElementById("growy").onclick = function () {
        s[1] += 0.1;
    };
    document.getElementById("shrinky").onclick = function () {
        s[1] -= 0.1;
    };
    document.getElementById("growz").onclick = function () {
        s[2] += 0.1;
    };
    document.getElementById("shrinkz").onclick = function () {
        s[2] -= 0.1;
    };
    document.getElementById("reflectx").onclick = function () {
        var v = [];
        for (var i = 0; i < vertices.length; ++i) {
            var new_vertex = vec3(-vertices[i][0], vertices[i][1], vertices[i][2]);
            v.push(new_vertex);
        }
        vertices = v;
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    };
    document.getElementById("reflecty").onclick = function () {
        var v = [];
        for (var i = 0; i < vertices.length; ++i) {
            var new_vertex = vec3(vertices[i][0], -vertices[i][1], vertices[i][2]);
            v.push(new_vertex);
        }
        vertices = v;
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    };
    document.getElementById("reflectz").onclick = function () {
        var v = [];
        for (var i = 0; i < vertices.length; ++i) {
            var new_vertex = vec3(-vertices[i][0], vertices[i][1], -vertices[i][2]);
            v.push(new_vertex);
        }
        vertices = v;
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    };
    document.getElementById("reset").onclick = function () {
        s = [1, 1, 1];
        console.log(x_min, x_max);
        d = [0, 0, 0, 0];
        theta = [0, 0, 0];
        stheta = [0, 0, 0];
        vertices = orig_vertices;
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    };
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3fv(thetaLoc, theta);
    gl.uniform4fv(dLoc, d);
    gl.uniform3fv(sLoc, s);
    gl.uniform3fv(sthetaLoc, stheta);
    gl.drawArrays(gl.POINTS, 0, vertices.length);
    requestAnimationFrame(render);
}
