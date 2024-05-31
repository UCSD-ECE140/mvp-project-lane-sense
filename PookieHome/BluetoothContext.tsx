import React, { createContext, useContext, useMemo, useState, useEffect, FC, ReactNode } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleError, BleManager, Characteristic, Device } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';
import base64 from 'react-native-base64';

const SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

interface BluetoothContextProps {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  allDevices: Device[];
  connectToDevice(device: Device): Promise<void>;
  connectedDevice: Device | null;
  data: string;
  disconnectFromDevice(): void;
}

const BluetoothContext = createContext<BluetoothContextProps | undefined>(undefined);

export const BluetoothProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [data, setData] = useState<string>("");

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
    const bluetoothConnectPermissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permissions",
        message: "App needs to connect to Bluetooth devices.",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    const bluetoothFineLocationPermissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Bluetooth Fine Location Permissions",
        message: "App needs to access fine location to connect to Bluetooth devices.",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return (
      bluetoothScanPermissions === PermissionsAndroid.RESULTS.GRANTED &&
      bluetoothConnectPermissions === PermissionsAndroid.RESULTS.GRANTED &&
      bluetoothFineLocationPermissions === PermissionsAndroid.RESULTS.GRANTED
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
      } else {
        return await requestAndroid31Permissions();
      }
    } else {
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
      startStreamingData(deviceConnection);
    } catch (error) {
      console.error("ERROR IN CONNECTION", error);
    }
  };

  const onDataUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.error(error);
      return;
    }
    if (!characteristic?.value) {
      console.log("No data received");
      return;
    }
    const rawData = characteristic.value;
    const decodedData = base64.decode(rawData);
    console.log("Data received:\n", decodedData);
    setData(decodedData);
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        onDataUpdate
      );
    } else {
      console.log("No device connected");
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setData("");
    }
  };

  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  return (
    <BluetoothContext.Provider
      value={{
        requestPermissions,
        scanForPeripherals,
        allDevices,
        connectToDevice,
        connectedDevice,
        data,
        disconnectFromDevice,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
};
