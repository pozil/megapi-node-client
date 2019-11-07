const SerialPort = require('serialport');
import ByteUtils from './byteUtils.js';

const MAX_LINEAR_SPEED = 200;

export default class MegaPi {
    /**
     * Configures the MegaPi controller.
     * @param {string} port path of the serial port. '/dev/ttyAMA0' by default.
     * @param {boolean} isDebugMode whether debug mode is enabled. Debug mode will output serial I/O to logs.
     * @param {*} logger class used to write logs. Defaults to console. You can replace it with a logging library like Winston.
     */
    constructor(port = '/dev/ttyAMA0', isDebugMode = false, logger = console) {
        this.serialPort = new SerialPort(port, {
            baudRate: 115200,
            autoOpen: false
        });
        this.isDebugMode = isDebugMode;
        this.logger = logger;
        this.buffer = [];
        this.selectors = {};
        this.isParseStart = false;
        this.isParseStartIndex;
        this.isStartup = false;
    }

    /**
     * Connects to MegaPi
     * @returns {Promise} promise that resolves when connection is established.
     */
    async connect() {
        return new Promise((resolve, reject) => {
            this.serialPort.on('data', data => {
                // Wait for firmware version sent at startup
                if (this.isStartup) {
                    const firmwareVersion = ByteUtils.getStringFromBytes(data);
                    this.logger.info(
                        `MegaPi connected. Firmware ${firmwareVersion}`
                    );
                    this.isStartup = false;
                    return resolve();
                }
                // Parse input
                this._parseInput(data);
            });

            this.serialPort.on('error', error => {
                this.logger.error(
                    `Serial port error: ${JSON.stringify(error)}`
                );
            });

            this.serialPort.on('open', () => {
                this.isStartup = true;
            });

            this.serialPort.open(error => {
                if (error) {
                    reject(
                        `Error opening serial port: ${JSON.stringify(error)}`
                    );
                }
            });
        });
    }

    /**
     * Disconnects from MegaPi
     * @returns {Promise} promise that resolves when connection is closed or if there were no connection.
     */
    async disconnect() {
        if (this.serialPort.isOpen) {
            return new Promise(resolve => {
                this.serialPort.close(error => {
                    if (error) {
                        this.logger.error(
                            `Serial port disconnect error: ${JSON.stringify(
                                error
                            )}`
                        );
                    }
                    resolve();
                });
            });
        }
        return Promise.resolve();
    }

    /**
     * Returns whether the connection to MegaPi is open
     * @returns {boolean} true if connection is open
     */
    isConnected() {
        return this.serialPort.isOpen;
    }

    digitalWrite(pin, level) {
        const id = 0;
        const action = 2;
        const device = 0x1e;
        this._write([id, action, device, pin, level]);
    }

    pwmWrite(pin, pwm) {
        const id = 0;
        const action = 2;
        const device = 0x20;
        this._write([id, action, device, pin, pwm]);
    }

    async digitalRead(pin) {
        const id = pin;
        const action = 1;
        const device = 0x1e;

        this._write([id, action, device, pin]);
        return this._getResponsePromise(id);
    }

    async analogRead(pin) {
        const id = pin + 54;
        const action = 1;
        const device = 0x1f;

        this._write([id, action, device, pin + 54]);
        return this._getResponsePromise(id);
    }

    /**
     * Reset all motors and home positions
     */
    async reset() {
        const action = 4;
        this._write([0, action]);
    }

