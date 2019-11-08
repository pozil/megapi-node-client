# MegaPi Node Client

Unofficial MegaPi Node.js client derived from the unmaintained [Makeblock library](https://github.com/Makeblock-Official/NodeForMegaPi).

This projects brings the following major improvements:

-   fixed a bunch of functions to work with latest firmware (the official Node project was out of sync with firmware)
-   added support for Node.js v10 (last version supported on Raspberry Pi Zero)
-   moved to a modern ES6 syntax (classes, async functions...)
-   added a debug mode to trace serial communication

Works with MegaPi firmware `0e.01.016` and USB connection.

**WARNING:** not all functions work. Some functions were not working in the original project and haven't been fixed (PRs welcome).<br/>
Commented functions indicate the ones that have been tested.

## How To Use

Assuming that you are running Node.js on a Raspberry Pi connected to MegaPi via USB.

-   Compile and upload the [Firmware to your MegaPi](https://github.com/Makeblock-Official/FirmwareForMegaPi)
-   Install the client on your Raspberry Pi:

```
npm install megapi-node-client
```

-   Use this sample code to try out the project. You may need to change the `/dev/ttyUSB0` port depending on where you plug the USB cable. You can also pass options to the MegaPi constuctor (not shown here, see API section for details).

```js
import MegaPi from 'megapi-node-client';

const megaPi = new MegaPi('/dev/ttyUSB0');
await megaPi.connect();
await megaPi.encoderMotorMove(1, 100, 500);
await megaPi.encoderMotorMove(3, 100, 300);
await megaPi.disconnect();
```

-   Build and run your code

## API

Documentation is kept in the code (JSDoc) but here's an overview of what's available.

## Constructor Options

The client is build by calling this constructor: `MegaPi(port = '/dev/ttyAMA0', options = {})`.
Options are the following:

| Option                       | Default   | Description                                                                           |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------- |
| `isDebugMode: boolean`       | `false`   | whether debug mode is enabled. Debug mode will output serial I/O to logs.             |
| `logger: Object`             | `console` | class that is used to write logs. Use this to plug in a logging library like Winston. |
| `logWelcomeMessage: boolean` | `true`    | whether to log the welcome message that indicates the firmware version.               |

## Function Overview

Functions annotated with ✔ have been tested with hardware, are documented and are know to work. The others may or may not work.

-   Main

    -   ✔ **MegaPi**( serialPortPath, options )
    -   ✔ **disconnect**()
    -   ✔ **firmwareVersionRead**()
    -   ✔ **reset**()

-   GPIO

    -   **digitalWrite**( pin, level )
    -   **pwmWrite**( pin, pwm )
    -   **digitalRead**( pin )
    -   **analogRead**( pin )

-   Motion

    -   DC Motor
        -   ✔ **dcMotorRun**( port, speed )
        -   ✔ **dcMotorStop**( port )
    -   Servo Motor
        -   **servoRun**( port, slot, angle )
    -   Encoder Motor
        -   ✔ **encoderMotorRun**( slot, speed )
        -   ✔ **encoderMotorStopn**( slot )
        -   ✔ **encoderMotorMove**( slot, speed, distance )
        -   ✔ **encoderMotorMoveTo**( slot, speed, position )
        -   ✔ **encoderMotorPosition**( slot )
        -   **encoderMotorSpeed**( slot )
    -   Stepper Motor
        -   **stepperMotorSetting**( port, microsteps, acceleration )
        -   **stepperMotorRun**( port, speed )
        -   **stepperMotorMove**( port, speed, distance )
        -   **stepperMotorMoveTo**( port, speed, position )

-   Sensors

    -   Ultrasonic Sensor
        -   **ultrasonicSensorRead**( port )
    -   LineFollow Sensor
        -   ✔ **lineFollowerRead**( port )
    -   Light Sensor
        -   **lightSensorRead**( port )
    -   Sound Sensor
        -   **soundSensorRead**( port )
    -   Temperature Sensor
        -   **temperatureRead**( port )
    -   PIR Motion Sensor
        -   **pirMotionSensorRead**( port )
    -   Touch Sensor
        -   **touchSensorRead**( port )
    -   LimitSwitch
        -   **limitSwitchRead**( port, slot )
    -   Humiture Sensor
        -   **humitureSensorRead**( port, type )
    -   Gas Sensor
        -   **gasSensorRead**( port )
    -   Flame Sensor
        -   **flameSensorRead**( port )
    -   Button
        -   **buttonRead**( port )
    -   Potentiometer
        -   **potentiometerRead**( port )
    -   Joystick
        -   **joystickRead**( port, axis )
    -   3-Axis Accelerometer and Gyro Sensor
        -   **gyroRead**( axis )
    -   Compass
        -   **compassRead**( **function** onResult )

-   Display

    -   RGB Led
        -   **rgbledDisplay**( port, slot, index, r, g, b )
        -   **rgbledShow**( port, slot )
    -   7-segment Display
        -   **sevenSegmentDisplay**( port, value )
    -   Led Matrix Display
        -   **ledMatrixMessage**( port, x, y, msg )
        -   **ledMatrixDisplay**( port, x, y, buffer )
    -   Serial LCD Display
        -   **lcdDisplay**( string )

-   DSLR Shutter
    -   **shutterOn**( port )
    -   **shutterOff**( port )
    -   **focusOn**( port )
    -   **focusOff**( port )
