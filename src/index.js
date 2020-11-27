import p5 from 'p5';

const ROFL_MODE = false;

// Textures
import sun_texture from './static/textures/sun.png';
import mercury_texture from './static/textures/mercury.jpg';
import venus_texture from './static/textures/venus.jpg';
import earth_texture from './static/textures/earth.jpg';
import mars_texture from './static/textures/mars.jpg';
import jupiter_texture from './static/textures/jupiter.jpg';
import saturn_texture from './static/textures/saturn.jpg';
import uranus_texture from './static/textures/uranus.jpg';
import neptune_texture from './static/textures/neptune.jpg';

const bodies = [
    {
        name: 'Sun',
        tilt: 0,
        radius: 695700,
        distance: 0,
        texture_path: sun_texture,
        sidereal_period: Math.floor(25.05 * 24 * 60 * 60 * 1000) // 25.05 Days
    },
    {
        name: 'Mercury',
        tilt: 2,
        radius: 2440,
        distance: 58000000,
        texture_path: mercury_texture,
        sidereal_period: Math.floor(58.646 * 24 * 60 * 60 * 1000), // 58.646 Days
        orbital_period: Math.floor(87.9691 * 24 * 60 * 60 * 1000) // 87.9691 Days
    },
    {
        name: 'Venus',
        tilt: 3,
        radius: 6051,
        distance: 108000000,
        texture_path: venus_texture,
        sidereal_period: 116 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000, // 116 Days and 18 hours
        orbital_period: 225 * 24 * 60 * 60 * 1000 // 225 Days
    },
    {
        name: 'Earth',
        tilt: 23.5,
        radius: 6371,
        distance: 147630000,
        texture_path: earth_texture,
        sidereal_period: 24 * 60 * 60 * 1000, // 24 Hours
        orbital_period: 365 * 24 * 60 * 60 * 1000 // 365 Days
    },
    {
        name: 'Mars',
        tilt: 25.19,
        radius: 3340,
        distance: 220290000,
        texture_path: mars_texture,
        sidereal_period: 24 * 60 * 60 * 1000 + 37 * 60 * 1000, // 1d 37m
        orbital_period: 687 * 24 * 60 * 60 * 1000 // 687d
    },
    {
        name: 'Jupiter',
        tilt: 3,
        radius: 69911,
        distance: 778500000,
        texture_path: jupiter_texture,
        sidereal_period: 9 * 60 * 60 * 1000 + 56 * 60 * 1000, // 9h 56m
        orbital_period: 12 * 365 * 24 * 60 * 60 * 1000, // 12y
        ring_color: 255
    },
    {
        name: 'Saturn',
        tilt: 26.73,
        radius: 58232,
        distance: 1434000000,
        texture_path: saturn_texture,
        sidereal_period: 10 * 60 * 60 * 1000 + 42 * 60 * 1000, // 10h 42m
        orbital_period: 29 * 365 * 24 * 60 * 60 * 1000, // 29y
        ring_color: 255
    },
    {
        name: 'Uranus',
        tilt: 97.77,
        radius: 25362,
        distance: 2958300000,
        texture_path: uranus_texture,
        sidereal_period: 17 * 60 * 60 * 1000 + 14 * 60 * 1000, // 17h 14m
        orbital_period: 84 * 365 * 24 * 60 * 60 * 1000 // 84y
    },
    {
        name: 'Neptune',
        tilt: 25.5,
        radius: 24622,
        distance: 4495000000,
        texture_path: neptune_texture,
        sidereal_period: 16 * 60 * 60 * 1000 + 6 * 60 * 1000, // 16h 6m
        orbital_period: 165 * 365 * 24 * 60 * 60 * 1000 // 165y
    }
]

let textures = {};
let ring_textures = {};