    /**
     * Read firmware version
     * @returns {Promise<string>} promise with firmware version string
     */
    async firmwareVersionRead() {
        const port = 0;
        const action = 1;
        const device = 0;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async ultrasonicSensorRead(port) {
        const action = 1;
        const device = 1;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async lightSensorRead(port) {
        const action = 1;
        const device = 3;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async soundSensorRead(port) {
        const action = 1;
        const device = 7;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async pirMotionSensorRead(port) {
        const action = 1;
        const device = 15;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async potentiometerRead(port) {
        const action = 1;
        const device = 4;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async lineFollowerRead(port) {
        const action = 1;
        const device = 17;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async limitSwitchRead(port) {
        const action = 1;
        const device = 21;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async temperatureRead(port, slot) {
        const action = 1;
        const device = 2;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port, slot]);
        return this._getResponsePromise(id);
    }

    async touchSensorRead(port) {
        const action = 1;
        const device = 15;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async humitureSensorRead(port, type) {
        const action = 1;
        const device = 23;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port, type]);
        return this._getResponsePromise(id);
    }

    async joystickRead(port, axis) {
        const action = 1;
        const device = 5;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port, axis]);
        return this._getResponsePromise(id);
    }

    async gasSensorRead(port) {
        const action = 1;
        const device = 25;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async buttonRead(port) {
        const action = 1;
        const device = 22;
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port]);
        return this._getResponsePromise(id);
    }

    async gyroRead(port, axis) {
        const action = 1;
        const device = 6;
        const id = (((port + axis) << 4) + device) & 0xff;
        this._write([id, action, device, port, axis]);
        return this._getResponsePromise(id);
    }

    dcMotorRun(port, speed) {
        const id = 0;
        const action = 2;
        const device = 0xa;
        const spd = ByteUtils.getBytesFromShort(speed);
        this._write([id, action, device, port].concat(spd));
    }

    dcMotorStop(port) {
        self.dcMotorRun(port, 0);
    }

    servoRun(port, slot, angle) {
        const id = 0;
        const action = 2;
        const device = 11;
        this._write([id, action, device, port, slot, angle]);
    }

    /**
     * Sets encoder motor speed
     * @param {number} slot
     * @param {number} speed
     */
    encoderMotorRun(slot, speed) {
        const id = 0;
        const action = 2;
        const device = 62;
        const spd = ByteUtils.getBytesFromShort(speed);
        this._write([id, action, device, 0x02, slot].concat(spd));
    }

    /**
     * Move encoder motor a certain distance at given speed
     * @param {number} slot
     * @param {number} speed
     * @param {number} distance
     * @returns {Promise<number>} Promise holding moved slot
     */
    async encoderMotorMove(slot, speed, distance) {
        const action = 2;
        const device = 62;
        const spd = ByteUtils.getBytesFromShort(speed);
        const dist = ByteUtils.getBytesFromLong(distance);
        const id = ((slot << 4) + device) & 0xff;
        this._write([id, action, device, 0x01, slot].concat(dist).concat(spd));
        return this._getResponsePromise(id);
    }

    /**
     * Move encoder motor at a certain position at given speed
     * @param {number} slot
     * @param {number} speed
     * @param {number} position
     * @returns {Promise<number>} Promise holding moved slot
     */
    async encoderMotorMoveTo(slot, speed, position) {
        const action = 2;
        const device = 62;
        const spd = ByteUtils.getBytesFromShort(speed);
        const pst = ByteUtils.getBytesFromLong(position);
        const id = ((slot << 4) + device) & 0xff;
        this._write([id, action, device, 0x06, slot].concat(pst).concat(spd));
        return this._getResponsePromise(id);
    }

    /**
     * Read encoder motor position
     * @param {number} slot
     * @returns {Promise<number>} Promise holding motor position
     */
    async encoderMotorPosition(slot) {
        const action = 1;
        const device = 61;
        const id = (((slot + action) << 4) + device) & 0xff;
        this._write([id, action, device, 0, slot, 1]);
        return this._getResponsePromise(id);
    }

    async encoderMotorSpeed(slot) {
        const action = 1;
        const device = 61;
        const id = (((slot + action) << 4) + device) & 0xff;
        this._write([id, action, device, 0, slot, 2]);
        return this._getResponsePromise(id);
    }

    stepperMotorRun(port, speed) {
        const id = 0;
        const action = 2;
        const device = 62;
        const spd = ByteUtils.getBytesFromShort(speed);
        this._write([id, action, device, port, 1].concat(spd));
    }

    async stepperMotorMove(port, speed, distance) {
        const action = 2;
        const device = 62;
        const spd = ByteUtils.getBytesFromShort(speed);
        const dist = ByteUtils.getBytesFromLong(distance);
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port, 2].concat(spd).concat(dist));
        return this._getResponsePromise(id);
    }

    async stepperMotorMoveTo(port, speed, position) {
        const action = 2;
        const device = 62;
        const spd = ByteUtils.getBytesFromShort(speed);
        const pst = ByteUtils.getBytesFromLong(position);
        const id = ((port << 4) + device) & 0xff;
        this._write([id, action, device, port, 3].concat(spd).concat(pst));
        return this._getResponsePromise(id);
    }

    stepperMotorSetting(port, microsteps, acceleration) {
        const action = 2;
        const device = 62;
        const acc = ByteUtils.getBytesFromShort(acceleration);
        const id = 0;
        this._write([id, action, device, port, 4, microsteps].concat(acc));
    }

    async stepperMotorPosition(port) {
        const action = 1;
        const device = 62;
        const id = (((port + action) << 4) + device) & 0xff;
        this._write([id, action, device, port, 1]);
        return this._getResponsePromise(id);
    }

    async stepperMotorSpeed(port) {
        const action = 1;
        const device = 62;
        const id = (((port + action) << 4) + device) & 0xff;
        this._write([id, action, device, port, 2]);
        return this._getResponsePromise(id);
    }

    rgbledDisplay(port, slot, index, red, green, blue) {
        const id = 0;
        const action = 2;
        const device = 8;
        this._write([
            id,
            action,
            device,
            port,
            slot,
            index,
            parseInt(red),
            parseInt(green),
            parseInt(blue)
        ]);
    }

    rgbledShow(port, slot) {
        const id = 0;
        const action = 2;
        const device = 8;
        this._write([id, action, device, port, slot]);
    }

