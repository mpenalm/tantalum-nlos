var Transient = function () {
    this.canvas = document.getElementById("transient-canvas");
    this.overlay = document.getElementById("transient-overlay");
    this.controls = document.getElementById("transient-controls");

    this.boundRenderLoop = this.renderLoop.bind(this);

    this.savedImages = 0;

    try {
        this.setupGL();
    } catch (e) {
        /* GL errors at this stage are to be expected to some degree,
           so display a nice error message and call it quits */
        this.fail(e.message + ". This demo won't run in your browser.");
        return;
    }
    try {
        this.setupUI();
    } catch (e) {
        /* Errors here are a bit more serious and shouldn't normally happen.
           Let's just dump what we have and hope the user can make sense of it */
        this.fail("Ooops! Something unexpected happened. The error message is listed below:<br/>" +
            "<pre>" + e.message + "</pre>");
        return;
    }

    /* Ok, all seems well. Time to show the controls */
    this.controls.style.visibility = "visible";

    window.requestAnimationFrame(this.boundRenderLoop);
}

Transient.prototype.setupGL = function () {
    try {
        var gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
    } catch (e) { }
    if (!gl)
        throw new Error("Could not initialise WebGL");

    var floatExt = gl.getExtension("OES_texture_float");
    var floatLinExt = gl.getExtension("OES_texture_float_linear");
    var floatBufExt = gl.getExtension("WEBGL_color_buffer_float");
    var multiBufExt = gl.getExtension("WEBGL_draw_buffers");

    if (!floatExt || !floatLinExt)
        throw new Error("Your platform does not support float textures");
    if (!multiBufExt)
        throw new Error("Your platform does not support the draw buffers extension");

    tgl.init(gl, multiBufExt);

    if (!floatBufExt)
        this.colorBufferFloatTest(gl);

    this.gl = gl;
}

