"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.FirstPersonControls = void 0;
var three_1 = require("three");
var FirstPersonControls = /** @class */ (function (_super) {
    __extends(FirstPersonControls, _super);
    function FirstPersonControls(object, domElement) {
        var _this = _super.call(this) || this;
        _this.handleResize = function () {
            if (_this.domElement === document) {
                _this.viewHalfX = window.innerWidth / 2;
                _this.viewHalfY = window.innerHeight / 2;
            }
            else {
                _this.viewHalfX = _this.domElement.offsetWidth / 2;
                _this.viewHalfY = _this.domElement.offsetHeight / 2;
            }
        };
        _this.onMouseDown = function (event) {
            if (_this.domElement !== document) {
                _this.domElement.focus();
            }
            event.preventDefault();
            if (_this.activeLook) {
                switch (event.button) {
                    case 0:
                        _this.moveForward = true;
                        break;
                    case 2:
                        _this.moveBackward = true;
                        break;
                }
            }
            _this.mouseDragOn = true;
        };
        _this.onMouseUp = function (event) {
            event.preventDefault();
            if (_this.activeLook) {
                switch (event.button) {
                    case 0:
                        _this.moveForward = false;
                        break;
                    case 2:
                        _this.moveBackward = false;
                        break;
                }
            }
            _this.mouseDragOn = false;
        };
        _this.onMouseMove = function (event) {
            if (_this.domElement === document) {
                _this.mouseX = event.pageX - _this.viewHalfX;
                _this.mouseY = event.pageY - _this.viewHalfY;
            }
            else {
                _this.mouseX = event.pageX - _this.domElement.offsetLeft - _this.viewHalfX;
                _this.mouseY = event.pageY - _this.domElement.offsetTop - _this.viewHalfY;
            }
        };
        _this.onKeyDown = function (event) {
            //event.preventDefault();
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    _this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    _this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    _this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    _this.moveRight = true;
                    break;
                case 'KeyR':
                    _this.moveUp = true;
                    break;
                case 'KeyF':
                    _this.moveDown = true;
                    break;
            }
        };
        _this.onKeyUp = function (event) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    _this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    _this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    _this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    _this.moveRight = false;
                    break;
                case 'KeyR':
                    _this.moveUp = false;
                    break;
                case 'KeyF':
                    _this.moveDown = false;
                    break;
            }
        };
        _this.lookAt = function (x, y, z) {
            if (x instanceof three_1.Vector3) {
                x.isVector3;
                _this.target.copy(x);
            }
            else if (y && z) {
                _this.target.set(x, y, z);
            }
            _this.object.lookAt(_this.target);
            _this.setOrientation(_this);
            return _this;
        };
        _this.update = (function () {
            var targetPosition = new three_1.Vector3();
            return function (delta) {
                if (_this.enabled === false)
                    return;
                if (_this.heightSpeed) {
                    var y = three_1.MathUtils.clamp(_this.object.position.y, _this.heightMin, _this.heightMax);
                    var heightDelta = y - _this.heightMin;
                    _this.autoSpeedFactor = delta * (heightDelta * _this.heightCoef);
                }
                else {
                    _this.autoSpeedFactor = 0.0;
                }
                var actualMoveSpeed = delta * _this.movementSpeed;
                if (_this.moveForward || (_this.autoForward && !_this.moveBackward)) {
                    _this.object.translateZ(-(actualMoveSpeed + _this.autoSpeedFactor));
                }
                if (_this.moveBackward)
                    _this.object.translateZ(actualMoveSpeed);
                if (_this.moveLeft)
                    _this.object.translateX(-actualMoveSpeed);
                if (_this.moveRight)
                    _this.object.translateX(actualMoveSpeed);
                if (_this.moveUp)
                    _this.object.translateY(actualMoveSpeed);
                if (_this.moveDown)
                    _this.object.translateY(-actualMoveSpeed);
                var actualLookSpeed = delta * _this.lookSpeed;
                if (!_this.activeLook) {
                    actualLookSpeed = 0;
                }
                var verticalLookRatio = 1;
                if (_this.constrainVertical) {
                    verticalLookRatio = Math.PI / (_this.verticalMax - _this.verticalMin);
                }
                _this.lon -= _this.mouseX * actualLookSpeed;
                if (_this.lookVertical)
                    _this.lat -= _this.mouseY * actualLookSpeed * verticalLookRatio;
                _this.lat = Math.max(-85, Math.min(85, _this.lat));
                var phi = three_1.MathUtils.degToRad(90 - _this.lat);
                var theta = three_1.MathUtils.degToRad(_this.lon);
                if (_this.constrainVertical) {
                    phi = three_1.MathUtils.mapLinear(phi, 0, Math.PI, _this.verticalMin, _this.verticalMax);
                }
                var position = _this.object.position;
                targetPosition.setFromSphericalCoords(1, phi, theta).add(position);
                _this.object.lookAt(targetPosition);
            };
        })();
        _this.contextmenu = function (event) { return event.preventDefault(); };
        _this.setOrientation = function (controls) {
            var quaternion = controls.object.quaternion;
            _this.lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
            _this.spherical.setFromVector3(_this.lookDirection);
            _this.lat = 90 - three_1.MathUtils.radToDeg(_this.spherical.phi);
            _this.lon = three_1.MathUtils.radToDeg(_this.spherical.theta);
        };
        if (domElement === undefined) {
            console.warn('THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.');
            domElement = document;
        }
        _this.object = object;
        _this.domElement = domElement;
        // API
        _this.enabled = true;
        _this.movementSpeed = 1.0;
        _this.lookSpeed = 0.005;
        _this.lookVertical = true;
        _this.autoForward = false;
        _this.activeLook = true;
        _this.heightSpeed = false;
        _this.heightCoef = 1.0;
        _this.heightMin = 0.0;
        _this.heightMax = 1.0;
        _this.constrainVertical = false;
        _this.verticalMin = 0;
        _this.verticalMax = Math.PI;
        _this.mouseDragOn = false;
        // internals
        _this.autoSpeedFactor = 0.0;
        _this.mouseX = 0;
        _this.mouseY = 0;
        _this.moveForward = false;
        _this.moveBackward = false;
        _this.moveLeft = false;
        _this.moveRight = false;
        _this.moveUp = false;
        _this.moveDown = false;
        _this.viewHalfX = 0;
        _this.viewHalfY = 0;
        // private variables
        _this.lat = 0;
        _this.lon = 0;
        _this.lookDirection = new three_1.Vector3();
        _this.spherical = new three_1.Spherical();
        _this.target = new three_1.Vector3();
        //
        if (_this.domElement !== document) {
            _this.domElement.setAttribute('tabindex', '-1');
        }
        _this.dispose = function () {
            this.domElement.removeEventListener('contextmenu', this.contextmenu);
            this.domElement.removeEventListener('mousedown', _onMouseDown);
            this.domElement.removeEventListener('mousemove', _onMouseMove);
            this.domElement.removeEventListener('mouseup', _onMouseUp);
            window.removeEventListener('keydown', _onKeyDown);
            window.removeEventListener('keyup', _onKeyUp);
        };
        var _onMouseMove = bind(_this, _this.onMouseMove);
        var _onMouseDown = bind(_this, _this.onMouseDown);
        var _onMouseUp = bind(_this, _this.onMouseUp);
        var _onKeyDown = bind(_this, _this.onKeyDown);
        var _onKeyUp = bind(_this, _this.onKeyUp);
        _this.domElement.addEventListener('contextmenu', _this.contextmenu);
        _this.domElement.addEventListener('mousemove', _onMouseMove);
        _this.domElement.addEventListener('mousedown', _onMouseDown);
        _this.domElement.addEventListener('mouseup', _onMouseUp);
        window.addEventListener('keydown', _onKeyDown);
        window.addEventListener('keyup', _onKeyUp);
        function bind(scope, fn) {
            return function () {
                fn.apply(scope, arguments);
            };
        }
        _this.handleResize();
        _this.setOrientation(_this);
        return _this;
    }
    return FirstPersonControls;
}(three_1.EventDispatcher));
exports.FirstPersonControls = FirstPersonControls;