    sevenSegmentDisplay(port, value) {
        const id = 0;
        const action = 2;
        const device = 9;
        const v = ByteUtils.getBytesFromFloat(value);
        this._write([id, action, device, port].concat(v));
    }

    ledMatrixMessage(port, x, y, message) {
        const id = 0;
        const action = 2;
        const device = 41;
        const msg = [];
        for (let i = 0; i < message.length; i++) {
            msg[i] = message.charCodeAt(i);
        }
        msg.push(0);
        this._write(
            [id, action, device, port, 1, x, 7 - y, message.length + 1].concat(
                msg
            )
        );
    }

    ledMatrixDisplay(port, x, y, buffer) {
        const id = 0;
        const action = 2;
        const device = 41;
        this._write([id, action, device, port, 2, x, 7 - y].concat(buffer));
    }

    shutterDo(port, method) {
        const id = 0;
        const action = 2;
        const device = 20;
        this._write([id, action, device, port, method]);
    }

    mecanumRun(xSpeed, ySpeed, aSpeed) {
        let spd1 = ySpeed - xSpeed + aSpeed;
        let spd2 = ySpeed + xSpeed - aSpeed;
        let spd3 = ySpeed - xSpeed - aSpeed;
        let spd4 = ySpeed + xSpeed + aSpeed;
        const max = Math.max(spd1, Math.max(spd2, Math.max(spd3, spd4)));
        if (max > MAX_LINEAR_SPEED) {
            const per = MAX_LINEAR_SPEED / max;
            spd1 *= per;
            spd2 *= per;
            spd3 *= per;
            spd4 *= per;
        }
        self.dcMotorRun(1, spd1);
        self.dcMotorRun(2, spd2);
        self.dcMotorRun(9, spd3);
        self.dcMotorRun(10, -spd4);
    }

    _getResponsePromise(id) {
        return new Promise(resolve => {
            const callbackId = id;
            const callback = value => {
                return resolve(value);
            };
            this.selectors[`callback_${callbackId}`] = callback;
        });
    }

    _parseInput(data) {
        if (this.isDebugMode) {
            this.logger.info(`Serial IN: ${data.inspect()}`);
        }
        const readBuffer = new Uint8Array(data);
        for (let i = 0; i < readBuffer.length; i++) {
            this.buffer.push(readBuffer[i]);
            const len = this.buffer.length;
            if (len >= 2) {
                if (
                    this.buffer[len - 1] == 0x55 &&
                    this.buffer[len - 2] == 0xff
                ) {
                    this.isParseStart = true;
                    this.isParseStartIndex = len - 2;
                }
                if (
                    this.buffer[len - 1] == 0xa &&
                    this.buffer[len - 2] == 0xd &&
                    this.isParseStart == true
                ) {
                    this.isParseStart = false;
                    let position = this.isParseStartIndex + 2;
                    const extId = this.buffer[position];
                    position += 1;
                    const type = this.buffer[position];
                    let value = 0;
                    position += 1; //# 1 byte 2 float 3 short 4 len+string 5 double 6 long
                    switch (type) {
                        case 1:
                            value = this.buffer[position];
                            break;
                        case 2:
                            value = ByteUtils.getFloatFromBytes([
                                this.buffer[position],
                                this.buffer[position + 1],
                                this.buffer[position + 2],
                                this.buffer[position + 3]
                            ]);
                            break;
                        case 3:
                            value = ByteUtils.getShortFromBytes([
                                this.buffer[position],
                                this.buffer[position + 1]
                            ]);
                            break;
                        case 4:
                            value = ByteUtils.getStringFromBytes(
                                data.slice(position + 1)
                            );
                            break;
                        case 6:
                            value = ByteUtils.getLongFromBytes([
                                this.buffer[position],
                                this.buffer[position + 1],
                                this.buffer[position + 2],
                                this.buffer[position + 3]
                            ]);
                            break;
                        case 10:
                            // Ignore confirmation messages
                            break;
                        default:
                            this.logger.warn(
                                `Unsupported data type ${type} for input: ${data.inspect()}`
                            );
                            break;
                    }
                    if (type <= 6) {
                        // Execute callback
                        const callback = this.selectors[`callback_${extId}`];
                        if (callback) {
                            callback(value);
                        }
                    }
                    this.buffer = [];
                }
            }
        }
    }

    _write(buffer) {
        if (!this.serialPort.isOpen) {
            throw new Error('Cannot write to serial port: port is not open');
        }

        const buf = Buffer.from(
            [0xff, 0x55, buffer.length + 1].concat(buffer).concat([0xa])
        );
        this.serialPort.write(buf, error => {
            if (error) {
                this.logger.error(
                    `Serial port write error: ${JSON.stringify(error)}`
                );
            } else if (this.isDebugMode) {
                this.logger.info(`Serial OUT: ${buf.inspect()}`);
            }
        });
    }
}