Transient.prototype.colorBufferFloatTest = function (gl) {
    /* This one is slightly awkward. The WEBGL_color_buffer_float
       extension is apparently causing a lot of troubles for
       ANGLE, so barely anyone bothers to implement it. On the other
       hand, most platforms do actually implicitly support float render
       targets just fine, even though they pretend they don't.
       So to *actually* figure out whether we can do float attachments
       or not, we have to do a very hacky up-front blending test
       and see whether the results come out correct.
       Hurray WebGL! */

    var shader = new tgl.Shader(Shaders, "blend-test-vert", "blend-test-frag");
    var packShader = new tgl.Shader(Shaders, "blend-test-vert", "blend-test-pack-frag");
    var target = new tgl.Texture(1, 1, 4, true, false, false, new Float32Array([-6.0, 10.0, 30.0, 2.0]));
    var fbo = new tgl.RenderTarget();
    var vbo = new tgl.VertexBuffer();
    vbo.bind();
    vbo.addAttribute("Position", 3, gl.FLOAT, false);
    vbo.init(4);
    vbo.copy(new Float32Array([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0]));

    gl.viewport(0, 0, 1, 1);

    fbo.bind();
    fbo.drawBuffers(1);
    fbo.attachTexture(target, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    shader.bind();
    vbo.draw(shader, gl.TRIANGLE_FAN);
    vbo.draw(shader, gl.TRIANGLE_FAN);

    fbo.unbind();
    gl.disable(gl.BLEND);

    /* Of course we can neither read back texture contents or read floating point
       FBO attachments in WebGL, so we have to do another pass, convert to uint8
       and check whether the results are ok.
       Hurray WebGL! */
    packShader.bind();
    target.bind(0);
    packShader.uniformTexture("Tex", target);
    vbo.draw(packShader, gl.TRIANGLE_FAN);

    var pixels = new Uint8Array([0, 0, 0, 0]);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    if (pixels[0] != 8 || pixels[1] != 128 || pixels[2] != 16 || pixels[3] != 4) {
        console.log("Floating point blending test failed. Result was " + pixels + " but should have been " + [8, 128, 16, 4]);
        throw new Error("Your platform does not support floating point attachments");
    }
}

Transient.prototype.setupUI = function () {
    var config = {
        "reconstruction_resolutions": [32, 64, 128, 256],
        "scenes": [
            { 'shader': 'scene10', 'name': 'Line', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene9', 'name': 'Circle', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene11', 'name': 'Visibility test', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            // {'shader': 'scene12', 'name': 'Virtual mirror',   'posA': [0.5, 0.8],       'posB': [0.837, 0.5],      'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene14', 'name': 'Virtual mirror',   'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene16', 'name': 'Virtual mirror 2', 'posA': [0.64, 0.995], 'posB': [0.837, 0.75], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            // { 'shader': 'scene13', 'name': 'Virtual mirror 2', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene15', 'name': 'Virtual mirror rotated', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            // { 'shader': 'scene17', 'name': 'Non-working second corner', 'posA': [0.218, 0.1], 'posB': [0.359, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene18', 'name': 'Second corner', 'posA': [0.625, 0.9], 'posB': [0.837, 0.8], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene19', 'name': 'Second corner target', 'posA': [0.625, 0.9], 'posB': [0.837, 0.8], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse }
        ],
        "capture_methods": ["Non-confocal", "Confocal"],
        "camera_models": ["Confocal", "Transient", "Conventional"],
        "spad_num": [16, 32, 64, 128],
        "filters": ["None", "Laplacian", "Gaussian", "Laplacian of Gaussian", "Phasor Fields"],
        "tone_mapper_labels": ["None", "Logarithmic", "Square root"],
        "tone_mapper_ids": ["none", "log(1.0+", "sqrt("],
        "magnitudes": ["Amplitude", "Phase"],
        "material_types": ["Diffuse", "Mirror", "Dielectric", "RoughMirror", "RoughDielectric"]
    };

    var sceneShaders = [], sceneNames = [];
    for (var i = 0; i < config.scenes.length; ++i) {
        sceneShaders.push(config.scenes[i].shader);
        sceneNames.push(config.scenes[i].name);
    }

    this.renderer = new transientcore.Renderer(this.gl, (this.canvas.width - 10) / 2, this.canvas.height, sceneShaders);
    this.generator = new genScene.SceneGenerator();

    /* Let's try and make member variables in JS a little less verbose... */
    var renderer = this.renderer;
    var generator = this.generator;
    var canvas = this.canvas;

    this.progressBar = new tui.ProgressBar("render-progress", true);

    var filterTypes = [];
    config.filters.forEach(filt => {
        filt = filt.toLowerCase();
        words = filt.split(" ");
        if (words.length == 1) {
            if (filt[0] == 'l')
                filt = "lap";
            else if (filt[0] == 'g')
                filt = "gauss";
        } else {
            filt = "";
            words.forEach(w => {
                filt = filt.concat(w[0]);
            });
        }
        filterTypes.push(filt);
    });

    function changeInstantSlider() {
        if (instantSlider == null || instantSlider.maxValue != renderer.numIntervals - 1) {
            instantSlider = new tui.Slider("instant-selector", 0, renderer.numIntervals - 1, true, function (instant) {
                this.setLabel("L = " + (renderer.deltaT * instant).toFixed(3) + " m");
                renderer.setInstant(instant);
            });
            instantSlider.setValue(0);
            instantSlider.updateLabel = function () {
                this.setLabel("L = " + (renderer.deltaT * this.value).toFixed(3) + " m")
            }
            renderer.addInstantSlider(instantSlider);
        }
    }
    var instantSlider = null;
    changeInstantSlider();

    var wlSlider = new tui.Slider("wl-slider", 1, 15, true, function (wl) {
        this.setLabel("wl = " + wl + " cm");
        wl = wl / 100;
        renderer.setWavelength(wl);
    });
    wlSlider.setValue(2);

    new tui.ButtonGroup("magnitude-selector", false, config.magnitudes, function (idx) {
        var usePhase = Boolean(idx);
        renderer.setUsePhase(usePhase);
        // var visibility = (usePhase) ? 'hidden' : 'visible';
        var display = (usePhase) ? 'none' : 'block';
        if (usePhase) {
            renderer.setToneMapper('none');
        } else {
            renderer.setToneMapper(config.tone_mapper_ids[tonemapSelector.selectedButton]);
        }
        document.getElementById("tonemap-div").style.display = display;
    });

    document.getElementById("filter-parameter").style.visibility = "hidden";

    (new tui.ButtonGroup("filter-selector", true, config.filters, function (idx) {
        renderer.setFilterType(filterTypes[idx]);
        if (idx < 4) {
            document.getElementById("filter-parameter").style.visibility = "hidden";
        } else {
            document.getElementById("filter-parameter").style.visibility = "visible";
            wlSlider.show(filterTypes[idx] === 'pf');
            // magSelector.show(filterTypes[idx] === 'pf');
        }
    })).select(4);

    resolutionLabels = [];
    for (var i = 0; i < config.reconstruction_resolutions.length; ++i)
        resolutionLabels.push(parseInt(config.reconstruction_resolutions[i] * renderer.aspect) + "x" + config.reconstruction_resolutions[i]);

    var recResolutionSelector = new tui.ButtonGroup("reconstruction-resolution-selector", false, resolutionLabels, function (idx) {
        var height = config.reconstruction_resolutions[idx];
        renderer.changeReconstructionResolution(height);
    });
    recResolutionSelector.select(2);
    new tui.ButtonGroup("capture-selector", true, config.capture_methods, function (idx) {
        renderer.setConfocal(Boolean(idx));
    });
    new tui.ButtonGroup("camera-selector", true, config.camera_models, function (idx) {
        renderer.setCameraModel(idx);
    });
    var tonemapSelector = new tui.ButtonGroup("tonemap-selector", true, config.tone_mapper_labels, function (idx) {
        renderer.setToneMapper(config.tone_mapper_ids[idx]);
    });
    var spadNumberSelector = new tui.ButtonGroup("spad-selector", false, config.spad_num, function (idx) {
        renderer.changeSpadResolution(config.spad_num[idx]);
    });
    spadNumberSelector.select(2);

    var spadPositionsSlider = document.getElementById("spad-positions-selector");
    noUiSlider.create(spadPositionsSlider, {
        start: [-0.5, 0.5],
        connect: true,
        range: {
            min: [-1],
            max: [1]
        }
    });
    spadPositionsSlider.label = document.createElement("p");
    spadPositionsSlider.label.className = "slider-label";
    var parent = spadPositionsSlider.parentNode;
    parent.insertBefore(spadPositionsSlider.label, spadPositionsSlider.nextSibling);
    spadPositionsSlider.label.textContent = "[-0.5, 0.5]";
    spadPositionsSlider.noUiSlider.on('update', function (values) {
        var low = parseFloat(values[0]);
        var high = parseFloat(values[1]);
        renderer.setSpadBoundaries(low, high);
        spadPositionsSlider.label.textContent = "[" + low + "," + high + "]";
    });

    function selectScene(idx) {
        renderer.changeScene(idx, config.scenes[idx].wallMat);
        if (!renderer.isConf)
            renderer.setNormalizedEmitterPos(config.scenes[idx].posA, config.scenes[idx].posB);
    }
    var sceneSelector = new tui.ButtonGroup("scene-selector", true, sceneNames, selectScene);

    var mouseListener = new tui.MouseListener(canvas, renderer.setEmitterPos.bind(renderer));

    // var bounceSlider = new tui.Slider("path-length", 1, 20, true, function (length) {
    //     this.setLabel((length - 1) + " light bounces");
    //     renderer.setMaxPathLength(length);
    // });
    // bounceSlider.setValue(12);
    var bounceSlider = document.getElementById("path-length");
    noUiSlider.create(bounceSlider, {
        start: [3, 12],
        connect: true,
        step: 1,
        range: {
            min: [1],
            max: [20]
        }
    });
    bounceSlider.label = document.createElement("p");
    bounceSlider.label.className = "slider-label";
    var parent = bounceSlider.parentNode;
    parent.insertBefore(bounceSlider.label, bounceSlider.nextSibling);
    bounceSlider.label.textContent = "11 light bounces, capturing from bounce 3";
    bounceSlider.noUiSlider.on('update', function (values) {
        var low = parseFloat(values[0]);
        var length = parseFloat(values[1]);
        bounceSlider.label.textContent = (length - 1) + " light bounces, capturing from bounce " + low;
        renderer.setMaxPathLength(length);
        renderer.setMinPathLength(low);
    })

    var sampleSlider = new tui.Slider("sample-count", 400, 700, true, function (exponent100) {
        var sampleCount = Math.floor(Math.pow(10, exponent100 * 0.01));
        this.setLabel(sampleCount + " light paths");
        renderer.setMaxSampleCount(sampleCount);
    });
    sampleSlider.setValue(600);

    var tmaxSlider = new tui.Slider("tmax", 10, renderer.maxTextureSize, true, function (numIntervals) {
        var tmax = renderer.deltaT * numIntervals;
        this.setLabel(tmax.toFixed(3) + " m");
        renderer.setMaxTime(tmax);
        changeInstantSlider();
    });

    var deltaTSlider = new tui.Slider("delta-t", 1, 250, true, function (mm) {
        this.setLabel(mm + " mm");
        renderer.setDeltaT(mm / 1000);
        tmaxSlider.setValue(renderer.numIntervals, false);
    });
    deltaTSlider.setValue(3);
    tmaxSlider.setValue(3333);

    this.saveImageData = false;
    document.getElementById('save-button').addEventListener('click', (function () {
        this.saveImageData = true;
    }).bind(this));

    this.playVideo = false;
    this.changePlayState = false;
    document.getElementById('play-button').addEventListener('click', (function () {
        this.changePlayState = true;
    }).bind(this));

    document.getElementById('add-button').addEventListener('click', (function () {
        modal.style.display = "block";
        hideSliderHandles();
    }).bind(this));

    function hideSliderHandles() {
        var handles = document.getElementsByClassName('slider-handle');
        for (var i = 0; i < handles.length; i++) {
            handles[i].style.visibility = 'hidden';
        }
        featureSizeSlider.sliderHandle.style.visibility = '';
        roughnessSlider.sliderHandle.style.visibility = '';
        wallRoughnessSlider.sliderHandle.style.visibility = '';
    }
    function showSliderHandles() {
        var handles = document.getElementsByClassName('slider-handle');
        for (var i = 0; i < handles.length; i++) {
            handles[i].style.visibility = '';
        }
    }

    // Get the modal
    var modal = document.getElementById("myModal");

    // Add configuration options for the new scene to the modal
    this.matType = 2;
    var matType = this.matType;
    var typeSelector = new tui.ButtonGroup("material-types", true, config.material_types, function (idx) {
        matType = 2 + idx;
    });
    typeSelector.select(0);

    this.wallMatType = genScene.MaterialType.Diffuse;
    var wallMatType = this.wallMatType;
    var wallTypeSelector = new tui.ButtonGroup("rwall-mat-types", true, ["Diffuse", "RoughMirror"], function (idx) {
        wallMatType = (idx == 0) ? genScene.MaterialType.Diffuse : genScene.MaterialType.RoughMirror;
    })
    wallTypeSelector.select(0);

    var NumFeatures = function (val) {
        this.value = val;
    }
    NumFeatures.prototype.setNFeatures = function (nFeatures) {
        this.value = nFeatures;
    }
    var nFeatures = new NumFeatures(1);
    var featureSizeSlider = new tui.Slider("feature-size", 1, 250, true, function (nf) {
        this.setLabel((250 / nf).toFixed(4) + " cm");
        nFeatures.setNFeatures(nf);
    });
    featureSizeSlider.setValue(1);

    var roughness = 0.01;
    var roughnessSlider = new tui.Slider("roughness-slider", 1, 200, true, function (alpha) {
        this.setLabel(alpha / 100);
        roughness = alpha / 100;
    });
    roughnessSlider.setValue(1);

    var wallRoughness = 0.5;
    var wallRoughnessSlider = new tui.Slider("rwall-roughness", 1, 200, true, function (alpha) {
        this.setLabel(alpha / 100);
        wallRoughness = alpha / 100;
    });
    wallRoughnessSlider.setValue(50);

    function getCoordinate(label) {
        var element = document.getElementById(label);
        var val = element.value;
        if (!val) val = element.placeholder;
        val = parseFloat(val);
        var min = parseFloat(element.min);
        var max = parseFloat(element.max);
        return Math.min(max, Math.max(min, val));
    }

    document.getElementById('create-button').addEventListener('click', (function () {
        var x1 = getCoordinate("x1");
        var x2 = getCoordinate("x2");
        var y1 = getCoordinate("y1");
        var y2 = getCoordinate("y2");
        var vertices = generator.generateVertices([x1, y1], [x2, y2], nFeatures.value);
        var matParams = [];
        if (matType === genScene.MaterialType.RoughMirror || matType === genScene.MaterialType.RoughDielectric) {
            matParams.push(roughness);
        } else if (matType === genScene.MaterialType.Diffuse) {
            matParams.push(0.5);
        }
        var wallMatParams = [0.5];
        if (wallMatType === genScene.MaterialType.RoughMirror || wallMatType === genScene.MaterialType.RoughDielectric) {
            wallMatParams = [wallRoughness];
        }
        var ids = generator.generate(vertices, matType, matParams, wallMatType, wallMatParams);
        config.scenes.push({ 'shader': ids[0], 'name': 'Custom scene ' + ids[1], 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': wallMatType });
        sceneSelector.addButton(config.scenes[config.scenes.length - 1].name);
        renderer.addScene(ids[0], vertices);
        modal.style.display = "none";
        showSliderHandles();
        sceneSelector.select(config.scenes.length - 1);
    }).bind(this));

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
        showSliderHandles();
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            showSliderHandles();
        }
    }

    selectScene(0);

    this.overlay.className = "render-help";
    this.overlay.offsetHeight; /* Flush CSS changes */
    this.overlay.className += " render-help-transition";
    this.overlay.textContent = "Click and drag!"
    this.overlay.addEventListener("mousedown", function (event) {
        this.parentNode.removeChild(this);
        mouseListener.mouseDown(event);
    });
}

Transient.prototype.fail = function (message) {
    var sorryP = document.createElement("p");
    sorryP.appendChild(document.createTextNode("Sorry! :("));
    sorryP.style.fontSize = "50px";

    var failureP = document.createElement("p");
    failureP.className = "warning-box";
    failureP.innerHTML = message;

    var errorImg = document.createElement("img");
    errorImg.title = errorImg.alt = "The Element of Failure";
    errorImg.src = "derp.gif";

    var failureDiv = document.createElement("div");
    failureDiv.className = "center";
    failureDiv.appendChild(sorryP);
    failureDiv.appendChild(errorImg);
    failureDiv.appendChild(failureP);

    document.getElementById("transient-content").appendChild(failureDiv);
    this.overlay.style.display = this.canvas.style.display = 'none';
}

Transient.prototype.renderLoop = function (timestamp) {
    window.requestAnimationFrame(this.boundRenderLoop);

    if (!this.renderer.finished())
        this.renderer.render(timestamp);
    else if (this.changePlayState) {
        this.playVideo = !this.playVideo;
        this.changePlayState = false;
        if (!this.playVideo)
            this.renderer.pause();
        else if (this.renderer.videoFinished())
            this.renderer.play(timestamp);
    } else if (this.playVideo) {
        if (this.renderer.videoFinished()) {
            this.playVideo = false;
            this.renderer.pause();
        } else
            this.renderer.play(timestamp);
    }

    if (this.saveImageData) {
        /* Ensure we redraw the image before we grab it. This is a strange one:
           To save power the renderer stops doing anything after it finished
           tracing rays, and the canvas keeps displaying the correct image
           (as you would expect). However, when we get the canvas as a blob,
           the results are garbage unless we rendered to it in that frame.
           There's most likely some browser/ANGLE meddling happening here, but
           in interest of my mental health I'm not going to dig deeper into this */
        //if (this.renderer.finished()) {
        // Now we are not rendering every frame, only when we reach the maximum length of each batch
        this.renderer.redraw();
        //}

        var fileName = "Transient";
        if (this.savedImages > 0)
            fileName += (this.savedImages + 1);
        fileName += ".png";

        this.canvas.toBlob(function (blob) { saveAs(blob, fileName); });

        this.savedImages++;
        this.saveImageData = false;
    }

    this.progressBar.setProgress(this.renderer.progress());
    this.progressBar.setLabel(Math.min(this.renderer.totalRaysTraced(), this.renderer.maxRayCount()) +
        "/" + this.renderer.maxRayCount() + " rays traced; Progress: " +
        this.progressBar.getProgressPercentage() + "%");
}