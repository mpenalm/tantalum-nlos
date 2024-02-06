var Shaders = {
    'blend-test-frag':
        '#include "preamble"\n\n'                                +

        'void main() {\n'                                        +
        '    gl_FragColor = vec4(vec3(7.0, 59.0, -7.0), 1.0);\n' +
        '}\n',

    'blend-test-pack-frag':
        '#include "preamble"\n\n'                                     +

        'uniform sampler2D Tex;\n\n'                                  +

        'void main() {\n'                                             +
        '    gl_FragColor = texture2D(Tex, vec2(0.5))*(1.0/255.0);\n' +
        '}\n',

    'blend-test-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n\n'             +

        'void main(void) {\n'                      +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '}\n',

    'bp-conf-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform float tmax;\n\n'                                                          +

        'uniform sampler2D radiance; // x time, y spad\n\n'                                +

        'uniform int useAbsolute; // To accumulate for the conventional camera\n'          +
        'uniform float isConfocalModel; // 1.0 for true, 0.0 for false\n'                  +
        'uniform float instant;\n'                                                         +
        'uniform vec2 laserPos;\n'                                                         +
        'uniform vec2 spadPos;\n'                                                          +
        'uniform sampler2D wallGrid; // laser and spad grid\n\n'                           +

        'uniform sampler2D planeGrid; // Plane to reconstruct\n'                           +
        '        // positions of the considered pixels, on a row\n\n'                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    float spadDist = 1.0 / float(numSpads);\n'                                    +
        '    float xSpad = spadDist / 2.0;\n\n'                                            +

        '    vec2 pixelPos = texture2D(planeGrid, vec2(mPos.x, 1.0 - mPos.y)).xy;\n'       +
        '    vec2 radianceAccum = vec2(0.0);\n'                                            +
        '    for (int i = 0; i < numSpads; i++) {\n'                                       +
        '        vec2 wallPos = texture2D(wallGrid, vec2(xSpad, 0.5)).xy;\n'               +
        '        float dlp = distance(wallPos, laserPos); // distance laser device to cap' +
                                                           'tured (illuminated) point\n'   +
        '        float dsp = distance(wallPos, spadPos); // distance spad device to captu' +
                                                                          'red points\n'   +
        '        float ds  = distance(wallPos, pixelPos); // distance captured (illuminat' +
                                                    'ed) point to reconstructed point\n'   +
        '        float dt = (1.0 + isConfocalModel) * ds + dsp + dlp + instant;\n\n'       +

        '        float t = dt / tmax;\n'                                                   +
        '        radianceAccum += texture2D(radiance, vec2(t, xSpad)).xy * vec2(t <= 1.0)' +
                                                                                   ';\n'   +
        '        xSpad += spadDist;\n'                                                     +
        '    }\n\n'                                                                        +

        '    gl_FragColor = vec4(length(radianceAccum) * float(useAbsolute) + radianceAcc' +
                                                     'um.x * float(1 - useAbsolute), \n'   +
        '            radianceAccum.y * float(1 - useAbsolute), 0.0, 1.0);\n'               +
        '}\n',

    'bp-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform float tmax;\n\n'                                                          +

        'uniform sampler2D radiance; // x time, y spad\n\n'                                +

        'uniform int useAbsolute; // To accumulate for the conventional camera\n'          +
        'uniform float lightIsLaser; // 1.0 for true, 0.0 for false\n'                     +
        'uniform float isConfocalModel; // 1.0 for true, 0.0 for false\n'                  +
        'uniform float instant;\n'                                                         +
        'uniform vec2 laserPos;\n'                                                         +
        'uniform vec2 laserGrid; // could be more than one, actually\n'                    +
        'uniform vec2 spadPos;\n'                                                          +
        'uniform sampler2D spadGrid;\n\n'                                                  +

        'uniform sampler2D planeGrid; // Plane to reconstruct\n'                           +
        '        // positions of the considered pixels, on a row\n\n'                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    float spadDist = 1.0 / float(numSpads);\n'                                    +
        '    float xSpad = spadDist / 2.0;\n\n'                                            +

        '    vec2 pixelPos = texture2D(planeGrid, vec2(mPos.x, 1.0 - mPos.y)).xy;\n'       +
        '    vec2 radianceAccum = vec2(0.0);\n'                                            +
        '    for (int i = 0; i < numSpads; i++) {\n'                                       +
        '        vec2 wallSpad = texture2D(spadGrid, vec2(xSpad, 0.5)).xy;\n'              +
        '        float dlp = distance(laserGrid, laserPos);\n'                             +
        '        float dl  = distance(laserGrid, pixelPos);\n'                             +
        '        float dsp = distance(wallSpad, spadPos); // distance spad device to capt' +
                                                                         'ured points\n'   +
        '        float ds  = distance(wallSpad, pixelPos);\n'                              +
        '        float dt = ds + dsp + dl * isConfocalModel + dlp * lightIsLaser + instan' +
                                                                                  't;\n\n' +

        '        float t = dt / tmax;\n'                                                   +
        '        radianceAccum += texture2D(radiance, vec2(t, xSpad)).xy * vec2(t <= 1.0)' +
                                                                                   ';\n'   +
        '        xSpad += spadDist;\n'                                                     +
        '    }\n'                                                                          +
        '    gl_FragColor = vec4(length(radianceAccum) * float(useAbsolute) + radianceAcc' +
                                                     'um.x * float(1 - useAbsolute), \n'   +
        '            radianceAccum.y * float(1 - useAbsolute), 0.0, 1.0);\n'               +
        '}\n',

    'bp-sum-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D radiance; // x time, y spad\n\n'                                +

        'uniform int numRows;\n'                                                           +
        'uniform int useAbsolute;\n'                                                       +
        'uniform vec2 numPixels;\n\n'                                                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    float x = floor(mPos.x * numPixels.x);\n'                                     +
        '    float y = floor(mPos.y * numPixels.y);\n'                                     +
        '    float npy = numPixels.y / float(numRows);\n'                                  +
        '    float yStart = (floor(y / npy) * 2.0 + 1.0) / float(numRows * 2); // 0.5 for' +
                          ' single row, for two rows: 0.25 for first, 0.75 for second\n'   +
        '    bool isSecond = (y >= npy) && (numRows == 2);\n'                              +
        '    y = mod(y, npy);\n'                                                           +
        '    float pos = x + numPixels.x * (npy - 1.0 - y);\n'                             +
        '    pos = (pos + 0.5) / (numPixels.x * npy);\n\n'                                 +

        '    float spadDist = 1.0 / float(numSpads);\n\n'                                  +

        '    vec2 radianceAccum = vec2(0.0);\n'                                            +
        '    for (int i = 0; i < 1; i++) {\n'                                              +
        '        radianceAccum += texture2D(radiance, vec2(pos, spadDist * (float(i) + yS' +
                                                                         'tart))).xy;\n'   +
        '    }\n\n'                                                                        +

        '    //radianceAccum.x = radianceAccum.x * float(1 - useAbsolute) + length(radian' +
                                                      'ceAccum) * float(useAbsolute);\n'   +
        '    //radianceAccum.y = radianceAccum.y * float(1 - useAbsolute);\n'              +
        '    float result = length(radianceAccum);\n\n'                                    +

        '    if (useAbsolute > 0) {\n'                                                     +
        '        gl_FragColor = vec4(result, 0.0, 0.0, 1.0);\n'                            +
        '    } else {\n'                                                                   +
        '        gl_FragColor = vec4(radianceAccum, 0.0, 1.0);\n'                          +
        '    }\n'                                                                          +
        '}\n',

    'bp-vert':
        '#include "preamble"\n\n'                       +

        'attribute vec2 Position;\n\n'                  +

        'varying vec2 mPos;\n\n'                        +

        'void main() {\n'                               +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n' +
        '    mPos = Position/2.0+vec2(0.5);\n'          +
        '}\n',

    'bsdf-rwall':
        'float coth(float x) {\n'                                                          +
        '    float e2x = exp(2.0 * x);\n'                                                  +
        '    return (e2x + 1.0) / (e2x - 1.0);\n'                                          +
        '}\n\n'                                                                            +

        'float sech2(float x) {\n'                                                         +
        '    float num = 2.0 * exp(x);\n'                                                  +
        '    float denom = 1.0 / (exp(2.0 * x) + 1.0);\n'                                  +
        '    return num*num * denom*denom;\n'                                              +
        '}\n\n'                                                                            +

        'float pdf(int matId, float cosTheta, float sigma) {\n'                            +
        '    if (cosTheta < 0.0) {\n'                                                      +
        '        return 0.0; // Not true for RoughDielectric, but for that the ior is nee' +
                                                                                 'ded\n'   +
        '    }\n'                                                                          +
        '    if (matId == 2) { // Diffuse\n'                                               +
        '        return cosTheta / 2.0;\n'                                                 +
        '    } else if (matId == 5) { // RoughMirror\n'                                    +
        '        float sigmaSq = sigma*sigma;\n'                                           +
        '        float invSigmaSq = 1.0/sigmaSq;\n'                                        +
        '        return 0.25*invSigmaSq * coth(PI*0.25*invSigmaSq) * sech2(acos(cosTheta)' +
                                                                   '*0.5*invSigmaSq);\n'   +
        '    } else {\n'                                                                   +
        '        return 0.0; // Not true for RoughDielectric, but for that the ior is nee' +
                                                                                 'ded\n'   +
        '    }\n'                                                                          +
        '}\n',

    'bsdf':
        'float sellmeierIor(vec3 b, vec3 c, float lambda) {\n'                             +
        '    float lSq = (lambda*1e-3)*(lambda*1e-3);\n'                                   +
        '    return 1.0 + dot((b*lSq)/(lSq - c), vec3(1.0));\n'                            +
        '}\n\n'                                                                            +

        'float tanh(float x) {\n'                                                          +
        '    if (abs(x) > 10.0) /* Prevent nasty overflow problems */\n'                   +
        '        return sign(x);\n'                                                        +
        '    float e = exp(-2.0*x);\n'                                                     +
        '    return (1.0 - e)/(1.0 + e);\n'                                                +
        '}\n'                                                                              +
        'float atanh(float x) {\n'                                                         +
        '    return 0.5*log((1.0 + x)/(1.0 - x));\n'                                       +
        '}\n\n'                                                                            +

        'float dielectricReflectance(float eta, float cosThetaI, out float cosThetaT) {\n' +
        '    float sinThetaTSq = eta*eta*(1.0 - cosThetaI*cosThetaI);\n'                   +
        '    if (sinThetaTSq > 1.0) {\n'                                                   +
        '        cosThetaT = 0.0;\n'                                                       +
        '        return 1.0;\n'                                                            +
        '    }\n'                                                                          +
        '    cosThetaT = sqrt(1.0 - sinThetaTSq);\n\n'                                     +

        '    float Rs = (eta*cosThetaI - cosThetaT)/(eta*cosThetaI + cosThetaT);\n'        +
        '    float Rp = (eta*cosThetaT - cosThetaI)/(eta*cosThetaT + cosThetaI);\n\n'      +

        '    return (Rs*Rs + Rp*Rp)*0.5;\n'                                                +
        '}\n\n'                                                                            +

        'vec2 sampleDiffuse(inout vec4 state, vec2 wi) {\n'                                +
        '    float x = rand(state)*2.0 - 1.0;\n'                                           +
        '    float y = sqrt(1.0 - x*x);\n'                                                 +
        '    return vec2(x, y*sign(wi.y));\n'                                              +
        '}\n'                                                                              +
        'vec2 sampleMirror(vec2 wi) {\n'                                                   +
        '    return vec2(-wi.x, wi.y);\n'                                                  +
        '}\n'                                                                              +
        'vec2 sampleDielectric(inout vec4 state, vec2 wi, float ior) {\n'                  +
        '    float cosThetaT;\n'                                                           +
        '    float eta = wi.y < 0.0 ? ior : 1.0/ior;\n'                                    +
        '    float Fr = dielectricReflectance(eta, abs(wi.y), cosThetaT);\n'               +
        '    if (rand(state) < Fr)\n'                                                      +
        '        return vec2(-wi.x, wi.y);\n'                                              +
        '    else\n'                                                                       +
        '        return vec2(-wi.x*eta, -cosThetaT*sign(wi.y));\n'                         +
        '}\n\n'                                                                            +

        'float sampleVisibleNormal(float sigma, float xi, float theta0, float theta1) {\n' +
        '    float sigmaSq = sigma*sigma;\n'                                               +
        '    float invSigmaSq = 1.0/sigmaSq;\n\n'                                          +

        '    float cdf0 = tanh(theta0*0.5*invSigmaSq);\n'                                  +
        '    float cdf1 = tanh(theta1*0.5*invSigmaSq);\n\n'                                +

        '    return 2.0*sigmaSq*atanh(cdf0 + (cdf1 - cdf0)*xi);\n'                         +
        '}\n'                                                                              +
        'vec2 sampleRoughMirror(inout vec4 state, vec2 wi, inout vec3 throughput, float s' +
                                                                             'igma) {\n'   +
        '    float theta = asin(clamp(wi.x, -1.0, 1.0));\n'                                +
        '    float theta0 = max(theta - PI_HALF, -PI_HALF);\n'                             +
        '    float theta1 = min(theta + PI_HALF,  PI_HALF);\n\n'                           +

        '    float thetaM = sampleVisibleNormal(sigma, rand(state), theta0, theta1);\n'    +
        '    vec2 m = vec2(sin(thetaM), cos(thetaM));\n'                                   +
        '    vec2 wo = m*(dot(wi, m)*2.0) - wi;\n'                                         +
        '    if (wo.y < 0.0)\n'                                                            +
        '        throughput = vec3(0.0);\n'                                                +
        '    return wo;\n'                                                                 +
        '}\n'                                                                              +
        'vec2 sampleRoughDielectric(inout vec4 state, vec2 wi, float sigma, float ior, ou' +
                                                                     't float wiDotN)\n'   +
        '{\n'                                                                              +
        '    float theta = asin(min(abs(wi.x), 1.0));\n'                                   +
        '    float theta0 = max(theta - PI_HALF, -PI_HALF);\n'                             +
        '    float theta1 = min(theta + PI_HALF,  PI_HALF);\n\n'                           +

        '    float thetaM = sampleVisibleNormal(sigma, rand(state), theta0, theta1);\n'    +
        '    vec2 m = vec2(sin(thetaM), cos(thetaM));\n\n'                                 +

        '    float wiDotM = dot(wi, m);\n'                                                 +
        '    wiDotN = wiDotM;\n\n'                                                         +

        '    float cosThetaT;\n'                                                           +
        '    float etaM = wiDotM < 0.0 ? ior : 1.0/ior;\n'                                 +
        '    float F = dielectricReflectance(etaM, abs(wiDotM), cosThetaT);\n'             +
        '    if (wiDotM < 0.0)\n'                                                          +
        '        cosThetaT = -cosThetaT;\n\n'                                              +

        '    if (rand(state) < F)\n'                                                       +
        '        return 2.0*wiDotM*m - wi;\n'                                              +
        '    else\n'                                                                       +
        '        return (etaM*wiDotM - cosThetaT)*m - etaM*wi;\n'                          +
        '}\n',

    'compose-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D Frame;\n'                                                       +
        'uniform float Exposure;\n\n'                                                      +

        'varying vec2 vTexCoord;\n\n'                                                      +

        'void main() {\n'                                                                  +
        '    gl_FragColor = vec4(pow(texture2D(Frame, vTexCoord).rgb*Exposure, vec3(1.0/2' +
                                                                         '.2)), 1.0);\n'   +
        '    //gl_FragColor = vec4(texture2D(Frame, vTexCoord).rgb, 1.0);\n'               +
        '}\n',

    'compose-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n'               +
        'attribute vec2 TexCoord;\n'               +
        'uniform sampler2D RgbData;\n\n'           +

        'varying vec2 vTexCoord;\n\n'              +

        'void main(void) {\n'                      +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '    vTexCoord = TexCoord;\n'              +
        '}\n',

    'csg-intersect':
        'struct Segment {\n'                                                                +
        '    float tNear, tFar;\n'                                                          +
        '    vec2  nNear, nFar;\n'                                                          +
        '};\n\n'                                                                            +

        'Segment segmentIntersection(Segment a, Segment b) {\n'                             +
        '    return Segment(\n'                                                             +
        '        max(a.tNear, b.tNear),\n'                                                  +
        '        min(a.tFar,  b.tFar),\n'                                                   +
        '        (a.tNear > b.tNear) ? a.nNear : b.nNear,\n'                                +
        '        (a.tFar  < b.tFar)  ? a.nFar  : b.nFar\n'                                  +
        '    );\n'                                                                          +
        '}\n'                                                                               +
        'Segment segmentSubtraction(Segment a, Segment b, float tMin) {\n'                  +
        '    if (a.tNear >= a.tFar || b.tNear >= b.tFar || a.tFar <= b.tNear || a.tNear >'  +
                                                                           '= b.tFar)\n'    +
        '        return a;\n\n'                                                             +

        '    Segment s1 = Segment(a.tNear, b.tNear, a.nNear, -b.nNear);\n'                  +
        '    Segment s2 = Segment(b.tFar,  a.tFar, -b.nFar,   a.nFar);\n'                   +
        '    bool valid1 = s1.tNear <= s1.tFar;\n'                                          +
        '    bool valid2 = s2.tNear <= s2.tFar;\n\n'                                        +

        '    if (valid1 && valid2) {\n'                                                     +
        '        if (s1.tFar >= tMin) return s1; else return s2;\n'                         +
        '    } else {\n'                                                                    +
        '        if (valid1) return s1; else return s2;\n'                                  +
        '    }\n'                                                                           +
        '}\n'                                                                               +
        'void segmentCollapse(Segment segment, float matId, inout Intersection isect) {\n'  +
        '    segment.tNear = max(segment.tNear, isect.tMin);\n'                             +
        '    segment.tFar  = min(segment.tFar,  isect.tMax);\n\n'                           +

        '    if (segment.tNear <= segment.tFar) {\n'                                        +
        '        if (segment.tNear > isect.tMin) {\n'                                       +
        '            isect.tMax = segment.tNear;\n'                                         +
        '            isect.n = segment.nNear;\n'                                            +
        '            isect.mat = matId;\n'                                                  +
        '        } else if (segment.tFar < isect.tMax) {\n'                                 +
        '            isect.tMax = segment.tFar;\n'                                          +
        '            isect.n = segment.nFar;\n'                                             +
        '            isect.mat = matId;\n'                                                  +
        '        }\n'                                                                       +
        '    }\n'                                                                           +
        '}\n\n'                                                                             +

        'Segment horzSpanIntersect(Ray ray, float y, float radius) {\n'                     +
        '    float dc = (y - ray.pos.y)*ray.invDir.y;\n'                                    +
        '    float dt = ray.dirSign.y*radius*ray.invDir.y;\n'                               +
        '    return Segment(dc - dt, dc + dt, vec2(0.0, -ray.dirSign.y), vec2(0.0, ray.di'  +
                                                                          'rSign.y));\n'    +
        '}\n'                                                                               +
        'Segment vertSpanIntersect(Ray ray, float x, float radius) {\n'                     +
        '    float dc = (x - ray.pos.x)*ray.invDir.x;\n'                                    +
        '    float dt = ray.dirSign.x*radius*ray.invDir.x;\n'                               +
        '    return Segment(dc - dt, dc + dt, vec2(-ray.dirSign.x, 0.0), vec2(ray.dirSign'  +
                                                                          '.x, 0.0));\n'    +
        '}\n'                                                                               +
        'Segment boxSegmentIntersect(Ray ray, vec2 center, vec2 radius) {\n'                +
        '    return segmentIntersection(\n'                                                 +
        '        horzSpanIntersect(ray, center.y, radius.y),\n'                             +
        '        vertSpanIntersect(ray, center.x, radius.x)\n'                              +
        '    );\n'                                                                          +
        '}\n'                                                                               +
        'Segment sphereSegmentIntersect(Ray ray, vec2 center, float radius) {\n'            +
        '    Segment result;\n\n'                                                           +

        '    vec2 p = ray.pos - center;\n'                                                  +
        '    float B = dot(p, ray.dir);\n'                                                  +
        '    float C = dot(p, p) - radius*radius;\n'                                        +
        '    float detSq = B*B - C;\n'                                                      +
        '    if (detSq >= 0.0) {\n'                                                         +
        '        float det = sqrt(detSq);\n'                                                +
        '        result.tNear = -B - det;\n'                                                +
        '        result.tFar  = -B + det;\n'                                                +
        '        result.nNear = (p + ray.dir*result.tNear)*(1.0/radius);\n'                 +
        '        result.nFar  = (p + ray.dir*result.tFar)*(1.0/radius);\n'                  +
        '    } else {\n'                                                                    +
        '        result.tNear =  1e30;\n'                                                   +
        '        result.tFar  = -1e30;\n'                                                   +
        '    }\n\n'                                                                         +

        '    return result;\n'                                                              +
        '}\n\n'                                                                             +

        'void biconvexLensIntersect(Ray ray, vec2 center, float h, float d, float r1, flo'  +
                                     'at r2, float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentIntersection(segmentIntersection(\n'                    +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        sphereSegmentIntersect(ray, center + vec2(r1 - d, 0.0), r1)),\n'           +
        '        sphereSegmentIntersect(ray, center - vec2(r2 - d, 0.0), r2)\n'             +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void biconcaveLensIntersect(Ray ray, vec2 center, float h, float d, float r1, fl'  +
                                    'oat r2, float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentSubtraction(segmentSubtraction(segmentIntersection(\n'  +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        vertSpanIntersect(ray, center.x + 0.5*(r2 - r1), 0.5*(abs(r1) + abs(r2))'  +
                                                                             ' + d)),\n'    +
        '        sphereSegmentIntersect(ray, center + vec2(r2 + d, 0.0), r2), isect.tMin)'  +
                                                                                   ',\n'    +
        '        sphereSegmentIntersect(ray, center - vec2(r1 + d, 0.0), r1), isect.tMin\n' +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void meniscusLensIntersect(Ray ray, vec2 center, float h, float d, float r1, flo'  +
                                     'at r2, float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentSubtraction(segmentIntersection(segmentIntersection(\n' +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        vertSpanIntersect(ray, center.x + 0.5*r2, 0.5*abs(r2) + d)),\n'            +
        '        sphereSegmentIntersect(ray, center + vec2(r1 - sign(r1)*d, 0.0), abs(r1)'  +
                                                                                 ')),\n'    +
        '        sphereSegmentIntersect(ray, center + vec2(r2 + sign(r2)*d, 0.0), abs(r2)'  +
                                                                       '), isect.tMin\n'    +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void planoConvexLensIntersect(Ray ray, vec2 center, float h, float d, float r, f'  +
                                             'loat matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentIntersection(\n'                                        +
        '        boxSegmentIntersect(ray, center, vec2(d, h)),\n'                           +
        '        sphereSegmentIntersect(ray, center + vec2(r - d, 0.0), abs(r))\n'          +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void planoConcaveLensIntersect(Ray ray, vec2 center, float h, float d, float r, '  +
                                            'float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentSubtraction(segmentIntersection(\n'                     +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        vertSpanIntersect(ray, center.x - 0.5*r, 0.5*abs(r) + d)),\n'              +
        '        sphereSegmentIntersect(ray, center - vec2(r + d, 0.0), abs(r)), isect.tM'  +
                                                                                  'in\n'    +
        '    ), matId, isect);\n'                                                           +
        '}\n',

    'geometry-frag':
        '#include "preamble"\n\n'      +

        'uniform vec4 uColor;\n\n'     +

        'void main() {\n'              +
        '    gl_FragColor = uColor;\n' +
        '}\n',

    'geometry-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n\n'             +

        'void main() {\n'                          +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '}\n',

    'h-conf-vert':
        '#include "preamble"\n'                                                            +
        '#include "bsdf-rwall"\n\n'                                                        +

        'uniform sampler2D PosDataA;\n'                                                    +
        'uniform sampler2D PosDataB;\n'                                                    +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeDataA;\n\n'                                                 +

        'uniform float tmax;\n'                                                            +
        'uniform float yNorm;\n'                                                           +
        'uniform float spadRadius;\n'                                                      +
        'uniform vec2 spadPos;   // Position of the physical spad device\n'                +
        'uniform vec2 SpadGrid;  // Position scanned by device and illuminated by laser\n' +
        'uniform vec2 SpadNormal;\n'                                                       +
        'uniform int matId;      // Id of the relay wall bsdf, 2 = diffuse, 5 = roughmirr' +
                                                        'or, no others should be used\n\n' +

        'attribute vec2 TexCoord;\n\n'                                                     +

        'varying vec3 vColor;\n\n'                                                         +

        'void main() {\n'                                                                  +
        '    gl_Position = vec4(vec3(-1.0), 1.0);\n\n'                                     +

        '    vec2 posA = texture2D(PosDataA, TexCoord.xy).xy;\n'                           +
        '    vec2 posB = texture2D(PosDataB, TexCoord.xy).xy;\n'                           +
        '    vec2 dir = posB - posA;\n'                                                    +
        '    float t0 = texture2D(TimeDataA, TexCoord.xy).x;\n'                            +
        '    float biasCorrection = clamp(length(dir)/max(abs(dir.x), abs(dir.y)), 1.0, 1' +
                                                                           '.414214);\n\n' +

        '    if (distance(posA, SpadGrid) <= spadRadius) {\n'                              +
        '        float t = t0 + distance(posA, spadPos); // Time needed to reach the sens' +
                                               'or, assuming vacuum and no occlusions\n'   +
        '        float x = t / tmax * 2.0 - 1.0;\n'                                        +
        '        float y = 2.0 * yNorm - 1.0;\n\n'                                         +

        '        vec2 dir = spadPos - posA;\n'                                             +
        '        float cosine = dot(SpadNormal, dir);\n'                                   +
        '        float p = pdf(matId, cosine, 0.5);\n\n'                                   +

        '        gl_PointSize = 1.0;\n'                                                    +
        '        gl_Position = vec4(x, y, 0.0, 1.0);\n'                                    +
        '        vColor = max(vec3(0.0), p * texture2D(RgbData, TexCoord.xy).rgb*biasCorr' +
                                                   'ection / vec3(2.0 * spadRadius));\n'   +
        '    }\n'                                                                          +
        '}\n',

    'h-frag':
        '#include "preamble"\n\n'                                                   +

        'varying vec3 vColor;\n\n'                                                  +

        'void main() {\n'                                                           +
        '    gl_FragColor = vec4((vColor.r+vColor.g+vColor.b)/3.0,0.0,0.0, 1.0);\n' +
        '}\n',

    'h-vert':
        '#include "preamble"\n'                                                            +
        '#include "bsdf-rwall"\n\n'                                                        +

        'uniform sampler2D PosDataA;\n'                                                    +
        'uniform sampler2D PosDataB;\n'                                                    +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeDataA;\n'                                                   +
        'uniform sampler2D SpadGrid;\n'                                                    +
        'uniform sampler2D SpadNormals;\n\n'                                               +

        'uniform float tmax;\n'                                                            +
        'uniform float spadRadius;\n'                                                      +
        'uniform vec2 spadPos;   // Position of the physical spad device\n'                +
        'uniform int matId;      // Id of the relay wall bsdf, 2 = diffuse, 5 = roughmirr' +
                                                        'or, no others should be used\n\n' +

        'attribute vec2 TexCoord;\n\n'                                                     +

        'varying vec3 vColor;\n\n'                                                         +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    gl_Position = vec4(vec3(-1.0), 1.0);\n\n'                                     +

        '    vec2 posA = texture2D(PosDataA, TexCoord.xy).xy;\n'                           +
        '    vec2 posB = texture2D(PosDataB, TexCoord.xy).xy;\n'                           +
        '    vec2 dir = posB - posA;\n'                                                    +
        '    float t0 = texture2D(TimeDataA, TexCoord.xy).x;\n'                            +
        '    float biasCorrection = clamp(length(dir)/max(abs(dir.x), abs(dir.y)), 1.0, 1' +
                                                                           '.414214);\n\n' +

        '    vec2 spadPoint;\n'                                                            +
        '    for (int i = 0; i < numSpads; i++) {\n'                                       +
        '        float y = (float(i) + 0.5) / float(numSpads);\n'                          +
        '        spadPoint = texture2D(SpadGrid, vec2(y, 0.5)).xy;\n\n'                    +

        '        if (distance(posA, spadPoint) <= spadRadius) {\n'                         +
        '            float t = t0 + distance(posA, spadPos); // Time needed to reach the ' +
                                           'sensor, assuming vacuum and no occlusions\n'   +
        '            float x = t / tmax * 2.0 - 1.0;\n'                                    +
        '            y = 2.0 * y - 1.0;\n\n'                                               +

        '            vec2 n = texture2D(SpadNormals, vec2(y, 0.5)).xy;\n'                  +
        '            vec2 dir = normalize(spadPos - posA);\n'                              +
        '            float cosine = dot(n, dir);\n'                                        +
        '            float p = pdf(matId, cosine, 0.5);\n\n'                               +

        '            gl_PointSize = 1.0;\n'                                                +
        '            gl_Position = vec4(x, y, 0.0, 1.0);\n'                                +
        '            vColor = max(vec3(0.0), p * texture2D(RgbData, TexCoord.xy).rgb*bias' +
                                               'Correction / vec3(2.0 * spadRadius));\n'   +
        '            break;\n'                                                             +
        '        }\n'                                                                      +
        '    }\n'                                                                          +
        '}\n',

    'init-frag':
        '#extension GL_EXT_draw_buffers : require\n'                                       +
        '#include "preamble"\n\n'                                                          +

        '#include "rand"\n\n'                                                              +

        'uniform sampler2D RngData;\n'                                                     +
        'uniform sampler2D Spectrum;\n'                                                    +
        'uniform sampler2D Emission;\n'                                                    +
        'uniform sampler2D ICDF;\n'                                                        +
        'uniform sampler2D PDF;\n'                                                         +
        'uniform vec2 EmitterPos;\n'                                                       +
        'uniform vec2 EmitterDir;\n'                                                       +
        'uniform float EmitterPower;\n'                                                    +
        'uniform float SpatialSpread;\n'                                                   +
        'uniform vec2 AngularSpread;\n\n'                                                  +

        'varying vec2 vTexCoord;\n\n'                                                      +

        'void main() {\n'                                                                  +
        '    vec4 state = texture2D(RngData, vTexCoord);\n\n'                              +

        '    float theta = AngularSpread.x + (rand(state) - 0.5)*AngularSpread.y;\n'       +
        '    vec2 dir = vec2(cos(theta), sin(theta));\n'                                   +
        '    vec2 pos = EmitterPos + (rand(state) - 0.5)*SpatialSpread*vec2(-EmitterDir.y' +
                                                                    ', EmitterDir.x);\n\n' +

        '    float randL = rand(state);\n'                                                 +
        '    float spectrumOffset = texture2D(ICDF, vec2(randL, 0.5)).r + rand(state)*(1.' +
                                                                           '0/256.0);\n'   +
        '    float lambda = 360.0 + (750.0 - 360.0)*spectrumOffset;\n'                     +
        '    vec3 rgb = EmitterPower\n'                                                    +
        '                    *texture2D(Emission, vec2(spectrumOffset, 0.5)).r\n'          +
        '                    *texture2D(Spectrum, vec2(spectrumOffset, 0.5)).rgb\n'        +
        '                    /texture2D(PDF,      vec2(spectrumOffset, 0.5)).r;\n\n'       +

        '    gl_FragData[0] = vec4(pos, dir);\n'                                           +
        '    gl_FragData[1] = state;\n'                                                    +
        '    gl_FragData[2] = vec4(rgb, lambda);\n'                                        +
        '}\n',

    'init-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n'               +
        'attribute vec2 TexCoord;\n\n'             +

        'varying vec2 vTexCoord;\n\n'              +

        'void main() {\n'                          +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '    vTexCoord = TexCoord;\n'              +
        '}\n',

    'intersect':
        'void bboxIntersect(Ray ray, vec2 center, vec2 radius, float matId, inout Interse' +
                                                                      'ction isect) {\n'   +
        '    vec2 pos = ray.pos - center;\n'                                               +
        '    float tx1 = (-radius.x - pos.x)*ray.invDir.x;\n'                              +
        '    float tx2 = ( radius.x - pos.x)*ray.invDir.x;\n'                              +
        '    float ty1 = (-radius.y - pos.y)*ray.invDir.y;\n'                              +
        '    float ty2 = ( radius.y - pos.y)*ray.invDir.y;\n\n'                            +

        '    float minX = min(tx1, tx2), maxX = max(tx1, tx2);\n'                          +
        '    float minY = min(ty1, ty2), maxY = max(ty1, ty2);\n\n'                        +

        '    float tmin = max(isect.tMin, max(minX, minY));\n'                             +
        '    float tmax = min(isect.tMax, min(maxX, maxY));\n\n'                           +

        '    if (tmax >= tmin) {\n'                                                        +
        '        isect.tMax = (tmin == isect.tMin) ? tmax : tmin;\n'                       +
        '        isect.n = isect.tMax == tx1 ? vec2(-1.0, 0.0) : isect.tMax == tx2 ? vec2' +
                                                                        '(1.0, 0.0) :\n'   +
        '                  isect.tMax == ty1 ? vec2( 0.0, 1.0) :                     vec2' +
                                                                         '(0.0, 1.0);\n'   +
        '        isect.mat = matId;\n'                                                     +
        '    }\n'                                                                          +
        '}\n'                                                                              +
        'void sphereIntersect(Ray ray, vec2 center, float radius, float matId, inout Inte' +
                                                                   'rsection isect) {\n'   +
        '    vec2 p = ray.pos - center;\n'                                                 +
        '    float B = dot(p, ray.dir);\n'                                                 +
        '    float C = dot(p, p) - radius*radius;\n'                                       +
        '    float detSq = B*B - C;\n'                                                     +
        '    if (detSq >= 0.0) {\n'                                                        +
        '        float det = sqrt(detSq);\n'                                               +
        '        float t = -B - det;\n'                                                    +
        '        if (t <= isect.tMin || t >= isect.tMax)\n'                                +
        '            t = -B + det;\n'                                                      +
        '        if (t > isect.tMin && t < isect.tMax) {\n'                                +
        '            isect.tMax = t;\n'                                                    +
        '            isect.n = normalize(p + ray.dir*t);\n'                                +
        '            isect.mat = matId;\n'                                                 +
        '        }\n'                                                                      +
        '    }\n'                                                                          +
        '}\n'                                                                              +
        'void lineIntersect(Ray ray, vec2 a, vec2 b, float matId, inout Intersection isec' +
                                                                                't) {\n'   +
        '    vec2 sT = b - a;\n'                                                           +
        '    vec2 sN = vec2(-sT.y, sT.x);\n'                                               +
        '    float t = dot(sN, a - ray.pos)/dot(sN, ray.dir);\n'                           +
        '    float u = dot(sT, ray.pos + ray.dir*t - a);\n'                                +
        '    if (t < isect.tMin || t >= isect.tMax || u < 0.0 || u > dot(sT, sT))\n'       +
        '        return;\n\n'                                                              +

        '    isect.tMax = t;\n'                                                            +
        '    isect.n = normalize(sN);\n'                                                   +
        '    isect.mat = matId;\n'                                                         +
        '}\n'                                                                              +
        'void prismIntersect(Ray ray, vec2 center, float radius, float matId, inout Inter' +
                                                                    'section isect) {\n'   +
        '    lineIntersect(ray, center + vec2(   0.0,  1.0)*radius, center + vec2( 0.866,' +
                                                       ' -0.5)*radius, matId, isect);\n'   +
        '    lineIntersect(ray, center + vec2( 0.866, -0.5)*radius, center + vec2(-0.866,' +
                                                       ' -0.5)*radius, matId, isect);\n'   +
        '    lineIntersect(ray, center + vec2(-0.866, -0.5)*radius, center + vec2(   0.0,' +
                                                       '  1.0)*radius, matId, isect);\n'   +
        '}\n',

    'lap-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D radiance;\n'                                                    +
        'uniform float Aspect;\n\n'                                                        +

        'uniform vec2 numPixels;\n\n'                                                      +

        'const int kernelWidth = 3;\n'                                                     +
        'uniform float kernel[kernelWidth*kernelWidth];\n\n'                               +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    if (mPos.x > 1.0) {\n'                                                        +
        '        gl_FragColor = vec4(vec3(0.0), 1.0);\n'                                   +
        '    } else {\n\n'                                                                 +

        '        float acc = 0.0;\n'                                                       +
        '        vec2 ps = 1.0 / numPixels;\n'                                             +
        '        vec2 kps = vec2(Aspect / float(kernelWidth), 1.0 / float(kernelWidth)); ' +
                                                                '// kernel pixel size\n\n' +

        '        for (int i = 0; i < kernelWidth*kernelWidth; i++){\n'                     +
        '            vec2 d = -vec2(kernelWidth / 2);\n'                                   +
        '            d.x += (i == 0 || i == 3 || i == 6) ? 0.0 : (i == 1 || i == 4 || i =' +
                                                                   '= 7) ? 1.0 : 2.0;\n'   +
        '            d.y += float(i / kernelWidth);\n'                                     +
        '            vec2 posTex = mPos + d * ps;\n'                                       +
        '            acc += kernel[i] * texture2D(radiance, posTex).x * float(posTex.x >=' +
                     ' 0.0 && posTex.x <= 1.0 && posTex.y >= 0.0 && posTex.y <= 1.0);\n'   +
        '        }\n\n'                                                                    +

        '        gl_FragColor = vec4(acc, 0.0, 0.0, 1.0);\n'                               +
        '    }\n'                                                                          +
        '}\n',

    'log-frag':
        '#include "preamble"\n\n'                                                          +

        '// our texture\n'                                                                 +
        'uniform sampler2D u_image;\n\n'                                                   +

        '#define KERNEL_SIZE 45\n'                                                         +
        'uniform vec2 u_textureSize;\n'                                                    +
        '//uniform float u_kernel[KERNEL_SIZE*KERNEL_SIZE];\n'                             +
        'uniform sampler2D u_kernel;\n\n'                                                  +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '	// vec2 textCoord = gl_FragCoord.xy / u_textureSize;\n'                          +
        '	vec2 vertPixel = vec2(1.0, 0.0) / u_textureSize;\n'                              +
        '	vec2 horPixel  = vec2(0.0, 1.0) / u_textureSize;\n'                              +
        '	vec2 kernVertPixel = vec2(1.0, 0.0) / float(KERNEL_SIZE);\n'                     +
        '	vec2 kernHorPixel  = vec2(0.0, 1.0) / float(KERNEL_SIZE);\n\n'                   +

        '	vec4 meanColor = vec4(0);\n'                                                     +
        '	int ms = KERNEL_SIZE / 2;\n'                                                     +
        '	for (int i = 0; i < KERNEL_SIZE; i++) {\n'                                       +
        '		for (int j = 0; j < KERNEL_SIZE; j++) {\n'                                      +
        '			vec2 texPos = mPos + horPixel*vec2(i - ms) + vertPixel*vec2(j - ms);\n'        +
        '			//meanColor += texture2D(u_image, mPos + horPixel*vec2(i - ms) + vertPixel*ve' +
                                              'c2(j - ms))*u_kernel[i*KERNEL_SIZE+j];\n'   +
        '			meanColor += texture2D(u_image, texPos) *\n'                                   +
        '				texture2D(u_kernel, kernHorPixel*vec2(i) + kernVertPixel*vec2(j)).x *\n'      +
        '				vec4(texPos.x >= 0.0 && texPos.x <= 1.0 && texPos.y >= 0.0 && texPos.y <= 1.' +
                                           '0); // outside pixels have invalid values\n'   +
        '		}\n'                                                                            +
        '	}\n'                                                                             +
        '	gl_FragColor = abs(meanColor);\n'                                                +
        '}\n',

    'max-frag':
        '#include "preamble"\n\n'                                                          +

        '// Inspired from https://github.com/regl-project/regl/blob/gh-pages/example/redu' +
                                                                            'ction.js\n\n' +

        'uniform sampler2D tex;\n'                                                         +
        'uniform int useSameChannel;\n'                                                    +
        'uniform int isComplex;\n'                                                         +
        'uniform vec2 numPixels; // Original width and height\n'                           +
        'varying vec2 mPos;\n\n'                                                           +

        'void main () {\n'                                                                 +
        '	vec2 intervalSize = 1.0 / numPixels; // Width and height of each pixel in tex\n' +
        '	float result;\n'                                                                 +
        '	float result2;\n'                                                                +
        '	vec2 np = floor(numPixels / 2.0);\n'                                             +
        '	float x = floor(mPos.x * np.x);\n'                                               +
        '    float y = floor(mPos.y * np.y);\n'                                            +
        '	bool oddX = (numPixels.x > 1.0) && (floor(numPixels.x / 2.0) < (numPixels.x / 2' +
                                                                               '.0));\n'   +
        '	bool oddY = (numPixels.y > 1.0) && (floor(numPixels.y / 2.0) < (numPixels.y / 2' +
                                                                               '.0));\n\n' +

        '	if (isComplex == 0) {\n'                                                         +
        '			// Not a complex number\n'                                                     +
        '		// mPos are the coordinates of the center of the new pixel\n'                   +
        '		// this is also the shared vertex of the old pixels we want to compare\n'       +
        '		// => access the center of those pixels\n'                                      +
        '		float a = texture2D(tex, mPos + intervalSize * vec2(-0.5)).x;\n'                +
        '		float b = texture2D(tex, mPos + intervalSize * vec2(0.5)).x;\n'                 +
        '		float c = texture2D(tex, mPos + intervalSize * vec2(-0.5, 0.5)).x;\n'           +
        '		float d = texture2D(tex, mPos + intervalSize * vec2(0.5, -0.5)).x;\n'           +
        '		result = max(max(a, b), max(c, d));\n'                                          +
        '		result2 = min(min(a, b), min(c, d)) * float(useSameChannel);\n\n'               +

        '		a = texture2D(tex, mPos + intervalSize * vec2(-0.5)).y;\n'                      +
        '		b = texture2D(tex, mPos + intervalSize * vec2(0.5)).y;\n'                       +
        '		c = texture2D(tex, mPos + intervalSize * vec2(-0.5, 0.5)).y;\n'                 +
        '		d = texture2D(tex, mPos + intervalSize * vec2(0.5, -0.5)).y;\n'                 +
        '		result2 += min(min(a, b), min(c, d)) * abs(float(1-useSameChannel));\n\n'       +

        '		if (oddX) {\n'                                                                  +
        '			// Odd number of pixels in X dimension, add the last one to the last result\n' +
        '			if (x == np.x - 1.0) {\n'                                                      +
        '				a = texture2D(tex, mPos + intervalSize * vec2(1.5, 0.5)).x;\n'                +
        '				b = texture2D(tex, mPos + intervalSize * vec2(1.5, -0.5)).x;\n'               +
        '				c = texture2D(tex, mPos + intervalSize * vec2(1.5, 0.5)).y;\n'                +
        '				d = texture2D(tex, mPos + intervalSize * vec2(1.5, -0.5)).y;\n'               +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b)) * float(useSameChannel) + min(result2, min' +
                                             '(c, d)) * abs(float(1-useSameChannel));\n'   +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddY) {\n'                                                                  +
        '			// Odd number of pixels in Y dimension, add the last one to the last result\n' +
        '			if (y == np.y - 1.0) {\n'                                                      +
        '				a = texture2D(tex, mPos + intervalSize * vec2(0.5, 1.5)).x;\n'                +
        '				b = texture2D(tex, mPos + intervalSize * vec2(-0.5, 1.5)).x;\n'               +
        '				c = texture2D(tex, mPos + intervalSize * vec2(0.5, 1.5)).y;\n'                +
        '				d = texture2D(tex, mPos + intervalSize * vec2(-0.5, 1.5)).y;\n'               +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b)) * float(useSameChannel) + min(result2, min' +
                                             '(c, d)) * abs(float(1-useSameChannel));\n'   +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddX && oddY) {\n'                                                          +
        '			// Odd number of pixels in both dimensions, add the original corner to the ne' +
                                                                           'w corner \n'   +
        '				if ((x == np.x - 1.0) && (y == np.y - 1.0)) {\n'                              +
        '				a = texture2D(tex, mPos + intervalSize * vec2(1.5)).x;\n'                     +
        '				b = texture2D(tex, mPos + intervalSize * vec2(1.5)).y;\n'                     +
        '				result = max(result, a);\n'                                                   +
        '				result2 = min(result2, a) * float(useSameChannel) + min(result2, b) * abs(fl' +
                                                             'oat(1-useSameChannel));\n'   +
        '			}\n'                                                                           +
        '		}\n'                                                                            +
        '	} else {\n'                                                                      +
        '			// Complex number, we are looking for the max module (length)\n'               +
        '		// mPos are the coordinates of the center of the new pixel\n'                   +
        '		// this is also the shared vertex of the old pixels we want to compare\n'       +
        '		// => access the center of those pixels\n'                                      +
        '		float a = length(texture2D(tex, mPos + intervalSize * vec2(-0.5)).xy);\n'       +
        '		float b = length(texture2D(tex, mPos + intervalSize * vec2(0.5)).xy);\n'        +
        '		float c = length(texture2D(tex, mPos + intervalSize * vec2(-0.5, 0.5)).xy);\n'  +
        '		float d = length(texture2D(tex, mPos + intervalSize * vec2(0.5, -0.5)).xy);\n'  +
        '		result = max(max(a, b), max(c, d));\n'                                          +
        '		result2 = min(min(a, b), min(c, d));\n\n'                                       +

        '		if (oddX) {\n'                                                                  +
        '			// Odd number of pixels in X dimension, add the last one to the last result\n' +
        '			if (x == np.x - 1.0) {\n'                                                      +
        '				a = length(texture2D(tex, mPos + intervalSize * vec2(1.5, 0.5)).xy);\n'       +
        '				b = length(texture2D(tex, mPos + intervalSize * vec2(1.5, -0.5)).xy);\n'      +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b));\n'                                         +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddY) {\n'                                                                  +
        '			// Odd number of pixels in Y dimension, add the last one to the last result\n' +
        '			if (y == np.y - 1.0) {\n'                                                      +
        '				a = length(texture2D(tex, mPos + intervalSize * vec2(0.5, 1.5)).xy);\n'       +
        '				b = length(texture2D(tex, mPos + intervalSize * vec2(-0.5, 1.5)).xy);\n'      +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b));\n'                                         +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddX && oddY) {\n'                                                          +
        '			// Odd number of pixels in both dimensions, add the original corner to the ne' +
                                                                           'w corner \n'   +
        '				if ((x == np.x - 1.0) && (y == np.y - 1.0)) {\n'                              +
        '				a = length(texture2D(tex, mPos + intervalSize * vec2(1.5)).xy);\n'            +
        '				result = max(result, a);\n'                                                   +
        '				result2 = min(result2, a);\n'                                                 +
        '			}\n'                                                                           +
        '		}\n'                                                                            +
        '	}\n\n'                                                                           +

        '	gl_FragColor = vec4(result, result2, oddY && (y == np.y - 1.0), 1.0);\n'         +
        '	// gl_FragColor = vec4(mPos, oddX && (x == np.x - 1.0), 1.0);\n'                 +
        '}\n',

    'max-vert':
        '#include "preamble"\n\n'                                                          +

        'attribute vec2 Position;\n\n'                                                     +

        'uniform vec2 numPixels;\n\n'                                                      +

        'varying vec2 mPos;\n\n'                                                           +

        'void main() {\n'                                                                  +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n'                                    +
        '    mPos = (Position/2.0+vec2(0.5));\n\n'                                         +

        '    if (numPixels.x > 1.0 && floor(numPixels.x / 2.0) < (numPixels.x / 2.0)) {\n' +
        '        // Odd number of pixels in X dimension\n'                                 +
        '        mPos.x *= (numPixels.x - 1.0) / numPixels.x;\n'                           +
        '    }\n'                                                                          +
        '    if (numPixels.y > 1.0 && floor(numPixels.y / 2.0) < (numPixels.y / 2.0)) {\n' +
        '        // Odd number of pixels in Y dimension\n'                                 +
        '        mPos.y *= (numPixels.y - 1.0) / numPixels.y;\n'                           +
        '    }\n'                                                                          +
        '}\n',

    'pass-frag':
        '#include "preamble"\n\n'                                          +

        'uniform sampler2D Frame;\n\n'                                     +

        'varying vec2 vTexCoord;\n\n'                                      +

        'void main() {\n'                                                  +
        '    gl_FragColor = vec4(texture2D(Frame, vTexCoord).rgb, 1.0);\n' +
        '}\n',

    'pf-conv-frag':
        '#include "preamble"\n\n'                                                          +

        '// our texture\n'                                                                 +
        'uniform sampler2D u_impulse;\n'                                                   +
        'uniform sampler2D u_kernel;\n\n'                                                  +

        '#define KERNEL_SIZE {numIntervals}\n'                                             +
        '#define KERNEL_INTERVAL 1.0 / {numIntervals}.0\n'                                 +
        '#define KERNEL_START_IDX 0.5 + KERNEL_INTERVAL / 2.0\n\n'                         +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '	vec4 meanColor = vec4(0);\n'                                                     +
        '	float j = floor(mPos.x * float(KERNEL_SIZE)) + float(KERNEL_SIZE / 2);\n'        +
        '	for (int i = 0; i < KERNEL_SIZE; i++) {\n'                                       +
        '        float impIdx = (float(i) + 0.5) * KERNEL_INTERVAL;\n'                     +
        '		float knlIdx = ((j - float(i)) + 0.5) * KERNEL_INTERVAL;\n'                     +
        '		float impulsePixel = texture2D(u_impulse, vec2(impIdx, mPos.y)).x;\n'           +
        '		meanColor += vec4(impulsePixel, impulsePixel, 0.0, 1.0) *\n'                    +
        '            texture2D(u_kernel, vec2(knlIdx, 0.5)) * vec4(knlIdx > 0.0 && knlIdx' +
                                                                            ' < 1.0);\n'   +
        '	}\n\n'                                                                           +

        '	gl_FragColor = meanColor;\n'                                                     +
        '}\n',

    'pf-filter-frag':
        '#include "preamble"\n\n'                                                       +

        'uniform sampler2D radiance;\n'                                                 +
        'uniform sampler2D timeTex;\n\n'                                                +

        'uniform float deltaT;\n'                                                       +
        'uniform float wl;\n'                                                           +
        'uniform float sigma;\n'                                                        +
        'uniform int numIntervals;\n\n'                                                 +

        'varying vec2 mPos;\n\n'                                                        +

        'void main() {\n'                                                               +
        '    float t = texture2D(timeTex, vec2(mPos.x, 0.5)).x;\n'                      +
        '    float tmax = deltaT * float(numIntervals);\n\n'                            +

        '    //float pf = exp(-(t-tmax/2.0) * (t-tmax/2.0) / (2*sigma*sigma)) *\n'      +
        '    //    exp(2i * pi / wl * t);\n\n'                                          +

        '    float realPart = exp(-(t-tmax/2.0) * (t-tmax/2.0) / (2.0*sigma*sigma));\n' +
        '    float imagExp = 2.0 * PI / wl * t;\n\n'                                    +

        '    vec2 baseImag = vec2(cos(imagExp), sin(imagExp));\n\n'                     +

        '    vec2 pf = realPart * baseImag;\n\n'                                        +

        '    gl_FragColor = vec4(pf, 0.0, 0.0);\n'                                      +
        '}\n',

    'plot-frag':
        '#include "preamble"\n\n'                                     +

        '//uniform sampler2D function;\n\n'                           +

        '//uniform float width;\n\n'                                  +

        'varying vec2 mPos;\n\n'                                      +

        'void main() {\n'                                             +
        '    /*gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n'            +
        '    float x = mPos.x / 4.0 + 0.375;\n'                       +
        '    float y = (mPos.y - 0.5) * 2.0;\n'                       +
        '    vec2 value = texture2D(function, vec2(x, mPos.y)).xy;\n' +
        '    if (abs(y - value.x) < width) {\n'                       +
        '        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n'          +
        '    } else if (abs(y - value.y) < width) {\n'                +
        '        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'          +
        '    }*/\n'                                                   +
        '    gl_FragColor = vec4(1.0);\n'                             +
        '}\n',

    'preamble':
        '#define PI      3.1415926536\n'   +
        '#define PI_HALF 1.5707963268\n\n' +

        'precision highp float;\n',

    'rand':
        'float rand(float x) {\n'                                                  +
        '    // https://thebookofshaders.com/10/\n'                                +
        '    return fract(sin(x)*100000.0);\n'                                     +
        '}\n\n'                                                                    +

        'float rand(inout vec4 state) {\n'                                         +
        '    const vec4 q = vec4(   1225.0,    1585.0,    2457.0,    2098.0);\n'   +
        '    const vec4 r = vec4(   1112.0,     367.0,      92.0,     265.0);\n'   +
        '    const vec4 a = vec4(   3423.0,    2646.0,    1707.0,    1999.0);\n'   +
        '    const vec4 m = vec4(4194287.0, 4194277.0, 4194191.0, 4194167.0);\n\n' +

        '    vec4 beta = floor(state/q);\n'                                        +
        '    vec4 p = a*(state - beta*q) - beta*r;\n'                              +
        '    beta = (1.0 - sign(p))*0.5*m;\n'                                      +
        '    state = p + beta;\n'                                                  +
        '    return fract(dot(state/m, vec4(1.0, -1.0, 1.0, -1.0)));\n'            +
        '}\n',

    'ray-frag':
        '#include "preamble"\n\n'                 +

        'varying vec3 vColor;\n'                  +
        'varying vec3 vTexCoord;\n'               +
        'varying float t0;\n'                     +
        'varying float t1;\n'                     +
        'varying vec2 vPosition;\n'               +
        'varying vec2 posA;\n'                    +
        'varying vec2 posB;\n\n'                  +

        'void main() {\n'                         +
        '    gl_FragColor = vec4(vColor, 1.0);\n' +
        '}\n',

    'ray-vert':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D PosDataA;\n'                                                    +
        'uniform sampler2D PosDataB;\n'                                                    +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeDataA;\n'                                                   +
        'uniform sampler2D TimeDataB;\n'                                                   +
        'uniform float Aspect;\n\n'                                                        +

        'attribute vec3 TexCoord;\n\n'                                                     +

        'varying vec3 vColor;\n'                                                           +
        'varying vec3 vTexCoord;\n'                                                        +
        'varying float t0;\n'                                                              +
        'varying float t1;\n'                                                              +
        'varying vec2 vPosition;\n'                                                        +
        'varying vec2 posA;\n'                                                             +
        'varying vec2 posB;\n\n'                                                           +

        'void main() {\n'                                                                  +
        '    posA = texture2D(PosDataA, TexCoord.xy).xy;\n'                                +
        '    posB = texture2D(PosDataB, TexCoord.xy).xy;\n'                                +
        '    vec2 pos = mix(posA, posB, TexCoord.z);\n'                                    +
        '    vec2 dir = posB - posA;\n'                                                    +
        '    t0 = texture2D(TimeDataA, TexCoord.xy).x;\n'                                  +
        '    t1 = texture2D(TimeDataB, TexCoord.xy).x;\n'                                  +
        '    float biasCorrection = clamp(length(dir)/max(abs(dir.x), abs(dir.y)), 1.0, 1' +
                                                                           '.414214);\n\n' +

        '    gl_Position = vec4(pos.x/Aspect, pos.y, 0.0, 1.0);\n'                         +
        '    vPosition = pos;\n'                                                           +
        '    vColor = texture2D(RgbData, TexCoord.xy).rgb*biasCorrection;\n'               +
        '    vTexCoord = TexCoord;\n'                                                      +
        '}\n',

    'ruler-frag':
        '#include "preamble"\n\n'                        +

        'uniform sampler2D u_ruler;\n\n'                 +

        'varying vec2 mPos;\n\n'                         +

        'void main() {\n'                                +
        '    gl_FragColor = texture2D(u_ruler, mPos);\n' +
        '}\n',

    'ruler-vert':
        '#include "preamble"\n\n'                                              +

        'attribute vec2 Position;\n'                                           +
        'attribute vec2 TexCoord;\n'                                           +
        'uniform float Aspect;\n\n'                                            +

        'varying vec2 mPos;\n\n'                                               +

        'void main() {\n'                                                      +
        '    gl_Position = vec4(Position.x / Aspect, Position.y, 1.0, 1.0);\n' +
        '    mPos = TexCoord;\n'                                               +
        '}\n',

    'rwall-frag':
        '#include "preamble"\n\n'                                                           +

        'uniform float numSpads;\n'                                                         +
        'uniform float spadRadius;\n'                                                       +
        'uniform float aspect;\n'                                                           +
        'uniform vec2 firstSpad;\n'                                                         +
        'uniform vec2 lastSpad;\n'                                                          +
        'uniform vec4 uColor;\n\n'                                                          +

        'varying vec2 mPos;\n\n'                                                            +

        'void main() {\n'                                                                   +
        '    float r = spadRadius;\n'                                                       +
        '    gl_FragColor = vec4(0.0);\n'                                                   +
        '    vec2 coord;\n'                                                                 +
        '    coord.x = (mPos.x * 2.0 - 1.0) * aspect;\n'                                    +
        '    coord.y = mPos.y * 2.0 - 1.0;\n'                                               +
        '    float top = firstSpad.y + r;\n'                                                +
        '    float bottom = lastSpad.y - r;\n'                                              +
        '    float left = min(firstSpad.x, lastSpad.x) - r;\n'                              +
        '    float right = max(firstSpad.x, lastSpad.x) + r;\n'                             +
        '    vec2 scanSize = firstSpad - lastSpad;\n'                                       +
        '    vec2 normCoord = (coord - lastSpad) / scanSize;\n'                             +
        '    float n = floor(normCoord.y * (numSpads - 1.0) + 0.5);\n'                      +
        '    if (n >= 0.0 && n < numSpads && \n'                                            +
        '            distance(coord, lastSpad + scanSize / (numSpads - 1.0) * n) <= r) {\n' +
        '        gl_FragColor = uColor;\n'                                                  +
        '    }\n'                                                                           +
        '}\n',

    'scene-base':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 1.0, isect);\n'           +
        '    // fill\n'                                                                    +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        // Bounding box\n'                                                        +
        '        throughput = vec3(0.0);\n'                                                +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '        // Relay wall\n'                                                          +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        // fill\n'                                                                +
        '    }\n'                                                                          +
        '}\n',

    'scene1':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n'                                                           +
        '#include "csg-intersect"\n\n'                                                     +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    biconvexLensIntersect   (ray, vec2(-0.4, 0.0), 0.375, 0.15,   0.75, 0.75, 1.' +
                                                                          '0, isect);\n'   +
        '    biconcaveLensIntersect  (ray, vec2( 0.4, 0.0), 0.375, 0.0375, 0.75, 0.75, 1.' +
                                                                          '0, isect);\n'   +
        '    planoConvexLensIntersect(ray, vec2(-1.2, 0.0), 0.375, 0.075,  0.75,       1.' +
                                                                          '0, isect);\n'   +
        '    meniscusLensIntersect   (ray, vec2( 0.8, 0.0), 0.375, 0.15,   0.45, 0.75, 1.' +
                                                                          '0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                         '96, 147.4688), lambda)/1.4;\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene10':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.0, 0.2), vec2(0.0, -0.2), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene11':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.0, 0.2), vec2(0.0, -0.2), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.0, 0.2), vec2(0.2, 0.54641), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(-0.2, -0.54641), vec2(0.0, -0.2), 0.0, isect);\n'     +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.8);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene12':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.4,  0.3), vec2(0.4, 1.3), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.7,  1.6), vec2(1.2, 1.1), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene13':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.4,  0.1), vec2(0.4, 0.8), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(1.0,  1.1), vec2(1.2, 0.7), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene14':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.4, 0.2), vec2(0.4, -0.2), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene15':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.6, 0.3), vec2(0.45, -0.3), 0.0, isect);\n'          +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene16':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2,  0.0), 0.0, isect);\n'          +
        '    lineIntersect(ray, vec2(0.3, -0.2), vec2(0.5, -0.8), 0.0, isect);\n'          +
        '    lineIntersect(ray, vec2(-0.1, 0.1), vec2(1.3,  0.1), 0.0, isect);\n'          +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene17':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n\n'              +

        '    // Relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(-1.0, 0.0), vec2(0.0, 0.0), 0.0, isect);\n\n'         +

        '    // Mirror\n'                                                                  +
        '    lineIntersect(ray, vec2(-0.25, 0.75), vec2(0.75, 0.75), 0.0, isect);\n\n'     +

        '    // Hidden object\n'                                                           +
        '    lineIntersect(ray, vec2(1.05, -0.45), vec2(1.45, -0.05), 0.0, isect);\n'      +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene18':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n\n'              +

        '    // Relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2,  -0.2), 0.0, isect);\n\n'       +

        '    // Mirror\n'                                                                  +
        '    lineIntersect(ray, vec2(0.4, -0.6), vec2(0.4, 0.2), 0.0, isect);\n\n'         +

        '    // Hidden object\n'                                                           +
        '    lineIntersect(ray, vec2(1.2, 1.0), vec2(1.6, 0.6), 0.0, isect);\n'            +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.8);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene19':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n\n'              +

        '    // Relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2,  -0.2), 0.0, isect);\n\n'       +

        '    // Mirror\n'                                                                  +
        '    //lineIntersect(ray, vec2(0.4, -0.6), vec2(0.4, 0.2), 0.0, isect);\n\n'       +

        '    // Hidden object\n'                                                           +
        '    lineIntersect(ray, vec2(-0.4, 1.0), vec2(-0.8, 0.6), 0.0, isect);\n'          +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.8);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene2':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-1.424, -0.8), 0.356, 1.0, isect);\n'               +
        '    sphereIntersect(ray, vec2(-0.72,  -0.8), 0.356, 2.0, isect);\n'               +
        '    sphereIntersect(ray, vec2( 0.0,   -0.8), 0.356, 3.0, isect);\n'               +
        '    sphereIntersect(ray, vec2( 0.72,  -0.8), 0.356, 4.0, isect);\n'               +
        '    sphereIntersect(ray, vec2( 1.424, -0.8), 0.356, 5.0, isect);\n'               +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '           if (isect.mat == 1.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                      'ughput, 0.02);\n'   +
        '    } else if (isect.mat == 2.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                      'ughput, 0.05);\n'   +
        '    } else if (isect.mat == 3.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                       'ughput, 0.1);\n'   +
        '    } else if (isect.mat == 4.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                       'ughput, 0.2);\n'   +
        '    } else if (isect.mat == 5.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                       'ughput, 0.5);\n'   +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene20':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    bboxIntersect(ray, vec2(-0.1, 0.0), vec2(0.1, 0.2), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene21':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    bboxIntersect(ray, vec2(0.1875, 0.25), vec2(0.0625, 0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(-0.325, -0.25), vec2(-0.25, -0.5), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(-0.25, -0.5), vec2(-0.325, -0.75), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(-0.325, -0.75), vec2(-0.575, -0.325), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(-0.575, -0.325), vec2(-0.325, -0.25), 0.0, isect);\n' +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene22':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n\n'         +

        '    lineIntersect(ray, vec2(0.0, 0.4), vec2(0.2, 0.0), 0.0, isect);\n'            +
        '    lineIntersect(ray, vec2(0.2, 0.0), vec2(0.0, -0.4), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.0, -0.4), vec2(0.0, 0.4), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene23-cascaded-v1':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene24-cascaded-v2':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene25-line-largewall':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.0, 0.5), vec2(0.0, -0.5), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene26-ku-planar-planar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20, 0.0), vec2(1.20, 1.00), 0.0, isect);\n'         +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene27-ku-planar-semi':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene28-ku-planar-rough':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.225, 0.00), vec2(1.175, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.05), vec2(1.225, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.10), vec2(1.175, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.15), vec2(1.225, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.20), vec2(1.175, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.25), vec2(1.225, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.30), vec2(1.175, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.35), vec2(1.225, 0.40), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.40), vec2(1.175, 0.45), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.45), vec2(1.225, 0.50), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.50), vec2(1.175, 0.55), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.55), vec2(1.225, 0.60), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.60), vec2(1.175, 0.65), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.65), vec2(1.225, 0.70), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.70), vec2(1.175, 0.75), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.75), vec2(1.225, 0.80), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.80), vec2(1.175, 0.85), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.85), vec2(1.225, 0.90), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.90), vec2(1.175, 0.95), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.95), vec2(1.225, 1.00), 0.0, isect);\n'      +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene29-ku-semi-planar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20, 0.0), vec2(1.20, 1.00), 0.0, isect);\n'         +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene3':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.2,  0.8), 1.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-0.7, -0.45), 0.35, 3.0, isect);\n'                 +
        '    sphereIntersect(ray, vec2( 0.7, -0.45), 0.35, 2.0, isect);\n'                 +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 2.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                         '96, 147.4688), lambda)/1.4;\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '             if (isect.n.x == -1.0) throughput *= vec3(0.14,  0.45,  0.091);\n'   +
        '        else if (isect.n.x ==  1.0) throughput *= vec3(0.63,  0.065, 0.05);\n'    +
        '        else                        throughput *= vec3(0.725, 0.71,  0.68);\n'    +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene30-ku-semi-semi':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene31-ku-semi-rough':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.225, 0.00), vec2(1.175, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.05), vec2(1.225, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.10), vec2(1.175, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.15), vec2(1.225, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.20), vec2(1.175, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.25), vec2(1.225, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.30), vec2(1.175, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.35), vec2(1.225, 0.40), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.40), vec2(1.175, 0.45), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.45), vec2(1.225, 0.50), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.50), vec2(1.175, 0.55), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.55), vec2(1.225, 0.60), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.60), vec2(1.175, 0.65), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.65), vec2(1.225, 0.70), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.70), vec2(1.175, 0.75), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.75), vec2(1.225, 0.80), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.80), vec2(1.175, 0.85), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.85), vec2(1.225, 0.90), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.90), vec2(1.175, 0.95), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.95), vec2(1.225, 1.00), 0.0, isect);\n'      +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene32-ku-rough-planar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.425, -0.4), vec2(0.375, -0.35), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.375, -0.35), vec2(0.425, -0.30), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.30), vec2(0.375, -0.25), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.25), vec2(0.425, -0.20), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.20), vec2(0.375, -0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.15), vec2(0.425, -0.10), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.10), vec2(0.375, -0.05), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.05), vec2(0.425, 0.00), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.425, 0.00), vec2(0.375, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.05), vec2(0.425, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.10), vec2(0.375, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.15), vec2(0.425, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.20), vec2(0.375, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.25), vec2(0.425, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.30), vec2(0.375, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.35), vec2(0.425, 0.40), 0.0, isect);\n\n'    +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20, 0.0), vec2(1.20, 1.00), 0.0, isect);\n'         +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene33-ku-rough-semi':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.425, -0.4), vec2(0.375, -0.35), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.375, -0.35), vec2(0.425, -0.30), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.30), vec2(0.375, -0.25), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.25), vec2(0.425, -0.20), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.20), vec2(0.375, -0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.15), vec2(0.425, -0.10), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.10), vec2(0.375, -0.05), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.05), vec2(0.425, 0.00), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.425, 0.00), vec2(0.375, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.05), vec2(0.425, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.10), vec2(0.375, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.15), vec2(0.425, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.20), vec2(0.375, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.25), vec2(0.425, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.30), vec2(0.375, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.35), vec2(0.425, 0.40), 0.0, isect);\n\n'    +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene34-ku-rough-rough':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.425, -0.4), vec2(0.375, -0.35), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.375, -0.35), vec2(0.425, -0.30), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.30), vec2(0.375, -0.25), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.25), vec2(0.425, -0.20), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.20), vec2(0.375, -0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.15), vec2(0.425, -0.10), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.10), vec2(0.375, -0.05), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.05), vec2(0.425, 0.00), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.425, 0.00), vec2(0.375, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.05), vec2(0.425, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.10), vec2(0.375, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.15), vec2(0.425, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.20), vec2(0.375, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.25), vec2(0.425, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.30), vec2(0.375, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.35), vec2(0.425, 0.40), 0.0, isect);\n\n'    +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.225, 0.00), vec2(1.175, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.05), vec2(1.225, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.10), vec2(1.175, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.15), vec2(1.225, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.20), vec2(1.175, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.25), vec2(1.225, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.30), vec2(1.175, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.35), vec2(1.225, 0.40), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.40), vec2(1.175, 0.45), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.45), vec2(1.225, 0.50), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.50), vec2(1.175, 0.55), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.55), vec2(1.225, 0.60), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.60), vec2(1.175, 0.65), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.65), vec2(1.225, 0.70), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.70), vec2(1.175, 0.75), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.75), vec2(1.225, 0.80), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.80), vec2(1.175, 0.85), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.85), vec2(1.225, 0.90), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.90), vec2(1.175, 0.95), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.95), vec2(1.225, 1.00), 0.0, isect);\n'      +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene35-ku-facetsmall':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40452, -0.40392), vec2(0.39548, -0.38608), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39709, -0.39457), vec2(0.40291, -0.37543), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39135, -0.38003), vec2(0.40865, -0.36997), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40565, -0.37325), vec2(0.39435, -0.35675), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40385, -0.36423), vec2(0.39615, -0.34577), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40853, -0.35022), vec2(0.39147, -0.33978), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39486, -0.34358), vec2(0.40514, -0.32642), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39329, -0.33242), vec2(0.40671, -0.31758), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40074, -0.32497), vec2(0.39926, -0.30503), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39434, -0.31325), vec2(0.40566, -0.29675), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39405, -0.30304), vec2(0.40595, -0.28696), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39434, -0.29325), vec2(0.40566, -0.27675), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40760, -0.28150), vec2(0.39240, -0.26850), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40263, -0.27465), vec2(0.39737, -0.25535), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39689, -0.26450), vec2(0.40311, -0.24550), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39421, -0.25315), vec2(0.40579, -0.23685), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39181, -0.24074), vec2(0.40819, -0.22926), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39954, -0.23499), vec2(0.40046, -0.21501), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39148, -0.22023), vec2(0.40852, -0.20977), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40127, -0.21492), vec2(0.39873, -0.19508), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40122, -0.20493), vec2(0.39878, -0.18507), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39941, -0.19498), vec2(0.40059, -0.17502), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40762, -0.18147), vec2(0.39238, -0.16853), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40861, -0.17008), vec2(0.39139, -0.15992), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40375, -0.16427), vec2(0.39625, -0.14573), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39335, -0.15247), vec2(0.40665, -0.13753), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39985, -0.14500), vec2(0.40015, -0.12500), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39346, -0.13257), vec2(0.40654, -0.11743), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40699, -0.12215), vec2(0.39301, -0.10785), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39221, -0.11126), vec2(0.40779, -0.09874), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39349, -0.10259), vec2(0.40651, -0.08741), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40472, -0.09382), vec2(0.39528, -0.07618), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40047, -0.08499), vec2(0.39953, -0.06501), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40497, -0.07368), vec2(0.39503, -0.05632), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39575, -0.06405), vec2(0.40425, -0.04595), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39295, -0.05210), vec2(0.40705, -0.03790), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39611, -0.04421), vec2(0.40389, -0.02579), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39978, -0.03500), vec2(0.40022, -0.01500), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40509, -0.02361), vec2(0.39491, -0.00639), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39319, -0.01233), vec2(0.40681, 0.00233), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.39844, -0.00488), vec2(0.40156, 0.01488), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.40128, 0.00508), vec2(0.39872, 0.02492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39608, 0.01580), vec2(0.40392, 0.03420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39653, 0.02562), vec2(0.40347, 0.04438), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40826, 0.03937), vec2(0.39174, 0.05063), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40314, 0.04551), vec2(0.39686, 0.06449), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39153, 0.05968), vec2(0.40847, 0.07032), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40717, 0.06803), vec2(0.39283, 0.08197), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39229, 0.07863), vec2(0.40771, 0.09137), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39944, 0.08502), vec2(0.40056, 0.10498), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40430, 0.09597), vec2(0.39570, 0.11403), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39306, 0.10780), vec2(0.40694, 0.12220), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40469, 0.11617), vec2(0.39531, 0.13383), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40420, 0.12592), vec2(0.39580, 0.14408), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40585, 0.13689), vec2(0.39415, 0.15311), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39202, 0.14898), vec2(0.40798, 0.16102), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40692, 0.15778), vec2(0.39308, 0.17222), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39898, 0.16505), vec2(0.40102, 0.18495), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40592, 0.17694), vec2(0.39408, 0.19306), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40686, 0.18772), vec2(0.39314, 0.20228), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39350, 0.19740), vec2(0.40650, 0.21260), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40426, 0.20595), vec2(0.39574, 0.22405), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39875, 0.21508), vec2(0.40125, 0.23492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39854, 0.22511), vec2(0.40146, 0.24489), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39169, 0.23944), vec2(0.40831, 0.25056), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39151, 0.24972), vec2(0.40849, 0.26028), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40438, 0.25601), vec2(0.39562, 0.27399), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40049, 0.26501), vec2(0.39951, 0.28499), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39160, 0.27957), vec2(0.40840, 0.29043), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39189, 0.28914), vec2(0.40811, 0.30086), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39871, 0.29508), vec2(0.40129, 0.31492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39427, 0.30680), vec2(0.40573, 0.32320), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40523, 0.31647), vec2(0.39477, 0.33353), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40851, 0.32975), vec2(0.39149, 0.34025), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39673, 0.33555), vec2(0.40327, 0.35445), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39814, 0.34518), vec2(0.40186, 0.36482), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40535, 0.35655), vec2(0.39465, 0.37345), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40613, 0.36710), vec2(0.39387, 0.38290), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39483, 0.37644), vec2(0.40517, 0.39356), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39919, 0.38503), vec2(0.40081, 0.40497), 0.0, isec' +
                                                                                 't);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20656, -0.00254), vec2(1.19344, 0.01254), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.20489, 0.00628), vec2(1.19511, 0.02372), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20638, 0.01730), vec2(1.19362, 0.03270), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.02720), vec2(1.19375, 0.04280), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20048, 0.03501), vec2(1.19952, 0.05499), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20781, 0.04876), vec2(1.19219, 0.06124), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19873, 0.05508), vec2(1.20127, 0.07492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19384, 0.06712), vec2(1.20616, 0.08288), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20661, 0.07750), vec2(1.19339, 0.09250), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19890, 0.08506), vec2(1.20110, 0.10494), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19467, 0.09654), vec2(1.20533, 0.11346), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20730, 0.10817), vec2(1.19270, 0.12183), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19224, 0.11869), vec2(1.20776, 0.13131), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20359, 0.12567), vec2(1.19641, 0.14433), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20616, 0.13712), vec2(1.19384, 0.15288), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19584, 0.14590), vec2(1.20416, 0.16410), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19535, 0.15615), vec2(1.20465, 0.17385), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20541, 0.16659), vec2(1.19459, 0.18341), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19535, 0.17614), vec2(1.20465, 0.19386), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19981, 0.18500), vec2(1.20019, 0.20500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20531, 0.19652), vec2(1.19469, 0.21348), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19419, 0.20686), vec2(1.20581, 0.22314), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20647, 0.21737), vec2(1.19353, 0.23263), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20391, 0.22580), vec2(1.19609, 0.24420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20075, 0.23503), vec2(1.19925, 0.25497), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19851, 0.24511), vec2(1.20149, 0.26489), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20333, 0.25557), vec2(1.19667, 0.27443), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20144, 0.26510), vec2(1.19856, 0.28490), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20820, 0.27927), vec2(1.19180, 0.29073), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19804, 0.28519), vec2(1.20196, 0.30481), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20858, 0.29986), vec2(1.19142, 0.31014), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20506, 0.30638), vec2(1.19494, 0.32362), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20774, 0.31867), vec2(1.19226, 0.33133), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20777, 0.32871), vec2(1.19223, 0.34129), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20110, 0.33506), vec2(1.19890, 0.35494), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20490, 0.34628), vec2(1.19510, 0.36372), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19312, 0.35775), vec2(1.20688, 0.37225), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20476, 0.36621), vec2(1.19524, 0.38379), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20293, 0.37544), vec2(1.19707, 0.39456), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19378, 0.38717), vec2(1.20622, 0.40283), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19606, 0.39581), vec2(1.20394, 0.41419), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20035, 0.40501), vec2(1.19965, 0.42499), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20680, 0.41767), vec2(1.19320, 0.43233), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20444, 0.42604), vec2(1.19556, 0.44396), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19374, 0.43720), vec2(1.20626, 0.45280), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19347, 0.44742), vec2(1.20653, 0.46258), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19301, 0.45785), vec2(1.20699, 0.47215), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20267, 0.46536), vec2(1.19733, 0.48464), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20232, 0.47527), vec2(1.19768, 0.49473), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19528, 0.48618), vec2(1.20472, 0.50382), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19145, 0.49981), vec2(1.20855, 0.51019), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19979, 0.50500), vec2(1.20021, 0.52500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20218, 0.51524), vec2(1.19782, 0.53476), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20672, 0.52760), vec2(1.19328, 0.54240), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19493, 0.53638), vec2(1.20507, 0.55362), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19716, 0.54541), vec2(1.20284, 0.56459), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20687, 0.55773), vec2(1.19313, 0.57227), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19469, 0.56653), vec2(1.20531, 0.58347), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19481, 0.57645), vec2(1.20519, 0.59355), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19274, 0.58812), vec2(1.20726, 0.60188), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19718, 0.59541), vec2(1.20282, 0.61459), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19972, 0.60500), vec2(1.20028, 0.62500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19994, 0.61500), vec2(1.20006, 0.63500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20801, 0.62901), vec2(1.19199, 0.64099), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20374, 0.63572), vec2(1.19626, 0.65428), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20782, 0.64877), vec2(1.19218, 0.66123), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19731, 0.65537), vec2(1.20269, 0.67463), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19367, 0.66726), vec2(1.20633, 0.68274), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20727, 0.67814), vec2(1.19273, 0.69186), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20471, 0.68618), vec2(1.19529, 0.70382), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20537, 0.69656), vec2(1.19463, 0.71344), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19905, 0.70505), vec2(1.20095, 0.72495), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20782, 0.71877), vec2(1.19218, 0.73123), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19431, 0.72678), vec2(1.20569, 0.74322), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19483, 0.73644), vec2(1.20517, 0.75356), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19411, 0.74692), vec2(1.20589, 0.76308), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20095, 0.75505), vec2(1.19905, 0.77495), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19849, 0.76511), vec2(1.20151, 0.78489), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20591, 0.77693), vec2(1.19409, 0.79307), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19273, 0.78813), vec2(1.20727, 0.80187), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20675, 0.79762), vec2(1.19325, 0.81238), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19381, 0.80715), vec2(1.20619, 0.82285), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19314, 0.81772), vec2(1.20686, 0.83228), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19639, 0.82567), vec2(1.20361, 0.84433), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20611, 0.83708), vec2(1.19389, 0.85292), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20268, 0.84537), vec2(1.19732, 0.86463), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20590, 0.85693), vec2(1.19410, 0.87307), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20710, 0.86796), vec2(1.19290, 0.88204), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19448, 0.87666), vec2(1.20552, 0.89334), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20664, 0.88752), vec2(1.19336, 0.90248), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19370, 0.89723), vec2(1.20630, 0.91277), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19186, 0.90920), vec2(1.20814, 0.92080), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20143, 0.91510), vec2(1.19857, 0.93490), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20573, 0.92681), vec2(1.19427, 0.94319), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19217, 0.93877), vec2(1.20783, 0.95123), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19240, 0.94850), vec2(1.20760, 0.96150), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20306, 0.95548), vec2(1.19694, 0.97452), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20388, 0.96578), vec2(1.19612, 0.98422), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20839, 0.97956), vec2(1.19161, 0.99044), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20052, 0.98501), vec2(1.19948, 1.00499), 0.0, isec' +
                                                                                 't);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene36-ku-facetmedium':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41140, -0.40644), vec2(0.38860, -0.37356), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41583, -0.38222), vec2(0.38417, -0.35778), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40507, -0.36935), vec2(0.39493, -0.33065), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41704, -0.34047), vec2(0.38296, -0.31953), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41654, -0.32125), vec2(0.38346, -0.29875), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39498, -0.30936), vec2(0.40502, -0.27064), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41432, -0.28397), vec2(0.38568, -0.25603), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39320, -0.26881), vec2(0.40680, -0.23119), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38413, -0.24217), vec2(0.41587, -0.21783), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39006, -0.22735), vec2(0.40994, -0.19265), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41526, -0.20293), vec2(0.38474, -0.17707), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38385, -0.18179), vec2(0.41615, -0.15821), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39346, -0.16890), vec2(0.40654, -0.13110), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41091, -0.14676), vec2(0.38909, -0.11324), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40893, -0.12789), vec2(0.39107, -0.09211), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39805, -0.10991), vec2(0.40195, -0.07009), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40286, -0.08979), vec2(0.39714, -0.05021), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39916, -0.06998), vec2(0.40084, -0.03002), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39935, -0.04999), vec2(0.40065, -0.01001), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38712, -0.02530), vec2(0.41288, 0.00530), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.40645, -0.00893), vec2(0.39355, 0.02893), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.38853, 0.01361), vec2(0.41147, 0.04639), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39230, 0.03154), vec2(0.40770, 0.06846), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41261, 0.05447), vec2(0.38739, 0.08553), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39694, 0.07023), vec2(0.40306, 0.10977), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41479, 0.09653), vec2(0.38521, 0.12347), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38683, 0.11495), vec2(0.41317, 0.14505), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39208, 0.13164), vec2(0.40792, 0.16836), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39610, 0.15038), vec2(0.40390, 0.18962), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41595, 0.17794), vec2(0.38405, 0.20206), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38951, 0.19297), vec2(0.41049, 0.22703), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40611, 0.21096), vec2(0.39389, 0.24904), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41090, 0.23323), vec2(0.38910, 0.26677), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38769, 0.25424), vec2(0.41231, 0.28576), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39187, 0.27173), vec2(0.40813, 0.30827), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38895, 0.29333), vec2(0.41105, 0.32667), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38787, 0.31409), vec2(0.41213, 0.34591), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40186, 0.33009), vec2(0.39814, 0.36991), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40825, 0.35178), vec2(0.39175, 0.38822), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39546, 0.37052), vec2(0.40454, 0.40948), 0.0, isec' +
                                                                                 't);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20316, -0.00975), vec2(1.19684, 0.02975), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.20058, 0.01001), vec2(1.19942, 0.04999), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18631, 0.03542), vec2(1.21369, 0.06458), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18607, 0.05565), vec2(1.21393, 0.08435), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21350, 0.07524), vec2(1.18650, 0.10476), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19076, 0.09226), vec2(1.20924, 0.12774), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21402, 0.11573), vec2(1.18598, 0.14427), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18834, 0.13375), vec2(1.21166, 0.16625), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18717, 0.15466), vec2(1.21283, 0.18534), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19700, 0.17023), vec2(1.20300, 0.20977), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20707, 0.19129), vec2(1.19293, 0.22871), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20083, 0.21002), vec2(1.19917, 0.24998), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19069, 0.23230), vec2(1.20931, 0.26770), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19984, 0.25000), vec2(1.20016, 0.29000), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19042, 0.27244), vec2(1.20958, 0.30756), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19001, 0.29267), vec2(1.20999, 0.32733), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20334, 0.31028), vec2(1.19666, 0.34972), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21497, 0.33674), vec2(1.18503, 0.36326), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18437, 0.35752), vec2(1.21563, 0.38248), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20276, 0.37019), vec2(1.19724, 0.40981), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21287, 0.39469), vec2(1.18713, 0.42531), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18319, 0.41917), vec2(1.21681, 0.44083), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21654, 0.43875), vec2(1.18346, 0.46125), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18433, 0.45757), vec2(1.21567, 0.48243), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19265, 0.47140), vec2(1.20735, 0.50860), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20815, 0.49174), vec2(1.19185, 0.52826), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21229, 0.51422), vec2(1.18771, 0.54578), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18287, 0.53968), vec2(1.21713, 0.56032), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19539, 0.55054), vec2(1.20461, 0.58946), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21102, 0.57331), vec2(1.18898, 0.60669), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21626, 0.59835), vec2(1.18374, 0.62165), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18383, 0.61823), vec2(1.21617, 0.64177), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21436, 0.63608), vec2(1.18564, 0.66392), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21196, 0.65397), vec2(1.18804, 0.68603), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21549, 0.67735), vec2(1.18451, 0.70265), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21624, 0.69833), vec2(1.18376, 0.72167), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20842, 0.71186), vec2(1.19158, 0.74814), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18969, 0.73286), vec2(1.21031, 0.76714), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20824, 0.75178), vec2(1.19176, 0.78822), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18938, 0.77305), vec2(1.21062, 0.80695), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18316, 0.79921), vec2(1.21684, 0.82079), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21498, 0.81675), vec2(1.18502, 0.84325), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18404, 0.83795), vec2(1.21596, 0.86205), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20693, 0.85124), vec2(1.19307, 0.88876), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19888, 0.87003), vec2(1.20112, 0.90997), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18560, 0.89612), vec2(1.21440, 0.92388), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18591, 0.91580), vec2(1.21409, 0.94420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18889, 0.93337), vec2(1.21111, 0.96663), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21182, 0.95387), vec2(1.18818, 0.98613), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21276, 0.97460), vec2(1.18724, 1.00540), 0.0, isec' +
                                                                                 't);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene37-ku-facetbig':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.43078, -0.40555), vec2(0.36922, -0.35445), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.42688, -0.36962), vec2(0.37312, -0.31038), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40759, -0.33927), vec2(0.39241, -0.26073), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38457, -0.29691), vec2(0.41543, -0.22309), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.42934, -0.24719), vec2(0.37066, -0.19281), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.37434, -0.21068), vec2(0.42566, -0.14932), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38599, -0.17747), vec2(0.41401, -0.10253), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38403, -0.13667), vec2(0.41597, -0.06333), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.42081, -0.09416), vec2(0.37919, -0.02584), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.36790, -0.04386), vec2(0.43210, 0.00386), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.42394, -0.01204), vec2(0.37606, 0.05204), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.39603, 0.02020), vec2(0.40397, 0.09980), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.37822, 0.06645), vec2(0.42178, 0.13355), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.37088, 0.11257), vec2(0.42912, 0.16743), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.36619, 0.15862), vec2(0.43381, 0.20138), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39799, 0.18005), vec2(0.40201, 0.25995), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39799, 0.22005), vec2(0.40201, 0.29995), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.42993, 0.27346), vec2(0.37007, 0.32654), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.37230, 0.31115), vec2(0.42770, 0.36885), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41073, 0.34147), vec2(0.38927, 0.41853), 0.0, isec' +
                                                                                 't);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20477, -0.01971), vec2(1.19523, 0.05971), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.21498, 0.02291), vec2(1.18502, 0.09709), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18045, 0.06510), vec2(1.21955, 0.13490), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21336, 0.10230), vec2(1.18664, 0.17770), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.23393, 0.15882), vec2(1.16607, 0.20118), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21246, 0.18199), vec2(1.18754, 0.25801), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.23429, 0.23941), vec2(1.16571, 0.28059), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20957, 0.26116), vec2(1.19043, 0.33884), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18721, 0.30210), vec2(1.21279, 0.37790), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18469, 0.34305), vec2(1.21531, 0.41695), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22131, 0.38615), vec2(1.17869, 0.45385), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20964, 0.42118), vec2(1.19036, 0.49882), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22427, 0.46820), vec2(1.17573, 0.53180), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22920, 0.51266), vec2(1.17080, 0.56734), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20536, 0.54036), vec2(1.19464, 0.61964), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20605, 0.58046), vec2(1.19395, 0.65954), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20908, 0.62104), vec2(1.19092, 0.69896), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.17919, 0.66584), vec2(1.22081, 0.73416), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20297, 0.70011), vec2(1.19703, 0.77989), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22676, 0.75027), vec2(1.17324, 0.80973), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.17565, 0.78826), vec2(1.22435, 0.85174), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.23224, 0.83632), vec2(1.16776, 0.88368), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18118, 0.86470), vec2(1.21882, 0.93530), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22847, 0.91190), vec2(1.17153, 0.96810), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18149, 0.94454), vec2(1.21851, 1.01546), 0.0, isec' +
                                                                                 't);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene38-ku-facetplanarmedium':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.40), vec2(0.40, 0.40), 0.0, isect);\n\n'     +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20316, -0.00975), vec2(1.19684, 0.02975), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.20058, 0.01001), vec2(1.19942, 0.04999), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18631, 0.03542), vec2(1.21369, 0.06458), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18607, 0.05565), vec2(1.21393, 0.08435), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21350, 0.07524), vec2(1.18650, 0.10476), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19076, 0.09226), vec2(1.20924, 0.12774), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21402, 0.11573), vec2(1.18598, 0.14427), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18834, 0.13375), vec2(1.21166, 0.16625), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18717, 0.15466), vec2(1.21283, 0.18534), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19700, 0.17023), vec2(1.20300, 0.20977), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20707, 0.19129), vec2(1.19293, 0.22871), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20083, 0.21002), vec2(1.19917, 0.24998), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19069, 0.23230), vec2(1.20931, 0.26770), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19984, 0.25000), vec2(1.20016, 0.29000), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19042, 0.27244), vec2(1.20958, 0.30756), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19001, 0.29267), vec2(1.20999, 0.32733), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20334, 0.31028), vec2(1.19666, 0.34972), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21497, 0.33674), vec2(1.18503, 0.36326), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18437, 0.35752), vec2(1.21563, 0.38248), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20276, 0.37019), vec2(1.19724, 0.40981), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21287, 0.39469), vec2(1.18713, 0.42531), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18319, 0.41917), vec2(1.21681, 0.44083), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21654, 0.43875), vec2(1.18346, 0.46125), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18433, 0.45757), vec2(1.21567, 0.48243), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19265, 0.47140), vec2(1.20735, 0.50860), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20815, 0.49174), vec2(1.19185, 0.52826), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21229, 0.51422), vec2(1.18771, 0.54578), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18287, 0.53968), vec2(1.21713, 0.56032), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19539, 0.55054), vec2(1.20461, 0.58946), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21102, 0.57331), vec2(1.18898, 0.60669), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21626, 0.59835), vec2(1.18374, 0.62165), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18383, 0.61823), vec2(1.21617, 0.64177), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21436, 0.63608), vec2(1.18564, 0.66392), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21196, 0.65397), vec2(1.18804, 0.68603), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21549, 0.67735), vec2(1.18451, 0.70265), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21624, 0.69833), vec2(1.18376, 0.72167), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20842, 0.71186), vec2(1.19158, 0.74814), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18969, 0.73286), vec2(1.21031, 0.76714), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20824, 0.75178), vec2(1.19176, 0.78822), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18938, 0.77305), vec2(1.21062, 0.80695), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18316, 0.79921), vec2(1.21684, 0.82079), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21498, 0.81675), vec2(1.18502, 0.84325), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18404, 0.83795), vec2(1.21596, 0.86205), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20693, 0.85124), vec2(1.19307, 0.88876), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19888, 0.87003), vec2(1.20112, 0.90997), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18560, 0.89612), vec2(1.21440, 0.92388), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18591, 0.91580), vec2(1.21409, 0.94420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18889, 0.93337), vec2(1.21111, 0.96663), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21182, 0.95387), vec2(1.18818, 0.98613), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21276, 0.97460), vec2(1.18724, 1.00540), 0.0, isec' +
                                                                                 't);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene39-ku-semi-rough-2xsmall':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.405, -0.4), vec2(0.395, -0.39), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.395, -0.39), vec2(0.405, -0.38), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.405, -0.38), vec2(0.395, -0.37), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.395, -0.37), vec2(0.405, -0.36), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.405, -0.36), vec2(0.395, -0.35), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.395, -0.35), vec2(0.405, -0.33999999999999997), 0.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.33999999999999997), vec2(0.395, -0.3299999' +
                                                           '9999999996), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.32999999999999996), vec2(0.405, -0.3199999' +
                                                           '9999999995), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.31999999999999995), vec2(0.395, -0.3099999' +
                                                           '9999999994), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.30999999999999994), vec2(0.405, -0.2999999' +
                                                           '9999999993), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.29999999999999993), vec2(0.395, -0.2899999' +
                                                            '999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.2899999999999999), vec2(0.405, -0.27999999' +
                                                             '99999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.2799999999999999), vec2(0.395, -0.26999999' +
                                                             '99999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.2699999999999999), vec2(0.405, -0.25999999' +
                                                             '99999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.2599999999999999), vec2(0.395, -0.24999999' +
                                                             '99999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.2499999999999999), vec2(0.405, -0.23999999' +
                                                            '999999988), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.23999999999999988), vec2(0.395, -0.2299999' +
                                                           '9999999987), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.22999999999999987), vec2(0.405, -0.2199999' +
                                                           '9999999986), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.21999999999999986), vec2(0.395, -0.2099999' +
                                                           '9999999985), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.20999999999999985), vec2(0.405, -0.1999999' +
                                                           '9999999984), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.19999999999999984), vec2(0.395, -0.1899999' +
                                                           '9999999984), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.18999999999999984), vec2(0.405, -0.1799999' +
                                                           '9999999983), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.17999999999999983), vec2(0.395, -0.1699999' +
                                                           '9999999982), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.16999999999999982), vec2(0.405, -0.1599999' +
                                                            '999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.1599999999999998), vec2(0.395, -0.14999999' +
                                                             '99999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.1499999999999998), vec2(0.405, -0.13999999' +
                                                             '99999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.1399999999999998), vec2(0.395, -0.12999999' +
                                                            '999999978), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.12999999999999978), vec2(0.405, -0.1199999' +
                                                           '9999999979), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.11999999999999979), vec2(0.395, -0.1099999' +
                                                           '9999999979), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.10999999999999979), vec2(0.405, -0.0999999' +
                                                            '999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.0999999999999998), vec2(0.395, -0.08999999' +
                                                             '99999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.0899999999999998), vec2(0.405, -0.07999999' +
                                                            '999999981), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.07999999999999981), vec2(0.395, -0.0699999' +
                                                           '9999999981), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.06999999999999981), vec2(0.405, -0.0599999' +
                                                           '9999999981), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.05999999999999981), vec2(0.395, -0.0499999' +
                                                           '9999999981), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.04999999999999981), vec2(0.405, -0.0399999' +
                                                           '9999999981), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.03999999999999981), vec2(0.395, -0.0299999' +
                                                          '99999999805), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.029999999999999805), vec2(0.405, -0.019999' +
                                                         '999999999803), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, -0.019999999999999803), vec2(0.395, -0.009999' +
                                                         '999999999802), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, -0.009999999999999802), vec2(0.405, 0.0), 0.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.0), vec2(0.395, 0.010000000000000198), 0.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.010000000000000198), vec2(0.405, 0.02000000' +
                                                           '0000000198), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.020000000000000198), vec2(0.395, 0.03000000' +
                                                             '00000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.0300000000000002), vec2(0.405, 0.0400000000' +
                                                               '000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.0400000000000002), vec2(0.395, 0.0500000000' +
                                                             '00000204), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.050000000000000204), vec2(0.405, 0.06000000' +
                                                           '0000000206), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.060000000000000206), vec2(0.395, 0.07000000' +
                                                             '00000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.0700000000000002), vec2(0.405, 0.0800000000' +
                                                               '000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.0800000000000002), vec2(0.395, 0.0900000000' +
                                                              '0000019), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.09000000000000019), vec2(0.405, 0.100000000' +
                                                             '00000019), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.10000000000000019), vec2(0.395, 0.110000000' +
                                                             '00000018), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.11000000000000018), vec2(0.405, 0.120000000' +
                                                             '00000018), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.12000000000000018), vec2(0.395, 0.130000000' +
                                                             '00000017), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.13000000000000017), vec2(0.405, 0.140000000' +
                                                             '00000018), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.14000000000000018), vec2(0.395, 0.150000000' +
                                                              '0000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.1500000000000002), vec2(0.405, 0.1600000000' +
                                                               '000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.1600000000000002), vec2(0.395, 0.1700000000' +
                                                               '000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.1700000000000002), vec2(0.405, 0.1800000000' +
                                                              '0000022), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.18000000000000022), vec2(0.395, 0.190000000' +
                                                             '00000022), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.19000000000000022), vec2(0.405, 0.200000000' +
                                                             '00000023), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.20000000000000023), vec2(0.395, 0.210000000' +
                                                             '00000024), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.21000000000000024), vec2(0.405, 0.220000000' +
                                                             '00000025), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.22000000000000025), vec2(0.395, 0.230000000' +
                                                             '00000026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.23000000000000026), vec2(0.405, 0.240000000' +
                                                             '00000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.24000000000000027), vec2(0.395, 0.250000000' +
                                                              '0000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.2500000000000003), vec2(0.405, 0.2600000000' +
                                                               '000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.2600000000000003), vec2(0.395, 0.2700000000' +
                                                               '000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.2700000000000003), vec2(0.405, 0.2800000000' +
                                                               '000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.2800000000000003), vec2(0.395, 0.2900000000' +
                                                               '000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.2900000000000003), vec2(0.405, 0.3000000000' +
                                                               '000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.3000000000000003), vec2(0.395, 0.3100000000' +
                                                              '0000033), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.31000000000000033), vec2(0.405, 0.320000000' +
                                                             '00000034), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.32000000000000034), vec2(0.395, 0.330000000' +
                                                             '00000035), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.33000000000000035), vec2(0.405, 0.340000000' +
                                                             '00000036), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.34000000000000036), vec2(0.395, 0.350000000' +
                                                             '00000037), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.35000000000000037), vec2(0.405, 0.360000000' +
                                                              '0000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.3600000000000004), vec2(0.395, 0.3700000000' +
                                                               '000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.3700000000000004), vec2(0.405, 0.3800000000' +
                                                               '000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.405, 0.3800000000000004), vec2(0.395, 0.3900000000' +
                                                               '000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395, 0.3900000000000004), vec2(0.405, 0.4000000000' +
                                                               '000004), 0.0, isect);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.2125, 0.0), vec2(1.1875, 0.025), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(1.1875, 0.025), vec2(1.2125, 0.05), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.05), vec2(1.1875, 0.07500000000000001), 0.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.07500000000000001), vec2(1.2125, 0.1), 0.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.1), vec2(1.1875, 0.125), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(1.1875, 0.125), vec2(1.2125, 0.15), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.15), vec2(1.1875, 0.175), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.175), vec2(1.2125, 0.19999999999999998), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.19999999999999998), vec2(1.1875, 0.2249999' +
                                                           '9999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.22499999999999998), vec2(1.2125, 0.2499999' +
                                                           '9999999997), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.24999999999999997), vec2(1.1875, 0.2749999' +
                                                           '9999999997), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.27499999999999997), vec2(1.2125, 0.3), 0.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.3), vec2(1.1875, 0.325), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(1.1875, 0.325), vec2(1.2125, 0.35000000000000003), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.35000000000000003), vec2(1.1875, 0.3750000' +
                                                           '0000000006), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.37500000000000006), vec2(1.2125, 0.4000000' +
                                                            '000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.4000000000000001), vec2(1.1875, 0.42500000' +
                                                             '00000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.4250000000000001), vec2(1.2125, 0.45000000' +
                                                             '00000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.4500000000000001), vec2(1.1875, 0.47500000' +
                                                            '000000014), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.47500000000000014), vec2(1.2125, 0.5000000' +
                                                            '000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.5000000000000001), vec2(1.1875, 0.52500000' +
                                                             '00000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.5250000000000001), vec2(1.2125, 0.55000000' +
                                                             '00000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.5500000000000002), vec2(1.1875, 0.57500000' +
                                                             '00000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.5750000000000002), vec2(1.2125, 0.60000000' +
                                                             '00000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.6000000000000002), vec2(1.1875, 0.62500000' +
                                                             '00000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.6250000000000002), vec2(1.2125, 0.65000000' +
                                                             '00000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.6500000000000002), vec2(1.1875, 0.67500000' +
                                                             '00000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.6750000000000003), vec2(1.2125, 0.70000000' +
                                                             '00000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.7000000000000003), vec2(1.1875, 0.72500000' +
                                                             '00000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.7250000000000003), vec2(1.2125, 0.75000000' +
                                                             '00000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.7500000000000003), vec2(1.1875, 0.77500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.7750000000000004), vec2(1.2125, 0.80000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.8000000000000004), vec2(1.1875, 0.82500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.8250000000000004), vec2(1.2125, 0.85000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.8500000000000004), vec2(1.1875, 0.87500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.8750000000000004), vec2(1.2125, 0.90000000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.9000000000000005), vec2(1.1875, 0.92500000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.9250000000000005), vec2(1.2125, 0.95000000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2125, 0.9500000000000005), vec2(1.1875, 0.97500000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1875, 0.9750000000000005), vec2(1.2125, 1.00000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene4':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    prismIntersect(ray, vec2(0.0, 0.0), 0.6, 1.0, isect);\n'                      +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                          '96, 17.4688), lambda)/1.8;\n'   +
        '        float wiDotN;\n'                                                          +
        '        vec2 res = sampleRoughDielectric(state, wiLocal, 0.1, ior, wiDotN);\n'    +
        '        if (wiDotN < 0.0)\n'                                                      +
        '            tMult = ior;\n'                                                       +
        '        return res;\n'                                                            +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.05);\n'                                              +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene40-ku-semi-rough-4xsmall':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.4025, -0.4), vec2(0.3975, -0.395), 0.0, isect);\n'  +
        '    lineIntersect(ray, vec2(0.3975, -0.395), vec2(0.4025, -0.39), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.4025, -0.39), vec2(0.3975, -0.385), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.3975, -0.385), vec2(0.4025, -0.38), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.4025, -0.38), vec2(0.3975, -0.375), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.3975, -0.375), vec2(0.4025, -0.37), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.4025, -0.37), vec2(0.3975, -0.365), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.3975, -0.365), vec2(0.4025, -0.36), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.4025, -0.36), vec2(0.3975, -0.355), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.3975, -0.355), vec2(0.4025, -0.35), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.4025, -0.35), vec2(0.3975, -0.345), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(0.3975, -0.345), vec2(0.4025, -0.33999999999999997),' +
                                                                       ' 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.33999999999999997), vec2(0.3975, -0.33499' +
                                                         '999999999996), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.33499999999999996), vec2(0.4025, -0.32999' +
                                                         '999999999996), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.32999999999999996), vec2(0.3975, -0.32499' +
                                                         '999999999996), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.32499999999999996), vec2(0.4025, -0.31999' +
                                                         '999999999995), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.31999999999999995), vec2(0.3975, -0.31499' +
                                                         '999999999995), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.31499999999999995), vec2(0.4025, -0.30999' +
                                                         '999999999994), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.30999999999999994), vec2(0.3975, -0.30499' +
                                                         '999999999994), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.30499999999999994), vec2(0.4025, -0.29999' +
                                                         '999999999993), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.29999999999999993), vec2(0.3975, -0.29499' +
                                                         '999999999993), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.29499999999999993), vec2(0.4025, -0.28999' +
                                                          '99999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.2899999999999999), vec2(0.3975, -0.284999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.2849999999999999), vec2(0.4025, -0.279999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.2799999999999999), vec2(0.3975, -0.274999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.2749999999999999), vec2(0.4025, -0.269999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.2699999999999999), vec2(0.3975, -0.264999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.2649999999999999), vec2(0.4025, -0.259999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.2599999999999999), vec2(0.3975, -0.254999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.2549999999999999), vec2(0.4025, -0.249999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.2499999999999999), vec2(0.3975, -0.244999' +
                                                          '99999999988), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.24499999999999988), vec2(0.4025, -0.23999' +
                                                         '999999999988), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.23999999999999988), vec2(0.3975, -0.23499' +
                                                         '999999999988), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.23499999999999988), vec2(0.4025, -0.22999' +
                                                         '999999999987), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.22999999999999987), vec2(0.3975, -0.22499' +
                                                         '999999999987), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.22499999999999987), vec2(0.4025, -0.21999' +
                                                         '999999999986), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.21999999999999986), vec2(0.3975, -0.21499' +
                                                         '999999999986), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.21499999999999986), vec2(0.4025, -0.20999' +
                                                         '999999999985), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.20999999999999985), vec2(0.3975, -0.20499' +
                                                         '999999999985), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.20499999999999985), vec2(0.4025, -0.19999' +
                                                         '999999999984), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.19999999999999984), vec2(0.3975, -0.19499' +
                                                         '999999999984), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.19499999999999984), vec2(0.4025, -0.18999' +
                                                         '999999999984), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.18999999999999984), vec2(0.3975, -0.18499' +
                                                         '999999999983), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.18499999999999983), vec2(0.4025, -0.17999' +
                                                         '999999999983), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.17999999999999983), vec2(0.3975, -0.17499' +
                                                         '999999999982), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.17499999999999982), vec2(0.4025, -0.16999' +
                                                         '999999999982), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.16999999999999982), vec2(0.3975, -0.16499' +
                                                          '99999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.1649999999999998), vec2(0.4025, -0.159999' +
                                                           '9999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.1599999999999998), vec2(0.3975, -0.154999' +
                                                           '9999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.1549999999999998), vec2(0.4025, -0.149999' +
                                                           '9999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.1499999999999998), vec2(0.3975, -0.144999' +
                                                           '9999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.1449999999999998), vec2(0.4025, -0.139999' +
                                                           '9999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.1399999999999998), vec2(0.3975, -0.134999' +
                                                           '9999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.1349999999999998), vec2(0.4025, -0.129999' +
                                                          '99999999978), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.12999999999999978), vec2(0.3975, -0.12499' +
                                                         '999999999978), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.12499999999999978), vec2(0.4025, -0.11999' +
                                                         '999999999977), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.11999999999999977), vec2(0.3975, -0.11499' +
                                                         '999999999977), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.11499999999999977), vec2(0.4025, -0.10999' +
                                                         '999999999976), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.10999999999999976), vec2(0.3975, -0.10499' +
                                                         '999999999976), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.10499999999999976), vec2(0.4025, -0.09999' +
                                                         '999999999976), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.09999999999999976), vec2(0.3975, -0.09499' +
                                                         '999999999975), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.09499999999999975), vec2(0.4025, -0.08999' +
                                                         '999999999975), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.08999999999999975), vec2(0.3975, -0.08499' +
                                                         '999999999974), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.08499999999999974), vec2(0.4025, -0.07999' +
                                                         '999999999974), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.07999999999999974), vec2(0.3975, -0.07499' +
                                                         '999999999973), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.07499999999999973), vec2(0.4025, -0.06999' +
                                                         '999999999973), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.06999999999999973), vec2(0.3975, -0.06499' +
                                                         '999999999972), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.06499999999999972), vec2(0.4025, -0.05999' +
                                                         '999999999973), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.05999999999999973), vec2(0.3975, -0.05499' +
                                                         '999999999973), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.05499999999999973), vec2(0.4025, -0.04999' +
                                                         '999999999973), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.04999999999999973), vec2(0.3975, -0.04499' +
                                                        '9999999999735), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.044999999999999735), vec2(0.4025, -0.0399' +
                                                        '9999999999974), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.03999999999999974), vec2(0.3975, -0.03499' +
                                                         '999999999974), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.03499999999999974), vec2(0.4025, -0.02999' +
                                                         '999999999974), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.02999999999999974), vec2(0.3975, -0.02499' +
                                                        '9999999999738), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.024999999999999738), vec2(0.4025, -0.0199' +
                                                       '99999999999737), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.019999999999999737), vec2(0.3975, -0.0149' +
                                                       '99999999999736), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.014999999999999736), vec2(0.4025, -0.0099' +
                                                       '99999999999735), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, -0.009999999999999735), vec2(0.3975, -0.0049' +
                                                       '99999999999735), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, -0.004999999999999735), vec2(0.4025, 0.0), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.0), vec2(0.3975, 0.0050000000000002655), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.0050000000000002655), vec2(0.4025, 0.01000' +
                                                        '0000000000266), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.010000000000000266), vec2(0.3975, 0.015000' +
                                                         '000000000267), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.015000000000000267), vec2(0.4025, 0.020000' +
                                                         '000000000268), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.020000000000000268), vec2(0.3975, 0.025000' +
                                                          '00000000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.02500000000000027), vec2(0.4025, 0.0300000' +
                                                           '0000000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.03000000000000027), vec2(0.3975, 0.0350000' +
                                                           '0000000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.03500000000000027), vec2(0.4025, 0.0400000' +
                                                          '00000000265), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.040000000000000265), vec2(0.3975, 0.045000' +
                                                          '00000000026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.04500000000000026), vec2(0.4025, 0.0500000' +
                                                           '0000000026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.05000000000000026), vec2(0.3975, 0.0550000' +
                                                           '0000000026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.05500000000000026), vec2(0.4025, 0.0600000' +
                                                          '00000000255), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.060000000000000255), vec2(0.3975, 0.065000' +
                                                          '00000000025), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.06500000000000025), vec2(0.4025, 0.0700000' +
                                                           '0000000026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.07000000000000026), vec2(0.3975, 0.0750000' +
                                                           '0000000026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.07500000000000026), vec2(0.4025, 0.0800000' +
                                                           '0000000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.08000000000000027), vec2(0.3975, 0.0850000' +
                                                           '0000000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.08500000000000027), vec2(0.4025, 0.0900000' +
                                                           '0000000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.09000000000000027), vec2(0.3975, 0.0950000' +
                                                           '0000000028), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.09500000000000028), vec2(0.4025, 0.1000000' +
                                                           '0000000028), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.10000000000000028), vec2(0.3975, 0.1050000' +
                                                           '0000000029), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.10500000000000029), vec2(0.4025, 0.1100000' +
                                                           '0000000029), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.11000000000000029), vec2(0.3975, 0.1150000' +
                                                            '000000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.1150000000000003), vec2(0.4025, 0.12000000' +
                                                             '00000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.1200000000000003), vec2(0.3975, 0.12500000' +
                                                             '00000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.1250000000000003), vec2(0.4025, 0.13000000' +
                                                             '00000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.1300000000000003), vec2(0.3975, 0.13500000' +
                                                            '000000031), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.13500000000000031), vec2(0.4025, 0.1400000' +
                                                           '0000000032), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.14000000000000032), vec2(0.3975, 0.1450000' +
                                                           '0000000032), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.14500000000000032), vec2(0.4025, 0.1500000' +
                                                           '0000000033), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.15000000000000033), vec2(0.3975, 0.1550000' +
                                                           '0000000033), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.15500000000000033), vec2(0.4025, 0.1600000' +
                                                           '0000000034), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.16000000000000034), vec2(0.3975, 0.1650000' +
                                                           '0000000034), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.16500000000000034), vec2(0.4025, 0.1700000' +
                                                           '0000000035), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.17000000000000035), vec2(0.3975, 0.1750000' +
                                                           '0000000035), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.17500000000000035), vec2(0.4025, 0.1800000' +
                                                           '0000000035), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.18000000000000035), vec2(0.3975, 0.1850000' +
                                                           '0000000036), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.18500000000000036), vec2(0.4025, 0.1900000' +
                                                           '0000000036), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.19000000000000036), vec2(0.3975, 0.1950000' +
                                                           '0000000037), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.19500000000000037), vec2(0.4025, 0.2000000' +
                                                           '0000000037), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.20000000000000037), vec2(0.3975, 0.2050000' +
                                                           '0000000038), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.20500000000000038), vec2(0.4025, 0.2100000' +
                                                           '0000000038), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.21000000000000038), vec2(0.3975, 0.2150000' +
                                                           '0000000039), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.21500000000000039), vec2(0.4025, 0.2200000' +
                                                            '000000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2200000000000004), vec2(0.3975, 0.22500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.2250000000000004), vec2(0.4025, 0.23000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2300000000000004), vec2(0.3975, 0.23500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.2350000000000004), vec2(0.4025, 0.24000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2400000000000004), vec2(0.3975, 0.24500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.2450000000000004), vec2(0.4025, 0.25000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2500000000000004), vec2(0.3975, 0.25500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.2550000000000004), vec2(0.4025, 0.26000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2600000000000004), vec2(0.3975, 0.26500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.2650000000000004), vec2(0.4025, 0.27000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2700000000000004), vec2(0.3975, 0.27500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.2750000000000004), vec2(0.4025, 0.28000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2800000000000004), vec2(0.3975, 0.28500000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.2850000000000004), vec2(0.4025, 0.29000000' +
                                                             '00000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.2900000000000004), vec2(0.3975, 0.29500000' +
                                                            '000000043), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.29500000000000043), vec2(0.4025, 0.3000000' +
                                                           '0000000043), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.30000000000000043), vec2(0.3975, 0.3050000' +
                                                           '0000000044), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.30500000000000044), vec2(0.4025, 0.3100000' +
                                                           '0000000044), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.31000000000000044), vec2(0.3975, 0.3150000' +
                                                           '0000000045), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.31500000000000045), vec2(0.4025, 0.3200000' +
                                                           '0000000045), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.32000000000000045), vec2(0.3975, 0.3250000' +
                                                           '0000000046), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.32500000000000046), vec2(0.4025, 0.3300000' +
                                                           '0000000046), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.33000000000000046), vec2(0.3975, 0.3350000' +
                                                           '0000000046), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.33500000000000046), vec2(0.4025, 0.3400000' +
                                                           '0000000047), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.34000000000000047), vec2(0.3975, 0.3450000' +
                                                            '000000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.3450000000000005), vec2(0.4025, 0.35000000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.3500000000000005), vec2(0.3975, 0.35500000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.3550000000000005), vec2(0.4025, 0.36000000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.3600000000000005), vec2(0.3975, 0.36500000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.3650000000000005), vec2(0.4025, 0.37000000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.3700000000000005), vec2(0.3975, 0.37500000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.3750000000000005), vec2(0.4025, 0.38000000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.3800000000000005), vec2(0.3975, 0.38500000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.3850000000000005), vec2(0.4025, 0.39000000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4025, 0.3900000000000005), vec2(0.3975, 0.39500000' +
                                                             '00000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3975, 0.3950000000000005), vec2(0.4025, 0.40000000' +
                                                             '00000005), 0.0, isect);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20625, 0.0), vec2(1.1937499999999999, 0.0125), 0.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.0125), vec2(1.20625, 0.025), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.025), vec2(1.1937499999999999, 0.03750000' +
                                                           '0000000006), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.037500000000000006), vec2(1.20' +
                                                            '625, 0.05), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.05), vec2(1.1937499999999999, 0.0625), 0.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.0625), vec2(1.20625, 0.075), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.075), vec2(1.1937499999999999, 0.0875), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.0875), vec2(1.20625, 0.0999999' +
                                                           '9999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.09999999999999999), vec2(1.19374999999999' +
                                              '99, 0.11249999999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.11249999999999999), vec2(1.206' +
                                              '25, 0.12499999999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.12499999999999999), vec2(1.19374999999999' +
                                              '99, 0.13749999999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.13749999999999998), vec2(1.206' +
                                                             '25, 0.15), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.15), vec2(1.1937499999999999, 0.1625), 0.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.1625), vec2(1.20625, 0.1750000' +
                                                           '0000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.17500000000000002), vec2(1.19374999999999' +
                                              '99, 0.18750000000000003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.18750000000000003), vec2(1.206' +
                                              '25, 0.20000000000000004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.20000000000000004), vec2(1.19374999999999' +
                                              '99, 0.21250000000000005), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.21250000000000005), vec2(1.206' +
                                              '25, 0.22500000000000006), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.22500000000000006), vec2(1.19374999999999' +
                                              '99, 0.23750000000000007), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.23750000000000007), vec2(1.206' +
                                              '25, 0.25000000000000006), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.25000000000000006), vec2(1.19374999999999' +
                                              '99, 0.26250000000000007), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.26250000000000007), vec2(1.206' +
                                               '25, 0.2750000000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.2750000000000001), vec2(1.193749999999999' +
                                                '9, 0.2875000000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.2875000000000001), vec2(1.2062' +
                                                '5, 0.3000000000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.3000000000000001), vec2(1.193749999999999' +
                                                '9, 0.3125000000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.3125000000000001), vec2(1.2062' +
                                                '5, 0.3250000000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.3250000000000001), vec2(1.193749999999999' +
                                               '9, 0.33750000000000013), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.33750000000000013), vec2(1.206' +
                                              '25, 0.35000000000000014), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.35000000000000014), vec2(1.19374999999999' +
                                              '99, 0.36250000000000016), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.36250000000000016), vec2(1.206' +
                                              '25, 0.37500000000000017), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.37500000000000017), vec2(1.19374999999999' +
                                               '99, 0.3875000000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.3875000000000002), vec2(1.2062' +
                                                '5, 0.4000000000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.4000000000000002), vec2(1.193749999999999' +
                                                '9, 0.4125000000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.4125000000000002), vec2(1.2062' +
                                                '5, 0.4250000000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.4250000000000002), vec2(1.193749999999999' +
                                                '9, 0.4375000000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.4375000000000002), vec2(1.2062' +
                                               '5, 0.45000000000000023), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.45000000000000023), vec2(1.19374999999999' +
                                              '99, 0.46250000000000024), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.46250000000000024), vec2(1.206' +
                                              '25, 0.47500000000000026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.47500000000000026), vec2(1.19374999999999' +
                                              '99, 0.48750000000000027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.48750000000000027), vec2(1.206' +
                                               '25, 0.5000000000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.5000000000000002), vec2(1.193749999999999' +
                                                '9, 0.5125000000000002), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.5125000000000002), vec2(1.2062' +
                                                '5, 0.5250000000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.5250000000000001), vec2(1.193749999999999' +
                                                '9, 0.5375000000000001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.5375000000000001), vec2(1.2062' +
                                                              '5, 0.55), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.55), vec2(1.1937499999999999, 0.5625), 0.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.5625), vec2(1.20625, 0.575), 0' +
                                                                         '.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.575), vec2(1.1937499999999999, 0.58749999' +
                                                             '99999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.5874999999999999), vec2(1.2062' +
                                                '5, 0.5999999999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.5999999999999999), vec2(1.193749999999999' +
                                                '9, 0.6124999999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.6124999999999998), vec2(1.2062' +
                                                '5, 0.6249999999999998), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.6249999999999998), vec2(1.193749999999999' +
                                                '9, 0.6374999999999997), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.6374999999999997), vec2(1.2062' +
                                                '5, 0.6499999999999997), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.6499999999999997), vec2(1.193749999999999' +
                                                '9, 0.6624999999999996), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.6624999999999996), vec2(1.2062' +
                                                '5, 0.6749999999999996), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.6749999999999996), vec2(1.193749999999999' +
                                                '9, 0.6874999999999996), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.6874999999999996), vec2(1.2062' +
                                                '5, 0.6999999999999995), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.6999999999999995), vec2(1.193749999999999' +
                                                '9, 0.7124999999999995), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.7124999999999995), vec2(1.2062' +
                                                '5, 0.7249999999999994), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.7249999999999994), vec2(1.193749999999999' +
                                                '9, 0.7374999999999994), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.7374999999999994), vec2(1.2062' +
                                                '5, 0.7499999999999993), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.7499999999999993), vec2(1.193749999999999' +
                                                '9, 0.7624999999999993), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.7624999999999993), vec2(1.2062' +
                                                '5, 0.7749999999999992), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.7749999999999992), vec2(1.193749999999999' +
                                                '9, 0.7874999999999992), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.7874999999999992), vec2(1.2062' +
                                                '5, 0.7999999999999992), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.7999999999999992), vec2(1.193749999999999' +
                                                '9, 0.8124999999999991), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.8124999999999991), vec2(1.2062' +
                                                '5, 0.8249999999999991), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.8249999999999991), vec2(1.193749999999999' +
                                                 '9, 0.837499999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.837499999999999), vec2(1.20625' +
                                                  ', 0.849999999999999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.849999999999999), vec2(1.1937499999999999' +
                                                 ', 0.8624999999999989), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.8624999999999989), vec2(1.2062' +
                                                '5, 0.8749999999999989), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.8749999999999989), vec2(1.193749999999999' +
                                                '9, 0.8874999999999988), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.8874999999999988), vec2(1.2062' +
                                                '5, 0.8999999999999988), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.8999999999999988), vec2(1.193749999999999' +
                                                '9, 0.9124999999999988), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.9124999999999988), vec2(1.2062' +
                                                '5, 0.9249999999999987), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.9249999999999987), vec2(1.193749999999999' +
                                                '9, 0.9374999999999987), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.9374999999999987), vec2(1.2062' +
                                                '5, 0.9499999999999986), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.9499999999999986), vec2(1.193749999999999' +
                                                '9, 0.9624999999999986), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.9624999999999986), vec2(1.2062' +
                                                '5, 0.9749999999999985), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.9749999999999985), vec2(1.193749999999999' +
                                                '9, 0.9874999999999985), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1937499999999999, 0.9874999999999985), vec2(1.2062' +
                                                '5, 0.9999999999999984), 0.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene41-ku-semi-rough-8xsmall':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.4), vec2(0.39875389408099693,' +
                                                 ' -0.3975077881619938), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3975077881619938), vec2(0.40' +
                                 '12461059190031, -0.39501557632398754), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.39501557632398754), vec2(0.39' +
                                 '875389408099693, -0.3925233644859813), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3925233644859813), vec2(0.40' +
                                 '12461059190031, -0.39003115264797505), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.39003115264797505), vec2(0.39' +
                                 '875389408099693, -0.3875389408099688), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3875389408099688), vec2(0.40' +
                                 '12461059190031, -0.38504672897196257), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.38504672897196257), vec2(0.39' +
                                '875389408099693, -0.38255451713395633), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.38255451713395633), vec2(0.4' +
                                 '012461059190031, -0.3800623052959501), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3800623052959501), vec2(0.398' +
                                 '75389408099693, -0.37757009345794385), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.37757009345794385), vec2(0.4' +
                                 '012461059190031, -0.3750778816199376), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3750778816199376), vec2(0.398' +
                                 '75389408099693, -0.37258566978193136), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.37258566978193136), vec2(0.4' +
                                 '012461059190031, -0.3700934579439251), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3700934579439251), vec2(0.398' +
                                  '75389408099693, -0.3676012461059189), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3676012461059189), vec2(0.40' +
                                 '12461059190031, -0.36510903426791264), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.36510903426791264), vec2(0.39' +
                                 '875389408099693, -0.3626168224299064), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3626168224299064), vec2(0.40' +
                                 '12461059190031, -0.36012461059190015), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.36012461059190015), vec2(0.39' +
                                 '875389408099693, -0.3576323987538939), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3576323987538939), vec2(0.40' +
                                 '12461059190031, -0.35514018691588767), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.35514018691588767), vec2(0.39' +
                                 '875389408099693, -0.3526479750778814), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3526479750778814), vec2(0.40' +
                                  '12461059190031, -0.3501557632398752), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3501557632398752), vec2(0.398' +
                                 '75389408099693, -0.34766355140186894), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.34766355140186894), vec2(0.4' +
                                 '012461059190031, -0.3451713395638627), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3451713395638627), vec2(0.398' +
                                 '75389408099693, -0.34267912772585646), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.34267912772585646), vec2(0.4' +
                                 '012461059190031, -0.3401869158878502), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3401869158878502), vec2(0.398' +
                                   '75389408099693, -0.337694704049844), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.337694704049844), vec2(0.401' +
                                  '2461059190031, -0.33520249221183773), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.33520249221183773), vec2(0.39' +
                                 '875389408099693, -0.3327102803738315), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3327102803738315), vec2(0.40' +
                                 '12461059190031, -0.33021806853582525), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.33021806853582525), vec2(0.39' +
                                  '875389408099693, -0.327725856697819), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.327725856697819), vec2(0.401' +
                                  '2461059190031, -0.32523364485981276), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.32523364485981276), vec2(0.39' +
                                 '875389408099693, -0.3227414330218065), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3227414330218065), vec2(0.40' +
                                  '12461059190031, -0.3202492211838003), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3202492211838003), vec2(0.398' +
                                 '75389408099693, -0.31775700934579404), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.31775700934579404), vec2(0.4' +
                                 '012461059190031, -0.3152647975077878), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3152647975077878), vec2(0.398' +
                                 '75389408099693, -0.31277258566978156), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.31277258566978156), vec2(0.4' +
                                 '012461059190031, -0.3102803738317753), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.3102803738317753), vec2(0.398' +
                                 '75389408099693, -0.30778816199376907), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.30778816199376907), vec2(0.4' +
                                '012461059190031, -0.30529595015576283), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.30529595015576283), vec2(0.39' +
                                 '875389408099693, -0.3028037383177566), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.3028037383177566), vec2(0.40' +
                                 '12461059190031, -0.30031152647975035), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.30031152647975035), vec2(0.39' +
                                 '875389408099693, -0.2978193146417441), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2978193146417441), vec2(0.40' +
                                 '12461059190031, -0.29532710280373786), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.29532710280373786), vec2(0.39' +
                                 '875389408099693, -0.2928348909657316), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2928348909657316), vec2(0.40' +
                                  '12461059190031, -0.2903426791277254), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2903426791277254), vec2(0.398' +
                                 '75389408099693, -0.28785046728971914), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.28785046728971914), vec2(0.4' +
                                 '012461059190031, -0.2853582554517129), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2853582554517129), vec2(0.398' +
                                 '75389408099693, -0.28286604361370665), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.28286604361370665), vec2(0.4' +
                                 '012461059190031, -0.2803738317757004), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2803738317757004), vec2(0.398' +
                                 '75389408099693, -0.27788161993769417), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.27788161993769417), vec2(0.4' +
                                 '012461059190031, -0.2753894080996879), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2753894080996879), vec2(0.398' +
                                  '75389408099693, -0.2728971962616817), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2728971962616817), vec2(0.40' +
                                 '12461059190031, -0.27040498442367544), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.27040498442367544), vec2(0.39' +
                                 '875389408099693, -0.2679127725856692), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2679127725856692), vec2(0.40' +
                                 '12461059190031, -0.26542056074766296), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.26542056074766296), vec2(0.39' +
                                 '875389408099693, -0.2629283489096567), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2629283489096567), vec2(0.40' +
                                  '12461059190031, -0.2604361370716505), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2604361370716505), vec2(0.398' +
                                 '75389408099693, -0.25794392523364423), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.25794392523364423), vec2(0.4' +
                                  '012461059190031, -0.255451713395638), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.255451713395638), vec2(0.3987' +
                                  '5389408099693, -0.25295950155763175), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.25295950155763175), vec2(0.4' +
                                 '012461059190031, -0.2504672897196255), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2504672897196255), vec2(0.398' +
                                 '75389408099693, -0.24797507788161927), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.24797507788161927), vec2(0.4' +
                                '012461059190031, -0.24548286604361302), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.24548286604361302), vec2(0.39' +
                                '875389408099693, -0.24299065420560678), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.24299065420560678), vec2(0.4' +
                                '012461059190031, -0.24049844236760054), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.24049844236760054), vec2(0.39' +
                                 '875389408099693, -0.2380062305295943), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2380062305295943), vec2(0.40' +
                                 '12461059190031, -0.23551401869158806), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.23551401869158806), vec2(0.39' +
                                '875389408099693, -0.23302180685358181), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.23302180685358181), vec2(0.4' +
                                '012461059190031, -0.23052959501557557), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.23052959501557557), vec2(0.39' +
                                '875389408099693, -0.22803738317756933), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.22803738317756933), vec2(0.4' +
                                 '012461059190031, -0.2255451713395631), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2255451713395631), vec2(0.398' +
                                 '75389408099693, -0.22305295950155685), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.22305295950155685), vec2(0.4' +
                                 '012461059190031, -0.2205607476635506), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.2205607476635506), vec2(0.398' +
                                 '75389408099693, -0.21806853582554436), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.21806853582554436), vec2(0.4' +
                                '012461059190031, -0.21557632398753812), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.21557632398753812), vec2(0.39' +
                                '875389408099693, -0.21308411214953188), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.21308411214953188), vec2(0.4' +
                                '012461059190031, -0.21059190031152564), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.21059190031152564), vec2(0.39' +
                                 '875389408099693, -0.2080996884735194), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2080996884735194), vec2(0.40' +
                                 '12461059190031, -0.20560747663551315), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.20560747663551315), vec2(0.39' +
                                 '875389408099693, -0.2031152647975069), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.2031152647975069), vec2(0.40' +
                                 '12461059190031, -0.20062305295950067), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.20062305295950067), vec2(0.39' +
                                '875389408099693, -0.19813084112149443), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.19813084112149443), vec2(0.4' +
                                '012461059190031, -0.19563862928348819), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.19563862928348819), vec2(0.39' +
                                '875389408099693, -0.19314641744548194), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.19314641744548194), vec2(0.4' +
                                 '012461059190031, -0.1906542056074757), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.1906542056074757), vec2(0.398' +
                                 '75389408099693, -0.18816199376946946), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.18816199376946946), vec2(0.4' +
                                '012461059190031, -0.18566978193146322), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.18566978193146322), vec2(0.39' +
                                '875389408099693, -0.18317757009345698), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.18317757009345698), vec2(0.4' +
                                '012461059190031, -0.18068535825545073), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.18068535825545073), vec2(0.39' +
                                 '875389408099693, -0.1781931464174445), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.1781931464174445), vec2(0.40' +
                                 '12461059190031, -0.17570093457943825), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.17570093457943825), vec2(0.39' +
                                  '875389408099693, -0.173208722741432), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.173208722741432), vec2(0.401' +
                                  '2461059190031, -0.17071651090342577), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.17071651090342577), vec2(0.39' +
                                '875389408099693, -0.16822429906541952), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.16822429906541952), vec2(0.4' +
                                '012461059190031, -0.16573208722741328), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.16573208722741328), vec2(0.39' +
                                '875389408099693, -0.16323987538940704), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.16323987538940704), vec2(0.4' +
                                 '012461059190031, -0.1607476635514008), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.1607476635514008), vec2(0.398' +
                                 '75389408099693, -0.15825545171339456), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.15825545171339456), vec2(0.4' +
                                '012461059190031, -0.15576323987538832), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.15576323987538832), vec2(0.39' +
                                '875389408099693, -0.15327102803738207), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.15327102803738207), vec2(0.4' +
                                '012461059190031, -0.15077881619937583), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.15077881619937583), vec2(0.39' +
                                 '875389408099693, -0.1482866043613696), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.1482866043613696), vec2(0.40' +
                                 '12461059190031, -0.14579439252336335), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.14579439252336335), vec2(0.39' +
                                 '875389408099693, -0.1433021806853571), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.1433021806853571), vec2(0.40' +
                                 '12461059190031, -0.14080996884735086), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.14080996884735086), vec2(0.39' +
                                '875389408099693, -0.13831775700934462), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.13831775700934462), vec2(0.4' +
                                '012461059190031, -0.13582554517133838), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.13582554517133838), vec2(0.39' +
                                '875389408099693, -0.13333333333333214), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.13333333333333214), vec2(0.4' +
                                 '012461059190031, -0.1308411214953259), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.1308411214953259), vec2(0.398' +
                                 '75389408099693, -0.12834890965731965), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.12834890965731965), vec2(0.4' +
                                 '012461059190031, -0.1258566978193134), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.1258566978193134), vec2(0.398' +
                                 '75389408099693, -0.12336448598130718), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.12336448598130718), vec2(0.4' +
                                '012461059190031, -0.12087227414330096), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.12087227414330096), vec2(0.39' +
                                '875389408099693, -0.11838006230529473), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.11838006230529473), vec2(0.4' +
                                 '012461059190031, -0.1158878504672885), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.1158878504672885), vec2(0.398' +
                                 '75389408099693, -0.11339563862928227), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.11339563862928227), vec2(0.4' +
                                '012461059190031, -0.11090342679127604), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.11090342679127604), vec2(0.39' +
                                '875389408099693, -0.10841121495326982), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.10841121495326982), vec2(0.4' +
                                '012461059190031, -0.10591900311526359), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.10591900311526359), vec2(0.39' +
                                '875389408099693, -0.10342679127725736), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.10342679127725736), vec2(0.4' +
                                '012461059190031, -0.10093457943925113), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.10093457943925113), vec2(0.39' +
                                 '875389408099693, -0.0984423676012449), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.0984423676012449), vec2(0.40' +
                                 '12461059190031, -0.09595015576323868), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.09595015576323868), vec2(0.39' +
                                '875389408099693, -0.09345794392523245), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.09345794392523245), vec2(0.4' +
                                '012461059190031, -0.09096573208722622), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.09096573208722622), vec2(0.39' +
                                '875389408099693, -0.08847352024921999), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.08847352024921999), vec2(0.4' +
                                '012461059190031, -0.08598130841121376), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.08598130841121376), vec2(0.39' +
                                '875389408099693, -0.08348909657320754), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.08348909657320754), vec2(0.4' +
                                '012461059190031, -0.08099688473520131), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.08099688473520131), vec2(0.39' +
                                '875389408099693, -0.07850467289719508), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.07850467289719508), vec2(0.4' +
                                '012461059190031, -0.07601246105918885), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.07601246105918885), vec2(0.39' +
                                '875389408099693, -0.07352024922118262), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.07352024922118262), vec2(0.4' +
                                 '012461059190031, -0.0710280373831764), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.0710280373831764), vec2(0.398' +
                                 '75389408099693, -0.06853582554517017), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.06853582554517017), vec2(0.4' +
                                '012461059190031, -0.06604361370716394), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.06604361370716394), vec2(0.39' +
                                '875389408099693, -0.06355140186915771), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.06355140186915771), vec2(0.4' +
                                '012461059190031, -0.06105919003115148), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.06105919003115148), vec2(0.39' +
                               '875389408099693, -0.058566978193145255), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.058566978193145255), vec2(0.' +
                               '4012461059190031, -0.05607476635513903), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.05607476635513903), vec2(0.39' +
                                 '875389408099693, -0.0535825545171328), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.0535825545171328), vec2(0.40' +
                                 '12461059190031, -0.05109034267912657), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.05109034267912657), vec2(0.39' +
                                '875389408099693, -0.04859813084112034), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.04859813084112034), vec2(0.4' +
                               '012461059190031, -0.046105919003114115), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.046105919003114115), vec2(0.3' +
                               '9875389408099693, -0.04361370716510789), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.04361370716510789), vec2(0.4' +
                                '012461059190031, -0.04112149532710166), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.04112149532710166), vec2(0.39' +
                                '875389408099693, -0.03862928348909543), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.03862928348909543), vec2(0.4' +
                                 '012461059190031, -0.0361370716510892), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.0361370716510892), vec2(0.398' +
                                '75389408099693, -0.033644859813082975), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.033644859813082975), vec2(0.' +
                              '4012461059190031, -0.031152647975076744), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.031152647975076744), vec2(0.3' +
                              '9875389408099693, -0.028660436137070512), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.028660436137070512), vec2(0.' +
                               '4012461059190031, -0.02616822429906428), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.02616822429906428), vec2(0.39' +
                                '875389408099693, -0.02367601246105805), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.02367601246105805), vec2(0.4' +
                               '012461059190031, -0.021183800623051818), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.021183800623051818), vec2(0.3' +
                              '9875389408099693, -0.018691588785045586), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.018691588785045586), vec2(0.' +
                              '4012461059190031, -0.016199376947039355), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.016199376947039355), vec2(0.3' +
                              '9875389408099693, -0.013707165109033123), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.013707165109033123), vec2(0.' +
                              '4012461059190031, -0.011214953271026892), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.011214953271026892), vec2(0.3' +
                               '9875389408099693, -0.00872274143302066), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.00872274143302066), vec2(0.4' +
                              '012461059190031, -0.0062305295950144295), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.0062305295950144295), vec2(0.' +
                             '39875389408099693, -0.003738317757008199), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, -0.003738317757008199), vec2(0.' +
                             '4012461059190031, -0.0012461059190019682), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, -0.0012461059190019682), vec2(0.' +
                             '39875389408099693, 0.0012461059190042624), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.0012461059190042624), vec2(0.' +
                               '4012461059190031, 0.003738317757010493), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.003738317757010493), vec2(0.39' +
                                '875389408099693, 0.006230529595016724), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.006230529595016724), vec2(0.4' +
                                '012461059190031, 0.008722741433022953), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.008722741433022953), vec2(0.39' +
                                '875389408099693, 0.011214953271029185), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.011214953271029185), vec2(0.4' +
                                '012461059190031, 0.013707165109035416), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.013707165109035416), vec2(0.39' +
                                '875389408099693, 0.016199376947041648), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.016199376947041648), vec2(0.4' +
                                 '012461059190031, 0.01869158878504788), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.01869158878504788), vec2(0.398' +
                                  '75389408099693, 0.02118380062305411), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.02118380062305411), vec2(0.40' +
                                 '12461059190031, 0.023676012461060342), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.023676012461060342), vec2(0.39' +
                                '875389408099693, 0.026168224299066574), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.026168224299066574), vec2(0.4' +
                                '012461059190031, 0.028660436137072805), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.028660436137072805), vec2(0.39' +
                                '875389408099693, 0.031152647975079037), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.031152647975079037), vec2(0.4' +
                                '012461059190031, 0.033644859813085265), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.033644859813085265), vec2(0.39' +
                                 '875389408099693, 0.03613707165109149), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.03613707165109149), vec2(0.40' +
                                  '12461059190031, 0.03862928348909772), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.03862928348909772), vec2(0.398' +
                                  '75389408099693, 0.04112149532710395), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.04112149532710395), vec2(0.40' +
                                  '12461059190031, 0.04361370716511018), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.04361370716511018), vec2(0.398' +
                                 '75389408099693, 0.046105919003116405), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.046105919003116405), vec2(0.4' +
                                 '012461059190031, 0.04859813084112263), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.04859813084112263), vec2(0.398' +
                                  '75389408099693, 0.05109034267912886), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.05109034267912886), vec2(0.40' +
                                  '12461059190031, 0.05358255451713509), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.05358255451713509), vec2(0.398' +
                                  '75389408099693, 0.05607476635514132), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.05607476635514132), vec2(0.40' +
                                 '12461059190031, 0.058566978193147545), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.058566978193147545), vec2(0.39' +
                                 '875389408099693, 0.06105919003115377), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.06105919003115377), vec2(0.40' +
                                     '12461059190031, 0.06355140186916), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.06355140186916), vec2(0.398753' +
                                     '89408099693, 0.06604361370716623), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.06604361370716623), vec2(0.40' +
                                  '12461059190031, 0.06853582554517246), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.06853582554517246), vec2(0.398' +
                                  '75389408099693, 0.07102803738317869), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.07102803738317869), vec2(0.40' +
                                  '12461059190031, 0.07352024922118491), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.07352024922118491), vec2(0.398' +
                                  '75389408099693, 0.07601246105919114), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.07601246105919114), vec2(0.40' +
                                  '12461059190031, 0.07850467289719737), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.07850467289719737), vec2(0.398' +
                                   '75389408099693, 0.0809968847352036), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.0809968847352036), vec2(0.401' +
                                   '2461059190031, 0.08348909657320983), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.08348909657320983), vec2(0.398' +
                                  '75389408099693, 0.08598130841121605), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.08598130841121605), vec2(0.40' +
                                  '12461059190031, 0.08847352024922228), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.08847352024922228), vec2(0.398' +
                                  '75389408099693, 0.09096573208722851), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.09096573208722851), vec2(0.40' +
                                  '12461059190031, 0.09345794392523474), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.09345794392523474), vec2(0.398' +
                                  '75389408099693, 0.09595015576324097), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.09595015576324097), vec2(0.40' +
                                   '12461059190031, 0.0984423676012472), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.0984423676012472), vec2(0.3987' +
                                   '5389408099693, 0.10093457943925342), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.10093457943925342), vec2(0.40' +
                                  '12461059190031, 0.10342679127725965), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.10342679127725965), vec2(0.398' +
                                  '75389408099693, 0.10591900311526588), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.10591900311526588), vec2(0.40' +
                                   '12461059190031, 0.1084112149532721), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.1084112149532721), vec2(0.3987' +
                                   '5389408099693, 0.11090342679127833), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.11090342679127833), vec2(0.40' +
                                  '12461059190031, 0.11339563862928456), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.11339563862928456), vec2(0.398' +
                                  '75389408099693, 0.11588785046729079), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.11588785046729079), vec2(0.40' +
                                  '12461059190031, 0.11838006230529702), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.11838006230529702), vec2(0.398' +
                                  '75389408099693, 0.12087227414330325), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.12087227414330325), vec2(0.40' +
                                  '12461059190031, 0.12336448598130947), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.12336448598130947), vec2(0.398' +
                                  '75389408099693, 0.12585669781931572), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.12585669781931572), vec2(0.40' +
                                  '12461059190031, 0.12834890965732196), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.12834890965732196), vec2(0.398' +
                                   '75389408099693, 0.1308411214953282), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.1308411214953282), vec2(0.401' +
                                   '2461059190031, 0.13333333333333444), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.13333333333333444), vec2(0.398' +
                                  '75389408099693, 0.13582554517134068), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.13582554517134068), vec2(0.40' +
                                  '12461059190031, 0.13831775700934693), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.13831775700934693), vec2(0.398' +
                                  '75389408099693, 0.14080996884735317), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.14080996884735317), vec2(0.40' +
                                   '12461059190031, 0.1433021806853594), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.1433021806853594), vec2(0.3987' +
                                   '5389408099693, 0.14579439252336565), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.14579439252336565), vec2(0.40' +
                                   '12461059190031, 0.1482866043613719), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.1482866043613719), vec2(0.3987' +
                                   '5389408099693, 0.15077881619937814), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.15077881619937814), vec2(0.40' +
                                  '12461059190031, 0.15327102803738438), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.15327102803738438), vec2(0.398' +
                                  '75389408099693, 0.15576323987539062), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.15576323987539062), vec2(0.40' +
                                  '12461059190031, 0.15825545171339686), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.15825545171339686), vec2(0.398' +
                                   '75389408099693, 0.1607476635514031), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.1607476635514031), vec2(0.401' +
                                   '2461059190031, 0.16323987538940934), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.16323987538940934), vec2(0.398' +
                                   '75389408099693, 0.1657320872274156), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.1657320872274156), vec2(0.401' +
                                   '2461059190031, 0.16822429906542183), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.16822429906542183), vec2(0.398' +
                                  '75389408099693, 0.17071651090342807), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.17071651090342807), vec2(0.40' +
                                   '12461059190031, 0.1732087227414343), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.1732087227414343), vec2(0.3987' +
                                   '5389408099693, 0.17570093457944055), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.17570093457944055), vec2(0.40' +
                                   '12461059190031, 0.1781931464174468), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.1781931464174468), vec2(0.3987' +
                                   '5389408099693, 0.18068535825545304), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.18068535825545304), vec2(0.40' +
                                  '12461059190031, 0.18317757009345928), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.18317757009345928), vec2(0.398' +
                                  '75389408099693, 0.18566978193146552), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.18566978193146552), vec2(0.40' +
                                  '12461059190031, 0.18816199376947176), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.18816199376947176), vec2(0.398' +
                                    '75389408099693, 0.190654205607478), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.190654205607478), vec2(0.4012' +
                                    '461059190031, 0.19314641744548425), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.19314641744548425), vec2(0.398' +
                                   '75389408099693, 0.1956386292834905), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.1956386292834905), vec2(0.401' +
                                   '2461059190031, 0.19813084112149673), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.19813084112149673), vec2(0.398' +
                                  '75389408099693, 0.20062305295950297), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.20062305295950297), vec2(0.40' +
                                  '12461059190031, 0.20311526479750922), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.20311526479750922), vec2(0.398' +
                                  '75389408099693, 0.20560747663551546), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.20560747663551546), vec2(0.40' +
                                   '12461059190031, 0.2080996884735217), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.2080996884735217), vec2(0.3987' +
                                   '5389408099693, 0.21059190031152794), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.21059190031152794), vec2(0.40' +
                                  '12461059190031, 0.21308411214953418), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.21308411214953418), vec2(0.398' +
                                  '75389408099693, 0.21557632398754042), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.21557632398754042), vec2(0.40' +
                                  '12461059190031, 0.21806853582554667), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.21806853582554667), vec2(0.398' +
                                   '75389408099693, 0.2205607476635529), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.2205607476635529), vec2(0.401' +
                                   '2461059190031, 0.22305295950155915), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.22305295950155915), vec2(0.398' +
                                   '75389408099693, 0.2255451713395654), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.2255451713395654), vec2(0.401' +
                                   '2461059190031, 0.22803738317757163), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.22803738317757163), vec2(0.398' +
                                  '75389408099693, 0.23052959501557788), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.23052959501557788), vec2(0.40' +
                                  '12461059190031, 0.23302180685358412), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.23302180685358412), vec2(0.398' +
                                  '75389408099693, 0.23551401869159036), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.23551401869159036), vec2(0.40' +
                                   '12461059190031, 0.2380062305295966), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.2380062305295966), vec2(0.3987' +
                                   '5389408099693, 0.24049844236760284), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.24049844236760284), vec2(0.40' +
                                  '12461059190031, 0.24299065420560909), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.24299065420560909), vec2(0.398' +
                                  '75389408099693, 0.24548286604361533), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.24548286604361533), vec2(0.40' +
                                  '12461059190031, 0.24797507788162157), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.24797507788162157), vec2(0.398' +
                                   '75389408099693, 0.2504672897196278), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.2504672897196278), vec2(0.401' +
                                     '2461059190031, 0.252959501557634), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.252959501557634), vec2(0.39875' +
                                    '389408099693, 0.25545171339564027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.25545171339564027), vec2(0.40' +
                                   '12461059190031, 0.2579439252336465), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.2579439252336465), vec2(0.3987' +
                                   '5389408099693, 0.26043613707165275), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.26043613707165275), vec2(0.40' +
                                    '12461059190031, 0.262928348909659), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.262928348909659), vec2(0.39875' +
                                    '389408099693, 0.26542056074766524), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.26542056074766524), vec2(0.40' +
                                   '12461059190031, 0.2679127725856715), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.2679127725856715), vec2(0.3987' +
                                    '5389408099693, 0.2704049844236777), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.2704049844236777), vec2(0.401' +
                                   '2461059190031, 0.27289719626168396), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.27289719626168396), vec2(0.398' +
                                   '75389408099693, 0.2753894080996902), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.2753894080996902), vec2(0.401' +
                                   '2461059190031, 0.27788161993769644), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.27788161993769644), vec2(0.398' +
                                   '75389408099693, 0.2803738317757027), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.2803738317757027), vec2(0.401' +
                                   '2461059190031, 0.28286604361370893), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.28286604361370893), vec2(0.398' +
                                  '75389408099693, 0.28535825545171517), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.28535825545171517), vec2(0.40' +
                                   '12461059190031, 0.2878504672897214), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.2878504672897214), vec2(0.3987' +
                                   '5389408099693, 0.29034267912772765), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.29034267912772765), vec2(0.40' +
                                   '12461059190031, 0.2928348909657339), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.2928348909657339), vec2(0.3987' +
                                   '5389408099693, 0.29532710280374014), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.29532710280374014), vec2(0.40' +
                                   '12461059190031, 0.2978193146417464), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.2978193146417464), vec2(0.3987' +
                                    '5389408099693, 0.3003115264797526), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3003115264797526), vec2(0.401' +
                                   '2461059190031, 0.30280373831775886), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.30280373831775886), vec2(0.398' +
                                   '75389408099693, 0.3052959501557651), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3052959501557651), vec2(0.401' +
                                   '2461059190031, 0.30778816199377135), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.30778816199377135), vec2(0.398' +
                                   '75389408099693, 0.3102803738317776), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3102803738317776), vec2(0.401' +
                                   '2461059190031, 0.31277258566978383), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.31277258566978383), vec2(0.398' +
                                   '75389408099693, 0.3152647975077901), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3152647975077901), vec2(0.401' +
                                    '2461059190031, 0.3177570093457963), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3177570093457963), vec2(0.3987' +
                                   '5389408099693, 0.32024922118380256), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.32024922118380256), vec2(0.40' +
                                   '12461059190031, 0.3227414330218088), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3227414330218088), vec2(0.3987' +
                                   '5389408099693, 0.32523364485981504), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.32523364485981504), vec2(0.40' +
                                   '12461059190031, 0.3277258566978213), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3277258566978213), vec2(0.3987' +
                                    '5389408099693, 0.3302180685358275), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3302180685358275), vec2(0.401' +
                                   '2461059190031, 0.33271028037383377), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.33271028037383377), vec2(0.398' +
                                     '75389408099693, 0.33520249221184), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.33520249221184), vec2(0.40124' +
                                     '61059190031, 0.33769470404984625), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.33769470404984625), vec2(0.398' +
                                   '75389408099693, 0.3401869158878525), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3401869158878525), vec2(0.401' +
                                   '2461059190031, 0.34267912772585873), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.34267912772585873), vec2(0.398' +
                                    '75389408099693, 0.345171339563865), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.345171339563865), vec2(0.4012' +
                                     '461059190031, 0.3476635514018712), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3476635514018712), vec2(0.3987' +
                                   '5389408099693, 0.35015576323987746), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.35015576323987746), vec2(0.40' +
                                   '12461059190031, 0.3526479750778837), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3526479750778837), vec2(0.3987' +
                                   '5389408099693, 0.35514018691588994), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.35514018691588994), vec2(0.40' +
                                   '12461059190031, 0.3576323987538962), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3576323987538962), vec2(0.3987' +
                                    '5389408099693, 0.3601246105919024), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3601246105919024), vec2(0.401' +
                                   '2461059190031, 0.36261682242990867), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.36261682242990867), vec2(0.398' +
                                   '75389408099693, 0.3651090342679149), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3651090342679149), vec2(0.401' +
                                   '2461059190031, 0.36760124610592115), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.36760124610592115), vec2(0.398' +
                                   '75389408099693, 0.3700934579439274), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3700934579439274), vec2(0.401' +
                                   '2461059190031, 0.37258566978193364), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.37258566978193364), vec2(0.398' +
                                   '75389408099693, 0.3750778816199399), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3750778816199399), vec2(0.401' +
                                    '2461059190031, 0.3775700934579461), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3775700934579461), vec2(0.3987' +
                                   '5389408099693, 0.38006230529595236), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.38006230529595236), vec2(0.40' +
                                   '12461059190031, 0.3825545171339586), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3825545171339586), vec2(0.3987' +
                                   '5389408099693, 0.38504672897196485), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.38504672897196485), vec2(0.40' +
                                   '12461059190031, 0.3875389408099711), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3875389408099711), vec2(0.3987' +
                                   '5389408099693, 0.39003115264797733), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.39003115264797733), vec2(0.40' +
                                   '12461059190031, 0.3925233644859836), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.3925233644859836), vec2(0.3987' +
                                    '5389408099693, 0.3950155763239898), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39875389408099693, 0.3950155763239898), vec2(0.401' +
                                   '2461059190031, 0.39750778816199606), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4012461059190031, 0.39750778816199606), vec2(0.398' +
                                   '75389408099693, 0.4000000000000023), 0.0, isect);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.0), vec2(1.1968944099378882, 0' +
                                                  '.006211180124223602), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.006211180124223602), vec2(1.20' +
                                 '31055900621117, 0.012422360248447204), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.012422360248447204), vec2(1.19' +
                                 '68944099378882, 0.018633540372670808), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.018633540372670808), vec2(1.20' +
                                 '31055900621117, 0.024844720496894408), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.024844720496894408), vec2(1.19' +
                                  '68944099378882, 0.03105590062111801), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.03105590062111801), vec2(1.203' +
                                   '1055900621117, 0.03726708074534161), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.03726708074534161), vec2(1.196' +
                                   '8944099378882, 0.04347826086956521), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.04347826086956521), vec2(1.203' +
                                   '1055900621117, 0.04968944099378881), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.04968944099378881), vec2(1.196' +
                                   '8944099378882, 0.05590062111801241), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.05590062111801241), vec2(1.203' +
                                   '1055900621117, 0.06211180124223601), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.06211180124223601), vec2(1.196' +
                                   '8944099378882, 0.06832298136645962), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.06832298136645962), vec2(1.203' +
                                   '1055900621117, 0.07453416149068322), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.07453416149068322), vec2(1.196' +
                                   '8944099378882, 0.08074534161490682), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.08074534161490682), vec2(1.203' +
                                   '1055900621117, 0.08695652173913042), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.08695652173913042), vec2(1.196' +
                                   '8944099378882, 0.09316770186335402), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.09316770186335402), vec2(1.203' +
                                   '1055900621117, 0.09937888198757762), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.09937888198757762), vec2(1.196' +
                                   '8944099378882, 0.10559006211180122), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.10559006211180122), vec2(1.203' +
                                   '1055900621117, 0.11180124223602482), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.11180124223602482), vec2(1.196' +
                                   '8944099378882, 0.11801242236024842), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.11801242236024842), vec2(1.203' +
                                   '1055900621117, 0.12422360248447202), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.12422360248447202), vec2(1.196' +
                                   '8944099378882, 0.13043478260869562), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.13043478260869562), vec2(1.203' +
                                   '1055900621117, 0.13664596273291924), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.13664596273291924), vec2(1.196' +
                                   '8944099378882, 0.14285714285714285), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.14285714285714285), vec2(1.203' +
                                   '1055900621117, 0.14906832298136646), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.14906832298136646), vec2(1.196' +
                                   '8944099378882, 0.15527950310559008), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.15527950310559008), vec2(1.203' +
                                    '1055900621117, 0.1614906832298137), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.1614906832298137), vec2(1.1968' +
                                     '944099378882, 0.1677018633540373), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.1677018633540373), vec2(1.2031' +
                                    '055900621117, 0.17391304347826092), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.17391304347826092), vec2(1.196' +
                                   '8944099378882, 0.18012422360248453), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.18012422360248453), vec2(1.203' +
                                   '1055900621117, 0.18633540372670815), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.18633540372670815), vec2(1.196' +
                                   '8944099378882, 0.19254658385093176), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.19254658385093176), vec2(1.203' +
                                   '1055900621117, 0.19875776397515538), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.19875776397515538), vec2(1.196' +
                                     '8944099378882, 0.204968944099379), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.204968944099379), vec2(1.20310' +
                                      '55900621117, 0.2111801242236026), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.2111801242236026), vec2(1.1968' +
                                    '944099378882, 0.21739130434782622), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.21739130434782622), vec2(1.203' +
                                   '1055900621117, 0.22360248447204983), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.22360248447204983), vec2(1.196' +
                                   '8944099378882, 0.22981366459627345), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.22981366459627345), vec2(1.203' +
                                   '1055900621117, 0.23602484472049706), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.23602484472049706), vec2(1.196' +
                                   '8944099378882, 0.24223602484472068), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.24223602484472068), vec2(1.203' +
                                    '1055900621117, 0.2484472049689443), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.2484472049689443), vec2(1.1968' +
                                     '944099378882, 0.2546583850931679), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.2546583850931679), vec2(1.2031' +
                                     '055900621117, 0.2608695652173915), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.2608695652173915), vec2(1.1968' +
                                    '944099378882, 0.26708074534161513), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.26708074534161513), vec2(1.203' +
                                   '1055900621117, 0.27329192546583875), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.27329192546583875), vec2(1.196' +
                                   '8944099378882, 0.27950310559006236), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.27950310559006236), vec2(1.203' +
                                     '1055900621117, 0.285714285714286), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.285714285714286), vec2(1.19689' +
                                      '44099378882, 0.2919254658385096), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.2919254658385096), vec2(1.2031' +
                                     '055900621117, 0.2981366459627332), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.2981366459627332), vec2(1.1968' +
                                     '944099378882, 0.3043478260869568), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.3043478260869568), vec2(1.2031' +
                                    '055900621117, 0.31055900621118043), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.31055900621118043), vec2(1.196' +
                                   '8944099378882, 0.31677018633540405), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.31677018633540405), vec2(1.203' +
                                   '1055900621117, 0.32298136645962766), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.32298136645962766), vec2(1.196' +
                                    '8944099378882, 0.3291925465838513), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.3291925465838513), vec2(1.2031' +
                                     '055900621117, 0.3354037267080749), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.3354037267080749), vec2(1.1968' +
                                     '944099378882, 0.3416149068322985), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.3416149068322985), vec2(1.2031' +
                                     '055900621117, 0.3478260869565221), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.3478260869565221), vec2(1.1968' +
                                    '944099378882, 0.35403726708074573), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.35403726708074573), vec2(1.203' +
                                   '1055900621117, 0.36024844720496935), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.36024844720496935), vec2(1.196' +
                                   '8944099378882, 0.36645962732919296), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.36645962732919296), vec2(1.203' +
                                    '1055900621117, 0.3726708074534166), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.3726708074534166), vec2(1.1968' +
                                     '944099378882, 0.3788819875776402), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.3788819875776402), vec2(1.2031' +
                                     '055900621117, 0.3850931677018638), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.3850931677018638), vec2(1.1968' +
                                     '944099378882, 0.3913043478260874), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.3913043478260874), vec2(1.2031' +
                                    '055900621117, 0.39751552795031103), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.39751552795031103), vec2(1.196' +
                                   '8944099378882, 0.40372670807453465), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.40372670807453465), vec2(1.203' +
                                   '1055900621117, 0.40993788819875826), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.40993788819875826), vec2(1.196' +
                                    '8944099378882, 0.4161490683229819), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.4161490683229819), vec2(1.2031' +
                                     '055900621117, 0.4223602484472055), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.4223602484472055), vec2(1.1968' +
                                     '944099378882, 0.4285714285714291), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.4285714285714291), vec2(1.2031' +
                                     '055900621117, 0.4347826086956527), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.4347826086956527), vec2(1.1968' +
                                    '944099378882, 0.44099378881987633), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.44099378881987633), vec2(1.203' +
                                   '1055900621117, 0.44720496894409995), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.44720496894409995), vec2(1.196' +
                                   '8944099378882, 0.45341614906832356), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.45341614906832356), vec2(1.203' +
                                    '1055900621117, 0.4596273291925472), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.4596273291925472), vec2(1.1968' +
                                     '944099378882, 0.4658385093167708), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.4658385093167708), vec2(1.2031' +
                                     '055900621117, 0.4720496894409944), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.4720496894409944), vec2(1.1968' +
                                      '944099378882, 0.478260869565218), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.478260869565218), vec2(1.20310' +
                                     '55900621117, 0.48447204968944163), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.48447204968944163), vec2(1.196' +
                                   '8944099378882, 0.49068322981366524), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.49068322981366524), vec2(1.203' +
                                   '1055900621117, 0.49689440993788886), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.49689440993788886), vec2(1.196' +
                                    '8944099378882, 0.5031055900621124), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.5031055900621124), vec2(1.2031' +
                                      '055900621117, 0.509316770186336), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.509316770186336), vec2(1.19689' +
                                      '44099378882, 0.5155279503105596), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.5155279503105596), vec2(1.2031' +
                                     '055900621117, 0.5217391304347833), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.5217391304347833), vec2(1.1968' +
                                     '944099378882, 0.5279503105590069), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.5279503105590069), vec2(1.2031' +
                                     '055900621117, 0.5341614906832305), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.5341614906832305), vec2(1.1968' +
                                     '944099378882, 0.5403726708074541), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.5403726708074541), vec2(1.2031' +
                                     '055900621117, 0.5465838509316777), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.5465838509316777), vec2(1.1968' +
                                     '944099378882, 0.5527950310559013), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.5527950310559013), vec2(1.2031' +
                                      '055900621117, 0.559006211180125), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.559006211180125), vec2(1.19689' +
                                      '44099378882, 0.5652173913043486), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.5652173913043486), vec2(1.2031' +
                                     '055900621117, 0.5714285714285722), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.5714285714285722), vec2(1.1968' +
                                     '944099378882, 0.5776397515527958), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.5776397515527958), vec2(1.2031' +
                                     '055900621117, 0.5838509316770194), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.5838509316770194), vec2(1.1968' +
                                      '944099378882, 0.590062111801243), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.590062111801243), vec2(1.20310' +
                                      '55900621117, 0.5962732919254666), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.5962732919254666), vec2(1.1968' +
                                     '944099378882, 0.6024844720496902), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6024844720496902), vec2(1.2031' +
                                     '055900621117, 0.6086956521739139), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.6086956521739139), vec2(1.1968' +
                                     '944099378882, 0.6149068322981375), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6149068322981375), vec2(1.2031' +
                                     '055900621117, 0.6211180124223611), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.6211180124223611), vec2(1.1968' +
                                     '944099378882, 0.6273291925465847), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6273291925465847), vec2(1.2031' +
                                     '055900621117, 0.6335403726708083), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.6335403726708083), vec2(1.1968' +
                                     '944099378882, 0.6397515527950319), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6397515527950319), vec2(1.2031' +
                                     '055900621117, 0.6459627329192555), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.6459627329192555), vec2(1.1968' +
                                     '944099378882, 0.6521739130434792), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6521739130434792), vec2(1.2031' +
                                     '055900621117, 0.6583850931677028), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.6583850931677028), vec2(1.1968' +
                                     '944099378882, 0.6645962732919264), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6645962732919264), vec2(1.2031' +
                                       '055900621117, 0.67080745341615), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.67080745341615), vec2(1.196894' +
                                       '4099378882, 0.6770186335403736), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6770186335403736), vec2(1.2031' +
                                     '055900621117, 0.6832298136645972), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.6832298136645972), vec2(1.1968' +
                                     '944099378882, 0.6894409937888208), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.6894409937888208), vec2(1.2031' +
                                     '055900621117, 0.6956521739130445), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.6956521739130445), vec2(1.1968' +
                                     '944099378882, 0.7018633540372681), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.7018633540372681), vec2(1.2031' +
                                     '055900621117, 0.7080745341614917), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7080745341614917), vec2(1.1968' +
                                     '944099378882, 0.7142857142857153), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.7142857142857153), vec2(1.2031' +
                                     '055900621117, 0.7204968944099389), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7204968944099389), vec2(1.1968' +
                                     '944099378882, 0.7267080745341625), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.7267080745341625), vec2(1.2031' +
                                     '055900621117, 0.7329192546583861), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7329192546583861), vec2(1.1968' +
                                     '944099378882, 0.7391304347826098), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.7391304347826098), vec2(1.2031' +
                                     '055900621117, 0.7453416149068334), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7453416149068334), vec2(1.1968' +
                                      '944099378882, 0.751552795031057), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.751552795031057), vec2(1.20310' +
                                      '55900621117, 0.7577639751552806), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7577639751552806), vec2(1.1968' +
                                     '944099378882, 0.7639751552795042), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.7639751552795042), vec2(1.2031' +
                                     '055900621117, 0.7701863354037278), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7701863354037278), vec2(1.1968' +
                                     '944099378882, 0.7763975155279514), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.7763975155279514), vec2(1.2031' +
                                     '055900621117, 0.7826086956521751), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7826086956521751), vec2(1.1968' +
                                     '944099378882, 0.7888198757763987), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.7888198757763987), vec2(1.2031' +
                                     '055900621117, 0.7950310559006223), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.7950310559006223), vec2(1.1968' +
                                     '944099378882, 0.8012422360248459), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.8012422360248459), vec2(1.2031' +
                                     '055900621117, 0.8074534161490695), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.8074534161490695), vec2(1.1968' +
                                     '944099378882, 0.8136645962732931), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.8136645962732931), vec2(1.2031' +
                                     '055900621117, 0.8198757763975167), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.8198757763975167), vec2(1.1968' +
                                     '944099378882, 0.8260869565217404), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.8260869565217404), vec2(1.2031' +
                                      '055900621117, 0.832298136645964), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.832298136645964), vec2(1.19689' +
                                      '44099378882, 0.8385093167701876), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.8385093167701876), vec2(1.2031' +
                                     '055900621117, 0.8447204968944112), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.8447204968944112), vec2(1.1968' +
                                     '944099378882, 0.8509316770186348), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.8509316770186348), vec2(1.2031' +
                                     '055900621117, 0.8571428571428584), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.8571428571428584), vec2(1.1968' +
                                      '944099378882, 0.863354037267082), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.863354037267082), vec2(1.20310' +
                                      '55900621117, 0.8695652173913057), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.8695652173913057), vec2(1.1968' +
                                     '944099378882, 0.8757763975155293), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.8757763975155293), vec2(1.2031' +
                                     '055900621117, 0.8819875776397529), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.8819875776397529), vec2(1.1968' +
                                     '944099378882, 0.8881987577639765), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.8881987577639765), vec2(1.2031' +
                                     '055900621117, 0.8944099378882001), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.8944099378882001), vec2(1.1968' +
                                     '944099378882, 0.9006211180124237), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.9006211180124237), vec2(1.2031' +
                                     '055900621117, 0.9068322981366473), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.9068322981366473), vec2(1.1968' +
                                      '944099378882, 0.913043478260871), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.913043478260871), vec2(1.20310' +
                                      '55900621117, 0.9192546583850946), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.9192546583850946), vec2(1.1968' +
                                     '944099378882, 0.9254658385093182), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.9254658385093182), vec2(1.2031' +
                                     '055900621117, 0.9316770186335418), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.9316770186335418), vec2(1.1968' +
                                     '944099378882, 0.9378881987577654), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.9378881987577654), vec2(1.2031' +
                                      '055900621117, 0.944099378881989), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.944099378881989), vec2(1.19689' +
                                      '44099378882, 0.9503105590062126), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.9503105590062126), vec2(1.2031' +
                                     '055900621117, 0.9565217391304363), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.9565217391304363), vec2(1.1968' +
                                     '944099378882, 0.9627329192546599), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.9627329192546599), vec2(1.2031' +
                                     '055900621117, 0.9689440993788835), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.9689440993788835), vec2(1.1968' +
                                     '944099378882, 0.9751552795031071), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.9751552795031071), vec2(1.2031' +
                                     '055900621117, 0.9813664596273307), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.9813664596273307), vec2(1.1968' +
                                     '944099378882, 0.9875776397515543), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.1968944099378882, 0.9875776397515543), vec2(1.2031' +
                                     '055900621117, 0.9937888198757779), 0.0, isect);\n'   +
        '    lineIntersect(ray, vec2(1.2031055900621117, 0.9937888198757779), vec2(1.1968' +
                                     '944099378882, 1.0000000000000016), 0.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene42-ku-planar-rotatedplanar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.8, 0.0), vec2(1.0, 1.0), 0.0, isect);\n'            +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene43-ko':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.1), 1.0, isect);\n'          +
        '    lineIntersect(ray, vec2(1.2, 0.0), vec2(1.2, 1.0), 1.0, isect);\n\n'          +

        '    lineIntersect(ray, vec2(0.41055555555555556, 1.0), vec2(0.3894444444444445, ' +
                                                   '0.9788888888888889), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.9788888888888889), vec2(0.41055555' +
                                        '555555556, 0.9577777777777778), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.9577777777777778), vec2(0.3894444' +
                                        '444444445, 0.9366666666666668), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.9366666666666668), vec2(0.41055555' +
                                        '555555556, 0.9155555555555557), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.9155555555555557), vec2(0.3894444' +
                                        '444444445, 0.8944444444444446), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8944444444444446), vec2(0.41055555' +
                                        '555555556, 0.8733333333333335), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.8733333333333335), vec2(0.3894444' +
                                        '444444445, 0.8522222222222224), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8522222222222224), vec2(0.41055555' +
                                        '555555556, 0.8311111111111114), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.8311111111111114), vec2(0.3894444' +
                                        '444444445, 0.8100000000000003), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8100000000000003), vec2(0.41055555' +
                                        '555555556, 0.7888888888888892), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.7888888888888892), vec2(0.3894444' +
                                        '444444445, 0.7677777777777781), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.7677777777777781), vec2(0.41055555' +
                                         '555555556, 0.746666666666667), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.746666666666667), vec2(0.38944444' +
                                          '44444445, 0.725555555555556), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.725555555555556), vec2(0.410555555' +
                                         '55555556, 0.7044444444444449), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.7044444444444449), vec2(0.3894444' +
                                        '444444445, 0.6833333333333338), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.6833333333333338), vec2(0.41055555' +
                                        '555555556, 0.6622222222222227), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.6622222222222227), vec2(0.3894444' +
                                        '444444445, 0.6411111111111116), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.6411111111111116), vec2(0.41055555' +
                                        '555555556, 0.6200000000000006), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.6200000000000006), vec2(0.3894444' +
                                        '444444445, 0.5988888888888895), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5988888888888895), vec2(0.41055555' +
                                        '555555556, 0.5777777777777784), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.5777777777777784), vec2(0.3894444' +
                                        '444444445, 0.5566666666666673), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5566666666666673), vec2(0.41055555' +
                                        '555555556, 0.5355555555555562), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.5355555555555562), vec2(0.3894444' +
                                        '444444445, 0.5144444444444451), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5144444444444451), vec2(0.41055555' +
                                         '555555556, 0.493333333333334), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.493333333333334), vec2(0.38944444' +
                                         '44444445, 0.4722222222222229), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.4722222222222229), vec2(0.41055555' +
                                       '555555556, 0.45111111111111174), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.45111111111111174), vec2(0.389444' +
                                       '4444444445, 0.4300000000000006), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.4300000000000006), vec2(0.41055555' +
                                       '555555556, 0.40888888888888947), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.40888888888888947), vec2(0.389444' +
                                      '4444444445, 0.38777777777777833), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.38777777777777833), vec2(0.4105555' +
                                       '5555555556, 0.3666666666666672), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.3666666666666672), vec2(0.3894444' +
                                       '444444445, 0.34555555555555606), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.34555555555555606), vec2(0.4105555' +
                                       '5555555556, 0.3244444444444449), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.3244444444444449), vec2(0.3894444' +
                                        '444444445, 0.3033333333333338), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.3033333333333338), vec2(0.41055555' +
                                       '555555556, 0.28222222222222265), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.28222222222222265), vec2(0.389444' +
                                       '4444444445, 0.2611111111111115), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.2611111111111115), vec2(0.41055555' +
                                        '555555556, 0.2400000000000004), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.2400000000000004), vec2(0.3894444' +
                                        '444444445, 0.2188888888888893), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.2188888888888893), vec2(0.41055555' +
                                        '555555556, 0.1977777777777782), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.1977777777777782), vec2(0.3894444' +
                                       '444444445, 0.17666666666666708), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.17666666666666708), vec2(0.4105555' +
                                      '5555555556, 0.15555555555555597), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.15555555555555597), vec2(0.389444' +
                                      '4444444445, 0.13444444444444487), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.13444444444444487), vec2(0.4105555' +
                                      '5555555556, 0.11333333333333376), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.11333333333333376), vec2(0.389444' +
                                      '4444444445, 0.09222222222222265), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.09222222222222265), vec2(0.4105555' +
                                      '5555555556, 0.07111111111111154), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.07111111111111154), vec2(0.389444' +
                                      '4444444445, 0.05000000000000043), 2.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        // Bounding box\n'                                                        +
        '        throughput = vec3(0.0);\n'                                                +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '        // Relay wall\n'                                                          +
        'throughput *= vec3(0.5);\n'                                                       +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '    }\n'                                                                          +
        '}\n',

    'scene44-ko-rough':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.1), 1.0, isect);\n\n'        +

        '    lineIntersect(ray, vec2(1.2249999999999999, 0.0), vec2(1.175, 0.05), 2.0, is' +
                                                                               'ect);\n'   +
        'lineIntersect(ray, vec2(1.175, 0.05), vec2(1.2249999999999999, 0.1), 2.0, isect)' +
                                                                                   ';\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.1), vec2(1.175, 0.1500000000000000' +
                                                                    '2), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.175, 0.15000000000000002), vec2(1.2249999999999999, 0.' +
                                                                    '2), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.2), vec2(1.175, 0.25), 2.0, isect)' +
                                                                                   ';\n'   +
        'lineIntersect(ray, vec2(1.175, 0.25), vec2(1.2249999999999999, 0.3), 2.0, isect)' +
                                                                                   ';\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.3), vec2(1.175, 0.35), 2.0, isect)' +
                                                                                   ';\n'   +
        'lineIntersect(ray, vec2(1.175, 0.35), vec2(1.2249999999999999, 0.399999999999999' +
                                                                   '97), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.39999999999999997), vec2(1.175, 0.' +
                                                    '44999999999999996), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.175, 0.44999999999999996), vec2(1.2249999999999999, 0.' +
                                                    '49999999999999994), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.49999999999999994), vec2(1.175, 0.' +
                                                     '5499999999999999), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.175, 0.5499999999999999), vec2(1.2249999999999999, 0.6' +
                                                                     '), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.6), vec2(1.175, 0.65), 2.0, isect)' +
                                                                                   ';\n'   +
        'lineIntersect(ray, vec2(1.175, 0.65), vec2(1.2249999999999999, 0.700000000000000' +
                                                                    '1), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.7000000000000001), vec2(1.175, 0.7' +
                                                      '500000000000001), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.175, 0.7500000000000001), vec2(1.2249999999999999, 0.8' +
                                                      '000000000000002), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.8000000000000002), vec2(1.175, 0.8' +
                                                      '500000000000002), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.175, 0.8500000000000002), vec2(1.2249999999999999, 0.9' +
                                                      '000000000000002), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.2249999999999999, 0.9000000000000002), vec2(1.175, 0.9' +
                                                      '500000000000003), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(1.175, 0.9500000000000003), vec2(1.2249999999999999, 1.0' +
                                                      '000000000000002), 2.0, isect);\n\n' +

        '    lineIntersect(ray, vec2(0.41055555555555556, 1.0), vec2(0.3894444444444445, ' +
                                                   '0.9788888888888889), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.9788888888888889), vec2(0.41055555' +
                                        '555555556, 0.9577777777777778), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.9577777777777778), vec2(0.3894444' +
                                        '444444445, 0.9366666666666668), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.9366666666666668), vec2(0.41055555' +
                                        '555555556, 0.9155555555555557), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.9155555555555557), vec2(0.3894444' +
                                        '444444445, 0.8944444444444446), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8944444444444446), vec2(0.41055555' +
                                        '555555556, 0.8733333333333335), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.8733333333333335), vec2(0.3894444' +
                                        '444444445, 0.8522222222222224), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8522222222222224), vec2(0.41055555' +
                                        '555555556, 0.8311111111111114), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.8311111111111114), vec2(0.3894444' +
                                        '444444445, 0.8100000000000003), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8100000000000003), vec2(0.41055555' +
                                        '555555556, 0.7888888888888892), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.7888888888888892), vec2(0.3894444' +
                                        '444444445, 0.7677777777777781), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.7677777777777781), vec2(0.41055555' +
                                         '555555556, 0.746666666666667), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.746666666666667), vec2(0.38944444' +
                                          '44444445, 0.725555555555556), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.725555555555556), vec2(0.410555555' +
                                         '55555556, 0.7044444444444449), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.7044444444444449), vec2(0.3894444' +
                                        '444444445, 0.6833333333333338), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.6833333333333338), vec2(0.41055555' +
                                        '555555556, 0.6622222222222227), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.6622222222222227), vec2(0.3894444' +
                                        '444444445, 0.6411111111111116), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.6411111111111116), vec2(0.41055555' +
                                        '555555556, 0.6200000000000006), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.6200000000000006), vec2(0.3894444' +
                                        '444444445, 0.5988888888888895), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5988888888888895), vec2(0.41055555' +
                                        '555555556, 0.5777777777777784), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.5777777777777784), vec2(0.3894444' +
                                        '444444445, 0.5566666666666673), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5566666666666673), vec2(0.41055555' +
                                        '555555556, 0.5355555555555562), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.5355555555555562), vec2(0.3894444' +
                                        '444444445, 0.5144444444444451), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5144444444444451), vec2(0.41055555' +
                                         '555555556, 0.493333333333334), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.493333333333334), vec2(0.38944444' +
                                         '44444445, 0.4722222222222229), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.4722222222222229), vec2(0.41055555' +
                                       '555555556, 0.45111111111111174), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.45111111111111174), vec2(0.389444' +
                                       '4444444445, 0.4300000000000006), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.4300000000000006), vec2(0.41055555' +
                                       '555555556, 0.40888888888888947), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.40888888888888947), vec2(0.389444' +
                                      '4444444445, 0.38777777777777833), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.38777777777777833), vec2(0.4105555' +
                                       '5555555556, 0.3666666666666672), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.3666666666666672), vec2(0.3894444' +
                                       '444444445, 0.34555555555555606), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.34555555555555606), vec2(0.4105555' +
                                       '5555555556, 0.3244444444444449), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.3244444444444449), vec2(0.3894444' +
                                        '444444445, 0.3033333333333338), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.3033333333333338), vec2(0.41055555' +
                                       '555555556, 0.28222222222222265), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.28222222222222265), vec2(0.389444' +
                                       '4444444445, 0.2611111111111115), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.2611111111111115), vec2(0.41055555' +
                                        '555555556, 0.2400000000000004), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.2400000000000004), vec2(0.3894444' +
                                        '444444445, 0.2188888888888893), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.2188888888888893), vec2(0.41055555' +
                                        '555555556, 0.1977777777777782), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.1977777777777782), vec2(0.3894444' +
                                       '444444445, 0.17666666666666708), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.17666666666666708), vec2(0.4105555' +
                                      '5555555556, 0.15555555555555597), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.15555555555555597), vec2(0.389444' +
                                      '4444444445, 0.13444444444444487), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.13444444444444487), vec2(0.4105555' +
                                      '5555555556, 0.11333333333333376), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.11333333333333376), vec2(0.389444' +
                                      '4444444445, 0.09222222222222265), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.09222222222222265), vec2(0.4105555' +
                                      '5555555556, 0.07111111111111154), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.07111111111111154), vec2(0.389444' +
                                      '4444444445, 0.05000000000000043), 2.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        // Bounding box\n'                                                        +
        '        throughput = vec3(0.0);\n'                                                +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '        // Relay wall\n'                                                          +
        'throughput *= vec3(0.5);\n'                                                       +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '    }\n'                                                                          +
        '}\n',

    'scene45-rough-displaced':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.1), 1.0, isect);\n'          +
        '    lineIntersect(ray, vec2(1.2, 0.0), vec2(1.2, 1.0), 1.0, isect);\n\n'          +

        '    lineIntersect(ray, vec2(0.41055555555555556, 1.0), vec2(0.3894444444444445, ' +
                                                   '0.9788888888888889), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.9788888888888889), vec2(0.41055555' +
                                        '555555556, 0.9577777777777778), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.9577777777777778), vec2(0.3894444' +
                                        '444444445, 0.9366666666666668), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.9366666666666668), vec2(0.41055555' +
                                        '555555556, 0.9155555555555557), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.9155555555555557), vec2(0.3894444' +
                                        '444444445, 0.8944444444444446), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8944444444444446), vec2(0.41055555' +
                                        '555555556, 0.8733333333333335), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.8733333333333335), vec2(0.3894444' +
                                        '444444445, 0.8522222222222224), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8522222222222224), vec2(0.41055555' +
                                        '555555556, 0.8311111111111114), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.8311111111111114), vec2(0.3894444' +
                                        '444444445, 0.8100000000000003), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.8100000000000003), vec2(0.41055555' +
                                        '555555556, 0.7888888888888892), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.7888888888888892), vec2(0.3894444' +
                                        '444444445, 0.7677777777777781), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.7677777777777781), vec2(0.41055555' +
                                         '555555556, 0.746666666666667), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.746666666666667), vec2(0.38944444' +
                                          '44444445, 0.725555555555556), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.725555555555556), vec2(0.410555555' +
                                         '55555556, 0.7044444444444449), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.7044444444444449), vec2(0.3894444' +
                                        '444444445, 0.6833333333333338), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.6833333333333338), vec2(0.41055555' +
                                        '555555556, 0.6622222222222227), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.6622222222222227), vec2(0.3894444' +
                                        '444444445, 0.6411111111111116), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.6411111111111116), vec2(0.41055555' +
                                        '555555556, 0.6200000000000006), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.6200000000000006), vec2(0.3894444' +
                                        '444444445, 0.5988888888888895), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5988888888888895), vec2(0.41055555' +
                                        '555555556, 0.5777777777777784), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.5777777777777784), vec2(0.3894444' +
                                        '444444445, 0.5566666666666673), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5566666666666673), vec2(0.41055555' +
                                        '555555556, 0.5355555555555562), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.5355555555555562), vec2(0.3894444' +
                                        '444444445, 0.5144444444444451), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.5144444444444451), vec2(0.41055555' +
                                         '555555556, 0.493333333333334), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.493333333333334), vec2(0.38944444' +
                                         '44444445, 0.4722222222222229), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.4722222222222229), vec2(0.41055555' +
                                       '555555556, 0.45111111111111174), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.45111111111111174), vec2(0.389444' +
                                       '4444444445, 0.4300000000000006), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.4300000000000006), vec2(0.41055555' +
                                       '555555556, 0.40888888888888947), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.40888888888888947), vec2(0.389444' +
                                      '4444444445, 0.38777777777777833), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.38777777777777833), vec2(0.4105555' +
                                       '5555555556, 0.3666666666666672), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.3666666666666672), vec2(0.3894444' +
                                       '444444445, 0.34555555555555606), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.34555555555555606), vec2(0.4105555' +
                                       '5555555556, 0.3244444444444449), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.3244444444444449), vec2(0.3894444' +
                                        '444444445, 0.3033333333333338), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.3033333333333338), vec2(0.41055555' +
                                       '555555556, 0.28222222222222265), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.28222222222222265), vec2(0.389444' +
                                       '4444444445, 0.2611111111111115), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.2611111111111115), vec2(0.41055555' +
                                        '555555556, 0.2400000000000004), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.2400000000000004), vec2(0.3894444' +
                                        '444444445, 0.2188888888888893), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.2188888888888893), vec2(0.41055555' +
                                        '555555556, 0.1977777777777782), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.1977777777777782), vec2(0.3894444' +
                                       '444444445, 0.17666666666666708), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.17666666666666708), vec2(0.4105555' +
                                      '5555555556, 0.15555555555555597), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.15555555555555597), vec2(0.389444' +
                                      '4444444445, 0.13444444444444487), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.13444444444444487), vec2(0.4105555' +
                                      '5555555556, 0.11333333333333376), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.11333333333333376), vec2(0.389444' +
                                      '4444444445, 0.09222222222222265), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.3894444444444445, 0.09222222222222265), vec2(0.4105555' +
                                      '5555555556, 0.07111111111111154), 2.0, isect);\n'   +
        'lineIntersect(ray, vec2(0.41055555555555556, 0.07111111111111154), vec2(0.389444' +
                                      '4444444445, 0.05000000000000043), 2.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        // Bounding box\n'                                                        +
        '        throughput = vec3(0.0);\n'                                                +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '        // Relay wall\n'                                                          +
        'throughput *= vec3(0.5);\n'                                                       +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '    }\n'                                                                          +
        '}\n',

    'scene46-ko-planar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.1), 1.0, isect);\n'          +
        '    lineIntersect(ray, vec2(1.2, 0.0), vec2(1.2, 1.0), 1.0, isect);\n'            +
        '    lineIntersect(ray, vec2(0.4, 1.0), vec2(0.4, 0.05), 2.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        // Bounding box\n'                                                        +
        '        throughput = vec3(0.0);\n'                                                +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '        // Relay wall\n'                                                          +
        'throughput *= vec3(0.5);\n'                                                       +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        'return sampleDiffuse(state, wiLocal);\n'                                          +
        '    }\n'                                                                          +
        '}\n',

    'scene5':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n'                                                           +
        '#include "csg-intersect"\n\n'                                                     +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    planoConcaveLensIntersect(ray, vec2(0.8, 0.0), 0.6, 0.3, 0.6, 1.0, isect);\n' +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene6':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-0.95,   0.25),    0.4, 1.0, isect);\n'             +
        '    //sphereIntersect(ray, vec2(-0.15,  -0.25),    0.2, 1.0, isect);\n'           +
        '    //sphereIntersect(ray, vec2(1.11667, 0.18333), 0.2, 1.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.168689, -0.885424), vec2(1.13131,  -0.614576), 2.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(1.71686,   0.310275), vec2(0.983139,  0.989725), 2.0' +
                                                                           ', isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene7':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n'                                                           +
        '#include "csg-intersect"\n\n'                                                     +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(0.0, 0.0), 0.4, 1.0, isect);\n'                     +
        '    biconvexLensIntersect(ray, vec2(-0.4, -0.65), 0.3, 0.12, 0.5, 0.5, 1.0, isec' +
                                                                                 't);\n'   +
        '    meniscusLensIntersect(ray, vec2(-0.8, -0.65), 0.3, 0.08, -0.5, -0.5, 1.0, is' +
                                                                               'ect);\n'   +
        '    planoConcaveLensIntersect(ray, vec2(1.3, 0.0), 0.3, 0.0, 0.3, 2.0, isect);\n' +
        '    prismIntersect(ray, vec2(0.8, -0.7), 0.2, 1.0, isect);\n'                     +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                 '96, 147.4688), lambda)/1.6; // SF10\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.25);\n'                                              +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene8':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-0.95,   0.25),    0.4, 1.0, isect);\n'             +
        '    sphereIntersect(ray, vec2(-0.15,  -0.25),    0.2, 1.0, isect);\n'             +
        '    sphereIntersect(ray, vec2(1.11667, 0.18333), 0.2, 1.0, isect);\n'             +
        '    lineIntersect(ray, vec2(0.168689, -0.885424), vec2(1.13131,  -0.614576), 2.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(1.71686,   0.310275), vec2(0.983139,  0.989725), 2.0' +
                                                                           ', isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene9':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    sphereIntersect(ray, vec2(-0.95, 0.25), 0.4, 0.0, isect); // top left -1.35,' +
                                                                     '-0.15 0.15,0.65\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'show-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D radiance;\n'                                                    +
        'uniform sampler2D colormap;\n\n'                                                  +

        'uniform sampler2D maxValue; // it would be nice to check what is faster\n'        +
        'uniform int isComplex;\n'                                                         +
        'uniform int usePhase;\n\n'                                                        +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    vec2 radianceVec = texture2D(radiance, mPos).xy;\n'                           +
        '    // If complex number, compute module (length), otherwise, use only the first' +
                                                                          ' component\n'   +
        '    float radianceTex = abs(radianceVec.x) * float(1 - isComplex) + length(radia' +
                                                         'nceVec) * float(isComplex);\n'   +
        '    radianceTex *= float(1 - usePhase);\n'                                        +
        '    radianceTex += float(usePhase) * atan(radianceVec.y, radianceVec.x);\n'       +
        '    float xCoord = radianceTex / texture2D(maxValue, vec2(0.5)).x * float(1 - us' +
                                                                            'ePhase);\n'   +
        '    xCoord += float(usePhase == 1 && radianceVec.x != 0.0) * (radianceTex + PI) ' +
                                                                       '/ (2.0 * PI);\n'   +
        '    xCoord += float(usePhase == 1 && radianceVec.x == 0.0) * (PI / 2.0 * sign(ra' +
                                                    'dianceVec.y) + PI) / (2.0 * PI);\n'   +
        '    gl_FragColor = texture2D(colormap, vec2(xCoord, 0.5));\n'                     +
        '}\n',

    'show-func-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D radiance;\n'                                                    +
        'uniform sampler2D colormap;\n\n'                                                  +

        'uniform sampler2D maxValue; // it would be nice to check what is faster\n'        +
        'uniform int isComplex;\n'                                                         +
        'uniform int usePhase;\n\n'                                                        +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    vec2 radianceVec = texture2D(radiance, mPos).xy;\n'                           +
        '    // If complex number, compute module (length), otherwise, use only the first' +
                                                                          ' component\n'   +
        '    float radianceTex = abs(radianceVec.x) * float(1 - isComplex) + length(radia' +
                                                         'nceVec) * float(isComplex);\n'   +
        '    radianceTex *= float(1 - usePhase);\n'                                        +
        '    radianceTex += float(usePhase) * atan(radianceVec.y, radianceVec.x);\n'       +
        '    float xCoord = float(1 - usePhase) * {func}radianceTex) / {func}texture2D(ma' +
                                                              'xValue, vec2(0.5)).x);\n'   +
        '    xCoord += {func}radianceTex + PI) / {func}2.0 * PI) * float(usePhase == 1 &&' +
                                                             ' radianceVec.x != 0.0);\n'   +
        '    xCoord += {func}PI / 2.0 * sign(radianceVec.y) + PI) / {func}2.0 * PI) * flo' +
                                          'at(usePhase == 1 && radianceVec.x == 0.0);\n\n' +

        '    gl_FragColor = texture2D(colormap, vec2(xCoord, 0.5));\n'                     +
        '}\n',

    'show-vert':
        '#include "preamble"\n\n'                       +

        'attribute vec2 Position;\n\n'                  +

        'varying vec2 mPos;\n\n'                        +

        'void main() {\n'                               +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n' +
        '    mPos = Position/2.0+vec2(0.5);\n'          +
        '}\n',

    'sum-frag':
        '#include "preamble"\n\n'                                                          +

        '// Inspired from https://github.com/regl-project/regl/blob/gh-pages/example/redu' +
                                                                            'ction.js\n\n' +

        'uniform sampler2D tex;\n'                                                         +
        'uniform vec2 numPixels;\n'                                                        +
        'uniform int oneRow;\n\n'                                                          +

        'varying vec2 mPos;\n\n'                                                           +

        'void main () {\n'                                                                 +
        '	vec2 intervalSize = 1.0 / numPixels;\n\n'                                        +

        '	// mPos are the coordinates of the center of the new pixel\n'                    +
        '	// this is also the shared vertex of the old pixels we want to compare\n'        +
        '	// => access the center of those pixels\n'                                       +
        '	float a = texture2D(tex, mPos + intervalSize * vec2(-0.25)).x;\n'                +
        '	float b = texture2D(tex, mPos + intervalSize * vec2(0.25)).x;\n'                 +
        '	float c = texture2D(tex, mPos + intervalSize * vec2(-0.25, 0.25)).x;\n'          +
        '	float d = texture2D(tex, mPos + intervalSize * vec2(0.25, -0.25)).x;\n'          +
        '	// If tex.height == 1, we have already added all rows, so reduce only in dimens' +
                                             'ion X (assuming width >= height always)\n'   +
        '	float result = (a + d) * float(1 - oneRow) + (b + c);\n\n'                       +

        '	gl_FragColor = vec4(result, 0.0, 0.0, 1.0);\n'                                   +
        '}\n',

    'trace-frag':
        '#extension GL_EXT_draw_buffers : require\n'                                       +
        '#include "preamble"\n'                                                            +
        '#include "rand"\n\n'                                                              +

        'uniform sampler2D PosData;\n'                                                     +
        'uniform sampler2D RngData;\n'                                                     +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeData;\n\n'                                                  +

        'varying vec2 vTexCoord;\n\n'                                                      +

        'struct Ray {\n'                                                                   +
        '    vec2 pos;\n'                                                                  +
        '    vec2 dir;\n'                                                                  +
        '    vec2 invDir;\n'                                                               +
        '    vec2 dirSign;\n'                                                              +
        '    float t0;\n'                                                                  +
        '};\n'                                                                             +
        'struct Intersection {\n'                                                          +
        '    float tMin;\n'                                                                +
        '    float tMax;\n'                                                                +
        '    vec2 n;\n'                                                                    +
        '    float mat;\n'                                                                 +
        '};\n\n'                                                                           +

        'void intersect(Ray ray, inout Intersection isect);\n'                             +
        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                              'out vec3 throughput, out float tMult);\n\n' +

        'Ray unpackRay(vec4 posDir) {\n'                                                   +
        '    vec2 pos = posDir.xy;\n'                                                      +
        '    vec2 dir = posDir.zw;\n'                                                      +
        '    vec4 t0 = texture2D(TimeData, vTexCoord);\n'                                  +
        '    dir.x = abs(dir.x) < 1e-5 ? 1e-5 : dir.x; /* The nuclear option to fix NaN i' +
                                                          'ssues on some platforms */\n'   +
        '    dir.y = abs(dir.y) < 1e-5 ? 1e-5 : dir.y;\n'                                  +
        '    return Ray(pos, normalize(dir), 1.0/dir, sign(dir), t0.x);\n'                 +
        '}\n\n'                                                                            +

        'void main() {\n'                                                                  +
        '    vec4 posDir    = texture2D(PosData, vTexCoord);\n'                            +
        '    vec4 state     = texture2D(RngData, vTexCoord);\n'                            +
        '    vec4 rgbLambda = texture2D(RgbData, vTexCoord);\n\n'                          +

        '    Ray ray = unpackRay(posDir);\n'                                               +
        '    Intersection isect;\n'                                                        +
        '    isect.tMin = 1e-4;\n'                                                         +
        '    isect.tMax = 1e30;\n'                                                         +
        '    intersect(ray, isect);\n\n'                                                   +

        '    vec2 t = vec2(-isect.n.y, isect.n.x);\n'                                      +
        '    vec2 wiLocal = -vec2(dot(t, ray.dir), dot(isect.n, ray.dir));\n'              +
        '    float tMult;\n'                                                               +
        '    vec2 woLocal = sample(state, isect, rgbLambda.w, wiLocal, rgbLambda.rgb, tMu' +
                                                                                'lt);\n\n' +

        '    if (isect.tMax == 1e30) {\n'                                                  +
        '        rgbLambda.rgb = vec3(0.0);\n'                                             +
        '    } else {\n'                                                                   +
        '        posDir.xy = ray.pos + ray.dir*isect.tMax;\n'                              +
        '        posDir.zw = woLocal.y*isect.n + woLocal.x*t;\n'                           +
        '    }\n\n'                                                                        +

        '    gl_FragData[0] = posDir;\n'                                                   +
        '    gl_FragData[1] = state;\n'                                                    +
        '    gl_FragData[2] = rgbLambda;\n'                                                +
        '    gl_FragData[3] = vec4(ray.t0 + tMult * isect.tMax, 0.0, 0.0, 0.0);\n'         +
        '}\n',

    'trace-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n'               +
        'attribute vec2 TexCoord;\n\n'             +

        'varying vec2 vTexCoord;\n\n'              +

        'void main() {\n'                          +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '    vTexCoord = TexCoord;\n'              +
        '}\n'
}