new p5(p => {
    // Settings
    let axis_rotation;
    let big_planets;
    let cube_planets;

    let size_scale;
    let size_p;
    let distance_scale;
    let distance_p;
    let time_scale;
    let time_p;

    let camera_x = 0;
    let camera_y = 0;
    let offset_x = 0;
    let offset_y = 0;
    let camera_z = 1000;
    let real_z = camera_z;

    p.preload = () => {
        for (let i=0; i<bodies.length; i++) {
            textures[bodies[i].name] = p.loadImage(bodies[i].texture_path);
        }
    }

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight * 0.8, p.WEBGL);

        p.angleMode(p.DEGREES);
        p.perspective(180 / 3.0, p.width / p.height, 0.1, 10000000000);

        // Create dom elements
        axis_rotation = p.createCheckbox('Axis Rotation', false);
        big_planets = p.createCheckbox('Big Planets (Scales everything except the Sun)', false);
        cube_planets = p.createCheckbox('Cube Planets', false);

        size_scale = p.createSlider(1, 10000, 10000);
        size_p = p.createP('');
        distance_scale = p.createSlider(1, 500000, 500000);
        distance_p = p.createP('');
        time_scale = p.createSlider(1, 1000000000, 10000000);
        time_p = p.createP('');

        for (let i=0; i<bodies.length; i++) {
            if (bodies[i].ring_color) {
                let texture_size = Math.max(bodies[i].radius / size_scale.value(), 1) * 3 * 500;
                ring_textures[bodies[i].name] = p.createGraphics(texture_size, texture_size);
            }
        }
    };

    p.draw = () => {
        // DOM
        size_p.html(`Sizes: 1km = ${size_scale.value()}px`);
        distance_p.html(`Distance: 1km = ${distance_scale.value()}px`);
        time_p.html(`Time: 1:${time_scale.value()}`);

        // Controls
        if (p.keyIsDown(68)) camera_x += 10 * camera_z / 600;
        if (p.keyIsDown(65)) camera_x -= 10 * camera_z / 600;
        if (p.keyIsDown(83)) camera_y += 10 * camera_z / 600;
        if (p.keyIsDown(87)) camera_y -= 10 * camera_z / 1000;

        offset_x += (p.mouseX - p.width / 2 - offset_x) * 0.05;
        offset_y += (p.mouseY - p.height / 2 - offset_y) * 0.05;
        camera_z += (real_z - camera_z) * 0.1;

        p.camera(
            camera_x + offset_x * camera_z / 1000,
            camera_y + offset_y * camera_z / 1000, 
            camera_z, 
            camera_x + offset_x * camera_z / 1000, 
            camera_y + offset_y * camera_z / 1000, 
            0, 0, 1, 0);

        p.background(0);
        p.ambientLight(100);
        p.pointLight(253, 184, 19, 0, 0, 500);

        // Render bodies in the solar system
        bodies.forEach((body) => {
            // Create the orbit
            p.push();

            p.translate(0, 0, -10);
            p.noStroke();
            p.emissiveMaterial(74);
            p.torus(body.distance / distance_scale.value(), Math.max(Math.floor(1 * camera_z / 1000), 1), 100, 100);

            p.pop()

            // Create the solar body
            p.push();

            p.texture(textures[body.name]);

            // Position
            if (body.orbital_period !== undefined) {
                p.translate(
                    p.cos(p.TWO_PI * p.millis() / body.orbital_period * time_scale.value()) * body.distance / distance_scale.value(),
                    p.sin(p.TWO_PI * p.millis() / body.orbital_period * time_scale.value()) * body.distance / distance_scale.value(),
                    0
                )
            }

            // Rotation
            p.rotateX(-90 + body.tilt);
            if (axis_rotation.checked()) {
                p.rotateY(p.millis() * 360 / body.sidereal_period * time_scale.value());
                if (ROFL_MODE) {
                    p.rotateX(p.millis() * 360 / body.sidereal_period * time_scale.value());
                    p.rotateY(p.millis() * 360 / body.sidereal_period * time_scale.value());
                }
            }

            let radius = Math.max(body.radius / size_scale.value(), 1);
            if (big_planets.checked() && body.name !== 'Sun') radius = Math.max(body.radius / size_scale.value() * 50, 1);

            if (!cube_planets.checked()) p.sphere(radius, 100, 100);
            else p.box(2*radius, 2*radius);

            // Draw ring
            if (body.ring_color !== undefined) {
                /*
                let texture_size = radius * 3 * 500;
                p.rotateX(90);
                ring_textures[body.name].clear();
                ring_textures[body.name].noFill();
                ring_textures[body.name].stroke(body.ring_color);
                ring_textures[body.name].strokeWeight(texture_size / 5);
                ring_textures[body.name].circle(texture_size / 2, texture_size / 2, texture_size / 1.5);
                p.texture(ring_textures[body.name]);
                p.noStroke();
                p.plane(radius * 6, radius * 6);
                */
                p.rotateX(90);
                p.noStroke();
                p.emissiveMaterial(body.ring_color);
                p.torus(radius*3, radius, 100, 3);
            }

            p.pop();
        });
    };

    p.mouseWheel = (event) => {
        real_z = Math.max(real_z + event.delta, 20);
        console.log(real_z);
    };
}, document.getElementById('p5'));
