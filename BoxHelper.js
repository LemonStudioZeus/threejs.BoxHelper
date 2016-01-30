 THREE.BoxHelper = function (camera, option) {


        var geometry = new _THREE.Geometry();
        var hex = option.line.color || 0x00ff00;

        var material = new _THREE.LineBasicMaterial({
            color: hex,
            vertexColors: _THREE.FaceColors
        });

        var pointMap = {};

        addLine("p0", "p1", hex);
        addLine("p1", "p2", hex);
        addLine("p2", "p3", hex);
        addLine("p3", "p0", hex);

        addLine("p4", "p5", hex);
        addLine("p5", "p6", hex);
        addLine("p6", "p7", hex);
        addLine("p7", "p4", hex);

        addLine("p1", "p5", hex);
        addLine("p2", "p6", hex);
        addLine("p0", "p4", hex);
        addLine("p3", "p7", hex);


        function addLine(a, b, hex) {

            addPoint(a, hex);
            addPoint(b, hex);

        }

        function addPoint(id, hex) {

            geometry.vertices.push(new THREE.Vector3());
            geometry.colors.push(new THREE.Color(hex));

            if (pointMap[id] === undefined) {

                pointMap[id] = [];

            }

            pointMap[id].push(geometry.vertices.length - 1);

        }

        function getPoint(id) {

            return pointMap[id];

        }

        THREE.Line.call(this, geometry, material, THREE.LinePieces);

        this.box = new THREE.Box3();

        //this.matrix = object.matrixWorld;
        this.matrixAutoUpdate = false;

        this.pointMap = pointMap;

        this.camera = camera;

        this.box_children = [];

        this.visible = false;

        this.option = option;

    };

    THREE.BoxHelper.prototype = Object.create(_THREE.Line.prototype);

    THREE.BoxHelper.prototype.addObject = function (object) {

        this.box_children.push(object);
        this.update();

    };

    THREE.BoxHelper.prototype.removeObject = function (object) {

        var index = this.box_children.indexOf(object);

        if (index !== -1) {

            this.box_children.splice(index, 1);

        }

        this.update();

    };

    THREE.BoxHelper.prototype.update = function () {

        var geometry, pointMap;

        var vector = new _THREE.Vector3();

        var setPoint = function (point, x, y, z) {

            vector.set(x, y, z);

            var points = pointMap[point];

            if (points !== undefined) {

                for (var i = 0, il = points.length; i < il; i++) {

                    geometry.vertices[points[i]].copy(vector);

                }

            }

        };

        var createSign = function (text, option) {

            var parameter = option['font-parameter'];

            parameter.font = "optimer";

            var text_geometry = new THREE.TextGeometry(text, parameter);

            text_geometry.center();

            var material = new THREE.MeshFaceMaterial([
                        new THREE.MeshPhongMaterial({
                    color: parameter.color,
                    shading: THREE.FlatShading
                }), // front
                        new THREE.MeshPhongMaterial({
                    color: parameter.color,
                    shading: THREE.SmoothShading
                }) // side
                    ]);

            var mesh = new THREE.Mesh(text_geometry, material);

            return mesh;

        };

        return function () {

            geometry = this.geometry;
            pointMap = this.pointMap;

            option = this.option;

            this.box.makeEmpty();

            for (var i = 0, l = this.box_children.length; i < l; i++) {

                var _box = new THREE.Box3();

                var child = this.box_children[i];

                _box.setFromObject(child);

                this.box.union(_box);

            }

            var min = this.box.min;
            var max = this.box.max;

            if (this.box.empty()) {
                return;
            }


            /*
              5____4
            1/___0/|
            | 6__|_7
            2/___3/

            0: max.x, max.y, max.z
            1: min.x, max.y, max.z
            2: min.x, min.y, max.z
            3: max.x, min.y, max.z
            4: max.x, max.y, min.z
            5: min.x, max.y, min.z
            6: min.x, min.y, min.z
            7: max.x, min.y, min.z
            */

            setPoint("p0", max.x, max.y, max.z);
            setPoint("p1", min.x, max.y, max.z);
            setPoint("p2", min.x, min.y, max.z);
            setPoint("p3", max.x, min.y, max.z);
            setPoint("p4", max.x, max.y, min.z);
            setPoint("p5", min.x, max.y, min.z);
            setPoint("p6", min.x, min.y, min.z);
            setPoint("p7", max.x, min.y, min.z);

            geometry.verticesNeedUpdate = true;

            this.children = [];



            var x_mesh = createSign(parseFloat(this.box.size().x).toFixed(0), option);
            var y_mesh = createSign(parseFloat(this.box.size().y).toFixed(0), option);
            var z_mesh = createSign(parseFloat(this.box.size().z).toFixed(0), option);

            x_mesh.position.copy(new THREE.Vector3((max.x + min.x) / 2, max.y, max.z));
            y_mesh.position.copy(new THREE.Vector3(max.x, (max.y + min.y) / 2, max.z));

            z_mesh.rotateY(Math.PI / 2);
            z_mesh.position.copy(new THREE.Vector3(max.x, max.y, (max.z + min.z) / 2));

            this.children.push(x_mesh);
            this.children.push(y_mesh);
            this.children.push(z_mesh);

        };

    }();
