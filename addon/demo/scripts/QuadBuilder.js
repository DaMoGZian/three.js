var QuadBuilder = function () {

};


QuadBuilder.prototype = {

    BuildQuadForGrid: function () {
	console.log("BuildQuadForGrid called");
        var baseIndex, index0, index1, index2, index3, n = new THREE.Vector3(0, 0, 1);

        return function (geometry, position, uv, buildTriangles, vertsPerRow, swapOrder) {

            geometry.vertices.push(position);
            geometry.faceVertexUvs.push(uv);

//            geometry.faceVertexUvs[0].push([]);

            if (buildTriangles) {

                baseIndex = geometry.vertices.length - 1;
                index0 = baseIndex;
                index1 = baseIndex - 1;
                index2 = baseIndex - vertsPerRow;
                index3 = baseIndex - vertsPerRow - 1;

                if (swapOrder) {
                    geometry.faces.push(new THREE.Face3(index0, index1, index3, [n, n, n]));
                    geometry.faces.push(new THREE.Face3(index0, index3, index2, [n, n, n]));
                } else {
                    geometry.faces.push(new THREE.Face3(index2, index1, index3, [n, n, n]));
                    geometry.faces.push(new THREE.Face3(index0, index1, index2, [n, n, n]));
                }
            }
        };
    }()
};
