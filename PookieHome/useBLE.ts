import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

interface BluetoothLowEnergyAPI {
    requestPermissions(): Promise<boolean>;
    scanForPeripherals(): void;
    allDevices: Device[];
    connectToDevice(device: Device): Promise<void>;
    connectedDevice: Device | null;
}

function useBLE(): BluetoothLowEnergyAPI {
    const bleManager = useMemo(() => new BleManager(), []);
    
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

    const requestAndroid31Permissions = async () => {
        const bluetoothScanPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
                title: "Bluetooth Scan Permissions",
                message: "App needs to scan for Bluetooth devices.",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        const bluetoConnectPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
                title: "Bluetooth Connect Permissions",
                message: "App needs to connect to Bluetooth devices.",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        const bluetoFineLocationPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Bluetooth Fine Location Permissions",
                message: "App needs to access fine location to connect to Bluetooth devices.",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        return (
            bluetoothScanPermissions === "granted" &&
            bluetoConnectPermissions === "granted" &&
            bluetoFineLocationPermissions === "granted"
        );
    };

    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Bluetooth Permissions",
                    message: "App needs to access Bluetooth devices.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            else {
                const isAndroid31PermissionsGranted = await requestAndroid31Permissions();
                return isAndroid31PermissionsGranted;
            }
        }
        else {
            return true;
        }
    };

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
        devices.findIndex((device) => nextDevice.id === device.id) > -1;

    const scanForPeripherals = () => {
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error(error);
                return;
            }
            if (device /* && device.name?.includes("Pookie") */) {
                setAllDevices((prevState) => {
                    if (!isDuplicateDevice(prevState, device)) {
                        return [...prevState, device];
                    }
                    return prevState;
                });
            }
        });
    };

    const connectToDevice = async (device: Device) => {
        try {
            const deviceConnection = await bleManager.connectToDevice(device.id);
            setConnectedDevice(deviceConnection);
            await deviceConnection.discoverAllServicesAndCharacteristics();
            bleManager.stopDeviceScan();
        } 
        catch (error) {
            console.error("ERROR IN CONNECTION", error);
        }
    }

    return {
        requestPermissions,
        scanForPeripherals,
        allDevices,
        connectToDevice,
        connectedDevice,
    };
};

export default useBLE;