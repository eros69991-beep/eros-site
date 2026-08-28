export type DemoMediaKey =
  | 'spring-editorial'
  | 'spring-object-001'
  | 'spring-object-002'
  | 'summer-editorial'
  | 'summer-object-001'
  | 'summer-object-002'
  | 'autumn-editorial'
  | 'autumn-object-001'
  | 'autumn-object-002'
  | 'winter-editorial'
  | 'winter-object-001'
  | 'winter-object-002'

export type DemoMediaFormat = 'avif' | 'webp'
export type DemoMediaClassification = 'critical' | 'deferred'

export interface DemoMediaSource {
  src: string
  bytes: number
  width: number
  height: number
}

export interface DemoMedia {
  alt: string
  width: number
  height: number
  routeGroup: `world:${'spring' | 'summer' | 'autumn' | 'winter'}`
  classification: DemoMediaClassification
  sources: Record<DemoMediaFormat, DemoMediaSource[]>
}

export const mediaManifest = {
  "spring-editorial": {
    "alt": "Demonstration image: SPRING / AWAKENING editorial study with a wet mineral surface, condensation, and restrained cold-green traces.",
    "width": 1600,
    "height": 1999,
    "routeGroup": "world:spring",
    "classification": "critical",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/spring-editorial-640.avif",
          "bytes": 37701,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/spring-editorial-960.avif",
          "bytes": 66953,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/spring-editorial-1600.avif",
          "bytes": 120417,
          "width": 1600,
          "height": 1999
        }
      ],
      "webp": [
        {
          "src": "/media/demo/spring-editorial-640.webp",
          "bytes": 57914,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/spring-editorial-960.webp",
          "bytes": 104886,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/spring-editorial-1600.webp",
          "bytes": 183570,
          "width": 1600,
          "height": 1999
        }
      ]
    }
  },
  "spring-object-001": {
    "alt": "Demonstration image: Mist Shell coated-cotton and mesh prototype object study.",
    "width": 1600,
    "height": 1999,
    "routeGroup": "world:spring",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/spring-object-001-640.avif",
          "bytes": 28806,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/spring-object-001-960.avif",
          "bytes": 58404,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/spring-object-001-1600.avif",
          "bytes": 107881,
          "width": 1600,
          "height": 1999
        }
      ],
      "webp": [
        {
          "src": "/media/demo/spring-object-001-640.webp",
          "bytes": 38514,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/spring-object-001-960.webp",
          "bytes": 77404,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/spring-object-001-1600.webp",
          "bytes": 138900,
          "width": 1600,
          "height": 1999
        }
      ]
    }
  },
  "spring-object-002": {
    "alt": "Demonstration image: Dew Spine resin and stainless-steel prototype object study.",
    "width": 1600,
    "height": 2400,
    "routeGroup": "world:spring",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/spring-object-002-640.avif",
          "bytes": 49319,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/spring-object-002-960.avif",
          "bytes": 95008,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/spring-object-002-1600.avif",
          "bytes": 172521,
          "width": 1600,
          "height": 2400
        }
      ],
      "webp": [
        {
          "src": "/media/demo/spring-object-002-640.webp",
          "bytes": 60346,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/spring-object-002-960.webp",
          "bytes": 114904,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/spring-object-002-1600.webp",
          "bytes": 210878,
          "width": 1600,
          "height": 2400
        }
      ]
    }
  },
  "summer-editorial": {
    "alt": "Demonstration image: SUMMER / BURN editorial study with severe white light, dry air, and hard shadow.",
    "width": 1600,
    "height": 1999,
    "routeGroup": "world:summer",
    "classification": "critical",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/summer-editorial-640.avif",
          "bytes": 14842,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/summer-editorial-960.avif",
          "bytes": 30688,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/summer-editorial-1600.avif",
          "bytes": 68005,
          "width": 1600,
          "height": 1999
        }
      ],
      "webp": [
        {
          "src": "/media/demo/summer-editorial-640.webp",
          "bytes": 18896,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/summer-editorial-960.webp",
          "bytes": 37720,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/summer-editorial-1600.webp",
          "bytes": 79178,
          "width": 1600,
          "height": 1999
        }
      ]
    }
  },
  "summer-object-001": {
    "alt": "Demonstration image: Noon Veil technical-nylon and mesh prototype object study.",
    "width": 1600,
    "height": 2400,
    "routeGroup": "world:summer",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/summer-object-001-640.avif",
          "bytes": 30095,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/summer-object-001-960.avif",
          "bytes": 73997,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/summer-object-001-1600.avif",
          "bytes": 146350,
          "width": 1600,
          "height": 2400
        }
      ],
      "webp": [
        {
          "src": "/media/demo/summer-object-001-640.webp",
          "bytes": 43088,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/summer-object-001-960.webp",
          "bytes": 113236,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/summer-object-001-1600.webp",
          "bytes": 217886,
          "width": 1600,
          "height": 2400
        }
      ]
    }
  },
  "summer-object-002": {
    "alt": "Demonstration image: Heat Trace aluminum and elastomer prototype object study.",
    "width": 1600,
    "height": 2400,
    "routeGroup": "world:summer",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/summer-object-002-640.avif",
          "bytes": 17068,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/summer-object-002-960.avif",
          "bytes": 39728,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/summer-object-002-1600.avif",
          "bytes": 85487,
          "width": 1600,
          "height": 2400
        }
      ],
      "webp": [
        {
          "src": "/media/demo/summer-object-002-640.webp",
          "bytes": 19254,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/summer-object-002-960.webp",
          "bytes": 43780,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/summer-object-002-1600.webp",
          "bytes": 95798,
          "width": 1600,
          "height": 2400
        }
      ]
    }
  },
  "autumn-editorial": {
    "alt": "Demonstration image: AUTUMN / FADE editorial study with an eroded dry surface, dust, and receding warmth.",
    "width": 1600,
    "height": 1999,
    "routeGroup": "world:autumn",
    "classification": "critical",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/autumn-editorial-640.avif",
          "bytes": 47554,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/autumn-editorial-960.avif",
          "bytes": 90630,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/autumn-editorial-1600.avif",
          "bytes": 157436,
          "width": 1600,
          "height": 1999
        }
      ],
      "webp": [
        {
          "src": "/media/demo/autumn-editorial-640.webp",
          "bytes": 70686,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/autumn-editorial-960.webp",
          "bytes": 138304,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/autumn-editorial-1600.webp",
          "bytes": 250498,
          "width": 1600,
          "height": 1999
        }
      ]
    }
  },
  "autumn-object-001": {
    "alt": "Demonstration image: Erosion Layer waxed-cotton and recycled-wool prototype object study.",
    "width": 1600,
    "height": 2400,
    "routeGroup": "world:autumn",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/autumn-object-001-640.avif",
          "bytes": 59981,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/autumn-object-001-960.avif",
          "bytes": 114726,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/autumn-object-001-1600.avif",
          "bytes": 204041,
          "width": 1600,
          "height": 2400
        }
      ],
      "webp": [
        {
          "src": "/media/demo/autumn-object-001-640.webp",
          "bytes": 85864,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/autumn-object-001-960.webp",
          "bytes": 166246,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/autumn-object-001-1600.webp",
          "bytes": 289188,
          "width": 1600,
          "height": 2400
        }
      ]
    }
  },
  "autumn-object-002": {
    "alt": "Demonstration image: Afterlight Strap leather and oxidized-brass prototype object study.",
    "width": 1600,
    "height": 2400,
    "routeGroup": "world:autumn",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/autumn-object-002-640.avif",
          "bytes": 46027,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/autumn-object-002-960.avif",
          "bytes": 91081,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/autumn-object-002-1600.avif",
          "bytes": 164158,
          "width": 1600,
          "height": 2400
        }
      ],
      "webp": [
        {
          "src": "/media/demo/autumn-object-002-640.webp",
          "bytes": 56116,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/autumn-object-002-960.webp",
          "bytes": 121224,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/autumn-object-002-1600.webp",
          "bytes": 219804,
          "width": 1600,
          "height": 2400
        }
      ]
    }
  },
  "winter-editorial": {
    "alt": "Demonstration image: WINTER / FREEZE editorial study with a cold grey field, remote fog, and sparse frost.",
    "width": 1600,
    "height": 1999,
    "routeGroup": "world:winter",
    "classification": "critical",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/winter-editorial-640.avif",
          "bytes": 34147,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/winter-editorial-960.avif",
          "bytes": 62537,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/winter-editorial-1600.avif",
          "bytes": 95720,
          "width": 1600,
          "height": 1999
        }
      ],
      "webp": [
        {
          "src": "/media/demo/winter-editorial-640.webp",
          "bytes": 53460,
          "width": 640,
          "height": 800
        },
        {
          "src": "/media/demo/winter-editorial-960.webp",
          "bytes": 103462,
          "width": 960,
          "height": 1200
        },
        {
          "src": "/media/demo/winter-editorial-1600.webp",
          "bytes": 180166,
          "width": 1600,
          "height": 1999
        }
      ]
    }
  },
  "winter-object-001": {
    "alt": "Demonstration image: Still Field wool and technical-nylon prototype object study.",
    "width": 1600,
    "height": 2404,
    "routeGroup": "world:winter",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/winter-object-001-640.avif",
          "bytes": 31383,
          "width": 640,
          "height": 962
        },
        {
          "src": "/media/demo/winter-object-001-960.avif",
          "bytes": 65332,
          "width": 960,
          "height": 1442
        },
        {
          "src": "/media/demo/winter-object-001-1600.avif",
          "bytes": 115621,
          "width": 1600,
          "height": 2404
        }
      ],
      "webp": [
        {
          "src": "/media/demo/winter-object-001-640.webp",
          "bytes": 37370,
          "width": 640,
          "height": 962
        },
        {
          "src": "/media/demo/winter-object-001-960.webp",
          "bytes": 75252,
          "width": 960,
          "height": 1442
        },
        {
          "src": "/media/demo/winter-object-001-1600.webp",
          "bytes": 140878,
          "width": 1600,
          "height": 2404
        }
      ]
    }
  },
  "winter-object-002": {
    "alt": "Demonstration image: Cold Signal coated-cable and stainless-steel prototype object study.",
    "width": 1600,
    "height": 2400,
    "routeGroup": "world:winter",
    "classification": "deferred",
    "sources": {
      "avif": [
        {
          "src": "/media/demo/winter-object-002-640.avif",
          "bytes": 36473,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/winter-object-002-960.avif",
          "bytes": 66603,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/winter-object-002-1600.avif",
          "bytes": 115569,
          "width": 1600,
          "height": 2400
        }
      ],
      "webp": [
        {
          "src": "/media/demo/winter-object-002-640.webp",
          "bytes": 45144,
          "width": 640,
          "height": 960
        },
        {
          "src": "/media/demo/winter-object-002-960.webp",
          "bytes": 85570,
          "width": 960,
          "height": 1440
        },
        {
          "src": "/media/demo/winter-object-002-1600.webp",
          "bytes": 155918,
          "width": 1600,
          "height": 2400
        }
      ]
    }
  }
} as const satisfies Record<DemoMediaKey, DemoMedia>
