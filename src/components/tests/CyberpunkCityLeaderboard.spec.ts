import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import CyberpunkCity from "../CyberpunkCity.vue";
import { ScoreService } from "../../utils/ScoreService";

// Mock dependencies
vi.mock("vue-router", () => ({
    useRoute: () => ({
        path: "/",
    }),
}));

// Mock ScoreService
vi.mock("../../utils/ScoreService", () => ({
    ScoreService: {
        getTopScores: vi.fn(),
        submitScore: vi.fn(),
    },
}));

// Mock THREE (simplified as we don't need full rendering for this test)
vi.mock("three", () => {
    const THREE = {
        Scene: vi.fn(() => ({
            add: vi.fn(),
            remove: vi.fn(),
            fog: null,
            background: null
        })),
        PerspectiveCamera: vi.fn(() => ({
            position: { set: vi.fn(), x: 0, y: 0, z: 0, copy: vi.fn(), distanceTo: vi.fn(), lerp: vi.fn() },
            rotation: { set: vi.fn(), copy: vi.fn(), x: 0, y: 0, z: 0 },
            quaternion: { slerp: vi.fn() },
            lookAt: vi.fn(),
            updateProjectionMatrix: vi.fn()
        })),
        WebGLRenderer: vi.fn(() => ({
            setSize: vi.fn(),
            render: vi.fn(),
            domElement: document.createElement('canvas'),
            setPixelRatio: vi.fn(),
            dispose: vi.fn()
        })),
        Color: vi.fn(),
        FogExp2: vi.fn(),
        BoxGeometry: vi.fn(() => ({
            translate: vi.fn()
        })),
        CylinderGeometry: vi.fn(() => ({
            rotateX: vi.fn(), // Added rotateX
            translate: vi.fn()
        })),
        SphereGeometry: vi.fn(), // Added SphereGeometry
        ConeGeometry: vi.fn(() => ({
            translate: vi.fn()
        })),
        EdgesGeometry: vi.fn(),
        PlaneGeometry: vi.fn(),
        BufferGeometry: vi.fn(() => ({
            setAttribute: vi.fn(),
            setFromPoints: vi.fn()
        })),
        MeshBasicMaterial: vi.fn(() => ({
            clone: vi.fn(() => ({ clone: vi.fn() }))
        })),
        MeshLambertMaterial: vi.fn(() => ({
            clone: vi.fn(() => ({ clone: vi.fn() }))
        })),
        MeshStandardMaterial: vi.fn(() => ({
            clone: vi.fn(() => ({ clone: vi.fn() }))
        })),
        PointsMaterial: vi.fn(),
        LineBasicMaterial: vi.fn(),
        LineSegments: vi.fn(() => ({
            position: { set: vi.fn(), copy: vi.fn(), x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { set: vi.fn() }
        })),
        Line: vi.fn(),
        Group: vi.fn(() => ({
            add: vi.fn(),
            position: {
                set: vi.fn(),
                x: 0, y: 0, z: 0,
                copy: vi.fn(),
                distanceToSquared: vi.fn(() => 100),
                distanceTo: vi.fn(() => 10),
                clone: vi.fn(() => ({
                    add: vi.fn(function() { return this; }),
                    sub: vi.fn(function() { return this; }),
                    normalize: vi.fn(function() { return this; }),
                    multiplyScalar: vi.fn(function() { return this; }),
                    x: 0, y: 0, z: 0,
                    clone: vi.fn(function() { return this; }), // Added clone to the cloned object
                    distanceTo: vi.fn(() => 10) // Added distanceTo
                })),
                add: vi.fn(),
                sub: vi.fn(function() { return this; }),
                normalize: vi.fn(function() { return this; }),
                multiplyScalar: vi.fn()
            },
            rotation: { x: 0, y: 0, z: 0 },
            traverse: vi.fn(),
            userData: {},
            lookAt: vi.fn()
        })),
        DoubleSide: 2,
        Mesh: vi.fn(() => ({
            position: {
                set: vi.fn(),
                x: 0, y: 0, z: 0,
                distanceToSquared: vi.fn(),
                copy: vi.fn(), // Added copy
                clone: vi.fn(() => ({ sub: vi.fn(), normalize: vi.fn(), add: vi.fn() })), // Added clone chain
                add: vi.fn() // Added add
            },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { set: vi.fn() },
            userData: {},
            add: vi.fn(),
            lookAt: vi.fn(),
            material: { color: { setHex: vi.fn() } } // Added material.color
        })),
        Points: vi.fn(() => ({
            position: { set: vi.fn(), x: 0, y: 0, z: 0 },
            geometry: {
                attributes: {
                    position: {
                        array: new Float32Array(3000),
                        needsUpdate: false
                    },
                    color: {
                        array: new Float32Array(3000),
                        needsUpdate: false,
                        setXYZ: vi.fn()
                    }
                },
                dispose: vi.fn()
            },
            material: {
                dispose: vi.fn()
            }
        })),
        Float32BufferAttribute: vi.fn(),
        BufferAttribute: vi.fn(),
        CanvasTexture: vi.fn(() => ({
            wrapS: 0,
            wrapT: 0,
            magFilter: 0,
            anisotropy: 0,
            repeat: {
                set: vi.fn()
            },
            offset: {
                set: vi.fn()
            }
        })),
        RepeatWrapping: 1000,
        NearestFilter: 1001,
        MathUtils: {
            randFloatSpread: vi.fn(() => 100),
            randFloat: vi.fn(() => 100)
        },
        AmbientLight: vi.fn(),
        PointLight: vi.fn(() => ({
            position: { set: vi.fn(), x: 0, y: 0, z: 0 }
        })),
        DirectionalLight: vi.fn(() => ({
            position: { set: vi.fn(), x: 0, y: 0, z: 0 }
        })),
        SpotLight: vi.fn(() => ({
            position: { set: vi.fn(), x: 0, y: 0, z: 0 },
            target: { position: { set: vi.fn(), x: 0, y: 0, z: 0 } },
            userData: {},
            add: vi.fn()
        })),
        Object3D: vi.fn(() => ({
            position: { set: vi.fn(), x: 0, y: 0, z: 0 },
            add: vi.fn()
        })),
        Quaternion: vi.fn(() => ({
            setFromEuler: vi.fn(),
            slerp: vi.fn()
        })),
        Vector3: vi.fn(() => ({
            x: 0, y: 0, z: 0,
            lerp: vi.fn(),
            subVectors: vi.fn(),
            normalize: vi.fn(),
            multiplyScalar: vi.fn(),
            applyEuler: vi.fn(),
            distanceTo: vi.fn(() => 10),
            distanceToSquared: vi.fn(() => 100)
        })),
        Vector2: vi.fn(),
        Raycaster: vi.fn(() => ({
            setFromCamera: vi.fn(),
            intersectObjects: vi.fn(() => []),
            intersectObject: vi.fn(() => []),
            params: { Points: { threshold: 1 } }
        })),
        AdditiveBlending: 2000,
        Euler: vi.fn(() => ({
            set: vi.fn(),
            copy: vi.fn()
        }))
    }
    return THREE
})


describe("CyberpunkCity Leaderboard", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock canvas context
        const mockContext = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            font: '',
            textAlign: '',
            shadowColor: '',
            shadowBlur: 0,
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            fillText: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            setLineDash: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            clearRect: vi.fn(),
        } as unknown as CanvasRenderingContext2D;

        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);

        (ScoreService.getTopScores as any).mockResolvedValue([
            { name: "ACE", score: 1000 },
            { name: "bob", score: 500 }, // Intentionally lowercase to check display logic
        ]);
        (ScoreService.submitScore as any).mockResolvedValue([
            { name: "TEST", score: 1500 },
            { name: "ACE", score: 1000 },
        ]);

        wrapper = mount(CyberpunkCity, {
            attachTo: document.body,
        });
    });

    afterEach(() => {
        if (wrapper) wrapper.unmount();
    });

    it("submits score in uppercase", async () => {
        const vm = wrapper.vm as any;

        // Force game over state
        vm.isDrivingMode = true;
        vm.isGameOver = true;
        vm.drivingScore = 1500;
        await wrapper.vm.$nextTick();

        // Find input and type lowercase name
        const input = wrapper.find("input.name-input");
        expect(input.exists()).toBe(true);
        await input.setValue("test");

        // Click submit
        const submitBtn = wrapper.find("button.submit-btn");
        await submitBtn.trigger("click");

        expect(ScoreService.submitScore).toHaveBeenCalledWith("TEST", 1500);
    });
});
